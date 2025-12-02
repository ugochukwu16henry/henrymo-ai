/**
 * User API functions
 */

import { api } from '../api-client';
import type { User } from './auth';

export interface UpdateProfileData {
  name?: string;
  countryCode?: string;
  avatarUrl?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const usersApi = {
  /**
   * Get user by ID
   */
  getUser: async (userId: string) => {
    return api.get<User>(`/api/users/${userId}`, true);
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId: string, data: UpdateProfileData) => {
    return api.put<User>(`/api/users/${userId}`, data, true);
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordData) => {
    return api.post<{ message: string }>('/api/users/change-password', data, true);
  },

  /**
   * Delete user account
   */
  deleteAccount: async (userId: string) => {
    return api.delete<{ message: string }>(`/api/users/${userId}`, true);
  },
};

