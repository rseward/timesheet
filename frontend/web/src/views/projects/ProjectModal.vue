<template>
  <div
    v-if="isOpen"
    data-testid="project-modal"
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
      
      <div class="relative inline-block transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 sm:align-middle">
        <!-- Modal Header -->
        <div class="mb-4">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
            {{ isEditing ? 'Edit Project' : 'Add New Project' }}
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ isEditing ? 'Update project information and settings.' : 'Create a new project and assign it to a client.' }}
          </p>
        </div>

        <!-- Error Alert -->
        <div v-if="projectsStore.error" data-testid="error-alert" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ projectsStore.error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Client Selection -->
            <div class="md:col-span-2">
              <label for="clientId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client <span class="text-red-500">*</span>
              </label>
              <select
                id="clientId"
                v-model="formData.client_id"
                :disabled="isEditing"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                :class="{ 'border-red-300 dark:border-red-600': errors.client_id }"
              >
                <option value="">Select a client</option>
                <option v-for="client in activeClients" :key="client.id" :value="client.id">
                  {{ client.organisation }}
                </option>
              </select>
              <p v-if="errors.client_id" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.client_id }}
              </p>
            </div>

            <!-- Project Title -->
            <div class="md:col-span-2">
              <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Title <span class="text-red-500">*</span>
              </label>
              <FormInput
                id="title"
                v-model="formData.title"
                placeholder="Enter project title"
                :error="errors.title"
                :disabled="loading"
              />
            </div>

            <!-- Description -->
            <div class="md:col-span-2">
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="3"
                placeholder="Enter project description"
                :disabled="loading"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                :class="{ 'border-red-300 dark:border-red-600': errors.description }"
              ></textarea>
              <p v-if="errors.description" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.description }}
              </p>
            </div>

            <!-- Start Date -->
            <div>
              <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <DatePicker
                id="startDate"
                v-model="formData.start_date"
                placeholder="Select start date"
                :error="errors.start_date"
                :disabled="loading"
              />
            </div>

            <!-- Deadline -->
            <div>
              <label for="deadline" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deadline
              </label>
              <DatePicker
                id="deadline"
                v-model="formData.deadline"
                placeholder="Select deadline"
                :error="errors.deadline"
                :disabled="loading"
              />
            </div>

            <!-- Project Status -->
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Status <span class="text-red-500">*</span>
              </label>
              <select
                id="status"
                v-model="formData.proj_status"
                :disabled="loading"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                :class="{ 'border-red-300 dark:border-red-600': errors.proj_status }"
              >
                <option value="">Select status</option>
                <option v-for="status in PROJECT_STATUS_OPTIONS" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
              <p v-if="errors.proj_status" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.proj_status }}
              </p>
            </div>

            <!-- Project Leader -->
            <div>
              <label for="leader" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Leader
              </label>
              <FormInput
                id="leader"
                v-model="formData.proj_leader"
                placeholder="Enter project leader name"
                :error="errors.proj_leader"
                :disabled="loading"
              />
            </div>

            <!-- HTTP Link -->
            <div class="md:col-span-2">
              <label for="httpLink" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                HTTP Link
              </label>
              <FormInput
                id="httpLink"
                v-model="formData.http_link"
                type="url"
                placeholder="https://example.com/project"
                :error="errors.http_link"
                :disabled="loading"
              />
            </div>

            <!-- Active Status -->
            <div class="md:col-span-2">
              <div class="flex items-center">
                <input
                  id="active"
                  v-model="formData.active"
                  type="checkbox"
                  :disabled="loading"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                />
                <label for="active" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Project is active
                </label>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-6 flex justify-end space-x-3">
            <FormButton
              type="button"
              variant="secondary"
              text="Cancel"
              :disabled="loading"
              data-testid="cancel-button"
              @click="$emit('cancel')"
            />
            <FormButton
              type="submit"
              variant="primary"
              :text="isEditing ? 'Update Project' : 'Create Project'"
              :loading="loading"
              :disabled="loading"
              data-testid="submit-button"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClientsStore } from '@/stores/clients'
