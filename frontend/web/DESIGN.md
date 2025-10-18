# Timesheet Web Frontend Design Document

This document outlines the design and implementation plan for a Vue.js web frontend that matches the functionality of the existing Flet-based timesheet application.

## Hosting Strategy

### Static File Hosting via FastAPI (Recommended Approach)

The Vue.js frontend will be served as static files from the existing FastAPI backend. This approach provides the optimal balance of simplicity and functionality.

#### Implementation Overview

**FastAPI Configuration:**
```python
# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

# Existing API routes
app.include_router(auth_router, prefix="/api")
app.include_router(clients_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(billingevent_router, prefix="/api")
app.include_router(preferences_router, prefix="/api")
# ... other API routes

# Serve Vue.js static files
if os.path.exists("../frontend/web/dist"):
    app.mount("/assets", StaticFiles(directory="../frontend/web/dist/assets"), name="assets")
    
    @app.get("/", response_class=FileResponse)
    @app.get("/{path:path}")
    async def serve_spa(path: str = ""):
        # Prevent API routes from being caught by SPA routing
        if path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        return FileResponse("../frontend/web/dist/index.html")
```

**Vue.js Build Configuration:**
```javascript
// frontend/web/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/', // Serve from root path
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

#### Development Workflow

**Development Mode:**
```bash
# Terminal 1: Frontend development server
cd frontend/web
npm run dev  # Runs on http://localhost:3000 with API proxy

# Terminal 2: Backend development server
cd backend
uvicorn main:app --reload --port 8080
```

**Production Build:**
```bash
# Build frontend
cd frontend/web
npm run build  # Outputs to dist/

# Run backend (serves both API and frontend)
cd backend
uvicorn main:app --host 0.0.0.0 --port 8080
```

#### Directory Structure
```
timesheet/
├── backend/
│   ├── main.py (FastAPI with static file serving)
│   ├── fastapi/ (API routes)
│   └── ...
├── frontend/
│   ├── web/
│   │   ├── dist/ (Vue build output - served by FastAPI)
│   │   ├── src/ (Vue.js source code)
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── flet/ (existing Flet frontend)
```

#### Advantages of This Approach

1. **Single Deployment**: One service to deploy and manage
2. **No CORS Issues**: Frontend and API share the same origin
3. **Unified Logging**: All requests logged in one place
4. **Simple Development**: Easy local development workflow
5. **Existing Infrastructure**: Leverages current FastAPI setup
6. **Production Ready**: FastAPI efficiently serves static files

#### Environment Configuration

**Development Environment Variables:**
```bash
# frontend/web/.env.development
VITE_API_BASE_URL=/api
VITE_APP_TITLE=Timesheet Development
```

**Production Environment Variables:**
```bash
# frontend/web/.env.production
VITE_API_BASE_URL=/api
VITE_APP_TITLE=Timesheet
```

#### Deployment Considerations

- **Build Process**: Frontend must be built before backend deployment
- **Static File Caching**: FastAPI can serve files with appropriate cache headers
- **Fallback Routing**: All non-API routes serve the Vue.js SPA entry point
- **API Versioning**: Keep `/api` prefix for all backend routes

## Architecture Overview

### Technology Stack
- **Framework**: Vue 3 with Composition API
- **Styling**: Tailwind CSS for utility-first styling
- **Routing**: Vue Router 4
- **State Management**: Pinia for global state management
- **HTTP Client**: Axios for API communication
- **Authentication**: JWT-based authentication with bearer tokens
- **Date/Time**: Day.js for date manipulation and formatting
- **Icons**: Heroicons or Lucide Vue for consistent iconography
- **Build Tool**: Vite for fast development and building
- **Type Safety**: TypeScript for enhanced development experience

### Project Structure
```
frontend/web/
├── public/
│   ├── assets/
│   │   └── login_background.jpg
│   └── index.html
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppHeader.vue
│   │   │   ├── LoadingSpinner.vue
│   │   │   ├── Modal.vue
│   │   │   ├── Notification.vue
│   │   │   └── DataTable.vue
│   │   ├── forms/
│   │   │   ├── FormInput.vue
│   │   │   ├── FormDropdown.vue
│   │   │   ├── FormDatePicker.vue
│   │   │   ├── FormTimePicker.vue
│   │   │   └── FormButton.vue
│   │   └── layout/
│   │       ├── MainLayout.vue
│   │       └── AuthLayout.vue
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useNotification.ts
│   │   ├── useModal.ts
│   │   └── useApi.ts
│   ├── router/
│   │   └── index.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── clients.ts
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   ├── billingEvents.ts
│   │   └── preferences.ts
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── clients.ts
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   ├── billingEvents.ts
│   │   └── preferences.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── client.ts
│   │   ├── project.ts
│   │   ├── task.ts
│   │   └── billingEvent.ts
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   ├── views/
│   │   ├── auth/
│   │   │   └── LoginView.vue
│   │   ├── dashboard/
│   │   │   └── DashboardView.vue
│   │   ├── clients/
│   │   │   └── ClientsView.vue
│   │   ├── projects/
│   │   │   └── ProjectsView.vue
│   │   ├── tasks/
│   │   │   └── TasksView.vue
│   │   ├── hours/
│   │   │   └── HoursView.vue
│   │   ├── reports/
│   │   │   └── ReportsView.vue
│   │   ├── preferences/
│   │   │   └── PreferencesView.vue
│   │   └── profile/
│   │       └── ProfileView.vue
│   ├── App.vue
│   └── main.ts
├── tailwind.config.js
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## Core Features Mapping

