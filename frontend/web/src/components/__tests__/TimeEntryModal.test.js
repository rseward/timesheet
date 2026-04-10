/**
 * Unit tests for TimeEntryModal component (Ticket #56 - Smart Date Defaulting)
 * 
 * Tests:
 * - Smart date computation on modal open
 * - Fallback to today when API fails
 * - Edit mode vs Add mode behavior
 * - Form initialization with defaults
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TimeEntryModal from '../TimeEntryModal.vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useBillingEventsStore } from '@/stores/billingEvents'

// Mock API module
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn()
  },
  apiService: {
    get: vi.fn()
  }
}))

// Mock stores
vi.mock('@/stores/preferences', () => ({
  usePreferencesStore: vi.fn(() => ({
    fetchPreferences: vi.fn(),
    defaultStartTime: '09:00',
    defaultEndTime: '17:00'
  }))
}))

// Create a shared mock for billing events store
const mockBillingEventsStore = {
  getNextTransactionNumber: vi.fn()
}

vi.mock('@/stores/billingEvents', () => ({
  useBillingEventsStore: vi.fn(() => mockBillingEventsStore)
}))

describe('TimeEntryModal', () => {
  const mockClients = [
    { id: '1', organisation: 'Client A' },
    { id: '2', organisation: 'Client B' }
  ]
  
  const mockProjects = [
    { project_id: 10, client_id: 1, title: 'Project 1' },
    { project_id: 20, client_id: 2, title: 'Project 2' }
  ]
  
  const mockTasks = [
    { task_id: 100, project_id: 10, name: 'Task 1' },
    { task_id: 200, project_id: 20, name: 'Task 2' }
  ]
  
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })
  
  describe('Smart Date Defaulting (Ticket #56)', () => {
    it('computes smart default date on modal open (add mode)', async () => {
      const api = await import('@/services/api')
      api.default.get.mockResolvedValue({
        date: '2026-03-18',
        reason: 'next_available_workday',
        iterations: 1
      })

      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks,
          defaultClientId: '1',
          defaultProjectId: '10',
          defaultTaskId: '100'
        }
      })

      await flushPromises()

      // Verify API was called
      expect(api.default.get).toHaveBeenCalledWith('/time-entry/next-date', {
        params: {
          timekeeper_id: 1,
          client_id: 1,
          project_id: 10
        }
      })
      
      // Verify form date was set to smart default
      const form = wrapper.vm.form
      expect(form.date).toBe('2026-03-18')
      
      // Verify smart date info is displayed
      expect(wrapper.vm.smartDateInfo).toEqual({
        date: '2026-03-18',
        reason: 'next_available_workday',
        iterations: 1
      })
    })
    
    it('falls back to today when smart date API fails', async () => {
      const api = await import('@/services/api')
      api.default.get.mockRejectedValue(new Error('API unavailable'))
      
      const today = new Date().toISOString().split('T')[0]
      
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks
        }
      })
      
      await flushPromises()
      
      // Verify fallback to today
      const form = wrapper.vm.form
      expect(form.date).toBe(today)
      
      // Verify no smart date info (API failed)
      expect(wrapper.vm.smartDateInfo).toBeNull()
    })
    
    it('skips smart date computation in edit mode', async () => {
      const api = await import('@/services/api')
      
      const mockTimeEntry = {
        uid: 'test-uid',
        project_id: 10,
        task_id: 100,
        timekeeper_id: 1,
        start_time: '2026-03-17T09:00:00',
        end_time: '2026-03-17T17:00:00'
      }
      
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          timeEntry: mockTimeEntry,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks
        }
      })
      
      await flushPromises()
      
      // Verify API was NOT called (edit mode)
      expect(api.default.get).not.toHaveBeenCalled()
      
      // Verify form populated with existing data
      const form = wrapper.vm.form
      expect(form.date).toBe('2026-03-17')
      expect(form.start_time).toBe('09:00')
      expect(form.end_time).toBe('17:00')
    })
    
    it('displays smart date info badge', async () => {
      const api = await import('@/services/api')
      api.default.get.mockResolvedValue({
        date: '2026-03-18',
        reason: 'next_available_workday',
        iterations: 1
      })
      
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks
        }
      })
      
      await flushPromises()
      
      // Verify green info badge is rendered
      const badge = wrapper.find('.bg-green-50')
      expect(badge.exists()).toBe(true)
      
      // Verify badge text
      expect(badge.text()).toContain('next available work day')
    })
    
    it('passes client_id and project_id to smart date API', async () => {
      const api = await import('@/services/api')
      api.default.get.mockResolvedValue({
        date: '2026-03-18',
        reason: 'next_available_workday'
      })
      
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks,
          defaultClientId: '2',
          defaultProjectId: '20'
        }
      })
      
      await flushPromises()
      
      // Verify correct params sent
      expect(api.default.get).toHaveBeenCalledWith('/time-entry/next-date', {
        params: {
          timekeeper_id: 1,
          client_id: 2,
          project_id: 20
        }
      })
    })
  })
  
  describe('Form Initialization', () => {
    it('initializes with default times from preferences', async () => {
      const api = await import('@/services/api')
      api.default.get.mockResolvedValue({
        date: '2026-03-18', reason: 'next_available_workday'
      })
      
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks
        }
      })
      
      await flushPromises()
      
      const form = wrapper.vm.form
      expect(form.start_time).toBe('09:00')
      expect(form.end_time).toBe('17:00')
    })
    
    it('initializes with filter defaults (add mode)', async () => {
      const api = await import('@/services/api')
      api.default.get.mockResolvedValue({
        date: '2026-03-18', reason: 'next_available_workday'
      })
      
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks,
          defaultClientId: '1',
          defaultProjectId: '10',
          defaultTaskId: '100'
        }
      })
      
      await flushPromises()
      
      const form = wrapper.vm.form
      expect(form.client_id).toBe('1')
      expect(form.project_id).toBe(10)
      expect(form.task_id).toBe(100)
    })
    
    it('populates form with existing data (edit mode)', async () => {
      const mockTimeEntry = {
        uid: 'test-uid',
        project_id: 10,
        task_id: 100,
        timekeeper_id: 1,
        start_time: '2026-03-17T09:00:00',
        end_time: '2026-03-17T17:00:00',
        log_message: 'Test entry',
        active: true
      }
      
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          timeEntry: mockTimeEntry,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks
        }
      })
      
      await flushPromises()
      
      const form = wrapper.vm.form
      expect(form.project_id).toBe(10)
      expect(form.task_id).toBe(100)
      expect(form.date).toBe('2026-03-17')
      expect(form.start_time).toBe('09:00')
      expect(form.end_time).toBe('17:00')
      expect(form.log_message).toBe('Test entry')
    })
    
    it('fetches transaction number when task is selected', async () => {
      const api = await import('@/services/api')
      api.default.get.mockResolvedValue({
        date: '2026-03-18', reason: 'next_available_workday'
      })

      mockBillingEventsStore.getNextTransactionNumber.mockResolvedValue(12345)
      
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks,
          defaultClientId: '1',
          defaultProjectId: '10',
          defaultTaskId: '100'
        }
      })
      
      await flushPromises()

      // Verify transaction number fetched
      expect(mockBillingEventsStore.getNextTransactionNumber).toHaveBeenCalledWith(1, 10, 100)
      
      // Verify form populated
      expect(wrapper.vm.form.trans_num).toBe('12345')
    })
  })
  
  describe('Form Validation', () => {
    it('validates required fields', async () => {
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks
        }
      })
      
      await flushPromises()
      
      // Clear form to trigger validation
      wrapper.vm.form.client_id = ''
      wrapper.vm.form.project_id = 0
      wrapper.vm.form.task_id = 0
      wrapper.vm.form.date = ''
      wrapper.vm.form.start_time = ''
      wrapper.vm.form.end_time = ''
      
      const valid = wrapper.vm.validateForm()
      
      expect(valid).toBe(false)
      expect(wrapper.vm.errors.client_id).toBeTruthy()
      expect(wrapper.vm.errors.project_id).toBeTruthy()
      expect(wrapper.vm.errors.task_id).toBeTruthy()
      expect(wrapper.vm.errors.date).toBeTruthy()
    })
    
    it('validates end time after start time', async () => {
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks
        }
      })
      
      await flushPromises()
      
      // Set invalid times (end before start)
      wrapper.vm.form.date = '2026-03-18'
      wrapper.vm.form.start_time = '17:00'
      wrapper.vm.form.end_time = '09:00'
      
      const valid = wrapper.vm.validateForm()
      
      expect(valid).toBe(false)
      expect(wrapper.vm.errors.end_time).toContain('after start time')
    })
    
    it('calculates hours correctly', async () => {
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks
        }
      })
      
      await flushPromises()
      
      wrapper.vm.form.date = '2026-03-18'
      wrapper.vm.form.start_time = '09:00'
      wrapper.vm.form.end_time = '17:00'
      
      expect(wrapper.vm.calculatedHours).toBeCloseTo(8, 0.1)
    })
  })
  
  describe('Event Emission', () => {
    it('emits save event with form data', async () => {
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks,
          defaultClientId: '1',
          defaultProjectId: '10',
          defaultTaskId: '100'
        }
      })
      
      await flushPromises()
      
      // Submit form
      await wrapper.get('form').trigger('submit.prevent')
      
      // Verify emit called
      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0]).toBeTruthy()
    })
    
    it('emits close event on cancel', async () => {
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks
        }
      })
      
      // Click cancel button
      const cancelBtn = wrapper.get('button[type="button"]')
      await cancelBtn.trigger('click')
      
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })
  
  describe('Filtering', () => {
    it('filters projects by client', async () => {
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks
        }
      })
      
      await flushPromises()
      
      // Set client
      wrapper.vm.form.client_id = '1'
      await wrapper.vm.$nextTick()
      
      // Verify filtered projects
      expect(wrapper.vm.filteredProjects).toHaveLength(1)
      expect(wrapper.vm.filteredProjects[0].project_id).toBe(10)
    })
    
    it('filters tasks by project', async () => {
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks
        }
      })
      
      await flushPromises()
      
      // Set project
      wrapper.vm.form.project_id = 10
      await wrapper.vm.$nextTick()
      
      // Verify filtered tasks
      expect(wrapper.vm.filteredTasks).toHaveLength(1)
      expect(wrapper.vm.filteredTasks[0].task_id).toBe(100)
    })
    
    it('clears project and task when client changes', async () => {
      const wrapper = mount(TimeEntryModal, {
        props: {
          isOpen: true,
          clients: mockClients,
          projects: mockProjects,
          tasks: mockTasks,
          defaultClientId: '1',
          defaultProjectId: '10',
          defaultTaskId: '100'
        }
      })
      
      await flushPromises()
      
      // Change client
      wrapper.vm.form.client_id = '2'
      wrapper.vm.onClientChange()
      
      expect(wrapper.vm.form.project_id).toBe(0)
      expect(wrapper.vm.form.task_id).toBe(0)
    })
  })
})
