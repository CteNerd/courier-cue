// GET /org/settings - Get organization settings
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../../lib/auth.js';
import { getOrg } from '../../lib/db.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin']);

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const org = await getOrg(orgId);

    if (!org) {
      logRequest(authContext, 'GET_ORG_SETTINGS', { status: 'not_found' });
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Organization not found' }),
      };
    }

    // Transform DynamoDB structure to frontend format
    const settings = org.settings || {};
    const company = settings.company || {};
    const operations = settings.operations || {};
    const notifications = settings.notifications || {};
    const defaultLoadSettings = operations.defaultLoadSettings || {};
    
    const transformedSettings = {
      companyName: company.name || '',
      companyAddress: company.address || {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      },
      companyPhone: company.phone || '',
      companyEmail: company.email || '',
      website: company.website || '',
      operatingHours: operations.operatingHours || {
        start: '09:00',
        end: '17:00',
        timezone: 'America/Chicago',
      },
      deliveryRadius: operations.deliveryRadius || 50,
      emailNotifications: notifications.emailNotifications || {
        loadCreated: true,
        loadAssigned: true,
        loadCompleted: true,
        driverCheckedIn: false,
        urgentAlerts: true,
      },
      smsNotifications: notifications.smsNotifications || {
        loadAssigned: false,
        loadCompleted: false,
        urgentAlerts: false,
      },
      autoAssignLoads: defaultLoadSettings.autoAssign || false,
      requireSignature: defaultLoadSettings.requireSignature || true,
      allowPartialDeliveries: defaultLoadSettings.allowPartialDeliveries || false,
      maxLoadsPerDriver: defaultLoadSettings.maxLoadsPerDriver || 10,
      defaultHourlyRate: operations.defaultHourlyRate || 25,
      mileageRate: operations.mileageRate || 0.65,
      currency: operations.currency || 'USD',
      gpsTracking: operations.gpsTracking || true,
      routeOptimization: operations.routeOptimization || false,
      customFields: settings.customFields || [],
    };

    logRequest(authContext, 'GET_ORG_SETTINGS', { status: 'success' });

    return {
      statusCode: 200,
      body: JSON.stringify({ settings: transformedSettings }),
    };
  } catch (error: any) {
    console.error('Error getting org settings:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
