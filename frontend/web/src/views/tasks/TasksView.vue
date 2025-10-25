<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- App Header with Profile Navigation -->
    <AppHeader />

    <div class="py-10">
      <header>
        <div class="w-[90%] mx-auto px-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                Tasks
              </h1>
              <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Manage your tasks and track their progress across projects.
              </p>
            </div>
            <div class="flex space-x-3">
              <router-link
                to="/dashboard"
                class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </router-link>
              <FormButton
                variant="primary"
                text="Add Task"
                @click="openAddTaskModal"
                data-testid="add-task-button"
              >
                <template #icon>
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </template>
              </FormButton>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="w-[90%] mx-auto px-4">
          <div class="px-4 py-8 sm:px-0">
            <!-- Filter Controls -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
              <div class="px-6 py-4">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Filter Tasks
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <!-- Client Filter -->
                  <div>
                    <label for="clientFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Client ({{ clients?.length || 0 }} available)
                    </label>
                    <select
                      id="clientFilter"
                      v-model.number="filters.clientId"
                      @change="onClientChange"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      data-testid="client-filter"
                    >
                      <option :value="null">All Clients</option>
                      <option v-for="client in clients" :key="client.id" :value="client.id">
                        {{ client.organisation }}
                      </option>
                    </select>
                  </div>

                  <!-- Project Filter -->
                  <div>
                    <label for="projectFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Project ({{ availableProjects?.length || 0 }} available)
                    </label>
                    <select
                      id="projectFilter"
                      v-model.number="filters.projectId"
                      @change="onProjectChange"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      data-testid="project-filter"
                    >
                      <option :value="null">All Projects</option>
                      <option v-for="project in availableProjects" :key="project.project_id" :value="project.project_id">
                        {{ project.title }}
                      </option>
                    </select>
                  </div>

                  <!-- Status Filter -->
                  <div>
                    <label for="statusFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      id="statusFilter"
                      v-model="filters.status"
                      @change="onStatusChange"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      data-testid="status-filter"
                    >
                      <option :value="null">All Statuses</option>
                      <option v-for="status in TASK_STATUS_OPTIONS" :key="status.value" :value="status.value">
                        {{ status.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Active Filter -->
                  <div>
                    <label for="activeFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active Status
                    </label>
                    <select
                      id="activeFilter"
                      v-model="filters.active"
                      @change="onActiveChange"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      data-testid="active-filter"
                    >
                      <option :value="null">All Tasks</option>
                      <option :value="true">Active Only</option>
                      <option :value="false">Inactive Only</option>
                    </select>
                  </div>
                </div>

                <!-- Search -->
                <div class="mt-4">
                  <FormInput
                    v-model="filters.search"
                    placeholder="Search tasks by name, description, or project..."
                    @input="onSearchChange"
                    data-testid="search-input"
                  >
                    <template #icon>
                      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </template>
                  </FormInput>
                </div>
              </div>
            </div>

            <!-- Tasks Table with DataTable Component -->
            <DataTable
              :data="filteredTasks"
              :columns="columns"
              :loading="loading"
              :error="error || undefined"
              :actions="actions"
              row-key="task_id"
              empty-title="No tasks found"
              :empty-message="hasActiveFilters ? 'Try adjusting your filters or creating your first task.' : 'Get started by creating your first task.'"
              show-pagination
              :page-size="25"
              :default-sort="{ key: 'name', order: 'asc' }"
              data-testid="tasks-table"
              @retry="loadTasks"
            >
              <!-- Custom cell for Project -->
              <template #cell-project="{ item }">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.project_name || `Project ${item.project_id}` }}
                </div>
              </template>

              <!-- Custom cell for Task Name -->
              <template #cell-task_name="{ item }">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ item.name }}
                  </div>
                  <div v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    {{ item.description }}
                  </div>
                </div>
              </template>

              <!-- Custom cell for Assigned -->
              <template #cell-assigned="{ item }">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ formatDate(item.assigned) }}
                </div>
              </template>

              <!-- Custom cell for Started -->
              <template #cell-started="{ item }">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ formatDate(item.started) }}
                </div>
              </template>

              <!-- Custom cell for Status -->
              <template #cell-status="{ item }">
                <span :class="getStatusBadgeClasses(item.status)">
                  {{ item.status }}
                </span>
              </template>

              <!-- Custom cell for Active -->
              <template #cell-active="{ item }">
                <span
                  :class="item.active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ item.active ? 'Active' : 'Inactive' }}
                </span>
              </template>

              <!-- Empty state slot -->
              <template #empty>
                <div class="flex flex-col items-center space-y-3">
                  <FormButton
                    v-if="hasActiveFilters"
                    variant="secondary"
                    text="Clear Filters"
                    @click="clearFilters"
                    data-testid="clear-filters-button"
                  />
                  <FormButton
                    variant="primary"
                    text="Add Task"
                    @click="openAddTaskModal"
                    data-testid="empty-state-add-button"
                  />
                </div>
              </template>

              <!-- Header slot for summary stats -->
              <template #header>
                <div class="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>
                    Showing {{ filteredTasks.length }} of {{ tasksCount }} tasks
                  </span>
                  <span>
                    Active: {{ activeTasksCount }} | Total: {{ tasksCount }}
                  </span>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </main>
    </div>

    <!-- Task Modal -->
    <TaskModal
      :is-open="isTaskModalOpen"
      :task="selectedTask"
      :default-project-id="filters.projectId"
      @cancel="closeTaskModal"
      @success="onTaskModalSuccess"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      type="danger"
      title="Delete Task"
      :message="getDeleteMessage()"
      confirm-text="Delete Task"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
      data-testid="confirm-delete-dialog"
      confirm-button-testid="confirm-delete-button"
      cancel-button-testid="cancel-delete-button"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClientsStore } from '@/stores/clients'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useNotification } from '@/composables/useNotification'
