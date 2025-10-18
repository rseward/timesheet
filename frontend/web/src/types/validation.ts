// Form validation types

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
  message?: string
}

export interface FieldValidation {
  value: any
  rules: ValidationRule[]
  error?: string
  isValid: boolean
  isDirty: boolean
  isTouched: boolean
}

export interface FormValidation {
  fields: Record<string, FieldValidation>
  isValid: boolean
  isSubmitting: boolean
  hasErrors: boolean
  errors: Record<string, string>
}

// Validation error types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface FormErrors {
  [fieldName: string]: string | string[]
}

// Common validation rules
export const VALIDATION_RULES = {
  required: (message = 'This field is required') => ({
    required: true,
    message,
  }),
  
  email: (message = 'Please enter a valid email address') => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message,
  }),
  
  minLength: (length: number, message?: string) => ({
    minLength: length,
    message: message || `Must be at least ${length} characters`,
  }),
  
  maxLength: (length: number, message?: string) => ({
    maxLength: length,
    message: message || `Must be no more than ${length} characters`,
  }),
  
  url: (message = 'Please enter a valid URL') => ({
    pattern: /^https?:\/\/.+/,
    message,
  }),
  
  phone: (message = 'Please enter a valid phone number') => ({
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message,
  }),
  
  numeric: (message = 'Please enter a valid number') => ({
    pattern: /^\d+(\.\d+)?$/,
    message,
  }),
  
  time: (message = 'Please enter a valid time (HH:MM)') => ({
    pattern: /^([01]?\d|2[0-3]):[0-5]\d$/,
    message,
  }),
  
  date: (message = 'Please enter a valid date') => ({
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message,
  }),
}

// Form field types
export type FormFieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local'

export interface FormField {
  name: string
  type: FormFieldType
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  validation?: ValidationRule[]
  description?: string
  options?: Array<{ value: any; label: string }>
}

// Form state management
export interface FormState<T = Record<string, any>> {
  values: T
  errors: FormErrors
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
}

export interface FormConfig<T = Record<string, any>> {
  initialValues: T
  validationRules: Record<keyof T, ValidationRule[]>
  onSubmit: (values: T) => Promise<void> | void
  validateOnChange?: boolean
  validateOnBlur?: boolean
}