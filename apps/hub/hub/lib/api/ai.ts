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
    const token = localStorage.getItem('auth_token');
    if (!token) {
      const error = 'Not authenticated';
      if (onError) {
        onError(error);
      } else {
        throw new Error(error);
      }
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 60000); // 1 minute timeout (reduced from 2 minutes)

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let hasCompleted = false;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/ai/chat/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: `Failed to start streaming: ${response.status} ${response.statusText}`,
        }));
        throw new Error(error.error || `Failed to start streaming: ${response.status}`);
      }

      reader = response.body?.getReader() || null;
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let lastChunkTime = Date.now();
      const chunkTimeout = 30000; // 30 seconds without chunks = timeout

      while (true) {
        // Check for chunk timeout
        if (Date.now() - lastChunkTime > chunkTimeout) {
          throw new Error('Stream timeout - no data received for 30 seconds');
        }

        const { done, value } = await reader.read();

        if (done) {
          // If we haven't received a 'done' event, something went wrong
          if (!hasCompleted && buffer.trim()) {
            // Try to parse any remaining data
            const lines = buffer.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'done' && onComplete && data.usage) {
                    hasCompleted = true;
                    onComplete({
                      inputTokens: data.usage.inputTokens || 0,
                      outputTokens: data.usage.outputTokens || 0,
                    });
                    return;
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
          break;
        }

        lastChunkTime = Date.now();
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk') {
                onChunk(data.content || '');
              } else if (data.type === 'done') {
                hasCompleted = true;
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
              // Skip invalid JSON lines but log in development
              if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to parse SSE line:', line, e);
              }
              continue;
            }
          }
        }
      }

      // If we exit the loop without completing, something went wrong
      if (!hasCompleted) {
        throw new Error('Stream ended unexpectedly without completion');
      }
    } catch (error) {
      // Clean up reader if still open
      if (reader) {
        try {
          await reader.cancel();
        } catch (e) {
          // Ignore cancel errors
        }
      }

      clearTimeout(timeoutId);

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = 'Request timeout - the AI is taking too long to respond. Please try again.';
        if (onError) {
          onError(timeoutError);
        } else {
          throw new Error(timeoutError);
        }
      } else if (onError) {
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