import AppHeader from '@/components/layout/AppHeader.vue'
import FormButton from '@/components/forms/FormButton.vue'
import FormInput from '@/components/forms/FormInput.vue'
import TaskModal from './TaskModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import DataTable from '@/components/DataTable.vue'
import type { TableColumn, TableAction } from '@/components/DataTable.vue'
import type { Task, TaskStatus } from '@/types/task'
import { TASK_STATUS_OPTIONS } from '@/types/task'

// Store and composables
const clientsStore = useClientsStore()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const { showSuccess, showError } = useNotification()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const isTaskModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedTask = ref<Task | null>(null)

// Filters
const filters = ref({
  clientId: null as number | null,
  projectId: null as number | null,
  status: null as TaskStatus | null,
  active: null as boolean | null,
  search: ''
})

// DataTable configuration
const columns: TableColumn[] = [
  {
    key: 'project',
    title: 'Project',
    sortable: true,
    sortKey: 'project_name',
    width: 'w-[20%]'
  },
  {
    key: 'task_name',
    title: 'Task Name',
    sortable: true,
    sortKey: 'name',
    width: 'w-[25%]'
  },
  {
    key: 'assigned',
    title: 'Assigned',
    sortable: true,
    width: 'w-[13%]'
  },
  {
    key: 'started',
    title: 'Started',
    sortable: true,
    width: 'w-[13%]'
  },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    width: 'w-[14%]'
  },
  {
    key: 'active',
    title: 'Active',
    sortable: true,
    width: 'w-[15%]'
  }
]

const actions: TableAction[] = [
  {
    key: 'edit',
    label: 'Edit',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    handler: (task: Task) => openEditTaskModal(task)
  },
  {
    key: 'delete',
    label: 'Delete',
    variant: 'danger',
    icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    handler: (task: Task) => openDeleteConfirmation(task)
  }
]

// Computed
const clients = computed(() => clientsStore.clients)
const allProjects = computed(() => projectsStore.projects)
const filteredTasks = computed(() => tasksStore.filteredTasks)
const tasksCount = computed(() => tasksStore.tasksCount)
const activeTasksCount = computed(() => tasksStore.activeTasksCount)

// Filter projects by selected client
const availableProjects = computed(() => {
  if (!filters.value.clientId) {
    return allProjects.value
  }
  return allProjects.value.filter(p => p.client_id === filters.value.clientId)
})

const hasActiveFilters = computed(() => {
  return filters.value.clientId !== null ||
         filters.value.projectId !== null ||
         filters.value.status !== null ||
         filters.value.active !== null ||
         filters.value.search
})

// Methods
const loadTasks = async () => {
  loading.value = true
  error.value = null

  try {
    await tasksStore.fetchTasks()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load tasks'
    showError(error.value)
  } finally {
    loading.value = false
  }
}

const loadClients = async () => {
  try {
    await clientsStore.fetchClients()
  } catch (err) {
    console.error('Failed to load clients:', err)
    showError('Failed to load clients')
  }
}

const loadProjects = async () => {
  try {
    await projectsStore.fetchProjects()
  } catch (err) {
    console.error('Failed to load projects:', err)
    showError('Failed to load projects')
  }
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

const getStatusBadgeClasses = (status: TaskStatus): string => {
  const baseClasses = 'inline-flex px-2 py-1 text-xs font-semibold rounded-full'

  switch (status) {
    case 'Pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400`
    case 'Started':
      return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400`
    case 'Suspended':
      return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400`
    case 'Complete':
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400`
  }
}

// Modal methods
const openAddTaskModal = () => {
  selectedTask.value = null
  isTaskModalOpen.value = true
}

const openEditTaskModal = (task: Task) => {
  selectedTask.value = task
  isTaskModalOpen.value = true
}

const closeTaskModal = () => {
  isTaskModalOpen.value = false
  selectedTask.value = null
}

const onTaskModalSuccess = () => {
  closeTaskModal()
  loadTasks() // Refresh the list
}

const openDeleteConfirmation = (task: Task) => {
  selectedTask.value = task
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  selectedTask.value = null
}

const confirmDelete = async () => {
  if (!selectedTask.value) return

  try {
    await tasksStore.deleteTask(selectedTask.value.task_id)
    showSuccess('Task deleted successfully')
    closeDeleteModal()
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to delete task')
  }
}

// Filter methods
const onClientChange = () => {
  // Reset project filter when client changes
  if (filters.value.clientId) {
    filters.value.projectId = null
  }
  tasksStore.setFilters({
    clientId: filters.value.clientId,
    projectId: null
  })
}

const onProjectChange = () => {
  tasksStore.setFilters({ projectId: filters.value.projectId })
}

const onStatusChange = () => {
  tasksStore.setFilters({ status: filters.value.status })
}

const onActiveChange = () => {
  tasksStore.setFilters({ active: filters.value.active })
}

const onSearchChange = () => {
  tasksStore.setFilters({ search: filters.value.search })
}

const clearFilters = () => {
  filters.value = {
    clientId: null,
    projectId: null,
    status: null,
    active: null,
    search: ''
  }
  tasksStore.clearFilters()
}

const getDeleteMessage = (): string => {
  return `Are you sure you want to delete the task "${selectedTask.value?.name}"? This action cannot be undone.`
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadTasks(),
    loadClients(),
    loadProjects()
  ])
})
</script>
