// GET /docks - List all docks for the org
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../../lib/auth.js';
import { getOrgDocks } from '../../lib/db.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin', 'driver']);

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const docks = await getOrgDocks(orgId);

    logRequest(authContext, 'LIST_DOCKS', {
      status: 'success',
      count: docks.length,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ docks }),
    };
  } catch (error: any) {
    console.error('Error listing docks:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
