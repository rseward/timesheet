import { apiService } from './api'
import type { User, LoginCredentials, AuthResponse, ChangePasswordData } from '@/types/auth'

export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ success: boolean; data?: { user: User; token: string }; error?: string }> {
    try {
      const response = await apiService.post<{ user: User; token: string }>('/auth/login', credentials)
      
      if (response.token) {
        apiService.setAuthToken(response.token)
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
      await apiService.post('/auth/logout')
      return { success: true }
    } finally {
      // Always clear token even if logout request fails
      apiService.logout()
    }
  },

  async refreshToken(): Promise<{ success: boolean; data?: { token: string; expires_in: number }; error?: string }> {
    const response = await apiService.post<{ token: string; expires_in: number }>('/auth/refresh')
    
    if (response.token) {
      apiService.setAuthToken(response.token)
    }
    
    return {
      success: true,
      data: response
    }
  },

  async getCurrentUser(): Promise<{ success: boolean; data?: User; error?: string }> {
    const response = await apiService.get<User>('/auth/me')
    return {
      success: true,
      data: response
    }
  },

  async verifyToken(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch {
      return false
    }
  },

  async changePassword(passwordData: ChangePasswordData): Promise<{ success: boolean; error?: string }> {
    await apiService.post('/auth/change-password', passwordData)
    return { success: true }
  }
}
