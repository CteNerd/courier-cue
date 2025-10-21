export interface OrganizationSettings {
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

export type SettingsTab = 'company' | 'operations' | 'notifications' | 'loads' | 'billing' | 'integrations' | 'custom';

export interface SettingsProps {
  settings: OrganizationSettings;
  setSettings: React.Dispatch<React.SetStateAction<OrganizationSettings>>;
  setHasChanges: (hasChanges: boolean) => void;
}