import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { preferencesApi, type UserPreference } from '@/services/preferences'

export const usePreferencesStore = defineStore('preferences', () => {
  // State
  const preferences = ref<UserPreference[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const preferencesMap = computed(() => {
    const map: Record<string, string> = {}
    preferences.value.forEach(pref => {
      map[pref.preference_key] = pref.preference_value
    })
    return map
  })

  const defaultStartTime = computed(() => 
    preferencesMap.value.start_time || '09:00'
  )

  const defaultEndTime = computed(() => 
    preferencesMap.value.end_time || '17:00'
  )

  const workingHours = computed(() => ({
    startTime: defaultStartTime.value,
    endTime: defaultEndTime.value
  }))

  const hasPreferences = computed(() => preferences.value.length > 0)

  // Actions
  const fetchPreferences = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await preferencesApi.getAll()
      if (response.success && response.data) {
        preferences.value = response.data
      } else {
        error.value = response.error || 'Failed to fetch preferences'
        preferences.value = []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch preferences'
      preferences.value = []
    } finally {
      loading.value = false
    }
  }

  const getPreference = async (key: string): Promise<string | null> => {
    // Try to get from local state first
    const localPref = preferences.value.find(p => p.preference_key === key)
    if (localPref) {
      return localPref.preference_value
    }

    // If not found locally, fetch from API
    loading.value = true
    error.value = null

    try {
      const value = await preferencesApi.getByKey(key)
      
      // Update local state if found
      if (value !== null) {
        const existingIndex = preferences.value.findIndex(p => p.preference_key === key)
        if (existingIndex === -1) {
          // Add new preference to local state
          preferences.value.push({
            preference_key: key,
            preference_value: value,
            user_id: 0 // Will be updated when we fetch all preferences
          })
        }
      }
      
      return value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get preference'
      return null
    } finally {
      loading.value = false
    }
  }

  const setPreference = async (key: string, value: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await preferencesApi.set(key, value)
      
      if (response.success && response.data) {
        // Update local state
        const existingIndex = preferences.value.findIndex(p => p.preference_key === key)
        if (existingIndex !== -1) {
          preferences.value[existingIndex] = response.data
        } else {
          preferences.value.push(response.data)
        }
      } else {
        error.value = response.error || 'Failed to set preference'
        throw new Error(response.error || 'Failed to set preference')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to set preference'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePreference = async (key: string, value: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const preference = await preferencesApi.update(key, value)
      
      // Update local state
      const existingIndex = preferences.value.findIndex(p => p.preference_key === key)
      if (existingIndex !== -1) {
        if (preference.data) {
          preferences.value[existingIndex] = preference.data
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update preference'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePreference = async (key: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await preferencesApi.delete(key)
      
      // Remove from local state
      preferences.value = preferences.value.filter(p => p.preference_key !== key)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete preference'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Convenience methods for common preferences
  const getDefaultStartTime = async (): Promise<string> => {
    const value = await getPreference('start_time')
    return value || '09:00'
  }

  const setDefaultStartTime = async (time: string): Promise<void> => {
    await setPreference('start_time', time)
  }

  const getDefaultEndTime = async (): Promise<string> => {
    const value = await getPreference('end_time')
    return value || '17:00'
  }

  const setDefaultEndTime = async (time: string): Promise<void> => {
    await setPreference('end_time', time)
  }

  const getWorkingHours = async (): Promise<{ startTime: string; endTime: string }> => {
    const [startTime, endTime] = await Promise.all([
      getDefaultStartTime(),
      getDefaultEndTime()
    ])
    
    return { startTime, endTime }
  }

  const setWorkingHours = async (startTime: string, endTime: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await preferencesApi.setWorkingHours(startTime, endTime)
      
      if (response.success) {
        // Refresh local state after successful bulk update
        await fetchPreferences()
      } else {
        error.value = response.error || 'Failed to set working hours'
        throw new Error(response.error || 'Failed to set working hours')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to set working hours'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetToDefaults = async (): Promise<void> => {
    await setWorkingHours('09:00', '17:00')
  }

  const clearError = (): void => {
    error.value = null
  }

  // Utility methods
  const getPreferenceByKey = (key: string): UserPreference | undefined => {
    return preferences.value.find(p => p.preference_key === key)
  }

  const hasPreference = (key: string): boolean => {
    return preferences.value.some(p => p.preference_key === key)
  }

  return {
    // State
    preferences: computed(() => preferences.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Getters
    preferencesMap,
    defaultStartTime,
    defaultEndTime,
    workingHours,
    hasPreferences,

    // Actions
    fetchPreferences,
    getPreference,
    setPreference,
    updatePreference,
    deletePreference,

    // Convenience methods
    getDefaultStartTime,
    setDefaultStartTime,
    getDefaultEndTime,
    setDefaultEndTime,
    getWorkingHours,
    setWorkingHours,
    resetToDefaults,
    clearError,

    // Utilities
    getPreferenceByKey,
    hasPreference
  }
})