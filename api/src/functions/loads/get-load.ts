// GET /loads/{id} - Get load details
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, verifyOrgAccess, canAccessLoad, logRequest } from '../lib/auth';
import { getLoad } from '../lib/db';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    const loadId = event.pathParameters?.id;

    if (!loadId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Load ID is required' }),
      };
    }

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const load = await getLoad(orgId, loadId);

    if (!load) {
      logRequest(authContext, 'GET_LOAD', { status: 'not_found', loadId });
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Load not found' }),
      };
    }

    // Check access permissions
    if (!canAccessLoad(authContext, load, 'read')) {
      logRequest(authContext, 'GET_LOAD', { status: 'forbidden', loadId });
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Access denied to this load' }),
      };
    }

    logRequest(authContext, 'GET_LOAD', { status: 'success', loadId });

    return {
      statusCode: 200,
      body: JSON.stringify(load),
    };
  } catch (error: any) {
    console.error('Error getting load:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
