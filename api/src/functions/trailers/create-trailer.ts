// POST /trailers - Create a new trailer
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../../lib/auth.js';
import { putItem } from '../../lib/db.js';
import { validateBody, createTrailerSchema } from '../../lib/validation.js';
import { randomUUID } from 'crypto';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin']);

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const body = JSON.parse(event.body || '{}');
    const trailerData = validateBody(createTrailerSchema, body);

    const trailerId = randomUUID();
    const now = new Date().toISOString();

    // Calculate compliance fields
    const isRegistrationCurrent = trailerData.registrationExpiresAt
      ? new Date(trailerData.registrationExpiresAt) > new Date()
      : false;
    const isInspectionCurrent = trailerData.inspectionExpiresAt
      ? new Date(trailerData.inspectionExpiresAt) > new Date()
      : false;

    const trailer = {
      PK: `ORG#${orgId}`,
      SK: `TRAILER#${trailerId}`,
      trailerId,
      orgId,
      ...trailerData,
      isRegistrationCurrent,
      isInspectionCurrent,
      createdAt: now,
      updatedAt: now,
      createdBy: authContext.userId,
    };

    await putItem(trailer);

    logRequest(authContext, 'CREATE_TRAILER', {
      status: 'success',
      trailerId,
    });

    return {
      statusCode: 201,
      body: JSON.stringify(trailer),
    };
  } catch (error: any) {
    console.error('Error creating trailer:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
