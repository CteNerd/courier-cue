// GET /loads/my - Get driver's assigned loads
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getAuthContext, requireRole, logRequest } from '../lib/auth.js';
import { getDriverLoads } from '../lib/db.js';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const authContext = getAuthContext(event);
    requireRole(authContext, ['driver']);

    const queryParams = event.queryStringParameters || {};
    const { from, to } = queryParams;

    const loads = await getDriverLoads(authContext.userId, from, to);

    logRequest(authContext, 'GET_MY_LOADS', {
      status: 'success',
      count: loads.length,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ loads }),
    };
  } catch (error: any) {
    console.error('Error getting driver loads:', error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
