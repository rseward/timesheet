import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { ApiService } from '../api'
import { useAuthStore } from '@/stores/auth'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock auth store
vi.mock('@/stores/auth')
const mockedUseAuthStore = vi.mocked(useAuthStore)

// Mock window location
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true
})

describe('ApiService', () => {
  let apiService: ApiService
  let mockAxiosInstance: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockAxiosInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance)
    
    // Mock auth store
    const mockAuthStore = {
      token: 'test-token',
      logout: vi.fn()
    }
    mockedUseAuthStore.mockReturnValue(mockAuthStore as any)
    
    apiService = new ApiService()
  })

  describe('constructor', () => {
    it('creates axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: '/api',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    })

    it('sets up request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled()
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('HTTP methods', () => {
    beforeEach(() => {
      mockAxiosInstance.get.mockResolvedValue({ data: 'get-response' })
      mockAxiosInstance.post.mockResolvedValue({ data: 'post-response' })
      mockAxiosInstance.put.mockResolvedValue({ data: 'put-response' })
      mockAxiosInstance.delete.mockResolvedValue({ data: 'delete-response' })
    })

    it('get method works correctly', async () => {
      const result = await apiService.get('/test')
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined)
      expect(result).toBe('get-response')
    })

    it('post method works correctly', async () => {
      const testData = { name: 'test' }
      const result = await apiService.post('/test', testData)
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', testData, undefined)
      expect(result).toBe('post-response')
    })

    it('put method works correctly', async () => {
      const testData = { id: 1, name: 'updated' }
      const result = await apiService.put('/test/1', testData)
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', testData, undefined)
      expect(result).toBe('put-response')
    })

    it('delete method works correctly', async () => {
      const result = await apiService.delete('/test/1')
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', undefined)
      expect(result).toBe('delete-response')
    })
  })

  describe('interceptors', () => {
    it('request interceptor adds auth token', () => {
      // Mock localStorage to return a token
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue('test-token')
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })
      
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      const config = { headers: {} }
      
      const result = requestInterceptor(config)
      
      expect(result.headers.Authorization).toBe('Bearer test-token')
    })

    it('response interceptor handles 401 errors', async () => {
      // Mock localStorage for token clearing
      const mockLocalStorage = {
        removeItem: vi.fn()
      }
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      })
      
      const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]
      const error = {
        response: { status: 401 }
      }
      
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(window.location.href).toBe('/login')
    })

    it('response interceptor passes through non-401 errors', async () => {
      const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]
      const error = {
        response: { status: 500 }
      }
      
      await expect(responseErrorInterceptor(error)).rejects.toEqual(error)
      // For non-401 errors, no special handling should occur
    })
  })
})