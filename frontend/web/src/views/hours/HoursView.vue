<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- App Header with Profile Navigation -->
    <AppHeader />
    
    <div class="py-10">
      <header>
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                Time Tracking
              </h1>
              <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Track your work hours and manage time entries.
              </p>
            </div>
            <router-link
              to="/dashboard"
              class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </router-link>
          </div>
        </div>
      </header>
      
      <main>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <!-- Filter Controls -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
              <div class="px-6 py-4">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Filter Time Entries
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <!-- Client Filter -->
                  <div>
                    <label for="clientFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Client
                    </label>
                    <select
                      id="clientFilter"
                      v-model="filters.clientId"
                      @change="onClientChange"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="">All Clients</option>
                      <option v-for="client in clients" :key="client.id" :value="client.id">
                        {{ client.organisation }}
                      </option>
                    </select>
                  </div>

                  <!-- Project Filter -->
                  <div>
                    <label for="projectFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project
                    </label>
                    <select
                      id="projectFilter"
                      v-model="filters.projectId"
                      @change="onProjectChange"
                      :disabled="!filteredProjects.length"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm disabled:opacity-50"
                    >
                      <option value="">All Projects</option>
                      <option v-for="project in filteredProjects" :key="project.project_id" :value="project.project_id">
                        {{ project.title }}
                      </option>
                    </select>
                  </div>

                  <!-- Task Filter -->
                  <div>
                    <label for="taskFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Task
                    </label>
                    <select
                      id="taskFilter"
                      v-model="filters.taskId"
                      :disabled="!filteredTasks.length"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm disabled:opacity-50"
                    >
                      <option value="">All Tasks</option>
                      <option v-for="task in filteredTasks" :key="task.task_id" :value="task.task_id">
                        {{ task.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Date Range -->
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start Date
                      </label>
                      <input
                        id="startDate"
                        v-model="filters.startDate"
                        type="date"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        End Date
                      </label>
                      <input
                        id="endDate"
                        v-model="filters.endDate"
                        type="date"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                </div>

                <!-- Filter Actions -->
                <div class="mt-4 flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <button
                      @click="applyFilters"
                      :disabled="isLoading"
                      class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                      </svg>
                      Apply Filters
                    </button>
                    
                    <button
                      @click="clearFilters"
                      class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear Filters
                    </button>
                  </div>

                  <button
                    @click="showAddTimeEntry = true"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Time Entry
                  </button>
                </div>
              </div>
            </div>

            <!-- Total Hours Display -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
              <div class="px-6 py-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                      Total Hours
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ dateRangeText }}
                    </p>
                  </div>
                  <div class="text-right">
                    <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {{ totalHours.toFixed(2) }}
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      hours ({{ billingEvents.length }} entries)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Time Entries Table -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  Time Entries
                </h3>
              </div>

              <!-- Loading State -->
              <div v-if="isLoading" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="px-6 py-8">
                <div class="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
                        Error loading time entries
                      </h3>
                      <div class="mt-1 text-sm text-red-700 dark:text-red-400">
                        {{ error }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else-if="billingEvents.length === 0" class="px-6 py-8 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No time entries</h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating your first time entry.
                </p>
                <div class="mt-6">
                  <button
                    @click="showAddTimeEntry = true"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Time Entry
                  </button>
                </div>
              </div>

              <!-- Time Entries Data Table -->
              <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Project / Task
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Trans #
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Hours
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Time Period
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="entry in billingEvents" :key="entry.uid" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ entry.project_name || `Project ${entry.project_id}` }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                          {{ entry.task_name || `Task ${entry.task_id}` }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ entry.trans_num || '-' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ calculateHours(entry.start_time, entry.end_time).toFixed(2) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900 dark:text-white">
                          {{ formatTime(entry.start_time) }} - {{ formatTime(entry.end_time) }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                          {{ formatDate(entry.start_time) }}
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {{ entry.log_message || '-' }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center space-x-2">
                          <button
                            @click="editTimeEntry(entry)"
                            class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            @click="deleteTimeEntry(entry)"
                            class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Add/Edit Time Entry Modal -->
    <TimeEntryModal
      v-if="showAddTimeEntry || showEditTimeEntry"
      :is-open="showAddTimeEntry || showEditTimeEntry"
      :time-entry="editingTimeEntry"
      :clients="clients"
      :projects="projects"
      :tasks="tasks"
      @close="closeTimeEntryModal"
      @save="handleTimeEntrySave"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      v-if="showDeleteModal"
      :is-open="showDeleteModal"
      title="Delete Time Entry"
      :message="`Are you sure you want to delete this time entry? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      confirm-variant="danger"
      @confirm="handleDeleteConfirm"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useBillingEventsStore } from '@/stores/billingEvents'
import { useClientsStore } from '@/stores/clients'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import type { BillingEvent, BillingEventCreateData, BillingEventUpdateData } from '@/types/billingEvent'
import AppHeader from '@/components/layout/AppHeader.vue'
import TimeEntryModal from '@/components/TimeEntryModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

// Stores
const billingEventsStore = useBillingEventsStore()
const clientsStore = useClientsStore()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()

// State
const isLoading = ref(false)
const error = ref<string | null>(null)
const showAddTimeEntry = ref(false)
const showEditTimeEntry = ref(false)
const showDeleteModal = ref(false)
const editingTimeEntry = ref<BillingEvent | null>(null)
const deletingTimeEntry = ref<BillingEvent | null>(null)

// Filters
const filters = reactive({
  clientId: '',
  projectId: '',
  taskId: '',
  startDate: '',
  endDate: ''
})

// Computed
const clients = computed(() => clientsStore.clients)
const projects = computed(() => projectsStore.projects)
const tasks = computed(() => tasksStore.tasks)
const billingEvents = computed(() => billingEventsStore.billingEvents)

const filteredProjects = computed(() => {
  if (!filters.clientId) return projects.value
  return projects.value.filter(p => p.client_id === parseInt(filters.clientId))
})

const filteredTasks = computed(() => {
  if (!filters.projectId) return tasks.value
  return tasks.value.filter(t => t.project_id === parseInt(filters.projectId))
})

const totalHours = computed(() => {
  return billingEvents.value.reduce((total, entry) => {
    return total + calculateHours(entry.start_time, entry.end_time)
  }, 0)
})

const dateRangeText = computed(() => {
  if (filters.startDate && filters.endDate) {
    return `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`
  } else if (filters.startDate) {
    return `From ${formatDate(filters.startDate)}`
  } else if (filters.endDate) {
    return `Until ${formatDate(filters.endDate)}`
  }
  return 'All time'
})

// Methods
const loadData = async () => {
  isLoading.value = true
  error.value = null

  try {
    await Promise.all([
      clientsStore.fetchClients(),
      projectsStore.fetchProjects(),
      tasksStore.fetchTasks(),
      applyFilters()
    ])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load data'
  } finally {
    isLoading.value = false
  }
}

const applyFilters = async () => {
  isLoading.value = true
  error.value = null

  try {
    const filterParams: any = {}
    
    if (filters.clientId) filterParams.clientId = parseInt(filters.clientId)
    if (filters.projectId) filterParams.projectId = parseInt(filters.projectId)
    if (filters.taskId) filterParams.taskId = parseInt(filters.taskId)
    if (filters.startDate) filterParams.startDate = filters.startDate
    if (filters.endDate) filterParams.endDate = filters.endDate

    await billingEventsStore.fetchBillingEvents(filterParams)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to apply filters'
  } finally {
    isLoading.value = false
  }
}

const clearFilters = () => {
  filters.clientId = ''
  filters.projectId = ''
  filters.taskId = ''
  filters.startDate = ''
  filters.endDate = ''
  applyFilters()
}

const onClientChange = () => {
  filters.projectId = ''
  filters.taskId = ''
}

const onProjectChange = () => {
  filters.taskId = ''
}

const calculateHours = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0
  
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  
  const diffMs = end.getTime() - start.getTime()
  return diffMs / (1000 * 60 * 60) // Convert to hours
}

const formatTime = (timeString: string): string => {
  if (!timeString) return ''
  
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return timeString
  }
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

const editTimeEntry = (entry: BillingEvent) => {
  editingTimeEntry.value = { ...entry }
  showEditTimeEntry.value = true
}

const deleteTimeEntry = (entry: BillingEvent) => {
  deletingTimeEntry.value = entry
  showDeleteModal.value = true
}

const closeTimeEntryModal = () => {
  showAddTimeEntry.value = false
  showEditTimeEntry.value = false
  editingTimeEntry.value = null
}

const handleTimeEntrySave = async (data: BillingEventCreateData | BillingEventUpdateData) => {
  try {
    if (editingTimeEntry.value) {
      // Update existing entry
      await billingEventsStore.updateBillingEvent(parseInt(editingTimeEntry.value.uid), data as BillingEventUpdateData)
    } else {
      // Create new entry
      await billingEventsStore.createBillingEvent(data as BillingEventCreateData)
    }
    
    closeTimeEntryModal()
    await applyFilters() // Refresh the list
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save time entry'
  }
}

const handleDeleteConfirm = async () => {
  if (!deletingTimeEntry.value) return

  try {
    await billingEventsStore.deleteBillingEvent(parseInt(deletingTimeEntry.value.uid))
    showDeleteModal.value = false
    deletingTimeEntry.value = null
    await applyFilters() // Refresh the list
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete time entry'
  }
}

// Set default date range (current week)
const setDefaultDateRange = () => {
  const today = new Date()
  const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
  const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
  
  filters.startDate = firstDayOfWeek.toISOString().split('T')[0]
  filters.endDate = lastDayOfWeek.toISOString().split('T')[0]
}

// Lifecycle
onMounted(async () => {
  setDefaultDateRange()
  await loadData()
})

// Watch for filter changes
watch(
  () => [filters.startDate, filters.endDate],
  () => {
    if (filters.startDate && filters.endDate) {
      applyFilters()
    }
  }
)
</script>