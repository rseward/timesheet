import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TaskModal from '../TaskModal.vue'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'

// Mock stores
vi.mock('@/stores/projects')
vi.mock('@/stores/tasks')

// Mock notification composable
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()
vi.mock('@/composables/useNotification', () => ({
  useNotification: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError
  })
}))

describe('TaskModal', () => {
  let wrapper: any
  let projectsStore: any
  let tasksStore: any

  const mockProjects = [
    { project_id: 1, title: 'Project 1', client_id: 1, client_name: 'Client 1', active: true },
    { project_id: 2, title: 'Project 2', client_id: 2, client_name: 'Client 2', active: true }
  ]

  const mockTask = {
    task_id: 1,
    name: 'Test Task',
    description: 'Test Description',
    project_id: 1,
    project_name: 'Project 1',
    assigned: '2023-01-01',
    started: '2023-01-02',
    suspended: '',
    completed: '',
    status: 'Started' as const,
    active: true,
    http_link: ''
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    mockShowSuccess.mockClear()
    mockShowError.mockClear()

    // Setup mock stores
    projectsStore = {
      projects: mockProjects,
      activeProjects: mockProjects,
      fetchProjects: vi.fn().mockResolvedValue(mockProjects)
    }
    vi.mocked(useProjectsStore).mockReturnValue(projectsStore)

    tasksStore = {
      createTask: vi.fn().mockResolvedValue(mockTask),
      updateTask: vi.fn().mockResolvedValue(mockTask),
      loading: false,
      error: null
    }
    vi.mocked(useTasksStore).mockReturnValue(tasksStore)
  })

  it('renders correctly when creating new task', () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    expect(wrapper.find('[data-testid="task-modal"]').exists()).toBe(true)
    expect(wrapper.find('h3').text()).toContain('Add New Task')
  })

  it('renders correctly when editing existing task', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: mockTask
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('h3').text()).toContain('Edit Task')
  })

  it('initializes form data correctly for new task', () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    expect(wrapper.vm.formData).toEqual({
      project_id: '',
      name: '',
      description: '',
      assigned: '',
      started: '',
      suspended: '',
      completed: '',
      http_link: '',
      status: 'Pending' as const,
      active: true
    })
  })

  it('initializes form data with default project when provided', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: false,
        task: null,
        defaultProjectId: 1
      }
    })

    // Open the modal to trigger the watch
    await wrapper.setProps({ isOpen: true })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.formData.project_id).toBe('1')
  })

  it('shows pre-filled notice when default project is provided', () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null,
        defaultProjectId: 1
      }
    })

    expect(wrapper.find('[data-testid="prefilled-notice"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Project pre-filled from Tasks view filter')
  })

  it('does not show pre-filled notice when editing', () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: mockTask,
        defaultProjectId: 1
      }
    })

    expect(wrapper.find('[data-testid="prefilled-notice"]').exists()).toBe(false)
  })

  it('initializes form data correctly for existing task', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: false,
        task: mockTask
      }
    })

    // Open the modal to trigger the watch
    await wrapper.setProps({ isOpen: true })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.formData).toEqual({
      project_id: '1',
      name: 'Test Task',
      description: 'Test Description',
      assigned: '2023-01-01',
      started: '2023-01-02',
      suspended: '',
      completed: '',
      http_link: '',
      status: 'Started' as const,
      active: true
    })
  })

  it('fetches projects on mount', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: false,
        task: null
      }
    })

    // Open the modal to trigger the watch
    await wrapper.setProps({ isOpen: true })
    await wrapper.vm.$nextTick()

    expect(projectsStore.fetchProjects).toHaveBeenCalled()
  })

  it('emits cancel when dialog is closed', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    const cancelButton = wrapper.find('[data-testid="cancel-button"]')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('validates required fields', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    // Trigger validation directly
    const result = wrapper.vm.validateForm()

    expect(result).toBe(false)
    expect(wrapper.vm.errors.project_id).toBeDefined()
    expect(wrapper.vm.errors.name).toBeDefined()
  })

  it('validates task name length', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    wrapper.vm.formData.project_id = '1'
    wrapper.vm.formData.name = 'a'.repeat(201)
    wrapper.vm.formData.status = 'Pending'

    const result = wrapper.vm.validateForm()
    expect(result).toBe(false)
    expect(wrapper.vm.errors.name).toContain('less than 200')
  })

  it('validates date order (assigned before started)', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    wrapper.vm.formData.project_id = '1'
    wrapper.vm.formData.name = 'Test Task'
    wrapper.vm.formData.status = 'Pending'
    wrapper.vm.formData.assigned = '2023-01-10'
    wrapper.vm.formData.started = '2023-01-01'

    const result = wrapper.vm.validateForm()
    expect(result).toBe(false)
    expect(wrapper.vm.errors.started).toContain('after assigned date')
  })

  it('validates date order (started before completed)', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    wrapper.vm.formData.project_id = '1'
    wrapper.vm.formData.name = 'Test Task'
    wrapper.vm.formData.status = 'Pending'
    wrapper.vm.formData.started = '2023-01-10'
    wrapper.vm.formData.completed = '2023-01-01'

    const result = wrapper.vm.validateForm()
    expect(result).toBe(false)
    expect(wrapper.vm.errors.completed).toContain('after started date')
  })

  it('validates URL format', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    wrapper.vm.formData.project_id = '1'
    wrapper.vm.formData.name = 'Test Task'
    wrapper.vm.formData.status = 'Pending'
    wrapper.vm.formData.http_link = 'not-a-valid-url'

    const result = wrapper.vm.validateForm()
    expect(result).toBe(false)
    expect(wrapper.vm.errors.http_link).toContain('valid URL')
  })

  it('creates new task successfully', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    wrapper.vm.formData = {
      project_id: '1',
      name: 'New Task',
      description: 'Test Description',
      assigned: '2023-01-01',
      started: '',
      suspended: '',
      completed: '',
      http_link: '',
      status: 'Pending' as const,
      active: true
    }

    await wrapper.vm.handleSubmit()
    await wrapper.vm.$nextTick()

    expect(tasksStore.createTask).toHaveBeenCalledWith({
      task_id: 0,
      project_id: 1,
      name: 'New Task',
      description: 'Test Description',
      assigned: '2023-01-01',
      started: undefined,
      suspended: undefined,
      completed: undefined,
      http_link: undefined,
      status: 'Pending',
      active: true
    })
    expect(mockShowSuccess).toHaveBeenCalledWith('Task created successfully')
    expect(wrapper.emitted('success')).toBeTruthy()
  })

  it('updates existing task successfully', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: false,
        task: null
      }
    })

    // Open modal with task to trigger watch
    await wrapper.setProps({ isOpen: true, task: mockTask })
    await wrapper.vm.$nextTick()

    wrapper.vm.formData.name = 'Updated Task'

    await wrapper.vm.handleSubmit()
    await wrapper.vm.$nextTick()

    expect(tasksStore.updateTask).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        name: 'Updated Task'
      })
    )
    expect(mockShowSuccess).toHaveBeenCalledWith('Task updated successfully')
    expect(wrapper.emitted('success')).toBeTruthy()
  })

  it('handles creation error correctly', async () => {
    const errorMessage = 'Failed to create task'
    tasksStore.createTask.mockRejectedValue(new Error(errorMessage))

    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    wrapper.vm.formData = {
      project_id: '1',
      name: 'New Task',
      description: '',
      assigned: '',
      started: '',
      suspended: '',
      completed: '',
      http_link: '',
      status: 'Pending' as const,
      active: true
    }

    await wrapper.vm.handleSubmit()
    await wrapper.vm.$nextTick()

    expect(mockShowError).toHaveBeenCalledWith(errorMessage)
  })

  it('displays error from store', async () => {
    tasksStore.error = 'Store error message'

    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    await wrapper.vm.$nextTick()

    const errorAlert = wrapper.find('[data-testid="error-alert"]')
    expect(errorAlert.exists()).toBe(true)
    expect(errorAlert.text()).toContain('Store error message')
  })

  it('disables project field when editing', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: mockTask
      }
    })

    await wrapper.vm.$nextTick()

    const projectSelect = wrapper.find('[data-testid="project-select"]')
    expect(projectSelect.attributes('disabled')).toBeDefined()
  })

  it('renders all form fields correctly', () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    expect(wrapper.find('[data-testid="project-select"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="task-name-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="task-description-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="assigned-date-picker"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="started-date-picker"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="suspended-date-picker"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="completed-date-picker"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="status-select"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="http-link-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="active-checkbox"]').exists()).toBe(true)
  })

  it('resets form when modal is opened for new task', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: mockTask
      }
    })

    // Close and reopen with null task
    await wrapper.setProps({ isOpen: false })
    await wrapper.vm.$nextTick()
    await wrapper.setProps({ isOpen: true, task: null })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.formData.name).toBe('')
    expect(wrapper.vm.formData.project_id).toBe('')
  })

  it('clears errors when modal is reopened', async () => {
    wrapper = mount(TaskModal, {
      props: {
        isOpen: true,
        task: null
      }
    })

    // Trigger validation to set errors
    wrapper.vm.validateForm()
    expect(Object.keys(wrapper.vm.errors).length).toBeGreaterThan(0)

    // Close and reopen
    await wrapper.setProps({ isOpen: false })
    await wrapper.vm.$nextTick()
    await wrapper.setProps({ isOpen: true })
    await wrapper.vm.$nextTick()

    expect(Object.keys(wrapper.vm.errors).length).toBe(0)
  })
})
