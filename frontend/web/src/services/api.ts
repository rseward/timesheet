import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

class ApiService {
  private client: AxiosInstance

  constructor() {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    console.log('[ApiService] Initializing with baseURL:', baseURL)
    
    this.client = axios.create({
      baseURL,
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
        console.log('[ApiService] Auth token available:', !!token)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('[ApiService] Added auth header to request')
        } else {
          console.log('[ApiService] No auth token - proceeding without authorization')
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
          console.error(`[API Error] ${error.response?.status || 'NO_STATUS'} ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${error.config?.url || 'NO_URL'}`)
          
          if (error.response) {
            console.error(`[API Error] Status: ${error.response.status} ${error.response.statusText}`)
            console.error(`[API Error] Response Data:`, error.response.data)
            console.error(`[API Error] Headers:`, error.response.headers)
          }
        }

        if (error.response?.status === 401) {
          // Token expired or invalid
          console.error('🚫 [API] 401 Unauthorized - clearing token and redirecting to login')
          this.clearAuthToken()
          window.location.href = '/login'
        }

        if (error.response?.status === 403) {
          // Forbidden - likely authentication issue
          console.error('🚫 [API] 403 Forbidden - authentication failed or insufficient permissions')
          console.error('🚫 [API] Check if auth token is valid and not expired')
        }

        if (error.response?.status >= 500) {
          // Server error - could implement retry logic here
          console.error('💥 [API] Server error:', error.response.data)
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


  private clearRefreshToken(): void {
    localStorage.removeItem('refresh_token')
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

  async delete<T>(url: string, _data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }


  // Utility method for setting auth token
  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
    console.log('[ApiService] 🔑 Auth token stored in localStorage')
  }
  
  // Utility method for setting refresh token
  setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token)
    console.log('[ApiService] 🔄 Refresh token stored in localStorage')
  }
  
  // Utility method for setting both tokens
  setTokens(accessToken: string, refreshToken?: string): void {
    this.setAuthToken(accessToken)
    if (refreshToken) {
      this.setRefreshToken(refreshToken)
    }
    console.log('[ApiService] 🔐 Tokens stored:', {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken
    })
  }
  
  // Utility method for clearing all tokens
  logout(): void {
    this.clearAuthToken()
    this.clearRefreshToken()
    console.log('[ApiService] 🚪 All tokens cleared from localStorage')
  }
}

export { ApiService }
export const apiService = new ApiService()
export default apiService
