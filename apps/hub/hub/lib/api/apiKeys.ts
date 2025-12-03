/**
 * API Keys Management API Client
 */

import { apiClient } from '../api-client';

export interface ApiKey {
  id: string;
  key_name: string;
  key_prefix: string;
  api_key?: string; // Only present when first created
  scopes: string[];
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly?: number;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  rate_limit_per_month: number;
  features: string[];
  is_active: boolean;
}

export interface ApiUsageStats {
  total_requests: number;
  days_active: number;
  avg_response_time: number;
  success_count: number;
  error_count: number;
  total_request_size: number;
  total_response_size: number;
}

export interface ApiSubscription {
  id: string;
  plan_id: string;
  plan_name: string;
  status: 'active' | 'cancelled' | 'expired' | 'suspended';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  rate_limit_per_month: number;
}

export const apiKeysApi = {
  /**
   * Create a new API key
   */
  async createApiKey(data: {
    keyName: string;
    scopes?: string[];
    rateLimitPerMinute?: number;
    rateLimitPerDay?: number;
    expiresAt?: string;
  }): Promise<{ success: boolean; data?: ApiKey; error?: string }> {
    return apiClient.post('/api-keys/keys', data);
  },

  /**
   * Get user's API keys
   */
  async getApiKeys(): Promise<{ success: boolean; data?: ApiKey[]; error?: string }> {
    return apiClient.get('/api-keys/keys');
  },

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: string): Promise<{ success: boolean; error?: string }> {
    return apiClient.delete(`/api-keys/keys/${keyId}`);
  },

  /**
   * Get API usage statistics
   */
  async getUsageStats(
    keyId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ success: boolean; data?: ApiUsageStats; error?: string }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiClient.get(`/api-keys/keys/${keyId}/usage?${params.toString()}`);
  },

  /**
   * Get API plans
   */
  async getApiPlans(): Promise<{ success: boolean; data?: ApiPlan[]; error?: string }> {
    return apiClient.get('/api-keys/plans');
  },

  /**
   * Get user's API subscription
   */
  async getApiSubscription(): Promise<{
    success: boolean;
    data?: ApiSubscription;
    error?: string;
  }> {
    return apiClient.get('/api-keys/subscription');
  },
};

