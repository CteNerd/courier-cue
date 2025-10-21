import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

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
  it('should render login page', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Sign in to CourierCue')).toBeInTheDocument();
    expect(screen.getByText('Demo delivery management system')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should have sign in button', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const button = screen.getByRole('button', { name: /sign in/i });
    expect(button).toBeInTheDocument();
  });
});
