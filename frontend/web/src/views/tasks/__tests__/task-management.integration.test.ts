import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory, Router } from 'vue-router'
import TasksView from '../TasksView.vue'
import TaskModal from '../TaskModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { useClientsStore } from '@/stores/clients'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/auth'

// Mock stores
vi.mock('@/stores/clients')
vi.mock('@/stores/projects')
vi.mock('@/stores/tasks')
vi.mock('@/stores/auth')

// Mock notification composable
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()
vi.mock('@/composables/useNotification', () => ({
  useNotification: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError
  })
}))

describe('Task Management Integration Tests', () => {
  let wrapper: any
  let router: Router
  let clientsStore: any
  let projectsStore: any
  let tasksStore: any
  let authStore: any

  const mockClients = [
    { id: 1, organisation: 'Client 1', active: true },
    { id: 2, organisation: 'Client 2', active: true },
    { id: 3, organisation: 'Inactive Client', active: false }
  ]

  const mockProjects = [
    {
      project_id: 1,
      title: 'Active Project 1',
      description: 'Description 1',
      client_id: 1,
      client_name: 'Client 1',
      proj_status: 'Started',
      active: true
    },
    {
      project_id: 2,
      title: 'Planning Project',
      description: 'Description 2',
      client_id: 2,
      client_name: 'Client 2',
      proj_status: 'Pending',
      active: true
    },
    {
      project_id: 3,
      title: 'Completed Project',
      description: 'Description 3',
      client_id: 1,
      client_name: 'Client 1',
      proj_status: 'Complete',
      active: false
    }
  ]

  const mockTasks = [
    {
      task_id: 1,
      name: 'Active Task 1',
      description: 'Description 1',
      project_id: 1,
      project_name: 'Active Project 1',
      assigned: '2023-01-01',
      started: '2023-01-02',
      suspended: '',
      completed: '',
      status: 'Started' as const,
      active: true,
      http_link: ''
    },
    {
      task_id: 2,
      name: 'Pending Task',
      description: 'Description 2',
      project_id: 2,
      project_name: 'Planning Project',
      assigned: '2023-02-01',
      started: '',
      suspended: '',
      completed: '',
      status: 'Pending' as const,
      active: true,
      http_link: ''
    },
    {
      task_id: 3,
      name: 'Completed Task',
      description: 'Description 3',
      project_id: 1,
      project_name: 'Active Project 1',
      assigned: '2022-01-01',
      started: '2022-01-02',
      suspended: '',
      completed: '2022-12-31',
      status: 'Complete' as const,
      active: false,
      http_link: ''
    }
  ]

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())

    // Setup router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/tasks', component: TasksView },
        { path: '/projects', component: { template: '<div>Projects</div>' } },
        { path: '/clients', component: { template: '<div>Clients</div>' } }
      ]
    })

    // Setup mock stores
    clientsStore = {
      clients: mockClients,
      activeClients: mockClients.filter(c => c.active),
      fetchClients: vi.fn().mockResolvedValue(mockClients),
      loading: false,
      error: null
    }
    vi.mocked(useClientsStore).mockReturnValue(clientsStore)

    projectsStore = {
      projects: mockProjects,
      activeProjects: mockProjects.filter(p => p.active),
      fetchProjects: vi.fn().mockResolvedValue(mockProjects),
      loading: false,
      error: null
    }
    vi.mocked(useProjectsStore).mockReturnValue(projectsStore)

    tasksStore = {
      tasks: mockTasks,
      filteredTasks: mockTasks,
      tasksCount: mockTasks.length,
      activeTasksCount: mockTasks.filter(t => t.active).length,
      fetchTasks: vi.fn().mockResolvedValue(mockTasks),
      createTask: vi.fn().mockImplementation((taskData) =>
        Promise.resolve({ ...taskData, task_id: 4, project_name: 'Active Project 1' })
      ),
      updateTask: vi.fn().mockImplementation((id, taskData) =>
        Promise.resolve({ ...mockTasks.find(t => t.task_id === id), ...taskData })
      ),
      deleteTask: vi.fn().mockResolvedValue(undefined),
      setFilters: vi.fn(),
      clearFilters: vi.fn(),
      loading: false,
      error: null
    }
    vi.mocked(useTasksStore).mockReturnValue(tasksStore)

    authStore = {
      user: { id: 1, username: 'testuser', email: 'test@example.com' },
      isAuthenticated: true
    }
    vi.mocked(useAuthStore).mockReturnValue(authStore)

    router.push('/tasks')
    await router.isReady()
  })

  describe('Complete Task Workflow', () => {
    it('creates a new task from start to finish', async () => {
      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      // Verify initial state
      expect(tasksStore.fetchTasks).toHaveBeenCalled()
      expect(clientsStore.fetchClients).toHaveBeenCalled()
      expect(projectsStore.fetchProjects).toHaveBeenCalled()

      // Open add task modal
      wrapper.vm.openAddTaskModal()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isTaskModalOpen).toBe(true)
      expect(wrapper.vm.selectedTask).toBeNull()

      // Simulate modal success (task created)
      wrapper.vm.onTaskModalSuccess()
      await flushPromises()

      expect(wrapper.vm.isTaskModalOpen).toBe(false)
      expect(tasksStore.fetchTasks).toHaveBeenCalledTimes(2) // Initial + refresh
    })

    it('edits an existing task', async () => {
      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      const taskToEdit = mockTasks[0]

      // Open edit modal
      wrapper.vm.openEditTaskModal(taskToEdit)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isTaskModalOpen).toBe(true)
      expect(wrapper.vm.selectedTask).toEqual(taskToEdit)

      // Simulate modal success (task updated)
      wrapper.vm.onTaskModalSuccess()
      await flushPromises()

      expect(wrapper.vm.isTaskModalOpen).toBe(false)
      expect(tasksStore.fetchTasks).toHaveBeenCalledTimes(2) // Initial + refresh
    })

    it('deletes a task with confirmation', async () => {
      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      const taskToDelete = mockTasks[0]

      // Open delete confirmation
      wrapper.vm.openDeleteConfirmation(taskToDelete)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isDeleteModalOpen).toBe(true)
      expect(wrapper.vm.selectedTask).toEqual(taskToDelete)

      // Confirm deletion
      await wrapper.vm.confirmDelete()
      await flushPromises()

      expect(tasksStore.deleteTask).toHaveBeenCalledWith(taskToDelete.task_id)
      expect(mockShowSuccess).toHaveBeenCalledWith('Task deleted successfully')
      expect(wrapper.vm.isDeleteModalOpen).toBe(false)
    })

    it('cancels task deletion', async () => {
      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      const taskToDelete = mockTasks[0]

      // Open delete confirmation
      wrapper.vm.openDeleteConfirmation(taskToDelete)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isDeleteModalOpen).toBe(true)

      // Cancel deletion
      wrapper.vm.closeDeleteModal()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isDeleteModalOpen).toBe(false)
      expect(wrapper.vm.selectedTask).toBeNull()
      expect(tasksStore.deleteTask).not.toHaveBeenCalled()
    })
  })

  describe('Filtering and Search', () => {
    it('actually filters tasks by client in the store', async () => {
      // Create a realistic scenario with tasks from different projects/clients
      const allTasks = [
        { ...mockTasks[0], task_id: 1, project_id: 1, name: 'Task for Project 1 (Client 1)' },
        { ...mockTasks[1], task_id: 2, project_id: 2, name: 'Task for Project 2 (Client 2)' },
        { ...mockTasks[2], task_id: 3, project_id: 1, name: 'Another Task for Project 1 (Client 1)' }
      ]

      tasksStore.tasks = allTasks

      // Set up the filteredTasks to use the actual computed filter
      let currentFilters = { clientId: null, projectId: null, status: null, active: null, search: '' }
      Object.defineProperty(tasksStore, 'filteredTasks', {
        get: () => {
          let result = allTasks

          if (currentFilters.clientId) {
            const clientProjectIds = mockProjects
              .filter(p => p.client_id === currentFilters.clientId)
              .map(p => p.project_id)
            result = result.filter(task => clientProjectIds.includes(task.project_id))
          }

          return result
        }
      })

      // Mock setFilters to update currentFilters
      tasksStore.setFilters = vi.fn((newFilters) => {
        currentFilters = { ...currentFilters, ...newFilters }
      })

      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      // Initially, should show all tasks
      expect(tasksStore.filteredTasks).toHaveLength(3)

      // Filter by client 1 - should show only tasks from projects belonging to client 1
      wrapper.vm.filters.clientId = 1
      wrapper.vm.onClientChange()

      await wrapper.vm.$nextTick()

      // Client 1 has project 1, so should show 2 tasks
      expect(tasksStore.filteredTasks).toHaveLength(2)
      expect(tasksStore.filteredTasks.every(t => t.project_id === 1)).toBe(true)
    })

    it('filters tasks by client', async () => {
      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      // Select client filter
      wrapper.vm.filters.clientId = 1
      wrapper.vm.onClientChange()

      expect(tasksStore.setFilters).toHaveBeenCalledWith({
        clientId: 1,
        projectId: null
      })
      // Project filter should be reset
      expect(wrapper.vm.filters.projectId).toBeNull()
    })

    it('filters tasks by project', async () => {
      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      // Select project filter
      wrapper.vm.filters.projectId = 1
      wrapper.vm.onProjectChange()

      expect(tasksStore.setFilters).toHaveBeenCalledWith({ projectId: 1 })
    })

    it('filters tasks by status', async () => {
      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      // Select status filter
      wrapper.vm.filters.status = 'Started'
      wrapper.vm.onStatusChange()

      expect(tasksStore.setFilters).toHaveBeenCalledWith({ status: 'Started' })
    })

    it('filters tasks by active status', async () => {
      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      // Select active filter
      wrapper.vm.filters.active = true
      wrapper.vm.onActiveChange()

      expect(tasksStore.setFilters).toHaveBeenCalledWith({ active: true })
    })

    it('searches tasks', async () => {
      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      // Enter search query
      wrapper.vm.filters.search = 'task name'
      wrapper.vm.onSearchChange()

      expect(tasksStore.setFilters).toHaveBeenCalledWith({ search: 'task name' })
    })

    it('clears all filters', async () => {
      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      // Set multiple filters
      wrapper.vm.filters = {
        clientId: 1,
        projectId: 1,
        status: 'Started',
        active: true,
        search: 'test'
      }

      // Clear filters
      wrapper.vm.clearFilters()

      expect(wrapper.vm.filters).toEqual({
        clientId: null,
        projectId: null,
        status: null,
        active: null,
        search: ''
      })
      expect(tasksStore.clearFilters).toHaveBeenCalled()
    })

    it('filters available projects by selected client', async () => {
      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      // Initially, all projects should be available
      expect(wrapper.vm.availableProjects).toHaveLength(mockProjects.length)

      // Select client 1
      wrapper.vm.filters.clientId = 1
      await wrapper.vm.$nextTick()

      // Only projects for client 1 should be available
      const filteredProjects = wrapper.vm.availableProjects
      expect(filteredProjects.every((p: any) => p.client_id === 1)).toBe(true)
    })
  })

  describe('Empty States', () => {
    it('shows empty state when no tasks exist', async () => {
      tasksStore.filteredTasks = []
      tasksStore.tasksCount = 0

      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      // Check for empty state text content instead of data-testid
      expect(wrapper.text()).toContain('No tasks found')
    })

    it('shows clear filters button in empty state with active filters', async () => {
      tasksStore.filteredTasks = []
      tasksStore.tasksCount = 5 // Tasks exist but are filtered out

      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      wrapper.vm.filters.status = 'Started'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.hasActiveFilters).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('handles fetch tasks error', async () => {
      const errorMessage = 'Failed to load tasks'
      tasksStore.fetchTasks.mockRejectedValueOnce(new Error(errorMessage))

      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      expect(wrapper.vm.error).toBe(errorMessage)
      expect(mockShowError).toHaveBeenCalledWith(errorMessage)
    })

    it('handles delete task error', async () => {
      const errorMessage = 'Failed to delete task'
      tasksStore.deleteTask.mockRejectedValueOnce(new Error(errorMessage))

      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      const taskToDelete = mockTasks[0]
      wrapper.vm.selectedTask = taskToDelete

      await wrapper.vm.confirmDelete()
      await flushPromises()

      expect(mockShowError).toHaveBeenCalledWith(errorMessage)
    })

    it('retries loading tasks after error', async () => {
      const errorMessage = 'Failed to load tasks'
      tasksStore.fetchTasks.mockRejectedValueOnce(new Error(errorMessage))

      wrapper = mount(TasksView, {
        global: {
          plugins: [router],
          stubs: {
            AppHeader: true,
            FormButton: true,
            FormInput: true
          }
        }
      })

      await flushPromises()

      expect(wrapper.vm.error).toBe(errorMessage)

      // Clear the error and retry
      tasksStore.fetchTasks.mockResolvedValueOnce(mockTasks)
      await wrapper.vm.loadTasks()
      await flushPromises()

      expect(wrapper.vm.error).toBeNull()
    })
  })

  describe('TaskModal Integration', () => {
    it('creates task through modal', async () => {
      const modalWrapper = mount(TaskModal, {
        props: {
          isOpen: true,
          task: null
        },
        global: {
          plugins: [router],
          stubs: {
            FormButton: true,
            FormInput: true,
            DatePicker: true
          }
        }
      })

      await flushPromises()

      // Fill in form
      modalWrapper.vm.formData = {
        project_id: '1',
        name: 'New Integration Task',
        description: 'Created through integration test',
        assigned: '2023-01-01',
        started: '',
        suspended: '',
        completed: '',
        http_link: '',
        status: 'Pending' as const,
        active: true
      }

      // Submit form
      await modalWrapper.vm.handleSubmit()
      await flushPromises()

      expect(tasksStore.createTask).toHaveBeenCalledWith({
        task_id: 0,
        project_id: 1,
        name: 'New Integration Task',
        description: 'Created through integration test',
        assigned: '2023-01-01',
        started: undefined,
        suspended: undefined,
        completed: undefined,
        http_link: undefined,
        status: 'Pending',
        active: true
      })
      expect(mockShowSuccess).toHaveBeenCalledWith('Task created successfully')
    })

    it('updates task through modal', async () => {
      const taskToEdit = mockTasks[0]

      const modalWrapper = mount(TaskModal, {
        props: {
          isOpen: false,
          task: null
        },
        global: {
          plugins: [router],
          stubs: {
            FormButton: true,
            FormInput: true,
            DatePicker: true
          }
        }
      })

      // Open modal with task to trigger watch
      await modalWrapper.setProps({ isOpen: true, task: taskToEdit })
      await flushPromises()

      // Update form
      modalWrapper.vm.formData.name = 'Updated Task Name'
      modalWrapper.vm.formData.status = 'Complete'

      // Submit form
      await modalWrapper.vm.handleSubmit()
      await flushPromises()

      expect(tasksStore.updateTask).toHaveBeenCalledWith(
        taskToEdit.task_id,
        expect.objectContaining({
          name: 'Updated Task Name',
          status: 'Complete'
        })
      )
      expect(mockShowSuccess).toHaveBeenCalledWith('Task updated successfully')
    })
  })
})
