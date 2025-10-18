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
      map[pref.key] = pref.value
    })
    return map
  })

  const defaultStartTime = computed(() => 
    preferencesMap.value.default_start_time || '09:00'
  )

  const defaultEndTime = computed(() => 
    preferencesMap.value.default_end_time || '17:00'
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
      preferences.value = await preferencesApi.getAll()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch preferences'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPreference = async (key: string): Promise<string | null> => {
    // Try to get from local state first
    const localPref = preferences.value.find(p => p.key === key)
    if (localPref) {
      return localPref.value
    }

    // If not found locally, fetch from API
    loading.value = true
    error.value = null

    try {
      const value = await preferencesApi.getByKey(key)
      
      // Update local state if found
      if (value !== null) {
        const existingIndex = preferences.value.findIndex(p => p.key === key)
        if (existingIndex === -1) {
          // Add new preference to local state
          preferences.value.push({
            id: Date.now(), // Temporary ID
            key,
            value,
            userId: 0 // Will be updated when we fetch all preferences
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
      const preference = await preferencesApi.set(key, value)
      
      // Update local state
      const existingIndex = preferences.value.findIndex(p => p.key === key)
      if (existingIndex !== -1) {
        preferences.value[existingIndex] = preference
      } else {
        preferences.value.push(preference)
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
      const existingIndex = preferences.value.findIndex(p => p.key === key)
      if (existingIndex !== -1) {
        preferences.value[existingIndex] = preference
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
      preferences.value = preferences.value.filter(p => p.key !== key)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete preference'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Convenience methods for common preferences
  const getDefaultStartTime = async (): Promise<string> => {
    const value = await getPreference('default_start_time')
    return value || '09:00'
  }

  const setDefaultStartTime = async (time: string): Promise<void> => {
    await setPreference('default_start_time', time)
  }

  const getDefaultEndTime = async (): Promise<string> => {
    const value = await getPreference('default_end_time')
    return value || '17:00'
  }

  const setDefaultEndTime = async (time: string): Promise<void> => {
    await setPreference('default_end_time', time)
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
      await Promise.all([
        setDefaultStartTime(startTime),
        setDefaultEndTime(endTime)
      ])
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
    return preferences.value.find(p => p.key === key)
  }

  const hasPreference = (key: string): boolean => {
    return preferences.value.some(p => p.key === key)
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