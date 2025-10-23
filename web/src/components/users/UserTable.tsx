import { User, UserRole } from '../../types/user';

interface UserTableProps {
  users: User[];
  currentUserRole: UserRole;
  onStatusChange: (userId: string, status: User['status']) => void;
  onRoleChange: (userId: string, role: UserRole) => void;
  onDeleteUser: (userId: string) => void;
  actionLoading?: string | null;
}

export default function UserTable({ 
  users, 
  currentUserRole, 
  onStatusChange, 
  onRoleChange, 
  onDeleteUser,
  actionLoading 
}: UserTableProps) {
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'inactive': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'coadmin': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'driver': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const canModifyUser = (userRole: UserRole) => {
    if (currentUserRole === 'admin') return true;
    if (currentUserRole === 'coadmin' && userRole === 'driver') return true;
    return false;
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    return new Date(lastLogin).toLocaleDateString();
  };

  const isLoading = (userId: string, action: string) => {
    return actionLoading === `${action}-${userId}`;
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No users found matching the current filter.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Last Login
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {canModifyUser(user.role) ? (
                  <select
                    value={user.role || 'driver'}
                    onChange={(e) => onRoleChange(user.id, e.target.value as UserRole)}
                    disabled={isLoading(user.id, 'role')}
                    className="text-xs px-2 py-1 rounded-full border-0 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="driver">Driver</option>
                    {currentUserRole === 'admin' && <option value="coadmin">Co-Admin</option>}
                  </select>
                ) : (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {user.role === 'coadmin' ? 'Co-Admin' : (user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown')}
                  </span>
                )}
                {isLoading(user.id, 'role') && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">Updating...</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {canModifyUser(user.role) ? (
                  <select
                    value={user.status || 'active'}
                    onChange={(e) => onStatusChange(user.id, e.target.value as User['status'])}
                    disabled={isLoading(user.id, 'status')}
                    className="text-xs px-2 py-1 rounded-full border-0 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                ) : (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                    {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Unknown'}
                  </span>
                )}
                {isLoading(user.id, 'status') && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">Updating...</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatLastLogin(user.lastLoginAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {canModifyUser(user.role) && (
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    disabled={isLoading(user.id, 'delete')}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    {isLoading(user.id, 'delete') ? 'Disabling...' : 'Disable'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}