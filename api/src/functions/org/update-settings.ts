// PATCH /org/settings - Update organization settings
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../../lib/auth.js';
import { updateItem } from '../../lib/db.js';
import { validateBody, updateOrgSettingsSchema } from '../../lib/validation.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin']);

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const body = JSON.parse(event.body || '{}');
    const updates = validateBody(updateOrgSettingsSchema, body);

    const updatedOrg = await updateItem(`ORG#${orgId}`, `ORG#${orgId}`, updates);

    logRequest(authContext, 'UPDATE_ORG_SETTINGS', {
      status: 'success',
      updates: Object.keys(updates),
    });

    return {
      statusCode: 200,
      body: JSON.stringify(updatedOrg),
    };
  } catch (error: any) {
    console.error('Error updating org settings:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
