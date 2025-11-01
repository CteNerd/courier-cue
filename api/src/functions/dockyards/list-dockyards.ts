// GET /dockyards - List all dock yards for the org
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../../lib/auth.js';
import { getOrgDockYards } from '../../lib/db.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin', 'driver']);

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const dockyards = await getOrgDockYards(orgId);

    logRequest(authContext, 'LIST_DOCKYARDS', {
      status: 'success',
      count: dockyards.length,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ dockyards }),
    };
  } catch (error: any) {
    console.error('Error listing dock yards:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
