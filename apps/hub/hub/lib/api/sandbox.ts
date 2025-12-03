/**
 * Sandbox Testing API Client
 */

import { apiClient } from '../api-client';

export interface TestResult {
  id: string;
  update_proposal_id: string;
  test_type: 'unit' | 'integration' | 'performance' | 'security' | 'regression';
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  results: Record<string, any>;
  execution_time_ms: number;
  error_message?: string;
  created_at: string;
}

export const sandboxApi = {
  /**
   * Test proposal in sandbox
   */
  async testProposal(
    id: string
  ): Promise<{
    success: boolean;
    data?: {
      proposalId: string;
      testResults: any[];
      allPassed: boolean;
      status: string;
    };
    error?: string;
  }> {
    return apiClient.post(`/sandbox/proposals/${id}/test`);
  },

  /**
   * Get test results
   */
  async getTestResults(
    id: string
  ): Promise<{ success: boolean; data?: TestResult[]; error?: string }> {
    return apiClient.get(`/sandbox/proposals/${id}/test-results`);
  },

  /**
   * Deploy approved update
   */
  async deployUpdate(
    id: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post(`/sandbox/proposals/${id}/deploy`);
  },

  /**
   * Rollback deployed update
   */
  async rollbackUpdate(
    id: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post(`/sandbox/proposals/${id}/rollback`);
  },
};

