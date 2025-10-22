<template>
  <div
    v-if="isOpen"
    data-testid="task-modal"
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
            {{ isEditing ? 'Edit Task' : 'Add New Task' }}
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ isEditing ? 'Update task information and settings.' : 'Create a new task and assign it to a project.' }}
          </p>
        </div>

        <!-- Pre-filled Values Note -->
        <div
          v-if="!isEditing && defaultProjectId"
          class="mb-4 rounded-md bg-blue-50 dark:bg-blue-900/20 p-3"
          data-testid="prefilled-notice"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-800 dark:text-blue-200">
                Project pre-filled from Tasks view filter
              </p>
            </div>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="tasksStore.error" data-testid="error-alert" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-400">Error</h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{{ tasksStore.error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Project Selection -->
            <div class="md:col-span-2">
              <label for="projectId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project <span class="text-red-500">*</span>
              </label>
              <select
                id="projectId"
                v-model="formData.project_id"
                :disabled="isEditing || loading"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                :class="{ 'border-red-300 dark:border-red-600': errors.project_id }"
                data-testid="project-select"
              >
                <option value="">Select a project</option>
                <option v-for="project in activeProjects" :key="project.project_id" :value="project.project_id">
                  {{ project.client_name || `Client ${project.client_id}` }} - {{ project.title }}
                </option>
              </select>
              <p v-if="errors.project_id" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.project_id }}
              </p>
            </div>

            <!-- Task Name -->
            <div class="md:col-span-2">
              <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Name <span class="text-red-500">*</span>
              </label>
              <FormInput
                id="name"
                v-model="formData.name"
                placeholder="Enter task name"
                :error="errors.name"
                :disabled="loading"
                data-testid="task-name-input"
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
                placeholder="Enter task description"
                :disabled="loading"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                :class="{ 'border-red-300 dark:border-red-600': errors.description }"
                data-testid="task-description-input"
              ></textarea>
              <p v-if="errors.description" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.description }}
              </p>
            </div>

            <!-- Assigned Date -->
            <div>
              <label for="assigned" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assigned Date
              </label>
              <DatePicker
                id="assigned"
                v-model="formData.assigned"
                placeholder="Select assigned date"
                :error="errors.assigned"
                :disabled="loading"
                data-testid="assigned-date-picker"
              />
            </div>

            <!-- Started Date -->
            <div>
              <label for="started" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Started Date
              </label>
              <DatePicker
                id="started"
                v-model="formData.started"
                placeholder="Select started date"
                :error="errors.started"
                :disabled="loading"
                data-testid="started-date-picker"
              />
            </div>

            <!-- Suspended Date -->
            <div>
              <label for="suspended" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Suspended Date
              </label>
              <DatePicker
                id="suspended"
                v-model="formData.suspended"
                placeholder="Select suspended date"
                :error="errors.suspended"
                :disabled="loading"
                data-testid="suspended-date-picker"
              />
            </div>

            <!-- Completed Date -->
            <div>
              <label for="completed" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Completed Date
              </label>
              <DatePicker
                id="completed"
                v-model="formData.completed"
                placeholder="Select completed date"
                :error="errors.completed"
                :disabled="loading"
                data-testid="completed-date-picker"
              />
            </div>

            <!-- Task Status -->
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Status <span class="text-red-500">*</span>
              </label>
              <select
                id="status"
                v-model="formData.status"
                :disabled="loading"
                class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                :class="{ 'border-red-300 dark:border-red-600': errors.status }"
                data-testid="status-select"
              >
                <option value="">Select status</option>
                <option v-for="status in TASK_STATUS_OPTIONS" :key="status.value" :value="status.value">
                  {{ status.label }}
                </option>
              </select>
              <p v-if="errors.status" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.status }}
              </p>
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
                placeholder="https://example.com/task"
                :error="errors.http_link"
                :disabled="loading"
                data-testid="http-link-input"
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
                  data-testid="active-checkbox"
                />
                <label for="active" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Task is active
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
              :text="isEditing ? 'Update Task' : 'Create Task'"
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
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useNotification } from '@/composables/useNotification'
import FormInput from '@/components/forms/FormInput.vue'
import FormButton from '@/components/forms/FormButton.vue'
import DatePicker from '@/components/DatePicker.vue'
import type { Task, TaskCreateData, TaskStatus } from '@/types/task'
import { TASK_STATUS_OPTIONS } from '@/types/task'

