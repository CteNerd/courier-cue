export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'coadmin' | 'driver';
  orgId: string;
  status: 'active' | 'inactive' | 'pending';
  lastLoginAt?: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'coadmin' | 'driver';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type RoleFilter = 'all' | UserRole;