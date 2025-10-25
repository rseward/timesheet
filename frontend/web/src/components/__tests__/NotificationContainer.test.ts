import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import NotificationContainer from '../NotificationContainer.vue'
import { useNotification } from '@/composables/useNotification'

describe('NotificationContainer', () => {
  let wrapper: any
  let notification: any

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(NotificationContainer, {
      global: {
        stubs: {
          Teleport: {
            template: '<div><slot /></div>',
            props: ['to']
          }
        }
      }
    })
    notification = useNotification()
  })

  afterEach(() => {
    notification.dismissAll()
    wrapper?.unmount()
  })

  it('renders no notifications when empty', () => {
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('displays success notification', async () => {
    notification.success('Success!', 'Operation completed successfully')
    
    await wrapper.vm.$nextTick()
    
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.classes()).toContain('bg-green-50')
    expect(alert.text()).toContain('Success!')
    expect(alert.text()).toContain('Operation completed successfully')
  })

  it('displays error notification', async () => {
    notification.error('Error!', 'Something went wrong')
    
    await wrapper.vm.$nextTick()
    
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.classes()).toContain('bg-red-50')
    expect(alert.text()).toContain('Error!')
    expect(alert.text()).toContain('Something went wrong')
  })

  it('displays warning notification', async () => {
    notification.warning('Warning!', 'Please review this action')
    
    await wrapper.vm.$nextTick()
    
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.classes()).toContain('bg-yellow-50')
    expect(alert.text()).toContain('Warning!')
    expect(alert.text()).toContain('Please review this action')
  })

  it('displays info notification', async () => {
    notification.info('Info', 'Here is some information')
    
    await wrapper.vm.$nextTick()
    
    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.classes()).toContain('bg-blue-50')
    expect(alert.text()).toContain('Info')
    expect(alert.text()).toContain('Here is some information')
  })

  it('shows close button for non-persistent notifications', async () => {
    notification.success('Test')
    
    await wrapper.vm.$nextTick()
    
    const closeButton = wrapper.find('button[aria-label*="Dismiss"]')
    expect(closeButton.exists()).toBe(true)
  })

  it('hides close button for persistent notifications', async () => {
    notification.success('Test', '', { persistent: true })
    
    await wrapper.vm.$nextTick()
    
    const closeButton = wrapper.find('button[aria-label*="Dismiss"]')
    expect(closeButton.exists()).toBe(false)
  })

  it('dismisses notification when close button clicked', async () => {
    const id = notification.success('Test')
    
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    
    const closeButton = wrapper.find('button[aria-label*="Dismiss"]')
    await closeButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('displays notification actions', async () => {
    const mockAction = vi.fn()
    notification.success('Test', '', {
      actions: [
        { label: 'Cancel', action: () => {}, variant: 'secondary' },
        { label: 'Confirm', action: mockAction, variant: 'primary' }
      ]
    })
    
    await wrapper.vm.$nextTick()
    
    const buttons = wrapper.findAll('button')
    const actionButtons = buttons.filter(button => 
      button.text() === 'Cancel' || button.text() === 'Confirm'
    )
    
    expect(actionButtons).toHaveLength(2)
    
    const confirmButton = actionButtons.find(button => button.text() === 'Confirm')
    await confirmButton.trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(mockAction).toHaveBeenCalled()
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('displays multiple notifications', async () => {
    notification.success('Success 1')
    notification.error('Error 1')
    notification.warning('Warning 1')
    
    await wrapper.vm.$nextTick()
    
    const alerts = wrapper.findAll('[role="alert"]')
    expect(alerts).toHaveLength(3)
    
    expect(alerts[0].classes()).toContain('bg-green-50')
    expect(alerts[1].classes()).toContain('bg-red-50')
    expect(alerts[2].classes()).toContain('bg-yellow-50')
  })

  it('has proper ARIA attributes', async () => {
    notification.success('Test')
    
    await wrapper.vm.$nextTick()
    
    const alert = wrapper.find('[role="alert"]')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.attributes('aria-live')).toBe('polite')
    expect(alert.attributes('aria-atomic')).toBe('true')
  })

  it('uses assertive ARIA live for error notifications', async () => {
    notification.error('Error!')
    
    await wrapper.vm.$nextTick()
    
    const alert = wrapper.find('[role="alert"]')
    expect(alert.attributes('aria-live')).toBe('assertive')
  })

  it('shows progress bar for auto-dismiss notifications', async () => {
    notification.success('Test', '', { duration: 5000 })
    
    await wrapper.vm.$nextTick()
    
    const progressBar = wrapper.find('.absolute.bottom-0')
    expect(progressBar.exists()).toBe(true)
  })

  it('hides progress bar for persistent notifications', async () => {
    notification.success('Test', '', { persistent: true })
    
    await wrapper.vm.$nextTick()
    
    const progressBar = wrapper.find('.absolute.bottom-0')
    expect(progressBar.exists()).toBe(false)
  })

  it('handles notifications without message', async () => {
    notification.success('Title only')
    
    // Wait for component to update
    await wrapper.vm.$nextTick()
    
    const alerts = wrapper.findAll('[role="alert"]')
    expect(alerts.length).toBeGreaterThan(0)
    
    const alert = alerts[0]
    const title = alert.find('h4')
    
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Title only')
    
    // Message paragraph should not exist
    const message = alert.find('p')
    expect(message.exists()).toBe(false)
  })
})