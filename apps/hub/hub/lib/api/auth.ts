/**
 * Authentication API functions
 */

import { api } from '../api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  subscriptionTier: string;
  isEmailVerified: boolean;
  isActive: boolean;
  countryCode?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  countryCode?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData) => {
    return api.post<AuthResponse>('/api/auth/register', data);
  },

  /**
   * Login user
   */
  login: async (credentials: LoginCredentials) => {
    return api.post<AuthResponse>('/api/auth/login', credentials);
  },

  /**
   * Get current user
   */
  getMe: async () => {
    const response = await api.get<{ user: User }>('/api/auth/me', true);
    if (response.success) {
      return {
        success: true as const,
        data: response.data.user,
      };
    }
    return response;
  },

  /**
   * Refresh token
   */
  refreshToken: async (token?: string) => {
    return api.post<AuthResponse>(
      '/api/auth/refresh',
      token ? { token } : undefined,
      true
    );
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email: string) => {
    return api.post<{ message: string }>('/api/auth/forgot-password', {
      email,
    });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string) => {
    return api.post<{ message: string }>('/api/auth/reset-password', {
      token,
      newPassword,
    });
  },
};

