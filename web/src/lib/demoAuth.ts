// Demo authentication for real API testing

export interface DemoUser {
  userId: string;
  email: string;
  orgId: string;
  role: string;
  password: string;
  displayName: string;
}

// Demo users that match the seeded data
export const DEMO_API_USERS: DemoUser[] = [
  {
    userId: 'admin-123',
    email: 'admin@demo.com',
    orgId: 'demo-org',
    role: 'admin',
    password: 'admin123',
    displayName: 'Admin User'
  },
  {
    userId: 'coadmin-456',
    email: 'coadmin@demo.com',
    orgId: 'demo-org', 
    role: 'coadmin',
    password: 'coadmin123',
    displayName: 'Co-Admin User'
  },
  {
    userId: 'driver1-789', 
    email: 'driver1@demo.com',
    orgId: 'demo-org',
    role: 'driver',
    password: 'driver123',
    displayName: 'Driver Johnson'
  },
  {
    userId: 'driver2-101', 
    email: 'driver2@demo.com',
    orgId: 'demo-org',
    role: 'driver',
    password: 'driver123',
    displayName: 'Driver Smith'
  }
];

// Generate a demo JWT token for local testing
export function generateDemoJWT(user: DemoUser): string {
  const payload = {
    sub: user.userId,
    email: user.email,
    'custom:orgId': user.orgId,
    'custom:role': user.role,
    'cognito:groups': [user.role],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  // For demo purposes, create an unsigned JWT (real API will validate at middleware level)
  const header = { alg: 'none', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  return `${encodedHeader}.${encodedPayload}.`;
}

// Authenticate user and return JWT token
export function authenticateUser(email: string, password: string): string | null {
  const user = DEMO_API_USERS.find(u => u.email === email && u.password === password);
  if (!user) return null;
  
  return generateDemoJWT(user);
}