import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { DarkModeToggle } from '../components/DarkModeToggle';

interface OrganizationSettings {
  // Company Information
  companyName: string;
  companyAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  companyPhone: string;
  companyEmail: string;
  website: string;
  
  // Operational Settings
  operatingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  deliveryRadius: number; // in miles
  
  // Notification Settings
  emailNotifications: {
    loadCreated: boolean;
    loadAssigned: boolean;
    loadCompleted: boolean;
    driverCheckedIn: boolean;
    urgentAlerts: boolean;
  };
  smsNotifications: {
    loadAssigned: boolean;
    loadCompleted: boolean;
    urgentAlerts: boolean;
  };
  
  // Load Management Settings
  autoAssignLoads: boolean;
  requireSignature: boolean;
  allowPartialDeliveries: boolean;
  maxLoadsPerDriver: number;
  
  // Billing & Pricing
  defaultHourlyRate: number;
  mileageRate: number;
  currency: string;
  
  // Integration Settings
  gpsTracking: boolean;
  routeOptimization: boolean;
  
  // Custom Fields
  customFields: {
    id: string;
    name: string;
    type: 'text' | 'number' | 'select' | 'boolean';
    required: boolean;
    options?: string[];
  }[];
}

// Default settings
const DEFAULT_SETTINGS: OrganizationSettings = {
  companyName: 'Demo Organization',
  companyAddress: {
    street: '1234 Business Ave',
    city: 'Dallas',
    state: 'TX',
    zip: '75201',
    country: 'United States'
  },
  companyPhone: '(555) 123-4567',
  companyEmail: 'info@demo.com',
  website: 'https://demo.com',
  operatingHours: {
    start: '08:00',
    end: '18:00',
    timezone: 'America/Chicago'
  },
  deliveryRadius: 50,
  emailNotifications: {
    loadCreated: true,
    loadAssigned: true,
    loadCompleted: true,
    driverCheckedIn: false,
    urgentAlerts: true
  },
  smsNotifications: {
    loadAssigned: true,
    loadCompleted: false,
    urgentAlerts: true
  },
  autoAssignLoads: false,
  requireSignature: true,
  allowPartialDeliveries: false,
  maxLoadsPerDriver: 5,
  defaultHourlyRate: 25.00,
  mileageRate: 0.65,
  currency: 'USD',
  gpsTracking: true,
  routeOptimization: true,
  customFields: []
};

// Import Navigation component
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

interface CustomFieldFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (field: any) => void;
  editingField?: any;
}

