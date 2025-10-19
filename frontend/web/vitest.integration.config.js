import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.integration.test.{js,ts}'],
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.test.{js,ts}',
        'src/**/*.spec.{js,ts}'
      ]
    },
    testTimeout: 10000, // Longer timeout for integration tests
    setupFiles: ['./src/test/integration-setup.ts']
  }
})