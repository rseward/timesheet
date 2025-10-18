import { ref, computed, watch } from 'vue'

export interface PaginationOptions {
  page?: number
  pageSize?: number
  total?: number
  pageSizeOptions?: number[]
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
  offset: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  startIndex: number
  endIndex: number
}

export function usePagination(options: PaginationOptions = {}) {
  const defaultOptions = {
    page: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: [5, 10, 20, 50, 100]
  }

  const mergedOptions = { ...defaultOptions, ...options }

  // Reactive state
  const page = ref(mergedOptions.page)
  const pageSize = ref(mergedOptions.pageSize)
  const total = ref(mergedOptions.total)
  const pageSizeOptions = ref(mergedOptions.pageSizeOptions)

  // Computed properties
  const offset = computed(() => (page.value - 1) * pageSize.value)
  
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)
  
  const hasNext = computed(() => page.value < totalPages.value)
  
  const hasPrev = computed(() => page.value > 1)
  
  const startIndex = computed(() => {
    if (total.value === 0) return 0
    return offset.value + 1
  })
  
  const endIndex = computed(() => {
    const end = offset.value + pageSize.value
    return Math.min(end, total.value)
  })

  const paginationState = computed<PaginationState>(() => ({
    page: page.value,
    pageSize: pageSize.value,
    total: total.value,
    offset: offset.value,
    totalPages: totalPages.value,
    hasNext: hasNext.value,
    hasPrev: hasPrev.value,
    startIndex: startIndex.value,
    endIndex: endIndex.value
  }))

  // Actions
  const setPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage
    }
  }

  const setPageSize = (newPageSize: number) => {
    pageSize.value = newPageSize
    // Reset to first page when page size changes
    page.value = 1
  }

  const setTotal = (newTotal: number) => {
    total.value = newTotal
    // Adjust current page if it's out of range
    if (page.value > totalPages.value && totalPages.value > 0) {
      page.value = totalPages.value
    }
  }

  const nextPage = () => {
    if (hasNext.value) {
      page.value += 1
    }
  }

  const prevPage = () => {
    if (hasPrev.value) {
      page.value -= 1
    }
  }

  const firstPage = () => {
    page.value = 1
  }

  const lastPage = () => {
    page.value = totalPages.value
  }

  const reset = () => {
    page.value = 1
    pageSize.value = defaultOptions.pageSize
    total.value = 0
  }

  // Generate page numbers for pagination controls
  const getPageNumbers = (maxVisible = 7): number[] => {
    const current = page.value
    const total = totalPages.value

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const half = Math.floor(maxVisible / 2)
    let start = Math.max(1, current - half)
    let end = Math.min(total, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  // Slice data array for current page
  const paginateArray = <T>(data: T[]): T[] => {
    const start = offset.value
    const end = start + pageSize.value
    return data.slice(start, end)
  }

  // Watch for page changes to emit events
  const onPageChange = ref<((page: number) => void) | null>(null)
  const onPageSizeChange = ref<((pageSize: number) => void) | null>(null)

  watch(page, (newPage) => {
    onPageChange.value?.(newPage)
  })

  watch(pageSize, (newPageSize) => {
    onPageSizeChange.value?.(newPageSize)
  })

  return {
    // State
    page: readonly(page),
    pageSize: readonly(pageSize),
    total: readonly(total),
    pageSizeOptions: readonly(pageSizeOptions),

    // Computed
    paginationState,
    offset,
    totalPages,
    hasNext,
    hasPrev,
    startIndex,
    endIndex,

    // Actions
    setPage,
    setPageSize,
    setTotal,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    reset,

    // Utilities
    getPageNumbers,
    paginateArray,

    // Event handlers
    onPageChange,
    onPageSizeChange
  }
}

// Helper for server-side pagination parameters
export function getPaginationParams(pagination: PaginationState) {
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    offset: pagination.offset,
    limit: pagination.pageSize
  }
}

// Helper for updating pagination from server response
export function updatePaginationFromResponse(
  usePaginationReturn: ReturnType<typeof usePagination>,
  response: {
    page?: number
    pageSize?: number
    total?: number
    count?: number
  }
) {
  const { setPage, setPageSize, setTotal } = usePaginationReturn

  if (response.page !== undefined) setPage(response.page)
  if (response.pageSize !== undefined) setPageSize(response.pageSize)
  if (response.total !== undefined) setTotal(response.total)
  if (response.count !== undefined) setTotal(response.count)
}