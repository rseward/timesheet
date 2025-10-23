<script setup>
// Main App component with router
import { ref, provide } from 'vue'
import TokenRefreshStatus from '@/components/TokenRefreshStatus.vue'

// State to control TokenRefreshStatus visibility
const showTokenRefreshStatus = ref(false)

// Provide the toggle function to child components
provide('toggleTokenRefreshStatus', () => {
  showTokenRefreshStatus.value = !showTokenRefreshStatus.value
})
</script>

<template>
  <div id="app">
    <!-- Token Refresh Status Bar (only shown when enabled from Debug Tools) -->
    <div
      v-if="showTokenRefreshStatus"
      class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="w-[90%] mx-auto px-4">
        <TokenRefreshStatus />
      </div>
    </div>

    <!-- Main content with dynamic top margin based on status bar visibility -->
    <div :class="showTokenRefreshStatus ? 'pt-20' : 'pt-0'">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
