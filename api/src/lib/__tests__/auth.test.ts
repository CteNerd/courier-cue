import { describe, it, expect } from '@jest/globals';
import { verifyOrgAccess, requireRole, canAccessLoad, AuthError } from '../auth';

describe('Auth Module', () => {
  describe('verifyOrgAccess', () => {
    it('should allow access for matching orgId', () => {
      const authContext = {
        userId: 'user1',
        email: 'test@example.com',
        orgId: 'org1',
        role: 'admin',
        groups: ['admin'],
      };

      expect(() => verifyOrgAccess(authContext, 'org1')).not.toThrow();
    });

    it('should deny access for non-matching orgId', () => {
      const authContext = {
        userId: 'user1',
        email: 'test@example.com',
        orgId: 'org1',
        role: 'admin',
        groups: ['admin'],
      };

      expect(() => verifyOrgAccess(authContext, 'org2')).toThrow(AuthError);
      expect(() => verifyOrgAccess(authContext, 'org2')).toThrow('Access denied to this organization');
    });

    it('should allow platform admins to access any org', () => {
      const authContext = {
        userId: 'admin1',
        email: 'admin@platform.com',
        orgId: 'org1',
        role: 'admin',
        groups: ['platformAdmin'],
      };

      expect(() => verifyOrgAccess(authContext, 'org2')).not.toThrow();
    });
  });

  describe('requireRole', () => {
    it('should allow access for matching role', () => {
      const authContext = {
        userId: 'user1',
        email: 'test@example.com',
        orgId: 'org1',
        role: 'admin',
        groups: ['admin'],
      };

      expect(() => requireRole(authContext, ['admin', 'coadmin'])).not.toThrow();
    });

    it('should allow access for matching group', () => {
      const authContext = {
        userId: 'user1',
        email: 'test@example.com',
        orgId: 'org1',
        role: 'driver',
        groups: ['admin'],
      };

      expect(() => requireRole(authContext, ['admin'])).not.toThrow();
    });

    it('should deny access for non-matching role', () => {
      const authContext = {
        userId: 'user1',
        email: 'test@example.com',
        orgId: 'org1',
        role: 'driver',
        groups: ['driver'],
      };

      expect(() => requireRole(authContext, ['admin', 'coadmin'])).toThrow(AuthError);
    });
  });

  describe('canAccessLoad', () => {
    it('should allow admins to access any load', () => {
      const authContext = {
        userId: 'user1',
        email: 'admin@example.com',
        orgId: 'org1',
        role: 'admin',
        groups: ['admin'],
      };

      const load = { assignedDriverId: 'driver1' };

      expect(canAccessLoad(authContext, load, 'read')).toBe(true);
      expect(canAccessLoad(authContext, load, 'write')).toBe(true);
    });

    it('should allow drivers to read their assigned loads', () => {
      const authContext = {
        userId: 'driver1',
        email: 'driver@example.com',
        orgId: 'org1',
        role: 'driver',
        groups: ['driver'],
      };

      const load = { assignedDriverId: 'driver1' };

      expect(canAccessLoad(authContext, load, 'read')).toBe(true);
    });

    it('should deny drivers access to other drivers loads', () => {
      const authContext = {
        userId: 'driver1',
        email: 'driver@example.com',
        orgId: 'org1',
        role: 'driver',
        groups: ['driver'],
      };

      const load = { assignedDriverId: 'driver2' };

      expect(canAccessLoad(authContext, load, 'read')).toBe(false);
      expect(canAccessLoad(authContext, load, 'write')).toBe(false);
    });

    it('should allow coadmins to access loads', () => {
      const authContext = {
        userId: 'user1',
        email: 'coadmin@example.com',
        orgId: 'org1',
        role: 'coadmin',
        groups: ['coadmin'],
      };

      const load = { assignedDriverId: 'driver1' };

      expect(canAccessLoad(authContext, load, 'read')).toBe(true);
      expect(canAccessLoad(authContext, load, 'write')).toBe(true);
    });
  });
});
