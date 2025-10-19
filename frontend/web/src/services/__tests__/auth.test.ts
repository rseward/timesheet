import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from '../auth'
import { apiService } from '../api'

// Mock the API service
vi.mock('../api', () => ({
  apiService: {
    post: vi.fn(),
    get: vi.fn(),
    setAuthToken: vi.fn(),
    logout: vi.fn()
  }
}))

const mockApiService = vi.mocked(apiService)

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('calls GET /login with query parameters', async () => {
      const mockApiResponse = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token'
      }
      
      const expectedResponse = {
        success: true,
        data: mockApiResponse
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const credentials = { username: 'testuser', password: 'password123' }
      const result = await authApi.login(credentials)

      expect(mockApiService.get).toHaveBeenCalledWith('/login?username=testuser&password=password123')
      expect(mockApiService.setAuthToken).toHaveBeenCalledWith('test-access-token')
      expect(result).toEqual(expectedResponse)
    })

    it('handles login failure', async () => {
      const mockError = new Error('Invalid credentials')
      
      mockApiService.get.mockRejectedValue(mockError)

      const credentials = { username: 'baduser', password: 'wrongpass' }
      const result = await authApi.login(credentials)

      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials'
      })
    })
  })

  describe('logout', () => {
    it('calls GET /logout', async () => {
      mockApiService.get.mockResolvedValue({ message: 'Logout Successful' })

      const result = await authApi.logout()

      expect(mockApiService.get).toHaveBeenCalledWith('/logout')
      expect(mockApiService.logout).toHaveBeenCalled()
      expect(result).toEqual({ success: true })
    })

    it('clears token even if logout fails', async () => {
      const mockError = new Error('Network error')
      mockApiService.get.mockRejectedValue(mockError)

      try {
        await authApi.logout()
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeDefined()
        expect(mockApiService.logout).toHaveBeenCalled()
      }
    })
  })

  describe('getCurrentUser', () => {
    it('calls GET /userinfo and parses JSON user data', async () => {
      const userData = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        active: true
      }
      
      const mockApiResponse = {
        user: JSON.stringify(userData)
      }
      
      const expectedResponse = {
        success: true,
        data: userData
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const result = await authApi.getCurrentUser()

      expect(mockApiService.get).toHaveBeenCalledWith('/userinfo')
      expect(result).toEqual(expectedResponse)
    })

    it('handles invalid JSON in user data', async () => {
      const mockApiResponse = {
        user: 'invalid-json{'
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const result = await authApi.getCurrentUser()

      expect(result).toEqual({
        success: false,
        error: 'Invalid user data format from server'
      })
    })

    it('handles API errors', async () => {
      const mockError = new Error('Unauthorized')
      mockApiService.get.mockRejectedValue(mockError)

      const result = await authApi.getCurrentUser()

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized'
      })
    })
  })

  describe('refreshToken', () => {
    it('calls GET /refresh with refreshtoken parameter', async () => {
      const mockApiResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token'
      }
      
      const expectedResponse = {
        success: true,
        data: mockApiResponse
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const result = await authApi.refreshToken('old-refresh-token')

      expect(mockApiService.get).toHaveBeenCalledWith('/refresh?refreshtoken=old-refresh-token')
      expect(mockApiService.setAuthToken).toHaveBeenCalledWith('new-access-token')
      expect(result).toEqual(expectedResponse)
    })

    it('handles refresh token errors', async () => {
      const mockError = new Error('Expired or invalid refresh token.')
      mockApiService.get.mockRejectedValue(mockError)

      const result = await authApi.refreshToken('invalid-token')

      expect(result).toEqual({
        success: false,
        error: 'Expired or invalid refresh token.'
      })
    })
  })

  describe('verifyToken', () => {
    it('returns true when getCurrentUser succeeds', async () => {
      const userData = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        active: true
      }
      
      const mockApiResponse = {
        user: JSON.stringify(userData)
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const result = await authApi.verifyToken()

      expect(result).toBe(true)
      expect(mockApiService.get).toHaveBeenCalledWith('/userinfo')
    })

    it('returns false when getCurrentUser fails', async () => {
      const mockError = new Error('Unauthorized')
      mockApiService.get.mockRejectedValue(mockError)

      const result = await authApi.verifyToken()

      expect(result).toBe(false)
    })
  })

  describe('changePassword', () => {
    it('returns error for unimplemented feature', async () => {
      const passwordData = {
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      }
      
      const result = await authApi.changePassword(passwordData)

      expect(result).toEqual({
        success: false,
        error: 'Change password functionality not available'
      })
      
      // Should not make any API calls
      expect(mockApiService.post).not.toHaveBeenCalled()
    })
  })
})