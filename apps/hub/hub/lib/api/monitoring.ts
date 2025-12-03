/**
 * Auto-Monitoring API Client
 */

import { apiClient } from '../api-client';

export interface SystemDiagnostic {
  id: string;
  diagnostic_type: 'health_check' | 'performance' | 'security' | 'error_analysis';
  module_name?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  issue_description: string;
  root_cause_analysis?: string;
  recommended_fix?: string;
  fix_applied: boolean;
  fixed_by?: string;
  fixed_at?: string;
  created_at: string;
  resolved_at?: string;
}

export interface OptimizationSuggestion {
  type: string;
  module: string;
  suggestion: string;
  priority: 'low' | 'medium' | 'high';
}

export const monitoringApi = {
  /**
   * Perform health check
   */
  async performHealthCheck(): Promise<{
    success: boolean;
    data?: {
      timestamp: string;
      system: any;
      modules: any[];
      issues: any[];
      database: any;
    };
    error?: string;
  }> {
    return apiClient.get('/monitoring/health-check');
  },

  /**
   * Diagnose issue
   */
  async diagnoseIssue(data: {
    moduleName: string;
    issueType: 'health_check' | 'performance' | 'security' | 'error_analysis';
    description: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post('/monitoring/diagnose', data);
  },

  /**
   * Get recent diagnostics
   */
  async getRecentDiagnostics(
    limit: number = 20
  ): Promise<{ success: boolean; data?: SystemDiagnostic[]; error?: string }> {
    return apiClient.get(`/monitoring/diagnostics?limit=${limit}`);
  },

  /**
   * Mark diagnostic as fixed
   */
  async markFixed(
    id: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post(`/monitoring/diagnostics/${id}/fix`);
  },

  /**
   * Get optimization suggestions
   */
  async getOptimizationSuggestions(): Promise<{
    success: boolean;
    data?: OptimizationSuggestion[];
    error?: string;
  }> {
    return apiClient.get('/monitoring/optimization-suggestions');
  },
};

