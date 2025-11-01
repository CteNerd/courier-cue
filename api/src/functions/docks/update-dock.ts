// PATCH /docks/{id} - Update a dock
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../../lib/auth.js';
import { getDock, updateItem } from '../../lib/db.js';
import { validateBody, updateDockSchema } from '../../lib/validation.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin']);

    const dockId = event.pathParameters?.id;
    if (!dockId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Dock ID is required' }),
      };
    }

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const dock = await getDock(orgId, dockId);
    if (!dock) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Dock not found' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const updates = validateBody(updateDockSchema, body);

    const updatedDock = await updateItem(`ORG#${orgId}`, `DOCK#${dockId}`, updates);

    logRequest(authContext, 'UPDATE_DOCK', {
      status: 'success',
      dockId,
      updates: Object.keys(updates),
    });

    return {
      statusCode: 200,
      body: JSON.stringify(updatedDock),
    };
  } catch (error: any) {
    console.error('Error updating dock:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
