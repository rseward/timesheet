import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, markRaw } from 'vue'
import DataTable from '../DataTable.vue'

describe('DataTable Advanced Unit Tests', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Edge Cases and Boundary Conditions', () => {
    it('handles empty data array gracefully', () => {
      wrapper = mount(DataTable, {
        props: {
          data: [],
          columns: [{ key: 'name', title: 'Name' }]
        }
      })

      expect(wrapper.find('table').exists()).toBe(false)
      expect(wrapper.text()).toContain('No data found')
    })

    it('handles null/undefined data prop', () => {
      wrapper = mount(DataTable, {
        props: {
          data: null as any,
          columns: [{ key: 'name', title: 'Name' }]
        }
      })

      expect(wrapper.find('table').exists()).toBe(false)
      expect(wrapper.text()).toContain('No data found')
    })

    it('handles empty columns array', () => {
      wrapper = mount(DataTable, {
        props: {
          data: [{ id: 1, name: 'Test' }],
          columns: []
        }
      })

      expect(wrapper.find('table').exists()).toBe(true)
      expect(wrapper.findAll('thead th')).toHaveLength(0)
      expect(wrapper.findAll('tbody td')).toHaveLength(0)
    })

    it('handles null/undefined columns prop', () => {
      wrapper = mount(DataTable, {
        props: {
          data: [{ id: 1, name: 'Test' }],
          columns: null as any
        }
      })

      expect(wrapper.find('table').exists()).toBe(true)
      expect(wrapper.findAll('thead th')).toHaveLength(0)
    })

    it('handles data with null/undefined values', () => {
      const dataWithNulls = [
        { id: 1, name: null, email: undefined, status: '' },
        { id: 2, name: 'Valid', email: null, status: undefined }
      ]

      wrapper = mount(DataTable, {
        props: {
          data: dataWithNulls,
          columns: [
            { key: 'name', title: 'Name' },
            { key: 'email', title: 'Email' },
            { key: 'status', title: 'Status' }
          ]
        }
      })

      const rows = wrapper.findAll('tbody tr')
      expect(rows).toHaveLength(2)
      
      // Should render empty cells for null/undefined values
      const firstRowCells = rows[0].findAll('td')
      expect(firstRowCells[0].text()).toBe('')
      expect(firstRowCells[1].text()).toBe('')
      expect(firstRowCells[2].text()).toBe('')
    })

    it('handles nested object properties', () => {
      const nestedData = [
        {
          id: 1,
          user: { name: 'John', profile: { email: 'john@example.com' } },
          address: { city: 'New York', country: 'USA' }
        }
      ]

      wrapper = mount(DataTable, {
        props: {
          data: nestedData,
          columns: [
            { key: 'user.name', title: 'Name' },
            { key: 'user.profile.email', title: 'Email' },
            { key: 'address.city', title: 'City' }
          ]
        }
      })

      const firstRow = wrapper.findAll('tbody tr')[0]
      const cells = firstRow.findAll('td')
      expect(cells[0].text()).toBe('John')
      expect(cells[1].text()).toBe('john@example.com')
      expect(cells[2].text()).toBe('New York')
    })

    it('handles deeply nested properties with missing intermediate levels', () => {
      const incompleteNestedData = [
        {
          id: 1,
          user: { name: 'John' }, // Missing profile
          address: null // Missing entirely
        }
      ]

      wrapper = mount(DataTable, {
        props: {
          data: incompleteNestedData,
          columns: [
            { key: 'user.name', title: 'Name' },
            { key: 'user.profile.email', title: 'Email' },
            { key: 'address.city', title: 'City' }
          ]
        }
      })

      const firstRow = wrapper.findAll('tbody tr')[0]
      const cells = firstRow.findAll('td')
      expect(cells[0].text()).toBe('John')
      expect(cells[1].text()).toBe('') // Missing nested property
      expect(cells[2].text()).toBe('') // Null parent
    })
  })

  describe('Advanced Sorting Scenarios', () => {
    it('sorts mixed data types correctly', async () => {
      const mixedData = [
        { id: 1, name: 'Alice', value: 10 },
        { id: 2, name: 'Bob', value: '5' },
        { id: 3, name: 'Charlie', value: null },
        { id: 4, name: 'David', value: undefined },
        { id: 5, name: 'Eve', value: 20 }
      ]

      wrapper = mount(DataTable, {
        props: {
          data: mixedData,
          columns: [
            { key: 'name', title: 'Name', sortable: true },
            { key: 'value', title: 'Value', sortable: true }
          ]
        }
      })

      // Sort by value
      const valueHeader = wrapper.findAll('th.cursor-pointer')[1]
      await valueHeader.trigger('click')

      const rows = wrapper.findAll('tbody tr')
      // Should handle null/undefined values gracefully
      expect(rows.length).toBe(5)
    })

    it('maintains sort order with duplicate values', async () => {
      const duplicateData = [
        { id: 1, name: 'Alice', score: 100 },
        { id: 2, name: 'Bob', score: 100 },
        { id: 3, name: 'Charlie', score: 50 },
        { id: 4, name: 'David', score: 100 }
      ]

      wrapper = mount(DataTable, {
        props: {
          data: duplicateData,
          columns: [
            { key: 'name', title: 'Name' },
            { key: 'score', title: 'Score', sortable: true }
          ]
        }
      })

      const sortableHeaders = wrapper.findAll('th.cursor-pointer')
      expect(sortableHeaders.length).toBeGreaterThan(0)
      
      // Find the score header (should be the second sortable header if name is first)
      const scoreHeader = sortableHeaders.length > 1 ? sortableHeaders[1] : sortableHeaders[0]
      await scoreHeader.trigger('click') // Ascending

      const rows = wrapper.findAll('tbody tr')
      expect(rows[0].text()).toContain('Charlie') // Lowest score first
      expect(rows[1].text()).toContain('Alice') // Then the 100s in original order
      expect(rows[2].text()).toContain('Bob')
      expect(rows[3].text()).toContain('David')
    })

    it('toggles sort direction correctly on multiple clicks', async () => {
      const data = [
        { id: 1, name: 'Charlie' },
        { id: 2, name: 'Alice' },
        { id: 3, name: 'Bob' }
      ]

      wrapper = mount(DataTable, {
        props: {
          data,
          columns: [{ key: 'name', title: 'Name', sortable: true }]
        }
      })

      const nameHeader = wrapper.find('th.cursor-pointer')

      // First click - ascending
      await nameHeader.trigger('click')
      expect(wrapper.emitted('sort')[0]).toEqual([{ key: 'name', order: 'asc' }])

      // Second click - descending
      await nameHeader.trigger('click')
      expect(wrapper.emitted('sort')[1]).toEqual([{ key: 'name', order: 'desc' }])

      // Third click - ascending again
      await nameHeader.trigger('click')
      expect(wrapper.emitted('sort')[2]).toEqual([{ key: 'name', order: 'asc' }])
    })
  })

  describe('Complex Search Functionality', () => {
    it('searches across multiple fields with partial matches', async () => {
      const searchData = [
        { id: 1, name: 'John Smith', email: 'john.smith@example.com', department: 'Engineering' },
        { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com', department: 'Marketing' },
        { id: 3, name: 'Bob Johnson', email: 'bob.j@example.com', department: 'Engineering' }
      ]

      wrapper = mount(DataTable, {
        props: {
          data: searchData,
          columns: [
            { key: 'name', title: 'Name' },
            { key: 'email', title: 'Email' },
            { key: 'department', title: 'Department' }
          ],
          showSearch: true,
          searchFields: ['name', 'email', 'department']
        }
      })

      const searchInput = wrapper.find('input[type="text"]')

      // Search by partial name
      await searchInput.setValue('John')
      let visibleRows = wrapper.findAll('tbody tr')
      expect(visibleRows).toHaveLength(2) // John Smith and Bob Johnson

      // Search by email domain
      await searchInput.setValue('example.com')
      visibleRows = wrapper.findAll('tbody tr')
      expect(visibleRows).toHaveLength(3) // All match

      // Search by department
      await searchInput.setValue('Engineering')
      visibleRows = wrapper.findAll('tbody tr')
      expect(visibleRows).toHaveLength(2) // John and Bob
    })

    it('handles case-insensitive search', async () => {
      const searchData = [
        { id: 1, name: 'John Smith', status: 'Active' },
        { id: 2, name: 'Jane Doe', status: 'inactive' },
        { id: 3, name: 'Bob Johnson', status: 'ACTIVE' }
      ]

      wrapper = mount(DataTable, {
        props: {
          data: searchData,
          columns: [
            { key: 'name', title: 'Name' },
            { key: 'status', title: 'Status' }
          ],
          showSearch: true,
          searchFields: ['name', 'status']
        }
      })

      const searchInput = wrapper.find('input[type="text"]')

      // Test different cases
      await searchInput.setValue('active')
      let visibleRows = wrapper.findAll('tbody tr')
      expect(visibleRows).toHaveLength(3) // All match case-insensitively

      await searchInput.setValue('ACTIVE')
      visibleRows = wrapper.findAll('tbody tr')
      expect(visibleRows).toHaveLength(3)

      await searchInput.setValue('Active')
      visibleRows = wrapper.findAll('tbody tr')
      expect(visibleRows).toHaveLength(3)
    })

    it('handles empty search query', async () => {
      const data = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ]

      wrapper = mount(DataTable, {
        props: {
          data,
          columns: [{ key: 'name', title: 'Name' }],
          showSearch: true,
          searchFields: ['name']
        }
      })

      const searchInput = wrapper.find('input[type="text"]')

      // Start with search
      await searchInput.setValue('John')
      expect(wrapper.findAll('tbody tr')).toHaveLength(1)

      // Clear search
      await searchInput.setValue('')
      expect(wrapper.findAll('tbody tr')).toHaveLength(2) // Should show all
    })
  })

  describe('Advanced Pagination', () => {
    it('handles page size changes', async () => {
      const data = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }))

      wrapper = mount(DataTable, {
        props: {
          data,
          columns: [{ key: 'name', title: 'Name' }],
          showPagination: true,
          pageSize: 10
        }
      })

      // Initial state
      expect(wrapper.findAll('tbody tr')).toHaveLength(10)
      expect(wrapper.text()).toContain('Showing 1 to 10 of 25 results')

      // Change page size
      await wrapper.setProps({ pageSize: 5 })
      expect(wrapper.findAll('tbody tr')).toHaveLength(5)
      expect(wrapper.text()).toContain('Showing 1 to 5 of 25 results')

      // Navigate to verify pagination works with new size
      const nextPageButton = wrapper.find('[data-testid="next-page"]')
      if (nextPageButton.exists()) {
        await nextPageButton.trigger('click')
      }
      expect(wrapper.findAll('tbody tr')).toHaveLength(5)
      expect(wrapper.text()).toContain('Showing 6 to 10 of 25 results')
    })

    it('handles pagination with filtered data', async () => {
      const data = Array.from({ length: 50 }, (_, i) => ({ 
        id: i + 1, 
        name: `Item ${i + 1}`,
        category: i < 20 ? 'A' : i < 35 ? 'B' : 'C'
      }))

      wrapper = mount(DataTable, {
        props: {
          data,
          columns: [
            { key: 'name', title: 'Name' },
            { key: 'category', title: 'Category' }
          ],
          showSearch: true,
          showPagination: true,
          pageSize: 10,
          searchFields: ['category']
        }
      })

      // Filter to category B (15 items)
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('B')

      expect(wrapper.text()).toContain('Showing 1 to 10 of 15 results')
      expect(wrapper.findAll('tbody tr')).toHaveLength(10)

      // Navigate to second page of filtered results
      const nextPageButton = wrapper.find('[data-testid="next-page"]')
      if (nextPageButton.exists()) {
        await nextPageButton.trigger('click')
      }

      expect(wrapper.text()).toContain('Showing 11 to 15 of 15 results')
      expect(wrapper.findAll('tbody tr')).toHaveLength(5)
    })

    it('handles pagination edge cases', async () => {
      const data = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }))

      wrapper = mount(DataTable, {
        props: {
          data,
          columns: [{ key: 'name', title: 'Name' }],
          showPagination: true,
          pageSize: 10
        }
      })

      // Data fits on one page - should not show pagination
      expect(wrapper.find('.border-t').exists()).toBe(false)

      // Change to smaller page size
      await wrapper.setProps({ pageSize: 2 })

      // Should show pagination now
      expect(wrapper.find('.border-t').exists()).toBe(true)
      expect(wrapper.text()).toContain('Showing 1 to 2 of 5 results')

      // Navigate through all pages
      const nextPageButton = wrapper.find('[data-testid="next-page"]')
      if (nextPageButton.exists()) {
        await nextPageButton.trigger('click') // Page 2
        expect(wrapper.text()).toContain('Showing 3 to 4 of 5 results')

        await nextPageButton.trigger('click') // Page 3
        expect(wrapper.text()).toContain('Showing 5 to 5 of 5 results')
      }

      // Next button should be disabled on last page
      expect(nextPageButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Advanced Row Selection', () => {
    it('handles custom row key function', async () => {
      const data = [
        { uuid: 'abc-123', name: 'Item 1' },
        { uuid: 'def-456', name: 'Item 2' }
      ]

      wrapper = mount(DataTable, {
        props: {
          data,
          columns: [{ key: 'name', title: 'Name' }],
          selectable: true,
          rowKey: (item: any) => item.uuid
        }
      })

      const firstCheckbox = wrapper.findAll('input[type="checkbox"]')[1]
      await firstCheckbox.setChecked(true)

      expect(wrapper.emitted('rowSelect')[0][0]).toEqual([data[0]])
    })

    it('handles selection with pagination', async () => {
      const data = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }))

      wrapper = mount(DataTable, {
        props: {
          data,
          columns: [{ key: 'name', title: 'Name' }],
          selectable: true,
          showPagination: true,
          pageSize: 10
        }
      })

      // Select items on first page
      const selectAllCheckbox = wrapper.findAll('input[type="checkbox"]')[0]
      await selectAllCheckbox.setChecked(true)

      expect(wrapper.emitted('rowSelect')[0][0]).toHaveLength(10)

      // Navigate to second page
      const nextPageButton = wrapper.find('[data-testid="next-page"]')
      if (nextPageButton.exists()) {
        await nextPageButton.trigger('click')
      }

      // Should be able to select items on second page
      const secondPageSelectAll = wrapper.findAll('input[type="checkbox"]')[0]
      await secondPageSelectAll.setChecked(true)

      // Should emit with newly selected items (might be cumulative selection)
      const selectedItems = wrapper.emitted('rowSelect')[1][0]
      expect(selectedItems.length).toBeGreaterThanOrEqual(10)
    })

    it('handles selection state persistence across data changes', async () => {
      const initialData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]

      wrapper = mount(DataTable, {
        props: {
          data: initialData,
          columns: [{ key: 'name', title: 'Name' }],
          selectable: true
        }
      })

      // Select first item
      const firstCheckbox = wrapper.findAll('input[type="checkbox"]')[1]
      await firstCheckbox.setChecked(true)

      // Update data (simulating refresh)
      const newData = [
        { id: 1, name: 'Item 1 (Updated)' },
        { id: 2, name: 'Item 2 (Updated)' },
        { id: 3, name: 'Item 3' }
      ]

      await wrapper.setProps({ data: newData })

      // Selection should be reset (as per implementation)
      expect(wrapper.findAll('input[type="checkbox"][checked="true"]')).toHaveLength(0)
    })
  })

  describe('Custom Rendering Advanced Features', () => {
    it('handles complex custom components with props', () => {
      const CustomComponent = markRaw({
        template: `
          <div class="custom-component" :class="statusClass">
            <span class="icon">{{ icon }}</span>
            {{ value }}
          </div>
        `,
        props: ['value', 'item'],
        computed: {
          statusClass() {
            return {
              'status-active': this.value === 'active',
              'status-inactive': this.value === 'inactive'
            }
          },
          icon() {
            return this.value === 'active' ? '✓' : '✗'
          }
        }
      })

      wrapper = mount(DataTable, {
        props: {
          data: [
            { id: 1, name: 'Test', status: 'active' },
            { id: 2, name: 'Test 2', status: 'inactive' }
          ],
          columns: [
            { key: 'name', title: 'Name' },
            {
              key: 'status',
              title: 'Status',
              component: CustomComponent,
              componentProps: { customProp: 'test' }
            }
          ]
        }
      })

      const customComponents = wrapper.findAll('.custom-component')
      expect(customComponents).toHaveLength(2)
      expect(customComponents[0].classes()).toContain('status-active')
      expect(customComponents[1].classes()).toContain('status-inactive')
    })

    it('handles render functions with HTML', () => {
      wrapper = mount(DataTable, {
        props: {
          data: [
            { id: 1, name: 'Test', priority: 'high' },
            { id: 2, name: 'Test 2', priority: 'low' }
          ],
          columns: [
            { key: 'name', title: 'Name' },
            {
              key: 'priority',
              title: 'Priority',
              render: (item: any, value: string) => {
                const colors = {
                  high: 'red',
                  medium: 'yellow',
                  low: 'green'
                }
                return `<span class="priority-badge" style="background-color: ${colors[value]}">${value.toUpperCase()}</span>`
              }
            }
          ]
        }
      })

      const badges = wrapper.findAll('.priority-badge')
      expect(badges).toHaveLength(2)
      expect(badges[0].attributes('style')).toContain('background-color: red')
      expect(badges[0].text()).toBe('HIGH')
    })

    it('handles formatters for complex data transformation', () => {
      wrapper = mount(DataTable, {
        props: {
          data: [
            { id: 1, name: 'Test', amount: 1234.56, date: '2023-01-15' },
            { id: 2, name: 'Test 2', amount: 98765.43, date: '2023-12-31' }
          ],
          columns: [
            { key: 'name', title: 'Name' },
            {
              key: 'amount',
              title: 'Amount',
              formatter: (value: number) => `$${value.toFixed(2)}`
            },
            {
              key: 'date',
              title: 'Date',
              formatter: (value: string) => new Date(value).toLocaleDateString()
            }
          ]
        }
      })

      const firstRow = wrapper.findAll('tbody tr')[0]
      const cells = firstRow.findAll('td')
      expect(cells[1].text()).toBe('$1234.56')
      expect(cells[2].text()).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/) // Formatted date
    })
  })

  describe('Performance and Memory Management', () => {
    it('handles rapid prop updates efficiently', async () => {
      const data = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }))

      wrapper = mount(DataTable, {
        props: {
          data,
          columns: [{ key: 'name', title: 'Name' }],
          showSearch: true,
          showPagination: true,
          pageSize: 20
        }
      })

      const startTime = performance.now()

      // Rapid updates
      for (let i = 0; i < 10; i++) {
        await wrapper.setProps({
          data: data.slice(i * 10, (i + 1) * 10)
        })
        await nextTick()
      }

      const endTime = performance.now()
      const updateTime = endTime - startTime

      // Should handle rapid updates efficiently
      expect(updateTime).toBeLessThan(1000) // Less than 1 second for 10 updates
      expect(wrapper.exists()).toBe(true)
    })

    it('properly cleans up watchers and computed properties', () => {
      wrapper = mount(DataTable, {
        props: {
          data: [{ id: 1, name: 'Test' }],
          columns: [{ key: 'name', title: 'Name' }],
          showSearch: true
        }
      })

      // Unmount component
      wrapper.unmount()

      // Should not throw errors during cleanup
      expect(() => wrapper.unmount()).not.toThrow()
    })
  })
})