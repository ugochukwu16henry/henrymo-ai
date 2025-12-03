/**
 * Email Scheduler
 * Scheduled email jobs (weekly digest, etc.)
 */

const emailService = require('../services/emailService');
const analyticsService = require('../services/analyticsService');
const db = require('../config/database');
const logger = require('../utils/logger');

// Try to load node-cron, but gracefully degrade if not available
let cron = null;
try {
  cron = require('node-cron');
} catch (error) {
  logger.warn('node-cron not available. Scheduled emails will be disabled.');
}

class EmailScheduler {
  constructor() {
    this.jobs = [];
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    if (!cron) {
      logger.warn('Email scheduler not started - node-cron not available');
      return;
    }

    // Weekly digest - Every Monday at 9 AM
    const weeklyDigestJob = cron.schedule('0 9 * * 1', async () => {
      logger.info('Running weekly digest email job');
      await this.sendWeeklyDigests();
    });

    this.jobs.push(weeklyDigestJob);
    logger.info('Email scheduler started');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    if (!cron) return;
    this.jobs.forEach((job) => job.stop());
    logger.info('Email scheduler stopped');
  }

  /**
   * Send weekly digest emails to all active users
   */
  async sendWeeklyDigests() {
    try {
      // Get all active users
      const users = await db.query(
        `SELECT id, email, name 
         FROM users 
         WHERE is_active = true AND is_email_verified = true`
      );

      logger.info(`Sending weekly digest to ${users.rows.length} users`);

      for (const user of users.rows) {
        try {
          // Get user's weekly stats
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          const endDate = new Date();

          const overview = await analyticsService.getOverview(
            user.id,
            startDate.toISOString(),
            endDate.toISOString()
          );

          const digestData = {
            conversations: overview.conversations.last7Days,
            messages: overview.messages.last7Days,
            tokens: overview.tokens.last7Days,
            memories: overview.memories.last7Days,
          };

          await emailService.sendWeeklyDigest(
            user.email,
            user.name,
            digestData
          );

          logger.info('Weekly digest sent', { userId: user.id, email: user.email });
        } catch (error) {
          logger.error('Error sending weekly digest to user', {
            error: error.message,
            userId: user.id,
            email: user.email,
          });
        }
      }

      logger.info('Weekly digest job completed');
    } catch (error) {
      logger.error('Error in weekly digest job', {
        error: error.message,
      });
    }
  }
}

// Export singleton instance
const scheduler = new EmailScheduler();

// Auto-start if not in test environment
if (process.env.NODE_ENV !== 'test') {
  scheduler.start();
}

module.exports = scheduler;

