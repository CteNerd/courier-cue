// PATCH /dockyards/{id} - Update a dock yard
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../../lib/auth.js';
import { getDockYard, updateItem } from '../../lib/db.js';
import { validateBody, updateDockYardSchema } from '../../lib/validation.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin']);

    const dockyardId = event.pathParameters?.id;
    if (!dockyardId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Dock Yard ID is required' }),
      };
    }

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const dockyard = await getDockYard(orgId, dockyardId);
    if (!dockyard) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Dock Yard not found' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const updates = validateBody(updateDockYardSchema, body);

    const updatedDockyard = await updateItem(`ORG#${orgId}`, `DOCKYARD#${dockyardId}`, updates);

    logRequest(authContext, 'UPDATE_DOCKYARD', {
      status: 'success',
      dockyardId,
      updates: Object.keys(updates),
    });

    return {
      statusCode: 200,
      body: JSON.stringify(updatedDockyard),
    };
  } catch (error: any) {
    console.error('Error updating dock yard:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
