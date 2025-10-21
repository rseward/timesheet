import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProjectModal from '../ProjectModal.vue'
import { useClientsStore } from '@/stores/clients'
import { useProjectsStore } from '@/stores/projects'

// Mock stores
vi.mock('@/stores/clients')
vi.mock('@/stores/projects')

// Mock notification composable
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()
vi.mock('@/composables/useNotification', () => ({
  useNotification: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError
  })
}))

describe('ProjectModal', () => {
  let wrapper: any
  let clientsStore: any
  let projectsStore: any

  const mockClients = [
    { id: 1, organisation: 'Client 1', active: true },
    { id: 2, organisation: 'Client 2', active: true }
  ]

  const mockProject = {
    project_id: 1,
    title: 'Test Project',
    description: 'Test Description',
    client_id: 1,
    proj_leader: 'John Doe',
    start_date: '2023-01-01',
    deadline: '2023-12-31',
    proj_status: 'Started' as const,
    active: true
  }

  beforeEach(() => {
    setActivePinia(createPinia())

    // Setup mock stores
    clientsStore = {
      clients: mockClients,
      activeClients: mockClients,
      fetchClients: vi.fn().mockResolvedValue(mockClients)
    }
    vi.mocked(useClientsStore).mockReturnValue(clientsStore)

    projectsStore = {
      createProject: vi.fn().mockResolvedValue(mockProject),
      updateProject: vi.fn().mockResolvedValue(mockProject),
      loading: false,
      error: null
    }
    vi.mocked(useProjectsStore).mockReturnValue(projectsStore)
  })

  it('renders correctly when creating new project', () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    expect(wrapper.find('[data-testid="project-modal"]').exists()).toBe(true)
    expect(wrapper.find('h3').text()).toContain('Add New Project')
  })

  it('renders correctly when editing existing project', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: mockProject
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('h3').text()).toContain('Edit Project')
  })

  it('initializes form data correctly for new project', () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    expect(wrapper.vm.formData).toEqual({
      client_id: '',
      title: '',
      description: '',
      start_date: '',
      deadline: '',
      http_link: '',
      proj_status: 'Pending' as const,
      proj_leader: '',
      active: true
    })
  })

  it('initializes form data correctly for existing project', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: false,
        project: mockProject
      }
    })

    // Open the modal to trigger the watch
    await wrapper.setProps({ isOpen: true })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.formData).toEqual({
      client_id: '1',
      title: 'Test Project',
      description: 'Test Description',
      start_date: '2023-01-01',
      deadline: '2023-12-31',
      http_link: '',
      proj_status: 'Started' as const,
      proj_leader: 'John Doe',
      active: true
    })
  })

  it('fetches clients on mount', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: false,
        project: null
      }
    })

    // Open the modal to trigger the watch
    await wrapper.setProps({ isOpen: true })
    await wrapper.vm.$nextTick()

    expect(clientsStore.fetchClients).toHaveBeenCalled()
  })

  it('emits cancel when dialog is closed', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    await wrapper.find('[data-testid="cancel-button"]').trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('validates required fields', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    // Try to submit form without required fields
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    // Check for validation errors
    expect(wrapper.vm.errors.client_id).toBe('Client is required')
    expect(wrapper.vm.errors.title).toBe('Project title is required')
  })

  it('validates form successfully with valid data', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    // Fill in required fields
    wrapper.vm.formData.client_id = '1'
    wrapper.vm.formData.title = 'Test Project'
    wrapper.vm.formData.proj_status = 'Started'

    const isValid = wrapper.vm.validateForm()
    expect(isValid).toBe(true)
  })

  it('calls createProject when submitting new project', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    // Fill in required fields
    wrapper.vm.formData.client_id = '1'
    wrapper.vm.formData.title = 'New Project'
    wrapper.vm.formData.proj_status = 'Started'
    wrapper.vm.formData.active = true

    await wrapper.vm.handleSubmit()

    expect(projectsStore.createProject).toHaveBeenCalledWith({
      client_id: 1,
      title: 'New Project',
      description: undefined,
      start_date: undefined,
      deadline: undefined,
      http_link: undefined,
      proj_status: 'Started' as const,
      proj_leader: undefined,
      active: true
    })
  })

  it('calls updateProject when submitting existing project', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: false,
        project: mockProject
      }
    })

    // Open the modal to trigger the watch
    await wrapper.setProps({ isOpen: true })
    await wrapper.vm.$nextTick()
    
    wrapper.vm.formData.title = 'Updated Project'

    await wrapper.vm.handleSubmit()

    expect(projectsStore.updateProject).toHaveBeenCalledWith(mockProject.project_id, expect.objectContaining({
      title: 'Updated Project'
    }))
  })

  it('shows success notification and closes modal on successful creation', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    // Fill in required fields
    wrapper.vm.formData.client_id = '1'
    wrapper.vm.formData.title = 'New Project'
    wrapper.vm.formData.proj_status = 'Started'
    wrapper.vm.formData.active = true

    await wrapper.vm.handleSubmit()

    expect(mockShowSuccess).toHaveBeenCalledWith('Project created successfully')
    expect(wrapper.emitted('success')).toBeTruthy()
  })

  it('shows success notification and closes modal on successful update', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: false,
        project: mockProject
      }
    })

    // Open the modal to trigger the watch
    await wrapper.setProps({ isOpen: true })
    await wrapper.vm.$nextTick()
    wrapper.vm.formData.title = 'Updated Project'

    await wrapper.vm.handleSubmit()

    expect(mockShowSuccess).toHaveBeenCalledWith('Project updated successfully')
    expect(wrapper.emitted('success')).toBeTruthy()
  })

  it('shows error notification on creation failure', async () => {
    const error = new Error('Creation failed')
    projectsStore.createProject.mockRejectedValue(error)

    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    // Fill in required fields
    wrapper.vm.formData.client_id = '1'
    wrapper.vm.formData.title = 'New Project'
    wrapper.vm.formData.proj_status = 'Started'
    wrapper.vm.formData.active = true

    await wrapper.vm.handleSubmit()

    expect(mockShowError).toHaveBeenCalledWith('Creation failed')
  })

  it('shows error notification on update failure', async () => {
    const error = new Error('Update failed')
    projectsStore.updateProject.mockRejectedValue(error)

    wrapper = mount(ProjectModal, {
      props: {
        isOpen: false,
        project: mockProject
      }
    })

    // Open the modal to trigger the watch
    await wrapper.setProps({ isOpen: true })
    await wrapper.vm.$nextTick()
    wrapper.vm.formData.title = 'Updated Project'

    await wrapper.vm.handleSubmit()

    expect(mockShowError).toHaveBeenCalledWith('Update failed')
  })

  it('disables submit button when loading', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    // Set the component's loading state
    wrapper.vm.loading = true
    await wrapper.vm.$nextTick()

    const submitButton = wrapper.find('[data-testid="submit-button"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('enables submit button when not loading', () => {
    projectsStore.loading = false

    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    const submitButton = wrapper.find('[data-testid="submit-button"]')
    expect(submitButton.attributes('disabled')).toBeUndefined()
  })

  it('displays error message when store has error', () => {
    projectsStore.error = 'Some error'

    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    const alert = wrapper.find('[data-testid="error-alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Some error')
  })

  it('resets form when modal is closed', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    // Modify form data
    wrapper.vm.formData.client_id = '1'
    wrapper.vm.formData.title = 'Test Project'

    // Close modal
    await wrapper.setProps({ isOpen: false })
    await wrapper.vm.$nextTick()

    // Reopen modal
    await wrapper.setProps({ isOpen: true })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.formData.title).toBe('')
  })

  it('computes isEditing correctly for new project', () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    expect(wrapper.vm.isEditing).toBe(false)
  })

  it('computes isEditing correctly for existing project', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: mockProject
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isEditing).toBe(true)
  })

  it('computes modal title correctly for new project', () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    expect(wrapper.find('h3').text()).toBe('Add New Project')
  })

  it('computes modal title correctly for existing project', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: mockProject
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.find('h3').text()).toBe('Edit Project')
  })

  it('computes submit button text correctly for new project', () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: null
      }
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toBe('Create Project')
  })

  it('computes submit button text correctly for existing project', async () => {
    wrapper = mount(ProjectModal, {
      props: {
        isOpen: true,
        project: mockProject
      }
    })

    await wrapper.vm.$nextTick()
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toBe('Update Project')
  })
})