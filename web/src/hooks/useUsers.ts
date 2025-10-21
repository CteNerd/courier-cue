import { useState, useMemo } from 'react';
import { User, UserRole, RoleFilter } from '../types/user';
import { EXTENDED_DEMO_USERS } from '../data/demoUsers';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>(EXTENDED_DEMO_USERS);

  const addUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const updateUserStatus = (userId: string, status: User['status']) => {
    setUsers(prev => prev.map(user => 
      user.userId === userId ? { ...user, status } : user
    ));
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers(prev => prev.map(user => 
      user.userId === userId ? { ...user, role } : user
    ));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.userId !== userId));
  };

  const getFilteredUsers = (roleFilter: RoleFilter) => {
    if (roleFilter === 'all') return users;
    return users.filter(user => user.role === roleFilter);
  };

  const getUserCounts = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter(u => u.role === 'admin').length,
      coAdmin: users.filter(u => u.role === 'co-admin').length,
      driver: users.filter(u => u.role === 'driver').length,
    };
  }, [users]);

  return {
    users,
    addUser,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    getFilteredUsers,
    getUserCounts
  };
};