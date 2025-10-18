// Base API response types

export interface ApiResponse<T = any> {
  data?: T
  message?: string
  status: number
  success: boolean
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// Request configuration
export interface RequestConfig {
  headers?: Record<string, string>
  params?: Record<string, any>
  timeout?: number
}