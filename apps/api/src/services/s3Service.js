/**
 * AWS S3 Service
 * Handles file upload, retrieval, and management in S3
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('../config');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class S3Service {
  constructor() {
    this.client = null;
    this.bucket = null;
    this.initialize();
  }

  initialize() {
    if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
      logger.warn('AWS credentials not configured. S3 file storage will be disabled.');
      return;
    }

    try {
      this.client = new S3Client({
        region: config.aws.region || 'us-east-1',
        credentials: {
          accessKeyId: config.aws.accessKeyId,
          secretAccessKey: config.aws.secretAccessKey,
        },
      });

      this.bucket = config.aws.s3Bucket;
      logger.info('S3 service initialized', { bucket: this.bucket, region: config.aws.region });
    } catch (error) {
      logger.error('Error initializing S3 service', {
        error: error.message,
      });
    }
  }

  /**
   * Check if S3 is available
   */
  isAvailable() {
    return this.client !== null && this.bucket !== null;
  }

  /**
   * Generate S3 key for file
   * @param {string} userId - User ID
   * @param {string} filename - Original filename
   * @param {string} folder - Optional folder prefix
   * @returns {string} S3 key
   */
  generateKey(userId, filename, folder = 'uploads') {
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);
    const uniqueId = uuidv4();
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    return `${folder}/${userId}/${date}/${uniqueId}-${sanitizedBaseName}${ext}`;
  }

  /**
   * Upload file to S3
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} key - S3 key
   * @param {string} contentType - MIME type
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(fileBuffer, key, contentType, metadata = {}) {
    if (!this.isAvailable()) {
      throw new Error('S3 is not configured');
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        Metadata: metadata,
      });

      await this.client.send(command);

      const url = `https://${this.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;

      logger.info('File uploaded to S3', {
        key,
        bucket: this.bucket,
        size: fileBuffer.length,
      });

      return {
        key,
        url,
        bucket: this.bucket,
        region: config.aws.region,
      };
    } catch (error) {
      logger.error('Error uploading file to S3', {
        error: error.message,
        key,
      });
      throw error;
    }
  }

  /**
   * Get file from S3
   * @param {string} key - S3 key
   * @returns {Promise<Buffer>} File buffer
   */
  async getFile(key) {
    if (!this.isAvailable()) {
      throw new Error('S3 is not configured');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      const chunks = [];
      
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      logger.error('Error getting file from S3', {
        error: error.message,
        key,
      });
      throw error;
    }
  }

  /**
   * Delete file from S3
   * @param {string} key - S3 key
   * @returns {Promise<void>}
   */
  async deleteFile(key) {
    if (!this.isAvailable()) {
      throw new Error('S3 is not configured');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);

      logger.info('File deleted from S3', { key });
    } catch (error) {
      logger.error('Error deleting file from S3', {
        error: error.message,
        key,
      });
      throw error;
    }
  }

  /**
   * Get signed URL for file access
   * @param {string} key - S3 key
   * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(key, expiresIn = 3600) {
    if (!this.isAvailable()) {
      throw new Error('S3 is not configured');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });

      return url;
    } catch (error) {
      logger.error('Error generating signed URL', {
        error: error.message,
        key,
      });
      throw error;
    }
  }

  /**
   * Check if file exists
   * @param {string} key - S3 key
   * @returns {Promise<boolean>} True if file exists
   */
  async fileExists(key) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      logger.error('Error checking file existence', {
        error: error.message,
        key,
      });
      throw error;
    }
  }

  /**
   * Get file metadata
   * @param {string} key - S3 key
   * @returns {Promise<Object>} File metadata
   */
  async getFileMetadata(key) {
    if (!this.isAvailable()) {
      throw new Error('S3 is not configured');
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata || {},
        etag: response.ETag,
      };
    } catch (error) {
      logger.error('Error getting file metadata', {
        error: error.message,
        key,
      });
      throw error;
    }
  }
}

module.exports = new S3Service();

