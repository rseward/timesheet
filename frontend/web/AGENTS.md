# Vue.js Timesheet Development Guide

This document provides comprehensive guidelines for developing Vue.js components, styling with Tailwind CSS, and maintaining the timesheet web frontend.

## Table of Contents
- [Project Setup](#project-setup)
- [Vue.js Component Best Practices](#vuejs-component-best-practices)
- [Tailwind CSS Guidelines](#tailwind-css-guidelines)
- [State Management with Pinia](#state-management-with-pinia)
- [API Integration](#api-integration)
- [Testing Strategy](#testing-strategy)
- [Build & Deployment](#build--deployment)
- [Development Workflow](#development-workflow)
- [Code Quality](#code-quality)

## Project Setup

### Initial Setup
```bash
# Create Vue.js project with TypeScript
cd frontend/web
npm create vue@latest . --typescript --router --pinia --vitest --eslint --prettier

# Install additional dependencies
npm install axios dayjs @headlessui/vue @heroicons/vue
npm install -D @types/node @tailwindcss/forms @tailwindcss/typography
```

### Development Environment
```bash
# Start development server
npm run dev

# Run in parallel with backend
# Terminal 1: Frontend
cd frontend/web && npm run dev

# Terminal 2: Backend
cd backend && uvicorn main:app --reload --port 8080
```

## Vue.js Component Best Practices

### Component Structure

**Single File Component Template:**
```vue
<template>
  <div class="component-container">
    <!-- Use semantic HTML -->
    <header class="component-header">
      <h1 class="text-2xl font-bold">{{ title }}</h1>
    </header>
    
    <main class="component-content">
      <!-- Component content -->
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ComponentProps } from '@/types'

// Props definition
interface Props {
  title: string
  items?: any[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  loading: false
})

// Emits definition
const emit = defineEmits<{
  save: [data: any]
  cancel: []
}>()

// Reactive state
const localState = ref('')
const isValid = computed(() => localState.value.length > 0)

// Lifecycle
onMounted(() => {
  // Component initialization
})

// Methods
const handleSave = () => {
  if (isValid.value) {
    emit('save', { value: localState.value })
  }
}
</script>

<style scoped>
.component-container {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm;
}
</style>
```

### Component Naming Conventions

**File Names:**
```
PascalCase for components: UserProfile.vue, DataTable.vue
kebab-case for views: user-profile.vue, client-management.vue
```

**Component Names:**
```vue
<!-- Good -->
<UserProfile />
<DataTable />
<FormInput />

<!-- Avoid -->
<userprofile />
<data_table />
<form-input />
```

### Props and Events

**Props Definition:**
```vue
<script setup lang="ts">
interface Props {
  // Required props
  title: string
  items: Client[]
  
  // Optional props with defaults
  loading?: boolean
  pageSize?: number
  sortBy?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pageSize: 10,
  sortBy: 'name'
})
</script>
```

**Events Definition:**
```vue
<script setup lang="ts">
const emit = defineEmits<{
  // Event with payload
  'update:selected': [client: Client]
  'client:save': [data: ClientData]
  
  // Event without payload
  'refresh': []
  'cancel': []
}>()
</script>
```

### Composables

**Create reusable logic:**
```typescript
// composables/useApi.ts
import { ref, type Ref } from 'vue'
import { useNotification } from './useNotification'

export function useApi<T>() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { showError } = useNotification()

  const execute = async (apiCall: () => Promise<T>): Promise<T | null> => {
    loading.value = true
    error.value = null
    
    try {
      const result = await apiCall()
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
      showError(error.value)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    execute
  }
}
```

## Tailwind CSS Guidelines

### Design System Configuration

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Project-specific colors matching Flet theme
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          800: '#334155',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Component Styling Patterns

**Base Component Styles:**
```vue
<template>
  <!-- Form Input Component -->
  <div class="form-group">
    <label 
      :for="fieldId" 
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <input
      :id="fieldId"
      v-model="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="form-input"
      :class="[
        'block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset',
        'placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
        {
          'ring-gray-300 focus:ring-blue-600': !error,
          'ring-red-300 focus:ring-red-600': error,
          'bg-gray-50 text-gray-500 cursor-not-allowed': disabled,
          'dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600': !disabled
        }
      ]"
    />
    
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>
```

**Data Table Styling:**
```vue
<template>
  <div class="data-table-container">
    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
          <tr 
            v-for="item in items" 
            :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <!-- Table cells -->
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
```

### CSS Class Organization

**Order classes by type:**
```vue
<!-- Layout -> Spacing -> Sizing -> Colors -> Typography -> Effects -->
<div class="flex flex-col gap-4 w-full max-w-md bg-white text-gray-900 rounded-lg shadow-lg">
```

**Extract common patterns:**
```vue
<style scoped>
.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.card {
  @apply bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700;
}

.form-section {
  @apply space-y-6 bg-white dark:bg-gray-800 px-4 py-5 sm:p-6;
}
</style>
```

## State Management with Pinia

### Store Structure

**Client Store Example:**
```typescript
// stores/clients.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Client, ClientFilters } from '@/types/client'
import { clientsApi } from '@/services/clients'

export const useClientsStore = defineStore('clients', () => {
  // State
  const clients = ref<Client[]>([])
  const loading = ref(false)
  const filters = ref<ClientFilters>({
    active: true,
    search: ''
  })

  // Getters
  const activeClients = computed(() => 
    clients.value.filter(client => client.active)
  )

  const filteredClients = computed(() => {
    let result = clients.value

    if (filters.value.active !== null) {
      result = result.filter(client => client.active === filters.value.active)
    }

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(client => 
        client.organisation.toLowerCase().includes(search) ||
        client.contactEmail.toLowerCase().includes(search)
      )
    }

    return result
  })

  // Actions
  const fetchClients = async () => {
    loading.value = true
    try {
      clients.value = await clientsApi.getAll()
    } finally {
      loading.value = false
    }
  }

  const createClient = async (clientData: Omit<Client, 'id'>) => {
    const newClient = await clientsApi.create(clientData)
    clients.value.push(newClient)
    return newClient
  }

  const updateClient = async (id: number, clientData: Partial<Client>) => {
    const updatedClient = await clientsApi.update(id, clientData)
    const index = clients.value.findIndex(c => c.id === id)
    if (index !== -1) {
      clients.value[index] = updatedClient
    }
    return updatedClient
  }

  const deleteClient = async (id: number) => {
    await clientsApi.delete(id)
    clients.value = clients.value.filter(c => c.id !== id)
  }

  const setFilters = (newFilters: Partial<ClientFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    // State
    clients: readonly(clients),
    loading: readonly(loading),
    filters: readonly(filters),
    
    // Getters
    activeClients,
    filteredClients,
    
    // Actions
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    setFilters
  }
})
```

## API Integration

### Service Layer

**Base API Service:**
```typescript
// services/api.ts
import axios, type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore()
        if (authStore.token) {
          config.headers.Authorization = `Bearer ${authStore.token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const authStore = useAuthStore()
        
        if (error.response?.status === 401) {
          await authStore.logout()
          window.location.href = '/login'
        }
        
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export const apiService = new ApiService()
```

**Entity-Specific Services:**
```typescript
// services/clients.ts
import { apiService } from './api'
import type { Client, ClientCreateData } from '@/types/client'

export const clientsApi = {
  async getAll(active?: boolean): Promise<Client[]> {
    const params = active !== undefined ? { active } : {}
    return apiService.get<Client[]>('/clients', { params })
  },

  async getById(id: number): Promise<Client> {
    return apiService.get<Client>(`/clients/${id}`)
  },

  async create(data: ClientCreateData): Promise<Client> {
    return apiService.post<Client>('/clients', data)
  },

  async update(id: number, data: Partial<Client>): Promise<Client> {
    return apiService.put<Client>(`/clients/${id}`, data)
  },

  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/clients/${id}`)
  }
}
```

## Testing Strategy

### Unit Testing with Vitest

**Component Testing:**
```typescript
// tests/components/FormInput.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormInput from '@/components/forms/FormInput.vue'

describe('FormInput', () => {
  it('renders with label and placeholder', () => {
    const wrapper = mount(FormInput, {
      props: {
        label: 'Email Address',
        placeholder: 'Enter your email',
        modelValue: ''
      }
    })

    expect(wrapper.find('label').text()).toBe('Email Address')
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter your email')
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(FormInput, {
      props: {
        label: 'Email',
        modelValue: ''
      }
    })

    const input = wrapper.find('input')
    await input.setValue('test@example.com')

    expect(wrapper.emitted('update:modelValue')).toEqual([['test@example.com']])
  })

  it('shows error state when error prop is provided', () => {
    const wrapper = mount(FormInput, {
      props: {
        label: 'Email',
        modelValue: '',
        error: 'Email is required'
      }
    })

    expect(wrapper.find('.text-red-600').text()).toBe('Email is required')
    expect(wrapper.find('input').classes()).toContain('ring-red-300')
  })
})
```

**Store Testing:**
```typescript
// tests/stores/clients.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useClientsStore } from '@/stores/clients'
import { clientsApi } from '@/services/clients'

// Mock the API
vi.mock('@/services/clients')
const mockClientsApi = vi.mocked(clientsApi)

describe('Clients Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches clients successfully', async () => {
    const mockClients = [
      { id: 1, organisation: 'Test Corp', active: true },
      { id: 2, organisation: 'Another Corp', active: false }
    ]

    mockClientsApi.getAll.mockResolvedValue(mockClients)

    const store = useClientsStore()
    await store.fetchClients()

    expect(store.clients).toEqual(mockClients)
    expect(store.loading).toBe(false)
  })

  it('filters active clients correctly', () => {
    const store = useClientsStore()
    store.clients = [
      { id: 1, organisation: 'Active Corp', active: true },
      { id: 2, organisation: 'Inactive Corp', active: false }
    ]

    expect(store.activeClients).toHaveLength(1)
    expect(store.activeClients[0].organisation).toBe('Active Corp')
  })
})
```

### Integration Testing

**API Integration Tests:**
```typescript
// tests/integration/clients.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ClientsView from '@/views/clients/ClientsView.vue'

describe('ClientsView Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('loads and displays clients', async () => {
    const wrapper = mount(ClientsView, {
      global: {
        plugins: [createPinia()]
      }
    })

    // Wait for async operations
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="clients-table"]').exists()).toBe(true)
  })
})
```

### Running Tests

**Package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "cypress open",
    "test:e2e:run": "cypress run"
  }
}
```

**Test Commands:**
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

## Build & Deployment

### Build Configuration

**Environment Variables:**
```bash
# .env.development
VITE_API_BASE_URL=/api
VITE_APP_TITLE=Timesheet Development
VITE_ENABLE_DEV_TOOLS=true

# .env.production
VITE_API_BASE_URL=/api
VITE_APP_TITLE=Timesheet
VITE_ENABLE_DEV_TOOLS=false
```

**Build Commands:**
```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build -- --analyze
```

### Production Optimization

**Vite Configuration:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['@headlessui/vue', '@heroicons/vue'],
          'utils': ['axios', 'dayjs']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios']
  }
})
```

## Development Workflow

### Git Workflow

**Branch Naming:**
```bash
feature/client-management
bugfix/date-picker-validation
hotfix/authentication-token
```

**Commit Messages:**
```bash
feat: add client management table component
fix: resolve date picker timezone issues
refactor: extract common table logic to composable
docs: update component usage examples
test: add unit tests for billing events store
```

### Code Review Checklist

**Vue.js Components:**
- [ ] Uses Composition API with `<script setup>`
- [ ] Props and emits are properly typed
- [ ] Component is accessible (ARIA attributes, keyboard navigation)
- [ ] Loading states are handled
- [ ] Error states are displayed to user
- [ ] No console.log statements in production code

**Tailwind CSS:**
- [ ] Uses design system colors and spacing
- [ ] Dark mode classes are included where appropriate
- [ ] Responsive breakpoints are considered
- [ ] No arbitrary values unless absolutely necessary
- [ ] Common patterns are extracted to CSS classes

**TypeScript:**
- [ ] All types are properly defined
- [ ] No `any` types unless necessary
- [ ] Interfaces are used for object shapes
- [ ] Generic types are used where appropriate

### Development Scripts

**package.json:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix",
    "lint:style": "stylelint \"src/**/*.{css,vue}\" --fix",
    "format": "prettier --write src/"
  }
}
```

## Code Quality

### ESLint Configuration

**.eslintrc.cjs:**
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier'
  ],
  rules: {
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/define-emits-declaration': 'error',
    'vue/define-props-declaration': 'error',
    'vue/no-undef-components': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
}
```

### Prettier Configuration

**.prettierrc.json:**
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80,
  "vueIndentScriptAndStyle": true
}
```

### Pre-commit Hooks

**package.json:**
```json
{
  "lint-staged": {
    "*.{vue,js,ts}": ["eslint --fix", "prettier --write"],
    "*.{css,vue}": ["stylelint --fix"]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check && npm run test"
    }
  }
}
```

This guide provides a comprehensive foundation for developing high-quality Vue.js components with consistent styling, proper testing, and maintainable code architecture for the timesheet application.