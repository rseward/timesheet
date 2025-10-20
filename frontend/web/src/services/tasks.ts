import { apiService } from './api'
import type { Task, TaskCreateData, TaskUpdateData, TaskStatus } from '@/types/task'

export const tasksApi = {
  async getAll(projectId?: number, active?: boolean): Promise<Task[]> {
    console.log('[TasksAPI] getAll called with projectId:', projectId, 'active:', active)
    const params: Record<string, any> = {}
    if (projectId !== undefined) params.project_id = projectId
    if (active !== undefined) params.active = active
    
    console.log('[TasksAPI] Making API request to /tasks/ with params:', params)
    
    try {
      const response = await apiService.get<any>('/tasks/', { params })
      console.log('[TasksAPI] Received response:', response)
      console.log('[TasksAPI] Response type:', typeof response, 'Array:', Array.isArray(response))
      
      let tasksData: Task[]
      
      if (Array.isArray(response)) {
        // Direct array response
        tasksData = response
        console.log('[TasksAPI] Direct array format detected')
      } else if (response && typeof response === 'object' && response.tasks) {
        // Wrapped in tasks property - could be array or object
        if (Array.isArray(response.tasks)) {
          tasksData = response.tasks
          console.log('[TasksAPI] Tasks array format detected')
        } else if (typeof response.tasks === 'object') {
          // Backend returns tasks as object with task_id as keys, convert to array
          tasksData = Object.values(response.tasks)
          console.log('[TasksAPI] Tasks object format detected - converted to array')
        } else {
          tasksData = []
          console.warn('[TasksAPI] Unexpected tasks property format:', response.tasks)
        }
      } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
        // Wrapped in data property
        tasksData = response.data
        console.log('[TasksAPI] Data wrapper format detected')
      } else {
        console.warn('[TasksAPI] Unexpected response format:', response)
        tasksData = []
      }
      
      console.log('[TasksAPI] Final tasks data:', tasksData?.length || 0, 'tasks')
      if (tasksData?.length) {
        tasksData.forEach((task, index) => {
          console.log(`[TasksAPI] Task ${index}:`, {
            task_id: task.task_id,
            name: task.name,
            project_id: task.project_id
          })
        })
      }
      
      return tasksData
    } catch (error) {
      console.error('[TasksAPI] Exception in getAll:', error)
      
      // Log specific error details  
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 403) {
          console.error('[TasksAPI] 🚫 403 Forbidden - Authentication failed for /api/tasks/')
        } else if (axiosError.response?.status === 401) {
          console.error('[TasksAPI] 🚫 401 Unauthorized - Invalid or expired token')
        }
      }
      
      throw error
    }
  },

  async getById(id: number): Promise<Task> {
    const response = await apiService.get<Task>(`/tasks/${id}`)
    return response
  },

  async create(data: TaskCreateData): Promise<Task> {
    const response = await apiService.post<Task>('/tasks', data)
    return response
  },

  async update(id: number, data: TaskUpdateData): Promise<Task> {
    const response = await apiService.put<Task>(`/tasks/${id}`, data)
    return response
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
    return response
  },

  async searchTasks(query: string, projectId?: number): Promise<Task[]> {
    const params: Record<string, any> = { search: query }
    if (projectId !== undefined) params.project_id = projectId
    
    const response = await apiService.get<Task[]>('/tasks/search', { params })
    return response
  }
}