<template>
  <div class="form-group">
    <label 
      v-if="label"
      :for="fieldId" 
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="relative">
      <div
        v-if="$slots.icon"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <slot name="icon" />
      </div>
      
      <input
        :id="fieldId"
        :type="actualType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :data-testid="dataTestId"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <div
        v-if="type === 'password' && showPasswordToggle"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          @click="togglePasswordVisibility"
        >
          <svg
            v-if="showPassword"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <svg
            v-else
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
            />
          </svg>
        </button>
      </div>
    </div>
    
    <p 
      v-if="error" 
      class="mt-1 text-sm text-red-600 dark:text-red-400"
    >
      {{ error }}
    </p>
    
    <p 
      v-else-if="helpText" 
      class="mt-1 text-sm text-gray-500 dark:text-gray-400"
    >
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  helpText?: string
  autocomplete?: string
  showPasswordToggle?: boolean
  id?: string
  dataTestId?: string
}

interface Emits {
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  showPasswordToggle: false
})

const emit = defineEmits<Emits>()

// Password visibility toggle
const showPassword = ref(false)
const actualType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text'
  }
  return props.type
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Generate unique field ID
const fieldId = computed(() => {
  if (props.id) return props.id
  return `field-${Math.random().toString(36).substr(2, 9)}`
})

// Input styling with error states
const inputClasses = computed(() => {
  const baseClasses = [
    'block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-100',
    'shadow-sm ring-1 ring-inset placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
    'dark:bg-gray-800 transition-colors duration-200'
  ]
  
  // Add padding for icons
  if (props.type === 'password' && props.showPasswordToggle) {
    baseClasses.push('pr-10')
  }
  
  // Error states
  if (props.error) {
    baseClasses.push(
      'ring-red-300 dark:ring-red-600 focus:ring-red-600 dark:focus:ring-red-500'
    )
  } else {
    baseClasses.push(
      'ring-gray-300 dark:ring-gray-600 focus:ring-blue-600 dark:focus:ring-blue-500'
    )
  }
  
  // Disabled state
  if (props.disabled) {
    baseClasses.push(
      'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
    )
  } else {
    baseClasses.push('hover:ring-gray-400 dark:hover:ring-gray-500')
  }
  
  return baseClasses.join(' ')
})

// Event handlers
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>