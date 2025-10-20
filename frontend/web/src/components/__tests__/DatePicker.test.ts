import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DatePicker from '../DatePicker.vue'

describe('DatePicker', () => {
  it('renders properly', () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '2025-01-20',
        placeholder: 'Select a date'
      }
    })

    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true) // Calendar icon button
  })

  it('emits update:modelValue when date is selected', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '',
        placeholder: 'Select a date'
      }
    })

    const input = wrapper.find('input')
    await input.setValue('2025-01-20')
    
    // The component should emit the update event
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('shows calendar when calendar button is clicked', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '',
        placeholder: 'Select a date'
      }
    })

    const calendarButton = wrapper.find('button')
    await calendarButton.trigger('click')
    
    // Calendar popup should be visible
    expect(wrapper.find('.absolute.z-30').exists()).toBe(true)
  })

  it('supports natural language input', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '',
        placeholder: 'Select a date',
        allowNaturalLanguage: true
      }
    })

    const input = wrapper.find('input')
    await input.setValue('today')
    
    // Should show suggestions
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.absolute.z-20').exists()).toBe(true)
  })

  it('can be disabled', () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '',
        disabled: true
      }
    })

    const input = wrapper.find('input')
    expect(input.element.disabled).toBe(true)
    
    const button = wrapper.find('button')
    expect(button.element.disabled).toBe(true)
  })

  it('validates required field', () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '',
        required: true
      }
    })

    const input = wrapper.find('input')
    expect(input.element.required).toBe(true)
  })
})