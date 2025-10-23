import { useUser, DEMO_USERS } from '../hooks/useUser';
import { useCreateLoadForm } from '../hooks/useCreateLoadForm';
import { CreateLoadFormProps } from '../types/load';
import ServiceAddressForm from './forms/ServiceAddressForm';
import ItemsManager from './forms/ItemsManager';
import LoadAssignment from './forms/LoadAssignment';

export default function CreateLoadForm({ isOpen, onClose, onSubmit }: CreateLoadFormProps) {
  const { currentUser } = useUser();
  const {
    formData,
    handleAddressChange,
    handleItemChange,
    addItem,
    removeItem,
    handleDriverChange,
    handlePriorityChange,
    handleNotesChange,
    resetForm,
    createLoadData
  } = useCreateLoadForm();

  const drivers = DEMO_USERS.filter(user => user.role === 'driver');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loadData = createLoadData(currentUser, drivers);
    onSubmit(loadData);
    resetForm();
    onClose();
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
              assignedDriverId={formData.assignedDriverId}
              priority={formData.priority}
              notes={formData.notes}
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
                className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Load
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}