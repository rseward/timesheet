<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
    data-testid="time-entry-modal"
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
            
            <!-- Pre-filled Values Note -->
            <div 
              v-if="!isEditing && (props.defaultClientId || props.defaultProjectId || props.defaultTaskId)" 
              class="mt-3 rounded-md bg-blue-50 dark:bg-blue-900/20 p-3"
            >
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-800 dark:text-blue-200">
                    Form pre-filled with selections from Time Tracking filters
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Smart Date Defaulting Info (Ticket #56) -->
            <div 
              v-if="!isEditing && smartDateInfo" 
              class="mt-3 rounded-md bg-green-50 dark:bg-green-900/20 p-3"
            >
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-green-800 dark:text-green-200">
                    Date auto-set to next available work day ({{ smartDateInfo.reason }})
                  </p>
                </div>
              </div>
            </div>

            <!-- Predictive Time Entry - Copy Week Offer (Ticket #57) -->
            <div 
              v-if="!isEditing && showCopyWeekOffer && copyWeekInfo && !copyWeekOfferAccepted"
              class="mt-3 rounded-md bg-purple-50 dark:bg-purple-900/20 p-4 border border-purple-200 dark:border-purple-800"
            >
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3 flex-1">
                  <h3 class="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Predictive Time Entry
                  </h3>
                  <p class="mt-1 text-sm text-purple-700 dark:text-purple-300">
                    This is a new week with no time entries. Would you like to copy hours from 
                    {{ formatDate(copyWeekInfo.previous_week_start) }}?
                  </p>
                  <p v-if="copyWeekInfo.holidays.length > 0" class="mt-1 text-xs text-purple-600 dark:text-purple-400">
                    Note: {{ copyWeekInfo.holidays.length }} holiday(s) detected in this week will be skipped.
                  </p>
                  <div class="mt-3 flex items-center space-x-3">
                    <button
                      type="button"
                      @click="acceptCopyWeek"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Yes, Copy Hours
                    </button>
                    <button
                      type="button"
                      @click="declineCopyWeek"
                      class="inline-flex items-center px-3 py-1.5 border border-purple-300 dark:border-purple-600 text-sm font-medium rounded-md text-purple-700 dark:text-purple-300 bg-white dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      No, Start Fresh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Copy Week Success Message -->
            <div 
              v-if="!isEditing && copyWeekResult"
              class="mt-3 rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800"
            >
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
                    {{ copyWeekResult.created_count }} Entries Copied
                  </h3>
                  <p class="mt-1 text-sm text-green-700 dark:text-green-300">
                    Hours have been copied from {{ formatDate(copyWeekResult.source_week_start) }} to this week.
                    <span v-if="copyWeekResult.skipped_count > 0" class="text-yellow-600 dark:text-yellow-400">
                      ({{ copyWeekResult.skipped_count }} holiday(s) skipped)
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
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
                  @change="onTaskChange"
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

              <!-- Holiday Warning -->
              <div v-if="isHolidayWarning" class="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-400 dark:text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v2a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Holiday Notice
                    </h3>
                    <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                      {{ holidayWarningMessage }}
                    </p>
                    <p class="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                      Time entry is disabled on holidays.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Date -->
              <div>
                <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-normal">(Auto-computed for new entries)</span>
                </label>
                <DatePicker
                  v-model="form.date"
                  input-id="date"
                  placeholder="Select date or type naturally (e.g., 'today', 'tomorrow', 'next monday')"
                  :required="true"
                  @change="validateDateField"
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
                  Transaction Number
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-normal">(Auto-populated when task is selected)</span>
                </label>
                <input
                  id="trans_num"
                  v-model="form.trans_num"
                  type="text"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Will be auto-populated when task is selected"
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
import { usePreferencesStore } from '@/stores/preferences'
import { useBillingEventsStore } from '@/stores/billingEvents'
import { useHolidaysStore } from '@/stores/holidays'
import DatePicker from '@/components/DatePicker.vue'
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
  defaultClientId?: string
  defaultProjectId?: string
  defaultTaskId?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'save', data: BillingEventCreateData | BillingEventUpdateData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Stores
const preferencesStore = usePreferencesStore()
const billingEventsStore = useBillingEventsStore()
const holidaysStore = useHolidaysStore()

const loading = ref(false)
const errors = ref<Record<string, string>>({})
const holidayCheckResult = ref<any>(null)
const checkingHoliday = ref(false)
const smartDateInfo = ref<{date: string, reason: string, iterations: number} | null>(null)

// Predictive Time Entry (Ticket #57)
const showCopyWeekOffer = ref(false)
const copyWeekInfo = ref<{
  week_start_date: string
  has_entries: boolean
  previous_week_entries: Array<{
    project_id: number
    task_id: number
    day_offset: number
    start_time: string
    end_time: string
    log_message: string | null
    trans_num: number
  }>
  previous_week_start: string
  holidays: Array<{
    date: string
    name: string
    is_federal: boolean
  }>
  can_copy: boolean
} | null>(null)
const copyWeekOfferAccepted = ref(false)
const copyWeekResult = ref<{
  success: boolean
  source_week_start: string
  target_week_start: string
  created_count: number
  skipped_count: number
} | null>(null)

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
  const hasHoliday = holidayCheckResult.value && holidayCheckResult.value.is_holiday
  return form.value.client_id &&
         form.value.project_id &&
         form.value.task_id &&
         form.value.date &&
         form.value.start_time &&
         form.value.end_time &&
         calculatedHours.value > 0 &&
         !hasHoliday
})

