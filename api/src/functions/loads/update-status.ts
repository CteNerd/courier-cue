// POST /loads/{id}/status - Update load status (driver action)
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, canAccessLoad, logRequest } from '../../lib/auth.js';
import { getLoad, updateItem, createLoadEvent } from '../../lib/db.js';
import { validateBody, statusUpdateSchema } from '../../lib/validation.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['driver']);

    const loadId = event.pathParameters?.id;
    if (!loadId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Load ID is required' }),
      };
    }

    const orgId = authContext.orgId;
    const load = await getLoad(orgId, loadId);

    if (!load) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Load not found' }),
      };
    }

    // Check if driver can access this load
    if (!canAccessLoad(authContext, load as any, 'write')) {
      logRequest(authContext, 'UPDATE_LOAD_STATUS', {
        status: 'forbidden',
        loadId,
      });
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'You can only update loads assigned to you' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { action } = validateBody(statusUpdateSchema, body);

    // Validate status transition
    if (action === 'IN_TRANSIT' && load.status !== 'ASSIGNED') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Can only start transit from ASSIGNED status',
        }),
      };
    }

    if (action === 'DELIVERED' && load.status !== 'IN_TRANSIT') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Can only deliver from IN_TRANSIT status',
        }),
      };
    }

    const now = new Date().toISOString();
    const dateKey = now.split('T')[0];

    const updates: any = {
      status: action,
      GSI3PK: `STATUS#${action}`,
      GSI3SK: `${now}#LOAD#${loadId}`,
      GSI4SK: `${dateKey}#${action}#${loadId}`,
    };

    if (action === 'IN_TRANSIT') {
      updates.startedAt = now;
    } else if (action === 'DELIVERED') {
      updates.deliveredAt = now;
    }

    const updatedLoad = await updateItem(`ORG#${orgId}`, `LOAD#${loadId}`, updates);

    // Create audit event
    await createLoadEvent(orgId, loadId, {
      type: 'STATUS_CHANGED',
      actorId: authContext.userId,
      meta: { from: load.status, to: action },
    });

    logRequest(authContext, 'UPDATE_LOAD_STATUS', {
      status: 'success',
      loadId,
      action,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(updatedLoad),
    };
  } catch (error: any) {
    console.error('Error updating load status:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
