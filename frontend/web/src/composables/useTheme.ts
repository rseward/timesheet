import { ref, computed, watch, onMounted } from 'vue'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'app_theme'
const DEFAULT_THEME: Theme = 'dark'

// Global theme state
const currentTheme = ref<Theme>(DEFAULT_THEME)

export function useTheme() {
  // Computed property for easy theme checking
  const isDark = computed(() => currentTheme.value === 'dark')
  const isLight = computed(() => currentTheme.value === 'light')

  // Get theme from localStorage or use default
  const getStoredTheme = (): Theme => {
    if (typeof window === 'undefined') return DEFAULT_THEME
    
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored as Theme
    }
    return DEFAULT_THEME
  }

  // Save theme to localStorage
  const saveTheme = (theme: Theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    if (typeof document === 'undefined') return

    const html = document.documentElement
    
    if (theme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  // Set theme (updates state, localStorage, and applies to DOM)
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    saveTheme(theme)
    applyTheme(theme)
    
    console.log(`🎨 [Theme] Switched to ${theme} theme`)
  }

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Initialize theme system
  const initializeTheme = () => {
    const storedTheme = getStoredTheme()
    console.log(`🎨 [Theme] Initializing with ${storedTheme} theme (default: ${DEFAULT_THEME})`)
    
    setTheme(storedTheme)
  }

  // Auto-initialize on mount (for components that need theme on mount)
  onMounted(() => {
    initializeTheme()
  })

  // Watch for theme changes to apply immediately
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: true })

  return {
    // State
    currentTheme: computed(() => currentTheme.value),
    isDark,
    isLight,
    
    // Actions
    setTheme,
    toggleTheme,
    initializeTheme,
    
    // Utilities
    getStoredTheme
  }
}

// Export singleton instance for global theme management
export const globalTheme = useTheme()