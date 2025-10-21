import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { setAuthToken } from '../lib/api';

const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID || '';
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || '';
const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN || '';
const IS_LOCAL_DEV = import.meta.env.VITE_LOCAL_DEV === 'true';
const REDIRECT_URI = window.location.origin + '/callback';

const userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
});

interface User {
  userId: string;
  email: string;
  orgId: string;
  role: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('checkAuth called, VITE_LOCAL_DEV:', import.meta.env?.VITE_LOCAL_DEV);
      
      // For local development, use mock authentication
      if (import.meta.env?.VITE_LOCAL_DEV === 'true') {
        console.log('Using mock authentication');
        // Mock admin user for local development
        setUser({
          userId: 'admin-123',
          email: 'admin@demo.com',
          orgId: 'demo-org',
          role: 'admin',
          displayName: 'Admin User',
        });
        setAuthToken('mock-token');
        setIsLoading(false);
        return;
      }

      const cognitoUser = userPool.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
          if (err || !session || !session.isValid()) {
            setUser(null);
            setIsLoading(false);
            return;
          }

          const token = session.getIdToken().getJwtToken();
          setAuthToken(token);

          const payload = session.getIdToken().payload;
          setUser({
            userId: payload.sub,
            email: payload.email,
            orgId: payload['custom:orgId'] || '',
            role: payload['custom:role'] || 'driver',
            displayName: payload.name,
          });
          setIsLoading(false);
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsLoading(false);
    }
  };

  const login = () => {
    // Redirect to Cognito Hosted UI
    const authUrl = `${COGNITO_DOMAIN}/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&scope=openid+email+profile&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}`;
    window.location.href = authUrl;
  };

  const logout = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    setUser(null);
    setAuthToken(null);
    
    // Redirect to Cognito logout
    const logoutUrl = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(
      window.location.origin
    )}`;
    window.location.href = logoutUrl;
  };

  const handleCallback = async (code: string) => {
    try {
      // Exchange code for tokens
      // Note: In production, this should go through your backend
      // For now, we'll simulate by storing a mock session
      
      // For MVP, we'll use a simplified flow
      // In production, you'd exchange the code for tokens via your backend
      console.log('Handling OAuth callback with code:', code);
      
      // Simulate successful auth
      await checkAuth();
    } catch (error) {
      console.error('Callback error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        handleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
