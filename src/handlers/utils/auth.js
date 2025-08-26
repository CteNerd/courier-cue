const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Cache for JWKS client
let jwksClientInstance;

function getJwksClient() {
    if (!jwksClientInstance) {
        const region = process.env.AWS_REGION || 'us-east-1';
        const userPoolId = process.env.USER_POOL_ID;
        jwksClientInstance = jwksClient({
            jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
            cache: true,
            cacheMaxAge: 600000, // 10 minutes
        });
    }
    return jwksClientInstance;
}

function getSigningKey(kid) {
    return new Promise((resolve, reject) => {
        getJwksClient().getSigningKey(kid, (err, key) => {
            if (err) {
                reject(err);
            } else {
                resolve(key.getPublicKey());
            }
        });
    });
}

async function verifyToken(token) {
    try {
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded || !decoded.header || !decoded.header.kid) {
            throw new Error('Invalid token structure');
        }

        const signingKey = await getSigningKey(decoded.header.kid);
        const verified = jwt.verify(token, signingKey, {
            algorithms: ['RS256'],
            issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.USER_POOL_ID}`,
            tokenUse: 'access'
        });

        return verified;
    } catch (error) {
        console.error('Token verification failed:', error);
        throw error;
    }
}

function extractUserInfo(event) {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
    }
    
    const token = authHeader.substring(7);
    return verifyToken(token);
}

function hasRole(userInfo, requiredRoles) {
    if (!Array.isArray(requiredRoles)) {
        requiredRoles = [requiredRoles];
    }
    
    const userGroups = userInfo['cognito:groups'] || [];
    return requiredRoles.some(role => userGroups.includes(role));
}

function requireAuth(requiredRoles = []) {
    return async (event) => {
        try {
            const userInfo = await extractUserInfo(event);
            
            if (requiredRoles.length > 0 && !hasRole(userInfo, requiredRoles)) {
                return {
                    statusCode: 403,
                    headers: getCorsHeaders(),
                    body: JSON.stringify({
                        error: 'Insufficient permissions',
                        message: `Required role(s): ${requiredRoles.join(', ')}`
                    })
                };
            }
            
            return { userInfo };
        } catch (error) {
            return {
                statusCode: 401,
                headers: getCorsHeaders(),
                body: JSON.stringify({
                    error: 'Unauthorized',
                    message: error.message
                })
            };
        }
    };
}

function getCorsHeaders() {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    };
}

function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: getCorsHeaders(),
        body: JSON.stringify(body)
    };
}

module.exports = {
    requireAuth,
    hasRole,
    getCorsHeaders,
    createResponse
};