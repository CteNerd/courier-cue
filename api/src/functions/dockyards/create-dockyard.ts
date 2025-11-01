// POST /dockyards - Create a new dock yard
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../../lib/auth.js';
import { putItem } from '../../lib/db.js';
import { validateBody, createDockYardSchema } from '../../lib/validation.js';
import { randomUUID } from 'crypto';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin']);

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const body = JSON.parse(event.body || '{}');
    const dockyardData = validateBody(createDockYardSchema, body);

    const dockyardId = randomUUID();
    const now = new Date().toISOString();

    const dockyard = {
      PK: `ORG#${orgId}`,
      SK: `DOCKYARD#${dockyardId}`,
      dockyardId,
      orgId,
      ...dockyardData,
      createdAt: now,
      updatedAt: now,
      createdBy: authContext.userId,
    };

    await putItem(dockyard);

    logRequest(authContext, 'CREATE_DOCKYARD', {
      status: 'success',
      dockyardId,
    });

    return {
      statusCode: 201,
      body: JSON.stringify(dockyard),
    };
  } catch (error: any) {
    console.error('Error creating dock yard:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
