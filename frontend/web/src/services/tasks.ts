import { apiService } from './api'
import type { Task, TaskCreateData, TaskUpdateData, TaskStatus } from '@/types/task'

export const tasksApi = {
  async getAll(projectId?: number, active?: boolean): Promise<Task[]> {
    const params: Record<string, any> = {}
    if (projectId !== undefined) params.project_id = projectId
    if (active !== undefined) params.active = active
    
    const response = await apiService.get<Task[]>('/tasks', { params })
    return response.data
  },

  async getById(id: number): Promise<Task> {
    const response = await apiService.get<Task>(`/tasks/${id}`)
    return response.data
  },

  async create(data: TaskCreateData): Promise<Task> {
    const response = await apiService.post<Task>('/tasks', data)
    return response.data
  },

  async update(id: number, data: TaskUpdateData): Promise<Task> {
    const response = await apiService.put<Task>(`/tasks/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiService.delete<void>(`/tasks/${id}`)
  },

  async getByProject(projectId: number): Promise<Task[]> {
    return this.getAll(projectId)
  },

  async getActiveTasks(projectId?: number): Promise<Task[]> {
    return this.getAll(projectId, true)
  },

  async updateStatus(id: number, status: TaskStatus): Promise<Task> {
    return this.update(id, { status })
  },

  async getByClientAndProject(clientId: number, projectId?: number): Promise<Task[]> {
    const params: Record<string, any> = { client_id: clientId }
    if (projectId !== undefined) params.project_id = projectId
    
    const response = await apiService.get<Task[]>('/tasks/by-client', { params })
    return response.data
  },

  async searchTasks(query: string, projectId?: number): Promise<Task[]> {
    const params: Record<string, any> = { search: query }
    if (projectId !== undefined) params.project_id = projectId
    
    const response = await apiService.get<Task[]>('/tasks/search', { params })
    return response.data
  }
}