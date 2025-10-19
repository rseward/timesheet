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
        @click="$emit('close')"
      ></div>

      <!-- Modal container -->
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
      
      <div class="relative inline-block transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
        <div class="absolute top-0 right-0 pt-4 pr-4">
          <button
            type="button"
            class="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            @click="$emit('close')"
          >
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="sm:flex sm:items-start">
          <div class="mt-3 w-full text-center sm:mt-0 sm:text-left">
            <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
              {{ isEditing ? 'Edit Time Entry' : 'Add Time Entry' }}
            </h3>
            
            <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
              <!-- Client Selection -->
              <div>
                <label for="client" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client
                </label>
                <select
                  id="client"
                  v-model="form.client_id"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-base text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  @change="onClientChange"
                  required
                >
                  <option value="">Select a client</option>
                  <option
                    v-for="client in clients"
                    :key="client.id"
                    :value="client.id"
                  >
                    {{ client.organisation }}
                  </option>
                </select>
                <p v-if="errors.client_id" class="mt-1 text-sm text-red-600">{{ errors.client_id }}</p>
              </div>

              <!-- Project Selection -->
              <div>
                <label for="project" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project
                </label>
                <select
                  id="project"
                  v-model="form.project_id"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-base text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  @change="onProjectChange"
                  :disabled="!form.client_id"
                  required
                >
                  <option value="">Select a project</option>
                  <option
                    v-for="project in filteredProjects"
                    :key="project.project_id"
                    :value="project.project_id"
                  >
                    {{ project.title }}
                  </option>
                </select>
                <p v-if="errors.project_id" class="mt-1 text-sm text-red-600">{{ errors.project_id }}</p>
              </div>

              <!-- Task Selection -->
              <div>
                <label for="task" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Task
                </label>
                <select
                  id="task"
                  v-model="form.task_id"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-base text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  :disabled="!form.project_id"
                  required
                >
                  <option value="">Select a task</option>
                  <option
                    v-for="task in filteredTasks"
                    :key="task.task_id"
                    :value="task.task_id"
                  >
                    {{ task.name }}
                  </option>
                </select>
                <p v-if="errors.task_id" class="mt-1 text-sm text-red-600">{{ errors.task_id }}</p>
              </div>

              <!-- Date -->
              <div>
                <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <input
                  id="date"
                  v-model="form.date"
                  type="date"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <p v-if="errors.date" class="mt-1 text-sm text-red-600">{{ errors.date }}</p>
              </div>

              <!-- Time Range -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="start_time" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Time
                  </label>
                  <input
                    id="start_time"
                    v-model="form.start_time"
                    type="time"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                  <p v-if="errors.start_time" class="mt-1 text-sm text-red-600">{{ errors.start_time }}</p>
                </div>

                <div>
                  <label for="end_time" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Time
                  </label>
                  <input
                    id="end_time"
                    v-model="form.end_time"
                    type="time"
                    class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                  <p v-if="errors.end_time" class="mt-1 text-sm text-red-600">{{ errors.end_time }}</p>
                </div>
              </div>

              <!-- Calculated Hours Display -->
              <div v-if="calculatedHours > 0" class="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Total Hours: {{ calculatedHours.toFixed(2) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Transaction Number -->
              <div>
                <label for="trans_num" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transaction Number (Optional)
                </label>
                <input
                  id="trans_num"
                  v-model="form.trans_num"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter transaction number"
                />
              </div>

              <!-- Log Message -->
              <div>
                <label for="log_message" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="log_message"
                  v-model="form.log_message"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe the work performed..."
                ></textarea>
              </div>

              <!-- Action Buttons -->
              <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="submit"
                  :disabled="loading || !isFormValid"
                  class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed sm:col-start-2 sm:text-sm"
                >
                  <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ loading ? 'Saving...' : isEditing ? 'Update' : 'Save' }}
                </button>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                  @click="$emit('close')"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { BillingEvent, BillingEventCreateData, BillingEventUpdateData } from '@/types/billingEvent'
import type { Client } from '@/types/client'
import type { Project } from '@/types/project'
import type { Task } from '@/types/task'

