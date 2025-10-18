import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { authApi } from '@/services/auth'

// Mock auth API
vi.mock('@/services/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
    changePassword: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
vi.stubGlobal('localStorage', localStorageMock)

const mockAuthApi = vi.mocked(authApi)

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('initialization', () => {
    it('initializes with empty state', () => {
      const store = useAuthStore()
      
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('loads token from localStorage on init', () => {
      localStorageMock.getItem.mockReturnValue('stored-token')
      
      // Create a new pinia instance to force reinitialization
      setActivePinia(createPinia())
      const store = useAuthStore()
      
      expect(store.token).toBe('stored-token')
      expect(store.isAuthenticated).toBe(false) // No user data yet, so not authenticated
    })
  })

  describe('login', () => {
    it('successfully logs in user', async () => {
      const store = useAuthStore()
      const mockResponse = {
        success: true,
        data: {
          user: { id: 1, username: 'testuser', email: 'test@example.com' },
          token: 'jwt-token'
        }
      }
      
      mockAuthApi.login.mockResolvedValue(mockResponse)

      const credentials = { username: 'testuser', password: 'password' }
      const result = await store.login(credentials)

      expect(store.loading).toBe(false)
      expect(store.user).toEqual(mockResponse.data.user)
      expect(store.token).toBe('jwt-token')
      expect(store.isAuthenticated).toBe(true)
      expect(store.error).toBeNull()
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'jwt-token')
      expect(result.success).toBe(true)
    })

    it('handles login failure', async () => {
      const store = useAuthStore()
      const mockError = {
        success: false,
        error: 'Invalid credentials'
      }
      
      mockAuthApi.login.mockResolvedValue(mockError)

      const credentials = { username: 'bad', password: 'wrong' }
      const result = await store.login(credentials)

      expect(store.loading).toBe(false)
      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.error).toBe('Invalid credentials')
      expect(result.success).toBe(false)
    })

    it('sets loading state during login', async () => {
      const store = useAuthStore()
      mockAuthApi.login.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 100))
      )

      const loginPromise = store.login({ username: 'test', password: 'test' })
      
      expect(store.loading).toBe(true)
      
      await loginPromise
      
      expect(store.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('successfully logs out user', async () => {
      const store = useAuthStore()
      
      // Set initial authenticated state
      store.user = { id: 1, username: 'testuser', email: 'test@example.com' }
      store.token = 'jwt-token'
      
      mockAuthApi.logout.mockResolvedValue({ success: true })

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(mockAuthApi.logout).toHaveBeenCalled()
    })

    it('clears state even if API call fails', async () => {
      const store = useAuthStore()
      
      // Set initial authenticated state
      store.user = { id: 1, username: 'testuser', email: 'test@example.com' }
      store.token = 'jwt-token'
      
      mockAuthApi.logout.mockRejectedValue(new Error('Network error'))

      await store.logout()

      expect(store.user).toBeNull()
      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
    })
  })

  describe('getCurrentUser', () => {
    it('fetches current user successfully', async () => {
      const store = useAuthStore()
      store.token = 'test-token' // Set token for the test
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      }
      
      mockAuthApi.getCurrentUser.mockResolvedValue({
        success: true,
        data: mockUser
      })

      const result = await store.getCurrentUser()

      expect(store.user).toEqual(mockUser)
      expect(result.success).toBe(true)
    })

    it('handles getCurrentUser failure', async () => {
      const store = useAuthStore()
      store.token = 'test-token' // Set token for the test
      
      mockAuthApi.getCurrentUser.mockResolvedValue({
        success: false,
        error: 'Unauthorized'
      })

      const result = await store.getCurrentUser()

      expect(store.user).toBeNull()
      expect(store.error).toBe('Unauthorized')
      expect(result.success).toBe(false)
    })
  })

  describe('refreshToken', () => {
    it('refreshes token successfully', async () => {
      const store = useAuthStore()
      store.token = 'old-token' // Set token for the test
      
      mockAuthApi.refreshToken.mockResolvedValue({
        success: true,
        data: { token: 'new-jwt-token', expires_in: 3600 }
      })

      const result = await store.refreshToken()

      expect(store.token).toBe('new-jwt-token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-jwt-token')
      expect(result.success).toBe(true)
    })

    it('handles refresh failure', async () => {
      const store = useAuthStore()
      store.token = 'expired-token' // Set token for the test
      
      mockAuthApi.refreshToken.mockResolvedValue({
        success: false,
        error: 'Token expired'
      })

      const result = await store.refreshToken()

      expect(result.success).toBe(false)
      expect(store.error).toBe('Token expired')
    })
  })

  describe('changePassword', () => {
    it('changes password successfully', async () => {
      const store = useAuthStore()
      
      mockAuthApi.changePassword.mockResolvedValue({
        success: true
      })

      const passwordData = {
        currentPassword: 'old',
        newPassword: 'new123',
        confirmPassword: 'new123'
      }

      const result = await store.changePassword(passwordData)

      expect(mockAuthApi.changePassword).toHaveBeenCalledWith(passwordData)
      expect(result.success).toBe(true)
    })

    it('handles password change failure', async () => {
      const store = useAuthStore()
      
      mockAuthApi.changePassword.mockResolvedValue({
        success: false,
        error: 'Current password incorrect'
      })

      const passwordData = {
        currentPassword: 'wrong',
        newPassword: 'new123',
        confirmPassword: 'new123'
      }

      const result = await store.changePassword(passwordData)

      expect(store.error).toBe('Current password incorrect')
      expect(result.success).toBe(false)
    })
  })
})