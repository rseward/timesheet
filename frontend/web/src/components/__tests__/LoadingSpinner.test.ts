import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '../LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const wrapper = mount(LoadingSpinner)
    
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.h-5.w-5').exists()).toBe(true) // default size md
    expect(wrapper.find('.text-current').exists()).toBe(true) // default color current
  })

  it('applies correct size classes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    const expectedClasses = [
      ['h-3', 'w-3'],
      ['h-4', 'w-4'],
      ['h-5', 'w-5'],
      ['h-6', 'w-6'],
      ['h-8', 'w-8']
    ]

    sizes.forEach((size, index) => {
      const wrapper = mount(LoadingSpinner, {
        props: { size }
      })
      
      expectedClasses[index].forEach(className => {
        expect(wrapper.find(`.${className}`).exists()).toBe(true)
      })
    })
  })

  it('applies correct color classes', () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'error'] as const
    const expectedClasses = [
      'text-blue-600',
      'text-gray-600', 
      'text-green-600',
      'text-yellow-600',
      'text-red-600'
    ]

    colors.forEach((color, index) => {
      const wrapper = mount(LoadingSpinner, {
        props: { color }
      })
      
      expect(wrapper.find(`.${expectedClasses[index]}`).exists()).toBe(true)
    })
  })

  it('applies custom class when provided', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { customClass: 'custom-spinner-class' }
    })
    
    expect(wrapper.find('.custom-spinner-class').exists()).toBe(true)
  })

  it('includes proper ARIA label', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { ariaLabel: 'Custom loading message' }
    })
    
    expect(wrapper.find('[aria-label="Custom loading message"]').exists()).toBe(true)
    expect(wrapper.find('.sr-only').text()).toBe('Custom loading message')
  })

  it('uses default ARIA label when not provided', () => {
    const wrapper = mount(LoadingSpinner)
    
    expect(wrapper.find('[aria-label="Loading..."]').exists()).toBe(true)
    expect(wrapper.find('.sr-only').text()).toBe('Loading...')
  })

  it('has proper SVG structure', () => {
    const wrapper = mount(LoadingSpinner)
    
    const svg = wrapper.find('svg')
    expect(svg.attributes('xmlns')).toBe('http://www.w3.org/2000/svg')
    expect(svg.attributes('fill')).toBe('none')
    expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    
    const circle = wrapper.find('circle')
    expect(circle.attributes('cx')).toBe('12')
    expect(circle.attributes('cy')).toBe('12')
    expect(circle.attributes('r')).toBe('10')
    expect(circle.attributes('stroke')).toBe('currentColor')
    expect(circle.attributes('stroke-width')).toBe('4')
    expect(circle.classes()).toContain('opacity-25')
    
    const path = wrapper.find('path')
    expect(path.classes()).toContain('opacity-75')
    expect(path.attributes('fill')).toBe('currentColor')
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mount(LoadingSpinner)
    
    const spinner = wrapper.find('.animate-spin')
    expect(spinner.attributes('role')).toBe('status')
  })
})