### 1. Authentication System
**Flet Implementation**: JWT-based login with session storage and refresh tokens
**Web Implementation**:
- Login form with username/password fields
- "Remember Me" functionality
- JWT token storage in localStorage
- Automatic token refresh
- Route guards for protected pages
- Login background image matching Flet design

### 2. Navigation & Routing
**Flet Implementation**: Custom router with programmatic navigation
**Web Implementation**:
- Vue Router with route guards
- App header with navigation icons (Home, Profile, Settings)
- Breadcrumb navigation
- Dynamic window sizing replaced with responsive design

### 3. Dashboard/Home View
**Flet Implementation**: Simple navigation buttons to different sections
**Web Implementation**:
- Card-based navigation to main sections:
  - Clients (Green accent)
  - Projects (Amber accent) 
  - Tasks (Cyan accent)
  - Hours (Purple accent)
  - Reports (Yellow accent)
- Responsive grid layout with hover effects

### 4. Data Management Views

#### Clients View
- Data table with columns: Organisation, City, State, Contact Email, URL, Active, Actions
- Add/Edit form with fields:
  - Organisation, Description, Address1, Address2
  - City, State, Country, Postal Code
  - Contact First/Last Name, Username, Email
  - Phone, Fax, GSM, HTTP URL, Active checkbox
- Edit/Delete actions with confirmation dialogs
- Form validation and error handling

#### Projects View
- Data table with columns: Client Name, Name, Start Date, Deadline, Project Status, Lead, Active, Actions
- Add/Edit form with fields:
  - Client dropdown (filtered by active clients)
  - Title, Description, Start Date, Deadline
  - HTTP Link, Project Status dropdown, Project Leader
- Date pickers for start date and deadline
- Status options: Pending, Started, Suspended, Complete

#### Tasks View
- Data table with columns: Project, Name, Assigned, Started, Task Status, Active, Actions
- Client/Project filter dropdowns
- Add/Edit form with fields:
  - Project Name (disabled), Task Name, Description
  - Assigned, Started, Suspended, Completed dates
  - HTTP Link, Status dropdown
- Status options: Pending, Started, Suspended, Complete

#### Hours/Billing Events View
- Most complex view with time tracking functionality
- Filter controls: Client dropdown, Project dropdown, Start date, End date
- Data table with columns: Project, Task, Number, Hours, Start Time, End Time, Description, Actions
- Total hours calculation and display
- Add/Edit form with fields:
  - Project Name (auto-filled), Task dropdown
  - Transaction Number (auto-generated)
  - Log Message, Start Time, End Time
- Time validation (start < end, same calendar day)
- Integration with user preferences for default start/end times

#### Reports View
- Simple list of available reports:
  - Client Period Report
  - TimeKeeper Period Report  
  - Time Period Report
- Future enhancement for report generation

### 5. Preferences View
- User work hours preferences
- Default Start Time and End Time fields
- Save/Reset/Load buttons
- Time picker components
- Integration with Hours view for default values

### 6. User Interface Components

#### Form Components
- **FormInput**: Text input with consistent styling
- **FormDropdown**: Select dropdown with search/filter capability
- **FormDatePicker**: Date selection with natural language input
- **FormTimePicker**: Time selection component
- **FormButton**: Consistent button styling and states

#### Data Display
- **DataTable**: Sortable, filterable table with pagination
- Column headers with consistent styling
- Row actions (Edit/Delete) with icon buttons
- Loading states and empty states

#### Modals & Notifications
- **Modal**: Confirmation dialogs for delete actions
- **Notification**: Success/error toast messages
- **LoadingSpinner**: Progress indicators

#### Layout Components
- **AppHeader**: Top navigation with title and action buttons
- **MainLayout**: Main content area with sidebar potential
- **AuthLayout**: Centered layout for login/auth pages

