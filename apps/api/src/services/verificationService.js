/**
 * Verification Service
 * Manages contribution verification workflow
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');
const contributionService = require('./contributionService');

class VerificationService {
  /**
   * Calculate reward amount based on verification score and contribution quality
   * @param {number} confidenceScore - Confidence score (0-1)
   * @param {Object} contribution - Contribution data
   * @returns {number} Reward amount
   */
  calculateReward(confidenceScore, contribution) {
    // Base reward
    let baseReward = 1.0; // $1.00 base

    // Bonus for high confidence
    if (confidenceScore >= 0.9) {
      baseReward += 0.5; // $0.50 bonus
    } else if (confidenceScore >= 0.7) {
      baseReward += 0.25; // $0.25 bonus
    }

    // Bonus for multiple images
    const imageCount = contribution.images?.length || 0;
    if (imageCount >= 3) {
      baseReward += 0.5; // $0.50 bonus for 3+ images
    } else if (imageCount >= 2) {
      baseReward += 0.25; // $0.25 bonus for 2 images
    }

    // Bonus for GPS accuracy (if street was matched)
    if (contribution.streetId) {
      baseReward += 0.25; // $0.25 bonus for matched street
    }

    // Round to 2 decimal places
    return Math.round(baseReward * 100) / 100;
  }

  /**
   * Verify a contribution
   * @param {string} contributionId - Contribution ID
   * @param {string} verifierId - Verifier user ID
   * @param {Object} data - Verification data
   * @returns {Promise<Object>} Verification record
   */
  async verifyContribution(contributionId, verifierId, data) {
    const { verdict, comment, confidenceScore, metadata } = data;

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Get contribution
      const contribution = await contributionService.getContributionById(contributionId);
      if (!contribution) {
        throw new Error('Contribution not found');
      }

      // Check if already verified
      if (contribution.status === 'verified' || contribution.status === 'rejected') {
        throw new Error('Contribution has already been verified');
      }

      // Calculate reward if approved
      let rewardAmount = 0;
      let newStatus = 'pending';

      if (verdict === 'approved') {
        newStatus = 'verified';
        rewardAmount = this.calculateReward(confidenceScore || 0.8, contribution);
      } else if (verdict === 'rejected') {
        newStatus = 'rejected';
      } else if (verdict === 'needs_review') {
        newStatus = 'needs_review';
      } else if (verdict === 'flagged') {
        newStatus = 'flagged';
      }

      // Create verification record
      const verificationId = uuidv4();
      const verificationResult = await client.query(
        `INSERT INTO verifications (
          id, contribution_id, verifier_id, verdict, comment, 
          confidence_score, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          verificationId,
          contributionId,
          verifierId,
          verdict,
          comment || null,
          confidenceScore || null,
          JSON.stringify(metadata || {}),
        ]
      );

      // Update contribution status and reward
      await client.query(
        `UPDATE contributions 
         SET status = $1, 
             reward_amount = $2,
             verification_score = $3,
             verified_at = CASE WHEN $1 = 'verified' THEN CURRENT_TIMESTAMP ELSE verified_at END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [newStatus, rewardAmount, confidenceScore || null, contributionId]
      );

      await client.query('COMMIT');

      const verification = this.formatVerification(verificationResult.rows[0]);
      const updatedContribution = await contributionService.getContributionById(contributionId);

      logger.info('Contribution verified', {
        contributionId,
        verifierId,
        verdict,
        rewardAmount,
      });

      return {
        verification,
        contribution: updatedContribution,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error verifying contribution', {
        error: error.message,
        contributionId,
        verifierId,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get verification by ID
   * @param {string} id - Verification ID
   * @returns {Promise<Object>} Verification record
   */
  async getVerificationById(id) {
    try {
      const result = await db.query(
        `SELECT v.id, v.contribution_id, v.verifier_id, v.verdict, v.comment,
                v.confidence_score, v.metadata, v.created_at,
                u.name as verifier_name, u.email as verifier_email,
                c.user_id as contributor_id, c.street_id, c.status as contribution_status
         FROM verifications v
         LEFT JOIN users u ON v.verifier_id = u.id
         LEFT JOIN contributions c ON v.contribution_id = c.id
         WHERE v.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.formatVerificationWithDetails(result.rows[0]);
    } catch (error) {
      logger.error('Error fetching verification', { error: error.message, id });
      throw error;
    }
  }

  /**
   * List verifications
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Verifications list
   */
  async listVerifications(filters = {}) {
    const {
      verifierId,
      contributionId,
      verdict,
      limit = 50,
      offset = 0,
    } = filters;

    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;

      if (verifierId) {
        conditions.push(`v.verifier_id = $${paramIndex}`);
        values.push(verifierId);
        paramIndex++;
      }

      if (contributionId) {
        conditions.push(`v.contribution_id = $${paramIndex}`);
        values.push(contributionId);
        paramIndex++;
      }

      if (verdict) {
        conditions.push(`v.verdict = $${paramIndex}`);
        values.push(verdict);
        paramIndex++;
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM verifications v ${whereClause}`,
        values
      );
      const total = parseInt(countResult.rows[0].total);

      // Get verifications
      values.push(limit, offset);
      const result = await db.query(
        `SELECT v.id, v.contribution_id, v.verifier_id, v.verdict, v.comment,
                v.confidence_score, v.metadata, v.created_at,
                u.name as verifier_name, u.email as verifier_email,
                c.user_id as contributor_id, c.status as contribution_status
         FROM verifications v
         LEFT JOIN users u ON v.verifier_id = u.id
         LEFT JOIN contributions c ON v.contribution_id = c.id
         ${whereClause}
         ORDER BY v.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        values
      );

      const verifications = result.rows.map((row) =>
        this.formatVerificationWithDetails(row)
      );

      return {
        verifications,
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error('Error listing verifications', { error: error.message, filters });
      throw error;
    }
  }

  /**
   * Get verifications for a contribution
   * @param {string} contributionId - Contribution ID
   * @returns {Promise<Array>} Verification records
   */
  async getVerificationsByContribution(contributionId) {
    try {
      const result = await db.query(
        `SELECT v.id, v.contribution_id, v.verifier_id, v.verdict, v.comment,
                v.confidence_score, v.metadata, v.created_at,
                u.name as verifier_name, u.email as verifier_email
         FROM verifications v
         LEFT JOIN users u ON v.verifier_id = u.id
         WHERE v.contribution_id = $1
         ORDER BY v.created_at DESC`,
        [contributionId]
      );

      return result.rows.map((row) => this.formatVerificationWithDetails(row));
    } catch (error) {
      logger.error('Error fetching verifications for contribution', {
        error: error.message,
        contributionId,
      });
      throw error;
    }
  }

  /**
   * Format verification record
   */
  formatVerification(row) {
    return {
      id: row.id,
      contributionId: row.contribution_id,
      verifierId: row.verifier_id,
      verdict: row.verdict,
      comment: row.comment,
      confidenceScore: row.confidence_score
        ? parseFloat(row.confidence_score)
        : null,
      metadata: row.metadata || {},
      createdAt: row.created_at,
    };
  }

  /**
   * Format verification with details
   */
  formatVerificationWithDetails(row) {
    return {
      id: row.id,
      contributionId: row.contribution_id,
      verifierId: row.verifier_id,
      verdict: row.verdict,
      comment: row.comment,
      confidenceScore: row.confidence_score
        ? parseFloat(row.confidence_score)
        : null,
      metadata: row.metadata || {},
      createdAt: row.created_at,
      verifier: row.verifier_name
        ? {
            id: row.verifier_id,
            name: row.verifier_name,
            email: row.verifier_email,
          }
        : null,
      contribution: {
        id: row.contribution_id,
        contributorId: row.contributor_id,
        streetId: row.street_id,
        status: row.contribution_status,
      },
    };
  }
}

module.exports = new VerificationService();

