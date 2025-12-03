/**
 * Generated Image Service
 * Manages AI-generated image metadata and storage
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');

class GeneratedImageService {
  /**
   * Save generated image metadata
   */
  async saveGeneratedImage(userId, imageData) {
    const {
      s3Key,
      s3Url,
      originalUrl,
      prompt,
      revisedPrompt,
      size,
      style,
      metadata = {},
    } = imageData;

    try {
      const imageId = uuidv4();

      const result = await db.query(
        `INSERT INTO generated_images (
          id, user_id, prompt, revised_prompt, s3_key, s3_url, 
          original_url, size, style, metadata, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP
        ) RETURNING *`,
        [
          imageId,
          userId,
          prompt,
          revisedPrompt || prompt,
          s3Key,
          s3Url,
          originalUrl,
          size,
          style,
          JSON.stringify(metadata),
        ]
      );

      const image = this.formatImage(result.rows[0]);

      logger.info('Generated image saved', {
        imageId,
        userId,
      });

      return image;
    } catch (error) {
      logger.error('Error saving generated image', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get generated image by ID
   */
  async getImageById(imageId, userId) {
    try {
      const result = await db.query(
        `SELECT * FROM generated_images 
         WHERE id = $1 AND user_id = $2`,
        [imageId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Image not found');
      }

      return this.formatImage(result.rows[0]);
    } catch (error) {
      logger.error('Error getting generated image', {
        error: error.message,
        imageId,
        userId,
      });
      throw error;
    }
  }

  /**
   * List user's generated images
   */
  async listImages(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      style = null,
    } = options;

    try {
      let query = `
        SELECT * FROM generated_images 
        WHERE user_id = $1
      `;
      const params = [userId];
      let paramIndex = 2;

      if (style) {
        query += ` AND style = $${paramIndex}`;
        params.push(style);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return result.rows.map(row => this.formatImage(row));
    } catch (error) {
      logger.error('Error listing generated images', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete generated image
   */
  async deleteImage(imageId, userId) {
    try {
      const image = await this.getImageById(imageId, userId);

      // Delete from S3 (via file service)
      const s3Service = require('./s3Service');
      await s3Service.deleteFile(image.s3Key).catch(err => {
        logger.warn('Error deleting from S3, continuing', {
          error: err.message,
        });
      });

      // Delete from database
      await db.query(
        `DELETE FROM generated_images 
         WHERE id = $1 AND user_id = $2`,
        [imageId, userId]
      );

      logger.info('Generated image deleted', {
        imageId,
        userId,
      });
    } catch (error) {
      logger.error('Error deleting generated image', {
        error: error.message,
        imageId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Format image from database row
   */
  formatImage(row) {
    return {
      id: row.id,
      userId: row.user_id,
      prompt: row.prompt,
      revisedPrompt: row.revised_prompt,
      s3Key: row.s3_key,
      s3Url: row.s3_url,
      originalUrl: row.original_url,
      size: row.size,
      style: row.style,
      metadata: row.metadata || {},
      createdAt: row.created_at,
    };
  }
}

module.exports = new GeneratedImageService();

