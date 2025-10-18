import { apiService } from './api'
import type { BillingEvent, BillingEventCreateData, BillingEventUpdateData, DateRange } from '@/types/billingEvent'

export const billingEventsApi = {
  async getAll(filters?: {
    clientId?: number
    projectId?: number
    taskId?: number
    startDate?: string
    endDate?: string
    timekeeperId?: number
  }): Promise<BillingEvent[]> {
    const params: Record<string, any> = {}
    if (filters?.clientId !== undefined) params.client_id = filters.clientId
    if (filters?.projectId !== undefined) params.project_id = filters.projectId
    if (filters?.taskId !== undefined) params.task_id = filters.taskId
    if (filters?.startDate) params.start_date = filters.startDate
    if (filters?.endDate) params.end_date = filters.endDate
    if (filters?.timekeeperId !== undefined) params.timekeeper_id = filters.timekeeperId
    
    const response = await apiService.get<BillingEvent[]>('/billingevents', { params })
    return response.data
  },

  async getById(id: number): Promise<BillingEvent> {
    const response = await apiService.get<BillingEvent>(`/billingevents/${id}`)
    return response.data
  },

  async create(data: BillingEventCreateData): Promise<BillingEvent> {
    const response = await apiService.post<BillingEvent>('/billingevents', data)
    return response.data
  },

  async update(id: number, data: BillingEventUpdateData): Promise<BillingEvent> {
    const response = await apiService.put<BillingEvent>(`/billingevents/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiService.delete<void>(`/billingevents/${id}`)
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
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate
    })
  },

  async getByClient(clientId: number, dateRange?: DateRange): Promise<BillingEvent[]> {
    return this.getAll({
      clientId,
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate
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
    
    const response = await apiService.get<{ total_hours: number }>('/billingevents/total-hours', { params })
    return response.data.total_hours
  },

  async getTimeSheet(timekeeperId: number, startDate: string, endDate: string): Promise<BillingEvent[]> {
    return this.getAll({
      timekeeperId,
      startDate,
      endDate
    })
  }
}