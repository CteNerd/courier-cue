// PATCH /loads/{id} - Update load
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../lib/auth';
import { getLoad, updateItem, createLoadEvent } from '../lib/db';
import { validateBody, updateLoadSchema } from '../lib/validation';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin']);

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
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Load not found' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const updates = validateBody(updateLoadSchema, body);

    // Update GSI keys if status or assignedDriverId changed
    if (updates.status) {
      const dateKey = new Date().toISOString().split('T')[0];
      updates.GSI3PK = `STATUS#${updates.status}`;
      updates.GSI3SK = `${new Date().toISOString()}#LOAD#${loadId}`;
      updates.GSI4SK = `${dateKey}#${updates.status}#${loadId}`;
    }

    if (updates.assignedDriverId) {
      const dateKey = new Date().toISOString().split('T')[0];
      updates.GSI2PK = `DRIVER#${updates.assignedDriverId}`;
      updates.GSI2SK = `${dateKey}#LOAD#${loadId}`;
    }

    const updatedLoad = await updateItem(`ORG#${orgId}`, `LOAD#${loadId}`, updates);

    // Create audit event
    await createLoadEvent(orgId, loadId, {
      type: 'LOAD_UPDATED',
      actorId: authContext.userId,
      meta: { updates: Object.keys(updates) },
    });

    logRequest(authContext, 'UPDATE_LOAD', {
      status: 'success',
      loadId,
      updates: Object.keys(updates),
    });

    return {
      statusCode: 200,
      body: JSON.stringify(updatedLoad),
    };
  } catch (error: any) {
    console.error('Error updating load:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
