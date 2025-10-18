import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/auth'
import type { User, LoginCredentials, AuthResponse, ChangePasswordData } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)

  // Actions
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)
      
      if (response.success && response.data) {
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('auth_token', response.data.token)
        return { success: true }
      } else {
        error.value = response.error || 'Login failed'
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout()
    } catch (err) {
      console.warn('Logout request failed, but clearing local state anyway', err)
    } finally {
      // Always clear local state
      token.value = null
      user.value = null
      error.value = null
      localStorage.removeItem('auth_token')
    }
  }

  const getCurrentUser = async (): Promise<{ success: boolean; data?: User; error?: string }> => {
    if (!token.value) return { success: false, error: 'No token' }

    loading.value = true
    error.value = null

    try {
      const response = await authApi.getCurrentUser()
      if (response.success && response.data) {
        user.value = response.data
        return { success: true, data: response.data }
      } else {
        error.value = response.error || 'Failed to get user data'
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get user data'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const refreshToken = async (): Promise<{ success: boolean; error?: string }> => {
    if (!token.value) return { success: false, error: 'No token' }

    try {
      const response = await authApi.refreshToken()
      if (response.success && response.data) {
        token.value = response.data.token
        localStorage.setItem('auth_token', response.data.token)
        return { success: true }
      } else {
        const errorMsg = response.error || 'Token refresh failed'
        error.value = errorMsg
        await logout()
        error.value = errorMsg // Restore error after logout clears it
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Token refresh failed'
      error.value = errorMessage
      await logout()
      error.value = errorMessage // Restore error after logout clears it
      return { success: false, error: errorMessage }
    }
  }

  const verifyToken = async (): Promise<boolean> => {
    if (!token.value) return false

    try {
      const isValid = await authApi.verifyToken()
      if (!isValid) {
        await logout()
      }
      return isValid
    } catch {
      await logout()
      return false
    }
  }

  const changePassword = async (passwordData: ChangePasswordData): Promise<{ success: boolean; error?: string }> => {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.changePassword(passwordData)
      if (response.success) {
        return { success: true }
      } else {
        error.value = response.error || 'Password change failed'
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password change failed'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  // Initialize store
  const initialize = async (): Promise<boolean> => {
    if (token.value) {
      const isValid = await verifyToken()
      if (isValid) {
        await getCurrentUser()
        return true
      }
    }
    return false
  }

  // Listen for auth logout events (from API service)
  window.addEventListener('auth:logout', () => {
    logout()
  })

  return {
    // State (direct refs for test mutability)
    user,
    token,
    loading,
    error,

    // Getters
    isAuthenticated,
    isLoading,
    hasError,

    // Actions
    login,
    logout,
    getCurrentUser,
    refreshToken,
    changePassword,
    verifyToken,
    clearError,
    initialize
  }
})