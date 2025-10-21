# CourierCue Web

React + TypeScript frontend for CourierCue.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **Radix UI** - Accessible component primitives
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Cognito** - Authentication

## Development

### Install Dependencies

```bash
pnpm install
```

### Environment Variables

Create a `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=https://couriercue-dev-xxxxx.auth.us-east-1.amazoncognito.com
```

### Start Dev Server

```bash
pnpm dev
```

Opens at http://localhost:5173

### Build for Production

```bash
pnpm build
```

Outputs to `dist/`

### Preview Production Build

```bash
pnpm preview
```

## Testing

### Run Tests

```bash
pnpm test
```

### Run Tests in Watch Mode

```bash
pnpm test -- --watch
```

## Project Structure

```
web/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LoadsPage.tsx
│   │   ├── UsersPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── DriverLoadsPage.tsx
│   │   └── LoadDetailsPage.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useAuth.tsx
│   ├── lib/             # Utilities and API client
│   │   └── api.ts
│   ├── styles/          # Global styles
│   │   └── globals.css
│   ├── test/            # Test utilities
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
└── package.json
```

## Features

### Authentication

- Cognito OAuth2 flow via Hosted UI
- JWT token management
- Automatic token refresh
- Role-based routing (admin vs driver)

### Admin Portal

- **Dashboard**: KPI tiles, quick actions
- **Loads**: List, filter, create, update loads
- **Users**: Invite, manage, disable users
- **Settings**: Org configuration

### Driver App

- **My Loads**: View assigned deliveries
- **Load Details**: Service address, items, notes
- **Signature Capture**: Canvas-based signature with geolocation
- **Status Updates**: IN_TRANSIT → DELIVERED

## Styling

Uses Tailwind CSS with custom design system:

- Color variables defined in `globals.css`
- Radix UI for accessible primitives
- Mobile-first responsive design
- Dark mode ready (tokens defined)

## State Management

- **React Query** for server state (data fetching, caching)
- **React Hook Form** for form state
- **Context API** for auth state
- Local state with `useState` for UI state

## Code Style

- **ESLint** for linting
- **Prettier** for formatting (inherited from root)
- **TypeScript** strict mode
- Component file naming: `PascalCase.tsx`
- Utility file naming: `camelCase.ts`

## Deployment

Built as static SPA, deployed to S3 + CloudFront:

```bash
pnpm build
aws s3 sync dist/ s3://couriercue-<env>-web --delete
```

See [../infra/README.md](../infra/README.md) for full deployment process.
