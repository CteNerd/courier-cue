// POST /org/users/invite - Invite a new user
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, verifyOrgAccess, logRequest } from '../lib/auth.js';
import { putItem } from '../lib/db.js';
import { validateBody, inviteUserSchema } from '../lib/validation.js';
import { createCognitoUser } from '../lib/cognito.js';
import { sendInviteEmail } from '../lib/email.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['admin']);

    const orgId = authContext.orgId;
    verifyOrgAccess(authContext, orgId);

    const body = JSON.parse(event.body || '{}');
    const { email, displayName, role, phone } = validateBody(inviteUserSchema, body);

    // Create Cognito user
    const { userId, temporaryPassword } = await createCognitoUser({
      email,
      displayName,
      orgId,
      role,
      phone,
    });

    // Create user record in DynamoDB
    const userRecord = {
      PK: `ORG#${orgId}`,
      SK: `USER#${userId}`,
      userId,
      email,
      displayName,
      role,
      phone,
      isDisabled: false,
      createdAt: new Date().toISOString(),
      createdBy: authContext.userId,
      // GSI1 for email lookup
      GSI1PK: `USER#${email}`,
      GSI1SK: `ORG#${orgId}`,
    };

    await putItem(userRecord);

    // Send invite email
    const loginUrl = process.env.WEB_URL || 'http://localhost:5173';
    await sendInviteEmail({
      to: email,
      displayName,
      orgName: 'Your Organization', // TODO: Get from org settings
      temporaryPassword,
      loginUrl,
    });

    logRequest(authContext, 'INVITE_USER', {
      status: 'success',
      invitedUserId: userId,
      role,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'User invited successfully',
        userId,
        email,
      }),
    };
  } catch (error: any) {
    console.error('Error inviting user:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
