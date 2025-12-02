/**
 * AI API functions
 */

import { api } from '../api-client';

export interface AIProvider {
  id: string;
  name: string;
  models: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
  system?: string;
}

export interface ChatRequest {
  provider?: string;
  model?: string;
  messages: ChatMessage[];
  options?: ChatOptions;
  conversationId?: string;
  useFallback?: boolean;
}

export interface ChatResponse {
  content: string;
  provider: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  finishReason: string;
}

export interface UsageStats {
  conversationCount: number;
  totalTokens: number;
  totalCost: number;
}

export const aiApi = {
  /**
   * Get available AI providers
   */
  getProviders: async () => {
    return api.get<AIProvider[]>('/api/ai/providers', true);
  },

  /**
   * Generate chat completion
   */
  chat: async (request: ChatRequest) => {
    return api.post<ChatResponse>('/api/ai/chat', request, true);
  },

  /**
   * Stream chat completion using Server-Sent Events
   */
  streamChat: async (
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete?: (usage: ChatResponse['usage']) => void,
    onError?: (error: string) => void
  ) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/ai/chat/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: 'Failed to start streaming',
        }));
        throw new Error(error.error || 'Failed to start streaming');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk') {
                onChunk(data.content);
              } else if (data.type === 'done') {
                if (onComplete && data.usage) {
                  onComplete({
                    inputTokens: data.usage.inputTokens || 0,
                    outputTokens: data.usage.outputTokens || 0,
                  });
                }
                return;
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Stream error');
              }
            } catch (e) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      if (onError) {
        onError(errorMessage);
      } else {
        throw error;
      }
    }
  },

  /**
   * Get user's AI usage statistics
   */
  getUsage: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return api.get<UsageStats>(
      `/api/ai/usage${query ? `?${query}` : ''}`,
      true
    );
  },
};

