<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="$emit('cancel')"
      ></div>

      <!-- Modal container -->
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
      
      <div class="relative inline-block transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
        <div class="sm:flex sm:items-start">
          <!-- Icon -->
          <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
               :class="iconClasses">
            <component :is="iconComponent" class="h-6 w-6" aria-hidden="true" />
          </div>
          
          <!-- Content -->
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
              {{ title }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ message }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Action buttons -->
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            :disabled="loading"
            class="inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            :class="confirmButtonClasses"
            @click="handleConfirm"
          >
            <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? loadingText : confirmText }}
          </button>
          <button
            type="button"
            class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
            @click="$emit('cancel')"
            :disabled="loading"
          >
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type ModalType = 'danger' | 'warning' | 'info' | 'success'

interface Props {
  isOpen: boolean
  type?: ModalType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  loadingText?: string
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'danger',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loadingText: 'Processing...'
})

const emit = defineEmits<Emits>()

const loading = ref(false)

const iconComponent = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'ExclamationTriangleIcon'
    case 'warning':
      return 'ExclamationTriangleIcon'
    case 'info':
      return 'InformationCircleIcon'
    case 'success':
      return 'CheckCircleIcon'
    default:
      return 'ExclamationTriangleIcon'
  }
})

const iconClasses = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-100 dark:bg-red-900/20'
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900/20'
    case 'info':
      return 'bg-blue-100 dark:bg-blue-900/20'
    case 'success':
      return 'bg-green-100 dark:bg-green-900/20'
    default:
      return 'bg-red-100 dark:bg-red-900/20'
  }
})

const confirmButtonClasses = computed(() => {
  const baseClasses = 'hover:opacity-75 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  switch (props.type) {
    case 'danger':
      return `${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500`
    case 'warning':
      return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500`
    case 'info':
      return `${baseClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`
    case 'success':
      return `${baseClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500`
    default:
      return `${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500`
  }
})

const handleConfirm = async () => {
  loading.value = true
  try {
    emit('confirm')
  } finally {
    loading.value = false
  }
}
</script>

<script lang="ts">
// Icon components for the template
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

export default {
  components: {
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon
  }
}
</script>