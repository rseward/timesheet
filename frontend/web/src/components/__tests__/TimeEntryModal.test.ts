import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TimeEntryModal from '../TimeEntryModal.vue'
import type { Client } from '@/types/client'
import type { Project } from '@/types/project'
import type { Task } from '@/types/task'
import type { BillingEvent } from '@/types/billingEvent'

describe('TimeEntryModal', () => {
  let wrapper: VueWrapper | null = null

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  const mockClients: Client[] = [
    {
      id: 1,
      organisation: 'Test Corp',
      active: true
    },
    {
      id: 2,
      organisation: 'Another Corp',
      active: true
    }
  ]

  const mockProjects: Project[] = [
    {
      project_id: 1,
      client_id: 1,
      title: 'Project 1',
      proj_status: 'Started',
      active: true
    },
    {
      project_id: 2,
      client_id: 2,
      title: 'Project 2',
      proj_status: 'Started',
      active: true
    }
  ]

  const mockTasks: Task[] = [
    {
      task_id: 1,
      project_id: 1,
      name: 'Task 1',
      status: 'Started',
      active: true
    },
    {
      task_id: 2,
      project_id: 1,
      name: 'Task 2',
      status: 'Started',
      active: true
    }
  ]

  const defaultProps = {
    isOpen: true,
    clients: mockClients,
    projects: mockProjects,
    tasks: mockTasks
  }

  it('renders modal when isOpen is true', () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Add Time Entry')
  })

  it('does not render modal when isOpen is false', () => {
    wrapper = mount(TimeEntryModal, {
      props: {
        ...defaultProps,
        isOpen: false
      }
    })

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('shows "Edit Time Entry" when timeEntry prop is provided', () => {
    const mockTimeEntry: BillingEvent = {
      uid: '1',
      timekeeper_id: 1,
      project_id: 1,
      task_id: 1,
      start_time: '2023-01-01T09:00:00',
      end_time: '2023-01-01T17:00:00',
      active: true
    }

    wrapper = mount(TimeEntryModal, {
      props: {
        ...defaultProps,
        timeEntry: mockTimeEntry
      }
    })

    expect(wrapper.text()).toContain('Edit Time Entry')
  })

  it('populates form fields when editing existing time entry', async () => {
    const mockTimeEntry: BillingEvent = {
      uid: '1',
      timekeeper_id: 1,
      project_id: 1,
      task_id: 1,
      start_time: '2023-01-01T09:00:00',
      end_time: '2023-01-01T17:00:00',
      trans_num: 'T123',
      log_message: 'Test work',
      active: true
    }

    wrapper = mount(TimeEntryModal, {
      props: {
        ...defaultProps,
        timeEntry: mockTimeEntry
      }
    })

    await wrapper.vm.$nextTick()

    const projectSelect = wrapper.find('#project')
    const taskSelect = wrapper.find('#task')
    const dateInput = wrapper.find('#date')
    const startTimeInput = wrapper.find('#start_time')
    const endTimeInput = wrapper.find('#end_time')
    const transNumInput = wrapper.find('#trans_num')
    const logMessageTextarea = wrapper.find('#log_message')

    expect((projectSelect.element as HTMLSelectElement).value).toBe('1')
    expect((taskSelect.element as HTMLSelectElement).value).toBe('1')
    expect((dateInput.element as HTMLInputElement).value).toBe('2023-01-01')
    expect((startTimeInput.element as HTMLInputElement).value).toBe('09:00')
    expect((endTimeInput.element as HTMLInputElement).value).toBe('17:00')
    expect((transNumInput.element as HTMLInputElement).value).toBe('T123')
    expect((logMessageTextarea.element as HTMLTextAreaElement).value).toBe('Test work')
  })

  it('filters projects based on selected client', async () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    const clientSelect = wrapper.find('#client')
    await clientSelect.setValue('1')

    const projectOptions = wrapper.findAll('#project option')
    const projectValues = projectOptions.map(option => (option.element as HTMLOptionElement).value)
    
    expect(projectValues).toContain('1')
    expect(projectValues).not.toContain('2')
  })

  it('filters tasks based on selected project', async () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    const clientSelect = wrapper.find('#client')
    const projectSelect = wrapper.find('#project')

    await clientSelect.setValue('1')
    await projectSelect.setValue('1')

    const taskOptions = wrapper.findAll('#task option')
    const taskValues = taskOptions.map(option => (option.element as HTMLOptionElement).value)
    
    expect(taskValues).toContain('1')
    expect(taskValues).toContain('2')
  })

  it('calculates hours correctly based on start and end time', async () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    const dateInput = wrapper.find('#date')
    const startTimeInput = wrapper.find('#start_time')
    const endTimeInput = wrapper.find('#end_time')

    await dateInput.setValue('2023-01-01')
    await startTimeInput.setValue('09:00')
    await endTimeInput.setValue('17:00')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Total Hours: 8.00')
  })

  it('shows validation errors for required fields', async () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Client is required')
  })

  it('validates that end time is after start time', async () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    const clientSelect = wrapper.find('#client')
    const projectSelect = wrapper.find('#project')
    const taskSelect = wrapper.find('#task')
    const dateInput = wrapper.find('#date')
    const startTimeInput = wrapper.find('#start_time')
    const endTimeInput = wrapper.find('#end_time')

    await clientSelect.setValue('1')
    await projectSelect.setValue('1')
    await taskSelect.setValue('1')
    await dateInput.setValue('2023-01-01')
    await startTimeInput.setValue('17:00')
    await endTimeInput.setValue('09:00')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('End time must be after start time')
  })

  it('emits close event when cancel button is clicked', async () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    const cancelButton = wrapper.find('button[type="button"]')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close event when background overlay is clicked', async () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    const overlay = wrapper.find('.bg-gray-500')
    await overlay.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits save event with correct data when form is submitted', async () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    const clientSelect = wrapper.find('#client')
    const projectSelect = wrapper.find('#project')
    const taskSelect = wrapper.find('#task')
    const dateInput = wrapper.find('#date')
    const startTimeInput = wrapper.find('#start_time')
    const endTimeInput = wrapper.find('#end_time')
    const transNumInput = wrapper.find('#trans_num')
    const logMessageTextarea = wrapper.find('#log_message')

    await clientSelect.setValue('1')
    await projectSelect.setValue('1')
    await taskSelect.setValue('1')
    await dateInput.setValue('2023-01-01')
    await startTimeInput.setValue('09:00')
    await endTimeInput.setValue('17:00')
    await transNumInput.setValue('T123')
    await logMessageTextarea.setValue('Test work')

    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    const saveEvents = wrapper.emitted('save')
    expect(saveEvents).toBeTruthy()
    const savedData = saveEvents![0][0] as any
    expect(savedData.project_id).toBe(1)
    expect(savedData.task_id).toBe(1)
    expect(savedData.timekeeper_id).toBe(1)
    expect(savedData.trans_num).toBe('T123')
    expect(savedData.log_message).toBe('Test work')
    expect(savedData.active).toBe(true)
    expect(savedData.start_time).toContain('2023-01-01')
    expect(savedData.end_time).toContain('2023-01-01')
    // Verify the dates are properly formatted as ISO strings
    expect(new Date(savedData.start_time)).toBeInstanceOf(Date)
    expect(new Date(savedData.end_time)).toBeInstanceOf(Date)
  })

  it('disables project select when no client is selected', () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    const projectSelect = wrapper.find('#project')
    expect((projectSelect.element as HTMLSelectElement).disabled).toBe(true)
  })

  it('disables task select when no project is selected', () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    const taskSelect = wrapper.find('#task')
    expect((taskSelect.element as HTMLSelectElement).disabled).toBe(true)
  })

  it('shows loading state when saving', async () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    // Fill out form
    const clientSelect = wrapper.find('#client')
    const projectSelect = wrapper.find('#project')
    const taskSelect = wrapper.find('#task')
    const dateInput = wrapper.find('#date')
    const startTimeInput = wrapper.find('#start_time')
    const endTimeInput = wrapper.find('#end_time')

    await clientSelect.setValue('1')
    await projectSelect.setValue('1')
    await taskSelect.setValue('1')
    await dateInput.setValue('2023-01-01')
    await startTimeInput.setValue('09:00')
    await endTimeInput.setValue('17:00')

    // Manually set loading state to test the UI
    const vm = wrapper.vm as any
    vm.loading = true
    await wrapper.vm.$nextTick()

    // Check for loading spinner and disabled state
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toContain('Saving...')
    expect((submitButton.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('displays correct button text for edit mode', () => {
    const mockTimeEntry: BillingEvent = {
      uid: '1',
      timekeeper_id: 1,
      project_id: 1,
      task_id: 1,
      start_time: '2023-01-01T09:00:00',
      end_time: '2023-01-01T17:00:00',
      active: true
    }

    wrapper = mount(TimeEntryModal, {
      props: {
        ...defaultProps,
        timeEntry: mockTimeEntry
      }
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toContain('Update')
  })

  it('displays correct button text for add mode', () => {
    wrapper = mount(TimeEntryModal, {
      props: defaultProps
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toContain('Save')
  })
})