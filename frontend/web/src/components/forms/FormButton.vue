<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-3 h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- Icon Slot -->
    <span 
      v-else-if="$slots.icon" 
      class="mr-2 flex-shrink-0"
    >
      <slot name="icon" />
    </span>

    <!-- Button Text -->
    <span>
      {{ loading ? loadingText : text }}
    </span>

    <!-- Trailing Icon Slot -->
    <span 
      v-if="$slots.trailingIcon && !loading" 
      class="ml-2 flex-shrink-0"
    >
      <slot name="trailingIcon" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type ButtonType = 'button' | 'submit' | 'reset'

interface Props {
  text: string
  variant?: ButtonVariant
  size?: ButtonSize
  type?: ButtonType
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  fullWidth?: boolean
}

interface Emits {
  click: [event: MouseEvent]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  loadingText: 'Loading...',
  fullWidth: false
})

const emit = defineEmits<Emits>()

// Button styling based on variant and size
const buttonClasses = computed(() => {
  const classes = [
    'inline-flex items-center justify-center font-medium rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
    'transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ]

  // Size classes
  switch (props.size) {
    case 'xs':
      classes.push('px-2.5 py-1.5 text-xs')
      break
    case 'sm':
      classes.push('px-3 py-2 text-sm')
      break
    case 'md':
      classes.push('px-4 py-2 text-sm')
      break
    case 'lg':
      classes.push('px-4 py-2 text-base')
      break
    case 'xl':
      classes.push('px-6 py-3 text-base')
      break
  }

  // Full width
  if (props.fullWidth) {
    classes.push('w-full')
  }

  // Variant classes
  switch (props.variant) {
    case 'primary':
      classes.push(
        'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        'text-white border border-transparent',
        'dark:bg-blue-600 dark:hover:bg-blue-700'
      )
      break
    case 'secondary':
      classes.push(
        'bg-white hover:bg-gray-50 focus:ring-blue-500',
        'text-gray-700 border border-gray-300',
        'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
      )
      break
    case 'danger':
      classes.push(
        'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        'text-white border border-transparent',
        'dark:bg-red-600 dark:hover:bg-red-700'
      )
      break
    case 'success':
      classes.push(
        'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        'text-white border border-transparent',
        'dark:bg-green-600 dark:hover:bg-green-700'
      )
      break
    case 'warning':
      classes.push(
        'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        'text-white border border-transparent',
        'dark:bg-yellow-600 dark:hover:bg-yellow-700'
      )
      break
    case 'ghost':
      classes.push(
        'bg-transparent hover:bg-gray-100 focus:ring-gray-500',
        'text-gray-700 border border-transparent',
        'dark:text-gray-300 dark:hover:bg-gray-800'
      )
      break
  }

  return classes.join(' ')
})

// Event handlers
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>