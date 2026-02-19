import { describe, it, expect, beforeEach, vi } from 'vitest'
import { holidaysApi } from '@/services/holidays'
import { apiService } from '../api'

// Mock apiService dependency
vi.mock('@/services/api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('holidaysApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('calls GET /holidays/ without filters', async () => {
      const mockResponse = {
        holidays: {
          '1': {
            holiday_id: 1,
            client_id: 0,
            holiday_date: '2025-12-25',
            name: 'Christmas Day',
            description: 'Federal Holiday',
            is_federal: true,
            active: true,
            client_name: 'Federal',
          },
        },
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.getAll()

      expect(apiService.get).toHaveBeenCalledWith('/holidays/', { params: {} })
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe(1)
      expect(result.data[0].name).toBe('Christmas Day')
      expect(result.data[0].is_federal).toBe(true)
    })

    it('calls GET /holidays/ with active filter', async () => {
      const mockResponse = {
        holidays: {
          '1': {
            holiday_id: 1,
            client_id: 0,
            holiday_date: '2025-12-25',
            name: 'Christmas Day',
            description: 'Federal Holiday',
            is_federal: true,
            active: true,
            client_name: 'Federal',
          },
        },
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.getAll({ active: true })

      expect(apiService.get).toHaveBeenCalledWith('/holidays/', {
        params: { active: true },
      })
      expect(result.success).toBe(true)
    })

    it('calls GET /holidays/ with client_id filter', async () => {
      const mockResponse = {
        holidays: {
          '1': {
            holiday_id: 1,
            client_id: 1,
            holiday_date: '2025-07-04',
            name: 'Company Day Off',
            description: 'Company specific holiday',
            is_federal: false,
            active: true,
            client_name: 'Test Client',
          },
        },
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.getAll({ client_id: 1 })

      expect(apiService.get).toHaveBeenCalledWith('/holidays/', {
        params: { client_id: 1 },
      })
      expect(result.success).toBe(true)
      expect(result.data[0].client_id).toBe(1)
      expect(result.data[0].is_federal).toBe(false)
    })

    it('handles wrapped response format', async () => {
      const mockResponse = {
        data: [
          {
            holiday_id: 1,
            client_id: 0,
            holiday_date: '2025-12-25',
            name: 'Christmas Day',
            description: 'Federal Holiday',
            is_federal: true,
            active: true,
            client_name: 'Federal',
          },
        ],
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.getAll()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
    })

    it('returns empty array for invalid response format', async () => {
      const mockResponse = { invalid: 'format' }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.getAll()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(0)
    })

    it('throws error on API failure', async () => {
      vi.mocked(apiService.get).mockRejectedValue(new Error('Network error'))

      await expect(holidaysApi.getAll()).rejects.toThrow('Network error')
    })

    it('maps backend holiday_id to frontend id', async () => {
      const mockResponse = {
        holidays: {
          '1': {
            holiday_id: 42,
            client_id: 0,
            holiday_date: '2025-12-25',
            name: 'Christmas Day',
            description: 'Federal Holiday',
            is_federal: true,
            active: true,
            client_name: 'Federal',
          },
        },
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.getAll()

      expect(result.data[0].id).toBe(42)
      expect(result.data[0].holiday_date).toBe('2025-12-25')
    })
  })

  describe('getById', () => {
    it('calls GET /holidays/:id', async () => {
      const mockResponse = {
        holiday: {
          holiday_id: 1,
          client_id: 1,
          holiday_date: '2025-07-04',
          name: 'Independence Day',
          description: 'Federal Holiday',
          is_federal: true,
          active: true,
          client_name: 'Federal',
        },
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.getById(1)

      expect(apiService.get).toHaveBeenCalledWith('/holidays/1')
      expect(result.success).toBe(true)
      expect(result.data.id).toBe(1)
      expect(result.data.name).toBe('Independence Day')
    })
  })

  describe('getFederalHolidays', () => {
    it('calls GET /holidays/federal', async () => {
      const mockResponse = {
        holidays: {
          '1': {
            holiday_id: 1,
            client_id: 0,
            holiday_date: '2025-01-01',
            name: "New Year's Day",
            description: 'Federal Holiday',
            is_federal: true,
            active: true,
            client_name: 'Federal',
          },
          '2': {
            holiday_id: 2,
            client_id: 0,
            holiday_date: '2025-12-25',
            name: 'Christmas Day',
            description: 'Federal Holiday',
            is_federal: true,
            active: true,
            client_name: 'Federal',
          },
        },
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.getFederalHolidays()

      expect(apiService.get).toHaveBeenCalledWith('/holidays/federal', {
        params: {},
      })
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data.every((h) => h.is_federal)).toBe(true)
    })

    it('calls GET /holidays/federal with year filter', async () => {
      const mockResponse = {
        holidays: {
          '1': {
            holiday_id: 1,
            client_id: 0,
            holiday_date: '2025-01-01',
            name: "New Year's Day",
            description: 'Federal Holiday',
            is_federal: true,
            active: true,
            client_name: 'Federal',
          },
        },
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.getFederalHolidays(2025)

      expect(apiService.get).toHaveBeenCalledWith('/holidays/federal', {
        params: { year: 2025 },
      })
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
    })
  })

  describe('getClientHolidays', () => {
    it('calls GET /holidays/client/:clientId', async () => {
      const mockResponse = {
        holidays: {
          '1': {
            holiday_id: 1,
            client_id: 1,
            holiday_date: '2025-07-04',
            name: 'Company Day Off',
            description: 'Company specific holiday',
            is_federal: false,
            active: true,
            client_name: 'Test Client',
          },
        },
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.getClientHolidays(1)

      expect(apiService.get).toHaveBeenCalledWith('/holidays/client/1', {
        params: {},
      })
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].client_id).toBe(1)
      expect(result.data[0].is_federal).toBe(false)
    })

    it('calls GET /holidays/client/:clientId with year filter', async () => {
      const mockResponse = {
        holidays: {
          '1': {
            holiday_id: 1,
            client_id: 1,
            holiday_date: '2025-07-04',
            name: 'Company Day Off',
            description: 'Company specific holiday',
            is_federal: false,
            active: true,
            client_name: 'Test Client',
          },
        },
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.getClientHolidays(1, 2025)

      expect(apiService.get).toHaveBeenCalledWith('/holidays/client/1', {
        params: { year: 2025 },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('checkDateIsHoliday', () => {
    it('calls GET /holidays/check-date and returns holiday info', async () => {
      const mockResponse = {
        is_holiday: true,
        date: '2025-12-25',
        holiday_type: 'federal',
        holiday_name: 'Christmas Day',
        holiday_description: 'Federal Holiday',
        message: 'December 25, 2025 is a federal holiday: Christmas Day',
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.checkDateIsHoliday(0, '2025-12-25')

      expect(apiService.get).toHaveBeenCalledWith('/holidays/check-date', {
        params: { client_id: 0, date: '2025-12-25' },
      })
      expect(result.is_holiday).toBe(true)
      expect(result.holiday_type).toBe('federal')
      expect(result.holiday_name).toBe('Christmas Day')
      expect(result.message).toContain('Christmas Day')
    })

    it('returns not a holiday when date has no holidays', async () => {
      const mockResponse = {
        is_holiday: false,
        date: '2025-12-24',
        holiday_type: null,
        holiday_name: null,
        message: null,
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.checkDateIsHoliday(0, '2025-12-24')

      expect(result.is_holiday).toBe(false)
      expect(result.holiday_name).toBe(null)
      expect(result.message).toBe(null)
    })

    it('returns client holiday type for client-specific holidays', async () => {
      const mockResponse = {
        is_holiday: true,
        date: '2025-07-04',
        holiday_type: 'client',
        holiday_name: 'Company Day Off',
        holiday_description: 'Company holiday',
        message: 'July 4, 2025 is a client holiday: Company Day Off',
      }

      vi.mocked(apiService.get).mockResolvedValue(mockResponse)

      const result = await holidaysApi.checkDateIsHoliday(1, '2025-07-04')

      expect(result.holiday_type).toBe('client')
      expect(result.holiday_name).toBe('Company Day Off')
      expect(result.message).toContain('Company Day Off')
    })
  })

  describe('create', () => {
    it('calls POST /holidays/ with holiday data', async () => {
      const mockResponse = {
        added: {
          holiday_id: 1,
          client_id: 1,
          holiday_date: '2025-07-04',
          name: 'Company Day Off',
          description: 'Company holiday',
          is_federal: false,
          active: true,
          client_name: 'Test Client',
        },
      }

      vi.mocked(apiService.post).mockResolvedValue(mockResponse)

      const holidayData = {
        client_id: 1,
        holiday_date: '2025-07-04',
        name: 'Company Day Off',
        description: 'Company holiday',
        is_federal: false,
        active: true,
      }

      const result = await holidaysApi.create(holidayData)

      expect(apiService.post).toHaveBeenCalledWith(
        '/holidays/',
        expect.any(Object)
      )
      expect(result.success).toBe(true)
      expect(result.data.id).toBe(1)
      expect(result.data.name).toBe('Company Day Off')
    })

    it('creates federal holiday with client_id=0', async () => {
      const mockResponse = {
        added: {
          holiday_id: 1,
          client_id: 0,
          holiday_date: '2025-01-01',
          name: "New Year's Day",
          description: 'Federal Holiday',
          is_federal: true,
          active: true,
          client_name: 'Federal',
        },
      }

      vi.mocked(apiService.post).mockResolvedValue(mockResponse)

      const holidayData = {
        client_id: 0,
        holiday_date: '2025-01-01',
        name: "New Year's Day",
        description: 'Federal Holiday',
        is_federal: true,
        active: true,
      }

      const result = await holidaysApi.create(holidayData)

      expect(result.success).toBe(true)
      expect(result.data.client_id).toBe(0)
      expect(result.data.is_federal).toBe(true)
    })
  })

  describe('update', () => {
    it('calls PUT /holidays/ with updated holiday data', async () => {
      const mockResponse = {
        updated: {
          holiday_id: 1,
          client_id: 1,
          holiday_date: '2025-07-04',
          name: 'Company Day Off (Updated)',
          description: 'Updated description',
          is_federal: false,
          active: false,
        },
      }

      vi.mocked(apiService.put).mockResolvedValue(mockResponse)

      const updateData = {
        name: 'Company Day Off (Updated)',
        description: 'Updated description',
        active: false,
      }

      const result = await holidaysApi.update(1, updateData)

      expect(apiService.put).toHaveBeenCalledWith(
        '/holidays/',
        expect.objectContaining({
          holiday_id: 1,
        })
      )
      expect(result.success).toBe(true)
      expect(result.data.name).toBe('Company Day Off (Updated)')
      expect(result.data.active).toBe(false)
    })

    it('throws error on API failure', async () => {
      vi.mocked(apiService.put).mockRejectedValue(new Error('Network error'))

      await expect(holidaysApi.update(1, {})).rejects.toThrow('Network error')
    })
  })

  describe('delete', () => {
    it('calls DELETE /holidays/:id', async () => {
      const mockResponse = {
        deleted: {
          holiday_id: 1,
          client_id: 1,
          holiday_date: '2025-07-04',
          name: 'Company Day Off',
          is_federal: false,
          active: false,
        },
      }

      vi.mocked(apiService.delete).mockResolvedValue(mockResponse)

      const result = await holidaysApi.delete(1)

      expect(apiService.delete).toHaveBeenCalledWith('/holidays/1')
      expect(result.success).toBe(true)
    })

    it('throws error on API failure', async () => {
      vi.mocked(apiService.delete).mockRejectedValue(new Error('Network error'))

      await expect(holidaysApi.delete(1)).rejects.toThrow('Network error')
    })
  })
})
