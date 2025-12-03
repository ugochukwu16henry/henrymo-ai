/**
 * Streets API functions
 */

import { api } from '../api-client';

export interface Country {
  id: string;
  code: string;
  name: string;
  createdAt: string;
}

export interface State {
  id: string;
  countryId: string;
  code: string | null;
  name: string;
  createdAt: string;
}

export interface City {
  id: string;
  stateId: string | null;
  countryId: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export interface Street {
  id: string;
  cityId: string | null;
  stateId: string | null;
  countryId: string;
  name: string;
  latitude: number;
  longitude: number;
  fullAddress: string | null;
  contributionCount: number;
  lastContributionAt: string | null;
  createdAt: string;
  updatedAt: string;
  location: {
    city: string | null;
    state: string | null;
    country: string | null;
    countryCode: string | null;
  };
}

export interface SearchStreetsParams {
  query?: string;
  countryId?: string;
  stateId?: string;
  cityId?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  limit?: number;
  offset?: number;
}

export interface CreateStreetData {
  cityId?: string | null;
  stateId?: string | null;
  countryId: string;
  name: string;
  latitude: number;
  longitude: number;
  fullAddress?: string | null;
}

export interface UpdateStreetData {
  name?: string;
  latitude?: number;
  longitude?: number;
  fullAddress?: string | null;
  cityId?: string | null;
  stateId?: string | null;
  countryId?: string;
}

export interface StreetsSearchResponse {
  streets: Street[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const streetsApi = {
  /**
   * Get all countries
   */
  getCountries: async () => {
    return api.get<Country[]>('/api/content/streets/locations/countries', true);
  },

  /**
   * Get states by country
   */
  getStatesByCountry: async (countryId: string) => {
    return api.get<State[]>(`/api/content/streets/locations/states/${countryId}`, true);
  },

  /**
   * Get cities by state or country
   */
  getCities: async (params: { stateId?: string; countryId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.stateId) queryParams.append('stateId', params.stateId);
    if (params.countryId) queryParams.append('countryId', params.countryId);
    return api.get<City[]>(
      `/api/content/streets/locations/cities?${queryParams.toString()}`,
      true
    );
  },

  /**
   * Search streets
   */
  searchStreets: async (params: SearchStreetsParams) => {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.countryId) queryParams.append('countryId', params.countryId);
    if (params.stateId) queryParams.append('stateId', params.stateId);
    if (params.cityId) queryParams.append('cityId', params.cityId);
    if (params.latitude) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude) queryParams.append('longitude', params.longitude.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get<StreetsSearchResponse>(
      `/api/content/streets?${queryParams.toString()}`,
      true
    );

    if (response.success) {
      return response;
    }
    return response;
  },

  /**
   * Get street by ID
   */
  getStreet: async (id: string) => {
    return api.get<Street>(`/api/content/streets/${id}`, true);
  },

  /**
   * Create street
   */
  createStreet: async (data: CreateStreetData) => {
    return api.post<Street>('/api/content/streets', data, true);
  },

  /**
   * Update street
   */
  updateStreet: async (id: string, data: UpdateStreetData) => {
    return api.put<Street>(`/api/content/streets/${id}`, data, true);
  },

  /**
   * Delete street
   */
  deleteStreet: async (id: string) => {
    return api.delete<{ message: string }>(`/api/content/streets/${id}`, true);
  },
};

