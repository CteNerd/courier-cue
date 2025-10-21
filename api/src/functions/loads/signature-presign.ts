// POST /loads/{id}/signature/shipper/presign - Get presigned URL for signature upload
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, canAccessLoad, logRequest } from '../lib/auth';
import { getLoad } from '../lib/db';
import { getSignatureUploadUrl } from '../lib/s3';

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
    if (!canAccessLoad(authContext, load, 'write')) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'You can only upload signatures for loads assigned to you' }),
      };
    }

    const { uploadUrl, s3Key } = await getSignatureUploadUrl(orgId, loadId);

    logRequest(authContext, 'GET_SIGNATURE_PRESIGN', {
      status: 'success',
      loadId,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl, s3Key }),
    };
  } catch (error: any) {
    console.error('Error getting signature presigned URL:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
