import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import HoursView from '../HoursView.vue'
import { useClientsStore } from '@/stores/clients'
import { useProjectsStore } from '@/stores/projects'
import { useBillingEventsStore } from '@/stores/billingEvents'
import { useTasksStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/auth'

// Mock data
const mockClients = [
  {
    client_id: 1,
    id: 1,
    organisation: 'Test Corp',
    contactEmail: 'test@testcorp.com',
    active: true,
    city: 'New York',
    state: 'NY'
  },
  {
    client_id: 2,
    id: 2,
    organisation: 'Another Corp',
    contactEmail: 'contact@anothercorp.com',
    active: true,
    city: 'Los Angeles',
    state: 'CA'
  },
  {
    client_id: 3,
    id: 3,
    organisation: 'Inactive Corp',
    contactEmail: 'info@inactive.com',
    active: false,
    city: 'Chicago',
    state: 'IL'
  }
]

const mockAuthUser = {
  id: 1,
  email: 'rseward@bluestone-consulting.com',
  username: 'rseward@bluestone-consulting.com'
}

describe('Client Dropdown Integration Tests', () => {
  let wrapper: any
  let router: any
  let pinia: any
  let clientsStore: any
  let projectsStore: any
  let billingEventsStore: any
  let tasksStore: any
  let authStore: any

  beforeEach(async () => {
    // Create fresh pinia instance
    pinia = createPinia()
    setActivePinia(pinia)
    
    // Create router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/hours', component: HoursView }
      ]
    })

    // Setup stores
    clientsStore = useClientsStore()
    projectsStore = useProjectsStore()
    billingEventsStore = useBillingEventsStore()
    tasksStore = useTasksStore()
    authStore = useAuthStore()
    
    // Mock authenticated user
    authStore.user = mockAuthUser
    authStore.token = 'mock-jwt-token'

    // Mock store methods
    vi.spyOn(clientsStore, 'fetchClients').mockResolvedValue(undefined)
    vi.spyOn(projectsStore, 'fetchProjects').mockResolvedValue(undefined)
    vi.spyOn(billingEventsStore, 'fetchBillingEvents').mockResolvedValue(undefined)
    vi.spyOn(tasksStore, 'fetchTasks').mockResolvedValue(undefined)

    // Set up mock data in stores
    clientsStore.clients = mockClients
    projectsStore.projects = []
    // Can't set billingEvents/tasks directly as they're computed - the stores handle the data internally

    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.resetAllMocks()
  })

  it('should populate client dropdown on component mount', async () => {
    // Mount the component
    wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    // Wait for component to mount and data to load
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify store method was called
    expect(clientsStore.fetchClients).toHaveBeenCalled()

    // Check that clients were loaded into the store
    expect(clientsStore.clients).toHaveLength(3)
    expect(clientsStore.clients[0].organisation).toBe('Test Corp')
    expect(clientsStore.clients[1].organisation).toBe('Another Corp')

    // Check that dropdown select element exists
    const clientSelect = wrapper.find('#clientFilter')
    expect(clientSelect.exists()).toBe(true)

    // Check that options are rendered (including the default "All Clients" option)
    const options = clientSelect.findAll('option')
    expect(options.length).toBeGreaterThan(1) // Should have default option + client options
  })

  it('should handle API errors gracefully when loading clients', async () => {
    // Clear clients array to simulate error state
    clientsStore.clients = []
    
    // Mock store method to reject and set error
    vi.spyOn(clientsStore, 'fetchClients').mockRejectedValue(new Error('Network error'))
    clientsStore.error = 'Network error'

    wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Should handle error gracefully
    expect(clientsStore.error).toBe('Network error')
    expect(clientsStore.clients).toHaveLength(0)

    // Component should still render
    expect(wrapper.exists()).toBe(true)
    const clientSelect = wrapper.find('#clientFilter')
    expect(clientSelect.exists()).toBe(true)
  })

  it('should filter clients when dropdown selection changes', async () => {
    wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Get the client select element
    const clientSelect = wrapper.find('#clientFilter')
    expect(clientSelect.exists()).toBe(true)

    // Change the selection to first client
    await clientSelect.setValue('1')
    await wrapper.vm.$nextTick()

    // Check that filter was updated
    expect(wrapper.vm.filters.clientId).toBe(1)

    // Verify that billing events store was called (client filtering may happen in computed properties)
    expect(billingEventsStore.fetchBillingEvents).toHaveBeenCalled()
    
    // The actual filtering should happen in the component's computed properties
    // Since projects are filtered by client, verify the reactive filtering works
    expect(wrapper.vm.filters.clientId).toBe(1)
  })

  it('should show only active clients in dropdown by default', async () => {
    wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Check that only active clients are in the computed activeClients
    expect(clientsStore.activeClients).toHaveLength(2)
    expect(clientsStore.activeClients.map((c: any) => c.organisation)).toEqual([
      'Test Corp',
      'Another Corp'
    ])
  })

  it('should update projects dropdown when client is selected', async () => {
    // This test checks that the projects data is properly filtered when a client is selected
    const mockProjects = [
      { id: 1, name: 'Project 1', client_id: 1, active: true },
      { id: 2, name: 'Project 2', client_id: 1, active: true },
      { id: 3, name: 'Project 3', client_id: 2, active: true }
    ]

    // Set up projects in store
    projectsStore.projects = mockProjects

    wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Select a client
    const clientSelect = wrapper.find('#clientFilter')
    await clientSelect.setValue('1')
    await wrapper.vm.$nextTick()

    // Check that the filtered projects computed correctly
    // Since the component uses filteredProjects computed, we should check that only client 1 projects show
    const filteredProjects = wrapper.vm.filteredProjects
    expect(filteredProjects).toHaveLength(2)
    expect(filteredProjects.every((p: any) => p.client_id === 1)).toBe(true)
  })

  it('should handle authentication context properly', async () => {
    // Test with unauthenticated state
    authStore.user = null
    authStore.token = null

    wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()

    // Component should still render but may show different behavior
    expect(wrapper.exists()).toBe(true)
  })

  it('should show loading state while fetching clients', async () => {
    // Mock delayed store method
    let resolvePromise: any
    const delayedPromise = new Promise(resolve => {
      resolvePromise = resolve
    })

    // Override the mock to return a delayed promise
    vi.spyOn(clientsStore, 'fetchClients').mockImplementation(() => {
      clientsStore.loading = true
      return delayedPromise.then(() => {
        clientsStore.loading = false
        clientsStore.clients = mockClients
      })
    })

    wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()

    // Should be in loading state
    expect(clientsStore.loading).toBe(true)

    // Resolve the promise
    resolvePromise()
    await delayedPromise
    await wrapper.vm.$nextTick()

    // Should no longer be loading
    expect(clientsStore.loading).toBe(false)
    expect(clientsStore.clients).toHaveLength(3)
  })

  it('should persist client selection across component updates', async () => {
    wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Select a client
    const clientSelect = wrapper.find('#clientFilter')
    await clientSelect.setValue('1')
    await wrapper.vm.$nextTick()

    // Verify selection is maintained
    expect(wrapper.vm.filters.clientId).toBe(1)
    expect(clientSelect.element.value).toBe('1')

    // Force re-render
    await wrapper.vm.$forceUpdate()
    await wrapper.vm.$nextTick()

    // Selection should still be maintained
    expect(wrapper.vm.filters.clientId).toBe(1)
  })

  it('should clear dependent dropdowns when client selection is cleared', async () => {
    wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Set initial selections
    wrapper.vm.filters.clientId = 1
    wrapper.vm.filters.projectId = 2
    wrapper.vm.filters.taskId = 3
    await wrapper.vm.$nextTick()

    // Clear client selection
    const clientSelect = wrapper.find('#clientFilter')
    await clientSelect.setValue('')
    await wrapper.vm.$nextTick()

    // Dependent filters should be cleared
    expect(wrapper.vm.filters.clientId).toBe('')
    expect(wrapper.vm.filters.projectId).toBe('')
    expect(wrapper.vm.filters.taskId).toBe('')
  })
})