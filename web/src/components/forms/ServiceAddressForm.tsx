import { ServiceAddress, STATE_OPTIONS } from '../../types/load';

interface ServiceAddressFormProps {
  serviceAddress: ServiceAddress;
  onChange: (field: keyof ServiceAddress, value: string) => void;
}

export default function ServiceAddressForm({ serviceAddress, onChange }: ServiceAddressFormProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Service Address</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
          <input
            type="text"
            required
            value={serviceAddress.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
            placeholder="ACME Distribution"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Person</label>
          <input
            type="text"
            required
            value={serviceAddress.contact}
            onChange={(e) => onChange('contact', e.target.value)}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
            placeholder="John Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
          <input
            type="tel"
            required
            value={serviceAddress.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            value={serviceAddress.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
            placeholder="john@acme.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
          <input
            type="text"
            required
            value={serviceAddress.street}
            onChange={(e) => onChange('street', e.target.value)}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
            placeholder="123 Main St"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
          <input
            type="text"
            required
            value={serviceAddress.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
            placeholder="Dallas"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
          <select
            required
            value={serviceAddress.state}
            onChange={(e) => onChange('state', e.target.value)}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
          >
            <option value="">Select State</option>
            {STATE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP Code</label>
          <input
            type="text"
            required
            value={serviceAddress.zip}
            onChange={(e) => onChange('zip', e.target.value)}
            className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
            placeholder="75201"
          />
        </div>
      </div>
    </div>
  );
}
