import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_COGNITO_USER_POOL_ID: 'test-pool-id',
    VITE_COGNITO_CLIENT_ID: 'test-client-id',
    VITE_COGNITO_DOMAIN: 'https://test.auth.us-east-1.amazoncognito.com',
    VITE_LOCAL_DEV: 'false',
    VITE_USE_MOCK_API: 'false',
  },
}));

// Mock useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    logout: vi.fn(),
    handleCallback: vi.fn(),
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// Mock useUser hook
vi.mock('../../hooks/useUser', () => ({
  useUser: () => ({
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
    isLoading: false,
    user: null,
  }),
  DEMO_USERS_WITH_PASSWORDS: [
    {
      userId: '1',
      email: 'admin@demo.com',
      password: 'demo123',
      displayName: 'Admin User',
      role: 'admin',
      orgId: 'demo-org'
    }
  ]
}));

// Mock useTheme hook
vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    isDarkMode: false,
    toggleDarkMode: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  it('should render login page with Cognito sign-in button', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Sign in to CourierCue')).toBeInTheDocument();
    expect(screen.getByText('Delivery management system')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with cognito/i })).toBeInTheDocument();
  });

  it('should display redirect message', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/You will be redirected to AWS Cognito for secure authentication/i)).toBeInTheDocument();
  });
});
