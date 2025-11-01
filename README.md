# CourierCue

Multi-tenant SaaS platform for digitizing delivery slips and driver workflow management. Built for loading companies to streamline pick-up/delivery operations with real-time tracking and comprehensive user management.

## ✨ Features

### 🏢 **Multi-Tenant Organization Management**
- **Role-based access control** (Admin, Co-Admin, Driver) with granular permissions
- **Organization settings** with configurable preferences
- **User management** with invite/permission system and role-specific limitations
- **Custom fields** for load-specific data collection
- **Co-Admin permissions**: Can view all users and manage drivers, but cannot invite users or manage other admins

### 📦 **Load Management**
- **Load creation and assignment** to drivers with trailer/dock selection
- **Real-time status tracking** (Assigned → En Route → Delivered → Completed)
- **Digital signature capture** with geolocation
- **PDF receipt generation** and email delivery
- **Priority-based load management**
- **Trailer tracking** with compliance monitoring
- **Dock and dock yard management** with type selection

### 🚛 **Trailer & Dock Management**
- **Trailer management** with full CRUD operations
- **Compliance tracking** for registration and inspection dates
- **Status management** (Active, Inactive, In Repair)
- **Current location tracking** via dock assignment
- **Dock management** with type selection (flatbed, drop-in)
- **Dock yard organization** with address management
- **Real-time compliance calculation** based on current date

### 🎯 **User Experience**
- **Public marketing pages** with business-focused landing page and about section
- **Dark/Light mode toggle** with system preference detection
- **Responsive design** optimized for desktop and mobile
- **Interactive dashboard** with load statistics
- **Demo environment** with pre-configured test users
- **Seamless authentication** flow from public to private pages

### 🛠 **Developer Experience**
- **TypeScript** throughout the entire stack
- **Hot module reloading** for rapid development
- **Comprehensive testing** setup
- **Docker-based local development** environment

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
# Terminal 1: API (from root directory)
pnpm dev:api
# or: cd api && pnpm dev

# Terminal 2: Web (from root directory)
pnpm dev:web
# or: cd web && pnpm dev
```

6. **Access the application**

- **Web app**: http://localhost:5173 (starts at public homepage)
- **Login**: http://localhost:5173/login
- **About**: http://localhost:5173/about
- API server: http://localhost:3001
- API health check: http://localhost:3001/health
- MailHog UI: http://localhost:8025
- DynamoDB Admin: http://localhost:8000
- LocalStack: http://localhost:4566

### Demo Credentials (Local)

The application includes a comprehensive demo environment with pre-configured users:

- **Admin User**: `admin@demo.com` / `admin123`
  - Full system access, user management, and user invitations
- **Co-Admin User**: `coadmin@demo.com` / `coadmin123`  
  - Load management, can view all users and manage drivers (but cannot invite users or manage other admins)
- **Driver Users**: 
  - `driver1@demo.com` / `driver123` (Driver Johnson)
  - `driver2@demo.com` / `driver123` (Driver Smith)
  - `driver3@demo.com` / `driver123` (Driver Brown)
  - `driver4@demo.com` / `driver123` (Driver Wilson)

Each role demonstrates different permission levels and UI experiences. The demo includes users with various statuses (active, inactive, pending) for testing user management features.

### Development Features

- **Mock API Mode**: Toggle between real API and mock data via `VITE_USE_MOCK_API`
- **API Status Indicator**: Visual indicator in navigation showing current API mode
- **Comprehensive Demo Data**: 6+ demo users with various roles and statuses
- **Role-Based UI**: Different interfaces for admin, co-admin, and driver roles
- **Permission Testing**: Co-admin restrictions properly enforced in UI
- **Error Handling**: Defensive programming prevents crashes from undefined data
- **Theme Persistence**: Dark/light mode settings saved across sessions

## Project Structure

```
couriercue/
├── infra/              # CloudFormation infrastructure
├── api/                # Lambda backend functions
│   ├── src/functions/  # API handlers (loads, trailers, docks, org, etc.)
│   ├── src/lib/        # Shared libraries
│   └── src/local/      # Local development server
├── web/                # React frontend
│   ├── src/pages/      # Page components (public + private)
│   │   ├── HomePage.tsx           # Public landing page
│   │   ├── AboutPage.tsx          # Public about page
│   │   ├── DashboardPage.tsx      # Private dashboard
│   │   └── ...                    # Other private pages
│   ├── src/components/ # UI components
│   │   ├── Navigation.tsx         # Authenticated nav
│   │   ├── PublicNavigation.tsx   # Public nav
│   │   └── ...
│   └── src/lib/        # API client, utilities
├── docker/             # Local development setup
│   ├── compose.local.yml
│   └── seed.sh         # Includes trailers/docks/dockyards
└── .github/workflows/  # CI/CD pipelines
```

## Development

### Workspace Commands

From the root directory, you can run:

```bash
# Start API server
pnpm dev:api

