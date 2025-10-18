import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectsApi } from '@/services/projects'
import type { Project, ProjectCreateData, ProjectUpdateData, ProjectStatus } from '@/types/project'

export interface ProjectFilters {
  clientId?: number | null
  active?: boolean | null
  status?: ProjectStatus | null
  search?: string
}

export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ProjectFilters>({
    clientId: null,
    active: null,
    status: null,
    search: ''
  })

  // Getters
  const activeProjects = computed(() => 
    projects.value.filter(project => project.active)
  )

  const filteredProjects = computed(() => {
    let result = projects.value

    if (filters.value.clientId) {
      result = result.filter(project => project.clientId === filters.value.clientId)
    }

    if (filters.value.active !== null && filters.value.active !== undefined) {
      result = result.filter(project => project.active === filters.value.active)
    }

    if (filters.value.status) {
      result = result.filter(project => project.projectStatus === filters.value.status)
    }

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(project => 
        project.title.toLowerCase().includes(search) ||
        project.description?.toLowerCase().includes(search) ||
        project.projectLeader?.toLowerCase().includes(search)
      )
    }

    return result
  })

  const projectsByClient = computed(() => {
    const grouped: Record<number, Project[]> = {}
    projects.value.forEach(project => {
      if (!grouped[project.clientId]) {
        grouped[project.clientId] = []
      }
      grouped[project.clientId].push(project)
    })
    return grouped
  })

  const projectsCount = computed(() => projects.value.length)
  const activeProjectsCount = computed(() => activeProjects.value.length)

  // Actions
  const fetchProjects = async (clientId?: number, activeOnly = false): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      projects.value = await projectsApi.getAll(clientId, activeOnly ? true : undefined)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch projects'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchProjectById = async (id: number): Promise<Project | null> => {
    loading.value = true
    error.value = null

    try {
      const project = await projectsApi.getById(id)
      
      // Update project in store if it exists
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = project
      } else {
        projects.value.push(project)
      }
      
      return project
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch project'
      return null
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData: ProjectCreateData): Promise<Project | null> => {
    loading.value = true
    error.value = null

    try {
      const newProject = await projectsApi.create(projectData)
      projects.value.push(newProject)
      return newProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create project'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProject = async (id: number, projectData: ProjectUpdateData): Promise<Project | null> => {
    loading.value = true
    error.value = null

    try {
      const updatedProject = await projectsApi.update(id, projectData)
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      return updatedProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update project'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProjectStatus = async (id: number, status: ProjectStatus): Promise<Project | null> => {
    return updateProject(id, { projectStatus: status })
  }

  const deleteProject = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await projectsApi.delete(id)
      projects.value = projects.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete project'
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchProjects = async (query: string, clientId?: number): Promise<Project[]> => {
    loading.value = true
    error.value = null

    try {
      const results = await projectsApi.searchProjects(query, clientId)
      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search projects'
      return []
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: Partial<ProjectFilters>): void => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = (): void => {
    filters.value = {
      clientId: null,
      active: null,
      status: null,
      search: ''
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  // Utility methods
  const getProjectById = (id: number): Project | undefined => {
    return projects.value.find(p => p.id === id)
  }

  const getProjectsByClient = (clientId: number): Project[] => {
    return projects.value.filter(p => p.clientId === clientId)
  }

  const getActiveProjectsByClient = (clientId: number): Project[] => {
    return projects.value.filter(p => p.clientId === clientId && p.active)
  }

  const getProjectsByIds = (ids: number[]): Project[] => {
    return projects.value.filter(p => ids.includes(p.id))
  }

  return {
    // State
    projects: computed(() => projects.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    filters: computed(() => filters.value),

    // Getters
    activeProjects,
    filteredProjects,
    projectsByClient,
    projectsCount,
    activeProjectsCount,

    // Actions
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    updateProjectStatus,
    deleteProject,
    searchProjects,
    setFilters,
    clearFilters,
    clearError,

    // Utilities
    getProjectById,
    getProjectsByClient,
    getActiveProjectsByClient,
    getProjectsByIds
  }
})