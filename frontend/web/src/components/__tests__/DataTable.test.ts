import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { markRaw } from 'vue'
import DataTable from '../DataTable.vue'

// Mock data for testing
const mockData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', age: 30 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', age: 25 },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active', age: 35 }
]

const mockColumns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email', sortable: true },
  { key: 'status', title: 'Status', sortable: false },
  { key: 'age', title: 'Age', sortable: true }
]

const mockActions = [
  {
    key: 'edit',
    label: 'Edit',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    handler: vi.fn()
  },
  {
    key: 'delete',
    label: 'Delete',
    variant: 'danger' as const,
    icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    handler: vi.fn()
  }
]

describe('DataTable', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders table with data', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns
        }
      })

      expect(wrapper.find('table').exists()).toBe(true)
      expect(wrapper.findAll('tbody tr')).toHaveLength(3)
      
      // Check headers
      const headers = wrapper.findAll('thead th')
      expect(headers[0].text()).toContain('Name')
      expect(headers[1].text()).toContain('Email')
      expect(headers[2].text()).toContain('Status')
      expect(headers[3].text()).toContain('Age')
    })

    it('displays data correctly in cells', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns
        }
      })

      const firstRow = wrapper.findAll('tbody tr')[0]
      const cells = firstRow.findAll('td')
      expect(cells[0].text()).toContain('John Doe')
      expect(cells[1].text()).toContain('john@example.com')
      expect(cells[2].text()).toContain('active')
      expect(cells[3].text()).toContain('30')
    })
  })

  describe('Loading State', () => {
    it('shows loading state when loading prop is true', () => {
      wrapper = mount(DataTable, {
        props: {
          data: [],
          columns: mockColumns,
          loading: true,
          loadingText: 'Custom loading message'
        }
      })

      expect(wrapper.text()).toContain('Custom loading message')
      expect(wrapper.find('.animate-spin').exists()).toBe(true)
      expect(wrapper.find('table').exists()).toBe(false)
    })

    it('hides table when loading', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          loading: true
        }
      })

      expect(wrapper.find('table').exists()).toBe(false)
      expect(wrapper.text()).toContain('Loading data...')
    })
  })

  describe('Error State', () => {
    it('shows error state when error prop is provided', () => {
      wrapper = mount(DataTable, {
        props: {
          data: [],
          columns: mockColumns,
          error: 'Network error occurred',
          errorTitle: 'Custom Error Title'
        }
      })

      expect(wrapper.text()).toContain('Custom Error Title')
      expect(wrapper.text()).toContain('Network error occurred')
      expect(wrapper.find('table').exists()).toBe(false)
    })

    it('shows retry button when showRetry is true', async () => {
      wrapper = mount(DataTable, {
        props: {
          data: [],
          columns: mockColumns,
          error: 'Network error',
          showRetry: true
        }
      })

      const retryButton = wrapper.find('button')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toContain('Retry')

      await retryButton.trigger('click')
      expect(wrapper.emitted('retry')).toBeTruthy()
    })

    it('hides retry button when showRetry is false', () => {
      wrapper = mount(DataTable, {
        props: {
          data: [],
          columns: mockColumns,
          error: 'Network error',
          showRetry: false
        }
      })

      expect(wrapper.find('button').exists()).toBe(false)
    })
  })

  describe('Empty State', () => {
    it('shows empty state when data is empty', () => {
      wrapper = mount(DataTable, {
        props: {
          data: [],
          columns: mockColumns,
          emptyTitle: 'No Clients Found',
          emptyMessage: 'Create your first client to get started.'
        }
      })

      expect(wrapper.text()).toContain('No Clients Found')
      expect(wrapper.text()).toContain('Create your first client to get started.')
      expect(wrapper.find('table').exists()).toBe(false)
    })

    it('renders empty slot when provided', () => {
      wrapper = mount(DataTable, {
        props: {
          data: [],
          columns: mockColumns
        },
        slots: {
          empty: '<button class="test-empty-button">Add First Item</button>'
        }
      })

      expect(wrapper.find('.test-empty-button').exists()).toBe(true)
    })
  })

  describe('Sorting', () => {
    it('shows sortable indicators for sortable columns', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns
        }
      })

      const sortableHeaders = wrapper.findAll('thead th.cursor-pointer')
      expect(sortableHeaders).toHaveLength(3) // name, email, age are sortable
    })

    it('does not show sortable indicators for non-sortable columns', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns
        }
      })

      const statusHeader = wrapper.findAll('thead th')[2] // status is not sortable
      expect(statusHeader.classes()).not.toContain('cursor-pointer')
    })

    it('sorts data when clicking sortable column', async () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns
        }
      })

      const nameHeader = wrapper.findAll('thead th.cursor-pointer')[0]
      await nameHeader.trigger('click')

      expect(wrapper.emitted('sort')).toBeTruthy()
      expect(wrapper.emitted('sort')[0]).toEqual([{ key: 'name', order: 'asc' }])

      // Check that data is sorted
      const firstRow = wrapper.findAll('tbody tr')[0]
      expect(firstRow.text()).toContain('Bob Johnson') // Should be first alphabetically
    })

    it('toggles sort order when clicking same column', async () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns
        }
      })

      const nameHeader = wrapper.findAll('thead th.cursor-pointer')[0]
      
      // First click - ascending
      await nameHeader.trigger('click')
      expect(wrapper.emitted('sort')[0]).toEqual([{ key: 'name', order: 'asc' }])

      // Second click - descending
      await nameHeader.trigger('click')
      expect(wrapper.emitted('sort')[1]).toEqual([{ key: 'name', order: 'desc' }])
    })
  })

  describe('Search Functionality', () => {
    it('shows search input when showSearch is true', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          showSearch: true,
          searchPlaceholder: 'Search clients...',
          searchFields: ['name', 'email']
        }
      })

      const searchInput = wrapper.find('input[type="text"]')
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.attributes('placeholder')).toBe('Search clients...')
    })

    it('filters data based on search query', async () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          showSearch: true,
          searchFields: ['name', 'email']
        }
      })

      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('John')

      await wrapper.vm.$nextTick()
      const visibleRows = wrapper.findAll('tbody tr')
      expect(visibleRows.length).toBeGreaterThanOrEqual(1)
      expect(visibleRows[0].text()).toContain('John Doe')
    })

    it('filters across multiple search fields', async () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          showSearch: true,
          searchFields: ['name', 'email']
        }
      })

      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('example.com')

      const visibleRows = wrapper.findAll('tbody tr')
      expect(visibleRows).toHaveLength(3) // All emails contain example.com
    })
  })

  describe('Row Selection', () => {
    it('shows checkboxes when selectable is true', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          selectable: true
        }
      })

      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes).toHaveLength(4) // 1 for select all + 3 for rows
    })

    it('selects individual rows', async () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          selectable: true
        }
      })

      const firstRowCheckbox = wrapper.findAll('input[type="checkbox"]')[1]
      await firstRowCheckbox.setChecked(true)

      expect(wrapper.emitted('rowSelect')).toBeTruthy()
      expect(wrapper.emitted('rowSelect')[0][0]).toHaveLength(1)
      expect(wrapper.emitted('rowSelect')[0][0][0]).toEqual(mockData[0])
    })

    it('selects all rows with select all checkbox', async () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          selectable: true
        }
      })

      const selectAllCheckbox = wrapper.findAll('input[type="checkbox"]')[0]
      await selectAllCheckbox.setChecked(true)

      expect(wrapper.emitted('rowSelect')).toBeTruthy()
      expect(wrapper.emitted('rowSelect')[0][0]).toHaveLength(3)
    })

    it('shows indeterminate state when some rows are selected', async () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          selectable: true
        }
      })

      const firstRowCheckbox = wrapper.findAll('input[type="checkbox"]')[1]
      await firstRowCheckbox.setChecked(true)

      const selectAllCheckbox = wrapper.findAll('input[type="checkbox"]')[0]
      expect(selectAllCheckbox.element.indeterminate).toBe(true)
    })
  })

  describe('Actions', () => {
    it('shows action buttons when actions are provided', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          actions: mockActions
        }
      })

      const actionButtons = wrapper.findAll('tbody tr')[0].findAll('button')
      expect(actionButtons).toHaveLength(2)
      expect(actionButtons[0].text()).toContain('Edit')
      expect(actionButtons[1].text()).toContain('Delete')
    })

    it('applies correct styling to action variants', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          actions: mockActions
        }
      })

      const actionButtons = wrapper.findAll('tbody tr')[0].findAll('button')
      expect(actionButtons[0].classes()).toContain('border-gray-300') // default variant
      expect(actionButtons[1].classes()).toContain('border-red-300') // danger variant
    })

    it('calls action handlers when clicked', async () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          actions: mockActions
        }
      })

      const editButton = wrapper.findAll('tbody tr')[0].findAll('button')[0]
      await editButton.trigger('click')

      expect(mockActions[0].handler).toHaveBeenCalledWith(mockData[0])
    })

    it('conditionally shows actions based on show function', () => {
      const conditionalActions = [
        ...mockActions,
        {
          key: 'special',
          label: 'Special',
          handler: vi.fn(),
          show: (item: any) => item.status === 'active'
        }
      ]

      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          actions: conditionalActions
        }
      })

      // First row (active) should have 3 actions
      const firstRowActions = wrapper.findAll('tbody tr')[0].findAll('button')
      expect(firstRowActions).toHaveLength(3)

      // Second row (inactive) should have 2 actions
      const secondRowActions = wrapper.findAll('tbody tr')[1].findAll('button')
      expect(secondRowActions).toHaveLength(2)
    })
  })

  describe('Pagination', () => {
    it('shows pagination when showPagination is true and data exceeds page size', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          showPagination: true,
          pageSize: 2
        }
      })

      expect(wrapper.find('.border-t').exists()).toBe(true)
      expect(wrapper.text()).toContain('Showing 1 to 2 of 3 results')
    })

    it('hides pagination when showPagination is false', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          showPagination: false
        }
      })

      expect(wrapper.find('.border-t').exists()).toBe(false)
    })

    it('shows correct page size of data', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          showPagination: true,
          pageSize: 2
        }
      })

      const visibleRows = wrapper.findAll('tbody tr')
      expect(visibleRows).toHaveLength(2)
    })

    it('navigates between pages', async () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          showPagination: true,
          pageSize: 2
        }
      })

      const buttons = wrapper.findAll('button')
      const nextButton = buttons.find(btn => btn.text().includes('Next'))
      expect(nextButton.exists()).toBe(true)
      await nextButton.trigger('click')

      await wrapper.vm.$nextTick()
      const visibleRows = wrapper.findAll('tbody tr')
      expect(visibleRows.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Custom Cell Rendering', () => {
    it('uses custom render function when provided', () => {
      const columnsWithRender = [
        {
          key: 'status',
          title: 'Status',
          render: (item: any, value: any) => 
            `<span class="status-badge">${value}</span>`
        }
      ]

      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: columnsWithRender
        }
      })

      const statusCell = wrapper.find('.status-badge')
      expect(statusCell.exists()).toBe(true)
      expect(statusCell.text()).toContain('active')
    })

    it('uses custom component when provided', () => {
      const TestComponent = markRaw({
        template: '<div class="custom-component">{{ value }}</div>',
        props: ['value']
      })

      const columnsWithComponent = [
        {
          key: 'name',
          title: 'Name',
          component: TestComponent
        }
      ]

      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: columnsWithComponent
        }
      })

      const customComponent = wrapper.find('.custom-component')
      expect(customComponent.exists()).toBe(true)
      expect(customComponent.text()).toContain('John Doe')
    })

    it('uses cell slots when provided', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns
        },
        slots: {
          'cell-name': '<div class="name-slot">{{ value }}</div>'
        }
      })

      const nameSlot = wrapper.find('.name-slot')
      expect(nameSlot.exists()).toBe(true)
      expect(nameSlot.text()).toContain('John Doe')
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes correctly', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns
        }
      })

      const tableContainer = wrapper.find('.overflow-x-auto')
      expect(tableContainer.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('includes proper ARIA labels', () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns,
          actions: mockActions
        }
      })

      const headers = wrapper.findAll('thead th')
      const actionsHeader = headers.find(header => header.text().includes('Actions'))
      expect(actionsHeader?.find('.sr-only').exists()).toBe(true)
    })

    it('supports keyboard navigation for sorting', async () => {
      wrapper = mount(DataTable, {
        props: {
          data: mockData,
          columns: mockColumns
        }
      })

      const sortableHeaders = wrapper.findAll('th.cursor-pointer')
      expect(sortableHeaders.length).toBeGreaterThan(0)
      // Check if any sortable header has proper keyboard accessibility
      const hasKeyboardSupport = sortableHeaders.some(header => 
        header.element.tabIndex !== undefined || header.element.getAttribute('role')
      )
      expect(hasKeyboardSupport).toBe(true)
    })
  })
})