<template>
  <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div 
        class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 transition ease-in-out duration-150"
        role="status"
        :aria-label="loadingText"
      >
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ loadingText }}
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            {{ errorTitle }}
          </h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">
            {{ error }}
          </p>
        </div>
        <div v-if="showRetry" class="ml-auto pl-3">
          <button
            @click="$emit('retry')"
            class="text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-100"
          >
            Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!data || data.length === 0" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">{{ emptyTitle }}</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ emptyMessage }}
      </p>
      <div v-if="$slots.empty" class="mt-6">
        <slot name="empty" />
      </div>
    </div>

    <!-- Data Table -->
    <div v-else>
      <!-- Table Header with Search and Filters -->
      <div v-if="showSearch || showFilters || $slots.header" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div v-if="$slots.header" class="mb-4">
          <slot name="header" />
        </div>
        
        <div v-if="showSearch || showFilters" class="flex flex-col sm:flex-row gap-4">
          <!-- Search Input -->
          <div v-if="showSearch" class="flex-1">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="searchPlaceholder"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Filters Slot -->
          <div v-if="$slots.filters" class="flex gap-2">
            <slot name="filters" />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <!-- Table Header -->
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <!-- Checkbox for row selection -->
              <th v-if="selectable" class="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected"
                  @change="toggleSelectAll"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              
              <!-- Column Headers -->
              <th
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider',
                  column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : '',
                  column.width || ''
                ]"
                @click="column.sortable ? sortBy(column.sortKey || column.key, column.key) : null"
              >
                <div class="flex items-center space-x-1">
                  <span>{{ column.title }}</span>
                  <div v-if="column.sortable" class="flex flex-col">
                    <svg
                      v-if="sortKey === (column.sortKey || column.key) && sortOrder === 'asc'"
                      class="h-3 w-3 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                    </svg>
                    <svg
                      v-else-if="sortKey === (column.sortKey || column.key) && sortOrder === 'desc'"
                      class="h-3 w-3 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                    <svg
                      v-else
                      class="h-3 w-3 text-gray-300"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </th>

              <!-- Actions Column -->
              <th v-if="hasActions" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="item in paginatedData"
              :key="getRowKey(item)"
              :class="[
                'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150',
                selectedRows.has(getRowKey(item)) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              ]"
            >
              <!-- Checkbox for row selection -->
              <td v-if="selectable" class="px-6 py-4">
                <input
                  type="checkbox"
                  :checked="selectedRows.has(getRowKey(item))"
                  @change="toggleRowSelection(getRowKey(item))"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>
              
              <!-- Data Cells -->
              <td
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'px-6 py-4 whitespace-nowrap',
                  column.cellClass || ''
                ]"
              >
                <!-- Custom slot for cell content -->
                <slot
                  :name="`cell-${column.key}`"
                  :item="item"
                  :value="getNestedValue(item, column.key)"
                  :column="column"
                >
                  <!-- Default cell rendering -->
                  <div v-if="column.render" v-html="column.render(item, getNestedValue(item, column.key))"></div>
                  <div v-else-if="column.component">
                    <component
                      :is="column.component"
                      :item="item"
                      :value="getNestedValue(item, column.key)"
                      v-bind="column.componentProps"
                    />
                  </div>
                  <div v-else class="text-sm text-gray-900 dark:text-white">
                    {{ formatCellValue(getNestedValue(item, column.key), column) }}
                  </div>
                </slot>
              </td>

              <!-- Actions Cell -->
              <td v-if="hasActions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <slot name="actions" :item="item">
                  <div class="flex justify-end space-x-2">
                    <button
                      v-for="action in getActions(item)"
                      :key="action.key"
                      @click="action.handler(item)"
                      :class="[
                        'inline-flex items-center px-3 py-1 border text-xs leading-4 font-medium rounded',
                        action.variant === 'danger' 
                          ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                      ]"
                    >
                      <svg v-if="action.icon" class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="action.icon" />
                      </svg>
                      {{ action.label }}
                    </button>
                  </div>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="showPagination && totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredData.length) }} of {{ filteredData.length }} results
          </div>
          
          <div class="flex items-center space-x-2">
            <!-- Previous Button -->
            <button
              data-testid="prev-page"
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Previous
            </button>
            
            <!-- Page Numbers -->
            <div class="flex space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-1 text-sm border rounded-md',
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                ]"
              >
                {{ page }}
              </button>
            </div>
            
            <!-- Next Button -->
            <button
              data-testid="next-page"
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useSlots } from 'vue'

// Types
export interface TableColumn {
  key: string
  title: string
  sortable?: boolean
  sortKey?: string  // Optional: Use a different field for sorting than for display
  width?: string
  cellClass?: string
  render?: (item: any, value: any) => string
  component?: any
  componentProps?: Record<string, any>
  formatter?: (value: any) => string
}

