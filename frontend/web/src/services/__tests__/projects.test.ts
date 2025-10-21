import { vi, describe, it, expect, beforeEach } from 'vitest'
import { projectsApi } from '../projects'
import { apiService } from '../api'

// Mock the apiService
vi.mock('../api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('projectsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('calls GET /projects/ without filters', async () => {
      const mockProjects = [
        { project_id: 1, title: 'Test Project', client_id: 1, active: true },
        { project_id: 2, title: 'Another Project', client_id: 2, active: false }
      ]
      
      vi.mocked(apiService.get).mockResolvedValue(mockProjects)

      const result = await projectsApi.getAll()

      expect(apiService.get).toHaveBeenCalledWith('/projects/', { params: {} })
      expect(result).toEqual(mockProjects)
    })

    it('calls GET /projects/ with clientId filter', async () => {
      const mockProjects = [
        { project_id: 1, title: 'Client Project', client_id: 1, active: true }
      ]
      
      vi.mocked(apiService.get).mockResolvedValue(mockProjects)

      const result = await projectsApi.getAll(1)

      expect(apiService.get).toHaveBeenCalledWith('/projects/', { params: { client_id: 1 } })
      expect(result).toEqual(mockProjects)
    })

    it('calls GET /projects/ with active filter', async () => {
      const mockProjects = [
        { project_id: 1, title: 'Active Project', client_id: 1, active: true }
      ]
      
      vi.mocked(apiService.get).mockResolvedValue(mockProjects)

      const result = await projectsApi.getAll(undefined, true)

      expect(apiService.get).toHaveBeenCalledWith('/projects/', { params: { active: true } })
      expect(result).toEqual(mockProjects)
    })

    it('calls GET /projects/ with both filters', async () => {
      const mockProjects = [
        { project_id: 1, title: 'Filtered Project', client_id: 1, active: true }
      ]
      
      vi.mocked(apiService.get).mockResolvedValue(mockProjects)

      const result = await projectsApi.getAll(1, true)

      expect(apiService.get).toHaveBeenCalledWith('/projects/', { params: { client_id: 1, active: true } })
      expect(result).toEqual(mockProjects)
    })

    it('handles wrapped response format', async () => {
      const mockResponse = {
        projects: [
          { project_id: 1, title: 'Wrapped Project', client_id: 1, active: true }
        ]
      }
      
      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await projectsApi.getAll()

      expect(result).toEqual(mockResponse.projects)
    })

    it('handles data wrapper format', async () => {
      const mockResponse = {
        data: [
          { project_id: 1, title: 'Data Project', client_id: 1, active: true }
        ]
      }
      
      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await projectsApi.getAll()

      expect(result).toEqual(mockResponse.data)
    })

    it('returns empty array for invalid response format', async () => {
      vi.mocked(apiService.get).mockResolvedValue({ invalid: 'format' })

      const result = await projectsApi.getAll()

      expect(result).toEqual([])
    })

    it('throws error on API failure', async () => {
      const mockError = new Error('Network error')
      vi.mocked(apiService.get).mockRejectedValue(mockError)

      await expect(projectsApi.getAll()).rejects.toThrow('Network error')
    })
  })

  describe('getById', () => {
    it('calls GET /projects/:id', async () => {
      const mockProject = { project_id: 1, title: 'Single Project', client_id: 1, active: true }
      
      vi.mocked(apiService.get).mockResolvedValue(mockProject)

      const result = await projectsApi.getById(1)

      expect(apiService.get).toHaveBeenCalledWith('/projects/1')
      expect(result).toEqual(mockProject)
    })
  })

  describe('create', () => {
    it('calls POST /projects with project data', async () => {
      const projectData = {
        client_id: 1,
        title: 'New Project',
        description: 'Project description',
        proj_leader: 'John Doe',
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        proj_status: 'Pending' as const,
        active: true
      }
      
      const mockProject = { project_id: 1, ...projectData }
      vi.mocked(apiService.post).mockResolvedValue(mockProject)

      const result = await projectsApi.create(projectData)

      expect(apiService.post).toHaveBeenCalledWith('/projects/', projectData)
      expect(result).toEqual(mockProject)
    })
  })

  describe('update', () => {
    it('calls PUT /projects/ with update data including project_id', async () => {
      const updateData = {
        title: 'Updated Project',
        description: 'Updated description'
      }

      const mockProject = { project_id: 1, ...updateData, client_id: 1, active: true }
      vi.mocked(apiService.put).mockResolvedValue(mockProject)

      const result = await projectsApi.update(1, updateData)

      expect(apiService.put).toHaveBeenCalledWith('/projects/', { ...updateData, project_id: 1 })
      expect(result).toEqual(mockProject)
    })
  })

  describe('delete', () => {
    it('calls DELETE /projects/:id', async () => {
      vi.mocked(apiService.delete).mockResolvedValue(undefined)

      await projectsApi.delete(1)

      expect(apiService.delete).toHaveBeenCalledWith('/projects/1')
    })
  })

  describe('getByClient', () => {
    it('calls getAll with clientId', async () => {
      const mockProjects = [
        { project_id: 1, title: 'Client Project', client_id: 1, active: true, proj_status: 'Started' as const }
      ]
      
      // Mock the getAll method
      const getAllSpy = vi.spyOn(projectsApi, 'getAll').mockResolvedValue(mockProjects)

      const result = await projectsApi.getByClient(1)

      expect(getAllSpy).toHaveBeenCalledWith(1)
      expect(result).toEqual(mockProjects)
    })
  })

  describe('getActiveProjects', () => {
    it('calls getAll with clientId and active=true', async () => {
      const mockProjects = [
        { project_id: 1, title: 'Active Project', client_id: 1, active: true, proj_status: 'Started' as const }
      ]
      
      const getAllSpy = vi.spyOn(projectsApi, 'getAll').mockResolvedValue(mockProjects)

      const result = await projectsApi.getActiveProjects(1)

      expect(getAllSpy).toHaveBeenCalledWith(1, true)
      expect(result).toEqual(mockProjects)
    })
  })

  describe('updateStatus', () => {
    it('calls update with status data', async () => {
      const mockProject = { project_id: 1, title: 'Status Project', client_id: 1, active: true, proj_status: 'Started' as const }
      
      const updateSpy = vi.spyOn(projectsApi, 'update').mockResolvedValue(mockProject)

      const result = await projectsApi.updateStatus(1, 'Started')

      expect(updateSpy).toHaveBeenCalledWith(1, { proj_status: 'Started' })
      expect(result).toEqual(mockProject)
    })
  })

  describe('searchProjects', () => {
    it('calls GET /projects/search with query', async () => {
      const mockProjects = [
        { project_id: 1, title: 'Search Result', client_id: 1, active: true }
      ]
      
      vi.mocked(apiService.get).mockResolvedValue(mockProjects)

      const result = await projectsApi.searchProjects('search')

      expect(apiService.get).toHaveBeenCalledWith('/projects/search', { params: { search: 'search' } })
      expect(result).toEqual(mockProjects)
    })

    it('calls GET /projects/search with query and clientId', async () => {
      const mockProjects = [
        { project_id: 1, title: 'Client Search Result', client_id: 1, active: true }
      ]
      
      vi.mocked(apiService.get).mockResolvedValue(mockProjects)

      const result = await projectsApi.searchProjects('search', 1)

      expect(apiService.get).toHaveBeenCalledWith('/projects/search', { params: { search: 'search', client_id: 1 } })
      expect(result).toEqual(mockProjects)
    })
  })
})