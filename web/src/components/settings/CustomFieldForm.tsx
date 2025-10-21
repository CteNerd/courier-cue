import { useState, useEffect } from 'react';

interface CustomFieldFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (field: any) => void;
  editingField?: any;
}

export default function CustomFieldForm({ isOpen, onClose, onSubmit, editingField }: CustomFieldFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'text' as 'text' | 'number' | 'select' | 'boolean',
    required: false,
    options: ['']
  });

  useEffect(() => {
    if (editingField) {
      setFormData({
        name: editingField.name,
        type: editingField.type,
        required: editingField.required,
        options: editingField.options || ['']
      });
    } else {
      setFormData({
        name: '',
        type: 'text',
        required: false,
        options: ['']
      });
    }
  }, [editingField]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const field = {
      id: editingField?.id || `custom_${Date.now()}`,
      ...formData,
      options: formData.type === 'select' ? formData.options.filter(opt => opt.trim()) : undefined
    };
    onSubmit(field);
    onClose();
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingField ? 'Edit Custom Field' : 'Add Custom Field'}
            </h3>
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
                Field Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Field Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Select (Dropdown)</option>
                <option value="boolean">Boolean (Yes/No)</option>
              </select>
            </div>

            {formData.type === 'select' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="required" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Required field
              </label>
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
                {editingField ? 'Update' : 'Add'} Field
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}