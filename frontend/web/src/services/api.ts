import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/api'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Ensure client is ready before setting up interceptors
    if (this.client && this.client.interceptors) {
      this.setupInterceptors()
    }
  }

  private setupInterceptors() {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // Log requests in development
        if (import.meta.env.DEV) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params
          })
        }
        
        return config
      },
      (error) => {
        if (import.meta.env.DEV) {
          console.error('[API Request Error]', error)
        }
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (import.meta.env.DEV) {
          console.log(`[API Response] ${response.status} ${response.config.url}`, response.data)
        }
        return response
      },
      async (error) => {
        if (import.meta.env.DEV) {
          console.error('[API Response Error]', error)
        }

        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuthToken()
          window.location.href = '/login'
        }

        if (error.response?.status >= 500) {
          // Server error - could implement retry logic here
          console.error('Server error:', error.response.data)
        }

        return Promise.reject(error)
      }
    )
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  private clearAuthToken(): void {
    localStorage.removeItem('auth_token')
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || 
                     error.response.data?.message || 
                     `HTTP ${error.response.status}: ${error.response.statusText}`
      
      return new Error(message)
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error: Unable to connect to server')
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred')
    }
  }

  // Utility method for setting auth token
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }
  
  // Utility method for clearing auth token  
  logout(): void {
    this.clearAuthToken()
  }
}

export { ApiService }
export const apiService = new ApiService()
export default apiService
