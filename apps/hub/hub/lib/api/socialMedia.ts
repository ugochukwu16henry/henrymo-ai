/**
 * Social Media Management API Client
 */

import { apiClient } from '../api-client';

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'pinterest' | 'tiktok' | 'youtube';
  account_name: string;
  account_id: string;
  is_active: boolean;
  profile_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  user_id: string;
  account_id: string;
  content: string;
  media_urls: string[];
  scheduled_at?: string;
  published_at?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled';
  platform_post_id?: string;
  category?: string;
  tags: string[];
  hashtags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SocialMention {
  id: string;
  user_id: string;
  account_id?: string;
  platform: string;
  mention_type: 'mention' | 'comment' | 'reply' | 'message';
  content: string;
  author_name?: string;
  author_username?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  is_read: boolean;
  created_at: string;
}

export interface SocialAnalytics {
  account_id: string;
  platform: string;
  posts_count: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_clicks: number;
}

export const socialMediaApi = {
  /**
   * Connect social media account
   */
  async connectAccount(data: {
    platform: string;
    accountName: string;
    accountId: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt?: string;
    profileData?: Record<string, any>;
  }): Promise<{ success: boolean; data?: SocialAccount; error?: string }> {
    return apiClient.post('/social-media/accounts/connect', data);
  },

  /**
   * Get user's social accounts
   */
  async getAccounts(): Promise<{ success: boolean; data?: SocialAccount[]; error?: string }> {
    return apiClient.get('/social-media/accounts');
  },

  /**
   * Create social media post
   */
  async createPost(data: {
    accountId: string;
    content: string;
    mediaUrls?: string[];
    scheduledAt?: string;
    category?: string;
    tags?: string[];
    hashtags?: string[];
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; data?: SocialPost; error?: string }> {
    return apiClient.post('/social-media/posts', data);
  },

  /**
   * Bulk schedule posts
   */
  async bulkSchedule(data: {
    name: string;
    accountIds: string[];
    posts: Array<{
      content: string;
      mediaUrls?: string[];
      scheduledAt?: string;
      category?: string;
      tags?: string[];
      hashtags?: string[];
    }>;
    scheduleStrategy?: 'spread' | 'batch' | 'custom';
    startDate: string;
    endDate?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post('/social-media/posts/bulk-schedule', data);
  },

  /**
   * Get scheduled posts
   */
  async getScheduledPosts(filters?: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data?: SocialPost[]; error?: string }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/social-media/posts/scheduled?${params.toString()}`);
  },

  /**
   * Get analytics
   */
  async getAnalytics(filters?: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
    metricType?: string;
  }): Promise<{ success: boolean; data?: SocialAnalytics[]; error?: string }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/social-media/analytics?${params.toString()}`);
  },

  /**
   * Get Smart Inbox
   */
  async getSmartInbox(filters?: {
    platform?: string;
    mentionType?: string;
    isRead?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data?: SocialMention[]; error?: string }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/social-media/inbox?${params.toString()}`);
  },

  /**
   * Track hashtag
   */
  async trackHashtag(data: {
    hashtag: string;
    platform?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post('/social-media/hashtags/track', data);
  },

  /**
   * Add competitor
   */
  async addCompetitor(data: {
    competitorName: string;
    platform: string;
    accountUrl?: string;
    followersCount?: number;
    postsCount?: number;
    engagementRate?: number;
    analysisData?: Record<string, any>;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post('/social-media/competitors', data);
  },

  /**
   * Create content category
   */
  async createCategory(data: {
    name: string;
    color?: string;
    isEvergreen?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post('/social-media/categories', data);
  },

  /**
   * Get content calendar
   */
  async getContentCalendar(startDate?: string, endDate?: string): Promise<{
    success: boolean;
    data?: SocialPost[];
    error?: string;
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiClient.get(`/social-media/calendar?${params.toString()}`);
  },
};

