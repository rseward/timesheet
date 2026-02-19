<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>
      
      <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
        <form @submit.prevent="handleSubmit">
          <div>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
                {{ isEditing ? 'Edit Client' : 'Add New Client' }}
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
              <!-- Form Fields -->
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <!-- Organisation (Required) -->
                <div class="sm:col-span-2">
                  <label for="organisation" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Organisation <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="organisation"
                    v-model="formData.organisation"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.organisation }"
                  />
                  <p v-if="errors.organisation" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ errors.organisation }}
                  </p>
                </div>

                <!-- Description -->
                <div class="sm:col-span-2">
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

                <!-- Address Fields -->
                <div class="sm:col-span-2">
                  <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">Address Information</h4>
                </div>

                <!-- Address Line 1 -->
                <div class="sm:col-span-2">
                  <label for="address1" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address Line 1
                  </label>
                  <input
                    id="address1"
                    v-model="formData.address1"
                    type="text"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <!-- Address Line 2 -->
                <div class="sm:col-span-2">
                  <label for="address2" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address Line 2
                  </label>
                  <input
                    id="address2"
                    v-model="formData.address2"
                    type="text"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <!-- City -->
                <div>
                  <label for="city" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <input
                    id="city"
                    v-model="formData.city"
                    type="text"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <!-- State -->
                <div>
                  <label for="state" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    State/Province
                  </label>
                  <input
                    id="state"
                    v-model="formData.state"
                    type="text"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <!-- Country -->
                <div>
                  <label for="country" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Country
                  </label>
                  <input
                    id="country"
                    v-model="formData.country"
                    type="text"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <!-- Postal Code -->
                <div>
                  <label for="postal_code" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Postal Code
                  </label>
                  <input
                    id="postal_code"
                    v-model="formData.postal_code"
                    type="text"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <!-- Contact Information -->
                <div class="sm:col-span-2">
                  <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">Contact Information</h4>
                </div>

                <!-- Contact Name -->
                <div>
                  <label for="contactName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Name
                  </label>
                  <input
                    id="contactName"
                    v-model="formData.contactName"
                    type="text"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <!-- Contact Email -->
                <div>
                  <label for="contactEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Email
                  </label>
                  <input
                    id="contactEmail"
                    v-model="formData.contactEmail"
                    type="email"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.contactEmail }"
                  />
                  <p v-if="errors.contactEmail" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ errors.contactEmail }}
                  </p>
                </div>

                <!-- Phone Number -->
                <div>
                  <label for="phone_number" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <input
                    id="phone_number"
                    v-model="formData.phone_number"
                    type="tel"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <!-- Fax Number -->
                <div>
                  <label for="fax_number" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fax Number
                  </label>
                  <input
                    id="fax_number"
                    v-model="formData.fax_number"
                    type="tel"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <!-- GSM Number -->
                <div>
                  <label for="gsm_number" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    GSM/Mobile Number
                  </label>
                  <input
                    id="gsm_number"
                    v-model="formData.gsm_number"
                    type="tel"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <!-- Website URL -->
                <div>
                  <label for="http_url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Website URL
                  </label>
                  <input
                    id="http_url"
                    v-model="formData.http_url"
                    type="url"
                    placeholder="https://example.com"
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': errors.http_url }"
                  />
                  <p v-if="errors.http_url" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ errors.http_url }}
                  </p>
                </div>

                <!-- Active Status -->
                <div class="sm:col-span-2">
                  <div class="flex items-center">
                    <input
                      id="active"
                      v-model="formData.active"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label for="active" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Active client
                    </label>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Inactive clients will not appear in project creation dropdowns
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="submitError" class="mt-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                  Error saving client
                </h3>
                <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                  {{ submitError }}
                </p>
              </div>
            </div>
          </div>

           <!-- Form Actions -->
           <div class="mt-6 flex flex-col sm:flex-row sm:justify-between sm:space-x-3 sm:space-y-0 space-y-3 space-x-0">
             <button
               v-if="isEditing && client"
               type="button"
               @click="navigateToHolidays"
               class="inline-flex w-full sm:w-auto justify-center items-center rounded-md border border-purple-600 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 shadow-sm hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-purple-900/20 dark:border-purple-500 dark:text-purple-300 dark:hover:bg-purple-900/30"
             >
               <svg class="-ml-1 mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
               Manage Holidays
             </button>
             <div class="flex w-full sm:w-auto justify-end space-x-3">
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
                 {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Client' : 'Create Client') }}
               </button>
             </div>
           </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useClientsStore } from '@/stores/clients'
