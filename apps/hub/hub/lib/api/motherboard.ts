/**
 * Central Motherboard API Client
 */

import { apiClient } from '../api-client';

export interface Module {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'frozen' | 'deprecated' | 'testing';
  dependencies: string[];
  health_status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  performance_metrics: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SystemHealth {
  modules: Module[];
  healthSummary: Record<string, number>;
  totalModules: number;
  recentMetrics: Array<{
    metric_type: string;
    avg_value: string;
    max_value: string;
  }>;
}

export interface ModuleMetrics {
  metric_type: string;
  value: number;
  unit: string;
  timestamp: string;
  tags: Record<string, any>;
}

export interface DependencyStatus {
  name: string;
  exists: boolean;
  health: string;
}

export interface DependencyCheck {
  module: string;
  dependencies: DependencyStatus[];
  allHealthy: boolean;
}

export const motherboardApi = {
  /**
   * Get all modules
   */
  async getAllModules(): Promise<{ success: boolean; data?: Module[]; error?: string }> {
    return apiClient.get('/motherboard/modules');
  },

  /**
   * Get module by name
   */
  async getModule(name: string): Promise<{ success: boolean; data?: Module; error?: string }> {
    return apiClient.get(`/motherboard/modules/${name}`);
  },

  /**
   * Register a module
   */
  async registerModule(data: {
    name: string;
    version: string;
    dependencies?: string[];
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; data?: Module; error?: string }> {
    return apiClient.post('/motherboard/modules', data);
  },

  /**
   * Update module health
   */
  async updateModuleHealth(
    name: string,
    healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
    metrics?: Record<string, any>
  ): Promise<{ success: boolean; data?: Module; error?: string }> {
    return apiClient.put(`/motherboard/modules/${name}/health`, {
      healthStatus,
      metrics,
    });
  },

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<{ success: boolean; data?: SystemHealth; error?: string }> {
    return apiClient.get('/motherboard/health');
  },

  /**
   * Get module metrics
   */
  async getModuleMetrics(
    name: string,
    timeRange: string = '1 hour'
  ): Promise<{ success: boolean; data?: ModuleMetrics[]; error?: string }> {
    return apiClient.get(`/motherboard/modules/${name}/metrics?timeRange=${timeRange}`);
  },

  /**
   * Check module dependencies
   */
  async checkDependencies(
    name: string
  ): Promise<{ success: boolean; data?: DependencyCheck; error?: string }> {
    return apiClient.get(`/motherboard/modules/${name}/dependencies`);
  },
};

