import { apiService } from './api'
import type { Project, ProjectCreateData, ProjectUpdateData, ProjectStatus } from '@/types/project'

export const projectsApi = {
  async getAll(clientId?: number, active?: boolean): Promise<Project[]> {
    console.log('[ProjectsAPI] getAll called with clientId:', clientId, 'active:', active)
    const params: Record<string, any> = {}
    if (clientId !== undefined) params.client_id = clientId
    if (active !== undefined) params.active = active
    
    console.log('[ProjectsAPI] Making API request to /projects/ with params:', params)
    
    try {
      const response = await apiService.get<any>('/projects/', { params })
      console.log('[ProjectsAPI] Received response:', response)
      console.log('[ProjectsAPI] Response type:', typeof response, 'Array:', Array.isArray(response))
      
      let projectsData: Project[]
      
      if (Array.isArray(response)) {
        // Direct array response
        projectsData = response
        console.log('[ProjectsAPI] Direct array format detected')
      } else if (response && typeof response === 'object' && response.projects) {
        // Wrapped in projects property - could be array or object
        if (Array.isArray(response.projects)) {
          projectsData = response.projects
          console.log('[ProjectsAPI] Projects array format detected')
        } else if (typeof response.projects === 'object') {
          // Backend returns projects as object with project_id as keys, convert to array
          projectsData = Object.values(response.projects)
          console.log('[ProjectsAPI] Projects object format detected - converted to array')
        } else {
          projectsData = []
          console.warn('[ProjectsAPI] Unexpected projects property format:', response.projects)
        }
      } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
        // Wrapped in data property
        projectsData = response.data
        console.log('[ProjectsAPI] Data wrapper format detected')
      } else {
        console.warn('[ProjectsAPI] Unexpected response format:', response)
        projectsData = []
      }
      
      console.log('[ProjectsAPI] Final projects data:', projectsData?.length || 0, 'projects')
      if (projectsData?.length) {
        projectsData.forEach((project, index) => {
          console.log(`[ProjectsAPI] Project ${index}:`, {
            project_id: project.project_id,
            title: project.title,
            client_id: project.client_id
          })
        })
      }
      
      return projectsData
    } catch (error) {
      console.error('[ProjectsAPI] Exception in getAll:', error)
      
      // Log specific error details
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 403) {
          console.error('[ProjectsAPI] 🚫 403 Forbidden - Authentication failed for /api/projects/')
        } else if (axiosError.response?.status === 401) {
          console.error('[ProjectsAPI] 🚫 401 Unauthorized - Invalid or expired token')
        }
      }
      
      throw error
    }
  },

  async getById(id: number): Promise<Project> {
    const response = await apiService.get<Project>(`/projects/${id}`)
    return response
  },

  async create(data: ProjectCreateData): Promise<Project> {
    const response = await apiService.post<Project>('/projects/', data)
    return response
  },

  async update(id: number, data: ProjectUpdateData): Promise<Project> {
    const updateData = { ...data, project_id: id }
    const response = await apiService.put<Project>('/projects/', updateData)
    return response
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
    return this.update(id, { proj_status: status })
  },

  async searchProjects(query: string, clientId?: number): Promise<Project[]> {
    const params: Record<string, any> = { search: query }
    if (clientId !== undefined) params.client_id = clientId
    
    const response = await apiService.get<Project[]>('/projects/search', { params })
    return response
  }
}