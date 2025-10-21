import { SettingsProps } from '../../types/settings';

export default function LoadManagementSettings({ settings, updateNestedSettings }: SettingsProps & { updateNestedSettings: (path: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-assign Loads</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Automatically assign loads to available drivers</div>
          </div>
          <input
            type="checkbox"
            checked={settings.autoAssignLoads}
            onChange={(e) => updateNestedSettings('autoAssignLoads', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Signature</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Require signature confirmation for deliveries</div>
          </div>
          <input
            type="checkbox"
            checked={settings.requireSignature}
            onChange={(e) => updateNestedSettings('requireSignature', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Partial Deliveries</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Allow drivers to complete partial deliveries</div>
          </div>
          <input
            type="checkbox"
            checked={settings.allowPartialDeliveries}
            onChange={(e) => updateNestedSettings('allowPartialDeliveries', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Maximum Loads per Driver
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={settings.maxLoadsPerDriver}
          onChange={(e) => updateNestedSettings('maxLoadsPerDriver', parseInt(e.target.value))}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Maximum number of active loads a driver can have at once
        </div>
      </div>
    </div>
  );
}