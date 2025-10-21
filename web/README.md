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
VITE_API_BASE_URL=http://localhost:3001
VITE_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_DOMAIN=https://couriercue-dev-xxxxx.auth.us-east-1.amazoncognito.com
```

**Note**: The API runs on port 3001 in local development.

### Start Dev Server

```bash
# From project root (recommended)
pnpm dev:web

# Or from web directory
cd web && pnpm dev
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
- ✅ Dark/light theme with persistence
- ✅ Responsive design
- ✅ Load management (CRUD operations)
- ✅ User management and invitations
- ✅ Organization settings
- ✅ Driver workflow pages
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
