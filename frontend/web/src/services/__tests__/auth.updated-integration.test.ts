import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from '../auth'
import { apiService } from '../api'

// Tests for the UPDATED auth service that matches the Python backend
vi.mock('../api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    setAuthToken: vi.fn(),
    setRefreshToken: vi.fn(),
    logout: vi.fn()
  }
}))

const mockApiService = vi.mocked(apiService)

describe('Updated Auth API (Python Backend Compatible)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Login (GET with query params)', () => {
    it('should make GET request with URL-encoded credentials', async () => {
      const backendResponse = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IlJlZnJlc2gifQ...'
      }
      
      mockApiService.get.mockResolvedValue(backendResponse)

      const credentials = { username: 'test@example.com', password: 'password123' }
      const result = await authApi.login(credentials)

      expect(mockApiService.get).toHaveBeenCalledWith('/login?username=test%40example.com&password=password123')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(backendResponse)
      expect(mockApiService.setAuthToken).toHaveBeenCalledWith(backendResponse.access_token)
    })

    it('should handle login errors', async () => {
      const error = new Error('Username/Password does not match.')
      mockApiService.get.mockRejectedValue(error)

      const credentials = { username: 'invalid@example.com', password: 'wrongpass' }
      const result = await authApi.login(credentials)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Username/Password does not match.')
    })
  })

  describe('Logout (GET request)', () => {
    it('should make GET request to /logout', async () => {
      const backendResponse = { message: 'Logout Successful' }
      mockApiService.get.mockResolvedValue(backendResponse)

      const result = await authApi.logout()

      expect(mockApiService.get).toHaveBeenCalledWith('/logout')
      expect(result.success).toBe(true)
      expect(mockApiService.logout).toHaveBeenCalled()
    })

    it('should clear token even if logout fails', async () => {
      const error = new Error('Server error')
      mockApiService.get.mockRejectedValue(error)

      try {
        await authApi.logout()
        expect.fail('Should have thrown error')
      } catch (thrownError) {
        expect(thrownError).toBeDefined()
        expect(mockApiService.logout).toHaveBeenCalled()
      }
    })
  })

  describe('Get current user (/userinfo)', () => {
    it('should call /userinfo and parse JSON user data', async () => {
      const userData = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        active: true
      }
      
      const backendResponse = {
        user: JSON.stringify(userData)
      }
      
      mockApiService.get.mockResolvedValue(backendResponse)

      const result = await authApi.getCurrentUser()

      expect(mockApiService.get).toHaveBeenCalledWith('/userinfo')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(userData)
    })

    it('should handle invalid JSON in user data', async () => {
      const backendResponse = {
        user: 'invalid-json{'
      }
      
      mockApiService.get.mockResolvedValue(backendResponse)

      const result = await authApi.getCurrentUser()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid user data format from server')
    })

    it('should handle API errors', async () => {
      const error = new Error('Unauthorized')
      mockApiService.get.mockRejectedValue(error)

      const result = await authApi.getCurrentUser()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
    })
  })

  describe('Refresh token (GET with query params)', () => {
    it('should make GET request with refresh token param', async () => {
      const backendResponse = {
        access_token: 'new.access.token',
        refresh_token: 'new.refresh.token'
      }
      
      mockApiService.get.mockResolvedValue(backendResponse)

      const refreshToken = 'old.refresh.token'
      const result = await authApi.refreshToken(refreshToken)

      expect(mockApiService.get).toHaveBeenCalledWith('/refresh?refreshtoken=old.refresh.token')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(backendResponse)
      expect(mockApiService.setAuthToken).toHaveBeenCalledWith('new.access.token')
    })

    it('should handle refresh token errors', async () => {
      const error = new Error('Expired or invalid refresh token.')
      mockApiService.get.mockRejectedValue(error)

      const result = await authApi.refreshToken('invalid.token')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Expired or invalid refresh token.')
    })
  })

  describe('Change password (not implemented)', () => {
    it('should return error for unimplemented feature', async () => {
      const passwordData = {
        currentPassword: 'old',
        newPassword: 'new',
        confirmPassword: 'new'
      }

      const result = await authApi.changePassword(passwordData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Change password functionality not available')
    })
  })

  describe('Token verification', () => {
    it('should verify token by calling getCurrentUser', async () => {
      const userData = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        active: true
      }
      
      const backendResponse = {
        user: JSON.stringify(userData)
      }
      
      mockApiService.get.mockResolvedValue(backendResponse)

      const result = await authApi.verifyToken()

      expect(result).toBe(true)
      expect(mockApiService.get).toHaveBeenCalledWith('/userinfo')
    })

    it('should return false if token verification fails', async () => {
      const error = new Error('Unauthorized')
      mockApiService.get.mockRejectedValue(error)

      const result = await authApi.verifyToken()

      expect(result).toBe(false)
    })
  })
})