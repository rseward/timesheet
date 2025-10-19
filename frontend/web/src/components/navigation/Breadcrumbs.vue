<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol role="list" class="flex items-center space-x-4">
      <li 
        v-for="(breadcrumb, index) in breadcrumbs"
        :key="breadcrumb.name"
      >
        <div class="flex items-center">
          <!-- Separator (except for first item) -->
          <svg
            v-if="index > 0"
            class="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500 mr-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
          </svg>
          
          <!-- Breadcrumb Item -->
          <router-link
            v-if="breadcrumb.path && index < breadcrumbs.length - 1"
            :to="breadcrumb.path"
            class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150"
          >
            {{ breadcrumb.name }}
          </router-link>
          
          <!-- Current page (not linked) -->
          <span
            v-else
            class="text-sm font-medium text-gray-900 dark:text-gray-100"
            :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined"
          >
            {{ breadcrumb.name }}
          </span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { generateBreadcrumbs } from '@/router'

interface BreadcrumbItem {
  name: string
  path?: string
}

interface Props {
  customBreadcrumbs?: BreadcrumbItem[]
  showHome?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHome: true
})

const route = useRoute()

const breadcrumbs = computed(() => {
  // Use custom breadcrumbs if provided
  if (props.customBreadcrumbs) {
    return props.customBreadcrumbs
  }
  
  // Generate breadcrumbs from route
  const routeBreadcrumbs = generateBreadcrumbs(route)
  
  // Option to hide home breadcrumb
  if (!props.showHome && routeBreadcrumbs.length > 1) {
    return routeBreadcrumbs.slice(1)
  }
  
  return routeBreadcrumbs
})
</script>