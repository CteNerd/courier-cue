// POST /loads/{id}/email - Send receipt email
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, canAccessLoad, logRequest } from '../lib/auth.js';
import { getLoad, getSignature, getUser, getOrg } from '../lib/db.js';
import { sendReceiptEmail } from '../lib/email.js';
import { getDownloadUrl, getReceiptS3Key } from '../lib/s3.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin', 'coadmin', 'driver']);

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

    // Check access permissions
    if (!canAccessLoad(authContext, load, 'read')) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Access denied to this load' }),
      };
    }

    // Check if signature exists
    const signature = await getSignature(orgId, loadId);
    if (!signature) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No signature found for this load' }),
      };
    }

    // Get org and driver details
    const org = await getOrg(orgId);
    const driver = load.assignedDriverId
      ? await getUser(orgId, load.assignedDriverId)
      : null;

    if (!org) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Organization not found' }),
      };
    }

    // Get shipper email
    const shipperEmail = load.serviceAddress?.email;
    if (!shipperEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No email address found for shipper in service address',
        }),
      };
    }

    // Generate receipt URL
    const receiptS3Key = getReceiptS3Key(orgId, loadId);
    const receiptUrl = await getDownloadUrl(receiptS3Key, 7 * 24 * 3600); // 7 days

    // Send email
    await sendReceiptEmail({
      to: shipperEmail,
      cc: org.accountingCc || [],
      orgName: org.orgName || 'Unknown Organization',
      loadId: load.loadId,
      shipperName: load.serviceAddress?.contact || 'Customer',
      driverName: driver?.displayName || 'Unknown Driver',
      signedAt: signature.signedAt,
      receiptUrl,
      emailFrom: org.emailFrom,
    });

    logRequest(authContext, 'SEND_RECEIPT_EMAIL', {
      status: 'success',
      loadId,
      to: shipperEmail,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Receipt email sent successfully',
        to: shipperEmail,
      }),
    };
  } catch (error: any) {
    console.error('Error sending receipt email:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
