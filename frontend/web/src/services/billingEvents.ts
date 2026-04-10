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
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 403) {
          console.error('[BillingEventsAPI] 🚫 403 Forbidden - Authentication failed for /api/events/')
        } else if (axiosError.response?.status === 401) {
          console.error('[BillingEventsAPI] 🚫 401 Unauthorized - Invalid or expired token')
        }
      }
      
      throw error
    }
  },

  async getById(uid: string): Promise<BillingEvent> {
    const response = await apiService.get<BillingEvent>(`/events/${uid}`)
    return response
  },

  async create(data: BillingEventCreateData): Promise<BillingEvent> {
    console.log('[BillingEventsAPI] create called with data:', data)
    const response = await apiService.post<{ added: BillingEvent }>('/events/', data)
    console.log('[BillingEventsAPI] POST request completed, response:', response)
    // Backend returns { added: BillingEvent }, extract the event
    return response.added
  },

  async update(uid: string, data: BillingEventUpdateData): Promise<BillingEvent> {
    console.log('[BillingEventsAPI] update called with uid:', uid, 'type:', typeof uid)
    console.log('[BillingEventsAPI] Making PUT request to /events/ with uid in body')

    // Backend expects PUT /api/events/ with uid in the request body, not in the URL path
    const payload = {
      ...data,
      uid
    }

    const response = await apiService.put<{ updated: BillingEvent }>('/events/', payload)
    console.log('[BillingEventsAPI] PUT request completed for uid:', uid)

    // Backend returns { updated: BillingEvent }, extract the event
    return response.updated
  },

  async delete(uid: string): Promise<void> {
    console.log('[BillingEventsAPI] delete called with uid:', uid, 'type:', typeof uid)
    console.log('[BillingEventsAPI] Making DELETE request to:', `/events/${uid}`)
    await apiService.delete<void>(`/events/${uid}`)
    console.log('[BillingEventsAPI] DELETE request completed for uid:', uid)
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
  },

  async getNextTransactionNumber(timekeeperId: number, projectId: number, taskId: number): Promise<number> {
    console.log('[BillingEventsAPI] getNextTransactionNumber called with:', { timekeeperId, projectId, taskId })
    
    try {
      const response = await apiService.get<{ next_trans_num: number }>(
        `/events/nextid/${timekeeperId}/${projectId}/${taskId}`
      )
      console.log('[BillingEventsAPI] Next transaction number response:', response)
      
      return response.next_trans_num
    } catch (error) {
      console.error('[BillingEventsAPI] Error fetching next transaction number:', error)
      throw error
    }
  },

  async getWeekInfo(timekeeperId: number, weekStartDate: string): Promise<{
    week_start_date: string
    has_entries: boolean
    current_entry_count: number
    previous_week_entries: Array<{
      project_id: number
      task_id: number
      day_offset: number
      start_time: string
      end_time: string
      log_message: string | null
      trans_num: number
    }>
    previous_week_start: string
    holidays: Array<{
      date: string
      name: string
      is_federal: boolean
    }>
    can_copy: boolean
  }> {
    console.log('[BillingEventsAPI] getWeekInfo called with:', { timekeeperId, weekStartDate })
    
    try {
      const response = await apiService.get('/time-entry/week-info', {
        params: {
          timekeeper_id: timekeeperId,
          week_start_date: weekStartDate
        }
      })
      console.log('[BillingEventsAPI] Week info response:', response)
      
      return response as {
        week_start_date: string
        has_entries: boolean
        current_entry_count: number
        previous_week_entries: Array<{
          project_id: number
          task_id: number
          day_offset: number
          start_time: string
          end_time: string
          log_message: string | null
          trans_num: number
        }>
        previous_week_start: string
        holidays: Array<{
          date: string
          name: string
          is_federal: boolean
        }>
        can_copy: boolean
      }
    } catch (error) {
      console.error('[BillingEventsAPI] Error fetching week info:', error)
      throw error
    }
  },

  async copyWeekEntries(
    timekeeperId: number,
    sourceWeekStart: string,
    targetWeekStart: string
  ): Promise<{
    success: boolean
    source_week_start: string
    target_week_start: string
    created_count: number
    skipped_count: number
    created_entries: Array<{
      uid: string
      date: string
      project_id: number
      task_id: number
      start_time: string
      end_time: string
      trans_num: number
    }>
    skipped_entries: Array<{
      source_date: string
      target_date: string
      reason: string
      project_id: number
      task_id: number
    }>
  }> {
    console.log('[BillingEventsAPI] copyWeekEntries called with:', { timekeeperId, sourceWeekStart, targetWeekStart })
    
    try {
      const response = await apiService.post('/time-entry/copy-week', null, {
        params: {
          timekeeper_id: timekeeperId,
          source_week_start: sourceWeekStart,
          target_week_start: targetWeekStart
        }
      })
      console.log('[BillingEventsAPI] Copy week response:', response)
      
      return response as {
        success: boolean
        source_week_start: string
        target_week_start: string
        created_count: number
        skipped_count: number
        created_entries: Array<{
          uid: string
          date: string
          project_id: number
          task_id: number
          start_time: string
          end_time: string
          trans_num: number
        }>
        skipped_entries: Array<{
          source_date: string
          target_date: string
          reason: string
          project_id: number
          task_id: number
        }>
      }
    } catch (error) {
      console.error('[BillingEventsAPI] Error copying week entries:', error)
      throw error
    }
  }
}
