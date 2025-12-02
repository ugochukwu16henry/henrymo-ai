/**
 * Conversation API functions
 */

import { api } from '../api-client';

export interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  mode: 'general' | 'developer' | 'learning' | 'business';
  provider: string;
  model: string | null;
  messageCount: number;
  totalTokensUsed: number;
  totalCost: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed: number | null;
  cost: number;
  provider: string | null;
  model: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CreateConversationData {
  title?: string | null;
  mode?: 'general' | 'developer' | 'learning' | 'business';
  provider?: string;
  model?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UpdateConversationData {
  title?: string | null;
  mode?: 'general' | 'developer' | 'learning' | 'business';
  provider?: string;
  model?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CreateMessageData {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed?: number | null;
  cost?: number | null;
  provider?: string | null;
  model?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ListConversationsParams {
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at' | 'last_message_at';
  order?: 'ASC' | 'DESC';
  mode?: 'general' | 'developer' | 'learning' | 'business';
}

export interface GetMessagesParams {
  limit?: number;
  offset?: number;
  orderBy?: 'created_at';
  order?: 'ASC' | 'DESC';
}

export const conversationsApi = {
  /**
   * Create a new conversation
   */
  createConversation: async (data: CreateConversationData) => {
    return api.post<Conversation>('/api/conversations', data, true);
  },

  /**
   * List user conversations
   */
  listConversations: async (params?: ListConversationsParams) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return api.get<Conversation[]>(
      `/api/conversations${query ? `?${query}` : ''}`,
      true
    );
  },

  /**
   * Get conversation by ID
   */
  getConversation: async (id: string) => {
    return api.get<Conversation>(`/api/conversations/${id}`, true);
  },

  /**
   * Update conversation
   */
  updateConversation: async (id: string, data: UpdateConversationData) => {
    return api.put<Conversation>(`/api/conversations/${id}`, data, true);
  },

  /**
   * Delete conversation
   */
  deleteConversation: async (id: string) => {
    return api.delete<{ message: string }>(`/api/conversations/${id}`, true);
  },

  /**
   * Get messages for a conversation
   */
  getMessages: async (conversationId: string, params?: GetMessagesParams) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return api.get<Message[]>(
      `/api/conversations/${conversationId}/messages${query ? `?${query}` : ''}`,
      true
    );
  },

  /**
   * Create a message
   */
  createMessage: async (conversationId: string, data: CreateMessageData) => {
    return api.post<Message>(
      `/api/conversations/${conversationId}/messages`,
      data,
      true
    );
  },

  /**
   * Update a message
   */
  updateMessage: async (
    conversationId: string,
    messageId: string,
    data: { content?: string; metadata?: Record<string, unknown> }
  ) => {
    return api.put<Message>(
      `/api/conversations/${conversationId}/messages/${messageId}`,
      data,
      true
    );
  },

  /**
   * Delete a message
   */
  deleteMessage: async (conversationId: string, messageId: string) => {
    return api.delete<{ message: string }>(
      `/api/conversations/${conversationId}/messages/${messageId}`,
      true
    );
  },
};

