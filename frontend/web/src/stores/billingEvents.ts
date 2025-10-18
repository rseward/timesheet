import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { billingEventsApi } from '@/services/billingEvents'
import type { BillingEvent, BillingEventCreateData, BillingEventUpdateData, DateRange } from '@/types/billingEvent'

export interface BillingEventFilters {
  clientId?: number | null
  projectId?: number | null
  taskId?: number | null
  timekeeperId?: number | null
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
      result = result.filter(event => event.clientId === filters.value.clientId)
    }

    if (filters.value.projectId) {
      result = result.filter(event => event.projectId === filters.value.projectId)
    }

    if (filters.value.taskId) {
      result = result.filter(event => event.taskId === filters.value.taskId)
    }

    if (filters.value.timekeeperId) {
      result = result.filter(event => event.timekeeperId === filters.value.timekeeperId)
    }

    if (filters.value.startDate) {
      result = result.filter(event => event.eventDate >= filters.value.startDate!)
    }

    if (filters.value.endDate) {
      result = result.filter(event => event.eventDate <= filters.value.endDate!)
    }

    return result
  })

  const totalHours = computed(() => {
    return filteredBillingEvents.value.reduce((total, event) => {
      return total + event.hours
    }, 0)
  })

  const eventsByDate = computed(() => {
    const grouped: Record<string, BillingEvent[]> = {}
    filteredBillingEvents.value.forEach(event => {
      if (!grouped[event.eventDate]) {
        grouped[event.eventDate] = []
      }
      grouped[event.eventDate].push(event)
    })
    return grouped
  })

  const eventsByProject = computed(() => {
    const grouped: Record<number, BillingEvent[]> = {}
    billingEvents.value.forEach(event => {
      if (!grouped[event.projectId]) {
        grouped[event.projectId] = []
      }
      grouped[event.projectId].push(event)
    })
    return grouped
  })

  const eventsCount = computed(() => billingEvents.value.length)
  const filteredEventsCount = computed(() => filteredBillingEvents.value.length)

  // Actions
  const fetchBillingEvents = async (filterOptions?: BillingEventFilters): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      billingEvents.value = await billingEventsApi.getAll(filterOptions)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch billing events'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchBillingEventById = async (id: number): Promise<BillingEvent | null> => {
    loading.value = true
    error.value = null

    try {
      const event = await billingEventsApi.getById(id)
      
      // Update event in store if it exists
      const index = billingEvents.value.findIndex(e => e.id === id)
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
      const index = billingEvents.value.findIndex(e => e.id === id)
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

  const deleteBillingEvent = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await billingEventsApi.delete(id)
      billingEvents.value = billingEvents.value.filter(e => e.id !== id)
    } catch (err) {
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
      const total = await billingEventsApi.getTotalHours(filterOptions)
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
    return billingEvents.value.find(e => e.id === id)
  }

  const getBillingEventsByProject = (projectId: number): BillingEvent[] => {
    return billingEvents.value.filter(e => e.projectId === projectId)
  }

  const getBillingEventsByClient = (clientId: number): BillingEvent[] => {
    return billingEvents.value.filter(e => e.clientId === clientId)
  }

  const getBillingEventsByTask = (taskId: number): BillingEvent[] => {
    return billingEvents.value.filter(e => e.taskId === taskId)
  }

  const getBillingEventsByDateRange = (startDate: string, endDate: string): BillingEvent[] => {
    return billingEvents.value.filter(e => e.eventDate >= startDate && e.eventDate <= endDate)
  }

  return {
    // State
    billingEvents: computed(() => billingEvents.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    filters: computed(() => filters.value),

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
    getBillingEventsByDateRange
  }
})