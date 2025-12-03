/**
 * Analytics Service
 * Tracks user activity, token usage, costs, and performance metrics
 */

const db = require('../config/database');
const logger = require('../utils/logger');

class AnalyticsService {
  /**
   * Get overview statistics
   */
  async getOverview(userId, startDate, endDate) {
    try {
      const dateFilter = this.buildDateFilter(startDate, endDate);

      // Get conversation stats
      const conversationDateFilter = this.buildDateFilter(startDate, endDate, 'c');
      const conversationStats = await db.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE c.created_at >= CURRENT_DATE - INTERVAL '7 days') as last7Days,
          COUNT(*) FILTER (WHERE c.created_at >= CURRENT_DATE - INTERVAL '30 days') as last30Days
         FROM conversations c
         WHERE c.user_id = $1 ${conversationDateFilter}`,
        [userId]
      );

      // Get message stats
      const messageStats = await db.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as last7Days,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as last30Days
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE c.user_id = $1 ${dateFilter}`,
        [userId]
      );

      // Get token usage
      const tokenStats = await db.query(
        `SELECT 
          COALESCE(SUM(tokens_used), 0) as total,
          COALESCE(SUM(tokens_used) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as last7Days,
          COALESCE(SUM(tokens_used) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as last30Days
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE c.user_id = $1 ${dateFilter}`,
        [userId]
      );

      // Get cost stats
      const costStats = await db.query(
        `SELECT 
          COALESCE(SUM(cost), 0) as total,
          COALESCE(SUM(cost) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as last7Days,
          COALESCE(SUM(cost) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as last30Days
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE c.user_id = $1 ${dateFilter}`,
        [userId]
      );

