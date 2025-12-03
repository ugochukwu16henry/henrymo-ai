/**
 * Admin API functions
 */

import { api } from '../api-client';

export interface PlatformAnalytics {
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  subscriptions: {
    byTier: Record<string, number>;
  };
  activity: {
    recent: number;
  };
  contributions: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
}

export interface AdminInvitation {
  id: string;
  email: string;
  role: string;
  countryCode?: string | null;
  invitedBy: string;
  inviter?: {
    name: string;
    email: string;
  };
  expiresAt: string;
  acceptedAt?: string | null;
  acceptedBy?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  status: 'pending' | 'accepted' | 'expired';
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  details: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export const adminApi = {
  /**
   * Get platform analytics
   */
  getPlatformAnalytics: async () => {
    return api.get<PlatformAnalytics>('/api/admin/analytics', true);
  },

  /**
   * List users
   */
  listUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    subscriptionTier?: string;
    isActive?: boolean;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return api.get(`/api/admin/users${query ? `?${query}` : ''}`, true);
  },

  /**
   * Update user role
   */
  updateUserRole: async (userId: string, role: string) => {
    return api.post(`/api/admin/users/${userId}/role`, { role }, true);
  },

  /**
   * Create admin invitation
   */
  createInvitation: async (data: {
    email: string;
    role: string;
    countryCode?: string;
  }) => {
    return api.post('/api/admin/invitations', data, true);
  },

  /**
   * List invitations
   */
  listInvitations: async (params?: {
    status?: 'pending' | 'accepted' | 'expired';
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return api.get(`/api/admin/invitations${query ? `?${query}` : ''}`, true);
  },

  /**
   * Get audit logs
   */
  getAuditLogs: async (params?: {
    userId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return api.get(`/api/admin/audit-logs${query ? `?${query}` : ''}`, true);
  },
};

