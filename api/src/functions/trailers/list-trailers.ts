// GET /trailers - List all trailers for the org
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../../lib/auth.js';
import { getOrgTrailers } from '../../lib/db.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin', 'driver']);

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const trailers = await getOrgTrailers(orgId);

    // Calculate compliance for each trailer
    const now = new Date();
    const trailersWithCompliance = trailers.map((trailer) => {
      const isRegistrationCurrent = trailer.registrationExpiresAt
        ? new Date(trailer.registrationExpiresAt) > now
        : false;
      const isInspectionCurrent = trailer.inspectionExpiresAt
        ? new Date(trailer.inspectionExpiresAt) > now
        : false;

      const compliance =
        isRegistrationCurrent && isInspectionCurrent ? 'COMPLIANT' : 'NEEDS_UPDATING';

      return {
        ...trailer,
        isRegistrationCurrent,
        isInspectionCurrent,
        compliance,
      };
    });

    logRequest(authContext, 'LIST_TRAILERS', {
      status: 'success',
      count: trailers.length,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ trailers: trailersWithCompliance }),
    };
  } catch (error: any) {
    console.error('Error listing trailers:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
