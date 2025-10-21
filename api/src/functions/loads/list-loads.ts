// GET /loads - List loads with filters
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../../lib/auth.js';
import { getOrgLoads } from '../../lib/db.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin']);

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const queryParams = event.queryStringParameters || {};
    const { status, from, to, q } = queryParams;

    let loads = await getOrgLoads(orgId, from, to, status);

    // Client-side free-text search if query provided
    if (q) {
      const searchLower = q.toLowerCase();
      loads = loads.filter((load) => {
        const searchableFields = [
          load.loadId,
          load.serviceAddress?.name,
          load.serviceAddress?.city,
          load.serviceAddress?.contact,
          load.notes,
        ].filter(Boolean);

        return searchableFields.some((field) =>
          String(field).toLowerCase().includes(searchLower)
        );
      });
    }

    logRequest(authContext, 'LIST_LOADS', {
      status: 'success',
      count: loads.length,
      filters: { status, from, to, q },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ loads }),
    };
  } catch (error: any) {
    console.error('Error listing loads:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
