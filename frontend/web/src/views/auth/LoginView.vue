<template>
  <AuthLayout 
    title="Sign in to your account"
    subtitle="Enter your credentials to access the timesheet application"
    :background-image="backgroundImage"
  >
    <!-- Login Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Username Field -->
      <FormInput
        v-model="formData.username"
        label="Username"
        type="text"
        autocomplete="username"
        required
        :error="errors.username"
        placeholder="Enter your username"
        @blur="validateField('username')"
      >
        <template #icon>
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </template>
      </FormInput>

      <!-- Password Field -->
      <FormInput
        v-model="formData.password"
        label="Password"
        type="password"
        autocomplete="current-password"
        required
        :error="errors.password"
        placeholder="Enter your password"
        :show-password-toggle="true"
        @blur="validateField('password')"
      >
        <template #icon>
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </template>
      </FormInput>

      <!-- Remember Me Checkbox -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            v-model="formData.rememberMe"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800"
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Remember me
          </label>
        </div>

        <div class="text-sm">
          <a href="#" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Forgot your password?
          </a>
        </div>
      </div>

      <!-- Global Error Message -->
      <div v-if="errors.general" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
              Sign in failed
            </h3>
            <div class="mt-1 text-sm text-red-700 dark:text-red-400">
              {{ errors.general }}
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <FormButton
        type="submit"
        text="Sign in"
        :loading="isLoading"
        loading-text="Signing in..."
        :disabled="!isFormValid"
        variant="primary"
        size="lg"
        full-width
      />
    </form>

    <!-- Footer slot with additional info -->
    <template #footer>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        By signing in, you agree to our terms of service and privacy policy.
      </p>
    </template>
    
    <!-- Background content -->
    <template #background>
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">
          Timesheet Application
        </h1>
        <p class="text-lg opacity-90">
          Track your time efficiently and generate detailed reports
        </p>
      </div>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import FormInput from '@/components/forms/FormInput.vue'
import FormButton from '@/components/forms/FormButton.vue'

// Router and store
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Theme management for login page (hard-coded to light theme)
let originalThemeClass = false // Was dark theme originally applied?

// Force light theme without using localStorage or theme composable
const forceLightTheme = () => {
  if (typeof document !== 'undefined') {
    const html = document.documentElement
    originalThemeClass = html.classList.contains('dark')
    html.classList.remove('dark') // Remove dark class to force light theme
    console.log('🎨 [LoginView] Forced light theme for login page')
  }
}

// Restore original theme
const restoreOriginalTheme = () => {
  if (typeof document !== 'undefined' && originalThemeClass) {
    const html = document.documentElement
    html.classList.add('dark') // Restore dark theme if it was originally applied
    console.log('🎨 [LoginView] Restored original theme')
  }
}

// Form data
const formData = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// Form state
const errors = reactive({
  username: '',
  password: '',
  general: ''
})

const isLoading = ref(false)

// Background image - using available login background
const backgroundImage = ref('/assets/images/login_back.jpg')

// Form validation
const validateField = (fieldName: keyof typeof formData) => {
  // Clear previous error
  errors[fieldName as keyof typeof errors] = ''
  
  switch (fieldName) {
    case 'username':
      if (!formData.username.trim()) {
        errors.username = 'Username is required'
      } else if (formData.username.length < 2) {
        errors.username = 'Username must be at least 2 characters'
      }
      break
      
    case 'password':
      if (!formData.password) {
        errors.password = 'Password is required'
      } else if (formData.password.length < 3) {
        errors.password = 'Password must be at least 3 characters'
      }
      break
  }
}

const validateForm = (): boolean => {
  validateField('username')
  validateField('password')
  
  return !errors.username && !errors.password
}

const isFormValid = computed(() => {
  return formData.username.trim() && formData.password && !errors.username && !errors.password
})

// Form submission
const handleSubmit = async () => {
  // Clear general error
  errors.general = ''
  
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await authStore.login({
      username: formData.username.trim(),
      password: formData.password,
      remember_me: formData.rememberMe
    })
    
    if (result.success) {
      // Restore original theme before redirect
      restoreOriginalTheme()
      
      // Redirect to intended page or dashboard
      const redirectTo = (route.query.redirect as string) || '/dashboard'
      await router.push(redirectTo)
    } else {
      errors.general = result.error || 'Login failed. Please check your credentials.'
    }
  } catch (error) {
    console.error('Login error:', error)
    errors.general = 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Initialize component
onMounted(() => {
  // Force light theme for login page (bypassing localStorage completely)
  forceLightTheme()
  
  // Focus username field
  const usernameInput = document.querySelector('input[type="text"]') as HTMLInputElement
  if (usernameInput) {
    usernameInput.focus()
  }
})

// Restore original theme when leaving login page
onUnmounted(() => {
  restoreOriginalTheme()
})
</script>
