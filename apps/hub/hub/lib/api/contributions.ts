/**
 * Contributions API functions
 */

import { api } from '../api-client';

export interface Contribution {
  id: string;
  userId: string;
  streetId: string | null;
  latitude: number;
  longitude: number;
  streetName: string | null;
  notes: string | null;
  status: 'pending' | 'verified' | 'rejected' | 'needs_review' | 'flagged';
  rewardAmount: number;
  rewardPaid: boolean;
  verificationScore: number | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  verifiedAt: string | null;
  user?: {
    name: string;
    email: string;
  };
  images?: ContributionImage[];
  thumbnailImage?: ContributionImage | null;
}

export interface ContributionImage {
  id: string;
  contributionId: string;
  s3Key: string;
  s3Url: string;
  thumbnailS3Key: string | null;
  thumbnailUrl: string | null;
  fileSize: number;
  width: number | null;
  height: number | null;
  mimeType: string;
  exifData: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Verification {
  id: string;
  contributionId: string;
  verifierId: string;
  verdict: 'approved' | 'rejected' | 'needs_review' | 'flagged';
  comment: string | null;
  confidenceScore: number | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  verifier?: {
    id: string;
    name: string;
    email: string;
  };
  contribution?: {
    id: string;
    contributorId: string;
    streetId: string | null;
    status: string;
  };
}

export interface CreateContributionData {
  streetId?: string | null;
  latitude: number;
  longitude: number;
  streetName?: string | null;
  notes?: string | null;
}

export interface UpdateContributionData {
  notes?: string | null;
  status?: 'pending' | 'verified' | 'rejected' | 'needs_review' | 'flagged';
  streetId?: string | null;
}

export interface VerifyContributionData {
  verdict: 'approved' | 'rejected' | 'needs_review' | 'flagged';
  comment?: string | null;
  confidenceScore?: number | null;
  metadata?: Record<string, unknown>;
}

export interface ContributionsListResponse {
  contributions: Contribution[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const contributionsApi = {
  /**
   * Upload contribution with images
   */
  uploadContribution: async (data: CreateContributionData, images: File[]) => {
    const formData = new FormData();
    
    // Add form fields
    if (data.streetId) formData.append('streetId', data.streetId);
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    if (data.streetName) formData.append('streetName', data.streetName);
    if (data.notes) formData.append('notes', data.notes);

    // Add images
    images.forEach((image) => {
      formData.append('images', image);
    });

    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${API_URL}/api/content/streets/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to upload contribution');
    }

    const result = await response.json();
    return result;
  },

  /**
   * List contributions
   */
  listContributions: async (params?: {
    userId?: string;
    streetId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return api.get<ContributionsListResponse>(
      `/api/content/contributions${query ? `?${query}` : ''}`,
      true
    );
  },

  /**
   * Get contribution by ID
   */
  getContribution: async (id: string) => {
    return api.get<Contribution>(`/api/content/contributions/${id}`, true);
  },

  /**
   * Update contribution
   */
  updateContribution: async (id: string, data: UpdateContributionData) => {
    return api.put<Contribution>(`/api/content/contributions/${id}`, data, true);
  },

  /**
   * Verify contribution
   */
  verifyContribution: async (id: string, data: VerifyContributionData) => {
    return api.post<{ verification: Verification; contribution: Contribution }>(
      `/api/content/contributions/${id}/verify`,
      data,
      true
    );
  },

  /**
   * Get verifications for a contribution
   */
  getContributionVerifications: async (id: string) => {
    return api.get<Verification[]>(`/api/content/contributions/${id}/verifications`, true);
  },

  /**
   * List all verifications
   */
  listVerifications: async (params?: {
    verifierId?: string;
    contributionId?: string;
    verdict?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return api.get<{ verifications: Verification[]; pagination: any }>(
      `/api/content/verifications${query ? `?${query}` : ''}`,
      true
    );
  },
};

