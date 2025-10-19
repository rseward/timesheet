<script setup>
// Main App component with router
import TokenRefreshStatus from '@/components/TokenRefreshStatus.vue'
</script>

<template>
  <div id="app">
    <!-- Token Refresh Status Bar -->
    <div class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TokenRefreshStatus />
      </div>
    </div>
    
    <!-- Main content with top margin to account for status bar -->
    <div class="pt-20">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
