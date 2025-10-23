// API client configuration
import { mockApi } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || false; // Default to real API for testing

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed: ${response.statusText}`);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Real Organization API (when connected to backend)
const realOrgApi = {
  getSettings: () => request('/org/settings'),
  updateSettings: (data: any) =>
    request('/org/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  listUsers: () => request<{ users: any[] }>('/org/users'),
  inviteUser: (data: any) =>
    request('/org/users/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (userId: string, data: any) =>
    request(`/org/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Real Loads API (when connected to backend)
const realLoadsApi = {
  create: (data: any) =>
    request('/loads', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  list: (params?: {
    status?: string;
    driverId?: string;
    from?: string;
    to?: string;
    q?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }
    const queryString = searchParams.toString();
    return request<{ loads: any[] }>(
      `/loads${queryString ? `?${queryString}` : ''}`
    );
  },
  get: (id: string) => request(`/loads/${id}`),
  update: (id: string, data: any) =>
    request(`/loads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  myLoads: (params?: { from?: string; to?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }
    const queryString = searchParams.toString();
    return request<{ loads: any[] }>(
      `/loads/my${queryString ? `?${queryString}` : ''}`
    );
  },
  updateStatus: (id: string, action: 'IN_TRANSIT' | 'DELIVERED') =>
    request(`/loads/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),
  getSignaturePresignUrl: (id: string) =>
    request<{ uploadUrl: string; s3Key: string }>(
      `/loads/${id}/signature/shipper/presign`,
      { method: 'POST' }
    ),
  confirmSignature: (id: string, data: any) =>
    request(`/loads/${id}/signature/shipper/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getReceipt: (id: string) => `${API_BASE_URL}/loads/${id}/receipt.pdf`,
  sendEmail: (id: string) =>
    request(`/loads/${id}/email`, { method: 'POST' }),
};

// Export the appropriate API based on configuration
export const orgApi = USE_MOCK_API ? mockApi.org : realOrgApi;
export const loadsApi = USE_MOCK_API ? mockApi.loads : realLoadsApi;

export default {
  org: orgApi,
  loads: loadsApi,
};
