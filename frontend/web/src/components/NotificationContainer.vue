<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <TransitionGroup
        name="notification"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'relative p-4 rounded-lg shadow-lg border transform transition-all duration-300 ease-in-out',
            'backdrop-blur-sm',
            getNotificationClasses(notification.type)
          ]"
          role="alert"
          :aria-live="notification.type === 'error' ? 'assertive' : 'polite'"
          :aria-atomic="true"
        >
          <!-- Close button -->
          <button
            v-if="!notification.persistent"
            @click="dismiss(notification.id)"
            class="absolute top-2 right-2 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            :aria-label="`Dismiss ${notification.type} notification`"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Icon -->
          <div class="flex items-start">
            <div class="flex-shrink-0 mr-3">
              <component :is="getIcon(notification.type)" class="h-5 w-5" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium mb-1">
                {{ notification.title }}
              </h4>
              <p
                v-if="notification.message"
                class="text-sm opacity-90"
              >
                {{ notification.message }}
              </p>

              <!-- Actions -->
              <div
                v-if="notification.actions && notification.actions.length > 0"
                class="mt-3 flex space-x-2"
              >
                <button
                  v-for="action in notification.actions"
                  :key="action.label"
                  @click="handleAction(notification.id, action.action)"
                  :class="[
                    'px-3 py-1 text-xs font-medium rounded transition-colors',
                    action.variant === 'primary'
                      ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                      : 'bg-black/10 hover:bg-black/20 text-current border border-current/30'
                  ]"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Progress bar for auto-dismiss -->
          <div
            v-if="!notification.persistent && notification.duration"
            class="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg overflow-hidden"
          >
            <div
              class="h-full bg-white/60 transition-all ease-linear"
              :style="{
                width: '100%',
                animation: `shrink ${notification.duration}ms linear forwards`
              }"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotificationState, useNotification } from '@/composables/useNotification'

const { notifications } = useNotificationState()
const { dismiss } = useNotification()

const handleAction = (notificationId: string, action: () => void) => {
  action()
  dismiss(notificationId)
}

const getNotificationClasses = (type: string) => {
  const baseClasses = [
    'border-l-4',
    'dark:border-opacity-80'
  ]

  switch (type) {
    case 'success':
      return [
        ...baseClasses,
        'bg-green-50 dark:bg-green-900/90 text-green-800 dark:text-green-100',
        'border-green-400 dark:border-green-500'
      ]
    case 'error':
      return [
        ...baseClasses,
        'bg-red-50 dark:bg-red-900/90 text-red-800 dark:text-red-100',
        'border-red-400 dark:border-red-500'
      ]
    case 'warning':
      return [
        ...baseClasses,
        'bg-yellow-50 dark:bg-yellow-900/90 text-yellow-800 dark:text-yellow-100',
        'border-yellow-400 dark:border-yellow-500'
      ]
    case 'info':
      return [
        ...baseClasses,
        'bg-blue-50 dark:bg-blue-900/90 text-blue-800 dark:text-blue-100',
        'border-blue-400 dark:border-blue-500'
      ]
    default:
      return [
        ...baseClasses,
        'bg-gray-50 dark:bg-gray-900/90 text-gray-800 dark:text-gray-100',
        'border-gray-400 dark:border-gray-500'
      ]
  }
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return {
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `
      }
    case 'error':
      return {
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `
      }
    case 'warning':
      return {
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        `
      }
    case 'info':
      return {
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `
      }
    default:
      return {
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `
      }
  }
}
</script>

<style scoped>
/* Notification animations */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Progress bar animation */
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .notification-enter-from,
  .notification-leave-to {
    transform: translateX(100%) scale(0.9) translateY(-2px);
  }
}
</style>