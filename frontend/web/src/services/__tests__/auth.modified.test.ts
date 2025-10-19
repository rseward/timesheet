import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from '../auth'
import { apiService } from '../api'

// Tests for the modified auth service that matches backend API
vi.mock('../api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    setAuthToken: vi.fn(),
    logout: vi.fn()
  }
}))

const mockApiService = vi.mocked(apiService)

describe('Modified Auth API (Backend Compatible)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Login with query parameters', () => {
    it('should make GET request with query parameters', async () => {
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

  describe('Logout with GET request', () => {
    it('should make GET request to /logout', async () => {
      const backendResponse = { message: 'Logout Successful' }
      mockApiService.get.mockResolvedValue(backendResponse)

      const result = await authApi.logout()

      expect(mockApiService.get).toHaveBeenCalledWith('/logout')
      expect(result.success).toBe(true)
      expect(mockApiService.logout).toHaveBeenCalled() // Token cleared
    })
  })

  describe('Refresh token with query parameters', () => {
    it('should make GET request with refreshtoken parameter', async () => {
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

  describe('Get current user from /userinfo', () => {
    it('should parse user data from backend response', async () => {
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

    it('should handle invalid user data format', async () => {
      const backendResponse = {
        user: 'invalid-json{'
      }
      
      mockApiService.get.mockResolvedValue(backendResponse)

      const result = await authApi.getCurrentUser()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid user data format from server')
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
})