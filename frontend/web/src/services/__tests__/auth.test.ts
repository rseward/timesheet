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
    it('calls POST /auth/login with credentials', async () => {
      const mockApiResponse = {
        user: { id: 1, username: 'testuser', email: 'test@example.com' },
        token: 'test-jwt-token'
      }
      
      const expectedResponse = {
        success: true,
        data: mockApiResponse
      }
      
      mockApiService.post.mockResolvedValue(mockApiResponse)

      const credentials = { username: 'testuser', password: 'password123' }
      const result = await authApi.login(credentials)

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/login', credentials)
      expect(result).toEqual(expectedResponse)
    })

    it('handles login failure', async () => {
      const mockError = new Error('Invalid credentials')
      
      mockApiService.post.mockRejectedValue(mockError)

      const credentials = { username: 'baduser', password: 'wrongpass' }
      const result = await authApi.login(credentials)

      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials'
      })
    })
  })

  describe('logout', () => {
    it('calls POST /auth/logout', async () => {
      mockApiService.post.mockResolvedValue(null)

      const result = await authApi.logout()

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/logout')
      expect(result).toEqual({ success: true })
    })
  })

  describe('getCurrentUser', () => {
    it('calls GET /auth/me', async () => {
      const mockApiResponse = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      }
      
      const expectedResponse = {
        success: true,
        data: mockApiResponse
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const result = await authApi.getCurrentUser()

      expect(mockApiService.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('refreshToken', () => {
    it('calls POST /auth/refresh', async () => {
      const mockApiResponse = {
        token: 'new-jwt-token',
        expires_in: 3600
      }
      
      const expectedResponse = {
        success: true,
        data: mockApiResponse
      }
      
      mockApiService.post.mockResolvedValue(mockApiResponse)

      const result = await authApi.refreshToken()

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/refresh')
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('changePassword', () => {
    it('calls POST /auth/change-password with password data', async () => {
      mockApiService.post.mockResolvedValue(null)

      const passwordData = {
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      }
      
      const result = await authApi.changePassword(passwordData)

      expect(mockApiService.post).toHaveBeenCalledWith('/auth/change-password', passwordData)
      expect(result).toEqual({ success: true })
    })
  })
})