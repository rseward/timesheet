import { ref, reactive, readonly } from 'vue'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
    variant?: 'primary' | 'secondary'
  }>
  persistent?: boolean
}

// Global notification state
const notifications = ref<Notification[]>([])

let notificationIdCounter = 0

function generateId(): string {
  return `notification-${++notificationIdCounter}`
}

export function useNotification() {
  const show = (notification: Omit<Notification, 'id'>): string => {
    const id = generateId()
    const newNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification
    }

    notifications.value.push(newNotification)

    // Auto-dismiss if not persistent
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => {
        dismiss(id)
      }, newNotification.duration)
    }

    return id
  }

  const dismiss = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const dismissAll = (): void => {
    notifications.value.splice(0)
  }

  // Convenience methods
  const success = (title: string, message?: string, options?: Partial<Notification>): string => {
    return show({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const error = (title: string, message?: string, options?: Partial<Notification>): string => {
    return show({
      type: 'error',
      title,
      message,
      duration: 8000, // Errors stay longer by default
      ...options
    })
  }

  const warning = (title: string, message?: string, options?: Partial<Notification>): string => {
    return show({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  const info = (title: string, message?: string, options?: Partial<Notification>): string => {
    return show({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  const confirm = (
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ): string => {
    return show({
      type: 'warning',
      title,
      message,
      persistent: true,
      actions: [
        {
          label: 'Cancel',
          action: () => {
            onCancel?.()
          },
          variant: 'secondary'
        },
        {
          label: 'Confirm',
          action: () => {
            onConfirm?.()
          },
          variant: 'primary'
        }
      ]
    })
  }

  // API operation helpers
  const showApiError = (error: Error | string, operation = 'operation'): string => {
    const message = error instanceof Error ? error.message : error
    return this.error(
      `Failed to ${operation}`,
      message,
      { duration: 10000 } // API errors stay longer
    )
  }

  const showApiSuccess = (operation = 'operation'): string => {
    return success(`Successfully ${operation}`)
  }

  // Test compatibility methods
  const showError = (message: string): string => {
    return error(message)
  }

  const showSuccess = (message: string): string => {
    return success(message)
  }

  return {
    // State
    notifications: readonly(notifications),

    // Core methods
    show,
    dismiss,
    dismissAll,

    // Convenience methods
    success,
    error,
    warning,
    info,
    confirm,
    
    // Test compatibility
    showError,
    showSuccess,

    // API helpers
    showApiError,
    showApiSuccess
  }
}

// Global notification functions for use outside of components
export const globalNotification = {
  success: (title: string, message?: string) => {
    const { success } = useNotification()
    return success(title, message)
  },
  
  error: (title: string, message?: string) => {
    const { error } = useNotification()
    return error(title, message)
  },
  
  warning: (title: string, message?: string) => {
    const { warning } = useNotification()
    return warning(title, message)
  },
  
  info: (title: string, message?: string) => {
    const { info } = useNotification()
    return info(title, message)
  }
}

// For accessing notifications state in components
export const useNotificationState = () => ({
  notifications: readonly(notifications)
})