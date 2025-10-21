import { SettingsProps } from '../../types/settings';

export default function NotificationsSettings({ settings, updateNestedSettings }: SettingsProps & { updateNestedSettings: (path: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Load Created</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Notify when new loads are created</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications.loadCreated}
              onChange={(e) => updateNestedSettings('emailNotifications.loadCreated', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Load Assigned</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Notify when loads are assigned to drivers</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications.loadAssigned}
              onChange={(e) => updateNestedSettings('emailNotifications.loadAssigned', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Load Completed</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Notify when loads are completed</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications.loadCompleted}
              onChange={(e) => updateNestedSettings('emailNotifications.loadCompleted', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Driver Check-in</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Notify when drivers check in</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications.driverCheckedIn}
              onChange={(e) => updateNestedSettings('emailNotifications.driverCheckedIn', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Urgent Alerts</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Notify for urgent situations</div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications.urgentAlerts}
              onChange={(e) => updateNestedSettings('emailNotifications.urgentAlerts', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">SMS Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Load Assigned</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">SMS when loads are assigned</div>
            </div>
            <input
              type="checkbox"
              checked={settings.smsNotifications.loadAssigned}
              onChange={(e) => updateNestedSettings('smsNotifications.loadAssigned', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Load Completed</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">SMS when loads are completed</div>
            </div>
            <input
              type="checkbox"
              checked={settings.smsNotifications.loadCompleted}
              onChange={(e) => updateNestedSettings('smsNotifications.loadCompleted', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Urgent Alerts</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">SMS for urgent situations</div>
            </div>
            <input
              type="checkbox"
              checked={settings.smsNotifications.urgentAlerts}
              onChange={(e) => updateNestedSettings('smsNotifications.urgentAlerts', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}