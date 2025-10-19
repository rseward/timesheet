// Global token refresh manager
// This allows the auth service to trigger the token refresh system after login

let globalRefreshSystemStart: (() => Promise<boolean>) | null = null

export const registerTokenRefreshSystem = (startFunction: () => Promise<boolean>) => {
  globalRefreshSystemStart = startFunction
  console.log('🔄 [GlobalTokenRefresh] Token refresh system registered')
}

export const triggerTokenRefreshStart = async (): Promise<boolean> => {
  if (globalRefreshSystemStart) {
    console.log('🔄 [GlobalTokenRefresh] Triggering token refresh system start')
    return await globalRefreshSystemStart()
  } else {
    console.warn('🔄 [GlobalTokenRefresh] Token refresh system not registered yet')
    return false
  }
}

export const unregisterTokenRefreshSystem = () => {
  globalRefreshSystemStart = null
  console.log('🔄 [GlobalTokenRefresh] Token refresh system unregistered')
}