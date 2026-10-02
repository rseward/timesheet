<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow">
      <div class="w-[90%] mx-auto px-4">
        <div class="flex h-16 justify-between items-center">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              Timesheet
            </h1>
          </div>

          <div class="flex items-center space-x-4">
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
      </div>
    </div>

    <div class="py-10">
      <header>
        <div class="w-[90%] mx-auto px-4">
          <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
            Admin
          </h1>
        </div>
      </header>

      <main>
        <div class="mx-auto max-w-3xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <!-- Backup Section -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
              <div class="px-6 py-8">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Database Backup
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Download a gzipped copy of the SQLite database. The file can be used to restore data or migrate to another server.
                </p>

                <button
                  @click="handleBackup"
                  :disabled="isBackingUp"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="isBackingUp" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {{ isBackingUp ? 'Creating backup...' : 'Download Backup' }}
                </button>
              </div>
            </div>

            <!-- Restore Section -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
              <div class="px-6 py-8">
                <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Database Restore
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Restore the database from a previously downloaded backup file (.db.gz). The current database will be backed up to a .bak file before replacement.
                </p>

                <!-- Warning box -->
                <div class="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4 mb-6">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Warning
                      </h3>
                      <div class="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                        Restoring will replace all current data with the contents of the backup file. This action cannot be undone (though a .bak copy of the current DB is saved automatically).
                      </div>
                    </div>
                  </div>
                </div>

                <!-- File input -->
                <div class="space-y-4">
                  <div>
                    <label for="restoreFile" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select backup file (.db.gz)
                    </label>
                    <input
                      id="restoreFile"
                      type="file"
                      accept=".gz,.db.gz,application/gzip"
                      @change="handleFileSelect"
                      class="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        dark:file:bg-blue-900/30 dark:file:text-blue-300"
                    />
                  </div>

                  <button
                    v-if="selectedFile"
                    @click="handleRestore"
                    :disabled="isRestoring"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="isRestoring" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {{ isRestoring ? 'Restoring...' : 'Restore Database' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="rounded-md bg-green-50 dark:bg-green-900/30 p-4 mb-6">
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

            <!-- Error Message -->
            <div v-if="errorMessage" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mb-6">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
                    {{ errorMessage }}
                  </h3>
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
import { ref } from 'vue'
import { downloadBackup, restoreDatabase } from '@/services/admin'

// State
const isBackingUp = ref(false)
const isRestoring = ref(false)
const selectedFile = ref<File | null>(null)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

// Methods
const handleBackup = async () => {
  isBackingUp.value = true
  successMessage.value = null
  errorMessage.value = null

  try {
    await downloadBackup()
    successMessage.value = 'Backup downloaded successfully.'
  } catch (error: any) {
    console.error('Backup failed:', error)
    const detail = error?.response?.data?.detail || error?.message || 'Unknown error'
    errorMessage.value = `Backup failed: ${detail}`
  } finally {
    isBackingUp.value = false
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  } else {
    selectedFile.value = null
  }
  // Clear previous messages
  successMessage.value = null
  errorMessage.value = null
}

const handleRestore = async () => {
  if (!selectedFile.value) {
    errorMessage.value = 'Please select a backup file first.'
    return
  }

  isRestoring.value = true
  successMessage.value = null
  errorMessage.value = null

  try {
    const result = await restoreDatabase(selectedFile.value)
    successMessage.value = result.message || 'Database restored successfully.'
    selectedFile.value = null
    // Reset the file input
    const fileInput = document.getElementById('restoreFile') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  } catch (error: any) {
    console.error('Restore failed:', error)
    const detail = error?.response?.data?.detail || error?.message || 'Unknown error'
    errorMessage.value = `Restore failed: ${detail}`
  } finally {
    isRestoring.value = false
  }
}
</script>