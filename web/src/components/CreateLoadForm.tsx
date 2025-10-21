import { useState } from 'react';
import { useUser, DEMO_USERS } from '../hooks/useUser';

interface LoadItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
}

interface ServiceAddress {
  name: string;
  contact: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface CreateLoadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (loadData: any) => void;
}

export default function CreateLoadForm({ isOpen, onClose, onSubmit }: CreateLoadFormProps) {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState({
    serviceAddress: {
      name: '',
      contact: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      state: '',
      zip: ''
    } as ServiceAddress,
    assignedDriverId: '',
    items: [
      { id: '1', description: '', qty: 1, unit: 'pallet' }
    ] as LoadItem[],
    notes: '',
    priority: 'normal' as 'low' | 'normal' | 'high'
  });

  const drivers = DEMO_USERS.filter(user => user.role === 'driver');

  if (!isOpen) return null;

  const handleAddressChange = (field: keyof ServiceAddress, value: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAddress: {
        ...prev.serviceAddress,
        [field]: value
      }
    }));
  };

  const handleItemChange = (index: number, field: keyof LoadItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now().toString(), description: '', qty: 1, unit: 'pallet' }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a load ID
    const loadId = `load-${Date.now().toString().slice(-3)}`;
    
    // Create the load data structure
    const loadData = {
      id: loadId,
      serviceAddress: formData.serviceAddress,
      items: formData.items.filter(item => item.description.trim() !== ''),
      assignedDriverId: formData.assignedDriverId || null,
      assignedDriverName: formData.assignedDriverId 
        ? drivers.find(d => d.userId === formData.assignedDriverId)?.displayName 
        : null,
      status: formData.assignedDriverId ? 'ASSIGNED' : 'PENDING',
      priority: formData.priority,
      notes: formData.notes,
      createdBy: currentUser?.userId,
      createdAt: new Date().toISOString(),
      orgId: currentUser?.orgId
    };

    onSubmit(loadData);
    
    // Reset form
    setFormData({
      serviceAddress: {
        name: '',
        contact: '',
        phone: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: ''
      },
      assignedDriverId: '',
      items: [{ id: '1', description: '', qty: 1, unit: 'pallet' }],
      notes: '',
      priority: 'normal'
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Create New Load</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Address Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Service Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    required
                    value={formData.serviceAddress.name}
                    onChange={(e) => handleAddressChange('name', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="ACME Distribution"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={formData.serviceAddress.contact}
                    onChange={(e) => handleAddressChange('contact', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.serviceAddress.phone}
                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.serviceAddress.email}
                    onChange={(e) => handleAddressChange('email', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="contact@acme.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    required
                    value={formData.serviceAddress.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="1234 Industrial Blvd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    required
                    value={formData.serviceAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Dallas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <select
                    required
                    value={formData.serviceAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select State</option>
                    <option value="TX">Texas</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="FL">Florida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={formData.serviceAddress.zip}
                    onChange={(e) => handleAddressChange('zip', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="75201"
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-900">Items to Deliver</h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={item.id} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Euro pallets, mixed pallets, etc."
                      />
                    </div>
                    <div className="w-20">
                      <label className="block text-sm font-medium text-gray-700">Qty</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-sm font-medium text-gray-700">Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="pallet">Pallet</option>
                        <option value="box">Box</option>
                        <option value="case">Case</option>
                        <option value="piece">Piece</option>
                      </select>
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 pb-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign to Driver (Optional)</label>
                <select
                  value={formData.assignedDriverId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedDriverId: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Unassigned (Pending)</option>
                  {drivers.map(driver => (
                    <option key={driver.userId} value={driver.userId}>
                      {driver.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'normal' | 'high' }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Special Instructions/Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Any special delivery instructions, access codes, etc."
              />
            </div>

            {/* Form Actions */}
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
                Create Load
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}