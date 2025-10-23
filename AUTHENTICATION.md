# Authentication Setup Guide

## Local Development Authentication

For local development, the application uses a simplified authentication system that bypasses Cognito and works directly with DynamoDB.

### Demo Users (Pre-seeded)

The following users are automatically created when you run the seed script:

| Role | Email | Password | User ID |
|------|-------|----------|---------|
| Admin | admin@demo.com | admin123 | admin-123 |
| Co-Admin | coadmin@demo.com | coadmin123 | coadmin-456 |
| Driver 1 | driver1@demo.com | driver123 | driver1-789 |
| Driver 2 | driver2@demo.com | driver123 | driver2-101 |

### How It Works

1. **Frontend Login**: Use any of the demo credentials above
2. **JWT Generation**: Frontend generates a simple JWT token with user info
3. **API Authentication**: Local server parses the JWT and extracts user context
4. **Database Queries**: User context is used for role-based access control

### Setting Up Local Environment

1. Start the services:
   ```bash
   docker-compose -f docker/compose.local.yml up -d
   ```

2. Seed the database:
   ```bash
   ./docker/seed.sh
   ```

3. Start the API server:
   ```bash
   cd api && npm run dev
   ```

4. Start the frontend:
   ```bash
   cd web && npm run dev
   ```

5. Login with any demo credentials at http://localhost:5173

## Production Authentication

For production environments, the application uses **AWS Cognito** for authentication and authorization.

### Cognito Setup Requirements

#### 1. User Pool Configuration

Create a Cognito User Pool with the following settings:

```yaml
UserPool:
  Policies:
    PasswordPolicy:
      MinimumLength: 8
      RequireUppercase: true
      RequireLowercase: true
      RequireNumbers: true
      RequireSymbols: false
  
  AliasAttributes:
    - email
  
  AutoVerifiedAttributes:
    - email
  
  Schema:
    - Name: email
      AttributeDataType: String
      Required: true
      Mutable: true
    - Name: orgId
      AttributeDataType: String
      Required: true
      Mutable: false
    - Name: role
      AttributeDataType: String
      Required: true
      Mutable: true
```

#### 2. Custom Attributes

Add these custom attributes to your User Pool:

- `custom:orgId` (String) - Organization identifier
- `custom:role` (String) - User role (admin, coadmin, driver)

#### 3. User Pool Groups

Create the following groups in Cognito:

| Group Name | Description | Precedence |
|------------|-------------|------------|
| admin | Full system access | 1 |
| coadmin | Limited admin access | 2 |
| driver | Driver-only access | 3 |

#### 4. App Client Configuration

```yaml
UserPoolClient:
  ExplicitAuthFlows:
    - ALLOW_USER_PASSWORD_AUTH
    - ALLOW_USER_SRP_AUTH
    - ALLOW_REFRESH_TOKEN_AUTH
  
  ReadAttributes:
    - email
    - custom:orgId
    - custom:role
  
  WriteAttributes:
    - email
```

### Seeding Production Users

#### Option 1: AWS CLI

```bash
# Create a user
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username admin@yourcompany.com \
  --user-attributes \
    Name=email,Value=admin@yourcompany.com \
    Name=custom:orgId,Value=your-org-id \
    Name=custom:role,Value=admin \
  --temporary-password TempPass123! \
  --message-action SUPPRESS

# Add user to admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id YOUR_USER_POOL_ID \
  --username admin@yourcompany.com \
  --group-name admin
```

#### Option 2: Infrastructure as Code

Add to your CloudFormation/CDK:

```yaml
AdminUser:
  Type: AWS::Cognito::UserPoolUser
  Properties:
    UserPoolId: !Ref UserPool
    Username: admin@yourcompany.com
    UserAttributes:
      - Name: email
        Value: admin@yourcompany.com
      - Name: custom:orgId
        Value: your-org-id
      - Name: custom:role
        Value: admin
    MessageAction: SUPPRESS
```

### Environment Variables

Set these environment variables in your production deployment:

```bash
# Cognito Configuration
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=abcdef123456789
COGNITO_REGION=us-east-1

# API Configuration
API_BASE_URL=https://api.yourcompany.com
```

### JWT Token Validation

In production, the API Gateway validates JWT tokens automatically. The Lambda functions receive the decoded user context in the event:

```javascript
// Lambda function receives this context
const authContext = {
  userId: event.requestContext.authorizer.claims.sub,
  email: event.requestContext.authorizer.claims.email,
  orgId: event.requestContext.authorizer.claims['custom:orgId'],
  role: event.requestContext.authorizer.claims['custom:role']
};
```

## Troubleshooting

### Local Development Issues

1. **403 Errors**: Check that the API server logs show the correct user context
2. **Authentication Loops**: Clear localStorage and try logging in again
3. **Database Access**: Ensure DynamoDB Local is running on port 8000

### Production Issues

1. **Token Validation**: Check Cognito User Pool configuration
2. **Custom Attributes**: Ensure custom:orgId and custom:role are set
3. **Group Membership**: Verify users are in the correct Cognito groups
4. **API Gateway**: Check that JWT authorizer is configured correctly

## Migration from Demo to Production

1. **Export Demo Data**: Use DynamoDB export tools to save demo loads/settings
2. **Set Up Cognito**: Follow the production setup guide above
3. **Update Environment**: Switch `VITE_USE_MOCK_API` to `false`
4. **Deploy Infrastructure**: Use the CloudFormation templates in `/infra`
5. **Import Data**: Import saved data to production DynamoDB tables
6. **Test Authentication**: Verify all user roles work correctly