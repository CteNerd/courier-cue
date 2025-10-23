import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables for tests
vi.stubGlobal('import.meta', {
  env: {
    VITE_COGNITO_USER_POOL_ID: 'test-pool-id',
    VITE_COGNITO_CLIENT_ID: 'test-client-id',
    VITE_COGNITO_DOMAIN: 'https://test.auth.us-east-1.amazoncognito.com',
    VITE_API_ENDPOINT: 'https://test-api.example.com',
    VITE_LOCAL_DEV: 'false',
    VITE_USE_MOCK_API: 'false',
  },
});

// Mock window.location for tests
delete (window as any).location;
window.location = {
  ...window.location,
  origin: 'http://localhost:3000',
  href: 'http://localhost:3000',
} as any;