const isHolidayWarning = computed(() => {
  return holidayCheckResult.value && holidayCheckResult.value.is_holiday
})

const holidayWarningMessage = computed(() => {
  if (!isHolidayWarning.value) return null
  return holidayCheckResult.value.message
})

const computeSmartDefaultDate = async () => {
  try {
    const timekeeperId = 1 // TODO: Get from auth context
    const clientId = props.defaultClientId ? parseInt(props.defaultClientId) : null
    const projectId = props.defaultProjectId ? parseInt(props.defaultProjectId) : null
    
    console.log('[TimeEntryModal] Computing smart default date:', {
      timekeeperId,
      clientId,
      projectId
    })
    
    const api = await import('@/services/api')
    const response = await api.default.get<{
      date: string
      reason: string
      iterations: number
    }>('/time-entry/next-date', {
      params: {
        timekeeper_id: timekeeperId,
        client_id: clientId,
        project_id: projectId
      }
    })

    if (response && response.date) {
      smartDateInfo.value = {
        date: response.date,
        reason: response.reason,
        iterations: response.iterations
      }
      console.log('[TimeEntryModal] Smart date computed:', smartDateInfo.value)
      return response.date
    }
  } catch (error) {
    console.warn('[TimeEntryModal] Failed to compute smart date, using today:', error)
  }
  
  return new Date().toISOString().split('T')[0]
}

const initializeForm = async () => {
  console.log('[TimeEntryModal] initializeForm called')
  console.log('[TimeEntryModal] Props.clients:', props.clients?.length || 0, 'clients available')
  if (props.clients?.length) {
    console.log('[TimeEntryModal] Client names:', props.clients.map(c => c.organisation))
  }
  
  // Load user preferences to get the latest default working hours
  if (!props.timeEntry) {
    try {
      await preferencesStore.fetchPreferences()
      console.log('[TimeEntryModal] Preferences loaded for default times')
    } catch (error) {
      console.warn('[TimeEntryModal] Failed to load preferences, using fallback defaults:', error)
    }
  }
  
  if (props.timeEntry) {
    // Edit mode - populate form with existing data
    const entry = props.timeEntry
    
    // Parse datetime strings directly to avoid timezone conversion
    const startDateTime = entry.start_time // Assume backend sends in format: YYYY-MM-DDTHH:MM:SS
    const endDateTime = entry.end_time
    
    // Extract date and time parts from the datetime strings
    const datepart = startDateTime.split('T')[0]  // YYYY-MM-DD
    const startTimepart = startDateTime.split('T')[1].slice(0, 5)  // HH:MM
    const endTimepart = endDateTime.split('T')[1].slice(0, 5)  // HH:MM
    
    console.log('[TimeEntryModal] Edit mode - parsing times without timezone conversion:', {
      original_start: entry.start_time,
      original_end: entry.end_time,
      parsed_date: datepart,
      parsed_start_time: startTimepart,
      parsed_end_time: endTimepart
    })
    
    // Find client_id from project relationship
    const project = props.projects.find(p => p.project_id === entry.project_id)
    
    form.value = {
      client_id: project?.client_id?.toString() || '',
      project_id: entry.project_id,
      task_id: entry.task_id,
      timekeeper_id: entry.timekeeper_id,
      date: datepart,
      start_time: startTimepart,
      end_time: endTimepart,
      trans_num: entry.trans_num || '',
      log_message: entry.log_message || '',
      active: entry.active
    }
  } else {
    // Add mode - compute smart default date (Ticket #56)
    console.log('[TimeEntryModal] Initializing new entry with smart date defaulting')
    
    // Get default working hours from user preferences
    const defaultStartTime = preferencesStore.defaultStartTime || '09:00'
    const defaultEndTime = preferencesStore.defaultEndTime || '17:00'
    
    // Compute next available date using smart algorithm
    const smartDate = await computeSmartDefaultDate()
    
    console.log('[TimeEntryModal] Initializing new entry with filter defaults:', {
      clientId: props.defaultClientId,
      projectId: props.defaultProjectId, 
      taskId: props.defaultTaskId,
      smartDate
    })
    
    console.log('[TimeEntryModal] Using default working hours from preferences:', {
      startTime: defaultStartTime,
      endTime: defaultEndTime
    })
    
    form.value = {
      client_id: props.defaultClientId || '',
      project_id: props.defaultProjectId ? parseInt(props.defaultProjectId) : 0,
      task_id: props.defaultTaskId ? parseInt(props.defaultTaskId) : 0,
      timekeeper_id: 1,
      date: smartDate,
      start_time: defaultStartTime,
      end_time: defaultEndTime,
      trans_num: '',
      log_message: '',
      active: true
    }
    
    console.log('[TimeEntryModal] Form initialized with values:', {
      client_id: form.value.client_id,
      project_id: form.value.project_id,
      task_id: form.value.task_id,
      date: form.value.date
    })
    
    // Fetch transaction number if not already set and all required fields are present
    if (!form.value.trans_num && form.value.project_id && form.value.task_id) {
      console.log('[TimeEntryModal] Auto-fetching transaction number for new entry')
      await fetchNextTransactionNumber()
    }

    // Check if we should offer to copy from previous week (Ticket #57)
    // Only check for new entries in a week that has no entries
    const weekStart = getWeekStart(smartDate)
    await checkWeekForCopyOffer(weekStart)
  }
  errors.value = {}
}

