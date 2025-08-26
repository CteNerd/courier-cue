# Development Guide

This guide covers local development setup and workflows.

## Prerequisites

- Node.js 20+
- AWS CLI configured
- AWS SAM CLI installed
- Docker (for SAM local)

## Backend Development

### Setup
```bash
cd src/handlers
npm install
```

### Local API Server
```bash
# Start SAM local API (from project root)
sam local start-api --port 3000

# In another terminal, test the health endpoint
curl http://localhost:3000/health
```

### Adding New Lambda Functions

1. Create new handler file in `src/handlers/`
2. Add function to `template.yaml`
3. Test locally with SAM

Example function in `template.yaml`:
```yaml
NewFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: src/handlers/
    Handler: new-function.handler
    Events:
      Api:
        Type: Api
        Properties:
          RestApiId: !Ref Api
          Path: /api/v1/new-endpoint
          Method: GET
```

### Environment Variables

Lambda functions have access to:
- `TABLE_NAME`: DynamoDB table name
- `USER_POOL_ID`: Cognito User Pool ID
- `USER_POOL_CLIENT_ID`: Cognito Client ID

## Frontend Development

### Setup
```bash
cd web
npm install
```

### Development Server
```bash
# Start Vite dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create `.env.local` for local development:
```env
VITE_API_URL=http://localhost:3000
VITE_USER_POOL_ID=your-local-pool-id
VITE_USER_POOL_CLIENT_ID=your-local-client-id
VITE_USER_POOL_DOMAIN=https://your-domain.auth.region.amazoncognito.com
```

### Adding New Components

1. Create component in `src/components/`
2. Add route in `App.tsx` if needed
3. Import and use

Example component:
```tsx
// src/components/NewComponent.tsx
import React from 'react'

const NewComponent = () => {
  return (
    <div>
      <h2>New Component</h2>
    </div>
  )
}

export default NewComponent
```

## Code Quality

### Linting and Formatting

Backend:
```bash
cd src/handlers
npm run lint    # ESLint
npm run format  # Prettier
```

Frontend:
```bash
cd web
npm run lint    # ESLint + TypeScript
npm run format  # Prettier
```

### Testing

Backend:
```bash
cd src/handlers
npm test
```

Frontend:
```bash
cd web
npm test
```

## Database Development

### DynamoDB Local

For advanced local development, you can run DynamoDB locally:

```bash
# Install DynamoDB Local
npm install -g dynamodb-local

# Start DynamoDB Local
dynamodb-local

# Configure SAM to use local DynamoDB
sam local start-api --docker-network sam-local
```

### Table Design

The foundation uses a single-table design:
- **PK** (Partition Key): Entity type and ID
- **SK** (Sort Key): Entity subtype or timestamp

Example access patterns:
```
User: PK="USER#123", SK="PROFILE"
Order: PK="ORDER#456", SK="METADATA"
Driver Location: PK="DRIVER#789", SK="LOCATION#2025-01-15T10:30:00Z"
```

## API Development

### Adding New Endpoints

1. Create handler function
2. Add to SAM template
3. Test locally
4. Deploy via GitHub Actions

### CORS Configuration

CORS is configured in the SAM template. Update if needed:

```yaml
Api:
  Type: AWS::Serverless::Api
  Properties:
    Cors:
      AllowMethods: "'GET,POST,PUT,DELETE,OPTIONS'"
      AllowHeaders: "'Content-Type,Authorization'"
      AllowOrigin: "'*'"
```

### Authentication

Use Cognito JWT tokens for protected endpoints:

```javascript
// Example protected handler
exports.handler = async (event) => {
  const token = event.headers.Authorization?.replace('Bearer ', '')
  
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No token provided' })
    }
  }
  
  // Verify token with Cognito
  // ... validation logic
  
  return {
    statusCode: 200,
    body: JSON.stringify({ data: 'Protected data' })
  }
}
```

## Deployment Workflow

### Local Testing
1. Test backend with SAM local
2. Test frontend with Vite dev server
3. Run linting and formatting
4. Test integration between frontend/backend

### CI/CD Pipeline
1. Push to main branch
2. Backend deploys via SAM
3. Frontend builds with env vars
4. GitHub Pages publishes PWA

### Debugging Deployments

Check GitHub Actions logs:
1. Go to Actions tab in GitHub
2. Click on failed workflow
3. Expand failed step
4. Check CloudFormation events in AWS console

## Performance Optimization

### Frontend
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with tree shaking

### Backend
- Use connection pooling for DynamoDB
- Implement proper caching headers
- Monitor Lambda cold starts

## Security Best Practices

### Environment Variables
- Never commit secrets to git
- Use GitHub Secrets for CI/CD
- Use AWS Parameter Store for runtime secrets

### API Security
- Validate all inputs
- Use Cognito for authentication
- Implement proper CORS
- Log security events

### Frontend Security
- Sanitize user inputs
- Use HTTPS only
- Implement CSP headers
- Validate tokens client-side
