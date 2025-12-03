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
        let errorMessage = `Failed to start streaming: ${response.status} ${response.statusText}`;
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          // If JSON parsing fails, try to get text
          try {
            const text = await response.text();
            if (text) errorMessage = text;
          } catch (e2) {
            // Ignore
          }
        }
        
        // Provide more helpful error messages
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Please check your API keys.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. The AI service may be experiencing issues.';
        }
        
        throw new Error(errorMessage);
      }

      reader = response.body?.getReader() || null;
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let lastChunkTime = Date.now();
      const chunkTimeout = 30000; // 30 seconds without chunks = timeout
      let receivedAnyContent = false;

      while (true) {
        // Check for chunk timeout
        if (Date.now() - lastChunkTime > chunkTimeout) {
          throw new Error('Stream timeout - no data received for 30 seconds');
        }

        const { done, value } = await reader.read();

        if (done) {
          // If we haven't received a 'done' event, try to parse any remaining data
          if (!hasCompleted && buffer.trim()) {
            const lines = buffer.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'done' && onComplete) {
                    hasCompleted = true;
                    onComplete({
                      inputTokens: data.usage?.inputTokens || 0,
                      outputTokens: data.usage?.outputTokens || 0,
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
                const chunkContent = data.content || '';
                if (chunkContent) {
                  receivedAnyContent = true;
                  onChunk(chunkContent);
                }
              } else if (data.type === 'done') {
                hasCompleted = true;
                // If done event has an error, call onError instead
                if (data.error) {
                  if (onError) {
                    onError(data.error);
                  } else {
                    throw new Error(data.error);
                  }
                } else if (onComplete) {
                  onComplete({
                    inputTokens: data.usage?.inputTokens || 0,
                    outputTokens: data.usage?.outputTokens || 0,
                  });
                }
                return;
              } else if (data.type === 'error') {
                // Store error but continue to wait for done event
                const errorMsg = data.error || 'Stream error';
                // If we haven't received any content, this is a fatal error
                if (!receivedAnyContent) {
                  throw new Error(errorMsg);
                }
                // Otherwise, log the error but continue
                if (process.env.NODE_ENV === 'development') {
                  console.warn('Stream error received:', errorMsg);
                }
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

      // If we exit the loop without completing, check if we received any content
      if (!hasCompleted) {
        // If we received content chunks, treat it as complete (some streams may not send done event)
        if (receivedAnyContent) {
          if (onComplete) {
            // Estimate usage if not provided
            onComplete({
              inputTokens: 0,
              outputTokens: 0,
            });
          }
          return;
        }
        
        // Check if there's any remaining buffer data
        if (buffer.trim()) {
          const lines = buffer.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'done' && onComplete) {
                  onComplete({
                    inputTokens: data.usage?.inputTokens || 0,
                    outputTokens: data.usage?.outputTokens || 0,
                  });
                  return;
                } else if (data.type === 'chunk' && data.content) {
                  receivedAnyContent = true;
                  onChunk(data.content);
                  if (onComplete) {
                    onComplete({
                      inputTokens: 0,
                      outputTokens: 0,
                    });
                  }
                  return;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
        
        // If no content was received, it's an error
        const errorMsg = 'Stream ended unexpectedly without completion. The AI service may be experiencing issues.';
        if (onError) {
          onError(errorMsg);
        } else {
          throw new Error(errorMsg);
        }
        return;
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

