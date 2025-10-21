import { useState } from 'react';
import { SettingsProps } from '../../types/settings';
import CustomFieldForm from './CustomFieldForm';

export default function CustomFieldsSettings({ settings, updateNestedSettings }: SettingsProps & { updateNestedSettings: (path: string, value: any) => void }) {
  const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);

  const handleAddField = (field: any) => {
    const newFields = [...settings.customFields, field];
    updateNestedSettings('customFields', newFields);
  };

  const handleEditField = (field: any) => {
    const newFields = settings.customFields.map(f => f.id === field.id ? field : f);
    updateNestedSettings('customFields', newFields);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    const newFields = settings.customFields.filter(f => f.id !== fieldId);
    updateNestedSettings('customFields', newFields);
  };

  const openEditForm = (field: any) => {
    setEditingField(field);
    setShowCustomFieldForm(true);
  };

  const closeForm = () => {
    setShowCustomFieldForm(false);
    setEditingField(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Custom Fields</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add custom fields to collect additional information for loads
          </p>
        </div>
        <button
          onClick={() => setShowCustomFieldForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          Add Field
        </button>
      </div>

      {settings.customFields.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No custom fields defined yet.</p>
          <p className="text-sm">Click "Add Field" to create your first custom field.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {settings.customFields.map((field) => (
            <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{field.name}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  {field.type === 'select' && field.options && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Options: {field.options.join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(field)}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CustomFieldForm
        isOpen={showCustomFieldForm}
        onClose={closeForm}
        onSubmit={editingField ? handleEditField : handleAddField}
        editingField={editingField}
      />
    </div>
  );
}