const onClientChange = () => {
  form.value.project_id = 0
  form.value.task_id = 0
  errors.value.client_id = ''
}

const onProjectChange = async () => {
  form.value.task_id = 0
  form.value.trans_num = '' // Clear transaction number when project changes
  errors.value.project_id = ''
}

const onTaskChange = async () => {
  console.log('[TimeEntryModal] Task changed to:', form.value.task_id)
  errors.value.task_id = ''
  
  // Fetch next transaction number when task is selected
  if (form.value.task_id && form.value.project_id) {
    await fetchNextTransactionNumber()
  }
}

const fetchNextTransactionNumber = async () => {
  try {
    console.log('[TimeEntryModal] Fetching next transaction number for:', {
      timekeeperId: form.value.timekeeper_id,
      projectId: form.value.project_id,
      taskId: form.value.task_id
    })
    
    const nextTransNum = await billingEventsStore.getNextTransactionNumber(
      form.value.timekeeper_id,
      form.value.project_id,
      form.value.task_id
    )
    
    console.log('[TimeEntryModal] Next transaction number received:', nextTransNum)
    form.value.trans_num = nextTransNum.toString()
    
  } catch (error) {
    console.error('[TimeEntryModal] Error fetching next transaction number:', error)
    // Don't clear the field on error - user can manually enter if needed
  }
}

const validateDateField = (dateValue: string) => {
  console.log('[TimeEntryModal] Date changed to:', dateValue)
  if (dateValue) {
    errors.value.date = ''
  }
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
    // Compare times as strings to avoid timezone issues
    const startTimeString = `${form.value.date}T${form.value.start_time}`
    const endTimeString = `${form.value.date}T${form.value.end_time}`
    
    if (endTimeString <= startTimeString) {
      errors.value.end_time = 'End time must be after start time'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // Create datetime strings in local time without timezone conversion
    const startDateTimeString = `${form.value.date}T${form.value.start_time}:00`
    const endDateTimeString = `${form.value.date}T${form.value.end_time}:00`
    
    console.log('[TimeEntryModal] Submitting with local times:', {
      start_time: startDateTimeString,
      end_time: endDateTimeString
    })
    
    const data = {
      ...(props.timeEntry ? { uid: props.timeEntry.uid } : {}), // Include uid for updates
      project_id: form.value.project_id,
      task_id: form.value.task_id,
      timekeeper_id: form.value.timekeeper_id,
      start_time: startDateTimeString,
      end_time: endDateTimeString,
      trans_num: form.value.trans_num || undefined,
      log_message: form.value.log_message || undefined,
      active: form.value.active
    }
    
    // Log key values being sent to endpoint
    const isEditMode = !!props.timeEntry
    console.log(`[TimeEntryModal] ${isEditMode ? 'UPDATE' : 'CREATE'} - Submitting data to endpoint:`, {
      mode: isEditMode ? 'EDIT' : 'ADD',
      uid: data.uid || 'NOT_SET',
      project_id: data.project_id,
      task_id: data.task_id,
      timekeeper_id: data.timekeeper_id,
      start_time: data.start_time,
      end_time: data.end_time,
      trans_num: data.trans_num,
      original_entry_uid: props.timeEntry?.uid || 'N/A',
      data_has_uid: 'uid' in data,
      full_data: data
    })
    
    emit('save', data)
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    loading.value = false
  }
}

