<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- App Header with Profile Navigation -->
    <AppHeader />
    
    <div class="py-6">
      <main>
        <div class="w-[90%] mx-auto px-4">
          <div class="px-4 py-4 sm:px-0">
            <!-- Filter Controls -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-4">
              <div class="px-6 py-4">
                <!-- Filter Header with Action Buttons -->
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-lg font-medium text-gray-900 dark:text-white">
                    Filter Time Entries
                  </h2>

                  <!-- Action Buttons -->
                  <div class="flex items-center space-x-3">
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
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <!-- Client Filter -->
                  <div>
                    <label for="clientFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Client ({{ clients?.length || 0 }} available)
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
                    <!-- Debug info -->
                    <div v-if="clients?.length === 0" class="mt-1 text-xs text-red-500">
                      No clients loaded
                    </div>
                    <div v-else-if="error" class="mt-1 text-xs text-red-500">
                      Error: {{ error }}
                    </div>
                  </div>

                  <!-- Project Filter -->
                  <div>
                    <label for="projectFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project ({{ filteredProjects?.length || 0 }} available)
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
                    <!-- Debug info -->
                    <div v-if="filters.clientId && filteredProjects?.length === 0" class="mt-1 text-xs text-yellow-600">
                      No projects found for selected client
                    </div>
                  </div>

                  <!-- Task Filter -->
                  <div>
                    <label for="taskFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Task ({{ filteredTasks?.length || 0 }} available)
                    </label>
                    <select
                      id="taskFilter"
                      v-model="filters.taskId"
                      @change="onTaskChange"
                      :disabled="!filteredTasks.length"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm disabled:opacity-50"
                    >
                      <option value="">All Tasks</option>
                      <option v-for="task in filteredTasks" :key="task.task_id" :value="task.task_id">
                        {{ task.name }}
                      </option>
                    </select>
                    <!-- Debug info -->
                    <div v-if="filters.projectId && filteredTasks?.length === 0" class="mt-1 text-xs text-yellow-600">
                      No tasks found for selected project
                    </div>
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
              </div>
            </div>

            <!-- Time Entries Table -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-4">

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

            <!-- Total Hours Display - Moved Below Table -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
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
      :default-client-id="filters.clientId"
      :default-project-id="filters.projectId"
      :default-task-id="filters.taskId"
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
const clients = computed(() => {
  console.log('[HoursView] Computing clients:', clientsStore.clients?.length || 0, 'clients available')
  if (clientsStore.clients?.length) {
    console.log('[HoursView] Client names:', clientsStore.clients.map(c => c.organisation))
  }
  return clientsStore.clients
})
const projects = computed(() => {
  console.log('[HoursView] Computing projects from store:', projectsStore.projects)
  console.log('[HoursView] Store projects type:', typeof projectsStore.projects, 'Array:', Array.isArray(projectsStore.projects))
  
  // Ensure we always return an array
  const projectsData = projectsStore.projects
  if (Array.isArray(projectsData)) {
    return projectsData
  }
  
  console.warn('[HoursView] Store projects is not an array, returning empty array:', projectsData)
  return []
})

const tasks = computed(() => {
  console.log('[HoursView] Computing tasks from store:', tasksStore.tasks)
  console.log('[HoursView] Store tasks type:', typeof tasksStore.tasks, 'Array:', Array.isArray(tasksStore.tasks))
  
  // Ensure we always return an array
  const tasksData = tasksStore.tasks
  if (Array.isArray(tasksData)) {
    return tasksData
  }
  
  console.warn('[HoursView] Store tasks is not an array, returning empty array:', tasksData)
  return []
})
const billingEvents = computed(() => {
  console.log('[HoursView] Computing billingEvents from store:', billingEventsStore.billingEvents)
  console.log('[HoursView] Store billingEvents type:', typeof billingEventsStore.billingEvents, 'Array:', Array.isArray(billingEventsStore.billingEvents))
  
  // Ensure we always return an array
  let events = billingEventsStore.billingEvents
  if (!Array.isArray(events)) {
    console.warn('[HoursView] Store billingEvents is not an array, returning empty array:', events)
    return []
  }
  
  // Apply client-side task filtering (backend doesn't support task_id filtering)
  if (filters.taskId) {
    const taskId = parseInt(filters.taskId)
    console.log('[HoursView] Applying client-side task filtering for taskId:', taskId)
    
    const originalCount = events.length
    events = events.filter(event => {
      const matches = event.task_id === taskId
      if (!matches) {
        console.log(`[HoursView] Filtering out event ${event.uid} - task_id ${event.task_id} !== ${taskId}`)
      }
      return matches
    })
    
    console.log(`[HoursView] Client-side task filtering: ${originalCount} → ${events.length} events`)
  }
  
  return events
})

