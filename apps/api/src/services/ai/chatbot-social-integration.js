/**
 * ChatBoss Social Media Integration
 * Allows ChatBoss to interact with social media management features
 * 
 * @author Henry Maobughichi Ugochukwu
 */

const socialMediaService = require('../../services/socialMediaService');
const logger = require('../../utils/logger');

class ChatbotSocialIntegration {
  /**
   * Handle social media commands from ChatBoss
   */
  async handleSocialCommand(userId, command, params = {}) {
    try {
      const commandType = this.parseCommand(command);

      switch (commandType.action) {
        case 'schedule':
          return await this.handleSchedule(userId, params);
        case 'analytics':
          return await this.handleAnalytics(userId, params);
        case 'inbox':
          return await this.handleInbox(userId, params);
        case 'calendar':
          return await this.handleCalendar(userId, params);
        case 'hashtag':
          return await this.handleHashtag(userId, params);
        case 'competitor':
          return await this.handleCompetitor(userId, params);
        default:
          return {
            success: false,
            error: 'Unknown social media command. Available: schedule, analytics, inbox, calendar, hashtag, competitor',
          };
      }
    } catch (error) {
      logger.error('Failed to handle social command', { error: error.message, userId, command });
      throw error;
    }
  }

  /**
   * Parse command to determine action
   */
  parseCommand(command) {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('schedule') || lowerCommand.includes('post')) {
      return { action: 'schedule' };
    }
    if (lowerCommand.includes('analytics') || lowerCommand.includes('performance') || lowerCommand.includes('stats')) {
      return { action: 'analytics' };
    }
    if (lowerCommand.includes('inbox') || lowerCommand.includes('mention') || lowerCommand.includes('comment')) {
      return { action: 'inbox' };
    }
    if (lowerCommand.includes('calendar') || lowerCommand.includes('schedule')) {
      return { action: 'calendar' };
    }
    if (lowerCommand.includes('hashtag') || lowerCommand.includes('#')) {
      return { action: 'hashtag' };
    }
    if (lowerCommand.includes('competitor') || lowerCommand.includes('competition')) {
      return { action: 'competitor' };
    }

    return { action: 'unknown' };
  }

  /**
   * Handle schedule command
   */
  async handleSchedule(userId, params) {
    const { accountId, content, scheduledAt, platforms } = params;

    if (!accountId && !platforms) {
      return {
        success: false,
        error: 'Please specify accountId or platforms',
        suggestion: 'Example: "Schedule a post to Facebook and Instagram for tomorrow at 2 PM"',
      };
    }

    if (!content) {
      return {
        success: false,
        error: 'Please provide post content',
        suggestion: 'Example: "Schedule a post saying [your content] to [platform]"',
      };
    }

    // Get user accounts if platforms specified
    let targetAccountIds = [accountId];
    if (platforms && !accountId) {
      const accountsResult = await socialMediaService.getUserAccounts(userId);
      const platformAccounts = accountsResult.data.filter((acc) =>
        platforms.some((p) => acc.platform === p.toLowerCase())
      );
      targetAccountIds = platformAccounts.map((acc) => acc.id);
    }

    const posts = [];
    for (const accId of targetAccountIds) {
      const postResult = await socialMediaService.createPost(userId, {
        accountId: accId,
        content,
        scheduledAt,
        hashtags: params.hashtags || [],
      });
      posts.push(postResult.data);
    }

    return {
      success: true,
      message: `Successfully scheduled ${posts.length} post(s)`,
      data: posts,
    };
  }

  /**
   * Handle analytics command
   */
  async handleAnalytics(userId, params) {
    const { accountId, startDate, endDate } = params;

    const analyticsResult = await socialMediaService.getAnalytics(userId, {
      accountId,
      startDate,
      endDate,
    });

    return {
      success: true,
      message: 'Here are your social media analytics',
      data: analyticsResult.data,
    };
  }

  /**
   * Handle inbox command
   */
  async handleInbox(userId, params) {
    const { platform, isRead } = params;

    const inboxResult = await socialMediaService.getSmartInbox(userId, {
      platform,
      isRead: isRead === 'unread' ? false : undefined,
      limit: 20,
    });

    const unreadCount = inboxResult.data.filter((m) => !m.is_read).length;

    return {
      success: true,
      message: `You have ${unreadCount} unread mentions`,
      data: inboxResult.data,
    };
  }

  /**
   * Handle calendar command
   */
  async handleCalendar(userId, params) {
    const { startDate, endDate } = params;

    const calendarResult = await socialMediaService.getContentCalendar(
      userId,
      startDate || new Date().toISOString().split('T')[0],
      endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );

    return {
      success: true,
      message: `Here's your content calendar`,
      data: calendarResult.data,
    };
  }

  /**
   * Handle hashtag command
   */
  async handleHashtag(userId, params) {
    const { hashtag, platform } = params;

    if (!hashtag) {
      return {
        success: false,
        error: 'Please specify a hashtag to track',
        suggestion: 'Example: "Track hashtag #AI on Twitter"',
      };
    }

    const trackResult = await socialMediaService.trackHashtag(userId, {
      hashtag: hashtag.replace('#', ''),
      platform,
    });

    return {
      success: true,
      message: `Now tracking hashtag #${hashtag.replace('#', '')}`,
      data: trackResult.data,
    };
  }

  /**
   * Handle competitor command
   */
  async handleCompetitor(userId, params) {
    const { competitorName, platform, accountUrl } = params;

    if (!competitorName || !platform) {
      return {
        success: false,
        error: 'Please specify competitor name and platform',
        suggestion: 'Example: "Add competitor [name] on [platform]"',
      };
    }

    const competitorResult = await socialMediaService.addCompetitor(userId, {
      competitorName,
      platform,
      accountUrl,
    });

    return {
      success: true,
      message: `Added ${competitorName} for analysis`,
      data: competitorResult.data,
    };
  }

  /**
   * Generate natural language response for ChatBoss
   */
  generateResponse(commandType, result) {
    if (!result.success) {
      return result.error || 'Sorry, I couldn\'t process that social media request.';
    }

    switch (commandType.action) {
      case 'schedule':
        return `✅ I've scheduled your post! It will be published at the specified time.`;
      case 'analytics':
        return `📊 Here are your social media analytics. You can see performance metrics for your accounts.`;
      case 'inbox':
        return `📬 You have ${result.data?.filter((m) => !m.is_read).length || 0} unread mentions. Check your inbox for details.`;
      case 'calendar':
        return `📅 Here's your content calendar. You have ${result.data?.length || 0} posts scheduled.`;
      case 'hashtag':
        return `🏷️ I'm now tracking that hashtag for you. You'll receive updates on its performance.`;
      case 'competitor':
        return `🔍 I've added that competitor for analysis. I'll track their performance and provide insights.`;
      default:
        return 'Social media command processed successfully.';
    }
  }
}

module.exports = new ChatbotSocialIntegration();