// Watch for prop changes to reinitialize form
watch(() => [props.isOpen, props.timeEntry], async () => {
  if (props.isOpen) {
    await initializeForm()
  }
}, { immediate: true })

// Watch for clients prop changes
watch(() => props.clients, (newClients) => {
  console.log('[TimeEntryModal] Clients prop changed:', newClients?.length || 0, 'clients')
  if (newClients?.length) {
    console.log('[TimeEntryModal] New client names:', newClients.map(c => c.organisation))
  }
}, { immediate: true })

// Watch for date and client changes to check for holidays
watch([() => form.value.date, () => form.value.client_id], async ([newDate, newClientId]) => {
  if (newDate && newClientId) {
    await checkHolidayForDate(newDate, parseInt(newClientId))
  } else {
    holidayCheckResult.value = null
  }
})

const checkHolidayForDate = async (date: string, clientId: number) => {
  checkingHoliday.value = true
  try {
    const result = await holidaysStore.checkDateIsHoliday(clientId, date)
    holidayCheckResult.value = result
    if (result.is_holiday) {
      console.log('[TimeEntryModal] Holiday detected:', result)
    }
  } catch (error) {
    console.error('[TimeEntryModal] Error checking holiday:', error)
    holidayCheckResult.value = null
  } finally {
    checkingHoliday.value = false
  }
}

// Predictive Time Entry functions (Ticket #57)
const getWeekStart = (dateString: string): string => {
  const date = new Date(dateString)
  const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
  // Calculate days to subtract to get to Monday
  // If dayOfWeek is 0 (Sunday), subtract 6 days
  // If dayOfWeek is 1 (Monday), subtract 0 days
  // If dayOfWeek is 2 (Tuesday), subtract 1 day, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(date)
  monday.setDate(date.getDate() - daysToSubtract)
  return monday.toISOString().split('T')[0]
}

const checkWeekForCopyOffer = async (weekStartDate: string) => {
  try {
    const timekeeperId = 1 // TODO: Get from auth context
    
    console.log('[TimeEntryModal] Checking week for copy offer:', weekStartDate)
    
    const weekInfo = await billingEventsStore.getWeekInfo(timekeeperId, weekStartDate)
    console.log('[TimeEntryModal] Week info received:', weekInfo)
    
    // Only show offer if:
    // 1. Week has no entries (has_entries = false)
    // 2. Previous week has entries to copy (can_copy = true)
    if (!weekInfo.has_entries && weekInfo.can_copy) {
      copyWeekInfo.value = weekInfo
      showCopyWeekOffer.value = true
      console.log('[TimeEntryModal] Showing copy week offer')
    } else {
      console.log('[TimeEntryModal] Not showing copy week offer:', {
        hasEntries: weekInfo.has_entries,
        canCopy: weekInfo.can_copy
      })
    }
  } catch (error) {
    console.warn('[TimeEntryModal] Failed to check week for copy offer:', error)
  }
}

const acceptCopyWeek = async () => {
  if (!copyWeekInfo.value) return
  
  loading.value = true
  try {
    const timekeeperId = 1 // TODO: Get from auth context
    const sourceWeek = copyWeekInfo.value.previous_week_start
    const targetWeek = copyWeekInfo.value.week_start_date
    
    console.log('[TimeEntryModal] Accepting copy week offer:', { sourceWeek, targetWeek })
    
    const result = await billingEventsStore.copyWeekEntries(
      timekeeperId,
      sourceWeek,
      targetWeek
    )
    
    console.log('[TimeEntryModal] Copy week result:', result)
    
    if (result.success) {
      copyWeekResult.value = result
      copyWeekOfferAccepted.value = true
      showCopyWeekOffer.value = false
      console.log('[TimeEntryModal] Successfully copied', result.created_count, 'entries')
    }
  } catch (error) {
    console.error('[TimeEntryModal] Error copying week entries:', error)
  } finally {
    loading.value = false
  }
}

const declineCopyWeek = () => {
  showCopyWeekOffer.value = false
  copyWeekOfferAccepted.value = true
  console.log('[TimeEntryModal] Declined copy week offer')
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

onMounted(async () => {
  if (props.isOpen) {
    await initializeForm()
  }
})
</script>
