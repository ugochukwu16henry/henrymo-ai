/**
 * Subscription Service
 * Manages user subscriptions, tiers, billing cycles, and limits
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');

class SubscriptionService {
  /**
   * Subscription tier definitions
   */
  static TIERS = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      limits: {
        conversations: 10,
        messagesPerConversation: 50,
        aiMemoryEntries: 10,
        fileUploads: 5,
        imageGenerations: 5,
        videoGenerations: 0,
        codeAnalyses: 5,
        debuggingSessions: 5,
      },
    },
    starter: {
      name: 'Starter',
      price: { monthly: 9.99, yearly: 99.99 },
      limits: {
        conversations: 100,
        messagesPerConversation: 200,
        aiMemoryEntries: 100,
        fileUploads: 50,
        imageGenerations: 50,
        videoGenerations: 10,
        codeAnalyses: 50,
        debuggingSessions: 50,
      },
    },
    pro: {
      name: 'Pro',
      price: { monthly: 29.99, yearly: 299.99 },
      limits: {
        conversations: -1, // Unlimited
        messagesPerConversation: -1,
        aiMemoryEntries: 1000,
        fileUploads: 500,
        imageGenerations: 200,
        videoGenerations: 50,
        codeAnalyses: 200,
        debuggingSessions: 200,
      },
    },
    enterprise: {
      name: 'Enterprise',
      price: { monthly: 99.99, yearly: 999.99 },
      limits: {
        conversations: -1,
        messagesPerConversation: -1,
        aiMemoryEntries: -1,
        fileUploads: -1,
        imageGenerations: -1,
        videoGenerations: -1,
        codeAnalyses: -1,
        debuggingSessions: -1,
      },
    },
  };

  /**
   * Get subscription tier configuration
   */
  static getTierConfig(tier) {
    return this.TIERS[tier] || this.TIERS.free;
  }

  /**
   * Get price for tier and billing period
   */
  static getPrice(tier, billingPeriod = 'monthly') {
    const config = this.getTierConfig(tier);
    return config.price[billingPeriod] || 0;
  }

  /**
   * Get limits for tier
   */
  static getLimits(tier) {
    const config = this.getTierConfig(tier);
    return config.limits;
  }

  /**
   * Check if user has reached limit
   */
  static checkLimit(tier, limitType, currentUsage) {
    const limits = this.getLimits(tier);
    const limit = limits[limitType];
    
    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, remaining: -1 };
    }
    
    const remaining = Math.max(0, limit - currentUsage);
    return {
      allowed: remaining > 0,
      remaining,
      limit,
    };
  }

  /**
   * Get or create subscription for user
   */
  async getOrCreateSubscription(userId) {
    try {
      // Check if user has active subscription
      const result = await db.query(
        `SELECT * FROM subscriptions 
         WHERE user_id = $1 AND status = 'active'
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length > 0) {
        return this.formatSubscription(result.rows[0]);
      }

      // Create free subscription
      return await this.createSubscription(userId, {
        tier: 'free',
        billingPeriod: 'monthly',
        status: 'active',
      });
    } catch (error) {
      logger.error('Error getting or creating subscription', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(userId, data) {
    const {
      tier,
      billingPeriod = 'monthly',
      status = 'active',
      stripeSubscriptionId = null,
      stripeCustomerId = null,
      currentPeriodStart = null,
      currentPeriodEnd = null,
      metadata = {},
    } = data;

    try {
      // Cancel existing active subscriptions
      await db.query(
        `UPDATE subscriptions 
         SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND status = 'active'`,
        [userId]
      );

      // Create new subscription
      const subscriptionId = uuidv4();
      const periodStart = currentPeriodStart || new Date();
      const periodEnd = currentPeriodEnd || this.calculatePeriodEnd(periodStart, billingPeriod);

      const result = await db.query(
        `INSERT INTO subscriptions (
          id, user_id, tier, billing_period, status, stripe_subscription_id,
          stripe_customer_id, current_period_start, current_period_end, metadata,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          subscriptionId,
          userId,
          tier,
          billingPeriod,
          status,
          stripeSubscriptionId,
          stripeCustomerId,
          periodStart,
          periodEnd,
          JSON.stringify(metadata),
        ]
      );

      // Update user subscription tier
      await db.query(
        `UPDATE users 
         SET subscription_tier = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [tier, userId]
      );

      logger.info('Subscription created', {
        subscriptionId,
        userId,
        tier,
        billingPeriod,
      });

      return this.formatSubscription(result.rows[0]);
    } catch (error) {
      logger.error('Error creating subscription', {
        error: error.message,
        userId,
        data,
      });
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, updates) {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (updates.tier !== undefined) {
        updateFields.push(`tier = $${paramIndex++}`);
        values.push(updates.tier);
      }

      if (updates.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        values.push(updates.status);
      }

      if (updates.billingPeriod !== undefined) {
        updateFields.push(`billing_period = $${paramIndex++}`);
        values.push(updates.billingPeriod);
      }

      if (updates.stripeSubscriptionId !== undefined) {
        updateFields.push(`stripe_subscription_id = $${paramIndex++}`);
        values.push(updates.stripeSubscriptionId);
      }

      if (updates.stripeCustomerId !== undefined) {
        updateFields.push(`stripe_customer_id = $${paramIndex++}`);
        values.push(updates.stripeCustomerId);
      }

      if (updates.currentPeriodStart !== undefined) {
        updateFields.push(`current_period_start = $${paramIndex++}`);
        values.push(updates.currentPeriodStart);
      }

      if (updates.currentPeriodEnd !== undefined) {
        updateFields.push(`current_period_end = $${paramIndex++}`);
        values.push(updates.currentPeriodEnd);
      }

      if (updates.cancelAtPeriodEnd !== undefined) {
        updateFields.push(`cancel_at_period_end = $${paramIndex++}`);
        values.push(updates.cancelAtPeriodEnd);
      }

      if (updates.metadata !== undefined) {
        updateFields.push(`metadata = $${paramIndex++}`);
        values.push(JSON.stringify(updates.metadata));
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(subscriptionId);
      const result = await db.query(
        `UPDATE subscriptions 
         SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramIndex}
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new Error('Subscription not found');
      }

      // Update user subscription tier if tier changed
      if (updates.tier !== undefined) {
        await db.query(
          `UPDATE users 
           SET subscription_tier = $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [updates.tier, result.rows[0].user_id]
        );
      }

      return this.formatSubscription(result.rows[0]);
    } catch (error) {
      logger.error('Error updating subscription', {
        error: error.message,
        subscriptionId,
        updates,
      });
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = false) {
    try {
      const updates = cancelAtPeriodEnd
        ? { cancelAtPeriodEnd: true }
        : { status: 'cancelled' };

      return await this.updateSubscription(subscriptionId, updates);
    } catch (error) {
      logger.error('Error cancelling subscription', {
        error: error.message,
        subscriptionId,
      });
      throw error;
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(subscriptionId) {
    try {
      const result = await db.query(
        'SELECT * FROM subscriptions WHERE id = $1',
        [subscriptionId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.formatSubscription(result.rows[0]);
    } catch (error) {
      logger.error('Error getting subscription', {
        error: error.message,
        subscriptionId,
      });
      throw error;
    }
  }

  /**
   * Get subscription by user ID
   */
  async getSubscriptionByUserId(userId) {
    try {
      const result = await db.query(
        `SELECT * FROM subscriptions 
         WHERE user_id = $1 
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.formatSubscription(result.rows[0]);
    } catch (error) {
      logger.error('Error getting subscription by user ID', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Calculate period end date
   */
  calculatePeriodEnd(startDate, billingPeriod) {
    const end = new Date(startDate);
    if (billingPeriod === 'yearly') {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }
    return end;
  }

  /**
   * Format subscription for response
   */
  formatSubscription(row) {
    return {
      id: row.id,
      userId: row.user_id,
      tier: row.tier,
      billingPeriod: row.billing_period,
      status: row.status,
      stripeSubscriptionId: row.stripe_subscription_id,
      stripeCustomerId: row.stripe_customer_id,
      currentPeriodStart: row.current_period_start,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      metadata: row.metadata || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      price: SubscriptionService.getPrice(row.tier, row.billing_period),
      limits: SubscriptionService.getLimits(row.tier),
    };
  }
}

module.exports = new SubscriptionService();

