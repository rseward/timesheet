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
                    class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-700"
                  >
                    <svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    User Profile
                  </router-link>
                  <router-link
                    to="/preferences"
                    @click="showProfileMenu = false"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
              User Profile
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

            <!-- Profile Information -->
            <div v-else class="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div class="px-6 py-8">
                <!-- Profile Header -->
                <div class="flex items-center mb-8">
                  <div class="h-20 w-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
                    <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div class="ml-6">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                      {{ user?.name || 'User Name' }}
                    </h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user?.email || 'user@example.com' }}
                    </p>
                    <div class="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Member since {{ formatMemberSince(user?.user_id) }}
                    </div>
                  </div>
                </div>

                <!-- Profile Details Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- User Information -->
                  <div class="space-y-4">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                      User Information
                    </h3>
                    
                    <div class="space-y-3">
                      <div>
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                          {{ user?.name || 'Not provided' }}
                        </dd>
                      </div>
                      
                      <div>
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</dt>
                        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                          {{ user?.email || 'Not provided' }}
                        </dd>
                      </div>
                      
                      <div>
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Username</dt>
                        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                          {{ user?.username || user?.email || 'Not provided' }}
                        </dd>
                      </div>
                      
                      <div>
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
                        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                          {{ user?.user_id || 'Not available' }}
                        </dd>
                      </div>
                    </div>
                  </div>

                  <!-- Account Status & Quick Actions -->
                  <div class="space-y-4">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                      Account & Settings
                    </h3>
                    
                    <div class="space-y-3">
                      <div>
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Account Status</dt>
                        <dd class="mt-1">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 8 8">
                              <circle cx="4" cy="4" r="3" />
                            </svg>
                            Active
                          </span>
                        </dd>
                      </div>
                      
                      <div>
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions</dt>
                        <dd class="mt-2 space-y-2">
                          <router-link
                            to="/preferences"
                            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                            Manage Preferences
                          </router-link>
                        </dd>
                      </div>
                      
                      <div>
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Working Hours</dt>
                        <dd class="mt-1 text-sm text-gray-900 dark:text-white">
                          {{ formatWorkingHours(workingHours?.startTime, workingHours?.endTime) }}
                        </dd>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- System Information -->
                <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    System Information
                  </h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt class="font-medium text-gray-500 dark:text-gray-400">Application Version</dt>
                      <dd class="mt-1 text-gray-900 dark:text-white">Timesheet v1.0.0</dd>
                    </div>
                    
                    <div>
                      <dt class="font-medium text-gray-500 dark:text-gray-400">Last Login</dt>
                      <dd class="mt-1 text-gray-900 dark:text-white">Current session</dd>
                    </div>
                    
                    <div>
                      <dt class="font-medium text-gray-500 dark:text-gray-400">Browser</dt>
                      <dd class="mt-1 text-gray-900 dark:text-white">{{ userAgent }}</dd>
                    </div>
                    
                    <div>
                      <dt class="font-medium text-gray-500 dark:text-gray-400">Platform</dt>
                      <dd class="mt-1 text-gray-900 dark:text-white">{{ platform }}</dd>
                    </div>
                  </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePreferencesStore } from '@/stores/preferences'

// Stores
const authStore = useAuthStore()
const preferencesStore = usePreferencesStore()

// State
const isLoading = ref(false)
const showProfileMenu = ref(false)

// Computed
const user = computed(() => authStore.user)
const workingHours = computed(() => preferencesStore.workingHours)

const userAgent = computed(() => {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Unknown'
})

const platform = computed(() => {
  const platform = navigator.platform
  if (platform.includes('Win')) return 'Windows'
  if (platform.includes('Mac')) return 'macOS'
  if (platform.includes('Linux')) return 'Linux'
  return platform
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

const formatMemberSince = (userId: number | undefined): string => {
  if (!userId) return 'Unknown'
  
  // Simple approximation - in a real app you'd have actual join dates
  const baseDate = new Date('2024-01-01')
  const estimatedJoinDate = new Date(baseDate.getTime() + (userId * 86400000)) // Add days based on user ID
  
  return estimatedJoinDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  })
}

const formatWorkingHours = (startTime: string | undefined, endTime: string | undefined): string => {
  if (!startTime || !endTime) return 'Not configured'
  
  // Convert 24h to 12h format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}

// Lifecycle
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  
  // Load user preferences for working hours display
  try {
    await preferencesStore.fetchPreferences()
  } catch (error) {
    console.warn('Failed to load preferences for profile display:', error)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>