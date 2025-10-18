// Authentication and User types

export interface User {
  user_id: number
  username: string
  email?: string
  first_name?: string
  last_name?: string
  active: boolean
  is_admin?: boolean
  created_at?: string
  updated_at?: string
}

export interface LoginCredentials {
  username: string
  password: string
  remember_me?: boolean
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in?: number
  user_id?: number
  username?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  lastActivity?: number
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RefreshTokenResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in?: number
}

// User preferences types
export interface UserPreference {
  preference_id: number
  user_id: number
  preference_key: string
  preference_value: string
  created_at?: string
  updated_at?: string
}

export interface UserPreferences {
  start_time?: string
  end_time?: string
  default_client_id?: number
  default_project_id?: number
  timezone?: string
  date_format?: string
  time_format?: '12h' | '24h'
  theme?: 'light' | 'dark' | 'system'
}

export interface PreferencesUpdateData {
  [key: string]: string | number | boolean
}

// Authentication errors
export interface AuthError {
  message: string
  code: string
  field?: string
}

// Route protection
export interface RouteGuard {
  requiresAuth?: boolean
  requiresAdmin?: boolean
  allowedRoles?: string[]
  redirectTo?: string
}