      // Get memory stats
      const memoryDateFilter = this.buildDateFilter(startDate, endDate, 'am');
      const memoryStats = await db.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE am.created_at >= CURRENT_DATE - INTERVAL '7 days') as last7Days,
          COUNT(*) FILTER (WHERE am.created_at >= CURRENT_DATE - INTERVAL '30 days') as last30Days
         FROM ai_memory am
         WHERE am.user_id = $1 ${memoryDateFilter}`,
        [userId]
      );

      return {
        conversations: {
          total: parseInt(conversationStats.rows[0].total),
          last7Days: parseInt(conversationStats.rows[0].last7days),
          last30Days: parseInt(conversationStats.rows[0].last30days),
        },
        messages: {
          total: parseInt(messageStats.rows[0].total),
          last7Days: parseInt(messageStats.rows[0].last7days),
          last30Days: parseInt(messageStats.rows[0].last30days),
        },
        tokens: {
          total: parseInt(tokenStats.rows[0].total),
          last7Days: parseInt(tokenStats.rows[0].last7days),
          last30Days: parseInt(tokenStats.rows[0].last30days),
        },
        costs: {
          total: parseFloat(costStats.rows[0].total),
          last7Days: parseFloat(costStats.rows[0].last7days),
          last30Days: parseFloat(costStats.rows[0].last30days),
        },
        memories: {
          total: parseInt(memoryStats.rows[0].total),
          last7Days: parseInt(memoryStats.rows[0].last7days),
          last30Days: parseInt(memoryStats.rows[0].last30days),
        },
      };
    } catch (error) {
      logger.error('Error getting overview analytics', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(userId, startDate, endDate, groupBy = 'day') {
    try {
      const dateFilter = this.buildDateFilter(startDate, endDate);
      let groupByClause = '';

      switch (groupBy) {
        case 'hour':
          groupByClause = "DATE_TRUNC('hour', m.created_at)";
          break;
        case 'day':
          groupByClause = "DATE_TRUNC('day', m.created_at)";
          break;
        case 'week':
          groupByClause = "DATE_TRUNC('week', m.created_at)";
          break;
        case 'month':
          groupByClause = "DATE_TRUNC('month', m.created_at)";
          break;
        default:
          groupByClause = "DATE_TRUNC('day', m.created_at)";
      }

      const result = await db.query(
        `SELECT 
          ${groupByClause} as period,
          COUNT(*) as message_count,
          COALESCE(SUM(m.tokens_used), 0) as tokens_used,
          COALESCE(SUM(m.cost), 0) as cost
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE c.user_id = $1 ${dateFilter}
         GROUP BY ${groupByClause}
         ORDER BY period ASC`,
        [userId]
      );

      return result.rows.map((row) => ({
        period: row.period,
        messageCount: parseInt(row.message_count),
        tokensUsed: parseInt(row.tokens_used),
        cost: parseFloat(row.cost),
      }));
    } catch (error) {
      logger.error('Error getting usage stats', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get cost analysis
   */
  async getCostAnalysis(userId, startDate, endDate) {
    try {
      const dateFilter = this.buildDateFilter(startDate, endDate);

      // Get costs by provider
      const costsByProvider = await db.query(
        `SELECT 
          c.provider,
          COUNT(*) as request_count,
          COALESCE(SUM(m.tokens_used), 0) as total_tokens,
          COALESCE(SUM(m.cost), 0) as total_cost,
          COALESCE(AVG(m.cost), 0) as avg_cost_per_request
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE c.user_id = $1 ${dateFilter}
         GROUP BY c.provider
         ORDER BY total_cost DESC`,
        [userId]
      );

      // Get costs by model
      const costsByModel = await db.query(
        `SELECT 
          c.model,
          c.provider,
          COUNT(*) as request_count,
          COALESCE(SUM(m.tokens_used), 0) as total_tokens,
          COALESCE(SUM(m.cost), 0) as total_cost
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE c.user_id = $1 ${dateFilter}
         GROUP BY c.model, c.provider
         ORDER BY total_cost DESC
         LIMIT 10`,
        [userId]
      );

      // Get daily cost trend
      const dailyCosts = await db.query(
        `SELECT 
          DATE_TRUNC('day', m.created_at) as date,
          COALESCE(SUM(m.cost), 0) as cost
         FROM messages m
         JOIN conversations c ON m.conversation_id = c.id
         WHERE c.user_id = $1 ${dateFilter}
         GROUP BY DATE_TRUNC('day', m.created_at)
         ORDER BY date ASC`,
        [userId]
      );

      return {
        byProvider: costsByProvider.rows.map((row) => ({
          provider: row.provider,
          requestCount: parseInt(row.request_count),
          totalTokens: parseInt(row.total_tokens),
          totalCost: parseFloat(row.total_cost),
          avgCostPerRequest: parseFloat(row.avg_cost_per_request),
        })),
        byModel: costsByModel.rows.map((row) => ({
          model: row.model,
          provider: row.provider,
          requestCount: parseInt(row.request_count),
          totalTokens: parseInt(row.total_tokens),
          totalCost: parseFloat(row.total_cost),
        })),
        dailyTrend: dailyCosts.rows.map((row) => ({
          date: row.date,
          cost: parseFloat(row.cost),
        })),
      };
    } catch (error) {
      logger.error('Error getting cost analysis', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Get provider usage statistics
   */
  async getProviderUsage(userId, startDate, endDate) {
    try {
      const dateFilter = this.buildDateFilter(startDate, endDate);

      const result = await db.query(
        `SELECT 
          c.provider,
          COUNT(DISTINCT c.id) as conversation_count,
          COUNT(m.id) as message_count,
          COALESCE(SUM(m.tokens_used), 0) as total_tokens,
          COALESCE(SUM(m.cost), 0) as total_cost
         FROM conversations c
         LEFT JOIN messages m ON m.conversation_id = c.id
         WHERE c.user_id = $1 ${dateFilter}
         GROUP BY c.provider
         ORDER BY message_count DESC`,
        [userId]
      );

      return result.rows.map((row) => ({
        provider: row.provider,
        conversationCount: parseInt(row.conversation_count),
        messageCount: parseInt(row.message_count),
        totalTokens: parseInt(row.total_tokens),
        totalCost: parseFloat(row.total_cost),
      }));
    } catch (error) {
      logger.error('Error getting provider usage', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Track user activity
   */
  async trackActivity(userId, activityType, metadata = {}) {
    try {
      // This could be stored in a user_activities table if needed
      // For now, we'll log it
      logger.info('User activity tracked', {
        userId,
        activityType,
        metadata,
        timestamp: new Date().toISOString(),
      });

      // Could also store in audit_logs
      const adminService = require('./adminService');
      await adminService.logActivity({
        userId,
        action: activityType,
        resourceType: 'user_activity',
        details: metadata,
      });
    } catch (error) {
      // Don't throw - activity tracking shouldn't break the main flow
      logger.warn('Error tracking activity', {
        error: error.message,
        userId,
        activityType,
      });
    }
  }

  /**
   * Build date filter SQL
   */
  buildDateFilter(startDate, endDate, tableAlias = 'm') {
    let filter = '';
    if (startDate) {
      filter += ` AND ${tableAlias}.created_at >= '${startDate}'`;
    }
    if (endDate) {
      filter += ` AND ${tableAlias}.created_at <= '${endDate}'`;
    }
    return filter;
  }
}

module.exports = new AnalyticsService();