## Design System & Styling

### Color Palette (Matching Flet Theme)
- Primary: Blue-800/Blue-900 (matching Flet's blue theme)
- Success: Green-600
- Warning: Amber-600
- Error: Red-600
- Background: Gray-50 (light mode), Gray-900 (dark mode)
- Surface: White (light mode), Gray-800 (dark mode)
- Text: Gray-900 (light mode), Gray-100 (dark mode)

### Component Design Principles
- Dark theme support matching Flet's dark theme
- Consistent border radius (8px/12px)
- Subtle shadows and depth
- Focus states for accessibility
- Responsive design for mobile/tablet/desktop

### Form Styling
- Input fields with blue focus rings
- Consistent padding and spacing
- Error states with red borders and text
- Disabled states with reduced opacity
- Placeholder text styling

### Table Styling
- Alternating row backgrounds
- Hover states for rows
- Sticky headers for long tables
- Responsive table behavior (horizontal scroll)
- Action button consistency

## State Management Strategy

### Pinia Stores
Each major entity has its own store:

#### Auth Store
- User authentication state
- JWT token management
- Login/logout actions
- Route guard helpers

#### Clients Store
- Client list state
- CRUD operations
- Search/filter state
- Loading states

#### Projects Store
- Project list with client relationships
- CRUD operations
- Status management
- Client filtering

#### Tasks Store
- Task list with project relationships
- CRUD operations
- Status management
- Project/client filtering

#### Billing Events Store
- Time entry management
- Date range filtering
- Total hours calculation
- Real-time updates

#### Preferences Store
- User preference management
- Default work hours
- UI preferences

## API Integration

### Service Layer Architecture
Each service module handles:
- HTTP request configuration
- Error handling and retry logic
- Response transformation
- Authentication header management

### Base API Service
- Axios configuration
- Interceptors for auth tokens
- Global error handling
- Request/response logging

### Error Handling Strategy
- Network error handling
- API error response handling
- User-friendly error messages
- Retry logic for failed requests
- Offline state detection

## Responsive Design Strategy

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Layout Adaptations
- Mobile: Single column, collapsible navigation
- Tablet: Two column where appropriate
- Desktop: Full multi-column layouts

### Data Table Responsiveness
- Mobile: Card-based layout for table data
- Tablet: Horizontal scroll with sticky columns
- Desktop: Full table display

### Form Responsiveness
- Mobile: Single column form layout
- Tablet/Desktop: Multi-column where appropriate
- Touch-friendly input sizing

## Performance Considerations

### Code Splitting
- Route-based code splitting
- Component lazy loading
- Dynamic imports for large dependencies

### Data Management
- Efficient API request batching
- Client-side caching strategies
- Optimistic UI updates
- Pagination for large datasets

### Bundle Optimization
- Tree shaking for unused code
- CSS purging with Tailwind
- Image optimization
- Service worker for caching

## Testing Strategy

### Unit Testing Framework and Best Practices

The project uses **Vitest** as the testing framework with comprehensive coverage across all architectural layers. Based on our implementation experience, the following best practices ensure maintainable and reliable tests:

#### Core Testing Principles

1. **Service Layer Testing**
   - **Mock Raw API Responses**: Services should return wrapped responses `{success: boolean, data: T, error?: string}`, but mocks should provide raw data that services transform
   - **Consistent Error Handling**: All services must handle both network errors and API errors consistently
   - **Authentication Testing**: Mock `localStorage` and token handling properly in service tests

```typescript
// ✅ GOOD: Mock raw API response
const mockApiResponse = { id: 1, name: 'Client Name' }
mockApiService.get.mockResolvedValue(mockApiResponse)

const result = await clientsApi.getById(1)
expect(result).toEqual({ success: true, data: mockApiResponse })

// ❌ BAD: Mock wrapped response (causes double-wrapping)
const mockResponse = { success: true, data: { id: 1, name: 'Client Name' } }
mockApiService.get.mockResolvedValue(mockResponse) // Results in double-wrapping
```

2. **Store Testing**
   - **Direct State Access**: Return reactive refs/objects directly from stores, not computed readonly versions, to allow test mutations
   - **Proper Mock Setup**: Set up API service mocks before store creation to ensure proper initialization
   - **State Isolation**: Use fresh Pinia instances in `beforeEach` to prevent test interference

```typescript
// ✅ GOOD: Store returns direct refs for testability
return {
  clients, // ref<Client[]>
  loading, // ref<boolean>
  error,   // ref<string | null>
  // ... actions
}

// ❌ BAD: Store returns readonly computed (prevents test mutations)
return {
  clients: computed(() => clients.value),
  loading: computed(() => loading.value),
  // ...
}
```

3. **Composable Testing**
   - **Mock External Dependencies**: Mock all external services and stores used by composables
   - **Reactive Testing**: Test reactive state changes and side effects properly
   - **Error Boundary Testing**: Verify error handling and state recovery

4. **Type Consistency**
   - **Align Types with Implementation**: Ensure TypeScript types match actual runtime behavior
   - **Consistent ID Fields**: Use consistent identifier naming (`id` vs `client_id`) across types and implementation
   - **Service Response Types**: Maintain consistent response wrapper patterns

#### Testing File Organization

```
src/
├── services/
│   ├── __tests__/
│   │   ├── auth.test.ts
│   │   ├── clients.test.ts
│   │   └── api.test.ts
├── stores/
│   ├── __tests__/
│   │   ├── auth.test.ts
│   │   └── clients.test.ts
├── composables/
│   ├── __tests__/
│   │   ├── useApi.test.ts
│   │   └── useForm.test.ts
```

#### API Response Mocking Pattern

**Service Layer Pattern:**
```typescript
// Service expects: Raw API data
// Service returns: Wrapped response
export const clientsApi = {
  async getAll(): Promise<{ success: boolean; data: Client[] }> {
    const data = await apiService.get<Client[]>('/clients') // Raw data
    return { success: true, data } // Wrapped response
  }
}

// Test Pattern:
const mockRawData = [{ id: 1, name: 'Client' }]
mockApiService.get.mockResolvedValue(mockRawData)

const result = await clientsApi.getAll()
expect(result).toEqual({ success: true, data: mockRawData })
```

#### Error Handling Test Patterns

```typescript
// Test API errors
it('handles API errors properly', async () => {
  const mockError = new Error('Network error')
  mockApiService.get.mockRejectedValue(mockError)
  
  const result = await service.getData()
  expect(result.success).toBe(false)
  expect(result.error).toBe('Network error')
})

// Test store error state preservation
it('preserves error state correctly', async () => {
  const store = useStore()
  const errorMessage = 'API Error'
  
  mockApi.action.mockResolvedValue({ success: false, error: errorMessage })
  await store.performAction()
  
  expect(store.error).toBe(errorMessage)
})
```

#### Authentication Testing Best Practices

```typescript
// Mock localStorage properly
beforeEach(() => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  })
})

// Test token refresh and logout state preservation
it('preserves error after logout clears state', async () => {
  const store = useAuthStore()
  const errorMsg = 'Token expired'
  
  mockAuthApi.refreshToken.mockResolvedValue({ success: false, error: errorMsg })
  
  const result = await store.refreshToken()
  
  expect(store.error).toBe(errorMsg) // Error preserved after logout
  expect(result.success).toBe(false)
})
```

#### Achieved Testing Metrics
- **Total Tests**: 88
- **Pass Rate**: 100%
- **Coverage Areas**:
  - ✅ All service layer API integrations
  - ✅ Complete store state management
  - ✅ All composables and reactive patterns
  - ✅ Form validation and error handling
  - ✅ Authentication flows and token management

### Integration Testing
- API integration tests
- Form submission workflows
- Authentication flows
- Error handling scenarios

### End-to-End Testing
- Critical user journeys
- Cross-browser compatibility
- Mobile responsive testing
- Accessibility testing

## Development & Deployment

### Development Environment
- Vite dev server with hot reload
- Tailwind CSS with JIT compilation
- TypeScript strict mode
- ESLint and Prettier configuration

### Build Process
- Production build optimization
- Environment variable management
- Asset optimization
- Source map generation

### Deployment Strategy
- Static file hosting (Netlify/Vercel)
- Environment-specific builds
- CI/CD pipeline integration
- Performance monitoring

## Migration Considerations

### Data Compatibility
- Ensure API compatibility with existing backend
- Maintain existing data structures
- Preserve authentication flows

### Feature Parity
- Match all existing Flet functionality
- Maintain workflow consistency
- Preserve user experience patterns

### Progressive Enhancement
- Start with core functionality
- Add advanced features incrementally
- Maintain backward compatibility

## Future Enhancements

### Additional Features
- Real-time updates with WebSockets
- Advanced reporting with charts
- Data export functionality
- Advanced search and filtering
- User role management
- Multi-tenant support

### UI/UX Improvements
- Advanced data visualization
- Keyboard shortcuts
- Drag-and-drop functionality
- Advanced form validation
- Accessibility enhancements

This design provides a comprehensive blueprint for creating a modern, responsive web frontend that matches the functionality of the existing Flet application while leveraging web-native technologies and best practices.