// POST /loads/{id}/signature/shipper/confirm - Confirm signature upload
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, canAccessLoad, logRequest } from '../../lib/auth.js';
import { getLoad, saveSignature, updateItem, createLoadEvent } from '../../lib/db.js';
import { validateBody, signatureConfirmSchema } from '../../lib/validation.js';
import { verifyS3KeyOwnership, getObject, calculateHash } from '../../lib/s3.js';

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
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: 'You can only confirm signatures for loads assigned to you',
        }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { s3Key, signerName, signedAt, lat, lng, accuracy } = validateBody(
      signatureConfirmSchema,
      body
    );

    // Verify S3 key belongs to this org
    if (!verifyS3KeyOwnership(s3Key, orgId)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid S3 key' }),
      };
    }

    // Calculate hash of signature file
    let sha256 = '';
    try {
      const signatureBuffer = await getObject(s3Key);
      sha256 = calculateHash(signatureBuffer);
    } catch (error) {
      console.error('Failed to retrieve signature file:', error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Signature file not found or invalid' }),
      };
    }

    // Save signature record
    const signature: any = {
      signerName,
      signedAt,
      s3Key,
      sha256,
    };

    if (lat !== undefined && lng !== undefined) {
      signature.geo = { lat, lng, accuracy };
    }

    await saveSignature(orgId, loadId, signature);

    // Update load with signature key
    await updateItem(`ORG#${orgId}`, `LOAD#${loadId}`, {
      signatureKey: s3Key,
    });

    // Create audit event
    await createLoadEvent(orgId, loadId, {
      type: 'SIGNATURE_CAPTURED',
      actorId: authContext.userId,
      meta: { signerName, hasGeo: !!signature.geo },
    });

    logRequest(authContext, 'CONFIRM_SIGNATURE', {
      status: 'success',
      loadId,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Signature confirmed successfully',
        signature,
      }),
    };
  } catch (error: any) {
    console.error('Error confirming signature:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
