// DynamoDB helpers for single-table design
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || process.env.REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT,
});

export const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'couriercue-dev-main';

export interface DbItem {
  PK: string;
  SK: string;
  [key: string]: any;
}

/**
 * Get a single item by PK and SK
 */
export async function getItem(PK: string, SK: string): Promise<DbItem | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
    })
  );
  return (result.Item as DbItem) || null;
}

/**
 * Put an item into the table
 */
export async function putItem(item: DbItem): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );
}

/**
 * Update an item
 */
export async function updateItem(
  PK: string,
  SK: string,
  updates: Record<string, any>
): Promise<DbItem> {
  const updateExpression = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  for (const [key, value] of Object.entries(updates)) {
    updateExpression.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  }

  // Add updatedAt timestamp
  updateExpression.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes as DbItem;
}

/**
 * Delete an item
 */
export async function deleteItem(PK: string, SK: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
    })
  );
}

/**
 * Query items
 */
export async function query(params: Omit<QueryCommandInput, 'TableName'>): Promise<DbItem[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      ...params,
    })
  );
  return (result.Items as DbItem[]) || [];
}

/**
 * Query with pagination
 */
export async function queryPaginated(
  params: Omit<QueryCommandInput, 'TableName'>,
  lastEvaluatedKey?: Record<string, any>
): Promise<{ items: DbItem[]; lastEvaluatedKey?: Record<string, any> }> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      ExclusiveStartKey: lastEvaluatedKey,
      ...params,
    })
  );

  return {
    items: (result.Items as DbItem[]) || [],
    lastEvaluatedKey: result.LastEvaluatedKey,
  };
}

// Entity-specific helpers

/**
 * Get an organization
 */
export async function getOrg(orgId: string) {
  return getItem(`ORG#${orgId}`, `ORG#${orgId}`);
}

/**
 * Get a user by orgId and userId
 */
export async function getUser(orgId: string, userId: string) {
  return getItem(`ORG#${orgId}`, `USER#${userId}`);
}

/**
 * Get a user by email (uses GSI1)
 */
export async function getUserByEmail(email: string) {
  const items = await query({
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :gsi1pk',
    ExpressionAttributeValues: {
      ':gsi1pk': `USER#${email}`,
    },
    Limit: 1,
  });
  return items[0] || null;
}

/**
 * Get all users for an org
 */
export async function getOrgUsers(orgId: string) {
  return query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `ORG#${orgId}`,
      ':sk': 'USER#',
    },
  });
}

/**
 * Get a load
 */
export async function getLoad(orgId: string, loadId: string) {
  return getItem(`ORG#${orgId}`, `LOAD#${loadId}`);
}

/**
 * Get loads for a driver (uses GSI2)
 */
export async function getDriverLoads(
  driverId: string,
  fromDate?: string,
  toDate?: string
): Promise<DbItem[]> {
  const params: Omit<QueryCommandInput, 'TableName'> = {
    IndexName: 'GSI2',
    KeyConditionExpression: 'GSI2PK = :gsi2pk',
    ExpressionAttributeValues: {
      ':gsi2pk': `DRIVER#${driverId}`,
    },
  };

  if (fromDate && toDate) {
    params.KeyConditionExpression += ' AND GSI2SK BETWEEN :from AND :to';
    params.ExpressionAttributeValues![':from'] = `${fromDate}#LOAD#`;
    params.ExpressionAttributeValues![':to'] = `${toDate}#LOAD#~`;
  }

  return query(params);
}

/**
 * Get loads by status (uses GSI3)
 */
export async function getLoadsByStatus(status: string): Promise<DbItem[]> {
  return query({
    IndexName: 'GSI3',
    KeyConditionExpression: 'GSI3PK = :gsi3pk',
    ExpressionAttributeValues: {
      ':gsi3pk': `STATUS#${status}`,
    },
  });
}

/**
 * Get org loads (uses GSI4)
 */
export async function getOrgLoads(
  orgId: string,
  fromDate?: string,
  toDate?: string,
  status?: string
): Promise<DbItem[]> {
  const params: Omit<QueryCommandInput, 'TableName'> = {
    IndexName: 'GSI4',
    KeyConditionExpression: 'GSI4PK = :gsi4pk',
    ExpressionAttributeValues: {
      ':gsi4pk': `ORG#${orgId}#LOADS`,
    },
  };

  // Build the sort key condition
  if (fromDate && toDate && status) {
    params.KeyConditionExpression += ' AND GSI4SK BETWEEN :from AND :to';
    params.ExpressionAttributeValues![':from'] = `${fromDate}#${status}#`;
    params.ExpressionAttributeValues![':to'] = `${toDate}#${status}#~`;
  } else if (fromDate && toDate) {
    params.KeyConditionExpression += ' AND GSI4SK BETWEEN :from AND :to';
    params.ExpressionAttributeValues![':from'] = `${fromDate}#`;
    params.ExpressionAttributeValues![':to'] = `${toDate}#~`;
  }

  return query(params);
}

/**
 * Create a load event (audit trail)
 */
export async function createLoadEvent(
  orgId: string,
  loadId: string,
  event: {
    type: string;
    actorId: string;
    ip?: string;
    userAgent?: string;
    meta?: Record<string, any>;
  }
): Promise<void> {
  const timestamp = new Date().toISOString();
  await putItem({
    PK: `ORG#${orgId}#LOAD#${loadId}`,
    SK: `EVENT#${timestamp}`,
    ...event,
    timestamp,
  });
}

/**
 * Get load events
 */
export async function getLoadEvents(orgId: string, loadId: string): Promise<DbItem[]> {
  return query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `ORG#${orgId}#LOAD#${loadId}`,
      ':sk': 'EVENT#',
    },
  });
}

/**
 * Save signature
 */
export async function saveSignature(
  orgId: string,
  loadId: string,
  signature: {
    signerName: string;
    signedAt: string;
    geo?: { lat: number; lng: number; accuracy: number };
    s3Key: string;
    sha256: string;
  }
): Promise<void> {
  await putItem({
    PK: `ORG#${orgId}#LOAD#${loadId}`,
    SK: 'SIGN#SHIPPER',
    ...signature,
  });
}

/**
 * Get signature
 */
export async function getSignature(orgId: string, loadId: string) {
  return getItem(`ORG#${orgId}#LOAD#${loadId}`, 'SIGN#SHIPPER');
}

/**
 * Get a trailer
 */
export async function getTrailer(orgId: string, trailerId: string) {
  return getItem(`ORG#${orgId}`, `TRAILER#${trailerId}`);
}

/**
 * Get all trailers for an org
 */
export async function getOrgTrailers(orgId: string) {
  return query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `ORG#${orgId}`,
      ':sk': 'TRAILER#',
    },
  });
}

/**
 * Get a dock yard
 */
export async function getDockYard(orgId: string, dockYardId: string) {
  return getItem(`ORG#${orgId}`, `DOCKYARD#${dockYardId}`);
}

/**
 * Get all dock yards for an org
 */
export async function getOrgDockYards(orgId: string) {
  return query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `ORG#${orgId}`,
      ':sk': 'DOCKYARD#',
    },
  });
}

/**
 * Get a dock
 */
export async function getDock(orgId: string, dockId: string) {
  return getItem(`ORG#${orgId}`, `DOCK#${dockId}`);
}

/**
 * Get all docks for an org
 */
export async function getOrgDocks(orgId: string) {
  return query({
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `ORG#${orgId}`,
      ':sk': 'DOCK#',
    },
  });
}
