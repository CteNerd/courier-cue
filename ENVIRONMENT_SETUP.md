# GitHub Secrets Configuration

This document explains how to configure GitHub Secrets for automated deployment of CourierCue.

## Required GitHub Secrets

### For Development Environment (`dev` environment)

1. **`AWS_DEPLOY_ROLE_ARN`** (already configured)
   - AWS IAM role ARN for deployment access
   - Example: `arn:aws:iam::123456789012:role/github-actions-deploy-role`

2. **`VITE_API_BASE_URL`**
   - Base URL for the API Gateway
   - Example: `https://abc123def.execute-api.us-east-1.amazonaws.com`
   - Get from CloudFormation output: `ApiBaseUrl`

3. **`VITE_COGNITO_USER_POOL_ID`**
   - Cognito User Pool ID
   - Example: `us-east-1_ABCdef123`
   - Get from CloudFormation output: `UserPoolId`

4. **`VITE_COGNITO_CLIENT_ID`**
   - Cognito User Pool Client ID
   - Example: `1a2b3c4d5e6f7g8h9i0j1k2l3m`
   - Get from CloudFormation output: `UserPoolClientId`

5. **`VITE_COGNITO_DOMAIN`**
   - Cognito Hosted UI Domain
   - Example: `https://couriercue-dev-123456789.auth.us-east-1.amazoncognito.com`
   - Get from CloudFormation output: `CognitoDomain`

### For Production Environment (`prod` environment)

Same secrets but with `_PROD` suffix:
- `VITE_API_BASE_URL_PROD`
- `VITE_COGNITO_USER_POOL_ID_PROD`
- `VITE_COGNITO_CLIENT_ID_PROD`
- `VITE_COGNITO_DOMAIN_PROD`

## How to Get the Values

After deploying the CloudFormation stack, get the outputs:

```bash
# Get all outputs
aws cloudformation describe-stacks \
  --stack-name couriercue-dev \
  --query 'Stacks[0].Outputs' \
  --output table

# Get specific values
aws cloudformation describe-stacks \
  --stack-name couriercue-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiBaseUrl`].OutputValue' \
  --output text
```

## Setting up GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each required secret
4. Enter the name and value for each secret

## Environment Configuration

### Local Development
- Copy `web/.env.example` to `web/.env`
- Set `VITE_LOCAL_DEV=true` for demo data
- Set `VITE_LOCAL_DEV=false` for real API calls

### CI/CD Pipeline
- Environment variables are injected during build from GitHub Secrets
- No `.env` files are committed to the repository
- Different values for dev/prod environments

## Security Notes

- Never commit actual environment values to the repository
- Use GitHub Secrets for all sensitive configuration
- The `.env` file is in `.gitignore` to prevent accidental commits
- Environment variables are only available during the build process

## Troubleshooting

### App Shows Demo Data Instead of Real API
- Check that GitHub Secrets are properly configured
- Verify the build process is using environment variables
- Ensure `VITE_LOCAL_DEV=false` in production builds

### Authentication Errors
- Verify Cognito configuration matches deployed infrastructure
- Check that callback URLs include the correct domain
- Ensure User Pool and Client IDs are correct

### API Calls Failing
- Confirm API Gateway URL is correct
- Check that CORS is properly configured
- Verify Lambda functions are deployed and working