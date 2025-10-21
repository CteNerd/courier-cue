import { OrganizationSettings } from '../types/settings';

// Default settings
export const DEFAULT_SETTINGS: OrganizationSettings = {
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
  defaultHourlyRate: 25,
  mileageRate: 0.65,
  currency: 'USD',
  gpsTracking: true,
  routeOptimization: true,
  customFields: []
};