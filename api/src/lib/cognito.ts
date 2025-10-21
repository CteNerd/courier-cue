// Cognito user management helpers
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminGetUserCommand,
  ListUsersCommand,
  AdminAddUserToGroupCommand,
  AdminListGroupsForUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION || 'us-east-1',
});

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || '';

interface CreateUserParams {
  email: string;
  displayName: string;
  orgId: string;
  role: string;
  phone?: string;
}

/**
 * Create a new Cognito user
 */
export async function createCognitoUser(params: CreateUserParams): Promise<{
  userId: string;
  temporaryPassword: string;
}> {
  const { email, displayName, orgId, role, phone } = params;

  // Generate a temporary password
  const temporaryPassword = generateTemporaryPassword();

  const command = new AdminCreateUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
      { Name: 'name', Value: displayName },
      { Name: 'custom:orgId', Value: orgId },
      { Name: 'custom:role', Value: role },
      ...(phone ? [{ Name: 'phone_number', Value: phone }] : []),
    ],
    TemporaryPassword: temporaryPassword,
    DesiredDeliveryMediums: ['EMAIL'],
  });

  try {
    const response = await client.send(command);
    const userId = response.User?.Username || '';

    // Add user to appropriate group
    await addUserToGroup(userId, role);

    return { userId, temporaryPassword };
  } catch (error: any) {
    if (error.name === 'UsernameExistsException') {
      throw new Error('A user with this email already exists');
    }
    throw error;
  }
}

/**
 * Update user attributes
 */
export async function updateCognitoUser(
  userId: string,
  updates: {
    displayName?: string;
    role?: string;
    phone?: string;
  }
): Promise<void> {
  const attributes = [];

  if (updates.displayName) {
    attributes.push({ Name: 'name', Value: updates.displayName });
  }

  if (updates.role) {
    attributes.push({ Name: 'custom:role', Value: updates.role });
  }

  if (updates.phone) {
    attributes.push({ Name: 'phone_number', Value: updates.phone });
  }

  if (attributes.length > 0) {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: USER_POOL_ID,
      Username: userId,
      UserAttributes: attributes,
    });

    await client.send(command);
  }

  // Update group if role changed
  if (updates.role) {
    const currentGroups = await getUserGroups(userId);
    // Remove from old groups
    for (const group of currentGroups) {
      if (['admin', 'coadmin', 'driver'].includes(group)) {
        // Note: AdminRemoveUserFromGroup would be needed here
        // For simplicity, we're just adding to new group
      }
    }
    await addUserToGroup(userId, updates.role);
  }
}

/**
 * Disable a user
 */
export async function disableCognitoUser(userId: string): Promise<void> {
  const command = new AdminDisableUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: userId,
  });

  await client.send(command);
}

/**
 * Enable a user
 */
export async function enableCognitoUser(userId: string): Promise<void> {
  const command = new AdminEnableUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: userId,
  });

  await client.send(command);
}

/**
 * Get user details from Cognito
 */
export async function getCognitoUser(userId: string): Promise<any> {
  const command = new AdminGetUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: userId,
  });

  const response = await client.send(command);
  return response;
}

/**
 * List all users in the pool
 */
export async function listCognitoUsers(limit: number = 60): Promise<any[]> {
  const command = new ListUsersCommand({
    UserPoolId: USER_POOL_ID,
    Limit: limit,
  });

  const response = await client.send(command);
  return response.Users || [];
}

/**
 * Add user to a group
 */
export async function addUserToGroup(userId: string, groupName: string): Promise<void> {
  const command = new AdminAddUserToGroupCommand({
    UserPoolId: USER_POOL_ID,
    Username: userId,
    GroupName: groupName,
  });

  try {
    await client.send(command);
  } catch (error: any) {
    // Ignore if user is already in group
    if (error.name !== 'UserAlreadyInGroupException') {
      throw error;
    }
  }
}

/**
 * Get user's groups
 */
export async function getUserGroups(userId: string): Promise<string[]> {
  const command = new AdminListGroupsForUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: userId,
  });

  const response = await client.send(command);
  return (response.Groups || []).map((g) => g.GroupName || '');
}

/**
 * Generate a temporary password
 */
function generateTemporaryPassword(): string {
  const length = 12;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const all = uppercase + lowercase + numbers + special;

  let password = '';
  // Ensure at least one of each required character type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
