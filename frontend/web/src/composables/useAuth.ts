import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials } from '@/types/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  // Computed properties for reactive state
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const loading = computed(() => authStore.loading)
  const error = computed(() => authStore.error)

  // Authentication actions
  const login = async (credentials: LoginCredentials, redirectPath = '/'): Promise<boolean> => {
    const success = await authStore.login(credentials)
    
    if (success) {
      await router.push(redirectPath)
    }
    
    return success
  }

  const logout = async (redirectPath = '/login'): Promise<void> => {
    await authStore.logout()
    await router.push(redirectPath)
  }

  const refreshToken = async (): Promise<boolean> => {
    return authStore.refreshToken()
  }

  // Route guard helpers
  const requireAuth = (): boolean => {
    if (!isAuthenticated.value) {
      router.push('/login')
      return false
    }
    return true
  }

  const requireGuest = (): boolean => {
    if (isAuthenticated.value) {
      router.push('/')
      return false
    }
    return true
  }

  // Permission checks (can be extended based on user roles)
  const hasPermission = (permission: string): boolean => {
    // For now, all authenticated users have all permissions
    // This can be extended to check user.permissions or user.roles
    return isAuthenticated.value
  }

  const canAccessRoute = (routeName: string): boolean => {
    // Define route permissions here
    const publicRoutes = ['login', 'register', 'forgot-password']
    
    if (publicRoutes.includes(routeName)) {
      return true
    }
    
    return isAuthenticated.value
  }

  // User management helpers
  const getCurrentUser = async () => {
    return authStore.getCurrentUser()
  }

  const clearError = () => {
    authStore.clearError()
  }

  // Initialize authentication on app startup
  const initialize = async (): Promise<boolean> => {
    return authStore.initialize()
  }

  return {
    // State
    isAuthenticated,
    user,
    loading,
    error,

    // Actions
    login,
    logout,
    refreshToken,
    getCurrentUser,
    clearError,
    initialize,

    // Route guards
    requireAuth,
    requireGuest,

    // Permissions
    hasPermission,
    canAccessRoute
  }
}

// Route guard function for Vue Router
export function createAuthGuard() {
  return async (to: any, from: any, next: any) => {
    const { isAuthenticated, initialize } = useAuth()
    
    // Try to restore authentication state
    if (!isAuthenticated.value) {
      await initialize()
    }
    
    const isAuthRoute = ['login', 'register', 'forgot-password'].includes(to.name)
    
    if (isAuthRoute) {
      // Redirect authenticated users away from auth pages
      if (isAuthenticated.value) {
        next({ name: 'dashboard' })
      } else {
        next()
      }
    } else {
      // Require authentication for protected routes
      if (isAuthenticated.value) {
        next()
      } else {
        next({ name: 'login', query: { redirect: to.fullPath } })
      }
    }
  }
}

// Helper for redirecting after login
export function getRedirectPath(route: any): string {
  const redirectQuery = route.query.redirect as string
  
  // Validate redirect path to prevent open redirect vulnerabilities
  if (redirectQuery && redirectQuery.startsWith('/')) {
    return redirectQuery
  }
  
  return '/'
}