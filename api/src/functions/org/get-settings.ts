// GET /org/settings - Get organization settings
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../lib/auth';
import { getOrg } from '../lib/db';

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

    logRequest(authContext, 'GET_ORG_SETTINGS', { status: 'success' });

    return {
      statusCode: 200,
      body: JSON.stringify(org),
    };
  } catch (error: any) {
    console.error('Error getting org settings:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