interface Props {
  isOpen: boolean
  task?: Task | null
  defaultProjectId?: number | null
}

interface Emits {
  (e: 'cancel'): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
  defaultProjectId: null
})

const emit = defineEmits<Emits>()

// Store and composables
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const { showSuccess, showError } = useNotification()

// State
const loading = ref(false)
const errors = ref<Record<string, string>>({})

// Computed
const isEditing = computed(() => !!props.task)
const activeProjects = computed(() => projectsStore.activeProjects)

// Form data
const formData = ref({
  project_id: '',
  name: '',
  description: '',
  assigned: '',
  started: '',
  suspended: '',
  completed: '',
  http_link: '',
  status: 'Pending' as TaskStatus,
  active: true
})

// Initialize form data when editing
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.task) {
    formData.value = {
      project_id: props.task.project_id.toString(),
      name: props.task.name,
      description: props.task.description || '',
      assigned: props.task.assigned || '',
      started: props.task.started || '',
      suspended: props.task.suspended || '',
      completed: props.task.completed || '',
      http_link: props.task.http_link || '',
      status: props.task.status,
      active: props.task.active
    }
  } else if (newVal) {
    // Reset form for new task, using default project if provided
    formData.value = {
      project_id: props.defaultProjectId ? props.defaultProjectId.toString() : '',
      name: '',
      description: '',
      assigned: '',
      started: '',
      suspended: '',
      completed: '',
      http_link: '',
      status: 'Pending',
      active: true
    }
  }
  errors.value = {}
})

// Fetch projects on mount
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    projectsStore.fetchProjects()
  }
})

// Validation
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  // Project validation
  if (!formData.value.project_id) {
    newErrors.project_id = 'Project is required'
  }

  // Name validation
  if (!formData.value.name.trim()) {
    newErrors.name = 'Task name is required'
  } else if (formData.value.name.length > 200) {
    newErrors.name = 'Task name must be less than 200 characters'
  }

  // Description validation
  if (formData.value.description && formData.value.description.length > 1000) {
    newErrors.description = 'Description must be less than 1000 characters'
  }

  // Date validation
  if (formData.value.assigned && formData.value.started) {
    const assignedDate = new Date(formData.value.assigned)
    const startedDate = new Date(formData.value.started)

    if (assignedDate > startedDate) {
      newErrors.started = 'Started date must be after assigned date'
    }
  }

  if (formData.value.started && formData.value.completed) {
    const startedDate = new Date(formData.value.started)
    const completedDate = new Date(formData.value.completed)

    if (startedDate > completedDate) {
      newErrors.completed = 'Completed date must be after started date'
    }
  }

  // Status validation
  if (!formData.value.status) {
    newErrors.status = 'Task status is required'
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
    const taskData: any = {
      task_id: isEditing.value && props.task ? props.task.task_id : 0,
      project_id: parseInt(formData.value.project_id),
      name: formData.value.name.trim(),
      description: formData.value.description?.trim() || undefined,
      assigned: formData.value.assigned || undefined,
      started: formData.value.started || undefined,
      suspended: formData.value.suspended || undefined,
      completed: formData.value.completed || undefined,
      http_link: formData.value.http_link?.trim() || undefined,
      status: formData.value.status,
      active: formData.value.active
    }

    if (isEditing.value && props.task) {
      // Update existing task
      await tasksStore.updateTask(props.task.task_id, taskData)
      showSuccess('Task updated successfully')
    } else {
      // Create new task
      await tasksStore.createTask(taskData as TaskCreateData)
      showSuccess('Task created successfully')
    }

    emit('success')
  } catch (error) {
    console.error('Error saving task:', error)
    showError(error instanceof Error ? error.message : 'Failed to save task')
  } finally {
    loading.value = false
  }
}
</script>
