import { describe, it, expect } from 'vitest'

describe('localStorage test', () => {
  it('has working localStorage', () => {
    console.log('typeof localStorage.getItem:', typeof localStorage.getItem)
    expect(typeof localStorage.getItem).toBe('function')
  })
})
