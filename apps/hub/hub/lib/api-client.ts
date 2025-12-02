/**
 * API Client for HenryMo AI
 * Handles all API requests with error handling and token management
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiError {
  success: false;
  error: string;
  details?: Array<{ path: string; message: string }>;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  requireAuth?: boolean;
};

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Make API request
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T> | ApiError> {
  const {
    method = 'GET',
    headers = {},
    body,
    requireAuth = false,
  } = options;

  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth token if required
  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    let data: ApiResponse<T> | ApiError;

    try {
      data = await response.json();
    } catch {
      // Handle non-JSON responses
      const text = await response.text();
      return {
        success: false,
        error: text || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    // Handle error responses
    if (!response.ok) {
      return {
        success: false,
        error: (data as ApiError).error || `HTTP ${response.status}`,
        details: (data as ApiError).details,
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Network error. Please check your connection.',
    };
  }
}

/**
 * API Client functions
 */
export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, requireAuth = false) =>
    request<T>(endpoint, { method: 'GET', requireAuth }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, body?: unknown, requireAuth = false) =>
    request<T>(endpoint, { method: 'POST', body, requireAuth }),

  /**
   * PUT request
   */
  put: <T>(endpoint: string, body?: unknown, requireAuth = true) =>
    request<T>(endpoint, { method: 'PUT', body, requireAuth }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, requireAuth = true) =>
    request<T>(endpoint, { method: 'DELETE', requireAuth }),

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, body?: unknown, requireAuth = true) =>
    request<T>(endpoint, { method: 'PATCH', body, requireAuth }),
};

export default api;

