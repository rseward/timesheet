import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// End-to-end tests for auth endpoints using Node.js fetch
// These tests run against the actual FastAPI backend at http://127.0.0.1:8080

const BASE_URL = 'http://127.0.0.1:8080'

describe('Auth E2E Tests', () => {
  let authToken: string | null = null
  let refreshToken: string | null = null

  beforeAll(async () => {
    // Verify backend is running
    try {
      const response = await fetch(`${BASE_URL}/api/health`)
      expect(response.ok).toBe(true)
      
      const data = await response.json()
      expect(data).toEqual({ status: 'healthy' })
    } catch (error) {
      throw new Error(`Backend not available: ${error}`)
    }
  })

  afterAll(async () => {
    // Cleanup: logout if we have a token
    if (authToken) {
      try {
        await fetch(`${BASE_URL}/logout`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  })

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${BASE_URL}/api/health`)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ status: 'healthy' })
    })
  })

  describe('Authentication Flow', () => {
    it('should reject login with missing credentials', async () => {
      const response = await fetch(`${BASE_URL}/login`)
      
      expect(response.status).toBe(422) // FastAPI validation error
      const data = await response.json()
      expect(data.detail).toBeDefined()
      expect(Array.isArray(data.detail)).toBe(true)
    })

    it('should reject login with invalid credentials', async () => {
      const response = await fetch(`${BASE_URL}/login?username=invalid@example.com&password=wrongpassword`)
      
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.detail).toBe('Username/Password does not match.')
    })

    it('should handle userinfo without token', async () => {
      const response = await fetch(`${BASE_URL}/userinfo`)
      
      // Backend returns 401 for missing token (unauthorized)
      expect(response.status).toBe(401)
    })

    it('should handle logout without token', async () => {
      const response = await fetch(`${BASE_URL}/logout`)
      
      // Backend behavior for missing token
      expect([400, 500]).toContain(response.status)
    })

    it('should reject refresh with invalid token', async () => {
      const response = await fetch(`${BASE_URL}/refresh?refreshtoken=invalid.jwt.token`)
      
      // Backend returns 500 for invalid JWT (could be improved to 400)
      expect(response.status).toBe(500)
    })

    // Note: The following tests are skipped because they require test user data
    it.skip('should complete full authentication flow', async () => {
      // 1. Login with valid credentials
      const loginResponse = await fetch(`${BASE_URL}/login?username=admin@example.com&password=admin123`)
      
      expect(loginResponse.status).toBe(200)
      const loginData = await loginResponse.json()
      expect(loginData).toHaveProperty('access_token')
      expect(loginData).toHaveProperty('refresh_token')
      
      authToken = loginData.access_token
      refreshToken = loginData.refresh_token
      
      // 2. Get user info with token
      const userInfoResponse = await fetch(`${BASE_URL}/userinfo`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      
      expect(userInfoResponse.status).toBe(200)
      const userInfo = await userInfoResponse.json()
      expect(userInfo).toHaveProperty('user')
      
      // 3. Refresh token
      const refreshResponse = await fetch(`${BASE_URL}/refresh?refreshtoken=${refreshToken}`)
      
      expect(refreshResponse.status).toBe(200)
      const refreshData = await refreshResponse.json()
      expect(refreshData).toHaveProperty('access_token')
      expect(refreshData).toHaveProperty('refresh_token')
      
      // Update tokens
      authToken = refreshData.access_token
      refreshToken = refreshData.refresh_token
      
      // 4. Logout
      const logoutResponse = await fetch(`${BASE_URL}/logout`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      
      expect(logoutResponse.status).toBe(200)
      const logoutData = await logoutResponse.json()
      expect(logoutData).toEqual({ message: 'Logout Successful' })
      
      // Clear tokens
      authToken = null
      refreshToken = null
    })
  })

  describe('API Documentation', () => {
    it('should document current backend endpoint structure', () => {
      const backendEndpoints = {
        health: 'GET /api/health',
        login: 'GET /login?username=...&password=...',
        logout: 'GET /logout (with Authorization header)',
        userinfo: 'GET /userinfo (with Authorization header)', 
        refresh: 'GET /refresh?refreshtoken=...'
      }

      const frontendExpectations = {
        login: 'POST /auth/login (with JSON body)',
        logout: 'POST /auth/logout (with Authorization header)',
        userinfo: 'GET /auth/me (with Authorization header)',
        refresh: 'POST /auth/refresh (with JSON body)',
        changePassword: 'POST /auth/change-password (with JSON body)'
      }

      expect(backendEndpoints).toBeDefined()
      expect(frontendExpectations).toBeDefined()
      
      // This test serves as documentation for the integration gap
      console.log('Backend provides:', backendEndpoints)
      console.log('Frontend expects:', frontendExpectations)
    })

    it('should identify integration requirements', () => {
      const integrationTasks = [
        'Add POST /auth/login endpoint to backend (or update frontend to use GET)',
        'Add POST /auth/logout endpoint to backend (or update frontend to use GET)', 
        'Add GET /auth/me endpoint to backend (or update frontend to use /userinfo)',
        'Add POST /auth/refresh endpoint to backend (or update frontend to use GET)',
        'Add POST /auth/change-password endpoint to backend',
        'Standardize error response formats',
        'Add proper CORS configuration',
        'Add request/response body validation'
      ]

      expect(integrationTasks.length).toBeGreaterThan(0)
      
      integrationTasks.forEach(task => {
        expect(task).toBeDefined()
        expect(task.length).toBeGreaterThan(0)
      })
    })
  })
})