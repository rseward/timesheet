import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useApi } from '../useApi'
import { useNotification } from '../useNotification'

// Mock useNotification
vi.mock('../useNotification', () => ({
  useNotification: vi.fn(() => ({
    showError: vi.fn()
  }))
}))

const mockUseNotification = vi.mocked(useNotification)

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with correct default state', () => {
    const { loading, error } = useApi()
    
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  describe('execute', () => {
    it('executes successful API call', async () => {
      const { execute, loading, error } = useApi<string>()
      const mockApiCall = vi.fn().mockResolvedValue('success result')

      const result = await execute(mockApiCall)

      expect(result).toBe('success result')
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(mockApiCall).toHaveBeenCalled()
    })

    it('sets loading state during execution', async () => {
      const { execute, loading } = useApi<string>()
      let resolveApi: (value: string) => void
      const mockApiCall = vi.fn().mockImplementation(() => 
        new Promise<string>(resolve => { resolveApi = resolve })
      )

      const executePromise = execute(mockApiCall)
      
      // Should be loading during execution
      expect(loading.value).toBe(true)
      
      resolveApi!('result')
      await executePromise
      
      // Should not be loading after completion
      expect(loading.value).toBe(false)
    })

    it('handles API errors and shows notification', async () => {
      const mockShowError = vi.fn()
      mockUseNotification.mockReturnValue({ showError: mockShowError } as any)
      
      const { execute, loading, error } = useApi<string>()
      
      const testError = new Error('API Error')
      const mockApiCall = vi.fn().mockRejectedValue(testError)

      const result = await execute(mockApiCall)

      expect(result).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBe('API Error')
      expect(mockShowError).toHaveBeenCalledWith('API Error')
    })

    it('handles non-Error exceptions', async () => {
      const mockShowError = vi.fn()
      mockUseNotification.mockReturnValue({ showError: mockShowError } as any)
      
      const { execute, loading, error } = useApi<string>()
      
      const mockApiCall = vi.fn().mockRejectedValue('String error')

      const result = await execute(mockApiCall)

      expect(result).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBe('An error occurred')
      expect(mockShowError).toHaveBeenCalledWith('An error occurred')
    })

    it('clears previous error on new execution', async () => {
      const { execute, error } = useApi<string>()
      
      // First call fails
      const mockApiCall1 = vi.fn().mockRejectedValue(new Error('First error'))
      await execute(mockApiCall1)
      expect(error.value).toBe('First error')
      
      // Second call succeeds
      const mockApiCall2 = vi.fn().mockResolvedValue('success')
      await execute(mockApiCall2)
      expect(error.value).toBeNull()
    })

    it('ensures loading is false even if error occurs', async () => {
      const { execute, loading } = useApi<string>()
      const mockApiCall = vi.fn().mockRejectedValue(new Error('Test error'))

      await execute(mockApiCall)

      expect(loading.value).toBe(false)
    })

    it('can be called multiple times', async () => {
      const { execute } = useApi<number>()
      
      const mockApiCall1 = vi.fn().mockResolvedValue(1)
      const mockApiCall2 = vi.fn().mockResolvedValue(2)
      const mockApiCall3 = vi.fn().mockResolvedValue(3)

      const result1 = await execute(mockApiCall1)
      const result2 = await execute(mockApiCall2)
      const result3 = await execute(mockApiCall3)

      expect(result1).toBe(1)
      expect(result2).toBe(2)
      expect(result3).toBe(3)
      expect(mockApiCall1).toHaveBeenCalledTimes(1)
      expect(mockApiCall2).toHaveBeenCalledTimes(1)
      expect(mockApiCall3).toHaveBeenCalledTimes(1)
    })
  })

  describe('with different data types', () => {
    it('works with object return type', async () => {
      const { execute } = useApi<{ id: number; name: string }>()
      const mockData = { id: 1, name: 'Test' }
      const mockApiCall = vi.fn().mockResolvedValue(mockData)

      const result = await execute(mockApiCall)

      expect(result).toEqual(mockData)
    })

    it('works with array return type', async () => {
      const { execute } = useApi<string[]>()
      const mockData = ['item1', 'item2', 'item3']
      const mockApiCall = vi.fn().mockResolvedValue(mockData)

      const result = await execute(mockApiCall)

      expect(result).toEqual(mockData)
    })

    it('works with void return type', async () => {
      const { execute } = useApi<void>()
      const mockApiCall = vi.fn().mockResolvedValue(undefined)

      const result = await execute(mockApiCall)

      expect(result).toBeUndefined()
    })
  })
})