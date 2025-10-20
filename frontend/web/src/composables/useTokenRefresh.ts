import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { registerTokenRefreshSystem, unregisterTokenRefreshSystem } from './useGlobalTokenRefresh'

export interface TokenRefreshState {
  isActive: Ref<boolean>
  nextRefreshTime: Ref<Date | null>
  refreshCount: Ref<number>
  lastRefreshStatus: Ref<'success' | 'failed' | 'idle'>
  timeRemaining: Ref<string>
}

export function useTokenRefresh() {
  // State
  const isActive = ref(false)
  const nextRefreshTime = ref<Date | null>(null)
  const refreshCount = ref(0)
  const lastRefreshStatus = ref<'success' | 'failed' | 'idle'>('idle')
  const timeRemaining = ref('--:--')
  
  // Timer references
  let refreshTimer: NodeJS.Timeout | null = null
  let countdownTimer: NodeJS.Timeout | null = null
  
  // Constants
  const REFRESH_INTERVAL = 14 * 60 + 45 // 14 minutes 45 seconds in seconds
  const REFRESH_INTERVAL_MS = REFRESH_INTERVAL * 1000

  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const updateCountdown = () => {
    if (!nextRefreshTime.value) {
      timeRemaining.value = '--:--'
      return
    }

    const now = new Date()
    const diff = Math.floor((nextRefreshTime.value.getTime() - now.getTime()) / 1000)
    
    if (diff <= 0) {
      timeRemaining.value = '00:00'
    } else {
      timeRemaining.value = formatTimeRemaining(diff)
    }
  }

  const startCountdown = () => {
    // Update countdown every second
    if (countdownTimer) clearInterval(countdownTimer)
    countdownTimer = setInterval(updateCountdown, 1000)
    updateCountdown() // Initial update
  }

  const stopCountdown = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    timeRemaining.value = '--:--'
  }

  const refreshToken = async (): Promise<boolean> => {
    console.log('🔄 [TokenRefresh] Attempting to refresh token...')
    
    try {
      // Get current refresh token
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        console.error('🔄 [TokenRefresh] No refresh token found')
        lastRefreshStatus.value = 'failed'
        return false
      }

      console.log('🔄 [TokenRefresh] Calling /refresh endpoint...')
      
      // Call the backend refresh endpoint
      // Based on the backend, it expects: GET /refresh?refreshtoken=...
      const response = await fetch('/refresh?' + new URLSearchParams({
        refreshtoken: refreshToken
      }), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error(`🔄 [TokenRefresh] Refresh failed with status ${response.status}`)
        lastRefreshStatus.value = 'failed'
        return false
      }

      const data = await response.json()
      console.log('🔄 [TokenRefresh] Refresh response:', data)

      // Update tokens in localStorage
      if (data.access_token) {
        localStorage.setItem('auth_token', data.access_token)
        console.log('🔄 [TokenRefresh] Updated access_token')
      }

      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
        console.log('🔄 [TokenRefresh] Updated refresh_token')
      }

      refreshCount.value++
      lastRefreshStatus.value = 'success'
      console.log(`🔄 [TokenRefresh] ✅ Token refresh successful (count: ${refreshCount.value})`)
      return true

    } catch (error) {
      console.error('🔄 [TokenRefresh] Exception during refresh:', error)
      lastRefreshStatus.value = 'failed'
      return false
    }
  }

  const scheduleNextRefresh = () => {
    console.log(`🔄 [TokenRefresh] Scheduling next refresh in ${REFRESH_INTERVAL} seconds (${Math.floor(REFRESH_INTERVAL / 60)}m ${REFRESH_INTERVAL % 60}s)`)
    
    nextRefreshTime.value = new Date(Date.now() + REFRESH_INTERVAL_MS)
    
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshTimer = setTimeout(async () => {
      const success = await refreshToken()
      if (success) {
        scheduleNextRefresh() // Schedule the next refresh
      } else {
        console.error('🔄 [TokenRefresh] ❌ Token refresh failed - stopping automatic refresh')
        stop()
      }
    }, REFRESH_INTERVAL_MS)

    startCountdown()
  }

  const start = async () => {
    console.log('🔄 [TokenRefresh] Starting automatic token refresh system')
    
    // Check if we have tokens
    const accessToken = localStorage.getItem('auth_token')
    const refreshTokenValue = localStorage.getItem('refresh_token')
    
    if (!accessToken || !refreshTokenValue) {
      console.warn('🔄 [TokenRefresh] No tokens found - cannot start refresh system')
      return false
    }

    isActive.value = true
    refreshCount.value = 0
    lastRefreshStatus.value = 'idle'
    
    // Schedule first refresh
    scheduleNextRefresh()
    
    console.log('🔄 [TokenRefresh] ✅ Automatic refresh system started')
    return true
  }

  const stop = () => {
    console.log('🔄 [TokenRefresh] Stopping automatic token refresh system')
    
    isActive.value = false
    nextRefreshTime.value = null
    
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
    
    stopCountdown()
    console.log('🔄 [TokenRefresh] ✅ Automatic refresh system stopped')
  }

  const forceRefresh = async () => {
    console.log('🔄 [TokenRefresh] Manual token refresh triggered')
    const success = await refreshToken()
    if (success && isActive.value) {
      // Reschedule the timer
      scheduleNextRefresh()
    }
    return success
  }

  // Listen for token storage events to auto-start
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'refresh_token' && event.newValue && !isActive.value) {
      console.log('🔄 [TokenRefresh] Detected refresh_token storage - auto-starting refresh system')
      setTimeout(() => {
        start()
      }, 500) // Small delay to ensure both tokens are stored
    }
  }

  // Listen for direct localStorage changes (when tokens are set programmatically)
  const checkTokensOnInterval = () => {
    if (!isActive.value) {
      const accessToken = localStorage.getItem('auth_token')
      const refreshTokenValue = localStorage.getItem('refresh_token')
      
      if (accessToken && refreshTokenValue) {
        console.log('🔄 [TokenRefresh] Tokens detected via polling - auto-starting refresh system')
        start()
      }
    }
  }

  let tokenCheckInterval: NodeJS.Timeout | null = null

  // Cleanup on unmount
  onUnmounted(() => {
    stop()
    window.removeEventListener('storage', handleStorageChange)
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval)
    }
    unregisterTokenRefreshSystem()
  })

  // Auto-start when component mounts if tokens exist
  onMounted(() => {
    console.log('🔄 [TokenRefresh] Checking localStorage for tokens...')
    
    // Check all possible token key variations
    const possibleAuthKeys = ['auth_token', 'access_token', 'accessToken', 'token', 'authToken']
    const possibleRefreshKeys = ['refresh_token', 'refreshToken', 'refresh']
    
    console.log('🔄 [TokenRefresh] All localStorage keys:', Object.keys(localStorage))
    
    // Debug: Show what's in localStorage
    possibleAuthKeys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        console.log(`🔄 [TokenRefresh] Found auth token with key '${key}':`, value.substring(0, 20) + '...')
      }
    })
    
    possibleRefreshKeys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        console.log(`🔄 [TokenRefresh] Found refresh token with key '${key}':`, value.substring(0, 20) + '...')
      }
    })
    
    const accessToken = localStorage.getItem('auth_token')
    const refreshTokenValue = localStorage.getItem('refresh_token')
    
    if (accessToken && refreshTokenValue) {
      console.log('🔄 [TokenRefresh] ✅ Both tokens found with expected keys - auto-starting refresh system')
      start()
    } else {
      console.warn('🔄 [TokenRefresh] ❌ Expected token keys not found')
      console.warn(`🔄 [TokenRefresh] auth_token: ${accessToken ? 'FOUND' : 'MISSING'}`)
      console.warn(`🔄 [TokenRefresh] refresh_token: ${refreshTokenValue ? 'FOUND' : 'MISSING'}`)
      
      if (accessToken && !refreshTokenValue) {
        console.error('🔄 [TokenRefresh] 🚨 ISSUE IDENTIFIED: auth_token exists but refresh_token is missing!')
        console.error('🔄 [TokenRefresh] 🚨 Your login process is not storing the refresh_token')
        console.error('🔄 [TokenRefresh] 🚨 Token refresh cannot work without both tokens')
        
        // Show helpful alert
        setTimeout(() => {
          alert('⚠️ Token Refresh Issue:\n\nYour login saved the auth_token but not the refresh_token.\n\nToken auto-refresh cannot work without both tokens.\n\nThe login process needs to be updated to store both tokens in localStorage.')
        }, 1000)
      }
      
      // Try to find tokens with other keys and suggest migration
      let foundAuthToken = null
      let foundRefreshToken = null
      
      for (const key of possibleAuthKeys) {
        const token = localStorage.getItem(key)
        if (token && key !== 'auth_token') {
          foundAuthToken = { key, token }
          break
        }
      }
      
      for (const key of possibleRefreshKeys) {
        const token = localStorage.getItem(key)
        if (token && key !== 'refresh_token') {
          foundRefreshToken = { key, token }
          break
        }
      }
      
      if (foundAuthToken || foundRefreshToken) {
        console.log('🔄 [TokenRefresh] 💡 Found tokens with different keys - migration needed:')
        if (foundAuthToken) {
          console.log(`🔄 [TokenRefresh] Found auth token at key: ${foundAuthToken.key}`)
          localStorage.setItem('auth_token', foundAuthToken.token)
          console.log('🔄 [TokenRefresh] ✅ Migrated auth token to auth_token key')
        }
        if (foundRefreshToken) {
          console.log(`🔄 [TokenRefresh] Found refresh token at key: ${foundRefreshToken.key}`)
          localStorage.setItem('refresh_token', foundRefreshToken.token)
          console.log('🔄 [TokenRefresh] ✅ Migrated refresh token to refresh_token key')
        }
        
        // Try starting again after migration
        if (localStorage.getItem('auth_token') && localStorage.getItem('refresh_token')) {
          console.log('🔄 [TokenRefresh] ✅ Migration successful - starting refresh system')
          start()
        }
      }
    }
    
    // Set up event listeners for future token storage
    window.addEventListener('storage', handleStorageChange)
    
    // Set up polling to detect programmatic token changes (since storage events don't fire for same-origin changes)
    tokenCheckInterval = setInterval(checkTokensOnInterval, 2000) // Check every 2 seconds
    
    console.log('🔄 [TokenRefresh] Set up token detection listeners')
    
    // Register with global manager so auth service can trigger start
    registerTokenRefreshSystem(start)
  })

  return {
    // State
    isActive,
    nextRefreshTime,
    refreshCount,
    lastRefreshStatus,
    timeRemaining,
    
    // Methods
    start,
    stop,
    forceRefresh,
    
    // Constants
    refreshIntervalSeconds: REFRESH_INTERVAL
  }
}