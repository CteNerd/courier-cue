# CourierCue API

Backend Lambda functions for CourierCue multi-tenant SaaS.

## Architecture

- **Runtime**: Node.js 20 with TypeScript
- **Framework**: AWS Lambda with Middy middleware
- **Database**: DynamoDB single-table design
- **Storage**: S3 for signatures, logos, PDFs
- **Email**: SES for delivery receipts
- **Auth**: Cognito JWT via API Gateway authorizer

## Project Structure

```
api/
├── src/
│   ├── functions/           # Lambda handlers
│   │   ├── org/             # Organization endpoints
│   │   ├── loads/           # Load endpoints
│   │   └── platform/        # Platform admin endpoints
│   ├── lib/                 # Shared libraries
│   │   ├── auth.ts          # Authentication & authorization
│   │   ├── db.ts            # DynamoDB helpers
│   │   ├── s3.ts            # S3 operations
│   │   ├── pdf.ts           # PDF generation
│   │   ├── email.ts         # SES email sending
│   │   ├── cognito.ts       # Cognito user management
│   │   └── validation.ts    # Zod schemas
│   └── local/               # Local development server
├── package.json
├── tsconfig.json
└── jest.config.ts
```

## Environment Variables

Create a `.env` file:

```bash
# AWS Configuration
AWS_REGION=us-east-1
REGION=us-east-1

# Environment
ENV=dev

# DynamoDB
TABLE_NAME=couriercue-dev-main

# S3
ASSETS_BUCKET=couriercue-dev-assets

# Cognito
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# Email
EMAIL_FROM=noreply@couriercue.app

# Web URL (for emails)
WEB_URL=http://localhost:5173
```

## Development

### Install Dependencies

```bash
pnpm install
```

### Run Locally

```bash
pnpm dev
```

This starts a local development server that emulates the API Gateway and Lambda environment.

### Build

```bash
pnpm build
```

Outputs bundled Lambda functions to `dist/functions/`.

### Type Check

```bash
pnpm typecheck
```

### Lint

```bash
pnpm lint
```

## Testing

### Run Unit Tests

```bash
pnpm test
```

### Run Integration Tests

Requires DynamoDB Local and LocalStack running:

```bash
# Start local services
docker compose -f ../docker/compose.local.yml up -d

# Run integration tests
pnpm test:int
```

### Coverage

Jest is configured with coverage thresholds:
- Global: 80% (lines, branches, functions, statements)

## API Endpoints

### Organization

- `GET /org/settings` - Get org settings (admin, coadmin)
- `PATCH /org/settings` - Update org settings (admin, coadmin)
- `GET /org/users` - List org users (admin, coadmin)
- `POST /org/users/invite` - Invite new user (admin)
- `PATCH /org/users/{userId}` - Update user (admin)

### Loads

- `POST /loads` - Create load (admin, coadmin)
- `GET /loads` - List loads with filters (admin, coadmin)
- `GET /loads/{id}` - Get load details (admin, coadmin, assigned driver)
- `PATCH /loads/{id}` - Update load (admin, coadmin)
- `GET /loads/my` - Get driver's assigned loads (driver)
- `POST /loads/{id}/status` - Update load status (driver)
- `POST /loads/{id}/signature/shipper/presign` - Get upload URL (driver)
- `POST /loads/{id}/signature/shipper/confirm` - Confirm signature (driver)
- `GET /loads/{id}/receipt.pdf` - Generate PDF receipt (all)
- `POST /loads/{id}/email` - Send receipt email (all)

### Platform Admin

- `GET /platform/orgs` - List all orgs (platform admin)
- `POST /platform/orgs` - Create org (platform admin)
- `PATCH /platform/orgs/{orgId}` - Update org (platform admin)

## Multi-Tenancy

All API endpoints enforce row-level security using `orgId` from JWT claims:

```typescript
const authContext = getAuthContext(event);
const orgId = authContext.orgId;
verifyOrgAccess(authContext, orgId);
```

Platform admins can access any org. Regular users can only access their own org.

## Role-Based Access Control

Roles are enforced at the route level:

```typescript
requireRole(authContext, ['admin', 'coadmin']);
```

Available roles:
- `platformAdmin` - Platform-level access
- `admin` - Full org access
- `coadmin` - Org access except some settings
- `driver` - Limited to assigned loads

## Deployment

Lambda functions are deployed via CloudFormation. The infrastructure stack (in `../infra/`) handles:

- Lambda function creation
- IAM roles and policies
- API Gateway routes
- Environment variables

To deploy:

```bash
# Build functions
pnpm build

# Deploy via CloudFormation
cd ../infra
aws cloudformation deploy \
  --template-file stack.yaml \
  --stack-name couriercue-dev \
  --parameter-overrides Env=dev \
  --capabilities CAPABILITY_NAMED_IAM
```

## Logging

All handlers use structured JSON logging:

```typescript
logRequest(authContext, 'ACTION_NAME', {
  status: 'success',
  additionalData: 'value',
});
```

Logs include:
- `timestamp`
- `userId`
- `orgId`
- `role`
- `action`
- Additional context

## Error Handling

All errors return consistent JSON responses:

```json
{
  "error": "Error message"
}
```

Status codes:
- `400` - Bad request / validation error
- `401` - Unauthorized
- `403` - Forbidden (wrong org or role)
- `404` - Not found
- `500` - Internal server error

## Security

- JWT validation at API Gateway level
- Row-level orgId verification in all handlers
- S3 key ownership verification
- Cognito groups for RBAC
- All S3 buckets have block public access
- Presigned URLs with short expiration (5 minutes for uploads, 7 days for downloads)

## Performance

- Lambda cold start optimization via bundling
- PDF caching in S3
- DynamoDB GSIs for efficient queries
- Minimal Lambda memory (128-512MB)