function CustomFieldForm({ isOpen, onClose, onSubmit, editingField }: CustomFieldFormProps) {
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
  }, [editingField, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const field = {
      id: editingField?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      required: formData.required,
      ...(formData.type === 'select' ? { options: formData.options.filter(opt => opt.trim()) } : {})
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

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {editingField ? 'Edit Custom Field' : 'Add Custom Field'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Field Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Special Instructions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Field Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Select (Dropdown)</option>
                <option value="boolean">Yes/No</option>
              </select>
            </div>

            {formData.type === 'select' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Options</label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={`Option ${index + 1}`}
                      />
                      {formData.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.required}
                onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Required field
              </label>
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
                {editingField ? 'Update Field' : 'Add Field'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { currentUser } = useUser();
  const [settings, setSettings] = useState<OrganizationSettings>(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('organizationSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [activeTab, setActiveTab] = useState<'company' | 'operations' | 'notifications' | 'loads' | 'billing' | 'integrations' | 'custom'>('company');
  const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  if (!currentUser) return null;

  // Permission check - only admins and co-admins can access settings
  if (currentUser.role === 'driver') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access settings.</p>
        </div>
      </div>
    );
  }

  const saveSettings = () => {
    localStorage.setItem('organizationSettings', JSON.stringify(settings));
    setHasChanges(false);
    console.log('Settings saved:', settings);
    // Here you would typically send to your API
    alert('Settings saved successfully!');
  };

  const updateSettings = (field: keyof OrganizationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const updateNestedSettings = (section: keyof OrganizationSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const addCustomField = (field: any) => {
    setSettings(prev => ({
      ...prev,
      customFields: editingField 
        ? prev.customFields.map(f => f.id === field.id ? field : f)
        : [...prev.customFields, field]
    }));
    setHasChanges(true);
    setEditingField(null);
  };

  const deleteCustomField = (fieldId: string) => {
    if (window.confirm('Are you sure you want to delete this custom field?')) {
      setSettings(prev => ({
        ...prev,
        customFields: prev.customFields.filter(f => f.id !== fieldId)
      }));
      setHasChanges(true);
    }
  };

  const tabs = [
    { id: 'company', name: 'Company', icon: '🏢' },
    { id: 'operations', name: 'Operations', icon: '⚙️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'loads', name: 'Load Management', icon: '📦' },
    { id: 'billing', name: 'Billing', icon: '💰' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' },
    { id: 'custom', name: 'Custom Fields', icon: '📝' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Organization Settings</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Configure your organization preferences</p>
            </div>
            {hasChanges && (
              <button
                onClick={saveSettings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Save Changes
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'company' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Company Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                      <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => updateSettings('companyName', e.target.value)}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                      <input
                        type="tel"
                        value={settings.companyPhone}
                        onChange={(e) => updateSettings('companyPhone', e.target.value)}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => updateSettings('companyEmail', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Website</label>
                      <input
                        type="url"
                        value={settings.website}
                        onChange={(e) => updateSettings('website', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Company Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                        <input
                          type="text"
                          value={settings.companyAddress.street}
                          onChange={(e) => updateNestedSettings('companyAddress', 'street', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          value={settings.companyAddress.city}
                          onChange={(e) => updateNestedSettings('companyAddress', 'city', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                          type="text"
                          value={settings.companyAddress.state}
                          onChange={(e) => updateNestedSettings('companyAddress', 'state', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                        <input
                          type="text"
                          value={settings.companyAddress.zip}
                          onChange={(e) => updateNestedSettings('companyAddress', 'zip', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                          type="text"
                          value={settings.companyAddress.country}
                          onChange={(e) => updateNestedSettings('companyAddress', 'country', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'operations' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Operational Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Operating Hours Start</label>
                      <input
                        type="time"
                        value={settings.operatingHours.start}
                        onChange={(e) => updateNestedSettings('operatingHours', 'start', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Operating Hours End</label>
                      <input
                        type="time"
                        value={settings.operatingHours.end}
                        onChange={(e) => updateNestedSettings('operatingHours', 'end', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Timezone</label>
                      <select
                        value={settings.operatingHours.timezone}
                        onChange={(e) => updateNestedSettings('operatingHours', 'timezone', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Delivery Radius (miles)</label>
                    <input
                      type="number"
                      value={settings.deliveryRadius}
                      onChange={(e) => updateSettings('deliveryRadius', parseInt(e.target.value))}
                      className="mt-1 block w-32 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Email Notifications</h4>
                    <div className="space-y-3">
                      {Object.entries(settings.emailNotifications).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateNestedSettings('emailNotifications', key, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">SMS Notifications</h4>
                    <div className="space-y-3">
                      {Object.entries(settings.smsNotifications).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => updateNestedSettings('smsNotifications', key, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'loads' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Load Management Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.autoAssignLoads}
                        onChange={(e) => updateSettings('autoAssignLoads', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Auto-assign loads to available drivers
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.requireSignature}
                        onChange={(e) => updateSettings('requireSignature', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Require signature for delivery confirmation
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.allowPartialDeliveries}
                        onChange={(e) => updateSettings('allowPartialDeliveries', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Allow partial deliveries
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Maximum loads per driver</label>
                      <input
                        type="number"
                        value={settings.maxLoadsPerDriver}
                        onChange={(e) => updateSettings('maxLoadsPerDriver', parseInt(e.target.value))}
                        className="mt-1 block w-32 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Billing & Pricing Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Default Hourly Rate</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={settings.defaultHourlyRate}
                          onChange={(e) => updateSettings('defaultHourlyRate', parseFloat(e.target.value))}
                          className="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mileage Rate</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={settings.mileageRate}
                          onChange={(e) => updateSettings('mileageRate', parseFloat(e.target.value))}
                          className="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Currency</label>
                      <select
                        value={settings.currency}
                        onChange={(e) => updateSettings('currency', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Integration Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.gpsTracking}
                        onChange={(e) => updateSettings('gpsTracking', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Enable GPS tracking for drivers
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.routeOptimization}
                        onChange={(e) => updateSettings('routeOptimization', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Enable route optimization
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'custom' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Custom Fields</h3>
                    <button
                      onClick={() => setShowCustomFieldForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Add Custom Field
                    </button>
                  </div>
                  
                  {settings.customFields.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No custom fields configured</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Add custom fields to collect additional information on loads
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {settings.customFields.map(field => (
                        <div key={field.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{field.name}</h4>
                            <p className="text-sm text-gray-500">
                              Type: {field.type} {field.required && '(Required)'}
                            </p>
                            {field.options && (
                              <p className="text-sm text-gray-500">
                                Options: {field.options.join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingField(field);
                                setShowCustomFieldForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteCustomField(field.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CustomFieldForm
        isOpen={showCustomFieldForm}
        onClose={() => {
          setShowCustomFieldForm(false);
          setEditingField(null);
        }}
        onSubmit={addCustomField}
        editingField={editingField}
      />
    </div>
  );
}
