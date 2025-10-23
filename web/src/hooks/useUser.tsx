import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setAuthToken } from '../lib/api';
import { authenticateUser, DEMO_API_USERS } from '../lib/demoAuth';
import { useAuth } from './useAuth';

export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'coadmin' | 'driver';
  orgId: string;
}

interface DemoUserWithPassword {
  userId: string;
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'coadmin' | 'driver';
  orgId: string;
}

interface UserContextType {
  currentUser: User | null;
  switchUser: (user: User) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Demo users for the application (these would be in your seed data)
export const DEMO_USERS_WITH_PASSWORDS: DemoUserWithPassword[] = [
  {
    userId: 'admin-123',
    email: 'admin@demo.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin',
    orgId: 'demo-org',
  },
  {
    userId: 'coadmin-456',
    email: 'coadmin@demo.com',
    password: 'coadmin123',
    displayName: 'Co-Admin User',
    role: 'coadmin',
    orgId: 'demo-org',
  },
  {
    userId: 'driver1-789',
    email: 'driver1@demo.com',
    password: 'driver123',
    displayName: 'Driver Johnson',
    role: 'driver',
    orgId: 'demo-org',
  },
  {
    userId: 'driver2-101',
    email: 'driver2@demo.com',
    password: 'driver123',
    displayName: 'Driver Smith',
    role: 'driver',
    orgId: 'demo-org',
  },
];

export const DEMO_USERS: User[] = DEMO_USERS_WITH_PASSWORDS.map(({ password: _password, ...user }) => user);

export function UserProvider({ children }: { children: ReactNode }) {
  const cognitoAuth = useAuth();
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Load user from localStorage on initialization
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Restore auth token if user is saved
        const token = localStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
        }
        return user;
      } catch {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
    return null;
  });

  // Sync with Cognito auth
  useEffect(() => {
    if (cognitoAuth.user && !currentUser) {
      const user: User = {
        userId: cognitoAuth.user.userId,
        email: cognitoAuth.user.email,
        displayName: cognitoAuth.user.displayName || cognitoAuth.user.email.split('@')[0],
        role: cognitoAuth.user.role as any,
        orgId: cognitoAuth.user.orgId,
      };
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else if (!cognitoAuth.user && currentUser && !localStorage.getItem('authToken')) {
      // Cognito logged out but we still have a user - clear it
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    }
  }, [cognitoAuth.user, currentUser]);
        return user;
      } catch {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
    return null;
  });

  const switchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check if this is a real API user
    const realApiToken = authenticateUser(email, password);
    if (realApiToken) {
      // Real API authentication
      const apiUser = DEMO_API_USERS.find(u => u.email === email);
      if (apiUser) {
        const user: User = {
          userId: apiUser.userId,
          email: apiUser.email,
          displayName: apiUser.email.split('@')[0],
          role: apiUser.role as any,
          orgId: apiUser.orgId
        };
        
        setAuthToken(realApiToken);
        localStorage.setItem('authToken', realApiToken);
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      }
    }
    
    // Fallback to demo authentication
    const user = DEMO_USERS_WITH_PASSWORDS.find(
      u => u.email === email && u.password === password
    );
    
    if (user) {
      const { password: _password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      // Clear any existing auth token for demo mode
      setAuthToken(null);
      localStorage.removeItem('authToken');
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        switchUser,
        login,
        logout,
        isAuthenticated: !!currentUser || cognitoAuth.isAuthenticated
      }}
        isAuthenticated: !!currentUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}