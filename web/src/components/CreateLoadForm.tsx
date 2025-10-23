import { useCreateLoadForm } from '../hooks/useCreateLoadForm';
import { CreateLoadFormProps } from '../types/load';
import { orgApi } from '../lib/api';
import { useState, useEffect } from 'react';
import ServiceAddressForm from './forms/ServiceAddressForm';
import ItemsManager from './forms/ItemsManager';
import LoadAssignment from './forms/LoadAssignment';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export default function CreateLoadForm({ isOpen, onClose, onSubmit }: CreateLoadFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    formData,
    handleAddressChange,
    handleItemChange,
    addItem,
    removeItem,
    handleDriverChange,
    handlePriorityChange,
    handleNotesChange,
    resetForm
  } = useCreateLoadForm();

  const drivers = users.filter(user => user.role === 'driver');

  // Load users when form opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const response = await orgApi.listUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Create load data in API format
      const loadData = {
        serviceAddress: formData.serviceAddress,
        items: formData.items
          .filter(item => item.description.trim() !== '')
          .map((item, index) => ({
            id: `item-${index}`,
            description: item.description,
            qty: item.qty,
            unit: 'piece' // default unit
          })),
        assignedDriverId: formData.assignedDriverId || undefined,
        notes: formData.notes || undefined,
        priority: formData.priority,
        status: formData.assignedDriverId ? 'ASSIGNED' : 'PENDING'
      };

      await onSubmit(loadData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create load:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Load</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ServiceAddressForm 
              serviceAddress={formData.serviceAddress}
              onChange={handleAddressChange}
            />

            <ItemsManager
              items={formData.items}
              onItemChange={handleItemChange}
              onAddItem={addItem}
              onRemoveItem={removeItem}
            />

            <LoadAssignment 
              assignedDriverId={formData.assignedDriverId || ''}
              priority={formData.priority}
              notes={formData.notes || ''}
              drivers={drivers}
              onDriverChange={handleDriverChange}
              onPriorityChange={handlePriorityChange}
              onNotesChange={handleNotesChange}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Load'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}