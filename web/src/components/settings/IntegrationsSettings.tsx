import { SettingsProps } from '../../types/settings';

export default function IntegrationsSettings({ settings, updateNestedSettings }: SettingsProps & { updateNestedSettings: (path: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">GPS Tracking</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Enable real-time GPS tracking for drivers</div>
          </div>
          <input
            type="checkbox"
            checked={settings.gpsTracking}
            onChange={(e) => updateNestedSettings('gpsTracking', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Route Optimization</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Automatically optimize delivery routes</div>
          </div>
          <input
            type="checkbox"
            checked={settings.routeOptimization}
            onChange={(e) => updateNestedSettings('routeOptimization', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Integration Status</h4>
        <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <p>• GPS Tracking: {settings.gpsTracking ? '✅ Enabled' : '❌ Disabled'}</p>
          <p>• Route Optimization: {settings.routeOptimization ? '✅ Enabled' : '❌ Disabled'}</p>
          <p className="text-xs mt-2">Note: These features require additional API keys and configuration.</p>
        </div>
      </div>
    </div>
  );
}