# CourierCue Web

React + TypeScript frontend for CourierCue.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling with dark mode support
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
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_USE_MOCK_API=false  # Set to true for demo mode with mock data

# Cognito Configuration (for production)
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=https://couriercue-dev-xxxxx.auth.us-east-1.amazoncognito.com

# Local development flag
VITE_LOCAL_DEV=true
```

**Development Modes:**
- **Mock API Mode** (`VITE_USE_MOCK_API=true`): Uses mock data for development/demo
- **Real API Mode** (`VITE_USE_MOCK_API=false`): Connects to backend API server

**Note**: The API runs on port 3001 in local development.

### Start Dev Server

```bash
# From project root (recommended)
pnpm dev:web

# Or from web directory
cd web && pnpm dev
```

Opens at http://localhost:5173

### Demo Users

When using mock API mode (`VITE_USE_MOCK_API=true`), the following demo users are available:

- **Admin**: `admin@demo.com` / `admin123`
  - Full access to all features, user management, and invitations
- **Co-Admin**: `coadmin@demo.com` / `coadmin123`
  - Can view all users and manage drivers, but cannot invite users or manage admins
- **Drivers**: 
  - `driver1@demo.com` / `driver123` (Driver Johnson)
  - `driver2@demo.com` / `driver123` (Driver Smith)
  - `driver3@demo.com` / `driver123` (Driver Brown - inactive)
  - `driver4@demo.com` / `driver123` (Driver Wilson - pending)

Each role demonstrates different UI experiences and permission levels.

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
- Persistent authentication across browser sessions

### User Experience

- **Dark Mode Toggle**: System-wide dark/light theme switching
- **Theme Persistence**: User preferences saved to localStorage
- **System Integration**: Respects browser/OS dark mode preferences
- **Responsive Design**: Mobile-first with adaptive layouts

### Admin Portal

- **Dashboard**: KPI tiles, quick actions
- **Loads**: List, filter, create, update loads  
- **Users**: Invite, manage, disable users
- **Settings**: Org configuration with tabbed interface

### Driver App

- **My Loads**: View assigned deliveries
- **Load Details**: Service address, items, notes
- **Status Updates**: IN_TRANSIT → DELIVERED workflow
- **Signature Capture**: Planned (canvas-based with geolocation)

### Implemented Features

- ✅ Authentication & JWT token management
- ✅ Role-based routing and access control
- ✅ Co-admin permission system with granular user management
- ✅ Mock API integration for development and demo
- ✅ Comprehensive demo users with various roles and statuses
- ✅ Dark/light theme with persistence and system preference detection
- ✅ Responsive design with mobile-first approach
- ✅ Load management (CRUD operations) with status tracking
- ✅ User management and invitations with role restrictions
- ✅ Organization settings with tabbed interface
- ✅ Driver workflow pages with assigned load views
- ✅ API status indicator in navigation
- ✅ Error handling with defensive programming
- ⏳ Signature capture (planned)
- ⏳ PDF receipt generation (planned)

## Styling

Uses Tailwind CSS with comprehensive dark mode support:

- **Dark Mode**: Complete dark/light theme implementation
- **Theme System**: React Context API with localStorage persistence
- **Design Tokens**: Color variables defined in `globals.css`
- **Radix UI**: Accessible component primitives
- **Mobile-first**: Responsive design with breakpoints
- **Smooth Transitions**: Animated theme switching

### Dark Mode Usage

```typescript
// Using the theme hook
import { useTheme } from '../hooks/useTheme';

function Component() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <button onClick={toggleDarkMode}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
}
```

## State Management

- **React Query** for server state (data fetching, caching) - planned
- **React Hook Form** for form state - planned
- **Context API** for auth state and user management
- **Mock API** integration for development with localStorage persistence
- **Theme Context** for dark/light mode with localStorage persistence
- Local state with `useState` for UI state and loading states

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
