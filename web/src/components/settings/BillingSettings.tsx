import { SettingsProps } from '../../types/settings';

export default function BillingSettings({ settings, updateNestedSettings }: SettingsProps & { updateNestedSettings: (path: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Hourly Rate ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={settings.defaultHourlyRate}
            onChange={(e) => updateNestedSettings('defaultHourlyRate', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mileage Rate ($/mile)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={settings.mileageRate}
            onChange={(e) => updateNestedSettings('mileageRate', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => updateNestedSettings('currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Rate Information</h4>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p>• Default hourly rate applies to new drivers unless specified otherwise</p>
          <p>• Mileage rate is used for distance-based billing calculations</p>
          <p>• Rates can be overridden on a per-driver or per-load basis</p>
        </div>
      </div>
    </div>
  );
}