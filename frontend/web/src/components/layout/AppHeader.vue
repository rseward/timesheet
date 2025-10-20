<template>
  <div class="bg-white dark:bg-gray-800 shadow">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between items-center">
        <div class="flex items-center">
          <router-link to="/dashboard" class="text-xl font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
            Timesheet
          </router-link>
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
              title="Profile and settings"
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
                  :class="{ 'bg-gray-50 dark:bg-gray-700': $route.path === '/profile' }"
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
                  :class="{ 'bg-gray-50 dark:bg-gray-700': $route.path === '/preferences' }"
                >
                  <svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Preferences
                </router-link>
                
                <!-- Debug Tools Separator -->
                <div class="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                <div class="px-4 py-2">
                  <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Debug Tools
                  </div>
                </div>
                
                <!-- Debug: Test Projects API -->
                <button
                  @click="testProjectsAPI(); showProfileMenu = false"
                  class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                >
                  <span class="mr-3 text-purple-500">🔍</span>
                  Test Projects API
                </button>
                
                <!-- Debug: Setup Test Tokens -->
                <button
                  @click="setupTestTokens(); showProfileMenu = false"
                  class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                >
                  <span class="mr-3 text-yellow-500">🧪</span>
                  Setup Test Tokens
                </button>
                
                <!-- Debug: Debug localStorage -->
                <button
                  @click="debugLocalStorage(); showProfileMenu = false"
                  class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                >
                  <span class="mr-3 text-indigo-500">🤖</span>
                  Debug localStorage
                </button>
              </div>
            </div>
          </div>
          
          <!-- Logout button (optional, can be hidden via prop) -->
          <button
            v-if="showLogout"
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDebug } from '@/composables/useDebug'

// Props
interface Props {
  showLogout?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLogout: true
})

// Router and store
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Debug functions
const { testProjectsAPI, setupTestTokens, debugLocalStorage } = useDebug()

// State
const showProfileMenu = ref(false)
const isLoggingOut = ref(false)

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