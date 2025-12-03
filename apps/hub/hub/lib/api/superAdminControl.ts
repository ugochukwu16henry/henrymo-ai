/**
 * Super Admin Control API Client
 */

import { apiClient } from '../api-client';

export interface AuditLog {
  id: string;
  action_type: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;
}

export const superAdminControlApi = {
  /**
   * Approve update proposal
   */
  async approveProposal(
    id: string,
    comments?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post(`/super-admin/proposals/${id}/approve`, { comments });
  },

  /**
   * Reject update proposal
   */
  async rejectProposal(
    id: string,
    reason?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post(`/super-admin/proposals/${id}/reject`, { reason });
  },

  /**
   * Freeze module
   */
  async freezeModule(
    name: string,
    reason?: string,
    expiresAt?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post(`/super-admin/modules/${name}/freeze`, { reason, expiresAt });
  },

  /**
   * Unfreeze module
   */
  async unfreezeModule(
    name: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post(`/super-admin/modules/${name}/unfreeze`);
  },

  /**
   * Get audit logs
   */
  async getAuditLogs(filters?: {
    actionType?: string;
    userId?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data?: AuditLog[]; error?: string }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/super-admin/audit-logs?${params.toString()}`);
  },
};

