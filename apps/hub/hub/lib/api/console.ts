/**
 * Developer Console API Client
 */

import { apiClient } from '../api-client';

export interface ConsoleCommand {
  id: string;
  user_id: string;
  user_name?: string;
  command: string;
  command_type: 'terminal' | 'database' | 'system' | 'module';
  output?: string;
  exit_code?: number;
  execution_time_ms?: number;
  executed_at: string;
}

export interface SystemResources {
  cpu: {
    usage: any;
    cores: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    process: any;
  };
  uptime: {
    system: number;
    process: number;
  };
  platform: {
    type: string;
    platform: string;
    arch: string;
    hostname: string;
  };
}

export const consoleApi = {
  /**
   * Execute command
   */
  async executeCommand(data: {
    command: string;
    commandType: 'terminal' | 'database' | 'system' | 'module';
  }): Promise<{
    success: boolean;
    data?: {
      command: string;
      commandType: string;
      output: string;
      exitCode: number;
      executionTime: number;
      error?: string;
    };
    error?: string;
  }> {
    return apiClient.post('/console/execute', data);
  },

  /**
   * Get command history
   */
  async getCommandHistory(filters?: {
    userId?: string;
    commandType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data?: ConsoleCommand[]; error?: string }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/console/history?${params.toString()}`);
  },

  /**
   * Get system logs
   */
  async getLogs(filters?: {
    level?: string;
    module?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    return apiClient.get(`/console/logs?${params.toString()}`);
  },

  /**
   * Get system resources
   */
  async getSystemResources(): Promise<{
    success: boolean;
    data?: SystemResources;
    error?: string;
  }> {
    return apiClient.get('/console/resources');
  },

  /**
   * Read file
   */
  async readFile(
    filePath: string
  ): Promise<{ success: boolean; data?: { path: string; content: string }; error?: string }> {
    return apiClient.post('/console/file/read', { filePath });
  },

  /**
   * Write file
   */
  async writeFile(
    filePath: string,
    content: string
  ): Promise<{ success: boolean; data?: { path: string }; error?: string }> {
    return apiClient.post('/console/file/write', { filePath, content });
  },
};

