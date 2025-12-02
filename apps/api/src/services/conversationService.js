/**
 * Conversation Service
 * Manages conversations and their lifecycle
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');

class ConversationService {
  /**
   * Create a new conversation
   */
  async createConversation(userId, data = {}) {
    const {
      title = null,
      mode = 'general',
      provider = 'anthropic',
      model = null,
      metadata = {},
    } = data;

    try {
      const conversationId = uuidv4();

      const result = await db.query(
        `INSERT INTO conversations (
          id, user_id, title, mode, provider, model, metadata, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING *`,
        [
          conversationId,
          userId,
          title,
          mode,
          provider,
          model,
          JSON.stringify(metadata),
        ]
      );

      const conversation = this.formatConversation(result.rows[0]);

      logger.info('Conversation created', {
        conversationId,
        userId,
        mode,
        provider,
      });

      return conversation;
    } catch (error) {
      logger.error('Error creating conversation', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(conversationId, userId) {
    try {
      const result = await db.query(
        `SELECT * FROM conversations 
         WHERE id = $1 AND user_id = $2`,
        [conversationId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Conversation not found');
      }

      return this.formatConversation(result.rows[0]);
    } catch (error) {
      logger.error('Error getting conversation', {
        error: error.message,
        conversationId,
        userId,
      });
      throw error;
    }
  }

  /**
   * List user conversations
   */
  async listConversations(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      orderBy = 'last_message_at',
      order = 'DESC',
      mode = null,
    } = options;

    try {
      let query = `
        SELECT * FROM conversations 
        WHERE user_id = $1
      `;
      const params = [userId];
      let paramIndex = 2;

      if (mode) {
        query += ` AND mode = $${paramIndex}`;
        params.push(mode);
        paramIndex++;
      }

      query += ` ORDER BY ${orderBy} ${order} NULLS LAST`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return result.rows.map(row => this.formatConversation(row));
    } catch (error) {
      logger.error('Error listing conversations', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Update conversation
   */
  async updateConversation(conversationId, userId, updates = {}) {
    try {
      // Verify ownership
      await this.getConversationById(conversationId, userId);

      const allowedFields = ['title', 'mode', 'provider', 'model', 'metadata'];
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
        return await this.getConversationById(conversationId, userId);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(conversationId, userId);

      const result = await db.query(
        `UPDATE conversations 
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
         RETURNING *`,
        values
      );

      return this.formatConversation(result.rows[0]);
    } catch (error) {
      logger.error('Error updating conversation', {
        error: error.message,
        conversationId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId, userId) {
    try {
      // Verify ownership
      await this.getConversationById(conversationId, userId);

      await db.query(
        `DELETE FROM conversations 
         WHERE id = $1 AND user_id = $2`,
        [conversationId, userId]
      );

      logger.info('Conversation deleted', {
        conversationId,
        userId,
      });

      return { success: true };
    } catch (error) {
      logger.error('Error deleting conversation', {
        error: error.message,
        conversationId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Update conversation stats (message count, tokens, cost)
   */
  async updateConversationStats(conversationId, stats = {}) {
    const { messageCount, tokens, cost } = stats;

    try {
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (messageCount !== undefined) {
        updates.push(`message_count = message_count + $${paramIndex}`);
        values.push(messageCount);
        paramIndex++;
      }

      if (tokens !== undefined) {
        updates.push(`total_tokens_used = total_tokens_used + $${paramIndex}`);
        values.push(tokens);
        paramIndex++;
      }

      if (cost !== undefined) {
        updates.push(`total_cost = total_cost + $${paramIndex}`);
        values.push(cost);
        paramIndex++;
      }

      if (updates.length === 0) {
        return;
      }

      updates.push(`last_message_at = CURRENT_TIMESTAMP`);
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(conversationId);

      await db.query(
        `UPDATE conversations 
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex}`,
        values
      );
    } catch (error) {
      logger.error('Error updating conversation stats', {
        error: error.message,
        conversationId,
      });
      // Don't throw - this is not critical
    }
  }

  /**
   * Format conversation from database row
   */
  formatConversation(row) {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      mode: row.mode,
      provider: row.provider,
      model: row.model,
      messageCount: row.message_count,
      totalTokensUsed: row.total_tokens_used,
      totalCost: parseFloat(row.total_cost || 0),
      metadata: row.metadata || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastMessageAt: row.last_message_at,
    };
  }
}

module.exports = new ConversationService();

