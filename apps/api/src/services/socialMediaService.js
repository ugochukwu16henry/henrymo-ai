/**
 * Social Media Management Service
 * Comprehensive social media management features
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const db = require('../config/database');
const logger = require('../utils/logger');

class SocialMediaService {
  /**
   * Connect a social media account
   */
  async connectAccount(userId, accountData) {
    const {
      platform,
      accountName,
      accountId,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      profileData = {},
    } = accountData;

    try {
      const result = await db.query(
        `INSERT INTO social_accounts 
         (user_id, platform, account_name, account_id, access_token, refresh_token, token_expires_at, profile_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (user_id, platform, account_id) DO UPDATE SET
           access_token = EXCLUDED.access_token,
           refresh_token = EXCLUDED.refresh_token,
           token_expires_at = EXCLUDED.token_expires_at,
           profile_data = EXCLUDED.profile_data,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          userId,
          platform,
          accountName,
          accountId,
          accessToken,
          refreshToken,
          tokenExpiresAt,
          JSON.stringify(profileData),
        ]
      );

      logger.info('Social account connected', { userId, platform, accountId });
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to connect social account', { error: error.message, userId, platform });
      throw error;
    }
  }

  /**
   * Get user's social accounts
   */
  async getUserAccounts(userId) {
    try {
      const result = await db.query(
        `SELECT * FROM social_accounts 
         WHERE user_id = $1 AND is_active = true
         ORDER BY platform, account_name`,
        [userId]
      );

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get user accounts', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Create a social media post
   */
  async createPost(userId, postData) {
    const {
      accountId,
      content,
      mediaUrls = [],
      scheduledAt,
      category,
      tags = [],
      hashtags = [],
      metadata = {},
    } = postData;

    try {
      const status = scheduledAt ? 'scheduled' : 'draft';

      const result = await db.query(
        `INSERT INTO social_posts 
         (user_id, account_id, content, media_urls, scheduled_at, status, category, tags, hashtags, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          userId,
          accountId,
          content,
          JSON.stringify(mediaUrls),
          scheduledAt,
          status,
          category,
          JSON.stringify(tags),
          JSON.stringify(hashtags),
          JSON.stringify(metadata),
        ]
      );

      logger.info('Social post created', { userId, postId: result.rows[0].id });
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to create social post', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Schedule multiple posts (bulk scheduling)
   */
  async bulkSchedule(userId, scheduleData) {
    const {
      name,
      accountIds,
      posts,
      scheduleStrategy = 'spread',
      startDate,
      endDate,
    } = scheduleData;

    try {
      // Create bulk schedule record
      const bulkResult = await db.query(
        `INSERT INTO social_bulk_schedules 
         (user_id, name, account_ids, posts, schedule_strategy, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'processing')
         RETURNING *`,
        [
          userId,
          name,
          JSON.stringify(accountIds),
          JSON.stringify(posts),
          scheduleStrategy,
          startDate,
          endDate,
        ]
      );

      const bulkScheduleId = bulkResult.rows[0].id;

      // Create individual posts
      const createdPosts = [];
      for (const post of posts) {
        for (const accountId of accountIds) {
          const postResult = await this.createPost(userId, {
            accountId,
            content: post.content,
            mediaUrls: post.mediaUrls || [],
            scheduledAt: post.scheduledAt,
            category: post.category,
            tags: post.tags || [],
            hashtags: post.hashtags || [],
          });
          createdPosts.push(postResult.data);
        }
      }

      // Update bulk schedule status
      await db.query(
        `UPDATE social_bulk_schedules SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [bulkScheduleId]
      );

      logger.info('Bulk schedule created', { userId, bulkScheduleId, postsCount: createdPosts.length });
      return { success: true, data: { bulkSchedule: bulkResult.rows[0], posts: createdPosts } };
    } catch (error) {
      logger.error('Failed to create bulk schedule', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get scheduled posts
   */
  async getScheduledPosts(userId, filters = {}) {
    const { accountId, startDate, endDate, status, limit = 50, offset = 0 } = filters;

    try {
      let query = `SELECT sp.*, sa.account_name, sa.platform 
                   FROM social_posts sp
                   JOIN social_accounts sa ON sp.account_id = sa.id
                   WHERE sp.user_id = $1`;
      const params = [userId];
      let paramCount = 1;

      if (accountId) {
        paramCount++;
        query += ` AND sp.account_id = $${paramCount}`;
        params.push(accountId);
      }

      if (startDate) {
        paramCount++;
        query += ` AND sp.scheduled_at >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND sp.scheduled_at <= $${paramCount}`;
        params.push(endDate);
      }

      if (status) {
        paramCount++;
        query += ` AND sp.status = $${paramCount}`;
        params.push(status);
      }

      query += ` ORDER BY sp.scheduled_at ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get scheduled posts', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get social media analytics
   */
  async getAnalytics(userId, filters = {}) {
    const { accountId, startDate, endDate, metricType } = filters;

    try {
      let query = `SELECT sa.*, 
                          COUNT(DISTINCT sp.id) as posts_count,
                          SUM(CASE WHEN sa.metric_type = 'likes' THEN sa.metric_value ELSE 0 END) as total_likes,
                          SUM(CASE WHEN sa.metric_type = 'comments' THEN sa.metric_value ELSE 0 END) as total_comments,
                          SUM(CASE WHEN sa.metric_type = 'shares' THEN sa.metric_value ELSE 0 END) as total_shares,
                          SUM(CASE WHEN sa.metric_type = 'clicks' THEN sa.metric_value ELSE 0 END) as total_clicks
                   FROM social_analytics sa
                   JOIN social_accounts sac ON sa.account_id = sac.id
                   LEFT JOIN social_posts sp ON sa.post_id = sp.id
                   WHERE sac.user_id = $1`;
      const params = [userId];
      let paramCount = 1;

      if (accountId) {
        paramCount++;
        query += ` AND sa.account_id = $${paramCount}`;
        params.push(accountId);
      }

      if (startDate) {
        paramCount++;
        query += ` AND sa.date >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        query += ` AND sa.date <= $${paramCount}`;
        params.push(endDate);
      }

      if (metricType) {
        paramCount++;
        query += ` AND sa.metric_type = $${paramCount}`;
        params.push(metricType);
      }

      query += ` GROUP BY sa.id, sa.account_id, sa.platform, sa.date`;

      const result = await db.query(query, params);
      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get analytics', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get Smart Inbox (mentions, comments, messages)
   */
  async getSmartInbox(userId, filters = {}) {
    const { platform, mentionType, isRead, limit = 50, offset = 0 } = filters;

    try {
      let query = `SELECT * FROM social_mentions 
                   WHERE user_id = $1`;
      const params = [userId];
      let paramCount = 1;

      if (platform) {
        paramCount++;
        query += ` AND platform = $${paramCount}`;
        params.push(platform);
      }

      if (mentionType) {
        paramCount++;
        query += ` AND mention_type = $${paramCount}`;
        params.push(mentionType);
      }

      if (isRead !== undefined) {
        paramCount++;
        query += ` AND is_read = $${paramCount}`;
        params.push(isRead);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get smart inbox', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Track hashtag
   */
  async trackHashtag(userId, hashtagData) {
    const { hashtag, platform } = hashtagData;

    try {
      const result = await db.query(
        `INSERT INTO social_hashtag_tracking (user_id, hashtag, platform)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, hashtag, platform) DO UPDATE SET
           last_updated = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, hashtag, platform]
      );

      logger.info('Hashtag tracking started', { userId, hashtag, platform });
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to track hashtag', { error: error.message, userId, hashtag });
      throw error;
    }
  }

  /**
   * Add competitor for analysis
   */
  async addCompetitor(userId, competitorData) {
    const {
      competitorName,
      platform,
      accountUrl,
      followersCount,
      postsCount,
      engagementRate,
      analysisData = {},
    } = competitorData;

    try {
      const result = await db.query(
        `INSERT INTO social_competitor_analysis 
         (user_id, competitor_name, platform, account_url, followers_count, posts_count, engagement_rate, analysis_data, last_analyzed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [
          userId,
          competitorName,
          platform,
          accountUrl,
          followersCount,
          postsCount,
          engagementRate,
          JSON.stringify(analysisData),
        ]
      );

      logger.info('Competitor added', { userId, competitorName, platform });
      return { success: true, data: result.rows[0] || { message: 'Competitor already exists' } };
    } catch (error) {
      logger.error('Failed to add competitor', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Create content category
   */
  async createCategory(userId, categoryData) {
    const { name, color, isEvergreen = false } = categoryData;

    try {
      const result = await db.query(
        `INSERT INTO social_content_categories (user_id, name, color, is_evergreen)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, name) DO UPDATE SET
           color = EXCLUDED.color,
           is_evergreen = EXCLUDED.is_evergreen,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, name, color, isEvergreen]
      );

      logger.info('Content category created', { userId, categoryName: name });
      return { success: true, data: result.rows[0] };
    } catch (error) {
      logger.error('Failed to create category', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get content calendar
   */
  async getContentCalendar(userId, startDate, endDate) {
    try {
      const result = await db.query(
        `SELECT sp.*, sa.account_name, sa.platform, scc.name as category_name, scc.color as category_color
         FROM social_posts sp
         JOIN social_accounts sa ON sp.account_id = sa.id
         LEFT JOIN social_content_categories scc ON sp.category = scc.name
         WHERE sp.user_id = $1 
           AND sp.scheduled_at >= $2 
           AND sp.scheduled_at <= $3
         ORDER BY sp.scheduled_at ASC`,
        [userId, startDate, endDate]
      );

      return { success: true, data: result.rows };
    } catch (error) {
      logger.error('Failed to get content calendar', { error: error.message, userId });
      throw error;
    }
  }
}

module.exports = new SocialMediaService();

