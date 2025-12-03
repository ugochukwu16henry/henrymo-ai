/**
 * Contribution Service
 * Manages street photo contributions
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');
const s3Service = require('./s3Service');
const streetService = require('./streetService');

class ContributionService {
  /**
   * Create a contribution
   */
  async createContribution(data) {
    const {
      userId,
      streetId,
      latitude,
      longitude,
      streetName,
      notes,
      images, // Array of { buffer, originalName, mimeType, size, exifData }
    } = data;

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Create contribution record
      const contributionId = uuidv4();
      const contributionResult = await client.query(
        `INSERT INTO contributions (
          id, user_id, street_id, latitude, longitude, street_name, notes, 
          status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [contributionId, userId, streetId, latitude, longitude, streetName, notes, 'pending']
      );

      const contribution = contributionResult.rows[0];

      // Upload images and create image records
      const imageRecords = [];
      if (images && images.length > 0) {
        for (const image of images) {
          const imageId = uuidv4();
          const s3Key = s3Service.generateKey(userId, image.originalName, 'contributions');

          // Upload original image to S3
          const s3Result = await s3Service.uploadFile(
            image.buffer,
            s3Key,
            image.mimeType,
            {
              userId,
              contributionId,
              imageId,
              originalName: image.originalName,
            }
          );

          // Generate thumbnail (simplified - in production, use sharp or similar)
          let thumbnailKey = null;
          let thumbnailUrl = null;
          // TODO: Implement thumbnail generation with sharp library

          // Create image record
          const imageResult = await client.query(
            `INSERT INTO images (
              id, contribution_id, s3_key, s3_url, thumbnail_s3_key, thumbnail_url,
              file_size, width, height, mime_type, exif_data, metadata, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
            RETURNING *`,
            [
              imageId,
              contributionId,
              s3Key,
              s3Result.url,
              thumbnailKey,
              thumbnailUrl,
              image.size,
              image.width || null,
              image.height || null,
              image.mimeType,
              image.exifData ? JSON.stringify(image.exifData) : null,
              JSON.stringify({}),
            ]
          );

          imageRecords.push(this.formatImage(imageResult.rows[0]));
        }
      }

      // If streetId is provided, increment contribution count
      if (streetId) {
        await streetService.incrementContributionCount(streetId);
      } else {
        // Try to find or create street based on GPS coordinates
        // This is a simplified version - in production, you might want more sophisticated matching
        const nearbyStreets = await streetService.searchStreets({
          latitude,
          longitude,
          radius: 0.1, // 100 meters
          limit: 1,
        });

        if (nearbyStreets.streets.length > 0) {
          const nearbyStreet = nearbyStreets.streets[0];
          await client.query(
            'UPDATE contributions SET street_id = $1 WHERE id = $2',
            [nearbyStreet.id, contributionId]
          );
          await streetService.incrementContributionCount(nearbyStreet.id);
        }
      }

      await client.query('COMMIT');

      const formattedContribution = await this.getContributionById(contributionId);

      logger.info('Contribution created', {
        contributionId,
        userId,
        imageCount: imageRecords.length,
      });

      return {
        ...formattedContribution,
        images: imageRecords,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating contribution', {
        error: error.message,
        userId,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get contribution by ID
   */
  async getContributionById(id) {
    try {
      const result = await db.query(
        `SELECT c.id, c.user_id, c.street_id, c.latitude, c.longitude, c.street_name, 
                c.notes, c.status, c.reward_amount, c.reward_paid, c.verification_score,
                c.metadata, c.created_at, c.updated_at, c.verified_at,
                s.name as street_name_from_street,
                u.name as user_name, u.email as user_email
         FROM contributions c
         LEFT JOIN streets s ON c.street_id = s.id
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const contribution = result.rows[0];

      // Get images for this contribution
      const imagesResult = await pool.query(
        'SELECT * FROM images WHERE contribution_id = $1 ORDER BY created_at ASC',
        [id]
      );

      return {
        id: contribution.id,
        userId: contribution.user_id,
        streetId: contribution.street_id,
        latitude: parseFloat(contribution.latitude),
        longitude: parseFloat(contribution.longitude),
        streetName: contribution.street_name || contribution.street_name_from_street,
        notes: contribution.notes,
        status: contribution.status,
        rewardAmount: parseFloat(contribution.reward_amount || 0),
        rewardPaid: contribution.reward_paid,
        verificationScore: contribution.verification_score
          ? parseFloat(contribution.verification_score)
          : null,
        metadata: contribution.metadata || {},
        createdAt: contribution.created_at,
        updatedAt: contribution.updated_at,
        verifiedAt: contribution.verified_at,
        user: {
          name: contribution.user_name,
          email: contribution.user_email,
        },
        images: imagesResult.rows.map((img) => this.formatImage(img)),
      };
    } catch (error) {
      logger.error('Error fetching contribution', { error: error.message, id });
      throw error;
    }
  }

  /**
   * List contributions
   */
  async listContributions(filters = {}) {
    const {
      userId,
      streetId,
      status,
      limit = 50,
      offset = 0,
    } = filters;

    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;

      if (userId) {
        conditions.push(`c.user_id = $${paramIndex}`);
        values.push(userId);
        paramIndex++;
      }

      if (streetId) {
        conditions.push(`c.street_id = $${paramIndex}`);
        values.push(streetId);
        paramIndex++;
      }

      if (status) {
        conditions.push(`c.status = $${paramIndex}`);
        values.push(status);
        paramIndex++;
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM contributions c ${whereClause}`,
        values
      );
      const total = parseInt(countResult.rows[0].total);

      // Get contributions
      values.push(limit, offset);
      const result = await db.query(
        `SELECT c.id, c.user_id, c.street_id, c.latitude, c.longitude, c.street_name, 
                c.notes, c.status, c.reward_amount, c.reward_paid, c.verification_score,
                c.metadata, c.created_at, c.updated_at, c.verified_at,
                s.name as street_name_from_street
         FROM contributions c
         LEFT JOIN streets s ON c.street_id = s.id
         ${whereClause}
         ORDER BY c.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        values
      );

      const contributions = await Promise.all(
        result.rows.map(async (row) => {
          const imagesResult = await pool.query(
            'SELECT * FROM images WHERE contribution_id = $1 ORDER BY created_at ASC LIMIT 1',
            [row.id]
          );

          return {
            id: row.id,
            userId: row.user_id,
            streetId: row.street_id,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            streetName: row.street_name || row.street_name_from_street,
            notes: row.notes,
            status: row.status,
            rewardAmount: parseFloat(row.reward_amount || 0),
            rewardPaid: row.reward_paid,
            verificationScore: row.verification_score
              ? parseFloat(row.verification_score)
              : null,
            metadata: row.metadata || {},
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            verifiedAt: row.verified_at,
            thumbnailImage: imagesResult.rows.length > 0 ? this.formatImage(imagesResult.rows[0]) : null,
          };
        })
      );

      return {
        contributions,
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error('Error listing contributions', { error: error.message, filters });
      throw error;
    }
  }

  /**
   * Update contribution
   */
  async updateContribution(id, data) {
    const { notes, status, streetId } = data;

    try {
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (notes !== undefined) {
        updates.push(`notes = $${paramIndex}`);
        values.push(notes);
        paramIndex++;
      }

      if (status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        values.push(status);
        paramIndex++;
      }

      if (streetId !== undefined) {
        updates.push(`street_id = $${paramIndex}`);
        values.push(streetId);
        paramIndex++;
      }

      if (updates.length === 0) {
        return await this.getContributionById(id);
      }

      values.push(id);
      const result = await db.query(
        `UPDATE contributions 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramIndex}
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return null;
      }

      return await this.getContributionById(id);
    } catch (error) {
      logger.error('Error updating contribution', { error: error.message, id });
      throw error;
    }
  }

  /**
   * Format image record
   */
  formatImage(row) {
    return {
      id: row.id,
      contributionId: row.contribution_id,
      s3Key: row.s3_key,
      s3Url: row.s3_url,
      thumbnailS3Key: row.thumbnail_s3_key,
      thumbnailUrl: row.thumbnail_url,
      fileSize: row.file_size,
      width: row.width,
      height: row.height,
      mimeType: row.mime_type,
      exifData: row.exif_data || {},
      metadata: row.metadata || {},
      createdAt: row.created_at,
    };
  }
}

module.exports = new ContributionService();

