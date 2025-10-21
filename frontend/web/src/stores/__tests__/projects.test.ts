import { vi, describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectsStore } from '../projects'
import { projectsApi } from '@/services/projects'
import type { Project } from '@/types/project'

// Mock the projects API
vi.mock('@/services/projects', () => ({
  projectsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getByClient: vi.fn(),
    getActiveProjects: vi.fn(),
    updateStatus: vi.fn(),
    searchProjects: vi.fn()
  }
}))

describe('Projects Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('State', () => {
    it('has correct initial state', () => {
      const store = useProjectsStore()

      expect(store.projects).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.filters).toEqual({
        clientId: null,
        active: null,
        status: null,
        search: ''
      })
    })
  })

  describe('Getters', () => {
    it('activeProjects returns only active projects', () => {
      const store = useProjectsStore()
      store.projects = [
        { project_id: 1, title: 'Active Project', client_id: 1, active: true, proj_status: 'Started' as const },
        { project_id: 2, title: 'Inactive Project', client_id: 2, active: false, proj_status: 'Complete' as const }
      ]

      const result = store.activeProjects

      expect(result).toEqual([
        { project_id: 1, title: 'Active Project', client_id: 1, active: true, proj_status: 'Started' as const }
      ])
    })

    it('filteredProjects applies clientId filter', () => {
      const store = useProjectsStore()
      store.projects = [
        { project_id: 1, title: 'Client 1 Project', client_id: 1, active: true, proj_status: 'Started' as const },
        { project_id: 2, title: 'Client 2 Project', client_id: 2, active: true, proj_status: 'Started' as const }
      ]
      store.filters.clientId = 1

      const result = store.filteredProjects

      expect(result).toEqual([
        { project_id: 1, title: 'Client 1 Project', client_id: 1, active: true, proj_status: 'Started' as const }
      ])
    })

    it('filteredProjects applies active filter', () => {
      const store = useProjectsStore()
      store.projects = [
        { project_id: 1, title: 'Active Project', client_id: 1, active: true, proj_status: 'Started' as const },
        { project_id: 2, title: 'Inactive Project', client_id: 2, active: false, proj_status: 'Complete' as const }
      ]
      store.filters.active = true

      const result = store.filteredProjects

      expect(result).toEqual([
        { project_id: 1, title: 'Active Project', client_id: 1, active: true, proj_status: 'Started' as const }
      ])
    })

    it('filteredProjects applies status filter', () => {
      const store = useProjectsStore()
      store.projects = [
        { project_id: 1, title: 'Planning Project', client_id: 1, active: true, proj_status: 'Pending' as const },
        { project_id: 2, title: 'Active Project', client_id: 2, active: true, proj_status: 'Started' as const }
      ]
      store.filters.status = 'Pending'

      const result = store.filteredProjects

      expect(result).toEqual([
        { project_id: 1, title: 'Planning Project', client_id: 1, active: true, proj_status: 'Pending' as const }
      ])
    })

    it('filteredProjects applies search filter', () => {
      const store = useProjectsStore()
      store.projects = [
        { project_id: 1, title: 'Search Project', description: 'Find me', client_id: 1, active: true, proj_status: 'Started' as const },
        { project_id: 2, title: 'Other Project', description: 'Ignore me', client_id: 2, active: true, proj_status: 'Started' as const }
      ]
      store.filters.search = 'Find'

      const result = store.filteredProjects

      expect(result).toEqual([
        { project_id: 1, title: 'Search Project', description: 'Find me', client_id: 1, active: true, proj_status: 'Started' as const }
      ])
    })

    it('filteredProjects applies multiple filters', () => {
      const store = useProjectsStore()
      store.projects = [
        { project_id: 1, title: 'Active Search Project', client_id: 1, active: true, proj_status: 'Started' as const },
        { project_id: 2, title: 'Inactive Search Project', client_id: 1, active: false, proj_status: 'Complete' as const },
        { project_id: 3, title: 'Active Other Project', client_id: 2, active: true, proj_status: 'Started' as const }
      ]
      store.filters.clientId = 1
      store.filters.active = true
      store.filters.search = 'Search'

      const result = store.filteredProjects

      expect(result).toEqual([
        { project_id: 1, title: 'Active Search Project', client_id: 1, active: true, proj_status: 'Started' as const }
      ])
    })

    it('filteredProjects returns all projects when no filters', () => {
      const store = useProjectsStore()
      store.projects = [
        { project_id: 1, title: 'Project 1', client_id: 1, active: true, proj_status: 'Started' as const },
        { project_id: 2, title: 'Project 2', client_id: 2, active: true, proj_status: 'Started' as const },
        { project_id: 3, title: 'Project 3', client_id: 1, active: true, proj_status: 'Started' as const }
      ]

      const result = store.filteredProjects

      expect(result).toEqual(store.projects)
    })

    it('projectsByClient groups projects by client', () => {
      const store = useProjectsStore()
      store.projects = [
        { project_id: 1, title: 'Project 1', client_id: 1, active: true, proj_status: 'Started' as const },
        { project_id: 2, title: 'Project 2', client_id: 2, active: true, proj_status: 'Started' as const },
        { project_id: 3, title: 'Project 3', client_id: 1, active: true, proj_status: 'Started' as const }
      ]

      const result = store.projectsByClient

      expect(result).toEqual({
        1: [
          { project_id: 1, title: 'Project 1', client_id: 1, active: true, proj_status: 'Started' as const },
          { project_id: 3, title: 'Project 3', client_id: 1, active: true, proj_status: 'Started' as const }
        ],
        2: [
          { project_id: 2, title: 'Project 2', client_id: 2, active: true, proj_status: 'Started' as const }
        ]
      })
    })

    it('getProjectById returns correct project', () => {
      const store = useProjectsStore()
      store.projects = [
        { project_id: 1, title: 'Project 1', client_id: 1, active: true, proj_status: 'Started' as const },
        { project_id: 2, title: 'Project 2', client_id: 2, active: true, proj_status: 'Started' as const }
      ]

      const result = store.getProjectById(1)

      expect(result).toEqual(
        { project_id: 1, title: 'Project 1', client_id: 1, active: true, proj_status: 'Started' as const }
      )
    })

    it('getProjectById returns undefined for non-existent project', () => {
      const store = useProjectsStore()
      store.projects = [
        { project_id: 1, title: 'Project 1', client_id: 1, active: true, proj_status: 'Started' as const }
      ]

      const result = store.getProjectById(999)

      expect(result).toBeUndefined()
    })
  })

  describe('Actions', () => {
    describe('fetchProjects', () => {
      it('fetches all projects successfully', async () => {
        const store = useProjectsStore()
        const mockProjects = [
          { project_id: 1, title: 'Active Project', client_id: 1, active: true, proj_status: 'Started' as const },
          { project_id: 2, title: 'Inactive Project', client_id: 2, active: false, proj_status: 'Complete' as const }
        ]
        
        vi.mocked(projectsApi.getAll).mockResolvedValue(mockProjects)

        await store.fetchProjects()

        expect(projectsApi.getAll).toHaveBeenCalledWith(undefined, undefined)
        expect(store.projects).toEqual(mockProjects)
        expect(store.loading).toBe(false)
        expect(store.error).toBe(null)
      })

      it('fetches projects for specific client', async () => {
        const store = useProjectsStore()
        const mockProjects = [
          { project_id: 1, title: 'Client 1 Project', client_id: 1, active: true, proj_status: 'Started' as const }
        ]
        
        vi.mocked(projectsApi.getAll).mockResolvedValue(mockProjects)

        await store.fetchProjects(1)

        expect(projectsApi.getAll).toHaveBeenCalledWith(1, undefined)
        expect(store.projects).toEqual(mockProjects)
      })

      it('fetches active projects only', async () => {
        const store = useProjectsStore()
        const mockProjects = [
          { project_id: 1, title: 'Active Project', client_id: 1, active: true, proj_status: 'Started' as const }
        ]
        
        vi.mocked(projectsApi.getAll).mockResolvedValue(mockProjects)

        await store.fetchProjects(undefined, true)

        expect(projectsApi.getAll).toHaveBeenCalledWith(undefined, true)
        expect(store.projects).toEqual(mockProjects)
      })

      it('handles fetch error', async () => {
        const store = useProjectsStore()
        const mockError = new Error('Network error')
        
        vi.mocked(projectsApi.getAll).mockRejectedValue(mockError)

        await expect(store.fetchProjects()).rejects.toThrow('Network error')
        expect(store.error).toBe('Network error')
        expect(store.loading).toBe(false)
      })

      it('sets loading state during fetch', async () => {
        const store = useProjectsStore()
        
        // Create a promise that we can control
        let resolvePromise: any
        const testPromise = new Promise((resolve) => {
          resolvePromise = resolve
        })
        
        vi.mocked(projectsApi.getAll).mockReturnValue(testPromise as Promise<Project[]>)

        const fetchPromise = store.fetchProjects()
        
        expect(store.loading).toBe(true)
        
        // Resolve the promise
        resolvePromise([{ project_id: 1, title: 'Test', client_id: 1, active: true, proj_status: 'Started' as const }])
        await fetchPromise
        
        expect(store.loading).toBe(false)
      })
    })

    describe('createProject', () => {
      it('creates project successfully', async () => {
        const store = useProjectsStore()
        const projectData = {
          title: 'New Project',
          description: 'Test Description',
          client_id: 1,
          proj_leader: 'John Doe',
          start_date: '2023-01-01',
          deadline: '2023-12-31',
          proj_status: 'Pending' as const,
          active: true
        }
        const createdProject = { project_id: 1, ...projectData }
        
        vi.mocked(projectsApi.create).mockResolvedValue(createdProject)

        const result = await store.createProject(projectData)

        expect(projectsApi.create).toHaveBeenCalledWith(projectData)
        expect(result).toEqual(createdProject)
        expect(store.projects).toContainEqual(createdProject)
      })

      it('handles create error', async () => {
        const store = useProjectsStore()
        const projectData = { title: 'New Project', client_id: 1, active: true, proj_status: 'Pending' as const }
        const mockError = new Error('Creation failed')
        
        vi.mocked(projectsApi.create).mockRejectedValue(mockError)

        await expect(store.createProject(projectData)).rejects.toThrow('Creation failed')
        expect(store.error).toBe('Creation failed')
      })
    })

    describe('updateProject', () => {
      it('updates project successfully', async () => {
        const store = useProjectsStore()
        const projectId = 1
        const updateData = { title: 'Updated Title' }
        const existingProject = { project_id: 1, title: 'Old Title', client_id: 1, active: true, proj_status: 'Started' as const }
        const updatedProject = { project_id: 1, title: 'New Title', client_id: 1, active: true, proj_status: 'Started' as const }
        
        store.projects = [existingProject]
        vi.mocked(projectsApi.update).mockResolvedValue(updatedProject)

        const result = await store.updateProject(projectId, updateData)

        expect(projectsApi.update).toHaveBeenCalledWith(projectId, updateData)
        expect(result).toEqual(updatedProject)
        expect(store.projects).toContainEqual(updatedProject)
        expect(store.projects).not.toContainEqual(existingProject)
      })

      it('handles update error', async () => {
        const store = useProjectsStore()
        const mockError = new Error('Update failed')
        
        vi.mocked(projectsApi.update).mockRejectedValue(mockError)

        await expect(store.updateProject(1, {})).rejects.toThrow('Update failed')
        expect(store.error).toBe('Update failed')
      })
    })

    describe('deleteProject', () => {
      it('deletes project successfully', async () => {
        const store = useProjectsStore()
        const projectId = 1
        const projectToDelete = { project_id: 1, title: 'To Delete', client_id: 1, active: true, proj_status: 'Started' as const }
        const projectToKeep = { project_id: 2, title: 'To Keep', client_id: 2, active: true, proj_status: 'Started' as const }
        
        store.projects = [projectToDelete, projectToKeep]
        vi.mocked(projectsApi.delete).mockResolvedValue(undefined)

        await store.deleteProject(projectId)

        expect(projectsApi.delete).toHaveBeenCalledWith(projectId)
        expect(store.projects).not.toContainEqual(projectToDelete)
        expect(store.projects).toContainEqual(projectToKeep)
      })

      it('handles delete error', async () => {
        const store = useProjectsStore()
        const mockError = new Error('Delete failed')
        
        vi.mocked(projectsApi.delete).mockRejectedValue(mockError)

        await expect(store.deleteProject(1)).rejects.toThrow('Delete failed')
        expect(store.error).toBe('Delete failed')
      })
    })

    describe('searchProjects', () => {
      it('searches projects successfully', async () => {
        const store = useProjectsStore()
        const searchTerm = 'Test'
        const searchResults = [
          { project_id: 1, title: 'Search Result', client_id: 1, active: true, proj_status: 'Started' as const }
        ]

        vi.mocked(projectsApi.searchProjects).mockResolvedValue(searchResults)

        const result = await store.searchProjects(searchTerm)

        expect(projectsApi.searchProjects).toHaveBeenCalledWith(searchTerm, undefined)
        expect(result).toEqual(searchResults)
      })

      it('handles search error', async () => {
        const store = useProjectsStore()
        const mockError = new Error('Search failed')

        vi.mocked(projectsApi.searchProjects).mockRejectedValue(mockError)

        const result = await store.searchProjects('test')

        expect(result).toEqual([])
        expect(store.error).toBe('Search failed')
      })
    })

    describe('getProjectsByClient', () => {
      it('gets client projects successfully', () => {
        const store = useProjectsStore()
        const clientId = 1

        // Set up store with test projects
        store.projects = [
          { project_id: 1, title: 'Client 1 Project', client_id: 1, active: true, proj_status: 'Started' as const, description: '', start_date: '', deadline: '', http_link: '', proj_leader: '' },
          { project_id: 2, title: 'Client 2 Project', client_id: 2, active: true, proj_status: 'Started' as const, description: '', start_date: '', deadline: '', http_link: '', proj_leader: '' },
          { project_id: 3, title: 'Another Client 1 Project', client_id: 1, active: true, proj_status: 'Pending' as const, description: '', start_date: '', deadline: '', http_link: '', proj_leader: '' }
        ]

        const result = store.getProjectsByClient(clientId)

        expect(result).toHaveLength(2)
        expect(result[0].project_id).toBe(1)
        expect(result[1].project_id).toBe(3)
        expect(result.every(p => p.client_id === clientId)).toBe(true)
      })

      it('returns empty array when no projects match client', () => {
        const store = useProjectsStore()

        // Set up store with test projects
        store.projects = [
          { project_id: 1, title: 'Client 1 Project', client_id: 1, active: true, proj_status: 'Started' as const, description: '', start_date: '', deadline: '', http_link: '', proj_leader: '' }
        ]

        const result = store.getProjectsByClient(999)

        expect(result).toEqual([])
      })
    })

    describe('clearError', () => {
      it('clears error state', () => {
        const store = useProjectsStore()
        store.error = 'Test error'

        store.clearError()

        expect(store.error).toBe(null)
      })
    })

    describe('setFilters', () => {
      it('sets filters', () => {
        const store = useProjectsStore()
        const filters = {
          clientId: 1,
          active: true,
          status: 'Started' as const,
          search: 'test'
        }

        store.setFilters(filters)

        expect(store.filters).toEqual(filters)
      })

      it('updates partial filters', () => {
        const store = useProjectsStore()
        store.filters = {
          clientId: 1,
          active: true,
          status: 'Started' as const,
          search: 'test'
        }

        store.setFilters({ active: false })

        expect(store.filters).toEqual({
          clientId: 1,
          active: false,
          status: 'Started',
          search: 'test'
        })
      })
    })

    describe('clearFilters', () => {
      it('clears all filters', () => {
        const store = useProjectsStore()
        store.filters = {
          clientId: 1,
          active: true,
          status: 'Started' as const,
          search: 'test'
        }

        store.clearFilters()

        expect(store.filters).toEqual({
          clientId: null,
          active: null,
          status: null,
          search: ''
        })
      })
    })
  })
})