import type { Client, ClientCreateData, ClientUpdateData } from '@/types/client'

const router = useRouter()

// Props
interface Props {
  client?: Client | null
}

const props = withDefaults(defineProps<Props>(), {
  client: null
})

// Emits
const emit = defineEmits<{
  close: []
  saved: []
}>()

// Store
const clientsStore = useClientsStore()

// State
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

// Computed
const isEditing = computed(() => !!props.client)

// Form data
const formData = reactive<ClientCreateData & { id?: number }>({
  organisation: '',
  description: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  contactName: '',
  contactEmail: '',
  phone_number: '',
  fax_number: '',
  gsm_number: '',
  http_url: '',
  active: true
})

// Form errors
const errors = reactive({
  organisation: '',
  contactEmail: '',
  http_url: ''
})

// Watch for client changes to populate form
watch(() => props.client, (client) => {
  if (client) {
    Object.assign(formData, {
      id: client.id,
      organisation: client.organisation || '',
      description: client.description || '',
      address1: client.address1 || '',
      address2: client.address2 || '',
      city: client.city || '',
      state: client.state || '',
      country: client.country || '',
      postal_code: client.postal_code || '',
      contactName: client.contactName || '',
      contactEmail: client.contactEmail || '',
      phone_number: client.phone_number || '',
      fax_number: client.fax_number || '',
      gsm_number: client.gsm_number || '',
      http_url: client.http_url || '',
      active: client.active
    })
  } else {
    // Reset form for new client
    Object.assign(formData, {
      id: undefined,
      organisation: '',
      description: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      contactName: '',
      contactEmail: '',
      phone_number: '',
      fax_number: '',
      gsm_number: '',
      http_url: '',
      active: true
    })
  }
  
  // Clear errors when client changes
  clearErrors()
}, { immediate: true })

// Methods
const clearErrors = () => {
  errors.organisation = ''
  errors.contactEmail = ''
  errors.http_url = ''
  submitError.value = null
}

const validateForm = (): boolean => {
  clearErrors()
  let isValid = true

  // Required: Organisation
  if (!formData.organisation.trim()) {
    errors.organisation = 'Organisation is required'
    isValid = false
  }

  // Validate email format if provided
  if (formData.contactEmail && formData.contactEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.contactEmail.trim())) {
      errors.contactEmail = 'Please enter a valid email address'
      isValid = false
    }
  }

  // Validate URL format if provided
  if (formData.http_url && formData.http_url.trim()) {
    try {
      new URL(formData.http_url.trim())
    } catch {
      errors.http_url = 'Please enter a valid URL (including https://)'
      isValid = false
    }
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
    // Prepare data for submission (remove empty strings)
    const submitData: ClientCreateData | ClientUpdateData = {
      organisation: formData.organisation.trim(),
      description: formData.description?.trim() || undefined,
      address1: formData.address1?.trim() || undefined,
      address2: formData.address2?.trim() || undefined,
      city: formData.city?.trim() || undefined,
      state: formData.state?.trim() || undefined,
      country: formData.country?.trim() || undefined,
      postal_code: formData.postal_code?.trim() || undefined,
      contactName: formData.contactName?.trim() || undefined,
      contactEmail: formData.contactEmail?.trim() || undefined,
      phone_number: formData.phone_number?.trim() || undefined,
      fax_number: formData.fax_number?.trim() || undefined,
      gsm_number: formData.gsm_number?.trim() || undefined,
      http_url: formData.http_url?.trim() || undefined,
      active: formData.active
    }

    if (isEditing.value && props.client) {
      // Update existing client
      await clientsStore.updateClient(props.client.id, submitData)
    } else {
      // Create new client
      await clientsStore.createClient(submitData as ClientCreateData)
    }

    emit('saved')
  } catch (error) {
    console.error('Error saving client:', error)
    submitError.value = clientsStore.error || 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}

const navigateToHolidays = () => {
  if (props.client) {
    router.push(`/holidays/client/${props.client.id}`)
  }
}
</script>