const filteredProjects = computed(() => {
  console.log('[HoursView] Computing filteredProjects for clientId:', filters.clientId)
  console.log('[HoursView] Available projects:', projects.value?.length || 0)
  
  if (!filters.clientId || filters.clientId === '') {
    console.log('[HoursView] No client selected, returning all projects')
    return projects.value
  }
  
  const clientId = parseInt(filters.clientId)
  console.log('[HoursView] Filtering projects for clientId:', clientId)
  
  const filtered = projects.value.filter(p => {
    console.log(`[HoursView] Project "${p.title}" (ID: ${p.project_id}) belongs to client ${p.client_id}, matches: ${p.client_id === clientId}`)
    return p.client_id === clientId
  })
  
  console.log('[HoursView] Filtered projects result:', filtered.length, 'projects for client', clientId)
  if (filtered.length) {
    console.log('[HoursView] Filtered project names:', filtered.map(p => p.title))
  }
  
  return filtered
})

const filteredTasks = computed(() => {
  console.log('[HoursView] Computing filteredTasks for projectId:', filters.projectId)
  console.log('[HoursView] Available tasks:', tasks.value?.length || 0)
  
  if (!filters.projectId || filters.projectId === '') {
    console.log('[HoursView] No project selected, returning all tasks')
    return tasks.value
  }
  
  const projectId = parseInt(filters.projectId)
  console.log('[HoursView] Filtering tasks for projectId:', projectId)
  
  const filtered = tasks.value.filter(t => {
    console.log(`[HoursView] Task "${t.name}" (ID: ${t.task_id}) belongs to project ${t.project_id}, matches: ${t.project_id === projectId}`)
    return t.project_id === projectId
  })
  
  console.log('[HoursView] Filtered tasks result:', filtered.length, 'tasks for project', projectId)
  if (filtered.length) {
    console.log('[HoursView] Filtered task names:', filtered.map(t => t.name))
  }
  
  return filtered
})

