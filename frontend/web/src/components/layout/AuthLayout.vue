<template>
  <div class="min-h-screen flex">
    <!-- Background Image Section -->
    <div 
      class="hidden lg:block relative w-0 flex-1"
      :class="backgroundImageClasses"
    >
      <div 
        v-if="backgroundImage"
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      >
        <!-- Overlay for better text readability -->
        <div class="absolute inset-0 bg-black opacity-30" />
      </div>
      
      <!-- Default gradient background if no image -->
      <div 
        v-else
        class="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"
      />
      
      <!-- Optional content overlay on background -->
      <div 
        v-if="$slots.background"
        class="relative z-10 h-full flex items-center justify-center p-8"
      >
        <div class="text-white">
          <slot name="background" />
        </div>
      </div>
    </div>

    <!-- Form Section -->
    <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <!-- Logo/Brand Section -->
        <div class="text-center mb-8">
          <div 
            v-if="$slots.logo"
            class="mb-4"
          >
            <slot name="logo" />
          </div>
          <div v-else>
            <!-- Default Logo -->
            <div class="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg
                class="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          
          <h2 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {{ title }}
          </h2>
          <p 
            v-if="subtitle" 
            class="mt-2 text-sm text-gray-600 dark:text-gray-400"
          >
            {{ subtitle }}
          </p>
        </div>

        <!-- Main Content -->
        <div>
          <slot />
        </div>

        <!-- Footer Links -->
        <div 
          v-if="$slots.footer"
          class="mt-8 text-center"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  subtitle?: string
  backgroundImage?: string
  backgroundPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  backgroundSize?: 'cover' | 'contain' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  backgroundPosition: 'center',
  backgroundSize: 'cover'
})

// Background image classes
const backgroundImageClasses = computed(() => {
  const classes = []
  
  // Background position
  switch (props.backgroundPosition) {
    case 'top':
      classes.push('bg-top')
      break
    case 'bottom':
      classes.push('bg-bottom')
      break
    case 'left':
      classes.push('bg-left')
      break
    case 'right':
      classes.push('bg-right')
      break
    default:
      classes.push('bg-center')
  }
  
  // Background size
  switch (props.backgroundSize) {
    case 'contain':
      classes.push('bg-contain')
      break
    case 'auto':
      classes.push('bg-auto')
      break
    default:
      classes.push('bg-cover')
  }
  
  return classes.join(' ')
})
</script>