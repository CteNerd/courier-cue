// GET /loads/{id} - Get load details
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, verifyOrgAccess, canAccessLoad, logRequest } from '../../lib/auth.js';
import { getLoad, getTrailer, getDock, getDockYard } from '../../lib/db.js';

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

    // Return 404 only if load doesn't exist in this org
    if (!load) {
      logRequest(authContext, 'GET_LOAD', { status: 'not_found', loadId });
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Load not found' }),
      };
    }

    // Check access permissions - return 403 if driver is not assigned
    if (!canAccessLoad(authContext, load as any, 'read')) {
      logRequest(authContext, 'GET_LOAD', { status: 'forbidden', loadId });
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Access denied to this load' }),
      };
    }

    // Expand load response with related entities
    const expandedLoad: any = { ...load };

    if (load.trailerId) {
      const trailer = await getTrailer(orgId, load.trailerId);
      if (trailer) {
        expandedLoad.trailer = trailer;
      }
    }

    if (load.trailerLocationId) {
      const dock = await getDock(orgId, load.trailerLocationId);
      if (dock) {
        expandedLoad.trailerLocation = dock;
      }
    }

    if (load.dockYardId) {
      const dockyard = await getDockYard(orgId, load.dockYardId);
      if (dockyard) {
        expandedLoad.dockyard = dockyard;
      }
    }

    logRequest(authContext, 'GET_LOAD', { status: 'success', loadId });

    return {
      statusCode: 200,
      body: JSON.stringify(expandedLoad),
    };
  } catch (error: any) {
    console.error('Error getting load:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
