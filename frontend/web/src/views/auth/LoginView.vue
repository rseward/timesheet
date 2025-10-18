<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full space-y-8">
      <div class="card p-8">
        <h2 class="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to Timesheet
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Please enter your credentials
        </p>
        
        <form class="mt-8 space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              id="username"
              type="text"
              class="form-input mt-1"
              placeholder="Enter your username"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              class="form-input mt-1"
              placeholder="Enter your password"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            class="btn-primary w-full"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// Placeholder for login logic
</script>