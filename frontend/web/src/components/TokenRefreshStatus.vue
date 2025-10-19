<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <!-- Status Icon -->
        <div class="flex-shrink-0">
          <div 
            v-if="isActive && lastRefreshStatus === 'success'" 
            class="w-3 h-3 bg-green-500 rounded-full animate-pulse"
            title="Token refresh active"
          ></div>
          <div 
            v-else-if="isActive && lastRefreshStatus === 'idle'" 
            class="w-3 h-3 bg-blue-500 rounded-full"
            title="Token refresh scheduled"
          ></div>
          <div 
            v-else-if="lastRefreshStatus === 'failed'" 
            class="w-3 h-3 bg-red-500 rounded-full"
            title="Token refresh failed"
          ></div>
          <div 
            v-else 
            class="w-3 h-3 bg-gray-400 rounded-full"
            title="Token refresh inactive"
          ></div>
        </div>

        <!-- Status Text -->
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            <span v-if="isActive">Token Auto-Refresh Active</span>
            <span v-else>Token Auto-Refresh Inactive</span>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            <span v-if="isActive && refreshCount > 0">
              Refreshed {{ refreshCount }} time{{ refreshCount !== 1 ? 's' : '' }}
            </span>
            <span v-else-if="!isActive">
              Not logged in or no refresh token
            </span>
            <span v-else>
              Ready to refresh
            </span>
          </div>
        </div>
      </div>

      <!-- Timer and Actions -->
      <div class="flex items-center space-x-4">
        <!-- Countdown Timer -->
        <div v-if="isActive" class="text-right">
          <div class="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
            {{ timeRemaining }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            next refresh
          </div>
        </div>

        <!-- Manual Refresh Button -->
        <button
          v-if="isActive"
          @click="handleForceRefresh"
          :disabled="refreshing"
          class="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          title="Refresh token now"
        >
          <svg v-if="refreshing" class="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {{ refreshing ? 'Refreshing...' : 'Refresh Now' }}
        </button>

        <!-- Start/Stop Button -->
        <button
          @click="isActive ? stop() : start()"
          class="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
          :class="isActive 
            ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800' 
            : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'"
        >
          {{ isActive ? 'Stop' : 'Start' }}
        </button>
      </div>
    </div>

    <!-- Detailed Status (Expandable) -->
    <div v-if="showDetails" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span class="font-medium text-gray-700 dark:text-gray-300">Status:</span>
          <span class="ml-1 capitalize" :class="{
            'text-green-600 dark:text-green-400': lastRefreshStatus === 'success',
            'text-red-600 dark:text-red-400': lastRefreshStatus === 'failed',
            'text-gray-600 dark:text-gray-400': lastRefreshStatus === 'idle'
          }">
            {{ lastRefreshStatus }}
          </span>
        </div>
        <div>
          <span class="font-medium text-gray-700 dark:text-gray-300">Interval:</span>
          <span class="ml-1 text-gray-600 dark:text-gray-400">14m 45s</span>
        </div>
        <div v-if="nextRefreshTime" class="col-span-2">
          <span class="font-medium text-gray-700 dark:text-gray-300">Next Refresh:</span>
          <span class="ml-1 text-gray-600 dark:text-gray-400">
            {{ nextRefreshTime.toLocaleTimeString() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Toggle Details -->
    <button
      @click="showDetails = !showDetails"
      class="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
    >
      {{ showDetails ? 'Hide' : 'Show' }} Details
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTokenRefresh } from '@/composables/useTokenRefresh'

const {
  isActive,
  nextRefreshTime,
  refreshCount,
  lastRefreshStatus,
  timeRemaining,
  start,
  stop,
  forceRefresh
} = useTokenRefresh()

const showDetails = ref(false)
const refreshing = ref(false)

const handleForceRefresh = async () => {
  refreshing.value = true
  try {
    await forceRefresh()
  } finally {
    refreshing.value = false
  }
}
</script>