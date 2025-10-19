import { apiService } from './api'
import type { User, LoginCredentials, LoginResponse, UserInfoResponse, ChangePasswordData } from '@/types/auth'
import { triggerTokenRefreshStart } from '@/composables/useGlobalTokenRefresh'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ success: boolean; data?: LoginResponse; error?: string }> {
    try {
      // Backend expects GET /login with query parameters
      const params = new URLSearchParams({
        username: credentials.username,
        password: credentials.password
      })
      
      const response = await apiService.get<LoginResponse>(`/login?${params.toString()}`)
      
      console.log('🔑 [AuthAPI] Login response:', {
        access_token: !!response.access_token,
        refresh_token: !!response.refresh_token,
        response
      })
      
      // Store both tokens if present
      if (response.access_token) {
        apiService.setAuthToken(response.access_token)
        console.log('🔑 [AuthAPI] ✅ Access token stored')
      }
      
      if (response.refresh_token) {
        apiService.setRefreshToken(response.refresh_token)
        console.log('🔑 [AuthAPI] ✅ Refresh token stored')
      } else {
        console.warn('🔑 [AuthAPI] ⚠️ No refresh_token in login response!')
        console.log('🔑 [AuthAPI] Backend response keys:', Object.keys(response))
      }
      
      // Trigger token refresh system if both tokens are now available
      const hasAccessToken = localStorage.getItem('auth_token')
      const hasRefreshToken = localStorage.getItem('refresh_token')
      
      if (hasAccessToken && hasRefreshToken) {
        console.log('🔑 [AuthAPI] ✅ Both tokens stored - triggering token refresh system')
        setTimeout(async () => {
          const started = await triggerTokenRefreshStart()
          console.log('🔑 [AuthAPI] Token refresh system start result:', started)
        }, 100) // Small delay to ensure all login processing is complete
      } else {
        console.warn('🔑 [AuthAPI] Cannot start token refresh - missing tokens:', {
          hasAccessToken: !!hasAccessToken,
          hasRefreshToken: !!hasRefreshToken
        })
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
      
      console.log('🔄 [AuthAPI] Refresh response:', {
        access_token: !!response.access_token,
        refresh_token: !!response.refresh_token,
        response
      })
      
      // Store both tokens if present
      if (response.access_token) {
        apiService.setAuthToken(response.access_token)
        console.log('🔄 [AuthAPI] ✅ New access token stored')
      }
      
      if (response.refresh_token) {
        apiService.setRefreshToken(response.refresh_token)
        console.log('🔄 [AuthAPI] ✅ New refresh token stored')
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
