import { ref, reactive, computed, watch, nextTick, readonly } from 'vue'
import type { ValidationRule } from '@/types/validation'

type ValidationFunction = (value: any) => boolean | string

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, ValidationFunction[]>
) {
  // Form state
  const values = reactive<T>({ ...initialValues })
  const errors = ref<Record<string, string | undefined>>({})
  const touched = ref<Record<string, boolean>>({})
  const initialRef = ref({ ...initialValues })

  // Computed properties
  const isValid = computed(() => {
    return Object.keys(errors.value).every(key => !errors.value[key])
  })

  const hasErrors = computed(() => !isValid.value)

  const isDirty = computed(() => {
    return JSON.stringify(values) !== JSON.stringify(initialRef.value)
  })

  // Validation functions
  const validateField = (fieldName: keyof T): void => {
    const rules = validationRules[fieldName] || []
    const value = values[fieldName]
    
    for (const rule of rules) {
      const result = rule(value)
      if (typeof result === 'string') {
        errors.value[fieldName as string] = result
        return
      }
      if (result === false) {
        errors.value[fieldName as string] = 'Invalid value'
        return
      }
    }

    // Clear error if valid
    delete errors.value[fieldName as string]
  }

  const validate = (): boolean => {
    Object.keys(validationRules).forEach(fieldName => {
      validateField(fieldName as keyof T)
    })
    return isValid.value
  }

  // Form actions
  const setFieldValue = (fieldName: keyof T, value: any): void => {
    values[fieldName] = value
  }

  const setFieldTouched = (fieldName: keyof T, isTouched = true): void => {
    touched.value[fieldName as string] = isTouched
  }

  const setFieldError = (fieldName: keyof T, error: string): void => {
    errors.value[fieldName as string] = error
  }

  const clearFieldError = (fieldName: keyof T): void => {
    delete errors.value[fieldName as string]
  }

  const clearErrors = (): void => {
    errors.value = {}
  }

  const reset = (newValues?: Partial<T>): void => {
    Object.assign(values, { ...initialValues, ...newValues })
    errors.value = {}
    touched.value = {}
    if (newValues) {
      initialRef.value = { ...initialValues, ...newValues }
    }
  }

  // Submit handler
  const handleSubmit = (submitFn: (values: T) => Promise<any>) => {
    return async (): Promise<any> => {
      // Mark all fields as touched
      Object.keys(values).forEach(key => {
        touched.value[key] = true
      })

      if (!validate()) {
        return null
      }

      return await submitFn(values as T)
    }
  }

  // Field helpers
  const getFieldProps = (fieldName: keyof T) => ({
    value: values[fieldName],
    error: errors.value[fieldName as string],
    touched: touched.value[fieldName as string],
    onChange: (value: any) => setFieldValue(fieldName, value),
    onBlur: () => {
      setFieldTouched(fieldName, true)
      validateField(fieldName)
    }
  })

  const isFieldValid = (fieldName: keyof T): boolean => {
    return !errors.value[fieldName as string]
  }

  return {
    // State (direct refs for test mutability)
    values,
    errors,
    touched,
    
    // Computed
    isValid,
    hasErrors,
    isDirty,

    // Actions
    setFieldValue,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    clearErrors,
    reset,
    validate,
    validateField,
    handleSubmit,

    // Field helpers
    getFieldProps,
    isFieldValid
  }
}

// Hook for simple field validation without full form
export function useFieldValidation(initialValue: any = '', rules: ValidationRule[] = []) {
  const value = ref(initialValue)
  const error = ref<string | null>(null)
  const touched = ref(false)

  const validate = (): boolean => {
    for (const rule of rules) {
      if (rule.required && (value.value === null || value.value === undefined || value.value === '')) {
        error.value = rule.message || 'This field is required'
        return false
      }

      if (value.value && rule.min !== undefined && typeof value.value === 'number' && value.value < rule.min) {
        error.value = rule.message || `Value must be at least ${rule.min}`
        return false
      }

      if (value.value && rule.max !== undefined && typeof value.value === 'number' && value.value > rule.max) {
        error.value = rule.message || `Value must be no more than ${rule.max}`
        return false
      }

      if (value.value && rule.minLength !== undefined && typeof value.value === 'string' && value.value.length < rule.minLength) {
        error.value = rule.message || `Must be at least ${rule.minLength} characters`
        return false
      }

      if (value.value && rule.maxLength !== undefined && typeof value.value === 'string' && value.value.length > rule.maxLength) {
        error.value = rule.message || `Must be no more than ${rule.maxLength} characters`
        return false
      }

      if (value.value && rule.pattern && typeof value.value === 'string' && !rule.pattern.test(value.value)) {
        error.value = rule.message || 'Invalid format'
        return false
      }

      if (rule.custom) {
        const customResult = rule.custom(value.value)
        if (typeof customResult === 'string') {
          error.value = customResult
          return false
        }
        if (customResult === false) {
          error.value = rule.message || 'Invalid value'
          return false
        }
      }
    }

    error.value = null
    return true
  }

  const setValue = (newValue: any) => {
    value.value = newValue
    touched.value = true
    validate()
  }

  const clearError = () => {
    error.value = null
  }

  return {
    value,
    error: readonly(error),
    touched: readonly(touched),
    setValue,
    validate,
    clearError
  }
}