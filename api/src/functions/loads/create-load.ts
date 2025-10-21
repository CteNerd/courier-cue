// POST /loads - Create a new load
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../lib/auth.js';
import { putItem, createLoadEvent } from '../lib/db.js';
import { validateBody, createLoadSchema } from '../lib/validation.js';
import { randomUUID } from 'crypto';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin']);

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const body = JSON.parse(event.body || '{}');
    const loadData = validateBody(createLoadSchema, body);

    const loadId = randomUUID();
    const now = new Date().toISOString();
    const dateKey = now.split('T')[0]; // yyyy-mm-dd

    const load = {
      PK: `ORG#${orgId}`,
      SK: `LOAD#${loadId}`,
      loadId,
      orgId,
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
      createdBy: authContext.userId,
      ...loadData,
      // GSI4 for org history
      GSI4PK: `ORG#${orgId}#LOADS`,
      GSI4SK: `${dateKey}#DRAFT#${loadId}`,
    };

    await putItem(load);

    // Create audit event
    await createLoadEvent(orgId, loadId, {
      type: 'LOAD_CREATED',
      actorId: authContext.userId,
      meta: { status: 'DRAFT' },
    });

    logRequest(authContext, 'CREATE_LOAD', { status: 'success', loadId });

    return {
      statusCode: 201,
      body: JSON.stringify(load),
    };
  } catch (error: any) {
    console.error('Error creating load:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
