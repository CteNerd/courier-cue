import { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'co-admin' | 'driver';
  orgId: string;
}

interface DemoUserWithPassword {
  userId: string;
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'co-admin' | 'driver';
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
    role: 'co-admin',
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

export const DEMO_USERS: User[] = DEMO_USERS_WITH_PASSWORDS.map(({ password, ...user }) => user);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Load user from localStorage on initialization
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
    return null;
  });

  const switchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Find user with matching credentials
    const user = DEMO_USERS_WITH_PASSWORDS.find(
      u => u.email === email && u.password === password
    );
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        switchUser,
        login,
        logout,
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