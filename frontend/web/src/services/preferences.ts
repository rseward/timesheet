import { apiService } from './api'

export interface UserPreference {
  preference_key: string
  preference_value: string
  user_id: number
}

export interface PreferenceUpdateData {
  preference_key: string
  preference_value: string
}

// Helper function to get current user ID from localStorage token
const getCurrentUserId = (): number => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) throw new Error('No auth token')
    
    // Decode JWT payload (middle part)
    const payload = JSON.parse(atob(token.split('.')[1]))
    return parseInt(payload.sub) || 1
  } catch {
    return 1 // Fallback to user ID 1
  }
}

export const preferencesApi = {
  async getAll(): Promise<{ success: boolean; data?: UserPreference[]; error?: string }> {
    try {
      const userId = getCurrentUserId()
      const response = await apiService.get<{ preferences: Record<string, string> }>(`/preferences/user/${userId}`)
      
      // Convert backend format to frontend format
      const preferences: UserPreference[] = Object.entries(response.preferences).map(([key, value]) => ({
        preference_key: key,
        preference_value: value,
        user_id: userId
      }))
      
      return { success: true, data: preferences }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch preferences' }
    }
  },

  async getByKey(key: string): Promise<string | null> {
    try {
      const userId = getCurrentUserId()
      const response = await apiService.get<{ preference_key: string; preference_value: string }>(`/preferences/user/${userId}/${key}`)
      return response.preference_value
    } catch {
      return null
    }
  },

  async set(key: string, value: string): Promise<{ success: boolean; data?: UserPreference; error?: string }> {
    try {
      const userId = getCurrentUserId()
      const response = await apiService.post<{ preference: UserPreference }>(`/preferences/user/${userId}`, {
        preference_key: key,
        preference_value: value
      })
      return { success: true, data: response.preference }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to set preference' }
    }
  },

  async update(key: string, value: string): Promise<{ success: boolean; data?: UserPreference; error?: string }> {
    // Backend uses POST for both create and update
    return this.set(key, value)
  },

  async delete(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = getCurrentUserId()
      await apiService.delete<void>(`/preferences/user/${userId}/${key}`)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete preference' }
    }
  },

  // Convenience methods for common preferences
  async getDefaultStartTime(): Promise<string | null> {
    return this.getByKey('start_time')
  },

  async setDefaultStartTime(time: string): Promise<{ success: boolean; error?: string }> {
    return this.set('start_time', time)
  },

  async getDefaultEndTime(): Promise<string | null> {
    return this.getByKey('end_time')
  },

  async setDefaultEndTime(time: string): Promise<{ success: boolean; error?: string }> {
    return this.set('end_time', time)
  },

  async getWorkingHours(): Promise<{ startTime: string; endTime: string }> {
    const startTime = await this.getDefaultStartTime()
    const endTime = await this.getDefaultEndTime()
    
    return {
      startTime: startTime || '09:00',
      endTime: endTime || '17:00'
    }
  },

  async setWorkingHours(startTime: string, endTime: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = getCurrentUserId()
      
      // Use bulk update endpoint for efficiency
      await apiService.put<{ preferences: UserPreference[] }>(`/preferences/user/${userId}/bulk`, {
        start_time: startTime,
        end_time: endTime
      })
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to set working hours' }
    }
  },

  async resetToDefaults(): Promise<{ success: boolean; error?: string }> {
    // Reset to default work hours (9:00 AM to 5:00 PM)
    return this.setWorkingHours('09:00', '17:00')
  }
}