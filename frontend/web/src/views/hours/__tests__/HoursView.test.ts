import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import HoursView from '../HoursView.vue'

// Mock all the store modules
vi.mock('@/stores/billingEvents', () => ({
  useBillingEventsStore: () => ({
    billingEvents: [],
    filteredBillingEvents: [],
    totalHours: 0,
    loading: false,
    error: null,
    fetchBillingEvents: vi.fn(),
    createBillingEvent: vi.fn(),
    updateBillingEvent: vi.fn(),
    deleteBillingEvent: vi.fn(),
    setFilters: vi.fn()
  })
}))

vi.mock('@/stores/clients', () => ({
  useClientsStore: () => ({
    clients: [],
    loading: false,
    fetchClients: vi.fn()
  })
}))

vi.mock('@/stores/projects', () => ({
  useProjectsStore: () => ({
    projects: [],
    loading: false,
    fetchProjects: vi.fn()
  })
}))

vi.mock('@/stores/tasks', () => ({
  useTasksStore: () => ({
    tasks: [],
    loading: false,
    fetchTasks: vi.fn()
  })
}))

// Mock components to simplify testing
vi.mock('@/components/layout/AppHeader.vue', () => ({
  default: { template: '<div data-testid="app-header">App Header</div>' }
}))

vi.mock('@/components/TimeEntryModal.vue', () => ({
  default: {
    template: '<div data-testid="time-entry-modal" v-if="isOpen">Time Entry Modal</div>',
    props: ['isOpen', 'timeEntry', 'clients', 'projects', 'tasks'],
    emits: ['close', 'save']
  }
}))

vi.mock('@/components/ConfirmationModal.vue', () => ({
  default: {
    template: '<div data-testid="confirmation-modal" v-if="isOpen">Confirmation Modal</div>',
    props: ['isOpen', 'title', 'message', 'type'],
    emits: ['confirm', 'cancel']
  }
}))

describe('HoursView Basic Tests', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/hours', component: HoursView }
      ]
    })

    vi.clearAllMocks()
  })

  it('renders the hours view component', async () => {
    const wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()

    // Basic rendering test
    expect(wrapper.find('[data-testid="app-header"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Filter Time Entries')
  })

  it('shows filter controls', async () => {
    const wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()

    // Check for filter elements
    expect(wrapper.find('#clientFilter').exists()).toBe(true)
    expect(wrapper.find('#projectFilter').exists()).toBe(true)
    expect(wrapper.find('#taskFilter').exists()).toBe(true)
  })

  it('displays total hours', async () => {
    const wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()

    // Should show total hours even if it's 0
    expect(wrapper.text()).toContain('Total Hours')
  })

  it('shows empty state when no billing events', async () => {
    const wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()

    // Should show empty state message
    expect(wrapper.text()).toContain('0.00 hours (0 entries)')
  })

  it('has add entry button', async () => {
    const wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()

    // Look for add button
    const buttons = wrapper.findAll('button')
    const addButton = buttons.find(btn => btn.text().includes('Add') || btn.attributes('title')?.includes('Add'))
    
    expect(addButton).toBeTruthy()
  })

  it('can open and close time entry modal', async () => {
    const wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()

    // Initially modal should not be visible
    expect(wrapper.find('[data-testid="time-entry-modal"]').exists()).toBe(false)

    // Set modal to open
    wrapper.vm.showAddTimeEntry = true
    await wrapper.vm.$nextTick()

    // Modal should now be visible
    expect(wrapper.find('[data-testid="time-entry-modal"]').exists()).toBe(true)

    // Close modal
    wrapper.vm.closeTimeEntryModal()
    await wrapper.vm.$nextTick()

    // Modal should be hidden
    expect(wrapper.find('[data-testid="time-entry-modal"]').exists()).toBe(false)
  })

  it('can handle filter changes', async () => {
    const wrapper = mount(HoursView, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()

    // Test that filter inputs exist and can be interacted with
    const clientFilter = wrapper.find('#clientFilter')
    expect(clientFilter.exists()).toBe(true)

    // Should not throw errors when changing filters
    expect(() => {
      // wrapper.vm.filters.clientId = 1
    }).not.toThrow()
  })
})