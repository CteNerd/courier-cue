import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { setAuthToken } from '../lib/api';

const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID || '';
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || '';
const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN || '';
// Always use the current window origin for redirect URI to support both S3 and CloudFront
const REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin + '/callback' : '';
const IS_LOCAL_DEV = import.meta.env.VITE_LOCAL_DEV === 'true';

// Debug logging for OAuth configuration
console.log('[AUTH DEBUG] OAuth Configuration:', {
  USER_POOL_ID,
  CLIENT_ID,
  COGNITO_DOMAIN,
  REDIRECT_URI,
  windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
  LOCAL_DEV: import.meta.env.VITE_LOCAL_DEV,
  USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API,
  IS_LOCAL_DEV,
});

// Only import Cognito if not in local dev mode
let CognitoUserPool: any;
let userPool: any;

if (!IS_LOCAL_DEV && typeof window !== 'undefined') {
  import('amazon-cognito-identity-js').then((cognito) => {
    CognitoUserPool = cognito.CognitoUserPool;
    userPool = new CognitoUserPool({
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
    });
  });
}

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

// Restore token immediately on module load (before React renders)
const initToken = () => {
  if (typeof window !== 'undefined' && import.meta.env.VITE_LOCAL_DEV !== 'true') {
    try {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        // Set token immediately so it's available for API calls
        setAuthToken(storedToken);
        console.log('[AUTH DEBUG] Token restored from localStorage on init');
      }
    } catch (e) {
      console.error('[AUTH DEBUG] Failed to restore token on init:', e);
    }
  }
};
initToken();

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

      // Try to restore token from localStorage
      try {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
          console.log('[AUTH DEBUG] Restoring token from localStorage');
          setAuthToken(storedToken);
          
          // Decode token to get user info
          try {
            const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
            console.log('[AUTH DEBUG] Restored token payload:', tokenPayload);
            
            // Check if token is expired
            if (tokenPayload.exp && tokenPayload.exp * 1000 < Date.now()) {
              console.log('[AUTH DEBUG] Token expired, clearing');
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              setUser(null);
              setIsLoading(false);
              return;
            }
            
            setUser({
              userId: tokenPayload.sub,
              email: tokenPayload.email || tokenPayload.username,
              orgId: tokenPayload['custom:orgId'] || '',
              role: tokenPayload['cognito:groups']?.[0] || 'driver',
              displayName: tokenPayload.name || tokenPayload.email,
            });
            setIsLoading(false);
            return;
          } catch (decodeError) {
            console.error('[AUTH DEBUG] Failed to decode stored token:', decodeError);
            localStorage.removeItem('access_token');
          }
        }
      } catch (storageError) {
        console.error('[AUTH DEBUG] localStorage access error:', storageError);
      }

      const cognitoUser = userPool?.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.getSession((err: Error | null, session: any | null) => {
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
    // Always use current window origin to support both S3 and CloudFront URLs
    const redirectUri = window.location.origin + '/callback';
    
    // Redirect to Cognito Hosted UI
    const authUrl = `${COGNITO_DOMAIN}/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&scope=openid+email+profile&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;
    
    console.log('[AUTH DEBUG] Initiating login redirect:', {
      COGNITO_DOMAIN,
      CLIENT_ID,
      currentOrigin: window.location.origin,
      redirectUri,
      encodedRedirectUri: encodeURIComponent(redirectUri),
      fullAuthUrl: authUrl,
    });
    
    window.location.href = authUrl;
  };

  const logout = () => {
    const cognitoUser = userPool?.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    setUser(null);
    setAuthToken(null);
    
    // Clear stored tokens
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    } catch (e) {
      console.error('[AUTH DEBUG] Failed to clear tokens:', e);
    }
    
    console.log('[AUTH DEBUG] Logout initiated, redirecting to login...');
    
    // Redirect appropriately based on environment
    if (!IS_LOCAL_DEV) {
      // Always use current window origin to support both S3 and CloudFront URLs
      const logoutRedirectUri = window.location.origin + '/login';
      const logoutUrl = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(
        logoutRedirectUri
      )}`;
      console.log('[AUTH DEBUG] Redirecting to Cognito logout:', {
        logoutUrl,
        currentOrigin: window.location.origin,
        logoutRedirectUri,
      });
      window.location.href = logoutUrl;
    } else {
      // For local dev, just redirect to login
      console.log('[AUTH DEBUG] Local dev logout, redirecting to /login');
      window.location.href = '/login';
    }
  };

  const handleCallback = async (code: string) => {
    try {
      console.log('[AUTH DEBUG] Starting handleCallback:', {
        code,
        codeLength: code.length,
        COGNITO_DOMAIN,
        CLIENT_ID,
        REDIRECT_URI,
      });
      
      // Exchange code for tokens via Cognito token endpoint
      // In production, this should go through your backend for security
      const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`;
      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code: code,
        redirect_uri: REDIRECT_URI,
      });
      
      console.log('[AUTH DEBUG] Exchanging code for tokens:', {
        tokenUrl,
        params: Object.fromEntries(tokenParams),
      });
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      });
      
      console.log('[AUTH DEBUG] Token response status:', tokenResponse.status);
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('[AUTH DEBUG] Token exchange failed:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          error: errorText,
        });
        throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
      }
      
      const tokens = await tokenResponse.json();
      console.log('[AUTH DEBUG] Received tokens:', {
        hasAccessToken: !!tokens.access_token,
        hasIdToken: !!tokens.id_token,
        hasRefreshToken: !!tokens.refresh_token,
        tokenType: tokens.token_type,
        expiresIn: tokens.expires_in,
        accessTokenPreview: tokens.access_token?.substring(0, 50) + '...',
      });
      
      // Store tokens and set auth
      if (tokens.id_token) {
        setAuthToken(tokens.access_token);
        
        // Persist tokens to localStorage
        try {
          localStorage.setItem('access_token', tokens.access_token);
          if (tokens.refresh_token) {
            localStorage.setItem('refresh_token', tokens.refresh_token);
          }
        } catch (storageError) {
          console.error('[AUTH DEBUG] Failed to store tokens:', storageError);
        }
        
        // Decode ID token to get user info
        const idTokenPayload = JSON.parse(atob(tokens.id_token.split('.')[1]));
        console.log('[AUTH DEBUG] ID Token payload:', idTokenPayload);
        
        setUser({
          userId: idTokenPayload.sub,
          email: idTokenPayload.email,
          orgId: idTokenPayload['custom:orgId'] || '',
          role: idTokenPayload['cognito:groups']?.[0] || 'driver',
          displayName: idTokenPayload.name || idTokenPayload.email,
        });
        
        console.log('[AUTH DEBUG] handleCallback completed successfully');
      }
    } catch (error) {
      console.error('[AUTH DEBUG] Callback error:', error);
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
