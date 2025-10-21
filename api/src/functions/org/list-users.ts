// GET /org/users - List organization users
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../lib/auth.js';
import { getOrgUsers } from '../lib/db.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin']);

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const users = await getOrgUsers(orgId);

    logRequest(authContext, 'LIST_ORG_USERS', {
      status: 'success',
      count: users.length,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ users }),
    };
  } catch (error: any) {
    console.error('Error listing org users:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
