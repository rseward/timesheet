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

            <!-- Projects Table -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden" data-testid="projects-table">
              <!-- Loading State -->
              <div v-if="loading" class="flex items-center justify-center py-12" data-testid="loading-spinner">
                <div class="text-center">
                  <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="text-gray-500 dark:text-gray-400">Loading projects...</p>
                </div>
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="flex items-center justify-center py-12" data-testid="error-alert">
                <div class="text-center">
                  <svg class="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
                  <FormButton
                    variant="primary"
                    text="Retry"
                    @click="loadProjects"
                    data-testid="retry-button"
                  />
                </div>
              </div>

              <!-- Empty State -->
              <div v-else-if="filteredProjects.length === 0" class="flex items-center justify-center py-12" data-testid="empty-state">
                <div class="text-center">
                  <svg class="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
                  <p class="text-gray-500 dark:text-gray-400 mb-4">
                    {{ hasActiveFilters ? 'Try adjusting your filters or' : 'Get started by' }} creating your first project.
                  </p>
                  <FormButton
                    v-if="hasActiveFilters"
                    variant="secondary"
                    text="Clear Filters"
                    @click="clearFilters"
                    data-testid="clear-filters-button"
                  />
                  <FormButton
                    v-else
                    variant="primary"
                    text="Add Project"
                    @click="openAddProjectModal"
                    data-testid="empty-state-add-button"
                  />
                </div>
              </div>

              <!-- Data Table -->
              <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Lead
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Active
                      </th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="project in filteredProjects" :key="project.project_id" class="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ project.client_name || `Client ${project.client_id}` }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ project.title }}
                        </div>
                        <div v-if="project.description" class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {{ project.description }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {{ formatDate(project.start_date) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {{ formatDate(project.deadline) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="getStatusBadgeClasses(project.proj_status)">
                          {{ project.proj_status }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {{ project.proj_leader || '-' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="project.active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                          {{ project.active ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          @click="openEditProjectModal(project)"
                          class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          :data-testid="`edit-project-${project.project_id}`"
                        >
                          Edit
                        </button>
                        <button
                          @click="openDeleteConfirmation(project)"
                          class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          :data-testid="`delete-project-${project.project_id}`"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Summary Stats -->
              <div v-if="filteredProjects.length > 0" class="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
                <div class="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>
                    Showing {{ filteredProjects.length }} of {{ projectsCount }} projects
                  </span>
                  <span>
                    Active: {{ activeProjectsCount }} | 
                    Total: {{ projectsCount }}
                  </span>
                </div>
              </div>
            </div>
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