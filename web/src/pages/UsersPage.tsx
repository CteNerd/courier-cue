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
  const { addUser, updateUserStatus, updateUserRole, deleteUser, getFilteredUsers, getUserCounts } = useUsers();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleFilter>('all');

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

  const handleInviteUser = (userData: any) => {
    addUser(userData);
    console.log('User invited:', userData);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

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
            <button
              onClick={() => setShowInviteForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Invite User
            </button>
          </div>

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
                onStatusChange={updateUserStatus}
                onRoleChange={updateUserRole}
                onDeleteUser={handleDeleteUser}
              />
            </div>
          </div>

          {/* Management Info */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">User Management</h3>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>Admin:</strong> Full access to all features and user management</p>
              <p><strong>Co-Admin:</strong> Can manage drivers and view all data, but cannot manage other admins</p>
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
      />
    </div>
  );
}
