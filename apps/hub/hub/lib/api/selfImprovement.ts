/**
 * Self-Improvement API Client
 */

import { apiClient } from '../api-client';

export interface UpdateProposal {
  id: string;
  module_name: string;
  proposal_type: 'improvement' | 'bug_fix' | 'feature' | 'optimization' | 'security';
  description: string;
  proposed_changes: Record<string, any>;
  impact_analysis: Record<string, any>;
  safety_score: number;
  status: 'pending' | 'approved' | 'rejected' | 'testing' | 'deployed' | 'rolled_back';
  proposed_by: string;
  reviewed_by?: string;
  reviewed_at?: string;
  sandbox_test_results?: Record<string, any>;
  deployment_log?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ModuleAnalysis {
  module: string;
  analysis: {
    inefficiencies: any[];
    outdatedPatterns: any[];
    missingFeatures: any[];
    securityIssues: any[];
    performanceIssues: any[];
  };
  timestamp: string;
}

export interface MissionAlignment {
  proposalId: string;
  checks: Array<{
    checkType: string;
    passed: boolean;
    details: string;
    score: number;
  }>;
  overallScore: number;
  aligned: boolean;
}

export const selfImprovementApi = {
  /**
   * Analyze a module
   */
  async analyzeModule(
    moduleName: string
  ): Promise<{ success: boolean; data?: ModuleAnalysis; error?: string }> {
    return apiClient.post(`/self-improvement/analyze/${moduleName}`);
  },

  /**
   * Create update proposal
   */
  async createProposal(data: {
    moduleName: string;
    proposalType: 'improvement' | 'bug_fix' | 'feature' | 'optimization' | 'security';
    description: string;
    proposedChanges: Record<string, any>;
    impactAnalysis?: Record<string, any>;
  }): Promise<{ success: boolean; data?: UpdateProposal; error?: string }> {
    return apiClient.post('/self-improvement/proposals', data);
  },

  /**
   * Get pending proposals
   */
  async getPendingProposals(): Promise<{
    success: boolean;
    data?: UpdateProposal[];
    error?: string;
  }> {
    return apiClient.get('/self-improvement/proposals/pending');
  },

  /**
   * Get proposal by ID
   */
  async getProposal(
    id: string
  ): Promise<{ success: boolean; data?: UpdateProposal; error?: string }> {
    return apiClient.get(`/self-improvement/proposals/${id}`);
  },

  /**
   * Check mission alignment
   */
  async checkMissionAlignment(
    id: string
  ): Promise<{ success: boolean; data?: MissionAlignment; error?: string }> {
    return apiClient.post(`/self-improvement/proposals/${id}/check-alignment`);
  },
};

