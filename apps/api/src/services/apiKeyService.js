/**
 * API Key Management Service
 * Handles API key generation, validation, and usage tracking
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const crypto = require('crypto');
const db = require('../config/database');
const logger = require('../utils/logger');

class ApiKeyService {
  /**
   * Generate a new API key
   */
  generateApiKey(prefix = 'henmo') {
    const randomBytes = crypto.randomBytes(32);
    const key = `${prefix}_${randomBytes.toString('base64url')}`;
    return key;
  }

  /**
   * Hash API key for storage
   */
  hashApiKey(apiKey) {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Create a new API key for user
   */
  async createApiKey(userId, keyData) {
    const {
      keyName,
      scopes = [],
      rateLimitPerMinute = 60,
      rateLimitPerDay = 10000,
      expiresAt,
    } = keyData;

    try {
      const apiKey = this.generateApiKey();
      const hashedKey = this.hashApiKey(apiKey);
      const keyPrefix = apiKey.substring(0, 10);

      const result = await db.query(
        `INSERT INTO api_keys 
         (user_id, key_name, api_key, key_prefix, hashed_key, scopes, rate_limit_per_minute, rate_limit_per_day, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, key_name, key_prefix, scopes, rate_limit_per_minute, rate_limit_per_day, is_active, created_at, expires_at`,
        [
          userId,
          keyName,
          apiKey, // Store plain key temporarily (will be shown once)
          keyPrefix,
          hashedKey,
          JSON.stringify(scopes),
          rateLimitPerMinute,
          rateLimitPerDay,
          expiresAt,
        ]
      );

      const keyRecord = result.rows[0];
      keyRecord.api_key = apiKey; // Include plain key in response (only shown once)

      logger.info('API key created', { userId, keyId: keyRecord.id, keyPrefix });
      return { success: true, data: keyRecord };
    } catch (error) {
      logger.error('Failed to create API key', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get user's API keys
   */
  async getUserApiKeys(userId) {
    try {
      const result = await db.query(
        `SELECT id, key_name, key_prefix, scopes, rate_limit_per_minute, rate_limit_per_day, 
                is_active, last_used_at, expires_at, created_at, updated_at
         FROM api_keys 
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get user API keys', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Validate API key
   */
  async validateApiKey(apiKey) {
    try {
      const hashedKey = this.hashApiKey(apiKey);
      const result = await db.query(
        `SELECT ak.*, u.id as user_id, u.email, u.name, u.role, u.subscription_tier
         FROM api_keys ak
         JOIN users u ON ak.user_id = u.id
         WHERE ak.hashed_key = $1 AND ak.is_active = true AND u.is_active = true
           AND (ak.expires_at IS NULL OR ak.expires_at > CURRENT_TIMESTAMP)`,
        [hashedKey]
      );

      if (result.rows.length === 0) {
        return { valid: false };
      }

      const keyRecord = result.rows[0];

      // Update last used timestamp
      await db.query(
        `UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [keyRecord.id]
      );

      return {
        valid: true,
        keyId: keyRecord.id,
        userId: keyRecord.user_id,
        scopes: keyRecord.scopes || [],
        rateLimitPerMinute: keyRecord.rate_limit_per_minute,
        rateLimitPerDay: keyRecord.rate_limit_per_day,
        user: {
          id: keyRecord.user_id,
          email: keyRecord.email,
          name: keyRecord.name,
          role: keyRecord.role,
          subscriptionTier: keyRecord.subscription_tier,
        },
      };
    } catch (error) {
      logger.error('Failed to validate API key', { error: error.message });
      return { valid: false };
    }
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(userId, keyId) {
    try {
      const result = await db.query(
        `UPDATE api_keys 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [keyId, userId]
      );

      if (result.rows.length === 0) {
        return { success: false, error: 'API key not found' };
      }

      logger.info('API key revoked', { userId, keyId });
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to revoke API key', { error: error.message, userId, keyId });
      throw error;
    }
  }

  /**
   * Get API usage statistics
   */
  async getUsageStats(userId, keyId = null, startDate = null, endDate = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_requests,
          COUNT(DISTINCT DATE(created_at)) as days_active,
          AVG(response_time_ms) as avg_response_time,
          SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as success_count,
          SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count,
          SUM(request_size_bytes) as total_request_size,
          SUM(response_size_bytes) as total_response_size
        FROM api_usage_logs
        WHERE user_id = $1
      `;
      const params = [userId];
      let paramCount = 1;

      if (keyId) {
        paramCount++;
        query += ` AND api_key_id = $${paramCount}`;
        params.push(keyId);
      }

      if (startDate) {
        paramCount++;
        query += ` AND created_at >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND created_at <= $${paramCount}`;
        params.push(endDate);
      }

      const result = await db.query(query, params);
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to get usage stats', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Log API usage
   */
  async logUsage(usageData) {
    const {
      apiKeyId,
      userId,
      endpoint,
      method,
      statusCode,
      responseTimeMs,
      requestSizeBytes,
      responseSizeBytes,
      ipAddress,
      userAgent,
    } = usageData;

    try {
      await db.query(
        `INSERT INTO api_usage_logs 
         (api_key_id, user_id, endpoint, method, status_code, response_time_ms, 
          request_size_bytes, response_size_bytes, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          apiKeyId,
          userId,
          endpoint,
          method,
          statusCode,
          responseTimeMs,
          requestSizeBytes,
          responseSizeBytes,
          ipAddress,
          userAgent,
        ]
      );
    } catch (error) {
      logger.error('Failed to log API usage', { error: error.message });
      // Don't throw - logging failures shouldn't break the API
    }
  }

  /**
   * Get API plans
   */
  async getApiPlans() {
    try {
      const result = await db.query(
        `SELECT * FROM api_plans WHERE is_active = true ORDER BY price_monthly ASC`
      );

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get API plans', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user's API subscription
   */
  async getUserApiSubscription(userId) {
    try {
      const result = await db.query(
        `SELECT s.*, p.name as plan_name, p.description, p.price_monthly, p.price_yearly,
                p.rate_limit_per_minute, p.rate_limit_per_day, p.rate_limit_per_month, p.features
         FROM api_subscriptions s
         JOIN api_plans p ON s.plan_id = p.id
         WHERE s.user_id = $1 AND s.status = 'active'
         ORDER BY s.created_at DESC
         LIMIT 1`,
        [userId]
      );

      return { success: true, data: result.rows[0] || null };
    } catch (error) {
      logger.error('Failed to get user API subscription', { error: error.message, userId });
      throw error;
    }
  }
}

module.exports = new ApiKeyService();

