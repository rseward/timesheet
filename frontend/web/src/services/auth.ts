import { apiService } from './api'
import type { User, LoginCredentials, LoginResponse, UserInfoResponse, ChangePasswordData } from '@/types/auth'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ success: boolean; data?: LoginResponse; error?: string }> {
    try {
      // Backend expects GET /login with query parameters
      const params = new URLSearchParams({
        username: credentials.username,
        password: credentials.password
      })
      
      const response = await apiService.get<LoginResponse>(`/login?${params.toString()}`)
      
      if (response.access_token) {
        apiService.setAuthToken(response.access_token)
      }
      
      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      // Backend expects GET /logout with Authorization header
      await apiService.get('/logout')
      return { success: true }
    } finally {
      // Always clear token even if logout request fails
      apiService.logout()
    }
  },

  async refreshToken(refreshToken: string): Promise<{ success: boolean; data?: LoginResponse; error?: string }> {
    try {
      // Backend expects GET /refresh with refreshtoken query parameter
      const params = new URLSearchParams({
        refreshtoken: refreshToken
      })
      
      const response = await apiService.get<LoginResponse>(`/refresh?${params.toString()}`)
      
      if (response.access_token) {
        apiService.setAuthToken(response.access_token)
      }
      
      return {
        success: true,
        data: response
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Token refresh failed'
      }
    }
  },

  async getCurrentUser(): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      // Backend provides GET /userinfo with Authorization header
      const response = await apiService.get<UserInfoResponse>('/userinfo')
      
      // Backend returns { user: "JSON string" }, parse the JSON user data
      let user: User
      try {
        if (typeof response.user === 'string') {
          user = JSON.parse(response.user)
        } else {
          user = response.user
        }
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid user data format from server'
        }
      }
      
      return {
        success: true,
        data: user
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get user info'
      }
    }
  },

  async verifyToken(): Promise<boolean> {
    const result = await this.getCurrentUser()
    return result.success
  },

  async changePassword(_passwordData: ChangePasswordData): Promise<{ success: boolean; error?: string }> {
    // Change password endpoint not implemented in backend
    return {
      success: false,
      error: 'Change password functionality not available'
    }
  }
}
