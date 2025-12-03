/**
 * Analysis History Service
 * Manages storage and retrieval of code analysis history
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');

class AnalysisHistoryService {
  /**
   * Save analysis to history
   */
  async saveAnalysis(userId, analysisData) {
    const {
      type,
      language,
      codeLength,
      result,
    } = analysisData;

    try {
      const analysisId = uuidv4();

      await db.query(
        `INSERT INTO code_analyses (
          id, user_id, analysis_type, language, code_length, 
          result, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP
        )`,
        [
          analysisId,
          userId,
          type,
          language,
          codeLength,
          JSON.stringify(result),
        ]
      );

      logger.info('Analysis saved to history', {
        analysisId,
        userId,
        type,
        language,
      });

      return { id: analysisId };
    } catch (error) {
      logger.error('Error saving analysis', {
        error: error.message,
        userId,
      });
      // Don't throw - history saving shouldn't break analysis
      return null;
    }
  }

  /**
   * List analyses for user
   */
  async listAnalyses(userId, options = {}) {
    const {
      limit = 20,
      offset = 0,
      type = null,
      language = null,
    } = options;

    try {
      let query = `
        SELECT id, analysis_type, language, code_length, 
               result, created_at
        FROM code_analyses
        WHERE user_id = $1
      `;
      const params = [userId];
      let paramIndex = 2;

      if (type) {
        query += ` AND analysis_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

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
        type: row.analysis_type,
        language: row.language,
        codeLength: row.code_length,
        result: row.result,
        createdAt: row.created_at,
      }));
    } catch (error) {
      logger.error('Error listing analyses', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get analysis by ID
   */
  async getAnalysisById(analysisId, userId) {
    try {
      const result = await db.query(
        `SELECT * FROM code_analyses 
         WHERE id = $1 AND user_id = $2`,
        [analysisId, userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        type: row.analysis_type,
        language: row.language,
        codeLength: row.code_length,
        result: row.result,
        createdAt: row.created_at,
      };
    } catch (error) {
      logger.error('Error getting analysis', {
        error: error.message,
        analysisId,
        userId,
      });
      throw error;
    }
  }
}

module.exports = new AnalysisHistoryService();

