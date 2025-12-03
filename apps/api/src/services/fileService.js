/**
 * File Service
 * Manages file metadata and operations
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const s3Service = require('./s3Service');
const logger = require('../utils/logger');

class FileService {
  /**
   * Upload file
   * @param {string} userId - User ID
   * @param {Object} fileData - File data
   * @param {Buffer} fileData.buffer - File buffer
   * @param {string} fileData.originalName - Original filename
   * @param {string} fileData.mimeType - MIME type
   * @param {number} fileData.size - File size
   * @param {string} fileData.folder - Optional folder
   * @param {Object} fileData.metadata - Additional metadata
   * @returns {Promise<Object>} File record
   */
  async uploadFile(userId, fileData) {
    const {
      buffer,
      originalName,
      mimeType,
      size,
      folder = 'uploads',
      metadata = {},
    } = fileData;

    try {
      const fileId = uuidv4();
      const s3Key = s3Service.generateKey(userId, originalName, folder);

      // Upload to S3
      const s3Result = await s3Service.uploadFile(
        buffer,
        s3Key,
        mimeType,
        {
          userId,
          fileId,
          originalName,
          ...metadata,
        }
      );

      // Save metadata to database
      const result = await db.query(
        `INSERT INTO files (
          id, user_id, original_name, s3_key, s3_url, 
          mime_type, file_size, folder, metadata, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP
        ) RETURNING *`,
        [
          fileId,
          userId,
          originalName,
          s3Key,
          s3Result.url,
          mimeType,
          size,
          folder,
          JSON.stringify(metadata),
        ]
      );

      const file = this.formatFile(result.rows[0]);

      logger.info('File uploaded', {
        fileId,
        userId,
        originalName,
        size,
      });

      return file;
    } catch (error) {
      logger.error('Error uploading file', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get file by ID
   * @param {string} fileId - File ID
   * @param {string} userId - User ID (for ownership check)
   * @returns {Promise<Object>} File record
   */
  async getFileById(fileId, userId) {
    try {
      const result = await db.query(
        `SELECT * FROM files 
         WHERE id = $1 AND user_id = $2`,
        [fileId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('File not found');
      }

      return this.formatFile(result.rows[0]);
    } catch (error) {
      logger.error('Error getting file', {
        error: error.message,
        fileId,
        userId,
      });
      throw error;
    }
  }

  /**
   * List user files
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} File records
   */
  async listFiles(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      folder = null,
      mimeType = null,
    } = options;

    try {
      let query = `
        SELECT * FROM files 
        WHERE user_id = $1
      `;
      const params = [userId];
      let paramIndex = 2;

      if (folder) {
        query += ` AND folder = $${paramIndex}`;
        params.push(folder);
        paramIndex++;
      }

      if (mimeType) {
        query += ` AND mime_type LIKE $${paramIndex}`;
        params.push(`%${mimeType}%`);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);

      return result.rows.map(row => this.formatFile(row));
    } catch (error) {
      logger.error('Error listing files', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete file
   * @param {string} fileId - File ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteFile(fileId, userId) {
    try {
      // Get file record
      const file = await this.getFileById(fileId, userId);

      // Delete from S3
      await s3Service.deleteFile(file.s3Key);

      // Delete from database
      await db.query(
        `DELETE FROM files 
         WHERE id = $1 AND user_id = $2`,
        [fileId, userId]
      );

      logger.info('File deleted', {
        fileId,
        userId,
      });
    } catch (error) {
      logger.error('Error deleting file', {
        error: error.message,
        fileId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get signed URL for file
   * @param {string} fileId - File ID
   * @param {string} userId - User ID
   * @param {number} expiresIn - Expiration in seconds
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(fileId, userId, expiresIn = 3600) {
    try {
      const file = await this.getFileById(fileId, userId);
      return await s3Service.getSignedUrl(file.s3Key, expiresIn);
    } catch (error) {
      logger.error('Error getting signed URL', {
        error: error.message,
        fileId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Format file from database row
   */
  formatFile(row) {
    return {
      id: row.id,
      userId: row.user_id,
      originalName: row.original_name,
      s3Key: row.s3_key,
      s3Url: row.s3_url,
      mimeType: row.mime_type,
      fileSize: row.file_size,
      folder: row.folder,
      metadata: row.metadata || {},
      createdAt: row.created_at,
    };
  }
}

module.exports = new FileService();

