<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header with user info and logout -->
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
            
            <button
              @click="handleLogout"
              :disabled="isLoggingOut"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isLoggingOut" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {{ isLoggingOut ? 'Signing out...' : 'Sign out' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="py-10">
      <main>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Welcome to the Timesheet application. Select a section to get started.
            </p>
            
            <!-- Navigation Cards Grid -->
            <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div class="p-5">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-sm font-medium">C</span>
                      </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                      <dl>
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Clients
                        </dt>
                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                          Manage your clients
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div class="text-sm">
                    <router-link
                      to="/clients"
                      class="font-medium text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
                    >
                      View all clients
                    </router-link>
                  </div>
                </div>
              </div>

              <!-- Add more navigation cards for other sections -->
              <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div class="p-5">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="h-8 w-8 bg-amber-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-sm font-medium">P</span>
                      </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                      <dl>
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Projects
                        </dt>
                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                          Manage your projects
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div class="text-sm">
                    <router-link
                      to="/projects"
                      class="font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
                    >
                      View all projects
                    </router-link>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div class="p-5">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-sm font-medium">T</span>
                      </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                      <dl>
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Tasks
                        </dt>
                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                          Manage your tasks
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div class="text-sm">
                    <router-link
                      to="/tasks"
                      class="font-medium text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-cyan-100"
                    >
                      View all tasks
                    </router-link>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div class="p-5">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-sm font-medium">H</span>
                      </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                      <dl>
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Hours
                        </dt>
                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                          Track your time
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div class="text-sm">
                    <router-link
                      to="/hours"
                      class="font-medium text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100"
                    >
                      Track time
                    </router-link>
                  </div>
                </div>
              </div>

              <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div class="p-5">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-sm font-medium">R</span>
                      </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                      <dl>
                        <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Reports
                        </dt>
                        <dd class="text-lg font-medium text-gray-900 dark:text-white">
                          Generate reports
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div class="text-sm">
                    <router-link
                      to="/reports"
                      class="font-medium text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100"
                    >
                      View reports
                    </router-link>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Router and store
const router = useRouter()
const authStore = useAuthStore()

// State
const isLoggingOut = ref(false)
const showProfileMenu = ref(false)

// Computed
const user = computed(() => authStore.user)

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

const handleLogout = async () => {
  isLoggingOut.value = true
  
  try {
    await authStore.logout()
    // Redirect to login page
    await router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Even if logout fails on the server, we should clear local state and redirect
    await router.push('/login')
  } finally {
    isLoggingOut.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>