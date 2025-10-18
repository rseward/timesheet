import { ref, readonly } from 'vue'
import { useNotification } from './useNotification'

export function useApi<T = any>() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { showError } = useNotification()

  const execute = async (apiCall: () => Promise<T>): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await apiCall()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      error.value = errorMessage
      showError(errorMessage)
      return null
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    execute,
    clearError
  }
}

// Specialized hook for mutations (create, update, delete)
export function useMutation<TData = any, TVariables = any>() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<TData | null>(null)

  const mutate = async (
    apiCall: (variables: TVariables) => Promise<TData>,
    variables: TVariables
  ): Promise<TData | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await apiCall(variables)
      data.value = result
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      error.value = errorMessage
      
      if (import.meta.env.DEV) {
        console.error('[useMutation] Error:', errorMessage)
      }
      
      return null
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    data: readonly(data),
    mutate,
    reset
  }
}

// Hook for queries with caching capabilities
export function useQuery<T = any>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean
    refetchOnMount?: boolean
    staleTime?: number
  }
) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<T | null>(null)
  const lastFetch = ref<number | null>(null)

  const defaultOptions = {
    enabled: true,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000 // 5 minutes
  }

  const mergedOptions = { ...defaultOptions, ...options }

  const isStale = () => {
    if (!lastFetch.value) return true
    return Date.now() - lastFetch.value > mergedOptions.staleTime
  }

  const fetch = async (force = false): Promise<T | null> => {
    if (!mergedOptions.enabled) return null
    if (!force && data.value && !isStale()) return data.value

    loading.value = true
    error.value = null

    try {
      const result = await queryFn()
      data.value = result
      lastFetch.value = Date.now()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      error.value = errorMessage
      
      if (import.meta.env.DEV) {
        console.error(`[useQuery:${queryKey}] Error:`, errorMessage)
      }
      
      return null
    } finally {
      loading.value = false
    }
  }

  const refetch = () => fetch(true)

  const invalidate = () => {
    lastFetch.value = null
  }

  // Auto-fetch on mount if enabled
  if (mergedOptions.enabled && mergedOptions.refetchOnMount) {
    fetch()
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    data: readonly(data),
    fetch,
    refetch,
    invalidate,
    isStale
  }
}