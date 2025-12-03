/**
 * Media API functions
 * Handles image and video generation
 */

import { api } from '../api-client';

export interface GeneratedImage {
  id: string;
  userId: string;
  prompt: string;
  revisedPrompt: string | null;
  s3Key: string;
  s3Url: string;
  originalUrl: string | null;
  size: string;
  style: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface GeneratedVideo {
  id: string;
  userId: string;
  s3Key: string;
  s3Url: string;
  format: string;
  width: number | null;
  height: number | null;
  fps: number | null;
  duration: number;
  frameCount: number | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface GenerateImageRequest {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'realistic' | 'artistic' | 'cartoon' | 'abstract' | 'vintage';
  quality?: 'standard' | 'hd';
  addWatermark?: boolean;
}

export interface GenerateVideoRequest {
  imageUrls: string[];
  duration?: number;
  fps?: number;
  width?: number;
  height?: number;
  transition?: 'fade' | 'slide' | 'none';
  outputFormat?: 'mp4' | 'webm';
}

export const mediaApi = {
  /**
   * Generate image
   */
  generateImage: async (data: GenerateImageRequest) => {
    return api.post<GeneratedImage>('/api/media/image/generate', data, true);
  },

  /**
   * List generated images
   */
  listImages: async (params?: { limit?: number; offset?: number; style?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return api.get<GeneratedImage[]>(
      `/api/media/images${query ? `?${query}` : ''}`,
      true
    );
  },

  /**
   * Get image by ID
   */
  getImage: async (id: string) => {
    return api.get<GeneratedImage>(`/api/media/image/${id}`, true);
  },

  /**
   * Delete image
   */
  deleteImage: async (id: string) => {
    return api.delete<{ message: string }>(`/api/media/image/${id}`, true);
  },

  /**
   * Generate video
   */
  generateVideo: async (data: GenerateVideoRequest) => {
    return api.post<GeneratedVideo>('/api/media/video/generate', data, true);
  },

  /**
   * List generated videos
   */
  listVideos: async (params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return api.get<GeneratedVideo[]>(
      `/api/media/videos${query ? `?${query}` : ''}`,
      true
    );
  },

  /**
   * Get video by ID
   */
  getVideo: async (id: string) => {
    return api.get<GeneratedVideo>(`/api/media/video/${id}`, true);
  },

  /**
   * Delete video
   */
  deleteVideo: async (id: string) => {
    return api.delete<{ message: string }>(`/api/media/video/${id}`, true);
  },
};

