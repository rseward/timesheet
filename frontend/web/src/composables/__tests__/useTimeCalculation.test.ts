import { describe, it, expect } from 'vitest'

/**
 * Time calculation utilities for billing events
 */
export function useTimeCalculation() {
  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0
    
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
    if (end <= start) return 0
    
    const diffMs = end.getTime() - start.getTime()
    return diffMs / (1000 * 60 * 60) // Convert to hours
  }

  const formatTime = (timeString: string): string => {
    if (!timeString) return ''
    
    try {
      const date = new Date(timeString)
      if (isNaN(date.getTime())) {
        return timeString
      }
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return timeString
    }
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return dateString
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateTimeString: string): string => {
    if (!dateTimeString) return ''
    
    try {
      const date = new Date(dateTimeString)
      if (isNaN(date.getTime())) {
        return dateTimeString
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return dateTimeString
    }
  }

  const validateTimeRange = (startTime: string, endTime: string): { valid: boolean; error?: string } => {
    if (!startTime || !endTime) {
      return { valid: false, error: 'Both start and end times are required' }
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (isNaN(start.getTime())) {
      return { valid: false, error: 'Invalid start time' }
    }

    if (isNaN(end.getTime())) {
      return { valid: false, error: 'Invalid end time' }
    }

    if (end <= start) {
      return { valid: false, error: 'End time must be after start time' }
    }

    return { valid: true }
  }

  const roundHours = (hours: number, decimals: number = 2): number => {
    return Math.round(hours * Math.pow(10, decimals)) / Math.pow(10, decimals)
  }

  return {
    calculateHours,
    formatTime,
    formatDate,
    formatDateTime,
    validateTimeRange,
    roundHours
  }
}

describe('useTimeCalculation', () => {
  const { calculateHours, formatTime, formatDate, formatDateTime, validateTimeRange, roundHours } = useTimeCalculation()

  describe('calculateHours', () => {
    it('calculates hours correctly for same-day times', () => {
      const result = calculateHours('2023-01-01T09:00:00', '2023-01-01T17:00:00')
      expect(result).toBe(8)
    })

    it('calculates hours correctly for half-day times', () => {
      const result = calculateHours('2023-01-01T09:00:00', '2023-01-01T13:00:00')
      expect(result).toBe(4)
    })

    it('calculates fractional hours correctly', () => {
      const result = calculateHours('2023-01-01T09:00:00', '2023-01-01T10:30:00')
      expect(result).toBe(1.5)
    })

    it('handles overnight periods correctly', () => {
      const result = calculateHours('2023-01-01T23:00:00', '2023-01-02T01:00:00')
      expect(result).toBe(2)
    })

    it('returns 0 for empty strings', () => {
      expect(calculateHours('', '')).toBe(0)
      expect(calculateHours('2023-01-01T09:00:00', '')).toBe(0)
      expect(calculateHours('', '2023-01-01T17:00:00')).toBe(0)
    })

    it('returns 0 for invalid dates', () => {
      expect(calculateHours('invalid', '2023-01-01T17:00:00')).toBe(0)
      expect(calculateHours('2023-01-01T09:00:00', 'invalid')).toBe(0)
    })

    it('returns 0 when end time is before start time', () => {
      const result = calculateHours('2023-01-01T17:00:00', '2023-01-01T09:00:00')
      expect(result).toBe(0)
    })

    it('returns 0 when start and end times are the same', () => {
      const result = calculateHours('2023-01-01T09:00:00', '2023-01-01T09:00:00')
      expect(result).toBe(0)
    })
  })

  describe('formatTime', () => {
    it('formats time correctly in 12-hour format', () => {
      expect(formatTime('2023-01-01T09:00:00')).toBe('9:00 AM')
      expect(formatTime('2023-01-01T13:30:00')).toBe('1:30 PM')
      expect(formatTime('2023-01-01T00:00:00')).toBe('12:00 AM')
      expect(formatTime('2023-01-01T12:00:00')).toBe('12:00 PM')
    })

    it('returns empty string for empty input', () => {
      expect(formatTime('')).toBe('')
    })

    it('returns original string for invalid dates', () => {
      expect(formatTime('invalid-date')).toBe('invalid-date')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      expect(formatDate('2023-01-01T09:00:00')).toBe('Jan 1, 2023')
      expect(formatDate('2023-12-31T23:59:59')).toBe('Dec 31, 2023')
    })

    it('returns empty string for empty input', () => {
      expect(formatDate('')).toBe('')
    })

    it('returns original string for invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date')
    })
  })

  describe('formatDateTime', () => {
    it('formats datetime correctly', () => {
      const result = formatDateTime('2023-01-01T09:30:00')
      expect(result).toBe('Jan 1, 2023, 9:30 AM')
    })

    it('returns empty string for empty input', () => {
      expect(formatDateTime('')).toBe('')
    })

    it('returns original string for invalid dates', () => {
      expect(formatDateTime('invalid-date')).toBe('invalid-date')
    })
  })

  describe('validateTimeRange', () => {
    it('validates correct time range', () => {
      const result = validateTimeRange('2023-01-01T09:00:00', '2023-01-01T17:00:00')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects empty start time', () => {
      const result = validateTimeRange('', '2023-01-01T17:00:00')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Both start and end times are required')
    })

    it('rejects empty end time', () => {
      const result = validateTimeRange('2023-01-01T09:00:00', '')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Both start and end times are required')
    })

    it('rejects invalid start time', () => {
      const result = validateTimeRange('invalid', '2023-01-01T17:00:00')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid start time')
    })

    it('rejects invalid end time', () => {
      const result = validateTimeRange('2023-01-01T09:00:00', 'invalid')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid end time')
    })

    it('rejects end time before start time', () => {
      const result = validateTimeRange('2023-01-01T17:00:00', '2023-01-01T09:00:00')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('End time must be after start time')
    })

    it('rejects same start and end time', () => {
      const result = validateTimeRange('2023-01-01T09:00:00', '2023-01-01T09:00:00')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('End time must be after start time')
    })
  })

  describe('roundHours', () => {
    it('rounds hours to default 2 decimal places', () => {
      expect(roundHours(8.12345)).toBe(8.12)
      expect(roundHours(4.567)).toBe(4.57)
    })

    it('rounds hours to specified decimal places', () => {
      expect(roundHours(8.12345, 0)).toBe(8)
      expect(roundHours(8.12345, 1)).toBe(8.1)
      expect(roundHours(8.12345, 3)).toBe(8.123)
    })

    it('handles whole numbers correctly', () => {
      expect(roundHours(8)).toBe(8.00)
      expect(roundHours(8, 0)).toBe(8)
    })

    it('handles edge cases', () => {
      expect(roundHours(0)).toBe(0.00)
      expect(roundHours(0.1)).toBe(0.10)
    })
  })
})