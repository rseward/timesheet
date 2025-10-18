import { apiService } from './api'
import type { Project, ProjectCreateData, ProjectUpdateData, ProjectStatus } from '@/types/project'

export const projectsApi = {
  async getAll(clientId?: number, active?: boolean): Promise<Project[]> {
    const params: Record<string, any> = {}
    if (clientId !== undefined) params.client_id = clientId
    if (active !== undefined) params.active = active
    
    const response = await apiService.get<Project[]>('/projects', { params })
    return response.data
  },

  async getById(id: number): Promise<Project> {
    const response = await apiService.get<Project>(`/projects/${id}`)
    return response.data
  },

  async create(data: ProjectCreateData): Promise<Project> {
    const response = await apiService.post<Project>('/projects', data)
    return response.data
  },

  async update(id: number, data: ProjectUpdateData): Promise<Project> {
    const response = await apiService.put<Project>(`/projects/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiService.delete<void>(`/projects/${id}`)
  },

  async getByClient(clientId: number): Promise<Project[]> {
    return this.getAll(clientId)
  },

  async getActiveProjects(clientId?: number): Promise<Project[]> {
    return this.getAll(clientId, true)
  },

  async updateStatus(id: number, status: ProjectStatus): Promise<Project> {
    return this.update(id, { projectStatus: status })
  },

  async searchProjects(query: string, clientId?: number): Promise<Project[]> {
    const params: Record<string, any> = { search: query }
    if (clientId !== undefined) params.client_id = clientId
    
    const response = await apiService.get<Project[]>('/projects/search', { params })
    return response.data
  }
}