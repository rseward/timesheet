import { useProjectsStore } from '@/stores/projects'

export const useDebug = () => {
  const projectsStore = useProjectsStore()

  // Debug method to test projects API
  const testProjectsAPI = async () => {
    console.log('🔍 [DEBUG] Testing Projects API manually...')
    
    // Check authentication status
    const token = localStorage.getItem('auth_token')
    console.log('🔍 [DEBUG] Auth token in localStorage:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND')
    console.log('🔍 [DEBUG] Token exists:', !!token)
    
    if (!token) {
      console.error('🔍 [DEBUG] ❌ NO AUTH TOKEN - This explains the 403 Forbidden errors!')
      console.log('🔍 [DEBUG] You need to login first to get an auth token')
      alert('❌ No authentication token found! Please login first.')
      return
    }
    
    console.log('🔍 [DEBUG] Current projectsStore.projects:', projectsStore.projects)
    
    try {
      console.log('🔍 [DEBUG] Calling projectsStore.fetchProjects()...')
      await projectsStore.fetchProjects()
      console.log('🔍 [DEBUG] After fetchProjects, store has:', projectsStore.projects?.length || 0, 'projects')
      console.log('🔍 [DEBUG] Projects in store:', projectsStore.projects)
    } catch (error: any) {
      console.error('🔍 [DEBUG] Error in fetchProjects:', error)
      
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        console.error('🔍 [DEBUG] ❌ 403 Forbidden - Token might be expired or invalid')
        alert('❌ Authentication failed (403 Forbidden). Please login again.')
      }
    }
  }

  // Debug method to setup test tokens for token refresh system
  const setupTestTokens = () => {
    console.log('🧪 [DEBUG] Setting up test tokens for token refresh system...')
    
    // Create mock tokens for testing (these won't work with real backend but will test the UI)
    const mockAccessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InRlc3QiLCJleHAiOjE3Mjk5NzEyNDN9.fake_token_for_testing'
    const mockRefreshToken = 'refresh_token_for_testing_' + Date.now()
    
    localStorage.setItem('auth_token', mockAccessToken)
    localStorage.setItem('refresh_token', mockRefreshToken)
    
    console.log('🧪 [DEBUG] ✅ Test tokens set in localStorage')
    console.log('🧪 [DEBUG] Access token:', mockAccessToken.substring(0, 30) + '...')
    console.log('🧪 [DEBUG] Refresh token:', mockRefreshToken)
    
    alert('🧪 Test tokens have been set! The token refresh system should now activate automatically.\n\nCheck the status bar at the top of the page.')
    
    // Reload the page to trigger auto-start
    window.location.reload()
  }

  // Debug method to inspect localStorage contents
  const debugLocalStorage = () => {
    console.log('🤖 [DEBUG] localStorage contents:')
    console.log('🤖 [DEBUG] Total keys:', localStorage.length)
    
    const allItems: Record<string, string | null> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        allItems[key] = value
        console.log(`🤖 [DEBUG] ${key}:`, value?.substring(0, 50) + (value && value.length > 50 ? '...' : ''))
      }
    }
    
    // Check specifically for token-related keys
    const tokenKeys = ['auth_token', 'access_token', 'accessToken', 'token', 'authToken', 'refresh_token', 'refreshToken', 'refresh']
    const foundTokens: Record<string, string> = {}
    
    console.log('🤖 [DEBUG] Checking for token-related keys:')
    tokenKeys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        foundTokens[key] = value
        console.log(`🤖 [DEBUG] ✅ Found token key '${key}':`, value.substring(0, 30) + '...')
      } else {
        console.log(`🤖 [DEBUG] ❌ Missing token key '${key}'`)
      }
    })
    
    // Show results in alert
    const summary = `localStorage Debug Summary:\n\nTotal Keys: ${localStorage.length}\n\nFound Token Keys:\n${Object.keys(foundTokens).map(key => `- ${key}: ${foundTokens[key].substring(0, 20)}...`).join('\n')}\n\nAll Keys:\n${Object.keys(allItems).join(', ')}`
    
    console.log('🤖 [DEBUG] Summary:', summary)
    alert(summary)
  }

  return {
    testProjectsAPI,
    setupTestTokens,
    debugLocalStorage
  }
}