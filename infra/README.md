# CourierCue Infrastructure

This directory contains the CloudFormation infrastructure-as-code for CourierCue.

## Architecture

- **S3**: Two buckets per environment (web app hosting, assets storage)
- **DynamoDB**: Single-table design with 4 GSIs for multi-tenant data access
- **Cognito**: User Pool with custom attributes (orgId, role)
- **API Gateway**: HTTP API with JWT authorization
- **Lambda**: Node.js 20 functions for API handlers
- **SES**: Email delivery for signed receipts

## Environments

The stack supports two environments:
- **dev**: Development environment for internal testing
- **prod**: Production environment for customers

## Prerequisites

- AWS CLI configured with appropriate credentials
- AWS account with necessary permissions
- Node.js 20+ (for Lambda functions)

## Deployment

### Deploy to Dev

```bash
aws cloudformation deploy \
  --template-file infra/stack.yaml \
  --stack-name couriercue-dev \
  --parameter-overrides Env=dev \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

### Deploy to Prod

```bash
aws cloudformation deploy \
  --template-file infra/stack.yaml \
  --stack-name couriercue-prod \
  --parameter-overrides Env=prod \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1
```

## Post-Deployment Steps

After deploying the stack, you need to:

### 1. Create Cognito User Groups

```bash
# Get User Pool ID from stack outputs
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name couriercue-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text)

# Create groups
aws cognito-idp create-group \
  --user-pool-id $USER_POOL_ID \
  --group-name platformAdmin \
  --description "Platform administrators"

aws cognito-idp create-group \
  --user-pool-id $USER_POOL_ID \
  --group-name admin \
  --description "Organization administrators"

aws cognito-idp create-group \
  --user-pool-id $USER_POOL_ID \
  --group-name coadmin \
  --description "Organization co-administrators"

aws cognito-idp create-group \
  --user-pool-id $USER_POOL_ID \
  --group-name driver \
  --description "Drivers"
```

### 2. Configure SES

For **dev** environment, SES can remain in sandbox mode. For **prod**, you need to:

1. Request production access: https://console.aws.amazon.com/ses/home#/account
2. Verify sender email or domain
3. Set up DKIM and SPF records

### 3. Get Stack Outputs

```bash
aws cloudformation describe-stacks \
  --stack-name couriercue-dev \
  --query 'Stacks[0].Outputs' \
  --output table
```

Use these outputs to configure your `.env` files:

```bash
# .env.dev
AWS_REGION=us-east-1
ENV=dev
TABLE_NAME=<TableName from outputs>
ASSETS_BUCKET=<AssetsBucket from outputs>
API_BASE_URL=<ApiBaseUrl from outputs>
COGNITO_USER_POOL_ID=<UserPoolId from outputs>
COGNITO_CLIENT_ID=<UserPoolClientId from outputs>
COGNITO_DOMAIN=<CognitoDomain from outputs>
```

### 4. Deploy Web App

After building the frontend:

```bash
cd web
npm run build

# Upload to S3
aws s3 sync dist/ s3://couriercue-dev-web --delete
```

## Resource Naming Convention

All resources follow the pattern: `couriercue-<env>-<resource-type>`

Examples:
- `couriercue-dev-web` (S3 bucket for web app)
- `couriercue-prod-assets` (S3 bucket for assets)
- `couriercue-dev-main` (DynamoDB table)

## Parameters

- **Env** (required): Environment name (`dev` or `prod`)
- **EnableCloudFront** (optional): Enable CloudFront for the web app (default: `false`)
- **WebDomainName** (optional): Custom domain for web app

## Outputs

The stack exports the following outputs:

- **ApiBaseUrl**: Base URL for API calls
- **UserPoolId**: Cognito User Pool ID
- **UserPoolClientId**: Cognito Client ID
- **Region**: AWS Region
- **TableName**: DynamoDB table name
- **AssetsBucket**: S3 bucket for assets
- **WebBucketUrl**: S3 static website URL
- **WebBucket**: S3 web bucket name
- **CognitoDomain**: Cognito Hosted UI domain

## Validation

Validate the template before deploying:

```bash
aws cloudformation validate-template \
  --template-body file://infra/stack.yaml
```

## Cleanup

To delete the stack:

```bash
# Empty S3 buckets first
aws s3 rm s3://couriercue-dev-web --recursive
aws s3 rm s3://couriercue-dev-assets --recursive

# Delete stack
aws cloudformation delete-stack --stack-name couriercue-dev
```

## Cost Estimates

**Dev environment** (low usage):
- DynamoDB: ~$1-5/month (on-demand)
- Lambda: Free tier eligible
- S3: ~$1-5/month
- Cognito: Free tier (50,000 MAUs)
- API Gateway: ~$1-5/month

**Prod environment** (depends on usage):
- Scale with usage
- Consider reserved capacity for predictable workloads
