export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'co-admin' | 'driver';
  orgId: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'co-admin' | 'driver';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type RoleFilter = 'all' | UserRole;