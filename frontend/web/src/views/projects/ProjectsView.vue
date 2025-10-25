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
                Projects
              </h1>
              <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Manage your projects and track their progress.
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
                text="Add Project"
                @click="openAddProjectModal"
                data-testid="add-project-button"
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
                  Filter Projects
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <option v-for="status in PROJECT_STATUS_OPTIONS" :key="status.value" :value="status.value">
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
                      <option :value="null">All Projects</option>
                      <option :value="true">Active Only</option>
                      <option :value="false">Inactive Only</option>
                    </select>
                  </div>
                </div>

                <!-- Search -->
                <div class="mt-4">
                  <FormInput
                    v-model="filters.search"
                    placeholder="Search projects by title, description, or leader..."
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

            <!-- Projects Table with DataTable Component -->
            <DataTable
              :data="filteredProjects"
              :columns="columns"
              :loading="loading"
              :error="error || undefined"
              :actions="actions"
              row-key="project_id"
              empty-title="No projects found"
              :empty-message="hasActiveFilters ? 'Try adjusting your filters or creating your first project.' : 'Get started by creating your first project.'"
              show-pagination
              :page-size="25"
              :default-sort="{ key: 'title', order: 'asc' }"
              data-testid="projects-table"
              @retry="loadProjects"
            >
              <!-- Custom cell for Client -->
              <template #cell-client="{ item }">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.client_name || `Client ${item.client_id}` }}
                </div>
              </template>

              <!-- Custom cell for Project Name -->
              <template #cell-project_name="{ item }">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ item.title }}
                  </div>
                  <div v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    {{ item.description }}
                  </div>
                </div>
              </template>

              <!-- Custom cell for Start Date -->
              <template #cell-start_date="{ item }">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ formatDate(item.start_date) }}
                </div>
              </template>

              <!-- Custom cell for Deadline -->
              <template #cell-deadline="{ item }">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ formatDate(item.deadline) }}
                </div>
              </template>

              <!-- Custom cell for Status -->
              <template #cell-status="{ item }">
                <span :class="getStatusBadgeClasses(item.proj_status)">
                  {{ item.proj_status }}
                </span>
              </template>

              <!-- Custom cell for Lead -->
              <template #cell-lead="{ item }">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ item.proj_leader || '-' }}
                </div>
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
                    text="Add Project"
                    @click="openAddProjectModal"
                    data-testid="empty-state-add-button"
                  />
                </div>
              </template>

              <!-- Header slot for summary stats -->
              <template #header>
                <div class="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>
                    Showing {{ filteredProjects.length }} of {{ projectsCount }} projects
                  </span>
                  <span>
                    Active: {{ activeProjectsCount }} | Total: {{ projectsCount }}
                  </span>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </main>
    </div>

    <!-- Project Modal -->
    <ProjectModal
      :is-open="isProjectModalOpen"
      :project="selectedProject"
      @cancel="closeProjectModal"
      @success="onProjectModalSuccess"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      type="danger"
      title="Delete Project"
      :message="getDeleteMessage()"
      confirm-text="Delete Project"
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
import { useNotification } from '@/composables/useNotification'
import AppHeader from '@/components/layout/AppHeader.vue'
import FormButton from '@/components/forms/FormButton.vue'
import FormInput from '@/components/forms/FormInput.vue'
import ProjectModal from './ProjectModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import DataTable from '@/components/DataTable.vue'
import type { TableColumn, TableAction } from '@/components/DataTable.vue'
import type { Project, ProjectStatus } from '@/types/project'
import { PROJECT_STATUS_OPTIONS } from '@/types/project'

// Store and composables
const clientsStore = useClientsStore()
const projectsStore = useProjectsStore()
const { showSuccess, showError } = useNotification()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const isProjectModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedProject = ref<Project | null>(null)

// Filters
const filters = ref({
  clientId: null as number | null,
  status: null as ProjectStatus | null,
  active: null as boolean | null,
  search: ''
})

// DataTable configuration
const columns: TableColumn[] = [
  {
    key: 'client',
    title: 'Client',
    sortable: true,
    sortKey: 'client_name',
    width: 'w-[15%]'
  },
  {
    key: 'project_name',
    title: 'Project Name',
    sortable: true,
    sortKey: 'title',
    width: 'w-[25%]'
  },
  {
    key: 'start_date',
    title: 'Start Date',
    sortable: true,
    width: 'w-[12%]'
  },
  {
    key: 'deadline',
    title: 'Deadline',
    sortable: true,
    width: 'w-[12%]'
  },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    sortKey: 'proj_status',
    width: 'w-[12%]'
  },
  {
    key: 'lead',
    title: 'Lead',
    sortable: true,
    sortKey: 'proj_leader',
    width: 'w-[12%]'
  },
  {
    key: 'active',
    title: 'Active',
    sortable: true,
    width: 'w-[12%]'
  }
]

const actions: TableAction[] = [
  {
    key: 'edit',
    label: 'Edit',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    handler: (project: Project) => openEditProjectModal(project)
  },
  {
    key: 'delete',
    label: 'Delete',
    variant: 'danger',
    icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    handler: (project: Project) => openDeleteConfirmation(project)
  }
]

// Computed
const clients = computed(() => clientsStore.clients)
const filteredProjects = computed(() => projectsStore.filteredProjects)
const projectsCount = computed(() => projectsStore.projectsCount)
const activeProjectsCount = computed(() => projectsStore.activeProjectsCount)

const hasActiveFilters = computed(() => {
  return filters.value.clientId !== null || filters.value.status !== null || filters.value.active !== null || filters.value.search
})

// Methods
const loadProjects = async () => {
  loading.value = true
  error.value = null

  try {
    await projectsStore.fetchProjects()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load projects'
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

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

const getStatusBadgeClasses = (status: ProjectStatus): string => {
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
const openAddProjectModal = () => {
  selectedProject.value = null
  isProjectModalOpen.value = true
}

const openEditProjectModal = (project: Project) => {
  selectedProject.value = project
  isProjectModalOpen.value = true
}

const closeProjectModal = () => {
  isProjectModalOpen.value = false
  selectedProject.value = null
}

const onProjectModalSuccess = () => {
  closeProjectModal()
  loadProjects() // Refresh the list
}

const openDeleteConfirmation = (project: Project) => {
  selectedProject.value = project
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  selectedProject.value = null
}

const confirmDelete = async () => {
  if (!selectedProject.value) return

  try {
    await projectsStore.deleteProject(selectedProject.value.project_id)
    showSuccess('Project deleted successfully')
    closeDeleteModal()
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to delete project')
  }
}

// Filter methods
const onClientChange = () => {
  projectsStore.setFilters({ clientId: filters.value.clientId })
}

const onStatusChange = () => {
  projectsStore.setFilters({ status: filters.value.status })
}

const onActiveChange = () => {
  projectsStore.setFilters({ active: filters.value.active })
}

const onSearchChange = () => {
  projectsStore.setFilters({ search: filters.value.search })
}

const clearFilters = () => {
  filters.value = {
    clientId: null,
    status: null,
    active: null,
    search: ''
  }
  projectsStore.clearFilters()
}

const getDeleteMessage = (): string => {
  return `Are you sure you want to delete the project "${selectedProject.value?.title}"? This action cannot be undone.`
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadProjects(),
    loadClients()
  ])
})
</script>