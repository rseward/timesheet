<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="py-10">
      <header>
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
            Projects
          </h1>
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage your projects and track their progress.
          </p>
        </div>
      </header>
      <main>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="rounded-lg border-4 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
              <div class="mx-auto max-w-sm">
                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Projects View - Coming Soon
                </h3>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This page will contain project management functionality.
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
// Projects view placeholder
</script>