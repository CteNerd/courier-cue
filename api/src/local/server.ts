import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock JWT middleware for local development
app.use((req: any, _res: any, next: any) => {
  // Mock authentication for local development
  req.user = {
    userId: 'admin-123',
    orgId: 'demo-org',
    email: 'admin@demo.com',
    role: 'admin'
  };
  next();
});

// Environment variables for local development
process.env.AWS_REGION = 'us-east-1';
process.env.ENV = 'dev';
process.env.TABLE_NAME = 'couriercue-dev-main';
process.env.ASSETS_BUCKET = 'couriercue-dev-assets';
process.env.EMAIL_FROM = 'noreply@demo.com';
process.env.AWS_ENDPOINT_URL = 'http://localhost:4566'; // LocalStack
process.env.DYNAMODB_ENDPOINT = 'http://localhost:8000'; // DynamoDB Local

// Mock AWS SDK endpoints for local development
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';

// Function to dynamically load and invoke Lambda functions
async function invokeLambdaFunction(functionPath: string, event: any) {
  try {
    const functionModule = await import(functionPath);
    const handler = functionModule.handler;
    
    if (!handler) {
      throw new Error(`No handler export found in ${functionPath}`);
    }

    const context = {
      requestId: Math.random().toString(36).substring(7),
      functionName: functionPath.split('/').pop()?.replace('.js', ''),
      remainingTimeInMillis: () => 30000,
    };

    const result = await handler(event, context);
    return result;
  } catch (error) {
    console.error(`Error invoking function ${functionPath}:`, error);
    throw error;
  }
}

// Route mapping
const routes = [
  // Organization routes
  { method: 'GET', path: '/org/settings', handler: '../functions/org/get-settings.js' },
  { method: 'PATCH', path: '/org/settings', handler: '../functions/org/update-settings.js' },
  { method: 'GET', path: '/org/users', handler: '../functions/org/list-users.js' },
  { method: 'POST', path: '/org/users/invite', handler: '../functions/org/invite-user.js' },
  
  // Load routes
  { method: 'POST', path: '/loads', handler: '../functions/loads/create-load.js' },
  { method: 'GET', path: '/loads', handler: '../functions/loads/list-loads.js' },
  { method: 'GET', path: '/loads/my', handler: '../functions/loads/my-loads.js' },
  { method: 'GET', path: '/loads/:id', handler: '../functions/loads/get-load.js' },
  { method: 'PATCH', path: '/loads/:id', handler: '../functions/loads/update-load.js' },
  { method: 'POST', path: '/loads/:id/status', handler: '../functions/loads/update-status.js' },
  { method: 'POST', path: '/loads/:id/signature/:type/presign', handler: '../functions/loads/signature-presign.js' },
  { method: 'POST', path: '/loads/:id/signature/:type/confirm', handler: '../functions/loads/signature-confirm.js' },
  { method: 'GET', path: '/loads/:id/receipt.pdf', handler: '../functions/loads/get-receipt.js' },
  { method: 'POST', path: '/loads/:id/email', handler: '../functions/loads/send-email.js' },
];

// Register routes
for (const route of routes) {
  const { method, path, handler } = route;
  const handlerPath = join(__dirname, handler);
  
  app[method.toLowerCase() as keyof typeof app](path, async (req: any, res: any) => {
    try {
      // Create API Gateway-like event
      const event = {
        httpMethod: method,
        path: req.path,
        pathParameters: req.params,
        queryStringParameters: req.query,
        headers: req.headers,
        body: req.body ? JSON.stringify(req.body) : null,
        requestContext: {
          authorizer: {
            jwt: {
              claims: req.user
            }
          }
        }
      };

      const result = await invokeLambdaFunction(handlerPath, event);
      
      if (result.statusCode) {
        res.status(result.statusCode);
        if (result.headers) {
          Object.entries(result.headers).forEach(([key, value]) => {
            res.set(key, value as string);
          });
        }
        res.send(result.body);
      } else {
        res.json(result);
      }
    } catch (error) {
      console.error('Route error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}

// Health check
app.get('/health', (_req: any, res: any) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CourierCue API development server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: development`);
  console.log(`📂 DynamoDB: http://localhost:8000`);
  console.log(`☁️  LocalStack: http://localhost:4566`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        orgId: string;
        email: string;
        role: string;
      };
    }
  }
}