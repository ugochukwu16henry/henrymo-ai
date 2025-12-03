/**
 * Training Mode API Client
 */

import { apiClient } from '../api-client';

export interface TrainingSession {
  id: string;
  name: string;
  objective: string;
  dataset_id?: string;
  dataset_path?: string;
  status: 'pending' | 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  performance_metrics: Record<string, any>;
  training_config: Record<string, any>;
  model_version?: string;
  created_by: string;
  creator_name?: string;
  creator_email?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const trainingApi = {
  /**
   * Create training session
   */
  async createSession(data: {
    name: string;
    objective: string;
    datasetPath?: string;
    trainingConfig?: Record<string, any>;
  }): Promise<{ success: boolean; data?: TrainingSession; error?: string }> {
    return apiClient.post('/training/sessions', data);
  },

  /**
   * List training sessions
   */
  async listSessions(filters?: {
    status?: string;
    createdBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data?: TrainingSession[]; error?: string }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/training/sessions?${params.toString()}`);
  },

  /**
   * Get training session
   */
  async getSession(
    id: string
  ): Promise<{ success: boolean; data?: TrainingSession; error?: string }> {
    return apiClient.get(`/training/sessions/${id}`);
  },

  /**
   * Start training
   */
  async startTraining(
    id: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post(`/training/sessions/${id}/start`);
  },

  /**
   * Pause training
   */
  async pauseTraining(
    id: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post(`/training/sessions/${id}/pause`);
  },

  /**
   * Export model
   */
  async exportModel(
    id: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    return apiClient.post(`/training/sessions/${id}/export`);
  },
};

