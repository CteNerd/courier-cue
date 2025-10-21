// GET /loads/{id}/receipt.pdf - Generate and serve PDF receipt
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, canAccessLoad, logRequest } from '../lib/auth';
import { getLoad, getSignature, getUser, getOrg } from '../lib/db';
import { generateReceipt } from '../lib/pdf';
import { putObject, getReceiptS3Key, getObject } from '../lib/s3';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
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

    const receiptS3Key = getReceiptS3Key(orgId, loadId);

    // Try to get cached PDF first
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await getObject(receiptS3Key);
    } catch (error) {
      // Generate PDF if not cached
      pdfBuffer = await generateReceipt({
        org: {
          orgName: org.orgName || 'Unknown Organization',
          legalName: org.legalName,
          logoUrl: org.logoUrl,
        },
        load: {
          loadId: load.loadId,
          serviceAddress: load.serviceAddress,
          items: load.items || [],
          unloadLocation: load.unloadLocation,
          shipVia: load.shipVia,
          trailer: load.trailer,
          notes: load.notes,
        },
        signature: {
          signerName: signature.signerName,
          signedAt: signature.signedAt,
          geo: signature.geo,
          s3Key: signature.s3Key,
        },
        driver: {
          displayName: driver?.displayName || 'Unknown Driver',
          userId: driver?.userId || 'unknown',
        },
      });

      // Cache the PDF
      await putObject(receiptS3Key, pdfBuffer, 'application/pdf');
    }

    logRequest(authContext, 'GET_RECEIPT', {
      status: 'success',
      loadId,
    });

    // Return PDF as base64
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${loadId}.pdf"`,
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error: any) {
    console.error('Error generating receipt:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
