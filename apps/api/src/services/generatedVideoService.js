/**
 * Generated Video Service
 * Manages AI-generated video metadata and storage
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');

class GeneratedVideoService {
  /**
   * Save generated video metadata
   */
  async saveGeneratedVideo(userId, videoData) {
    const {
      s3Key,
      s3Url,
      format,
      width,
      height,
      fps,
      duration,
      frameCount,
      metadata = {},
    } = videoData;

    try {
      const videoId = uuidv4();

      const result = await db.query(
        `INSERT INTO generated_videos (
          id, user_id, s3_key, s3_url, format, width, height, 
          fps, duration, frame_count, metadata, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP
        ) RETURNING *`,
        [
          videoId,
          userId,
          s3Key,
          s3Url,
          format,
          width,
          height,
          fps,
          duration,
          frameCount,
          JSON.stringify(metadata),
        ]
      );

      const video = this.formatVideo(result.rows[0]);

      logger.info('Generated video saved', {
        videoId,
        userId,
      });

      return video;
    } catch (error) {
      logger.error('Error saving generated video', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get generated video by ID
   */
  async getVideoById(videoId, userId) {
    try {
      const result = await db.query(
        `SELECT * FROM generated_videos 
         WHERE id = $1 AND user_id = $2`,
        [videoId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Video not found');
      }

      return this.formatVideo(result.rows[0]);
    } catch (error) {
      logger.error('Error getting generated video', {
        error: error.message,
        videoId,
        userId,
      });
      throw error;
    }
  }

  /**
   * List user's generated videos
   */
  async listVideos(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
    } = options;

    try {
      const query = `
        SELECT * FROM generated_videos 
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await db.query(query, [userId, limit, offset]);

      return result.rows.map(row => this.formatVideo(row));
    } catch (error) {
      logger.error('Error listing generated videos', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete generated video
   */
  async deleteVideo(videoId, userId) {
    try {
      const video = await this.getVideoById(videoId, userId);

      // Delete from S3
      const s3Service = require('./s3Service');
      await s3Service.deleteFile(video.s3Key).catch(err => {
        logger.warn('Error deleting from S3, continuing', {
          error: err.message,
        });
      });

      // Delete from database
      await db.query(
        `DELETE FROM generated_videos 
         WHERE id = $1 AND user_id = $2`,
        [videoId, userId]
      );

      logger.info('Generated video deleted', {
        videoId,
        userId,
      });
    } catch (error) {
      logger.error('Error deleting generated video', {
        error: error.message,
        videoId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Format video from database row
   */
  formatVideo(row) {
    return {
      id: row.id,
      userId: row.user_id,
      s3Key: row.s3_key,
      s3Url: row.s3_url,
      format: row.format,
      width: row.width,
      height: row.height,
      fps: row.fps,
      duration: parseFloat(row.duration || 0),
      frameCount: row.frame_count,
      metadata: row.metadata || {},
      createdAt: row.created_at,
    };
  }
}

module.exports = new GeneratedVideoService();

