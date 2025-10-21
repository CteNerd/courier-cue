import { useState } from 'react';
import { UserRole } from '../../types/user';

interface InviteUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
  currentUserRole: UserRole;
}

export default function InviteUserForm({ isOpen, onClose, onSubmit, currentUserRole }: InviteUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'driver' as UserRole
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser = {
      userId: `user-${Date.now()}`,
      email: formData.email,
      displayName: formData.displayName,
      role: formData.role,
      orgId: 'demo-org',
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    onSubmit(newUser);
    setFormData({ email: '', displayName: '', role: 'driver' });
    onClose();
  };

  // Only admins can create co-admins
  const availableRoles = currentUserRole === 'admin' 
    ? [
        { value: 'driver', label: 'Driver' },
        { value: 'co-admin', label: 'Co-Admin' },
      ]
    : [
        { value: 'driver', label: 'Driver' },
      ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Invite New User</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                {availableRoles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p><strong>Note:</strong> An invitation email will be sent to the user with instructions to set up their account.</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t dark:border-gray-700 space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
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