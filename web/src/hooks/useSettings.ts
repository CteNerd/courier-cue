import { useState } from 'react';
import { OrganizationSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../data/defaultSettings';

export const useSettings = () => {
  const [settings, setSettings] = useState<OrganizationSettings>(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('organizationSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [hasChanges, setHasChanges] = useState(false);

  const saveSettings = () => {
    localStorage.setItem('organizationSettings', JSON.stringify(settings));
    setHasChanges(false);
    console.log('Settings saved:', settings);
  };

  const updateSettings = (newSettings: Partial<OrganizationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setHasChanges(true);
  };

  const updateNestedSettings = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
    setHasChanges(true);
  };

  return {
    settings,
    setSettings,
    hasChanges,
    setHasChanges,
    saveSettings,
    updateSettings,
    updateNestedSettings
  };
};