import { ref, readonly, nextTick } from 'vue'

export interface ModalOptions {
  id?: string
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  persistent?: boolean
  showCloseButton?: boolean
  backdrop?: boolean
  keyboard?: boolean
  focus?: boolean
}

export interface Modal extends Required<ModalOptions> {
  visible: boolean
}

// Global modal state
const modals = ref<Map<string, Modal>>(new Map())
const activeModalId = ref<string | null>(null)

let modalIdCounter = 0

function generateId(): string {
  return `modal-${++modalIdCounter}`
}

export function useModal(defaultOptions?: Partial<ModalOptions>) {
  const defaultModalOptions: Required<ModalOptions> = {
    id: '',
    title: '',
    size: 'md',
    persistent: false,
    showCloseButton: true,
    backdrop: true,
    keyboard: true,
    focus: true
  }

  const show = (options?: Partial<ModalOptions>): string => {
    const modalOptions = { ...defaultModalOptions, ...defaultOptions, ...options }
    const id = modalOptions.id || generateId()
    modalOptions.id = id

    const modal: Modal = {
      ...modalOptions,
      visible: true
    }

    modals.value.set(id, modal)
    activeModalId.value = id

    // Focus management
    if (modal.focus) {
      nextTick(() => {
        const modalElement = document.querySelector(`[data-modal-id="${id}"]`)
        if (modalElement) {
          (modalElement as HTMLElement).focus()
        }
      })
    }

    // Handle escape key
    if (modal.keyboard && !modal.persistent) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && activeModalId.value === id) {
          hide(id)
          document.removeEventListener('keydown', handleEscape)
        }
      }
      document.addEventListener('keydown', handleEscape)
    }

    return id
  }

  const hide = (id: string): void => {
    const modal = modals.value.get(id)
    if (modal) {
      modal.visible = false
      
      // Remove after animation delay
      setTimeout(() => {
        modals.value.delete(id)
        if (activeModalId.value === id) {
          activeModalId.value = null
        }
      }, 200)
    }
  }

  const hideAll = (): void => {
    modals.value.forEach((modal, id) => {
      hide(id)
    })
  }

  const toggle = (id: string): void => {
    const modal = modals.value.get(id)
    if (modal) {
      if (modal.visible) {
        hide(id)
      } else {
        show({ id })
      }
    }
  }

  const isVisible = (id: string): boolean => {
    const modal = modals.value.get(id)
    return modal ? modal.visible : false
  }

  const getModal = (id: string): Modal | undefined => {
    return modals.value.get(id)
  }

  // Convenience methods for common modal patterns
  const confirm = (
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    options?: Partial<ModalOptions>
  ): string => {
    return show({
      title,
      size: 'sm',
      persistent: true,
      ...options
    })
  }

  const alert = (
    title: string,
    message: string,
    onClose?: () => void,
    options?: Partial<ModalOptions>
  ): string => {
    return show({
      title,
      size: 'sm',
      ...options
    })
  }

  const loading = (message = 'Loading...', options?: Partial<ModalOptions>): string => {
    return show({
      title: message,
      size: 'sm',
      persistent: true,
      showCloseButton: false,
      backdrop: false,
      keyboard: false,
      ...options
    })
  }

  return {
    // State
    modals: readonly(modals),
    activeModalId: readonly(activeModalId),

    // Core methods
    show,
    hide,
    hideAll,
    toggle,
    isVisible,
    getModal,

    // Convenience methods
    confirm,
    alert,
    loading
  }
}

// Global modal instance for use outside components
export const globalModal = (() => {
  const modal = useModal()
  return {
    show: modal.show,
    hide: modal.hide,
    hideAll: modal.hideAll,
    confirm: modal.confirm,
    alert: modal.alert,
    loading: modal.loading
  }
})()

// Hook for accessing modal state in components
export const useModalState = () => ({
  modals: readonly(modals),
  activeModalId: readonly(activeModalId)
})

// Hook for handling backdrop clicks
export function useModalBackdrop() {
  const handleBackdropClick = (event: MouseEvent, modalId: string) => {
    const modal = modals.value.get(modalId)
    if (!modal || modal.persistent) return

    const target = event.target as HTMLElement
    const modalContent = target.closest('[data-modal-content]')
    
    if (!modalContent && modal.backdrop) {
      const { hide } = useModal()
      hide(modalId)
    }
  }

  return {
    handleBackdropClick
  }
}