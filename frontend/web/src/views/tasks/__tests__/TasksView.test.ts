import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TasksView from '../TasksView.vue'
import { useClientsStore } from '@/stores/clients'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'

// Mock stores
vi.mock('@/stores/clients')
vi.mock('@/stores/projects')
vi.mock('@/stores/tasks')

// Mock router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>'
  }
}))

// Mock notification composable
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()
vi.mock('@/composables/useNotification', () => ({
  useNotification: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError
  })
}))

describe('TasksView', () => {
  let wrapper: any
  let clientsStore: any
  let projectsStore: any
  let tasksStore: any

  const mockClients = [
    { id: 1, organisation: 'Client 1', active: true },
    { id: 2, organisation: 'Client 2', active: true }
  ]

  const mockProjects = [
    { project_id: 1, title: 'Project 1', client_id: 1, client_name: 'Client 1', active: true },
    { project_id: 2, title: 'Project 2', client_id: 2, client_name: 'Client 2', active: true }
  ]

  const mockTasks = [
    {
      task_id: 1,
      name: 'Task 1',
      description: 'Description 1',
      project_id: 1,
      project_name: 'Project 1',
      assigned: '2023-01-01',
      started: '2023-01-02',
      suspended: '',
      completed: '',
      status: 'Started' as const,
      active: true
    },
    {
      task_id: 2,
      name: 'Task 2',
      description: 'Description 2',
      project_id: 2,
      project_name: 'Project 2',
      assigned: '2023-01-05',
      started: '',
      suspended: '',
      completed: '',
      status: 'Pending' as const,
      active: true
    }
  ]

  beforeEach(() => {
    setActivePinia(createPinia())
    mockShowSuccess.mockClear()
    mockShowError.mockClear()

    // Setup mock stores
    clientsStore = {
      clients: mockClients,
      fetchClients: vi.fn().mockResolvedValue(mockClients)
    }
    vi.mocked(useClientsStore).mockReturnValue(clientsStore)

    projectsStore = {
      projects: mockProjects,
      fetchProjects: vi.fn().mockResolvedValue(mockProjects)
    }
    vi.mocked(useProjectsStore).mockReturnValue(projectsStore)

    tasksStore = {
      tasks: mockTasks,
      filteredTasks: mockTasks,
      tasksCount: mockTasks.length,
      activeTasksCount: mockTasks.length,
      fetchTasks: vi.fn().mockResolvedValue(mockTasks),
      deleteTask: vi.fn().mockResolvedValue(undefined),
      setFilters: vi.fn(),
      clearFilters: vi.fn(),
      loading: false,
      error: null
    }
    vi.mocked(useTasksStore).mockReturnValue(tasksStore)
  })

  it('renders correctly', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    expect(wrapper.find('h1').text()).toContain('Tasks')
    expect(wrapper.find('[data-testid="tasks-table"]').exists()).toBe(true)
  })

  it('loads tasks, clients, and projects on mount', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    expect(tasksStore.fetchTasks).toHaveBeenCalled()
    expect(clientsStore.fetchClients).toHaveBeenCalled()
    expect(projectsStore.fetchProjects).toHaveBeenCalled()
  })

  it('displays task list correctly', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(mockTasks.length)
  })

  it('shows loading state', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    // Set loading state before promises resolve
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true)
  })

  it('shows error state', async () => {
    const errorMessage = 'Failed to load tasks'
    tasksStore.fetchTasks.mockRejectedValue(new Error(errorMessage))

    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.error).toBe(errorMessage)
  })

  it('shows empty state when no tasks', async () => {
    tasksStore.filteredTasks = []
    tasksStore.tasksCount = 0

    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="empty-state"]').text()).toContain('No tasks found')
  })

  it('opens add task modal', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    expect(wrapper.vm.isTaskModalOpen).toBe(false)

    wrapper.vm.openAddTaskModal()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isTaskModalOpen).toBe(true)
    expect(wrapper.vm.selectedTask).toBeNull()
  })

  it('passes project filter as default to task modal', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    // Set project filter
    wrapper.vm.filters.projectId = 1
    await wrapper.vm.$nextTick()

    // Open modal
    wrapper.vm.openAddTaskModal()
    await wrapper.vm.$nextTick()

    // Find the TaskModal component
    const taskModal = wrapper.findComponent({ name: 'TaskModal' })
    expect(taskModal.exists()).toBe(true)
    expect(taskModal.props('defaultProjectId')).toBe(1)
  })

  it('opens edit task modal with task data', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    const task = mockTasks[0]
    wrapper.vm.openEditTaskModal(task)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isTaskModalOpen).toBe(true)
    expect(wrapper.vm.selectedTask).toEqual(task)
  })

  it('opens delete confirmation modal', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    const task = mockTasks[0]
    wrapper.vm.openDeleteConfirmation(task)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isDeleteModalOpen).toBe(true)
    expect(wrapper.vm.selectedTask).toEqual(task)
  })

  it('deletes task successfully', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    const task = mockTasks[0]
    wrapper.vm.selectedTask = task
    wrapper.vm.isDeleteModalOpen = true

    await wrapper.vm.confirmDelete()
    await flushPromises()

    expect(tasksStore.deleteTask).toHaveBeenCalledWith(task.task_id)
    expect(mockShowSuccess).toHaveBeenCalledWith('Task deleted successfully')
    expect(wrapper.vm.isDeleteModalOpen).toBe(false)
  })

  it('handles delete error', async () => {
    const errorMessage = 'Failed to delete task'
    tasksStore.deleteTask.mockRejectedValue(new Error(errorMessage))

    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    const task = mockTasks[0]
    wrapper.vm.selectedTask = task

    await wrapper.vm.confirmDelete()
    await flushPromises()

    expect(mockShowError).toHaveBeenCalledWith(errorMessage)
  })

  it('applies client filter', async () => {
    // Mock filteredTasks to return only client 1 tasks
    const client1Tasks = mockTasks.filter(t => t.project_id === 1)
    tasksStore.filteredTasks = client1Tasks

    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    wrapper.vm.filters.clientId = 1
    wrapper.vm.onClientChange()

    expect(tasksStore.setFilters).toHaveBeenCalledWith({
      clientId: 1,
      projectId: null
    })
    // Project filter should be reset when client changes
    expect(wrapper.vm.filters.projectId).toBeNull()
  })

  it('applies project filter', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    wrapper.vm.filters.projectId = 1
    wrapper.vm.onProjectChange()

    expect(tasksStore.setFilters).toHaveBeenCalledWith({ projectId: 1 })
  })

  it('applies status filter', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    wrapper.vm.filters.status = 'Started'
    wrapper.vm.onStatusChange()

    expect(tasksStore.setFilters).toHaveBeenCalledWith({ status: 'Started' })
  })

  it('applies active filter', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    wrapper.vm.filters.active = true
    wrapper.vm.onActiveChange()

    expect(tasksStore.setFilters).toHaveBeenCalledWith({ active: true })
  })

  it('applies search filter', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    wrapper.vm.filters.search = 'test'
    wrapper.vm.onSearchChange()

    expect(tasksStore.setFilters).toHaveBeenCalledWith({ search: 'test' })
  })

  it('clears all filters', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    wrapper.vm.filters = {
      clientId: 1,
      projectId: 1,
      status: 'Started',
      active: true,
      search: 'test'
    }

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

  it('filters projects by selected client', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    // No client selected - should show all projects
    expect(wrapper.vm.availableProjects).toEqual(mockProjects)

    // Select client 1 - should filter to only projects for client 1
    wrapper.vm.filters.clientId = 1
    await wrapper.vm.$nextTick()

    const filteredProjects = wrapper.vm.availableProjects
    expect(filteredProjects).toHaveLength(1)
    expect(filteredProjects[0].client_id).toBe(1)
  })

  it('formats dates correctly', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    // Date formatting depends on locale, so just check it returns a string
    const formattedDate = wrapper.vm.formatDate('2023-01-01')
    expect(typeof formattedDate).toBe('string')
    expect(formattedDate).not.toBe('-')

    expect(wrapper.vm.formatDate(undefined)).toBe('-')
    expect(wrapper.vm.formatDate('')).toBe('-')
  })

  it('returns correct status badge classes', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    expect(wrapper.vm.getStatusBadgeClasses('Pending')).toContain('yellow')
    expect(wrapper.vm.getStatusBadgeClasses('Started')).toContain('blue')
    expect(wrapper.vm.getStatusBadgeClasses('Suspended')).toContain('orange')
    expect(wrapper.vm.getStatusBadgeClasses('Complete')).toContain('green')
  })

  it('shows summary stats', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    const summary = wrapper.find('.bg-gray-50')
    expect(summary.exists()).toBe(true)
    expect(summary.text()).toContain(`Showing ${mockTasks.length}`)
    expect(summary.text()).toContain(`Total: ${mockTasks.length}`)
  })

  it('refreshes task list after modal success', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    tasksStore.fetchTasks.mockClear()

    wrapper.vm.onTaskModalSuccess()
    await flushPromises()

    expect(wrapper.vm.isTaskModalOpen).toBe(false)
    expect(tasksStore.fetchTasks).toHaveBeenCalled()
  })

  it('generates correct delete message', async () => {
    wrapper = mount(TasksView, {
      global: {
        stubs: {
          AppHeader: true,
          TaskModal: true,
          ConfirmationModal: true,
          FormButton: true,
          FormInput: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    const task = mockTasks[0]
    wrapper.vm.selectedTask = task

    const message = wrapper.vm.getDeleteMessage()
    expect(message).toContain(task.name)
    expect(message).toContain('cannot be undone')
  })
})
