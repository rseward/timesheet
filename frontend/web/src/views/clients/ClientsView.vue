<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- App Header with Profile Navigation -->
    <AppHeader :show-logout="false" />
    
    <div class="py-10">
      <header>
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
            Clients
          </h1>
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage your client organizations and contacts.
          </p>
        </div>
      </header>
      <main>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="rounded-lg border-4 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
              <div class="mx-auto max-w-sm">
                <svg
                  class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m-16-4c1.381 0 2.721-.087 4-.252"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Clients View
                </h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This page will contain the client management interface with data tables, forms, and CRUD operations.
                </p>
                <div class="mt-6">
                  <router-link
                    to="/dashboard"
                    class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                  >
                    Back to Dashboard
                  </router-link>
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
import AppHeader from '@/components/layout/AppHeader.vue'

// Clients view - placeholder component
// Will be implemented with full client management functionality
</script>