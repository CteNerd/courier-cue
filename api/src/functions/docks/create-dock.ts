// POST /docks - Create a new dock
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../../lib/auth.js';
import { putItem } from '../../lib/db.js';
import { validateBody, createDockSchema } from '../../lib/validation.js';
import { randomUUID } from 'crypto';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin']);

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const body = JSON.parse(event.body || '{}');
    const dockData = validateBody(createDockSchema, body);

    const dockId = randomUUID();
    const now = new Date().toISOString();

    const dock = {
      PK: `ORG#${orgId}`,
      SK: `DOCK#${dockId}`,
      dockId,
      orgId,
      ...dockData,
      createdAt: now,
      updatedAt: now,
      createdBy: authContext.userId,
    };

    await putItem(dock);

    logRequest(authContext, 'CREATE_DOCK', {
      status: 'success',
      dockId,
    });

    return {
      statusCode: 201,
      body: JSON.stringify(dock),
    };
  } catch (error: any) {
    console.error('Error creating dock:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