export interface TableAction {
  key: string
  label: string
  icon?: string
  variant?: 'default' | 'danger'
  handler: (item: any) => void
  show?: (item: any) => boolean
}

// Props
interface Props {
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  loadingText?: string
  error?: string
  errorTitle?: string
  showRetry?: boolean
  emptyTitle?: string
  emptyMessage?: string
  selectable?: boolean
  rowKey?: string | ((item: any) => string)
  actions?: TableAction[] | ((item: any) => TableAction[])
  showSearch?: boolean
  searchPlaceholder?: string
  searchFields?: string[]
  showFilters?: boolean
  showPagination?: boolean
  pageSize?: number
  defaultSort?: { key: string; order: 'asc' | 'desc' }
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: 'Loading data...',
  errorTitle: 'Error loading data',
  showRetry: true,
  emptyTitle: 'No data found',
  emptyMessage: 'No items to display.',
  selectable: false,
  rowKey: 'id',
  showSearch: false,
  searchPlaceholder: 'Search...',
  searchFields: () => [],
  showFilters: false,
  showPagination: false,
  pageSize: 10
})

// Emits
const emit = defineEmits<{
  retry: []
  rowSelect: [items: any[]]
  sort: [{ key: string; order: 'asc' | 'desc' }]
}>()

// State
const searchQuery = ref('')
const sortKey = ref(props.defaultSort?.key || '')
const sortOrder = ref<'asc' | 'desc'>(props.defaultSort?.order || 'asc')
const currentPage = ref(1)
const selectedRows = ref(new Set<string>())

// Computed
const slots = useSlots()
const hasActions = computed(() => {
  return props.actions || !!slots.actions
})

const filteredData = computed(() => {
  let result = [...props.data]
  
  // Apply search filter
  if (searchQuery.value && props.searchFields.length > 0) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => {
      return props.searchFields.some(field => {
        const value = getNestedValue(item, field)
        return value && String(value).toLowerCase().includes(query)
      })
    })
  }
  
  return result
})

const sortedData = computed(() => {
  if (!sortKey.value) return filteredData.value
  
  return [...filteredData.value].sort((a, b) => {
    // Handle null/undefined items - they should sort to the end
    if (!a && !b) return 0
    if (!a) return 1
    if (!b) return -1
    
    const aValue = getNestedValue(a, sortKey.value)
    const bValue = getNestedValue(b, sortKey.value)
    
    let comparison = 0
    if (aValue < bValue) comparison = -1
    if (aValue > bValue) comparison = 1
    
    return sortOrder.value === 'desc' ? -comparison : comparison
  })
})

const paginatedData = computed(() => {
  if (!props.showPagination) return sortedData.value
  
  const start = (currentPage.value - 1) * props.pageSize
  const end = start + props.pageSize
  return sortedData.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / props.pageSize)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  const start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const allSelected = computed(() => {
  return paginatedData.value.length > 0 && 
         paginatedData.value.every(item => item && selectedRows.value.has(getRowKey(item)))
})

const someSelected = computed(() => {
  return selectedRows.value.size > 0 && !allSelected.value
})

// Methods
const getRowKey = (item: any): string => {
  if (!item) {
    return String(Math.random())
  }
  if (typeof props.rowKey === 'function') {
    return props.rowKey(item)
  }
  return String(item[props.rowKey] || item.id || Math.random())
}

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const formatCellValue = (value: any, column: TableColumn): string => {
  if (value === null || value === undefined) return ''
  
  if (column.formatter) {
    return column.formatter(value)
  }
  
  return String(value)
}

const getActions = (item: any): TableAction[] => {
  if (Array.isArray(props.actions)) {
    return props.actions.filter(action => !action.show || action.show(item))
  }
  
  if (typeof props.actions === 'function') {
    return props.actions(item)
  }
  
  return []
}

const sortBy = (key: string, _displayKey?: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }

  emit('sort', { key: sortKey.value, order: sortOrder.value })
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    paginatedData.value.forEach(item => {
      if (item) selectedRows.value.delete(getRowKey(item))
    })
  } else {
    paginatedData.value.forEach(item => {
      if (item) selectedRows.value.add(getRowKey(item))
    })
  }
  
  emitRowSelection()
}

const toggleRowSelection = (key: string) => {
  if (selectedRows.value.has(key)) {
    selectedRows.value.delete(key)
  } else {
    selectedRows.value.add(key)
  }
  
  emitRowSelection()
}

const emitRowSelection = () => {
  const selectedItems = props.data.filter(item => 
    item && selectedRows.value.has(getRowKey(item))
  )
  emit('rowSelect', selectedItems)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Watch for data changes to reset pagination
watch(() => props.data, () => {
  currentPage.value = 1
  selectedRows.value.clear()
})

// Watch for search changes to reset pagination
watch(searchQuery, () => {
  currentPage.value = 1
})
</script>