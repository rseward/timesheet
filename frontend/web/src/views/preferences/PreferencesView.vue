<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header with user info and navigation -->
    <div class="bg-white dark:bg-gray-800 shadow">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between items-center">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              Timesheet
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Welcome, {{ user?.name || user?.username || 'User' }}
            </div>
            
            <!-- Profile/Settings dropdown -->
            <div class="relative">
              <button
                @click="toggleProfileMenu"
                class="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1"
                :class="{ 'text-gray-700 dark:text-gray-200': showProfileMenu }"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <!-- Dropdown menu -->
              <div
                v-if="showProfileMenu"
                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                @click.stop
              >
                <div class="py-1">
                  <router-link
                    to="/profile"
                    @click="showProfileMenu = false"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    User Profile
                  </router-link>
                  <router-link
                    to="/preferences"
                    @click="showProfileMenu = false"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-700"
                  >
                    <svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Preferences
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="py-10">
      <header>
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
              User Preferences
            </h1>
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
        <div class="mx-auto max-w-3xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <!-- Loading state -->
            <div v-if="isLoading" class="flex justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <!-- Error state -->
            <div v-else-if="errorMessage" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mb-6">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
                    Error loading preferences
                  </h3>
                  <div class="mt-1 text-sm text-red-700 dark:text-red-400">
                    {{ errorMessage }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Preferences Form -->
            <div v-else class="space-y-6">
              <!-- Theme Preferences -->
              <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div class="px-6 py-8">
                  <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-6">
                    Theme Preferences
                  </h2>
                  
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Select Theme
                      </label>
                      <div class="flex space-x-4">
                        <label class="flex items-center">
                          <input
                            v-model="selectedTheme"
                            type="radio"
                            value="light"
                            @change="handleThemeChange"
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          />
                          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Light
                          </span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="selectedTheme"
                            type="radio"
                            value="dark"
                            @change="handleThemeChange"
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                          />
                          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            Dark
                          </span>
                        </label>
                      </div>
                      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Choose your preferred theme. Dark theme is better for low-light environments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Working Hours Preferences -->
              <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div class="px-6 py-8">
                  <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-6">
                    Working Hours Preferences
                  </h2>
                
                <form @submit.prevent="handleSave" class="space-y-6">
                  <!-- Default Start Time -->
                  <div>
                    <label for="startTime" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Default Start Time
                    </label>
                    <div class="mt-1">
                      <input
                        id="startTime"
                        v-model="formData.startTime"
                        type="time"
                        class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        required
                      />
                    </div>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      This will be the default start time when creating new time entries.
                    </p>
                  </div>

                  <!-- Default End Time -->
                  <div>
                    <label for="endTime" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Default End Time
                    </label>
                    <div class="mt-1">
                      <input
                        id="endTime"
                        v-model="formData.endTime"
                        type="time"
                        class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        required
                      />
                    </div>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      This will be the default end time when creating new time entries.
                    </p>
                  </div>

                  <!-- Validation Error -->
                  <div v-if="validationError" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01" />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
                          {{ validationError }}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <!-- Success Message -->
                  <div v-if="successMessage" class="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <h3 class="text-sm font-medium text-green-800 dark:text-green-300">
                          {{ successMessage }}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex justify-between pt-4">
                    <div class="flex space-x-3">
                      <button
                        type="button"
                        @click="handleLoad"
                        :disabled="isSaving"
                        class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Load Current
                      </button>
                      
                      <button
                        type="button"
                        @click="handleReset"
                        :disabled="isSaving"
                        class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4" />
                        </svg>
                        Reset to Defaults
                      </button>
                    </div>
                    
                    <button
                      type="submit"
                      :disabled="isSaving || !isFormValid"
                      class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      {{ isSaving ? 'Saving...' : 'Save Preferences' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'
import { useTheme } from '@/composables/useTheme'

// Stores
const authStore = useAuthStore()
const preferencesStore = usePreferencesStore()
const { currentTheme, setTheme } = useTheme()

// State
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const validationError = ref<string | null>(null)
const showProfileMenu = ref(false)
const selectedTheme = ref(currentTheme.value)

// Form data
const formData = reactive({
  startTime: '09:00',
  endTime: '17:00'
})

// Computed
const user = computed(() => authStore.user)

const isFormValid = computed(() => {
  const start = formData.startTime
  const end = formData.endTime
  
  if (!start || !end) return false
  
  // Convert to minutes for comparison
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  
  return endMinutes > startMinutes
})

// Methods
const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const closeProfileMenu = () => {
  showProfileMenu.value = false
}

const handleClickOutside = (event: Event) => {
  if (showProfileMenu.value) {
    const target = event.target as Element
    if (!target.closest('.relative')) {
      closeProfileMenu()
    }
  }
}

const handleThemeChange = () => {
  console.log('🎨 [PreferencesView] Theme changed to:', selectedTheme.value)
  setTheme(selectedTheme.value)
  
  // Show success message
  successMessage.value = `Theme changed to ${selectedTheme.value} mode successfully!`
  setTimeout(() => {
    successMessage.value = null
  }, 3000)
}

const clearMessages = () => {
  errorMessage.value = null
  successMessage.value = null
  validationError.value = null
}

const validateForm = (): boolean => {
  clearMessages()
  
  const start = formData.startTime
  const end = formData.endTime
  
  if (!start || !end) {
    validationError.value = 'Both start and end times are required.'
    return false
  }
  
  // Convert to minutes for comparison
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  
  if (endMinutes <= startMinutes) {
    validationError.value = 'End time must be after start time.'
    return false
  }
  
  return true
}

const loadCurrentPreferences = async () => {
  isLoading.value = true
  clearMessages()
  
  try {
    await preferencesStore.fetchPreferences()
    const workingHours = await preferencesStore.getWorkingHours()
    
    formData.startTime = workingHours.startTime
    formData.endTime = workingHours.endTime
  } catch (error) {
    console.error('Error loading preferences:', error)
    errorMessage.value = 'Failed to load current preferences. Using defaults.'
    
    // Use defaults
    formData.startTime = '09:00'
    formData.endTime = '17:00'
  } finally {
    isLoading.value = false
  }
}

const handleLoad = async () => {
  await loadCurrentPreferences()
}

const handleReset = () => {
  clearMessages()
  formData.startTime = '09:00'
  formData.endTime = '17:00'
  successMessage.value = 'Form reset to default values (9:00 AM - 5:00 PM)'
}

const handleSave = async () => {
  if (!validateForm()) return
  
  isSaving.value = true
  clearMessages()
  
  try {
    await preferencesStore.setWorkingHours(formData.startTime, formData.endTime)
    successMessage.value = 'Preferences saved successfully!'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (error) {
    console.error('Error saving preferences:', error)
    errorMessage.value = 'Failed to save preferences. Please try again.'
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadCurrentPreferences()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>