import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { Navigation } from '../components/Navigation';
import { useSettings } from '../hooks/useSettings';
import { SettingsTab } from '../types/settings';
import SettingsTabNavigation from '../components/settings/SettingsTabNavigation';
import CompanyInfoSettings from '../components/settings/CompanyInfoSettings';
import OperationsSettings from '../components/settings/OperationsSettings';
import NotificationsSettings from '../components/settings/NotificationsSettings';
import LoadManagementSettings from '../components/settings/LoadManagementSettings';
import BillingSettings from '../components/settings/BillingSettings';
import IntegrationsSettings from '../components/settings/IntegrationsSettings';
import CustomFieldsSettings from '../components/settings/CustomFieldsSettings';

export default function SettingsPage() {
  const { currentUser } = useUser();
  const { 
    settings, 
    hasChanges, 
    saveSettings, 
    updateNestedSettings, 
    loading, 
    saving, 
    error 
  } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!currentUser) return null;

  // Permission check - only admins and coadmins can access settings
  if (currentUser.role === 'driver') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access settings.</p>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    try {
      setSaveError(null);
      await saveSettings();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const renderTabContent = () => {
    const commonProps = { settings, setSettings: () => {}, setHasChanges: () => {}, updateNestedSettings };

    switch (activeTab) {
      case 'company':
        return <CompanyInfoSettings {...commonProps} />;
      case 'operations':
        return <OperationsSettings {...commonProps} />;
      case 'notifications':
        return <NotificationsSettings {...commonProps} />;
      case 'loads':
        return <LoadManagementSettings {...commonProps} />;
      case 'billing':
        return <BillingSettings {...commonProps} />;
      case 'integrations':
        return <IntegrationsSettings {...commonProps} />;
      case 'custom':
        return <CustomFieldsSettings {...commonProps} />;
      default:
        return <CompanyInfoSettings {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-6"></div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your organization's configuration and preferences
              </p>
            </div>
            {hasChanges && (
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            )}
          </div>

          {/* Error Display */}
          {(error || saveError) && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error || saveError}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setSaveError(null)}
                      className="text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 pt-6">
              <SettingsTabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <div className="px-6 py-6">
              {renderTabContent()}
            </div>
          </div>

          {hasChanges && (
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Unsaved Changes
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>You have unsaved changes. Don't forget to save your settings.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
