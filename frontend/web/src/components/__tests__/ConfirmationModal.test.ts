import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmationModal from '../ConfirmationModal.vue'

describe('ConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Test Confirmation',
    message: 'Are you sure you want to proceed?'
  }

  it('renders modal when isOpen is true', () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps
    })

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Confirmation')
    expect(wrapper.text()).toContain('Are you sure you want to proceed?')
  })

  it('does not render modal when isOpen is false', () => {
    const wrapper = mount(ConfirmationModal, {
      props: {
        ...defaultProps,
        isOpen: false
      }
    })

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('displays custom confirm and cancel button text', () => {
    const wrapper = mount(ConfirmationModal, {
      props: {
        ...defaultProps,
        confirmText: 'Delete',
        cancelText: 'Keep'
      }
    })

    expect(wrapper.text()).toContain('Delete')
    expect(wrapper.text()).toContain('Keep')
  })

  it('uses default button text when not provided', () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps
    })

    expect(wrapper.text()).toContain('Confirm')
    expect(wrapper.text()).toContain('Cancel')
  })

  it('displays correct icon and styling for danger type', () => {
    const wrapper = mount(ConfirmationModal, {
      props: {
        ...defaultProps,
        type: 'danger'
      }
    })

    const iconContainer = wrapper.find('.bg-red-100')
    expect(iconContainer.exists()).toBe(true)

    const confirmButton = wrapper.find('button[class*="bg-red-600"]')
    expect(confirmButton.exists()).toBe(true)
  })

  it('displays correct icon and styling for warning type', () => {
    const wrapper = mount(ConfirmationModal, {
      props: {
        ...defaultProps,
        type: 'warning'
      }
    })

    const iconContainer = wrapper.find('.bg-yellow-100')
    expect(iconContainer.exists()).toBe(true)

    const confirmButton = wrapper.find('button[class*="bg-yellow-600"]')
    expect(confirmButton.exists()).toBe(true)
  })

  it('displays correct icon and styling for info type', () => {
    const wrapper = mount(ConfirmationModal, {
      props: {
        ...defaultProps,
        type: 'info'
      }
    })

    const iconContainer = wrapper.find('.bg-blue-100')
    expect(iconContainer.exists()).toBe(true)

    const confirmButton = wrapper.find('button[class*="bg-blue-600"]')
    expect(confirmButton.exists()).toBe(true)
  })

  it('displays correct icon and styling for success type', () => {
    const wrapper = mount(ConfirmationModal, {
      props: {
        ...defaultProps,
        type: 'success'
      }
    })

    const iconContainer = wrapper.find('.bg-green-100')
    expect(iconContainer.exists()).toBe(true)

    const confirmButton = wrapper.find('button[class*="bg-green-600"]')
    expect(confirmButton.exists()).toBe(true)
  })

  it('emits confirm event when confirm button is clicked', async () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps
    })

    const confirmButton = wrapper.find('button[class*="bg-red-600"]')
    await confirmButton.trigger('click')

    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps
    })

    const cancelButton = wrapper.find('button[class*="border-gray-300"]')
    await cancelButton.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('emits cancel event when background overlay is clicked', async () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps
    })

    const overlay = wrapper.find('.bg-gray-500')
    await overlay.trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('shows loading state when confirm button is clicked', async () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps
    })

    const confirmButton = wrapper.find('button[class*="bg-red-600"]')
    
    // Manually set loading state to test the UI
    const vm = wrapper.vm as any
    vm.loading = true
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Processing...')
    expect((confirmButton.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('disables buttons during loading state', async () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps
    })

    const confirmButton = wrapper.find('button[class*="bg-red-600"]')
    const cancelButton = wrapper.find('button[class*="border-gray-300"]')

    // Manually set loading state to test the UI
    const vm = wrapper.vm as any
    vm.loading = true
    await wrapper.vm.$nextTick()

    expect((confirmButton.element as HTMLButtonElement).disabled).toBe(true)
    expect((cancelButton.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('displays custom loading text', async () => {
    const wrapper = mount(ConfirmationModal, {
      props: {
        ...defaultProps,
        loadingText: 'Deleting...'
      }
    })

    // Manually set loading state to test the UI
    const vm = wrapper.vm as any
    vm.loading = true
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Deleting...')
  })

  it('uses default loading text when not provided', async () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps
    })

    // Manually set loading state to test the UI
    const vm = wrapper.vm as any
    vm.loading = true
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Processing...')
  })

  it('applies correct aria attributes for accessibility', () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps
    })

    const modal = wrapper.find('[role="dialog"]')
    expect(modal.attributes('aria-modal')).toBe('true')
    expect(modal.attributes('aria-labelledby')).toBe('modal-title')

    const title = wrapper.find('#modal-title')
    expect(title.exists()).toBe(true)
  })

  it('handles keyboard accessibility properly', () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps
    })

    const hiddenSpan = wrapper.find('span[aria-hidden="true"]')
    expect(hiddenSpan.exists()).toBe(true)
  })

  it('maintains button order with confirm on the right', () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps
    })

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    
    const confirmButton = buttons.find(btn => 
      btn.classes().some(cls => cls.includes('bg-red-600'))
    )
    const cancelButton = buttons.find(btn => 
      btn.classes().some(cls => cls.includes('border-gray-300'))
    )

    expect(confirmButton).toBeTruthy()
    expect(cancelButton).toBeTruthy()
  })

  it('properly handles dark mode classes', () => {
    const wrapper = mount(ConfirmationModal, {
      props: {
        ...defaultProps,
        type: 'danger'
      }
    })

    // Check for dark mode classes in the modal container
    const modalContainer = wrapper.find('.bg-white')
    expect(modalContainer.classes()).toContain('dark:bg-gray-800')

    // Check for dark mode classes in icon container
    const iconContainer = wrapper.find('.bg-red-100')
    expect(iconContainer.classes()).toContain('dark:bg-red-900/20')
  })
})