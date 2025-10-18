<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Timesheet Application
        </h1>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Welcome to the Vue.js frontend for the timesheet application.
        </p>
        
        <!-- Placeholder navigation cards matching Flet design -->
        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div class="card p-6 hover:shadow-lg transition-shadow duration-200">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Clients
            </h2>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Manage client information and contacts
            </p>
          </div>
          
          <div class="card p-6 hover:shadow-lg transition-shadow duration-200">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Projects
            </h2>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Track projects and their status
            </p>
          </div>
          
          <div class="card p-6 hover:shadow-lg transition-shadow duration-200">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Time Tracking
            </h2>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Log hours and manage billing events
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Placeholder for future functionality
</script>