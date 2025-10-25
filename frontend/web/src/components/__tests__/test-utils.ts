import { mount, VueWrapper } from '@vue/test-utils'
import { ComponentPublicInstance } from 'vue'

/**
 * Custom test utilities for DataTable component testing
 */

export interface DataTableHelpers {
  findSortHeader: (title: string) => any
  findActionButtons: (rowIndex: number) => any[]
  findCell: (rowIndex: number, columnIndex: number) => any
  findCheckbox: (rowIndex?: number) => any
  triggerSort: (columnTitle: string) => Promise<void>
  selectRow: (rowIndex: number) => Promise<void>
  selectAllRows: () => Promise<void>
  search: (query: string) => Promise<void>
  goToPage: (pageNumber: number) => Promise<void>
  clickAction: (rowIndex: number, actionLabel: string) => Promise<void>
}

/**
 * Extends VueWrapper with DataTable-specific helper methods
 */
export function mountWithHelpers<T extends ComponentPublicInstance>(
  component: any,
  options: any = {}
): VueWrapper<T> & DataTableHelpers {
  const wrapper = mount(component, options) as VueWrapper<T> & DataTableHelpers

  // Helper methods
  wrapper.findSortHeader = function(title: string) {
    const headers = this.findAll('thead th')
    return headers.find(header => header.text().includes(title))
  }

  wrapper.findActionButtons = function(rowIndex: number) {
    const row = this.findAll('tbody tr')[rowIndex]
    return row ? row.findAll('button') : []
  }

  wrapper.findCell = function(rowIndex: number, columnIndex: number) {
    const row = this.findAll('tbody tr')[rowIndex]
    return row ? row.findAll('td')[columnIndex] : null
  }

  wrapper.findCheckbox = function(rowIndex?: number) {
    if (rowIndex === undefined) {
      // Select all checkbox
      return this.findAll('input[type="checkbox"]')[0]
    }
    // Row checkbox (index + 1 because first is select all)
    return this.findAll('input[type="checkbox"]')[rowIndex + 1]
  }

  wrapper.triggerSort = async function(columnTitle: string) {
    const header = this.findSortHeader(columnTitle)
    if (header && header.classes().includes('cursor-pointer')) {
      await header.trigger('click')
    }
  }

  wrapper.selectRow = async function(rowIndex: number) {
    const checkbox = this.findCheckbox(rowIndex)
    if (checkbox) {
      await checkbox.setChecked(true)
    }
  }

  wrapper.selectAllRows = async function() {
    const checkbox = this.findCheckbox()
    if (checkbox) {
      await checkbox.setChecked(true)
    }
  }

  wrapper.search = async function(query: string) {
    const searchInput = this.find('input[type="text"]')
    if (searchInput) {
      await searchInput.setValue(query)
    }
  }

  wrapper.goToPage = async function(pageNumber: number) {
    const pageButton = this.find(`button:contains("${pageNumber}")`)
    if (pageButton) {
      await pageButton.trigger('click')
    }
  }

  wrapper.clickAction = async function(rowIndex: number, actionLabel: string) {
    const buttons = this.findActionButtons(rowIndex)
    const actionButton = buttons.find(button => button.text().includes(actionLabel))
    if (actionButton) {
      await actionButton.trigger('click')
    }
  }

  return wrapper
}

/**
 * Creates mock data for testing
 */
export function createMockData(count: number = 10, overrides: any = {}) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    email: `item${i + 1}@example.com`,
    status: ['active', 'inactive', 'pending'][i % 3],
    category: ['A', 'B', 'C'][i % 3],
    value: Math.floor(Math.random() * 1000),
    ...overrides
  }))
}

/**
 * Creates mock columns for testing
 */
export function createMockColumns(keys: string[] = ['name', 'email', 'status']) {
  return keys.map(key => ({
    key,
    title: key.charAt(0).toUpperCase() + key.slice(1),
    sortable: true
  }))
}

/**
 * Creates mock actions for testing
 */
export function createMockActions() {
  const mockHandlers = {
    edit: vi.fn(),
    delete: vi.fn(),
    view: vi.fn()
  }

  const actions = [
    {
      key: 'view',
      label: 'View',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      handler: mockHandlers.view
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5',
      handler: mockHandlers.edit
    },
    {
      key: 'delete',
      label: 'Delete',
      variant: 'danger' as const,
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862',
      handler: mockHandlers.delete
    }
  ]

  return { actions, handlers: mockHandlers }
}

/**
 * Waits for next tick and resolves
 */
export async function waitForUpdate() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Custom matcher for checking if element contains text (case-insensitive)
 */
export function toContainText(received: any, expected: string) {
  const text = received.text ? received.text() : String(received)
  const pass = text.toLowerCase().includes(expected.toLowerCase())
  
  if (pass) {
    return {
      message: () => `expected element not to contain text "${expected}"`,
      pass: true
    }
  } else {
    return {
      message: () => `expected element to contain text "${expected}" but got "${text}"`,
      pass: false
    }
  }
}

/**
 * Custom matcher for checking if element has specific classes
 */
export function toHaveClasses(received: any, expectedClasses: string[]) {
  const element = received.element || received
  const actualClasses = Array.from(element.classList)
  const hasAllClasses = expectedClasses.every(cls => actualClasses.includes(cls))
  
  if (hasAllClasses) {
    return {
      message: () => `expected element not to have classes [${expectedClasses.join(', ')}]`,
      pass: true
    }
  } else {
    const missing = expectedClasses.filter(cls => !actualClasses.includes(cls))
    return {
      message: () => `expected element to have classes [${expectedClasses.join(', ')}] but missing [${missing.join(', ')}]`,
      pass: false
    }
  }
}

// Extend expect with custom matchers
expect.extend({
  toContainText,
  toHaveClasses
} as any)

/**
 * Performance testing utilities
 */
export function measurePerformance<T>(fn: () => T | Promise<T>): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve) => {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    resolve({ result, duration: end - start })
  })
}

/**
 * Memory testing utilities
 */
export function getMemoryUsage() {
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    return {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
      limit: (performance as any).memory.jsHeapSizeLimit
    }
  }
  return null
}

/**
 * Accessibility testing utilities
 */
export function checkAccessibility(wrapper: VueWrapper) {
  const issues: string[] = []

  // Check for ARIA labels
  const buttons = wrapper.findAll('button')
  buttons.forEach((button, index) => {
    const hasAriaLabel = button.attributes('aria-label') || 
                       button.attributes('aria-labelledby') || 
                       button.text().trim()
    if (!hasAriaLabel) {
      issues.push(`Button ${index} missing accessible name`)
    }
  })

  // Check for proper heading structure
  const headings = wrapper.findAll('h1, h2, h3, h4, h5, h6')
  if (headings.length === 0 && wrapper.text().length > 100) {
    issues.push('Long content missing heading structure')
  }

  // Check for proper table headers
  const tables = wrapper.findAll('table')
  tables.forEach((table, index) => {
    const hasHeaders = table.find('thead').exists()
    if (!hasHeaders) {
      issues.push(`Table ${index} missing thead element`)
    }
  })

  return {
    passed: issues.length === 0,
    issues
  }
}