# Timesheet Frontend (Vue.js)

A modern Vue.js 3 frontend for the timesheet application, built with TypeScript, Tailwind CSS, and comprehensive testing. This frontend integrates with the Python FastAPI backend to provide a complete time tracking solution.

## Features

- 🚀 **Vue 3 + TypeScript** - Modern reactive framework with full type safety
- 🎨 **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- 🗄️ **Pinia State Management** - Type-safe state management for complex data flows
- 🧪 **Comprehensive Testing** - Unit tests, integration tests, and E2E testing setup
- 🔒 **Authentication** - JWT-based authentication with token refresh
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- ⚡ **Vite Build System** - Fast development server and optimized production builds

## Project Structure

```
src/
├── components/          # Reusable UI components
├── composables/         # Reusable logic (Vue composition functions)
├── router/             # Vue Router configuration and guards
├── services/           # API services and HTTP client
├── stores/             # Pinia state management stores
├── types/              # TypeScript type definitions
├── views/              # Page components (route destinations)
└── test/               # Test utilities and setup files
```

## Development Setup

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- npm 9.0.0+
- Python FastAPI backend running on `http://127.0.0.1:8080`

### Quick Start

For a **fresh Git checkout**, use the Makefile build target:

```bash
make build
```

This will install dependencies, run linting, type checking, tests, and create a production build.

### Manual Setup

1. **Install dependencies**:
   ```bash
   npm ci
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**: Navigate to `http://localhost:5173`

## Usage Examples

### Development Workflow

```bash
# Start development server with hot reload
npm run dev

# Run linting and fix issues
npm run lint

# Run type checking
npm run type-check

# Run unit tests
npm run test

# Run integration tests (requires backend)
npm run test:integration
```

### Using Makefile (Recommended)

```bash
# Complete build for fresh checkout
make build

# Start development server
make dev

# Quick development checks (no tests)
make check

# Run all tests (unit + integration)
make test-all

# Clean and rebuild everything
make rebuild

# Show all available targets
make help
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run integration tests against backend
npm run test:integration
```

## API Integration

The frontend integrates with the Python FastAPI backend using the following endpoints:

- **Authentication**: `GET /login`, `GET /logout`, `GET /refresh`, `GET /userinfo`
- **Health Check**: `GET /api/health`
- **Data APIs**: `/api/clients`, `/api/projects`, `/api/tasks`, etc.

### Environment Configuration

Create `.env` files for different environments:

**.env.development**:
```env
VITE_API_BASE_URL=http://127.0.0.1:8080
VITE_APP_TITLE=Timesheet (Development)
```

**.env.production**:
```env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=Timesheet
```

## Architecture

### State Management

The application uses Pinia stores for state management:

```typescript
// Example: Using the auth store
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
await authStore.login({ username: 'user', password: 'pass' })
```

### API Services

API calls are handled by service layers:

```typescript
// Example: Using API services
import { authApi } from '@/services/auth'

const result = await authApi.login(credentials)
if (result.success) {
  // Handle successful login
}
```

### Composables

Reusable logic is encapsulated in composables:

```typescript
// Example: Using composables
import { useNotification } from '@/composables/useNotification'

const { showSuccess, showError } = useNotification()
showSuccess('Operation completed successfully!')
```

## Testing Strategy

### Unit Tests
- **Components**: Test component behavior and rendering
- **Stores**: Test state management and business logic
- **Services**: Test API integration and error handling
- **Composables**: Test reusable logic functions

### Integration Tests
- **Authentication Flow**: Test complete login/logout cycle
- **API Integration**: Test frontend-backend communication
- **User Workflows**: Test multi-step user interactions

### E2E Tests (Optional)
- **Critical Paths**: Test essential user journeys
- **Cross-browser**: Ensure compatibility across browsers

## Browser Support

### Recommended Setup

**VS Code Extensions**:
- [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

**Browser DevTools**:
- **Chrome/Edge**: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### Supported Browsers
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Files will be generated in dist/ directory
```

### FastAPI Integration

The production build is served by the FastAPI backend. The backend automatically serves the Vue.js static files and handles SPA routing.

### Environment Variables

Set these environment variables for production:

```env
NODE_ENV=production
VITE_API_BASE_URL=/api
VITE_APP_TITLE=Timesheet
```

## Troubleshooting

### Common Issues

**Backend not available**:
```bash
# Check if backend is running
curl http://127.0.0.1:8080/api/health
```

**Type errors**:
```bash
# Run type checking
npm run type-check
```

**Test failures**:
```bash
# Run tests with verbose output
npm run test -- --reporter=verbose
```

### Development Tips

- Use `npm run dev` for hot reload during development
- Run `make check` for quick validation without tests
- Use `npm run test:ui` for interactive test debugging
- Check the browser console for runtime errors
- Use Vue DevTools for component inspection

## Contributing

1. **Setup**: Clone repository and run `make build`
2. **Development**: Use `make dev` to start development server
3. **Testing**: Run `make test-all` before committing
4. **Linting**: Code is automatically formatted with Prettier
5. **Type Safety**: All code must pass TypeScript checks

## Configuration

See [Vite Configuration Reference](https://vite.dev/config/) for build system customization.

For more detailed information, see the project documentation in `frontend/web/DESIGN.md`.
