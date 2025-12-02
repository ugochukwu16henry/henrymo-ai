/**
 * Cost Tracking Service
 * Tracks AI usage costs per user and conversation
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const db = require('../../config/database');
const aiService = require('./ai-service');
const logger = require('../../utils/logger');

class CostTrackingService {
  /**
   * Track AI usage and cost
   * @param {Object} usageData - Usage data
   * @param {string} usageData.userId - User ID
   * @param {string} usageData.conversationId - Conversation ID (optional)
   * @param {string} usageData.provider - AI provider
   * @param {string} usageData.model - Model used
   * @param {number} usageData.inputTokens - Input tokens
   * @param {number} usageData.outputTokens - Output tokens
   * @param {number} usageData.cost - Calculated cost
   */
  async trackUsage(usageData) {
    const {
      userId,
      conversationId = null,
      provider,
      model,
      inputTokens,
      outputTokens,
      cost,
    } = usageData;

    try {
      // Calculate cost if not provided
      const calculatedCost = cost || aiService.calculateCost(
        provider,
        model,
        inputTokens,
        outputTokens
      );

      // Store in database (if ai_usage table exists)
      // For now, we'll log it and can add database tracking later
      logger.info('AI usage tracked', {
        userId,
        conversationId,
        provider,
        model,
        inputTokens,
        outputTokens,
        cost: calculatedCost,
      });

      // Update conversation cost if conversationId provided
      if (conversationId) {
        await this.updateConversationCost(conversationId, calculatedCost, inputTokens, outputTokens);
      }

      return {
        cost: calculatedCost,
        inputTokens,
        outputTokens,
      };
    } catch (error) {
      logger.error('Error tracking AI usage', {
        error: error.message,
        usageData,
      });
      throw error;
    }
  }

  /**
   * Update conversation total cost and tokens
   */
  async updateConversationCost(conversationId, cost, inputTokens, outputTokens) {
    try {
      await db.query(
        `UPDATE conversations 
         SET total_tokens_used = COALESCE(total_tokens_used, 0) + $1,
             total_cost = COALESCE(total_cost, 0) + $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [inputTokens + outputTokens, cost, conversationId]
      );
    } catch (error) {
      logger.error('Error updating conversation cost', {
        error: error.message,
        conversationId,
      });
      // Don't throw - this is not critical
    }
  }

  /**
   * Get user's total usage stats
   */
  async getUserUsageStats(userId, startDate, endDate) {
    try {
      const result = await db.query(
        `SELECT 
          COUNT(*) as conversation_count,
          SUM(total_tokens_used) as total_tokens,
          SUM(total_cost) as total_cost
         FROM conversations
         WHERE user_id = $1
           AND created_at >= COALESCE($2, '1970-01-01')
           AND created_at <= COALESCE($3, CURRENT_TIMESTAMP)`,
        [userId, startDate, endDate]
      );

      return {
        conversationCount: parseInt(result.rows[0]?.conversation_count || 0),
        totalTokens: parseInt(result.rows[0]?.total_tokens || 0),
        totalCost: parseFloat(result.rows[0]?.total_cost || 0),
      };
    } catch (error) {
      logger.error('Error getting user usage stats', {
        error: error.message,
        userId,
      });
      throw error;
    }
  }
}

module.exports = new CostTrackingService();

