import { SettingsTab } from '../../types/settings';

interface SettingsTabNavigationProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

export default function SettingsTabNavigation({ activeTab, setActiveTab }: SettingsTabNavigationProps) {
  const tabs = [
    { id: 'company' as SettingsTab, name: 'Company', icon: '🏢' },
    { id: 'operations' as SettingsTab, name: 'Operations', icon: '⚙️' },
    { id: 'notifications' as SettingsTab, name: 'Notifications', icon: '🔔' },
    { id: 'loads' as SettingsTab, name: 'Load Management', icon: '📦' },
    { id: 'billing' as SettingsTab, name: 'Billing', icon: '💰' },
    { id: 'integrations' as SettingsTab, name: 'Integrations', icon: '🔗' },
    { id: 'custom' as SettingsTab, name: 'Custom Fields', icon: '🔧' },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}