/**
 * Memory Service
 * Manages AI memory storage and retrieval
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');
const semanticSearchService = require('./semanticSearchService');

class MemoryService {
  /**
   * Create a new memory
   */
  async createMemory(userId, data = {}) {
    const {
      title,
      content,
      contentType = 'note',
      tags = [],
      isPinned = false,
      embeddingVectorId = null,
      metadata = {},
    } = data;

    try {
      const memoryId = uuidv4();

      const result = await db.query(
        `INSERT INTO ai_memory (
          id, user_id, title, content, content_type, tags, is_pinned, 
          embedding_vector_id, metadata, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING *`,
        [
          memoryId,
          userId,
          title,
          content,
          contentType,
          tags,
          isPinned,
          embeddingVectorId,
          JSON.stringify(metadata),
        ]
      );

      const memory = this.formatMemory(result.rows[0]);

      // Index memory for semantic search (async, don't wait)
      semanticSearchService.indexMemory(
        memoryId,
        userId,
        title,
        content,
        contentType
      ).catch(err => {
        logger.warn('Failed to index memory', {
          error: err.message,
          memoryId,
        });
      });

      logger.info('Memory created', {
        memoryId,
        userId,
        contentType,
      });

      return memory;
    } catch (error) {
      logger.error('Error creating memory', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get memory by ID
   */
  async getMemoryById(memoryId, userId) {
    try {
      const result = await db.query(
        `SELECT * FROM ai_memory 
         WHERE id = $1 AND user_id = $2`,
        [memoryId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Memory not found');
      }

      return this.formatMemory(result.rows[0]);
    } catch (error) {
      logger.error('Error getting memory', {
        error: error.message,
        memoryId,
        userId,
      });
      throw error;
    }
  }

  /**
   * List user memories
   */
  async listMemories(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      orderBy = 'created_at',
      order = 'DESC',
      contentType = null,
      tags = null,
      isPinned = null,
      search = null,
    } = options;

    try {
      let query = `
        SELECT * FROM ai_memory 
        WHERE user_id = $1
      `;
      const params = [userId];
      let paramIndex = 2;

      if (contentType) {
        query += ` AND content_type = $${paramIndex}`;
        params.push(contentType);
        paramIndex++;
      }

      if (isPinned !== null) {
        query += ` AND is_pinned = $${paramIndex}`;
        params.push(isPinned);
        paramIndex++;
      }

      if (tags && tags.length > 0) {
        query += ` AND tags && $${paramIndex}`;
        params.push(tags);
        paramIndex++;
      }

      if (search) {
        query += ` AND (
          title ILIKE $${paramIndex} OR 
          content ILIKE $${paramIndex}
        )`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      query += ` ORDER BY is_pinned DESC, ${orderBy} ${order}`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return result.rows.map(row => this.formatMemory(row));
    } catch (error) {
      logger.error('Error listing memories', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Update memory
   */
  async updateMemory(memoryId, userId, updates = {}) {
    try {
      // Verify ownership
      await this.getMemoryById(memoryId, userId);

      const allowedFields = ['title', 'content', 'contentType', 'tags', 'isPinned', 'embeddingVectorId', 'metadata'];
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      Object.keys(updates).forEach((key) => {
        if (allowedFields.includes(key)) {
          const dbKey = key === 'contentType' ? 'content_type' :
                       key === 'isPinned' ? 'is_pinned' :
                       key === 'embeddingVectorId' ? 'embedding_vector_id' :
                       key;
          
          if (key === 'metadata') {
            updateFields.push(`${dbKey} = $${paramIndex}`);
            values.push(JSON.stringify(updates[key]));
          } else {
            updateFields.push(`${dbKey} = $${paramIndex}`);
            values.push(updates[key]);
          }
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        return await this.getMemoryById(memoryId, userId);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(memoryId, userId);

      const result = await db.query(
        `UPDATE ai_memory 
         SET ${updateFields.join(', ')}
         WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
         RETURNING *`,
        values
      );

      const memory = this.formatMemory(result.rows[0]);

      // Update index if title or content changed
      if (updates.title || updates.content) {
        const finalTitle = updates.title || memory.title;
        const finalContent = updates.content || memory.content;
        const finalContentType = updates.contentType || memory.contentType;

        semanticSearchService.updateMemoryIndex(
          memoryId,
          userId,
          finalTitle,
          finalContent,
          finalContentType
        ).catch(err => {
          logger.warn('Failed to update memory index', {
            error: err.message,
            memoryId,
          });
        });
      }

      return memory;
    } catch (error) {
      logger.error('Error updating memory', {
        error: error.message,
        memoryId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete memory
   */
  async deleteMemory(memoryId, userId) {
    try {
      // Verify ownership
      await this.getMemoryById(memoryId, userId);

      await db.query(
        `DELETE FROM ai_memory 
         WHERE id = $1 AND user_id = $2`,
        [memoryId, userId]
      );

      // Delete from Pinecone index
      semanticSearchService.deleteMemoryIndex(memoryId).catch(err => {
        logger.warn('Failed to delete memory index', {
          error: err.message,
          memoryId,
        });
      });

      logger.info('Memory deleted', {
        memoryId,
        userId,
      });

      return { success: true };
    } catch (error) {
      logger.error('Error deleting memory', {
        error: error.message,
        memoryId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Toggle memory pin status
   */
  async togglePin(memoryId, userId) {
    try {
      const memory = await this.getMemoryById(memoryId, userId);
      
      return await this.updateMemory(memoryId, userId, {
        isPinned: !memory.isPinned,
      });
    } catch (error) {
      logger.error('Error toggling pin', {
        error: error.message,
        memoryId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Search memories by text
   */
  async searchMemories(userId, searchQuery, options = {}) {
    const {
      limit = 50,
      offset = 0,
      contentType = null,
      tags = null,
    } = options;

    return await this.listMemories(userId, {
      search: searchQuery,
      limit,
      offset,
      contentType,
      tags,
    });
  }

  /**
   * Get memories by tags
   */
  async getMemoriesByTags(userId, tags, options = {}) {
    return await this.listMemories(userId, {
      ...options,
      tags,
    });
  }

  /**
   * Format memory from database row
   */
  formatMemory(row) {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      contentType: row.content_type,
      tags: row.tags || [],
      isPinned: row.is_pinned || false,
      embeddingVectorId: row.embedding_vector_id,
      metadata: row.metadata || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

module.exports = new MemoryService();

