import { apiService } from './api'
import type { BillingEvent, BillingEventCreateData, BillingEventUpdateData } from '@/types/billingEvent'

interface DateRange {
  start: string
  end: string
}

export const billingEventsApi = {
  async getAll(filters?: {
    clientId?: number
    projectId?: number
    taskId?: number
    startDate?: string
    endDate?: string
    timekeeperId?: number
  }): Promise<BillingEvent[]> {
    console.log('[BillingEventsAPI] getAll called with filters:', filters)
    const params: Record<string, any> = {}
    if (filters?.clientId !== undefined) params.client_id = filters.clientId
    if (filters?.projectId !== undefined) params.project_id = filters.projectId
    if (filters?.taskId !== undefined) params.task_id = filters.taskId
    if (filters?.startDate) params.start_date = filters.startDate
    if (filters?.endDate) params.end_date = filters.endDate
    if (filters?.timekeeperId !== undefined) params.timekeeper_id = filters.timekeeperId
    
    console.log('[BillingEventsAPI] Making API request to /events/ with params:', params)
    
    try {
      const response = await apiService.get<any>('/events/', { params })
      console.log('[BillingEventsAPI] Received response:', response)
      console.log('[BillingEventsAPI] Response type:', typeof response, 'Array:', Array.isArray(response))
      
      let eventsData: BillingEvent[]
      
      if (Array.isArray(response)) {
        // Direct array response
        eventsData = response
        console.log('[BillingEventsAPI] Direct array format detected')
      } else if (response && typeof response === 'object' && response.events) {
        // Wrapped in events property - could be array or object
        if (Array.isArray(response.events)) {
          eventsData = response.events
          console.log('[BillingEventsAPI] Events array format detected')
        } else if (typeof response.events === 'object') {
          // Backend returns events as object with uid as keys, convert to array
          eventsData = Object.values(response.events)
          console.log('[BillingEventsAPI] Events object format detected - converted to array')
        } else {
          eventsData = []
          console.warn('[BillingEventsAPI] Unexpected events property format:', response.events)
        }
      } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
        // Wrapped in data property
        eventsData = response.data
        console.log('[BillingEventsAPI] Data wrapper format detected')
      } else {
        console.warn('[BillingEventsAPI] Unexpected response format:', response)
        eventsData = []
      }
      
      console.log('[BillingEventsAPI] Final events data:', eventsData?.length || 0, 'events')
      if (eventsData?.length) {
        eventsData.forEach((event, index) => {
          console.log(`[BillingEventsAPI] Event ${index}:`, {
            uid: event.uid,
            project_id: event.project_id,
            start_time: event.start_time,
            end_time: event.end_time
          })
        })
      }
      
      return eventsData
    } catch (error) {
      console.error('[BillingEventsAPI] Exception in getAll:', error)
      
      // Log specific error details
      if (error.response?.status === 403) {
        console.error('[BillingEventsAPI] 🚫 403 Forbidden - Authentication failed for /api/events/')
      } else if (error.response?.status === 401) {
        console.error('[BillingEventsAPI] 🚫 401 Unauthorized - Invalid or expired token')
      }
      
      throw error
    }
  },

  async getById(id: number): Promise<BillingEvent> {
    const response = await apiService.get<BillingEvent>(`/events/${id}`)
    return response
  },

  async create(data: BillingEventCreateData): Promise<BillingEvent> {
    const response = await apiService.post<BillingEvent>('/events', data)
    return response
  },

  async update(id: number, data: BillingEventUpdateData): Promise<BillingEvent> {
    const response = await apiService.put<BillingEvent>(`/events/${id}`, data)
    return response
  },

  async delete(id: number): Promise<void> {
    await apiService.delete<void>(`/events/${id}`)
  },

  async getByDateRange(startDate: string, endDate: string, filters?: {
    clientId?: number
    projectId?: number
    taskId?: number
    timekeeperId?: number
  }): Promise<BillingEvent[]> {
    return this.getAll({
      ...filters,
      startDate,
      endDate
    })
  },

  async getByProject(projectId: number, dateRange?: DateRange): Promise<BillingEvent[]> {
    return this.getAll({
      projectId,
      startDate: dateRange?.start,
      endDate: dateRange?.end
    })
  },

  async getByClient(clientId: number, dateRange?: DateRange): Promise<BillingEvent[]> {
    return this.getAll({
      clientId,
      startDate: dateRange?.start,
      endDate: dateRange?.end
    })
  },

  async getTotalHours(filters?: {
    clientId?: number
    projectId?: number
    taskId?: number
    startDate?: string
    endDate?: string
    timekeeperId?: number
  }): Promise<number> {
    const params: Record<string, any> = {}
    if (filters?.clientId !== undefined) params.client_id = filters.clientId
    if (filters?.projectId !== undefined) params.project_id = filters.projectId
    if (filters?.taskId !== undefined) params.task_id = filters.taskId
    if (filters?.startDate) params.start_date = filters.startDate
    if (filters?.endDate) params.end_date = filters.endDate
    if (filters?.timekeeperId !== undefined) params.timekeeper_id = filters.timekeeperId
    
    const response = await apiService.get<{ total_hours: number }>('/events/total-hours', { params })
    return response.total_hours
  },

  async getTimeSheet(timekeeperId: number, startDate: string, endDate: string): Promise<BillingEvent[]> {
    return this.getAll({
      timekeeperId,
      startDate,
      endDate
    })
  }
}