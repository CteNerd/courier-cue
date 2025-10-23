import { useState, useMemo, useEffect } from 'react';
import { User, UserRole, RoleFilter } from '../types/user';
import { orgApi } from '../lib/api';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orgApi.listUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (newUserData: { email: string; role: UserRole; displayName: string }) => {
    try {
      await orgApi.inviteUser(newUserData);
      await loadUsers(); // Refresh the users list
    } catch (err) {
      console.error('Failed to invite user:', err);
      throw err;
    }
  };

  const updateUserStatus = async (userId: string, status: User['status']) => {
    try {
      await orgApi.updateUser(userId, { status });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status } : user
      ));
    } catch (err) {
      console.error('Failed to update user status:', err);
      throw err;
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      await orgApi.updateUser(userId, { role });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role } : user
      ));
    } catch (err) {
      console.error('Failed to update user role:', err);
      throw err;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Note: This would be a new API endpoint if implemented
      // For now, just disable the user instead of deleting
      await updateUserStatus(userId, 'inactive');
    } catch (err) {
      console.error('Failed to delete user:', err);
      throw err;
    }
  };

  const getFilteredUsers = (roleFilter: RoleFilter) => {
    if (roleFilter === 'all') return users;
    return users.filter(user => user.role === roleFilter);
  };

  const getUserCounts = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter(u => u.role === 'admin').length,
      coAdmin: users.filter(u => u.role === 'coadmin').length,
      driver: users.filter(u => u.role === 'driver').length,
    };
  }, [users]);

  return {
    users,
    loading,
    error,
    addUser,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    getFilteredUsers,
    getUserCounts,
    refreshUsers: loadUsers
  };
};