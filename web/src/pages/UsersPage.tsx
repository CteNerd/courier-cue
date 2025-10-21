import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { DarkModeToggle } from '../components/DarkModeToggle';

// Import Navigation from App.tsx (we'll need to extract it to a separate component)
function Navigation() {
  const { currentUser, logout } = useUser();

  if (!currentUser) return null;

  const navItems = currentUser.role === 'driver' 
    ? [
        { name: 'My Loads', href: '/driver/loads' },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Loads', href: '/loads' },
        ...(currentUser.role === 'admin' || currentUser.role === 'co-admin' ? [{ name: 'Users', href: '/users' }] : []),
        { name: 'Settings', href: '/settings' },
      ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">CourierCue</h1>
            <div className="flex space-x-4">
              {navItems.map(item => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">{currentUser.displayName}</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              {currentUser.role}
            </span>
            <DarkModeToggle />
            <button
              onClick={logout}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface User {
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'co-admin' | 'driver';
  orgId: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
}

// Extended demo users with additional fields for management
const EXTENDED_DEMO_USERS: User[] = [
  {
    userId: 'admin-123',
    email: 'admin@demo.com',
    displayName: 'Admin User',
    role: 'admin',
    orgId: 'demo-org',
    status: 'active',
    lastLogin: '2025-10-20T22:30:00Z',
    createdAt: '2025-01-15T09:00:00Z',
  },
  {
    userId: 'coadmin-456',
    email: 'coadmin@demo.com',
    displayName: 'Co-Admin User',
    role: 'co-admin',
    orgId: 'demo-org',
    status: 'active',
    lastLogin: '2025-10-20T21:15:00Z',
    createdAt: '2025-02-01T10:30:00Z',
  },
  {
    userId: 'driver1-789',
    email: 'driver1@demo.com',
    displayName: 'Driver Johnson',
    role: 'driver',
    orgId: 'demo-org',
    status: 'active',
    lastLogin: '2025-10-20T18:45:00Z',
    createdAt: '2025-03-10T14:20:00Z',
  },
  {
    userId: 'driver2-101',
    email: 'driver2@demo.com',
    displayName: 'Driver Smith',
    role: 'driver',
    orgId: 'demo-org',
    status: 'active',
    lastLogin: '2025-10-20T19:30:00Z',
    createdAt: '2025-03-15T11:00:00Z',
  },
  {
    userId: 'driver3-202',
    email: 'driver3@demo.com',
    displayName: 'Driver Brown',
    role: 'driver',
    orgId: 'demo-org',
    status: 'inactive',
    lastLogin: '2025-10-18T16:20:00Z',
    createdAt: '2025-04-01T09:15:00Z',
  },
  {
    userId: 'driver4-303',
    email: 'driver4@demo.com',
    displayName: 'Driver Wilson',
    role: 'driver',
    orgId: 'demo-org',
    status: 'pending',
    createdAt: '2025-10-19T13:45:00Z',
  },
];

interface InviteUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
  currentUserRole: 'admin' | 'co-admin' | 'driver';
}

function InviteUserForm({ isOpen, onClose, onSubmit, currentUserRole }: InviteUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'driver' as 'admin' | 'co-admin' | 'driver'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser = {
      userId: `${formData.role}-${Date.now()}`,
      email: formData.email,
      displayName: formData.displayName,
      role: formData.role,
      orgId: 'demo-org',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    onSubmit(newUser);
    
    // Reset form
    setFormData({
      email: '',
      displayName: '',
      role: 'driver'
    });
    
    onClose();
  };

  const availableRoles = currentUserRole === 'admin' 
    ? [
        { value: 'co-admin', label: 'Co-Admin' },
        { value: 'driver', label: 'Driver' }
      ]
    : [
        { value: 'driver', label: 'Driver' }
      ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Invite New User</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="user@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'co-admin' | 'driver' }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {availableRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { currentUser } = useUser();
  const [users, setUsers] = useState<User[]>(EXTENDED_DEMO_USERS);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'co-admin' | 'driver'>('all');

  if (!currentUser) return null;

  // Permission check
  if (currentUser.role === 'driver') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Filter users based on current user role
  let filteredUsers = users;
  if (currentUser.role === 'co-admin') {
    // Co-admins can only see drivers
    filteredUsers = users.filter(user => user.role === 'driver');
  } else if (selectedRole !== 'all') {
    filteredUsers = users.filter(user => user.role === selectedRole);
  }

  const handleInviteUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    console.log('New user invited:', newUser);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.userId === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.userId !== userId));
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'co-admin': return 'bg-blue-100 text-blue-800';
      case 'driver': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {currentUser.role === 'co-admin' ? 'Driver Management' : 'User Management'}
              </h2>
              <p className="text-gray-600 mt-1">
                {currentUser.role === 'co-admin' 
                  ? 'Manage drivers and their access' 
                  : 'Manage organization users and permissions'
                }
              </p>
            </div>
            <button 
              onClick={() => setShowInviteForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Invite User
            </button>
          </div>

          {/* Filter tabs - only show for admins */}
          {currentUser.role === 'admin' && (
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { key: 'all', label: 'All Users' },
                    { key: 'admin', label: 'Admins' },
                    { key: 'co-admin', label: 'Co-Admins' },
                    { key: 'driver', label: 'Drivers' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedRole(tab.key as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        selectedRole === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Active</h3>
              <p className="text-2xl font-bold text-green-600">
                {filteredUsers.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredUsers.filter(u => u.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Inactive</h3>
              <p className="text-2xl font-bold text-red-600">
                {filteredUsers.filter(u => u.status === 'inactive').length}
              </p>
            </div>
          </div>

          {/* Users table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {user.userId !== currentUser.userId && (
                              <>
                                <button
                                  onClick={() => handleToggleUserStatus(user.userId)}
                                  className={`px-3 py-1 rounded text-xs font-medium ${
                                    user.status === 'active'
                                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                                  }`}
                                >
                                  {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.userId)}
                                  className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InviteUserForm
        isOpen={showInviteForm}
        onClose={() => setShowInviteForm(false)}
        onSubmit={handleInviteUser}
        currentUserRole={currentUser.role}
      />
    </div>
  );
}
