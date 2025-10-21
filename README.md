# CourierCue

Multi-tenant SaaS POC for digitizing delivery slips and driver workflow. Built for loading companies to manage pick-up/delivery operations.

## Features

- **Multi-tenant architecture** with row-level security
- **Role-based access control** (Platform Admin, Org Admin, Co-Admin, Driver)
- **Digital signature capture** with geolocation
- **PDF receipt generation** and email delivery
- **Real-time load status tracking**
- **Two deployment environments**: dev and prod

## Architecture

```
React SPA (S3 + CloudFront)
    │
Cognito User Pool (OAuth2 + JWT)
    │
API Gateway HTTP API
    │
Lambda Functions (Node.js 20 + TypeScript)
    │
DynamoDB (single-table) ── S3 (signatures, PDFs) ── SES (emails)
```

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- AWS CLI (for deployment)
- pnpm (recommended) or npm

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/CteNerd/courier-cue.git
cd courier-cue
```

2. **Install dependencies**

```bash
pnpm install
# or: npm install
```

3. **Start local services (DynamoDB, LocalStack, MailHog)**

```bash
docker compose -f docker/compose.local.yml up -d
```

4. **Seed local database**

```bash
pnpm dev:stack
# or: bash docker/seed.sh
```

5. **Start development servers**

In separate terminals:

```bash
# Terminal 1: API
cd api
pnpm dev

# Terminal 2: Web
cd web
pnpm dev
```

6. **Access the application**

- Web app: http://localhost:5173
- MailHog UI: http://localhost:8025
- DynamoDB Admin: http://localhost:8000
- LocalStack: http://localhost:4566

### Demo Credentials (Local)

- **Admin**: admin@demo.com
- **Driver**: driver@demo.com

## Project Structure

```
couriercue/
├── infra/              # CloudFormation infrastructure
├── api/                # Lambda backend functions
│   ├── src/functions/  # API handlers
│   └── src/lib/        # Shared libraries
├── web/                # React frontend
│   ├── src/pages/      # Page components
│   ├── src/components/ # UI components
│   └── src/lib/        # API client, utilities
├── docker/             # Local development setup
│   ├── compose.local.yml
│   └── seed.sh
└── .github/workflows/  # CI/CD pipelines
```

## Development

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

### Testing

```bash
# Run all tests
pnpm test

# Run integration tests
pnpm test:int
```

### Building

```bash
# Build API
cd api
pnpm build

# Build Web
cd web
pnpm build
```

## Deployment

### Deploy to Dev

```bash
cd infra
aws cloudformation deploy \
  --template-file stack.yaml \
  --stack-name couriercue-dev \
  --parameter-overrides Env=dev \
  --capabilities CAPABILITY_NAMED_IAM
```

### Deploy to Prod

```bash
cd infra
aws cloudformation deploy \
  --template-file stack.yaml \
  --stack-name couriercue-prod \
  --parameter-overrides Env=prod \
  --capabilities CAPABILITY_NAMED_IAM
```

See [infra/README.md](infra/README.md) for detailed deployment instructions.

## Environment Variables

### API (.env)

```bash
AWS_REGION=us-east-1
ENV=dev
TABLE_NAME=couriercue-dev-main
ASSETS_BUCKET=couriercue-dev-assets
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@couriercue.app
```

### Web (.env)

```bash
VITE_API_BASE_URL=https://api.couriercue.app
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=https://couriercue-dev-xxxxx.auth.us-east-1.amazoncognito.com
```

## API Endpoints

### Organization
- `GET /org/settings` - Get org settings
- `PATCH /org/settings` - Update org settings
- `GET /org/users` - List users
- `POST /org/users/invite` - Invite user

### Loads
- `POST /loads` - Create load
- `GET /loads` - List loads
- `GET /loads/{id}` - Get load details
- `PATCH /loads/{id}` - Update load
- `POST /loads/{id}/status` - Update status (driver)
- `POST /loads/{id}/signature/shipper/presign` - Get upload URL
- `POST /loads/{id}/signature/shipper/confirm` - Confirm signature
- `GET /loads/{id}/receipt.pdf` - Get PDF receipt
- `POST /loads/{id}/email` - Send receipt email

See [api/README.md](api/README.md) for complete API documentation.

## Security

- **Multi-tenancy**: All data isolated by `orgId` from JWT
- **Row-level security**: Every query validates org access
- **JWT authentication**: Via Cognito + API Gateway authorizer
- **RBAC**: Role-based permissions enforced at route level
- **S3 security**: Block public access, presigned URLs only
- **HTTPS only**: All traffic encrypted

## Testing Strategy

- **Unit tests**: Pure functions, validators, components
- **Integration tests**: API + DynamoDB Local + LocalStack
- **E2E tests**: Full user flows (Playwright)
- **Coverage gates**: 80% global, 90% for auth/security modules

## CI/CD

- **ci.yml**: Lint, typecheck, test, coverage on all PRs
- **deploy.yml**: 
  - Auto-deploy to `dev` on merge to `main`
  - Manual approval for `prod` deployment on release tags

## Documentation

- [Infrastructure](infra/README.md) - CloudFormation setup
- [API](api/README.md) - Backend Lambda functions
- [Web](web/README.md) - Frontend React app (to be created)
- [Docker](docker/README.md) - Local development (to be created)

## Roadmap

- [x] Infrastructure setup (CloudFormation)
- [x] API backend (Lambda + DynamoDB)
- [x] Frontend skeleton (React + Vite)
- [ ] Complete Admin Portal UI
- [ ] Complete Driver App UI
- [ ] Signature capture component
- [ ] PDF receipt generation
- [ ] Email templates
- [ ] E2E tests
- [ ] Production deployment

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests and linting
4. Submit PR

## License

Proprietary - All Rights Reserved