import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { useUsers } from '../hooks/useUsers';
import { Navigation } from '../components/Navigation';
import { RoleFilter } from '../types/user';
import InviteUserForm from '../components/users/InviteUserForm';
import UserTable from '../components/users/UserTable';
import UserFilters from '../components/users/UserFilters';

export default function UsersPage() {
  const { currentUser } = useUser();
  const { 
    addUser, 
    updateUserStatus, 
    updateUserRole, 
    deleteUser, 
    getFilteredUsers, 
    getUserCounts,
    loading,
    error,
    refreshUsers
  } = useUsers();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleFilter>('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!currentUser) return null;

  // Permission check - only admins and co-admins can access user management
  if (currentUser.role === 'driver') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers(selectedRole);
  const userCounts = getUserCounts;

  const handleInviteUser = async (userData: { email: string; displayName: string; role: any }) => {
    try {
      setActionLoading('invite');
      setActionError(null);
      await addUser(userData);
      setShowInviteForm(false);
    } catch (err) {
      console.error('Failed to invite user:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to invite user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: any) => {
    try {
      setActionLoading(`status-${userId}`);
      setActionError(null);
      await updateUserStatus(userId, status);
    } catch (err) {
      console.error('Failed to update user status:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: any) => {
    try {
      setActionLoading(`role-${userId}`);
      setActionError(null);
      await updateUserRole(userId, role);
    } catch (err) {
      console.error('Failed to update user role:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to disable this user? They will no longer be able to log in.')) {
      return;
    }

    try {
      setActionLoading(`delete-${userId}`);
      setActionError(null);
      await deleteUser(userId);
    } catch (err) {
      console.error('Failed to disable user:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to disable user');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-6"></div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage user accounts and permissions
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={refreshUsers}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Refresh
              </button>
              {/* Only admins can invite users */}
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Invite User
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {(error || actionError) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error || actionError}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setActionError(null);
                      }}
                      className="text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management Content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            {/* Filters */}
            <div className="px-6 pt-6">
              <UserFilters 
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                userCounts={userCounts}
              />
            </div>

            {/* User Table */}
            <div className="p-6">
              <UserTable
                users={filteredUsers}
                currentUserRole={currentUser.role}
                onStatusChange={handleUpdateUserStatus}
                onRoleChange={handleUpdateUserRole}
                onDeleteUser={handleDeleteUser}
                actionLoading={actionLoading}
              />
            </div>
          </div>

          {/* Management Info */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">User Management</h3>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>Admin:</strong> Full access to all features and user management</p>
              <p><strong>Co-Admin:</strong> Can view all users and manage drivers, but cannot invite new users or manage other admins</p>
              <p><strong>Driver:</strong> Can only view and manage their assigned loads</p>
              <p><strong>Status:</strong> Active users can log in, Inactive users are blocked, Pending users need to complete setup</p>
            </div>
          </div>
        </div>
      </main>

      <InviteUserForm
        isOpen={showInviteForm}
        onClose={() => setShowInviteForm(false)}
        onSubmit={handleInviteUser}
        currentUserRole={currentUser.role}
        isLoading={actionLoading === 'invite'}
      />
    </div>
  );
}
