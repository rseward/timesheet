import { apiService } from './api'

export interface UserPreference {
  id: number
  key: string
  value: string
  userId: number
}

export interface PreferenceUpdateData {
  key: string
  value: string
}

export const preferencesApi = {
  async getAll(): Promise<UserPreference[]> {
    const response = await apiService.get<UserPreference[]>('/preferences')
    return response.data
  },

  async getByKey(key: string): Promise<string | null> {
    try {
      const response = await apiService.get<UserPreference>(`/preferences/${key}`)
      return response.data.value
    } catch {
      return null
    }
  },

  async set(key: string, value: string): Promise<UserPreference> {
    const response = await apiService.post<UserPreference>('/preferences', { key, value })
    return response.data
  },

  async update(key: string, value: string): Promise<UserPreference> {
    const response = await apiService.put<UserPreference>(`/preferences/${key}`, { value })
    return response.data
  },

  async delete(key: string): Promise<void> {
    await apiService.delete<void>(`/preferences/${key}`)
  },

  // Convenience methods for common preferences
  async getDefaultStartTime(): Promise<string | null> {
    return this.getByKey('default_start_time')
  },

  async setDefaultStartTime(time: string): Promise<void> {
    await this.set('default_start_time', time)
  },

  async getDefaultEndTime(): Promise<string | null> {
    return this.getByKey('default_end_time')
  },

  async setDefaultEndTime(time: string): Promise<void> {
    await this.set('default_end_time', time)
  },

  async getWorkingHours(): Promise<{ startTime: string; endTime: string } | null> {
    const startTime = await this.getDefaultStartTime()
    const endTime = await this.getDefaultEndTime()
    
    if (startTime && endTime) {
      return { startTime, endTime }
    }
    
    return null
  },

  async setWorkingHours(startTime: string, endTime: string): Promise<void> {
    await Promise.all([
      this.setDefaultStartTime(startTime),
      this.setDefaultEndTime(endTime)
    ])
  },

  async resetToDefaults(): Promise<void> {
    // Reset to default work hours (9:00 AM to 5:00 PM)
    await this.setWorkingHours('09:00', '17:00')
  }
}