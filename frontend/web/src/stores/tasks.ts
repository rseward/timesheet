import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tasksApi } from '@/services/tasks'
import type { Task, TaskCreateData, TaskUpdateData, TaskStatus } from '@/types/task'

export interface TaskFilters {
  projectId?: number | null
  clientId?: number | null
  active?: boolean | null
  status?: TaskStatus | null
  search?: string
}

export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<TaskFilters>({
    projectId: null,
    clientId: null,
    active: null,
    status: null,
    search: ''
  })

  // Getters
  const activeTasks = computed(() => 
    tasks.value.filter(task => task.active)
  )

  const filteredTasks = computed(() => {
    let result = tasks.value

    if (filters.value.projectId) {
      result = result.filter(task => task.project_id === filters.value.projectId)
    }

    if (filters.value.clientId) {
      result = result.filter(task => {
        // Note: Task doesn't have clientId directly, would need project lookup
        return true // TODO: Implement client filtering via project relationship
      })
    }

    if (filters.value.active !== null && filters.value.active !== undefined) {
      result = result.filter(task => task.active === filters.value.active)
    }

    if (filters.value.status) {
      result = result.filter(task => task.status === filters.value.status)
    }

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(task => 
        task.name.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search) ||
        task.project_name?.toLowerCase().includes(search)
      )
    }

    return result
  })

  const tasksByProject = computed(() => {
    const grouped: Record<number, Task[]> = {}
    tasks.value.forEach(task => {
      if (!grouped[task.project_id]) {
        grouped[task.project_id] = []
      }
      grouped[task.project_id].push(task)
    })
    return grouped
  })

  const tasksByClient = computed(() => {
    const grouped: Record<number, Task[]> = {}
    tasks.value.forEach(task => {
      // Tasks don't have direct client_id, need to get it through project
      const clientId = task.project_id // This would need to be resolved from projects store
      if (!grouped[clientId]) {
        grouped[clientId] = []
      }
      grouped[clientId].push(task)
    })
    return grouped
  })

  const tasksCount = computed(() => tasks.value.length)
  const activeTasksCount = computed(() => activeTasks.value.length)

  // Actions
  const fetchTasks = async (projectId?: number, activeOnly = false): Promise<void> => {
    console.log('[TasksStore] fetchTasks called with projectId:', projectId, 'activeOnly:', activeOnly)
    loading.value = true
    error.value = null

    try {
      console.log('[TasksStore] Calling tasksApi.getAll...')
      const result = await tasksApi.getAll(projectId, activeOnly ? true : undefined)
      console.log('[TasksStore] API returned:', result)
      console.log('[TasksStore] Result type:', typeof result, 'Array:', Array.isArray(result))
      
      tasks.value = result
      console.log('[TasksStore] Updated store tasks:', tasks.value?.length || 0, 'tasks')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tasks'
      console.error('[TasksStore] Error in fetchTasks:', err)
      throw err
    } finally {
      loading.value = false
      console.log('[TasksStore] fetchTasks completed. Loading:', loading.value, 'Error:', error.value)
    }
  }

  const fetchTaskById = async (id: number): Promise<Task | null> => {
    loading.value = true
    error.value = null

    try {
      const task = await tasksApi.getById(id)
      
      // Update task in store if it exists
      const index = tasks.value.findIndex(t => t.task_id === id)
      if (index !== -1) {
        tasks.value[index] = task
      } else {
        tasks.value.push(task)
      }
      
      return task
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch task'
      return null
    } finally {
      loading.value = false
    }
  }

  const createTask = async (taskData: TaskCreateData): Promise<Task | null> => {
    loading.value = true
    error.value = null

    try {
      const newTask = await tasksApi.create(taskData)
      tasks.value.push(newTask)
      return newTask
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create task'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTask = async (id: number, taskData: TaskUpdateData): Promise<Task | null> => {
    loading.value = true
    error.value = null

    try {
      const updatedTask = await tasksApi.update(id, taskData)
      const index = tasks.value.findIndex(t => t.task_id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      return updatedTask
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update task'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTaskStatus = async (id: number, status: TaskStatus): Promise<Task | null> => {
    return updateTask(id, { status })
  }

  const deleteTask = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await tasksApi.delete(id)
      tasks.value = tasks.value.filter(t => t.task_id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete task'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTasksByClientAndProject = async (clientId: number, projectId?: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      tasks.value = await tasksApi.getByClientAndProject(clientId, projectId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tasks by client/project'
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchTasks = async (query: string, projectId?: number): Promise<Task[]> => {
    loading.value = true
    error.value = null

    try {
      const results = await tasksApi.searchTasks(query, projectId)
      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search tasks'
      return []
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: Partial<TaskFilters>): void => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = (): void => {
    filters.value = {
      projectId: null,
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
  const getTaskById = (id: number): Task | undefined => {
    return tasks.value.find(t => t.task_id === id)
  }

  const getTasksByProject = (projectId: number): Task[] => {
    return tasks.value.filter(t => t.project_id === projectId)
  }

  const getActiveTasksByProject = (projectId: number): Task[] => {
    return tasks.value.filter(t => t.project_id === projectId && t.active)
  }

  const getTasksByClient = (clientId: number): Task[] => {
    // Note: Tasks don't have direct client_id, would need to resolve through projects
    return tasks.value.filter(t => t.project_id === clientId) // Placeholder - should resolve project to client
  }

  const getTasksByIds = (ids: number[]): Task[] => {
    return tasks.value.filter(t => ids.includes(t.task_id))
  }

  return {
    // State
    tasks: computed(() => tasks.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    filters: computed(() => filters.value),

    // Getters
    activeTasks,
    filteredTasks,
    tasksByProject,
    tasksByClient,
    tasksCount,
    activeTasksCount,

    // Actions
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    fetchTasksByClientAndProject,
    searchTasks,
    setFilters,
    clearFilters,
    clearError,

    // Utilities
    getTaskById,
    getTasksByProject,
    getActiveTasksByProject,
    getTasksByClient,
    getTasksByIds
  }
})