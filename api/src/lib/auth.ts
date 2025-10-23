// Authentication and authorization helpers
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as jose from 'jose';

export interface JWTClaims {
  sub: string; // userId
  email: string;
  'custom:orgId': string;
  'custom:role': string;
  'cognito:groups'?: string[];
}

export interface AuthContext {
  userId: string;
  email: string;
  orgId: string;
  role: string;
  groups: string[];
}

/**
 * Extract and verify JWT from Authorization header
 */
export async function extractJWT(event: APIGatewayProxyEventV2): Promise<JWTClaims> {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  
  if (!authHeader) {
    throw new AuthError('Missing Authorization header', 401);
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    throw new AuthError('Invalid Authorization header format', 401);
  }

  try {
    // In production, you'd verify the JWT signature with Cognito's JWKS
    // For now, we'll decode without verification (verification happens at API Gateway)
    const decoded = jose.decodeJwt(token);
    
    return decoded as unknown as JWTClaims;
  } catch (error) {
    throw new AuthError('Invalid JWT token', 401);
  }
}

/**
 * Get auth context from event
 */
export function getAuthContext(event: APIGatewayProxyEventV2): AuthContext {
  // API Gateway JWT authorizer adds claims to requestContext
  const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;
  
  if (!claims) {
    throw new AuthError('No authorization context found', 401);
  }

  return {
    userId: claims.sub as string,
    email: claims.email as string,
    orgId: (claims['custom:orgId'] as string) || '',
    role: (claims['custom:role'] as string) || 'driver',
    groups: claims['cognito:groups']
      ? (claims['cognito:groups'] as string).split(',')
      : [],
  };
}

/**
 * Verify orgId matches the authenticated user's orgId
 * This is critical for multi-tenant security
 */
export function verifyOrgAccess(authContext: AuthContext, orgId: string): void {
  // Platform admins can access any org
  if (authContext.groups.includes('platformAdmin')) {
    return;
  }

  if (authContext.orgId !== orgId) {
    throw new AuthError('Access denied to this organization', 403);
  }
}

/**
 * Check if user has required role
 */
export function requireRole(authContext: AuthContext, allowedRoles: string[]): void {
  // log authContext for debugging
  console.log('Auth context:', authContext);

  const hasRole =
    allowedRoles.includes(authContext.role) ||
    authContext.groups.some((group) => allowedRoles.includes(group));

  if (!hasRole) {
    throw new AuthError(
      `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      403
    );
  }
}

/**
 * Check if user can access a specific load
 */
export function canAccessLoad(
  authContext: AuthContext,
  load: { assignedDriverId?: string },
  action: 'read' | 'write' = 'read'
): boolean {
  // Admins and co-admins can always access
  if (['admin', 'coadmin'].includes(authContext.role) || 
      authContext.groups.includes('admin') || 
      authContext.groups.includes('coadmin')) {
    return true;
  }

  // Drivers can only access their assigned loads
  if (authContext.role === 'driver' || authContext.groups.includes('driver')) {
    if (action === 'read') {
      return load.assignedDriverId === authContext.userId;
    }
    // Drivers can only write to their assigned loads
    if (action === 'write') {
      return load.assignedDriverId === authContext.userId;
    }
  }

  return false;
}

/**
 * Custom auth error
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 403
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Middleware to extract auth context and attach to event
 */
export function withAuth(handler: Function) {
  return async (event: APIGatewayProxyEventV2) => {
    try {
      const authContext = getAuthContext(event);
      // Attach auth context to event for use in handlers
      (event as any).authContext = authContext;
      return handler(event);
    } catch (error) {
      if (error instanceof AuthError) {
        return {
          statusCode: error.statusCode,
          body: JSON.stringify({ error: error.message }),
        };
      }
      throw error;
    }
  };
}

/**
 * Log structured request data for audit trail
 */
export function logRequest(
  authContext: AuthContext | null,
  action: string,
  details: Record<string, any> = {}
): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      userId: authContext?.userId,
      orgId: authContext?.orgId,
      role: authContext?.role,
      action,
      ...details,
    })
  );
}
