// Integration test setup
// This file is run before integration tests

import { beforeAll, afterAll } from 'vitest'

const BACKEND_URL = 'http://127.0.0.1:8080'

beforeAll(async () => {
  // Verify backend is available before running integration tests
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`)
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`)
    }
    
    const data = await response.json()
    if (data.status !== 'healthy') {
      throw new Error(`Backend not healthy: ${JSON.stringify(data)}`)
    }
    
    console.log('✓ Backend is healthy and ready for integration tests')
  } catch (error) {
    console.error('✗ Backend not available for integration tests')
    console.error('Please ensure the FastAPI backend is running on http://127.0.0.1:8080')
    console.error('Error:', error)
    process.exit(1)
  }
})

afterAll(() => {
  console.log('✓ Integration tests completed')
})

// Global test configuration
;(globalThis as any).INTEGRATION_CONFIG = {
  BACKEND_URL,
  TIMEOUT: 5000,
  DEFAULT_TEST_USER: {
    username: 'test@example.com',
    password: 'test123'
  }
}