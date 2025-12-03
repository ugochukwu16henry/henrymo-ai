/**
 * Debugging History Service
 * Manages storage and retrieval of debugging history
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');

class DebuggingHistoryService {
  /**
   * Save debugging session to history
   */
  async saveDebug(userId, debugData) {
    const {
      errorMessage,
      stackTrace,
      language,
      result,
    } = debugData;

    try {
      const debugId = uuidv4();

      await db.query(
        `INSERT INTO debugging_sessions (
          id, user_id, error_message, stack_trace, language, 
          result, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP
        )`,
        [
          debugId,
          userId,
          errorMessage,
          stackTrace,
          language,
          JSON.stringify(result),
        ]
      );

      logger.info('Debugging session saved to history', {
        debugId,
        userId,
        language,
      });

      return { id: debugId };
    } catch (error) {
      logger.error('Error saving debugging session', {
        error: error.message,
        userId,
      });
      // Don't throw - history saving shouldn't break debugging
      return null;
    }
  }

  /**
   * List debugging sessions for user
   */
  async listDebugs(userId, options = {}) {
    const {
      limit = 20,
      offset = 0,
      language = null,
    } = options;

    try {
      let query = `
        SELECT id, error_message, stack_trace, language, 
               result, created_at
        FROM debugging_sessions
        WHERE user_id = $1
      `;
      const params = [userId];
      let paramIndex = 2;

      if (language) {
        query += ` AND language = $${paramIndex}`;
        params.push(language);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return result.rows.map(row => ({
        id: row.id,
        errorMessage: row.error_message,
        stackTrace: row.stack_trace,
        language: row.language,
        result: row.result,
        createdAt: row.created_at,
      }));
    } catch (error) {
      logger.error('Error listing debugging sessions', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get debugging session by ID
   */
  async getDebugById(debugId, userId) {
    try {
      const result = await db.query(
        `SELECT * FROM debugging_sessions 
         WHERE id = $1 AND user_id = $2`,
        [debugId, userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        errorMessage: row.error_message,
        stackTrace: row.stack_trace,
        language: row.language,
        result: row.result,
        createdAt: row.created_at,
      };
    } catch (error) {
      logger.error('Error getting debugging session', {
        error: error.message,
        debugId,
        userId,
      });
      throw error;
    }
  }
}

module.exports = new DebuggingHistoryService();

