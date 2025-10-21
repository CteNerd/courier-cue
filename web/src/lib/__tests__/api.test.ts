import { describe, it, expect, vi } from 'vitest';
import { setAuthToken, getAuthToken } from '../api';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthToken(null);
  });

  describe('Auth Token Management', () => {
    it('should set and get auth token', () => {
      const token = 'test-jwt-token';
      setAuthToken(token);
      expect(getAuthToken()).toBe(token);
    });

    it('should handle null token', () => {
      setAuthToken(null);
      expect(getAuthToken()).toBe(null);
    });
  });

  describe('Request Headers', () => {
    it('should include Authorization header when token is set', async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      setAuthToken('test-token');

      // Import dynamically to use the mocked fetch
      const { orgApi } = await import('../api');
      await orgApi.getSettings();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should not include Authorization header when token is not set', async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      setAuthToken(null);

      const { orgApi } = await import('../api');
      await orgApi.getSettings();

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers || {};
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-ok responses', async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: async () => ({ error: 'Resource not found' }),
      });

      const { orgApi } = await import('../api');
      await expect(orgApi.getSettings()).rejects.toThrow('Resource not found');
    });

    it('should handle JSON parse errors', async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const { orgApi } = await import('../api');
      await expect(orgApi.getSettings()).rejects.toThrow();
    });
  });
});
