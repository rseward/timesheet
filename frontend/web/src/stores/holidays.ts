import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { holidaysApi } from '@/services/holidays'
import type { Holiday, HolidayCreateData, HolidayUpdateData, HolidayFilters, HolidayCheckResult } from '@/types/holiday'

export const useHolidaysStore = defineStore('holidays', () => {
  // State
  const holidays = ref<Holiday[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<HolidayFilters>({
    active: null,
    client_id: null,
    year: null,
    search: ''
  })

  // Getters
  const federalHolidays = computed(() =>
    holidays.value.filter(holiday => holiday.is_federal)
  )

  const clientHolidays = computed(() =>
    holidays.value.filter(holiday => !holiday.is_federal)
  )

  const activeHolidays = computed(() =>
    holidays.value.filter(holiday => holiday.active)
  )

  const filteredHolidays = computed(() => {
    let result = holidays.value

    if (filters.value.active !== null && filters.value.active !== undefined) {
      result = result.filter(holiday => holiday.active === filters.value.active)
    }

    if (filters.value.client_id !== null && filters.value.client_id !== undefined) {
      result = result.filter(holiday => holiday.client_id === filters.value.client_id)
    }

    if (filters.value.year !== null && filters.value.year !== undefined) {
      const year = filters.value.year
      result = result.filter(holiday => {
        const holidayDate = new Date(holiday.holiday_date)
        return holidayDate.getFullYear() === year
      })
    }

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(holiday =>
        holiday.name.toLowerCase().includes(search) ||
        holiday.description?.toLowerCase().includes(search) ||
        holiday.client_name?.toLowerCase().includes(search)
      )
    }

    return result
  })

  const holidaysCount = computed(() => holidays.value.length)
  const activeHolidaysCount = computed(() => activeHolidays.value.length)

  // Actions
  const fetchHolidays = async (params?: any): Promise<void> => {
    console.log('[HolidaysStore] fetchHolidays called with params:', params)
    loading.value = true
    error.value = null

    try {
      const queryParams = params || {}
      if (!params && (filters.value.active !== null || filters.value.client_id !== null || filters.value.year !== null || filters.value.search)) {
        queryParams.active = filters.value.active !== null ? filters.value.active : undefined
        queryParams.client_id = filters.value.client_id !== null ? filters.value.client_id : undefined
        queryParams.year = filters.value.year !== null ? filters.value.year : undefined
        queryParams.search = filters.value.search || undefined
      }

      const response = await holidaysApi.getAll(queryParams)
      if (response.success && response.data) {
        holidays.value = response.data
        console.log('[HolidaysStore] Successfully updated holidays state:', holidays.value.length, 'holidays loaded')
      } else {
        error.value = response.error || 'Failed to fetch holidays'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch holidays'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchHolidayById = async (id: number): Promise<Holiday | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await holidaysApi.getById(id)
      if (response.success && response.data) {
        const holiday = response.data
        const index = holidays.value.findIndex(h => h.id === id)
        if (index !== -1) {
          holidays.value[index] = holiday
        } else {
          holidays.value.push(holiday)
        }
        return holiday
      } else {
        error.value = response.error || 'Failed to fetch holiday'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch holiday'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchFederalHolidays = async (year?: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await holidaysApi.getFederalHolidays(year)
      if (response.success && response.data) {
        response.data.forEach(holiday => {
          const index = holidays.value.findIndex(h => h.id === holiday.id)
          if (index !== -1) {
            holidays.value[index] = holiday
          } else {
            holidays.value.push(holiday)
          }
        })
      } else {
        error.value = response.error || 'Failed to fetch federal holidays'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch federal holidays'
    } finally {
      loading.value = false
    }
  }

  const fetchClientHolidays = async (clientId: number, year?: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await holidaysApi.getClientHolidays(clientId, year)
      if (response.success && response.data) {
        response.data.forEach(holiday => {
          const index = holidays.value.findIndex(h => h.id === holiday.id)
          if (index !== -1) {
            holidays.value[index] = holiday
          } else {
            holidays.value.push(holiday)
          }
        })
      } else {
        error.value = response.error || 'Failed to fetch client holidays'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch client holidays'
    } finally {
      loading.value = false
    }
  }

  const createHoliday = async (holidayData: HolidayCreateData): Promise<any> => {
    loading.value = true
    error.value = null

    try {
      const response = await holidaysApi.create(holidayData)
      if (response.success && response.data) {
        holidays.value.push(response.data)
        return response
      } else {
        error.value = response.error || 'Failed to create holiday'
        return response
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create holiday'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateHoliday = async (id: number, holidayData: HolidayUpdateData): Promise<any> => {
    loading.value = true
    error.value = null

    try {
      const response = await holidaysApi.update(id, holidayData)
      if (response.success && response.data) {
        const index = holidays.value.findIndex(h => h.id === id)
        if (index !== -1) {
          holidays.value[index] = response.data
        }
        return response
      } else {
        error.value = response.error || 'Failed to update holiday'
        return response
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update holiday'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteHoliday = async (id: number): Promise<any> => {
    loading.value = true
    error.value = null

    try {
      const response = await holidaysApi.delete(id)
      if (response.success) {
        holidays.value = holidays.value.filter(h => h.id !== id)
        return response
      } else {
        error.value = response.error || 'Failed to delete holiday'
        return response
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete holiday'
      throw err
    } finally {
      loading.value = false
    }
  }

  const checkDateIsHoliday = async (clientId: number, date: string): Promise<HolidayCheckResult> => {
    try {
      return await holidaysApi.checkDateIsHoliday(clientId, date)
    } catch (err) {
      console.error('[HolidaysStore] Error checking if date is holiday:', err)
      return {
        is_holiday: false,
        date,
        holiday_type: null,
        holiday_name: null,
        message: null
      }
    }
  }

  const setFilters = (newFilters: Partial<HolidayFilters>): void => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = (): void => {
    filters.value = {
      active: null,
      client_id: null,
      year: null,
      search: ''
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  const getHolidayById = (id: number): Holiday | undefined => {
    return holidays.value.find(h => h.id === id)
  }

  const getHolidaysByIds = (ids: number[]): Holiday[] => {
    return holidays.value.filter(h => ids.includes(h.id))
  }

  return {
    // State
    holidays,
    loading,
    error,
    filters,

    // Getters
    federalHolidays,
    clientHolidays,
    activeHolidays,
    filteredHolidays,
    holidaysCount,
    activeHolidaysCount,

    // Actions
    fetchHolidays,
    fetchHolidayById,
    fetchFederalHolidays,
    fetchClientHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    checkDateIsHoliday,
    setFilters,
    clearFilters,
    clearError,

    // Utilities
    getHolidayById,
    getHolidaysByIds
  }
})