const totalHours = computed(() => {
  console.log('[HoursView] Computing totalHours, billingEvents.value:', billingEvents.value)
  console.log('[HoursView] billingEvents.value type:', typeof billingEvents.value, 'Array:', Array.isArray(billingEvents.value))
  
  // Ensure billingEvents.value is an array before calling reduce
  if (!Array.isArray(billingEvents.value)) {
    console.warn('[HoursView] billingEvents.value is not an array:', billingEvents.value)
    return 0
  }
  
  return billingEvents.value.reduce((total, entry) => {
    const hours = calculateHours(entry.start_time, entry.end_time)
    console.log(`[HoursView] Entry ${entry.uid}: ${hours} hours`)
    return total + hours
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
  console.log('[HoursView] loadData called - starting data fetch')
  isLoading.value = true
  error.value = null

  try {
    console.log('[HoursView] Fetching clients, projects, tasks, and billing events...')
    await Promise.all([
      clientsStore.fetchClients(),
      projectsStore.fetchProjects(),
      tasksStore.fetchTasks(),
      applyFilters()
    ])
    console.log('[HoursView] All data loaded successfully')
    console.log('[HoursView] Clients after load:', clientsStore.clients?.length || 0)
    console.log('[HoursView] Projects after load:', projectsStore.projects?.length || 0)
    console.log('[HoursView] Tasks after load:', tasksStore.tasks?.length || 0)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load data'
    console.error('[HoursView] Error in loadData:', err)
  } finally {
    isLoading.value = false
    console.log('[HoursView] loadData completed')
  }
}

const applyFilters = async () => {
  console.log('[HoursView] applyFilters called with current filter state:', filters)
  
  isLoading.value = true
  error.value = null

  try {
    const filterParams: any = {}
    
    console.log('[HoursView] Building filter parameters:')
    
    if (filters.clientId) {
      filterParams.clientId = parseInt(filters.clientId)
      console.log('[HoursView] ✅ Added clientId:', filterParams.clientId)
    } else {
      console.log('[HoursView] ❌ No clientId selected')
    }
    
    if (filters.projectId) {
      filterParams.projectId = parseInt(filters.projectId)
      console.log('[HoursView] ✅ Added projectId:', filterParams.projectId)
    } else {
      console.log('[HoursView] ❌ No projectId selected')
    }
    
    // Note: taskId filtering is handled client-side since backend doesn't support task_id parameter
    if (filters.taskId) {
      console.log('[HoursView] 📝 TaskId selected but will be filtered client-side:', parseInt(filters.taskId))
      console.log('[HoursView] ⚠️  Backend /api/events/ does not support task_id parameter')
    } else {
      console.log('[HoursView] ❌ No taskId selected')
    }
    
    if (filters.startDate) {
      filterParams.startDate = filters.startDate
      console.log('[HoursView] ✅ Added startDate:', filterParams.startDate)
    } else {
      console.log('[HoursView] ❌ No startDate selected')
    }
    
    if (filters.endDate) {
      filterParams.endDate = filters.endDate
      console.log('[HoursView] ✅ Added endDate:', filterParams.endDate)
    } else {
      console.log('[HoursView] ❌ No endDate selected')
    }

    console.log('[HoursView] Final filterParams being sent to API:', filterParams)
    console.log('[HoursView] Calling billingEventsStore.fetchBillingEvents...')
    
    await billingEventsStore.fetchBillingEvents(filterParams)
    
    console.log('[HoursView] ✅ Filters applied successfully')
    console.log('[HoursView] Current billing events count:', billingEvents.value?.length || 0)
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to apply filters'
    console.error('[HoursView] ❌ Error applying filters:', err)
  } finally {
    isLoading.value = false
    console.log('[HoursView] applyFilters completed')
  }
}

const clearFilters = async () => {
  console.log('[HoursView] Clearing all filters')
  
  const previousFilters = { ...filters }
  
  filters.clientId = ''
  filters.projectId = ''
  filters.taskId = ''
  filters.startDate = ''
  filters.endDate = ''
  
  console.log('[HoursView] Filters cleared:', {
    client: previousFilters.clientId + ' → empty',
    project: previousFilters.projectId + ' → empty', 
    task: previousFilters.taskId + ' → empty',
    startDate: previousFilters.startDate + ' → empty',
    endDate: previousFilters.endDate + ' → empty'
  })
  
  console.log('[HoursView] Auto-applying filters after clear')
  await applyFilters()
}

const onClientChange = async () => {
  console.log('[HoursView] onClientChange called - client selected:', filters.clientId)
  
  // Reset dependent dropdowns when client changes
  const previousProjectId = filters.projectId
  const previousTaskId = filters.taskId
  
  filters.projectId = ''
  filters.taskId = ''
  
  console.log('[HoursView] Reset projectId from', previousProjectId, 'to empty')
  console.log('[HoursView] Reset taskId from', previousTaskId, 'to empty')
  
  // Log the selected client details
  if (filters.clientId) {
    const selectedClient = clients.value?.find(c => c.id === parseInt(filters.clientId))
    if (selectedClient) {
      console.log('[HoursView] Selected client:', selectedClient.organisation, '(ID:', selectedClient.id, ')')
    }
  }
  
  // Automatically apply filters to update billing events
  console.log('[HoursView] Auto-applying filters after client change')
  await applyFilters()
}

const onProjectChange = async () => {
  console.log('[HoursView] onProjectChange called - project selected:', filters.projectId)
  
  // Reset dependent dropdown when project changes
  const previousTaskId = filters.taskId
  filters.taskId = ''
  
  console.log('[HoursView] Reset taskId from', previousTaskId, 'to empty')
  
  // Log the selected project details
  if (filters.projectId) {
    const selectedProject = filteredProjects.value?.find(p => p.project_id === parseInt(filters.projectId))
    if (selectedProject) {
      console.log('[HoursView] Selected project:', selectedProject.title, '(ID:', selectedProject.project_id, ')')
    }
  }
  
  // Automatically apply filters to update billing events
  console.log('[HoursView] Auto-applying filters after project change')
  await applyFilters()
}

const onTaskChange = async () => {
  console.log('[HoursView] onTaskChange called - task selected:', filters.taskId)
  
  // Log the selected task details
  if (filters.taskId) {
    const selectedTask = filteredTasks.value?.find(t => t.task_id === parseInt(filters.taskId))
    if (selectedTask) {
      console.log('[HoursView] Selected task:', selectedTask.name, '(ID:', selectedTask.task_id, ')')
    }
  }
  
  // Automatically apply filters to update billing events
  console.log('[HoursView] Auto-applying filters after task change')
  await applyFilters()
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
      // Update existing entry - uid is a string (UUID), not a number
      await billingEventsStore.updateBillingEvent(editingTimeEntry.value.uid, data as BillingEventUpdateData)
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

  console.log('[HoursView] DELETE - Attempting to delete time entry:', {
    uid: deletingTimeEntry.value.uid,
    uid_type: typeof deletingTimeEntry.value.uid,
    project_id: deletingTimeEntry.value.project_id,
    start_time: deletingTimeEntry.value.start_time
  })

  try {
    // uid should be passed as string, not converted to number
    await billingEventsStore.deleteBillingEvent(deletingTimeEntry.value.uid)
    showDeleteModal.value = false
    deletingTimeEntry.value = null
    await applyFilters() // Refresh the list
  } catch (err) {
    console.error('[HoursView] DELETE failed:', err)
    error.value = err instanceof Error ? err.message : 'Failed to delete time entry'
  }
}

// Helper function to get the date of last Monday (most recent Monday, including today if today is Monday)
const getLastMonday = () => {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Calculate days to subtract to get to the most recent Monday
  // If today is Monday (1), use today (0 days to subtract)
  // If today is Tuesday (2), use yesterday (1 day to subtract)
  // If today is Sunday (0), use 6 days ago
  let daysToSubtract
  if (dayOfWeek === 0) { // Sunday
    daysToSubtract = 6
  } else { // Monday through Saturday
    daysToSubtract = dayOfWeek - 1
  }
  
  const lastMonday = new Date(today)
  lastMonday.setDate(today.getDate() - daysToSubtract)
  return lastMonday
}

// Set default date range (from last Monday to end of current month)
const setDefaultDateRange = () => {
  const today = new Date()
  const lastMonday = getLastMonday()
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  filters.startDate = lastMonday.toISOString().split('T')[0]
  filters.endDate = lastDayOfMonth.toISOString().split('T')[0]
  
  console.log('[HoursView] Set default date range:', {
    startDate: filters.startDate,
    endDate: filters.endDate,
    lastMondayCalculated: lastMonday.toDateString(),
    today: today.toDateString()
  })
}

// Lifecycle
onMounted(async () => {
  console.log('[HoursView] Component mounted - initializing')
  setDefaultDateRange()
  console.log('[HoursView] Default date range set, now loading data')
  await loadData()
  console.log('[HoursView] Component initialization complete')
})

// Watch for filter changes
watch(
  () => [filters.startDate, filters.endDate],
  async (newDates, oldDates) => {
    console.log('[HoursView] Date range changed:', {
      startDate: { old: oldDates?.[0], new: newDates[0] },
      endDate: { old: oldDates?.[1], new: newDates[1] }
    })
    
    // Apply filters when both dates are set or when dates are cleared
    if ((filters.startDate && filters.endDate) || (!filters.startDate && !filters.endDate)) {
      console.log('[HoursView] Auto-applying filters after date change')
      await applyFilters()
    }
  }
)
</script>