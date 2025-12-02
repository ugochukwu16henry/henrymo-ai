/**
 * Message Service
 * Manages messages within conversations
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');
const conversationService = require('./conversationService');

class MessageService {
  /**
   * Create a new message
   */
  async createMessage(conversationId, userId, data = {}) {
    const {
      role,
      content,
      tokensUsed = null,
      cost = null,
      provider = null,
      model = null,
      metadata = {},
    } = data;

    try {
      // Verify conversation ownership
      await conversationService.getConversationById(conversationId, userId);

      const messageId = uuidv4();

      const result = await db.query(
        `INSERT INTO messages (
          id, conversation_id, role, content, tokens_used, cost, 
          provider, model, metadata, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP
        ) RETURNING *`,
        [
          messageId,
          conversationId,
          role,
          content,
          tokensUsed,
          cost,
          provider,
          model,
          JSON.stringify(metadata),
        ]
      );

      // Update conversation stats
      await conversationService.updateConversationStats(conversationId, {
        messageCount: 1,
        tokens: tokensUsed || 0,
        cost: cost || 0,
      });

      const message = this.formatMessage(result.rows[0]);

      logger.info('Message created', {
        messageId,
        conversationId,
        role,
      });

      return message;
    } catch (error) {
      logger.error('Error creating message', {
        error: error.message,
        conversationId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get message by ID
   */
  async getMessageById(messageId, userId) {
    try {
      const result = await db.query(
        `SELECT m.* FROM messages m
         INNER JOIN conversations c ON m.conversation_id = c.id
         WHERE m.id = $1 AND c.user_id = $2`,
        [messageId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Message not found');
      }

      return this.formatMessage(result.rows[0]);
    } catch (error) {
      logger.error('Error getting message', {
        error: error.message,
        messageId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(conversationId, userId, options = {}) {
    const {
      limit = 100,
      offset = 0,
      orderBy = 'created_at',
      order = 'ASC',
    } = options;

    try {
      // Verify conversation ownership
      await conversationService.getConversationById(conversationId, userId);

      const result = await db.query(
        `SELECT * FROM messages 
         WHERE conversation_id = $1
         ORDER BY ${orderBy} ${order}
         LIMIT $2 OFFSET $3`,
        [conversationId, limit, offset]
      );

      return result.rows.map(row => this.formatMessage(row));
    } catch (error) {
      logger.error('Error getting conversation messages', {
        error: error.message,
        conversationId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Update message
   */
  async updateMessage(messageId, userId, updates = {}) {
    try {
      // Verify ownership
      await this.getMessageById(messageId, userId);

      const allowedFields = ['content', 'metadata'];
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      Object.keys(updates).forEach((key) => {
        if (allowedFields.includes(key)) {
          if (key === 'metadata') {
            updateFields.push(`${key} = $${paramIndex}`);
            values.push(JSON.stringify(updates[key]));
          } else {
            updateFields.push(`${key} = $${paramIndex}`);
            values.push(updates[key]);
          }
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        return await this.getMessageById(messageId, userId);
      }

      values.push(messageId, userId);

      const result = await db.query(
        `UPDATE messages m
         SET ${updateFields.join(', ')}
         FROM conversations c
         WHERE m.id = $${paramIndex} 
           AND m.conversation_id = c.id 
           AND c.user_id = $${paramIndex + 1}
         RETURNING m.*`,
        values
      );

      return this.formatMessage(result.rows[0]);
    } catch (error) {
      logger.error('Error updating message', {
        error: error.message,
        messageId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId, userId) {
    try {
      // Get message to find conversation
      const message = await this.getMessageById(messageId, userId);

      await db.query(
        `DELETE FROM messages 
         WHERE id = $1`,
        [messageId]
      );

      // Update conversation stats
      await conversationService.updateConversationStats(message.conversationId, {
        messageCount: -1,
        tokens: -(message.tokensUsed || 0),
        cost: -(message.cost || 0),
      });

      logger.info('Message deleted', {
        messageId,
        conversationId: message.conversationId,
        userId,
      });

      return { success: true };
    } catch (error) {
      logger.error('Error deleting message', {
        error: error.message,
        messageId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Create multiple messages (batch)
   */
  async createMessages(conversationId, userId, messages = []) {
    try {
      // Verify conversation ownership
      await conversationService.getConversationById(conversationId, userId);

      const createdMessages = [];

      for (const msg of messages) {
        const message = await this.createMessage(conversationId, userId, msg);
        createdMessages.push(message);
      }

      return createdMessages;
    } catch (error) {
      logger.error('Error creating messages', {
        error: error.message,
        conversationId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Format message from database row
   */
  formatMessage(row) {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      role: row.role,
      content: row.content,
      tokensUsed: row.tokens_used,
      cost: parseFloat(row.cost || 0),
      provider: row.provider,
      model: row.model,
      metadata: row.metadata || {},
      createdAt: row.created_at,
    };
  }
}

module.exports = new MessageService();

