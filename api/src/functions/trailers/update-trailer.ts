// PATCH /trailers/{id} - Update a trailer
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../../lib/auth.js';
import { getTrailer, updateItem } from '../../lib/db.js';
import { validateBody, updateTrailerSchema } from '../../lib/validation.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin']);

    const trailerId = event.pathParameters?.id;
    if (!trailerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Trailer ID is required' }),
      };
    }

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const trailer = await getTrailer(orgId, trailerId);
    if (!trailer) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Trailer not found' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const updates = validateBody(updateTrailerSchema, body);

    // Recalculate compliance fields if expiration dates are updated
    if (updates.registrationExpiresAt !== undefined) {
      (updates as any).isRegistrationCurrent = updates.registrationExpiresAt
        ? new Date(updates.registrationExpiresAt) > new Date()
        : false;
    }
    if (updates.inspectionExpiresAt !== undefined) {
      (updates as any).isInspectionCurrent = updates.inspectionExpiresAt
        ? new Date(updates.inspectionExpiresAt) > new Date()
        : false;
    }

    const updatedTrailer = await updateItem(`ORG#${orgId}`, `TRAILER#${trailerId}`, updates);

    logRequest(authContext, 'UPDATE_TRAILER', {
      status: 'success',
      trailerId,
      updates: Object.keys(updates),
    });

    return {
      statusCode: 200,
      body: JSON.stringify(updatedTrailer),
    };
  } catch (error: any) {
    console.error('Error updating trailer:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