interface Props {
  isOpen: boolean
  timeEntry?: BillingEvent | null
  clients: Client[]
  projects: Project[]
  tasks: Task[]
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: BillingEventCreateData | BillingEventUpdateData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref({
  client_id: '',
  project_id: 0,
  task_id: 0,
  timekeeper_id: 1, // Default timekeeper
  date: '',
  start_time: '',
  end_time: '',
  trans_num: '',
  log_message: '',
  active: true
})

const isEditing = computed(() => !!props.timeEntry)

const filteredProjects = computed(() => {
  if (!form.value.client_id) return []
  return props.projects.filter(project => project.client_id === parseInt(form.value.client_id))
})

const filteredTasks = computed(() => {
  if (!form.value.project_id) return []
  return props.tasks.filter(task => task.project_id === form.value.project_id)
})

const calculatedHours = computed(() => {
  if (!form.value.date || !form.value.start_time || !form.value.end_time) return 0
  
  const startDateTime = new Date(`${form.value.date}T${form.value.start_time}`)
  const endDateTime = new Date(`${form.value.date}T${form.value.end_time}`)
  
  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) return 0
  if (endDateTime <= startDateTime) return 0
  
  const diffMs = endDateTime.getTime() - startDateTime.getTime()
  return diffMs / (1000 * 60 * 60) // Convert to hours
})

const isFormValid = computed(() => {
  return form.value.client_id &&
         form.value.project_id &&
         form.value.task_id &&
         form.value.date &&
         form.value.start_time &&
         form.value.end_time &&
         calculatedHours.value > 0
})

const initializeForm = () => {
  console.log('[TimeEntryModal] initializeForm called')
  console.log('[TimeEntryModal] Props.clients:', props.clients?.length || 0, 'clients available')
  if (props.clients?.length) {
    console.log('[TimeEntryModal] Client names:', props.clients.map(c => c.organisation))
  }
  
  if (props.timeEntry) {
    // Edit mode - populate form with existing data
    const entry = props.timeEntry
    const startDate = new Date(entry.start_time)
    const endDate = new Date(entry.end_time)
    
    // Find client_id from project relationship
    const project = props.projects.find(p => p.project_id === entry.project_id)
    
    form.value = {
      client_id: project?.client_id?.toString() || '',
      project_id: entry.project_id,
      task_id: entry.task_id,
      timekeeper_id: entry.timekeeper_id,
      date: startDate.toISOString().split('T')[0],
      start_time: startDate.toTimeString().slice(0, 5),
      end_time: endDate.toTimeString().slice(0, 5),
      trans_num: entry.trans_num || '',
      log_message: entry.log_message || '',
      active: entry.active
    }
  } else {
    // Add mode - reset form with defaults
    const today = new Date().toISOString().split('T')[0]
    form.value = {
      client_id: '',
      project_id: 0,
      task_id: 0,
      timekeeper_id: 1,
      date: today,
      start_time: '09:00',
      end_time: '17:00',
      trans_num: '',
      log_message: '',
      active: true
    }
  }
  errors.value = {}
}

const onClientChange = () => {
  form.value.project_id = 0
  form.value.task_id = 0
  errors.value.client_id = ''
}

const onProjectChange = () => {
  form.value.task_id = 0
  errors.value.project_id = ''
}

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!form.value.client_id) {
    errors.value.client_id = 'Client is required'
  }
  
  if (!form.value.project_id) {
    errors.value.project_id = 'Project is required'
  }
  
  if (!form.value.task_id) {
    errors.value.task_id = 'Task is required'
  }
  
  if (!form.value.date) {
    errors.value.date = 'Date is required'
  }
  
  if (!form.value.start_time) {
    errors.value.start_time = 'Start time is required'
  }
  
  if (!form.value.end_time) {
    errors.value.end_time = 'End time is required'
  }
  
  if (form.value.start_time && form.value.end_time) {
    const startTime = new Date(`${form.value.date}T${form.value.start_time}`)
    const endTime = new Date(`${form.value.date}T${form.value.end_time}`)
    
    if (endTime <= startTime) {
      errors.value.end_time = 'End time must be after start time'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    const startDateTime = new Date(`${form.value.date}T${form.value.start_time}`)
    const endDateTime = new Date(`${form.value.date}T${form.value.end_time}`)
    
    const data = {
      project_id: form.value.project_id,
      task_id: form.value.task_id,
      timekeeper_id: form.value.timekeeper_id,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      trans_num: form.value.trans_num || undefined,
      log_message: form.value.log_message || undefined,
      active: form.value.active
    }
    
    emit('save', data)
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    loading.value = false
  }
}

// Watch for prop changes to reinitialize form
watch(() => [props.isOpen, props.timeEntry], () => {
  if (props.isOpen) {
    initializeForm()
  }
}, { immediate: true })

// Watch for clients prop changes
watch(() => props.clients, (newClients) => {
  console.log('[TimeEntryModal] Clients prop changed:', newClients?.length || 0, 'clients')
  if (newClients?.length) {
    console.log('[TimeEntryModal] New client names:', newClients.map(c => c.organisation))
  }
}, { immediate: true })

onMounted(() => {
  if (props.isOpen) {
    initializeForm()
  }
})
</script>