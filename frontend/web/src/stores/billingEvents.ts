import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { billingEventsApi } from '@/services/billingEvents'
import type { BillingEvent, BillingEventCreateData, BillingEventUpdateData } from '@/types/billingEvent'

export interface BillingEventFilters {
  clientId?: number | null
  projectId?: number | null
  taskId?: number | null
  timekeeperId?: number | null
  startDate?: string
  endDate?: string
}

interface DateRange {
  startDate?: string
  endDate?: string
}

export const useBillingEventsStore = defineStore('billingEvents', () => {
  // State
  const billingEvents = ref<BillingEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<BillingEventFilters>({
    clientId: null,
    projectId: null,
    taskId: null,
    timekeeperId: null,
    startDate: undefined,
    endDate: undefined
  })

  // Getters
  const filteredBillingEvents = computed(() => {
    let result = billingEvents.value

    if (filters.value.clientId) {
      result = result.filter(_event => {
        // Note: clientId would need to be fetched from project data
        // For now, we'll need the project relationship to filter by client
        return true // TODO: Implement client filtering via project lookup
      })
    }

    if (filters.value.projectId) {
      result = result.filter(event => event.project_id === filters.value.projectId)
    }

    if (filters.value.taskId) {
      result = result.filter(event => event.task_id === filters.value.taskId)
    }

    if (filters.value.timekeeperId) {
      result = result.filter(event => event.timekeeper_id === filters.value.timekeeperId)
    }

    if (filters.value.startDate) {
      result = result.filter(event => event.start_time >= filters.value.startDate!)
    }

    if (filters.value.endDate) {
      result = result.filter(event => event.end_time <= filters.value.endDate!)
    }

    return result
  })

  const totalHours = computed(() => {
    return filteredBillingEvents.value.reduce((total, event) => {
      return total + (event.hours || 0)
    }, 0)
  })

  const eventsByDate = computed(() => {
    const grouped: Record<string, BillingEvent[]> = {}
    filteredBillingEvents.value.forEach(event => {
      const eventDate = event.start_time.split('T')[0] // Extract date from start_time
      if (!grouped[eventDate]) {
        grouped[eventDate] = []
      }
      grouped[eventDate].push(event)
    })
    return grouped
  })

  const eventsByProject = computed(() => {
    const grouped: Record<number, BillingEvent[]> = {}
    billingEvents.value.forEach(event => {
      if (!grouped[event.project_id]) {
        grouped[event.project_id] = []
      }
      grouped[event.project_id].push(event)
    })
    return grouped
  })

  const eventsCount = computed(() => billingEvents.value.length)
  const filteredEventsCount = computed(() => filteredBillingEvents.value.length)

  // Actions
  const fetchBillingEvents = async (filterOptions?: BillingEventFilters): Promise<void> => {
    console.log('[BillingEventsStore] fetchBillingEvents called with filters:', filterOptions)
    loading.value = true
    error.value = null

    try {
      console.log('[BillingEventsStore] Calling billingEventsApi.getAll...')
      
      // Convert null values to undefined for API compatibility
      const apiFilters = filterOptions ? {
        clientId: filterOptions.clientId ?? undefined,
        projectId: filterOptions.projectId ?? undefined,
        taskId: filterOptions.taskId ?? undefined,
        timekeeperId: filterOptions.timekeeperId ?? undefined,
        startDate: filterOptions.startDate,
        endDate: filterOptions.endDate
      } : undefined
      
      const result = await billingEventsApi.getAll(apiFilters)
      console.log('[BillingEventsStore] API returned:', result)
      console.log('[BillingEventsStore] Result type:', typeof result, 'Array:', Array.isArray(result))
      
      billingEvents.value = result
      console.log('[BillingEventsStore] Updated store billingEvents:', billingEvents.value?.length || 0, 'events')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch billing events'
      console.error('[BillingEventsStore] Error in fetchBillingEvents:', err)
      throw err
    } finally {
      loading.value = false
      console.log('[BillingEventsStore] fetchBillingEvents completed. Loading:', loading.value, 'Error:', error.value)
    }
  }

  const fetchBillingEventById = async (id: number): Promise<BillingEvent | null> => {
    loading.value = true
    error.value = null

    try {
      const event = await billingEventsApi.getById(id)
      
      // Update event in store if it exists
      const index = billingEvents.value.findIndex(e => e.uid === id.toString())
      if (index !== -1) {
        billingEvents.value[index] = event
      } else {
        billingEvents.value.push(event)
      }
      
      return event
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch billing event'
      return null
    } finally {
      loading.value = false
    }
  }

  const createBillingEvent = async (eventData: BillingEventCreateData): Promise<BillingEvent | null> => {
    loading.value = true
    error.value = null

    try {
      const newEvent = await billingEventsApi.create(eventData)
      billingEvents.value.push(newEvent)
      return newEvent
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create billing event'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBillingEvent = async (id: number, eventData: BillingEventUpdateData): Promise<BillingEvent | null> => {
    loading.value = true
    error.value = null

    try {
      const updatedEvent = await billingEventsApi.update(id, eventData)
      const index = billingEvents.value.findIndex(e => e.uid === id.toString())
      if (index !== -1) {
        billingEvents.value[index] = updatedEvent
      }
      return updatedEvent
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update billing event'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteBillingEvent = async (uid: string): Promise<void> => {
    console.log('[BillingEventsStore] deleteBillingEvent called with uid:', uid, 'type:', typeof uid)
    loading.value = true
    error.value = null

    try {
      await billingEventsApi.delete(uid)
      billingEvents.value = billingEvents.value.filter(e => e.uid !== uid)
      console.log('[BillingEventsStore] Successfully deleted event with uid:', uid)
    } catch (err) {
      console.error('[BillingEventsStore] Delete failed for uid:', uid, 'error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to delete billing event'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchByDateRange = async (startDate: string, endDate: string, additionalFilters?: Omit<BillingEventFilters, 'startDate' | 'endDate'>): Promise<void> => {
    const filterOptions = {
      ...additionalFilters,
      startDate,
      endDate
    }
    await fetchBillingEvents(filterOptions)
  }

  const fetchByProject = async (projectId: number, dateRange?: DateRange): Promise<void> => {
    const filterOptions: BillingEventFilters = {
      projectId,
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate
    }
    await fetchBillingEvents(filterOptions)
  }

  const fetchByClient = async (clientId: number, dateRange?: DateRange): Promise<void> => {
    const filterOptions: BillingEventFilters = {
      clientId,
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate
    }
    await fetchBillingEvents(filterOptions)
  }

  const fetchTimeSheet = async (timekeeperId: number, startDate: string, endDate: string): Promise<void> => {
    await fetchBillingEvents({
      timekeeperId,
      startDate,
      endDate
    })
  }

  const getTotalHours = async (filterOptions?: BillingEventFilters): Promise<number> => {
    loading.value = true
    error.value = null

    try {
      // Convert null values to undefined for API compatibility
      const apiFilters = filterOptions ? {
        clientId: filterOptions.clientId ?? undefined,
        projectId: filterOptions.projectId ?? undefined,
        taskId: filterOptions.taskId ?? undefined,
        timekeeperId: filterOptions.timekeeperId ?? undefined,
        startDate: filterOptions.startDate,
        endDate: filterOptions.endDate
      } : undefined
      
      const total = await billingEventsApi.getTotalHours(apiFilters)
      return total
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get total hours'
      return 0
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: Partial<BillingEventFilters>): void => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = (): void => {
    filters.value = {
      clientId: null,
      projectId: null,
      taskId: null,
      timekeeperId: null,
      startDate: undefined,
      endDate: undefined
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  // Utility methods
  const getBillingEventById = (id: number): BillingEvent | undefined => {
    return billingEvents.value.find(e => e.uid === id.toString())
  }

  const getBillingEventsByProject = (projectId: number): BillingEvent[] => {
    return billingEvents.value.filter(e => e.project_id === projectId)
  }

  const getBillingEventsByClient = (_clientId: number): BillingEvent[] => {
    // Note: clientId filtering requires project lookup
    return billingEvents.value.filter(() => {
      // This would need to be implemented with project data
      // For now, we return all events as the filtering is not yet implemented
      return true // TODO: Implement client filtering via project lookup
    })
  }

  const getBillingEventsByTask = (taskId: number): BillingEvent[] => {
    return billingEvents.value.filter(e => e.task_id === taskId)
  }

  const getBillingEventsByDateRange = (startDate: string, endDate: string): BillingEvent[] => {
    return billingEvents.value.filter(e => {
      const eventDate = e.start_time.split('T')[0]
      return eventDate >= startDate && eventDate <= endDate
    })
  }

  const getNextTransactionNumber = async (timekeeperId: number, projectId: number, taskId: number): Promise<number> => {
    loading.value = true
    error.value = null

    try {
      const nextTransNum = await billingEventsApi.getNextTransactionNumber(timekeeperId, projectId, taskId)
      return nextTransNum
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get next transaction number'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State (direct refs for test mutability)
    billingEvents,
    loading,
    error,
    filters,

    // Getters
    filteredBillingEvents,
    totalHours,
    eventsByDate,
    eventsByProject,
    eventsCount,
    filteredEventsCount,

    // Actions
    fetchBillingEvents,
    fetchBillingEventById,
    createBillingEvent,
    updateBillingEvent,
    deleteBillingEvent,
    fetchByDateRange,
    fetchByProject,
    fetchByClient,
    fetchTimeSheet,
    getTotalHours,
    setFilters,
    clearFilters,
    clearError,

    // Utilities
    getBillingEventById,
    getBillingEventsByProject,
    getBillingEventsByClient,
    getBillingEventsByTask,
    getBillingEventsByDateRange,
    getNextTransactionNumber
  }
})