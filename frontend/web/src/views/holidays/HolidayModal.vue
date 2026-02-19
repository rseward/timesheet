<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <form @submit.prevent="handleSubmit">
          <div>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
                {{ isEditing ? 'Edit Holiday' : 'Add Holiday' }}
              </h3>
              <button
                type="button"
                @click="$emit('close')"
                class="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span class="sr-only">Close</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="mt-5">
              <div class="space-y-4">
                <div>
                  <label for="client_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Client <span class="text-red-500">*</span>
                  </label>
                  <select
                    id="client_id"
                    v-model="formData.client_id"
                    :disabled="isEditing || !!fixedClientId"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm disabled:opacity-50"
                  >
                    <option :value="0">Federal Holiday</option>
                    <option v-for="client in clients" :key="client.id" :value="client.id">
                      {{ client.organisation }}
                    </option>
                  </select>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Select "Federal Holiday" for client_id=0
                  </p>
                </div>

                <div>
                  <label for="holiday_date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="holiday_date"
                    v-model="formData.holiday_date"
                    type="date"
                    required
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.holiday_date }"
                  />
                  <p v-if="errors.holiday_date" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ errors.holiday_date }}
                  </p>
                </div>

                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    v-model="formData.name"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.name }"
                  />
                  <p v-if="errors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ errors.name }}
                  </p>
                </div>

                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    v-model="formData.description"
                    rows="3"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  ></textarea>
                </div>

                <div>
                  <div class="flex items-center">
                    <input
                      id="is_federal"
                      v-model="formData.is_federal"
                      type="checkbox"
                      :disabled="formData.client_id === 0"
                      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label for="is_federal" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Federal Holiday
                    </label>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Automatically set for client_id=0
                  </p>
                </div>

                <div class="flex items-center">
                  <input
                    id="active"
                    v-model="formData.active"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label for="active" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Active holiday
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div v-if="submitError" class="mt-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                  Error saving holiday
                </h3>
                <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                  {{ submitError }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Holiday' : 'Create Holiday') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useHolidaysStore } from '@/stores/holidays'
import { useClientsStore } from '@/stores/clients'
import type { Holiday, HolidayCreateData, HolidayUpdateData } from '@/types/holiday'

// Props
interface Props {
  holiday?: Holiday | null
  fixedClientId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  holiday: null,
  fixedClientId: null
})

// Emits
const emit = defineEmits<{
  close: []
  saved: []
}>()

// Stores
const holidaysStore = useHolidaysStore()
const clientsStore = useClientsStore()

// State
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

// Computed
const isEditing = computed(() => !!props.holiday)
const clients = computed(() => clientsStore.clients)

// Form data
const formData = reactive<HolidayCreateData & { id?: number }>({
  client_id: 0,
  holiday_date: '',
  name: '',
  description: '',
  is_federal: false,
  active: true
})

// Form errors
const errors = reactive({
  client_id: '',
  holiday_date: '',
  name: ''
})

// Watch for client_id changes to auto-update is_federal
watch(() => formData.client_id, (newClientId) => {
  formData.is_federal = newClientId === 0
})

// Watch for holiday changes to populate form
watch(() => props.holiday, (holiday) => {
  if (holiday) {
    Object.assign(formData, {
      id: holiday.id,
      client_id: holiday.client_id,
      holiday_date: holiday.holiday_date,
      name: holiday.name,
      description: holiday.description || '',
      is_federal: holiday.is_federal,
      active: holiday.active
    })
  } else {
    Object.assign(formData, {
      id: undefined,
      client_id: props.fixedClientId || 0,
      holiday_date: '',
      name: '',
      description: '',
      is_federal: (props.fixedClientId || 0) === 0,
      active: true
    })
  }

  clearErrors()
}, { immediate: true })

// Methods
const clearErrors = () => {
  errors.client_id = ''
  errors.holiday_date = ''
  errors.name = ''
  submitError.value = null
}

const validateForm = (): boolean => {
  clearErrors()
  let isValid = true

  if (!formData.holiday_date) {
    errors.holiday_date = 'Date is required'
    isValid = false
  }

  if (!formData.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  submitError.value = null

  try {
    const submitData: HolidayCreateData | HolidayUpdateData = {
      client_id: formData.client_id,
      holiday_date: formData.holiday_date,
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined,
      is_federal: formData.is_federal,
      active: formData.active
    }

    if (isEditing.value && props.holiday) {
      await holidaysStore.updateHoliday(props.holiday.id, submitData as HolidayUpdateData)
    } else {
      await holidaysStore.createHoliday(submitData as HolidayCreateData)
    }

    emit('saved')
  } catch (error) {
    console.error('Error saving holiday:', error)
    submitError.value = holidaysStore.error || 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}
</script>