# Start Web server
pnpm dev:web

# Seed database
pnpm dev:stack

# Run all tests
pnpm test

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint
```

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

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint
```

**Note**: Integration tests are planned but not yet implemented.

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
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_USE_MOCK_API=false  # Set to true for mock API with demo data

# Cognito Configuration
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=https://couriercue-dev-xxxxx.auth.us-east-1.amazoncognito.com

# Local development flag
VITE_LOCAL_DEV=true
```

**Development Modes:**
- `VITE_USE_MOCK_API=true`: Uses mock API with comprehensive demo data
- `VITE_USE_MOCK_API=false`: Connects to real API server (requires backend running)

### API Endpoints

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

### Trailers
- `GET /trailers` - List trailers
- `POST /trailers` - Create trailer
- `PATCH /trailers/{id}` - Update trailer

### Docks
- `GET /docks` - List docks
- `POST /docks` - Create dock
- `PATCH /docks/{id}` - Update dock

### Dock Yards
- `GET /dockyards` - List dock yards
- `POST /dockyards` - Create dock yard
- `PATCH /dockyards/{id}` - Update dock yard

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
- [Authentication](AUTHENTICATION.md) - Local and production auth setup
- [Web](web/README.md) - Frontend React app (to be created)
- [Docker](docker/README.md) - Local development (to be created)

## Roadmap

- [x] Infrastructure setup (CloudFormation)
- [x] API backend (Lambda + DynamoDB)
- [x] Local development environment (Docker + seed data)
- [x] Local development server (Express wrapper for Lambda functions)
- [x] Frontend application (React + Vite)
- [x] Complete Admin Portal UI
- [x] Complete Driver App UI
- [x] Authentication & authorization (Cognito + JWT)
- [x] Multi-tenant organization management
- [x] Load management with status tracking
- [x] User management and role-based access
- [x] Co-admin permission system with granular access controls
- [x] Mock API integration for development/demo
- [x] Comprehensive demo data with multiple user types and statuses
- [x] Dark/light theme toggle
- [x] Comprehensive testing setup
- [x] API status indicator in navigation
- [x] Trailer management system with compliance tracking
- [x] Dock and dock yard management
- [x] Enhanced load creation with trailer/dock selection
- [x] Real-time compliance calculation for trailers
- [x] Backend seed data for trailers, docks, and dock yards
- [x] Public marketing pages (Home + About)
- [x] Public navigation with seamless auth flow
- [x] Business-focused landing page with CTAs
- [ ] Signature capture component
- [ ] PDF receipt generation
- [ ] Email templates and delivery
- [ ] Integration tests (LocalStack + DynamoDB Local)
- [ ] E2E tests (Playwright)
- [ ] Production deployment

## Troubleshooting

### Common Issues

**1. Docker containers won't start**
- Ensure Docker Desktop is running
- Check ports aren't already in use: `lsof -i :8000,4566,8025`
- Clean up volumes: `docker volume prune -f`

**2. LocalStack "Device or resource busy" error**
- Stop containers: `docker compose -f docker/compose.local.yml down`
- Remove volumes: `docker volume prune -f`
- Restart: `docker compose -f docker/compose.local.yml up -d`

**3. API server won't start**
- Install dependencies: `pnpm install` (from root)
- Use workspace command: `pnpm dev:api` (from root)
- Check if port 3001 is free: `lsof -i :3001`

**4. "tsx: command not found" error**
- Run `pnpm install` from the root directory
- Dependencies must be installed via pnpm workspace

**5. Package manager conflicts**
- This project uses pnpm workspaces
- Avoid mixing npm and pnpm commands
- If needed, remove `node_modules` and reinstall with pnpm

**6. Users page loading blank**
- Ensure `VITE_USE_MOCK_API=true` in web/.env for demo mode
- Check console for errors (press F12)
- Try refreshing the page or switching API modes

**7. Co-admin user cannot access features**
- Co-admins can view users but cannot invite new users
- This is intentional - only admins can invite users
- Co-admins can modify drivers but not other admins or co-admins

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests and linting
4. Submit PR

## License

Proprietary - All Rights Reserved