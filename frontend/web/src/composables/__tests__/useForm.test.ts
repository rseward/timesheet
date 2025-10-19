import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useForm } from '../useForm'

interface TestFormData {
  name?: string
  email?: string
  age?: number
}

describe('useForm', () => {
  const mockValidationRules: Record<keyof TestFormData, ((value: any) => boolean | string)[]> = {
    name: [(value: string) => value.length > 0 || 'Name is required'],
    email: [
      (value: string) => value.length > 0 || 'Email is required',
      (value: string) => value.includes('@') || 'Email must be valid'
    ],
    age: [
      (value: number) => value >= 18 || 'Must be 18 or older'
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('initializes with provided initial values', () => {
      const initialValues = { name: 'John', email: 'john@example.com', age: 25 }
      const { values } = useForm<TestFormData>(initialValues, mockValidationRules)

      expect(values).toEqual(initialValues)
    })

    it('initializes with empty object if no initial values provided', () => {
      const { values } = useForm<TestFormData>({}, mockValidationRules)

      expect(values).toEqual({})
    })

    it('initializes errors and touched as empty', () => {
      const { errors, touched } = useForm<TestFormData>({}, mockValidationRules)

      expect(errors.value).toEqual({})
      expect(touched.value).toEqual({})
    })
  })

  describe('validation', () => {
    it('validates single field correctly', () => {
      const { errors, validateField } = useForm<TestFormData>(
        { name: '', email: 'valid@email.com' },
        mockValidationRules
      )

      validateField('name')

      expect(errors.value.name).toBe('Name is required')
      expect(errors.value.email).toBeUndefined()
    })

    it('validates multiple rules for single field', () => {
      const { errors, validateField } = useForm<TestFormData>(
        { email: 'invalid-email' },
        mockValidationRules
      )

      validateField('email')

      expect(errors.value.email).toBe('Email must be valid')
    })

    it('clears error when field becomes valid', () => {
      const { errors, validateField, setFieldValue } = useForm<TestFormData>(
        { name: '' },
        mockValidationRules
      )

      // Initially invalid
      validateField('name')
      expect(errors.value.name).toBe('Name is required')

      // Make valid
      setFieldValue('name', 'John')
      validateField('name')
      expect(errors.value.name).toBeUndefined()
    })

    it('validates all fields', () => {
      const { errors, validate } = useForm<TestFormData>(
        { name: '', email: 'invalid', age: 15 },
        mockValidationRules
      )

      const isValid = validate()

      expect(isValid).toBe(false)
      expect(errors.value.name).toBe('Name is required')
      expect(errors.value.email).toBe('Email must be valid')
      expect(errors.value.age).toBe('Must be 18 or older')
    })

    it('returns true when all fields are valid', () => {
      const { validate } = useForm<TestFormData>(
        { name: 'John', email: 'john@example.com', age: 25 },
        mockValidationRules
      )

      const isValid = validate()

      expect(isValid).toBe(true)
    })
  })

  describe('field management', () => {
    it('sets field value', () => {
      const { values, setFieldValue } = useForm<TestFormData>({}, mockValidationRules)

      setFieldValue('name', 'John Doe')

      expect(values.name).toBe('John Doe')
    })

    it('sets field as touched', () => {
      const { touched, setFieldTouched } = useForm<TestFormData>({}, mockValidationRules)

      setFieldTouched('email', true)

      expect(touched.value.email).toBe(true)
    })

    it('sets field error', () => {
      const { errors, setFieldError } = useForm<TestFormData>({}, mockValidationRules)

      setFieldError('name', 'Custom error message')

      expect(errors.value.name).toBe('Custom error message')
    })

    it('clears field error', () => {
      const { errors, setFieldError, clearFieldError } = useForm<TestFormData>({}, mockValidationRules)

      setFieldError('name', 'Error message')
      expect(errors.value.name).toBe('Error message')

      clearFieldError('name')
      expect(errors.value.name).toBeUndefined()
    })
  })

  describe('form state', () => {
    it('computes isValid correctly', () => {
      const { isValid, errors } = useForm<TestFormData>({}, mockValidationRules)

      // Initially valid (no errors)
      expect(isValid.value).toBe(true)

      // Add error
      errors.value.name = 'Error'
      expect(isValid.value).toBe(false)

      // Remove error
      delete errors.value.name
      expect(isValid.value).toBe(true)
    })

    it('computes isDirty correctly', () => {
      const initialValues = { name: 'John', email: 'john@example.com' }
      const { isDirty, setFieldValue } = useForm<TestFormData>(initialValues, mockValidationRules)

      // Initially not dirty
      expect(isDirty.value).toBe(false)

      // Change value
      setFieldValue('name', 'Jane')
      expect(isDirty.value).toBe(true)

      // Reset to original value
      setFieldValue('name', 'John')
      expect(isDirty.value).toBe(false)
    })

    it('computes hasErrors correctly', () => {
      const { hasErrors, errors } = useForm<TestFormData>({}, mockValidationRules)

      // Initially no errors
      expect(hasErrors.value).toBe(false)

      // Add error
      errors.value.name = 'Error'
      expect(hasErrors.value).toBe(true)

      // Remove error
      delete errors.value.name
      expect(hasErrors.value).toBe(false)
    })
  })

  describe('form operations', () => {
    it('resets form to initial values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' }
      const { values, errors, touched, reset, setFieldValue, setFieldError, setFieldTouched } = useForm<TestFormData>(
        initialValues,
        mockValidationRules
      )

      // Modify form state
      setFieldValue('name', 'Jane')
      setFieldError('email', 'Some error')
      setFieldTouched('name', true)

      // Reset
      reset()

      expect(values).toEqual(initialValues)
      expect(errors.value).toEqual({})
      expect(touched.value).toEqual({})
    })

    it('resets form to new values', () => {
      const initialValues = { name: 'John', email: 'john@example.com' }
      const newValues = { name: 'Jane', email: 'jane@example.com' }
      const { values, reset } = useForm<TestFormData>(initialValues, mockValidationRules)

      reset(newValues)

      expect(values).toEqual(newValues)
    })

    it('clears all errors', () => {
      const { errors, clearErrors, setFieldError } = useForm<TestFormData>({}, mockValidationRules)

      // Add some errors
      setFieldError('name', 'Error 1')
      setFieldError('email', 'Error 2')

      clearErrors()

      expect(errors.value).toEqual({})
    })
  })

  describe('submission', () => {
    it('handles successful submission', async () => {
      const mockSubmitFn = vi.fn().mockResolvedValue({ success: true })
      const { handleSubmit } = useForm<TestFormData>(
        { name: 'John', email: 'john@example.com', age: 25 },
        mockValidationRules
      )

      const result = await handleSubmit(mockSubmitFn)()

      expect(mockSubmitFn).toHaveBeenCalledWith({
        name: 'John',
        email: 'john@example.com',
        age: 25
      })
      expect(result).toEqual({ success: true })
    })

    it('prevents submission if form is invalid', async () => {
      const mockSubmitFn = vi.fn()
      const { handleSubmit } = useForm<TestFormData>(
        { name: '', email: 'invalid' },
        mockValidationRules
      )

      const result = await handleSubmit(mockSubmitFn)()

      expect(mockSubmitFn).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it('handles submission errors', async () => {
      const mockSubmitFn = vi.fn().mockRejectedValue(new Error('Server error'))
      const { handleSubmit } = useForm<TestFormData>(
        { name: 'John', email: 'john@example.com', age: 25 },
        mockValidationRules
      )

      await expect(handleSubmit(mockSubmitFn)()).rejects.toThrow('Server error')
    })

    it('marks all fields as touched on submission attempt', async () => {
      const mockSubmitFn = vi.fn()
      const { handleSubmit, touched } = useForm<TestFormData>(
        { name: '', email: 'invalid' },
        mockValidationRules
      )

      await handleSubmit(mockSubmitFn)()

      expect(touched.value.name).toBe(true)
      expect(touched.value.email).toBe(true)
    })
  })

  describe('field helpers', () => {
    it('getFieldProps returns correct props', () => {
      const { getFieldProps, setFieldTouched, errors } = useForm<TestFormData>(
        { name: 'John' },
        mockValidationRules
      )

      errors.value.name = 'Some error'
      setFieldTouched('name', true)

      const props = getFieldProps('name')

      expect(props.value).toBe('John')
      expect(props.error).toBe('Some error')
      expect(props.touched).toBe(true)
      
      // Test onChange
      props.onChange('Jane')
      expect(getFieldProps('name').value).toBe('Jane')
      
      // Test onBlur
      props.onBlur()
      // Should trigger validation and mark as touched
    })

    it('isFieldValid returns correct validation state', () => {
      const { isFieldValid, errors } = useForm<TestFormData>({}, mockValidationRules)

      // No error - field is valid
      expect(isFieldValid('name')).toBe(true)

      // With error - field is invalid
      errors.value.name = 'Error message'
      expect(isFieldValid('name')).toBe(false)
    })
  })
})