import { useProjectsStore } from '@/stores/projects'
import { useNotification } from '@/composables/useNotification'
import FormInput from '@/components/forms/FormInput.vue'
import FormButton from '@/components/forms/FormButton.vue'
import DatePicker from '@/components/DatePicker.vue'
import type { Project, ProjectCreateData, ProjectStatus } from '@/types/project'
import { PROJECT_STATUS_OPTIONS } from '@/types/project'

interface Props {
  isOpen: boolean
  project?: Project | null
}

interface Emits {
  (e: 'cancel'): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  project: null
})

const emit = defineEmits<Emits>()

// Store and composables
const clientsStore = useClientsStore()
const projectsStore = useProjectsStore()
const { showSuccess, showError } = useNotification()

// State
const loading = ref(false)
const errors = ref<Record<string, string>>({})

// Computed
const isEditing = computed(() => !!props.project)
const activeClients = computed(() => clientsStore.activeClients)

// Form data
const formData = ref({
  client_id: '',
  title: '',
  description: '',
  start_date: '',
  deadline: '',
  http_link: '',
  proj_status: 'Pending' as ProjectStatus,
  proj_leader: '',
  active: true
})

// Initialize form data when editing
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.project) {
    formData.value = {
      client_id: props.project.client_id.toString(),
      title: props.project.title,
      description: props.project.description || '',
      start_date: props.project.start_date || '',
      deadline: props.project.deadline || '',
      http_link: props.project.http_link || '',
      proj_status: props.project.proj_status,
      proj_leader: props.project.proj_leader || '',
      active: props.project.active
    }
  } else if (newVal) {
    // Reset form for new project
    formData.value = {
      client_id: '',
      title: '',
      description: '',
      start_date: '',
      deadline: '',
      http_link: '',
      proj_status: 'Pending',
      proj_leader: '',
      active: true
    }
  }
  errors.value = {}
})

// Fetch clients on mount
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    clientsStore.fetchClients()
  }
})

// Validation
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  // Client validation
  if (!formData.value.client_id) {
    newErrors.client_id = 'Client is required'
  }

  // Title validation
  if (!formData.value.title.trim()) {
    newErrors.title = 'Project title is required'
  } else if (formData.value.title.length > 200) {
    newErrors.title = 'Project title must be less than 200 characters'
  }

  // Description validation
  if (formData.value.description && formData.value.description.length > 1000) {
    newErrors.description = 'Description must be less than 1000 characters'
  }

  // Date validation
  if (formData.value.start_date && formData.value.deadline) {
    const startDate = new Date(formData.value.start_date)
    const deadline = new Date(formData.value.deadline)
    
    if (startDate > deadline) {
      newErrors.deadline = 'Deadline must be after start date'
    }
  }

  // Status validation
  if (!formData.value.proj_status) {
    newErrors.proj_status = 'Project status is required'
  }

  // URL validation
  if (formData.value.http_link) {
    try {
      new URL(formData.value.http_link)
    } catch {
      newErrors.http_link = 'Please enter a valid URL'
    }
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  errors.value = {}

  try {
    const projectData = {
      client_id: parseInt(formData.value.client_id),
      title: formData.value.title.trim(),
      description: formData.value.description?.trim() || undefined,
      start_date: formData.value.start_date || undefined,
      deadline: formData.value.deadline || undefined,
      http_link: formData.value.http_link?.trim() || undefined,
      proj_status: formData.value.proj_status,
      proj_leader: formData.value.proj_leader?.trim() || undefined,
      active: formData.value.active
    }

    if (isEditing.value && props.project) {
      // Update existing project
      await projectsStore.updateProject(props.project.project_id, projectData)
      showSuccess('Project updated successfully')
    } else {
      // Create new project
      await projectsStore.createProject(projectData as ProjectCreateData)
      showSuccess('Project created successfully')
    }

    emit('success')
  } catch (error) {
    console.error('Error saving project:', error)
    showError(error instanceof Error ? error.message : 'Failed to save project')
  } finally {
    loading.value = false
  }
}
</script>