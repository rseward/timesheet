import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHolidaysStore } from '@/stores/holidays'
import { holidaysApi } from '@/services/holidays'

// Mock holidaysApi
vi.mock('@/services/holidays', () => ({
  holidaysApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    getFederalHolidays: vi.fn(),
    getClientHolidays: vi.fn(),
    checkDateIsHoliday: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Holidays Store', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  afterEach(() => {
    setActivePinia(pinia)
  })

  describe('State', () => {
    it('initializes with empty holidays array', () => {
      const store = useHolidaysStore()
      expect(store.holidays).toEqual([])
    })

    it('initializes with loading state false', () => {
      const store = useHolidaysStore()
      expect(store.loading).toBe(false)
    })

    it('initializes with error state null', () => {
      const store = useHolidaysStore()
      expect(store.error).toBe(null)
    })

    it('initializes with default filters', () => {
      const store = useHolidaysStore()
      expect(store.filters).toEqual({
        active: null,
        client_id: null,
        year: null,
        search: '',
      })
    })
  })

  describe('Getters', () => {
    it('federalHolidays returns only federal holidays', () => {
      const store = useHolidaysStore()
      store.holidays = [
        {
          id: 1,
          client_id: 0,
          name: 'Federal Holiday',
          is_federal: true,
          active: true,
          holiday_date: '2025-01-01',
        },
        {
          id: 2,
          client_id: 1,
          name: 'Client Holiday',
          is_federal: false,
          active: true,
          holiday_date: '2025-07-04',
        },
      ]

      expect(store.federalHolidays).toHaveLength(1)
      expect(store.federalHolidays[0].is_federal).toBe(true)
    })

    it('clientHolidays returns only client holidays', () => {
      const store = useHolidaysStore()
      store.holidays = [
        {
          id: 1,
          client_id: 0,
          name: 'Federal Holiday',
          is_federal: true,
          active: true,
          holiday_date: '2025-01-01',
        },
        {
          id: 2,
          client_id: 1,
          name: 'Client Holiday',
          is_federal: false,
          active: true,
          holiday_date: '2025-07-04',
        },
      ]

      expect(store.clientHolidays).toHaveLength(1)
      expect(store.clientHolidays[0].is_federal).toBe(false)
    })

    it('activeHolidays returns only active holidays', () => {
      const store = useHolidaysStore()
      store.holidays = [
        {
          id: 1,
          name: 'Active Holiday',
          active: true,
          holiday_date: '2025-01-01',
          is_federal: false,
        },
        {
          id: 2,
          name: 'Inactive Holiday',
          active: false,
          holiday_date: '2025-02-01',
          is_federal: false,
        },
      ]

      expect(store.activeHolidays).toHaveLength(1)
      expect(store.activeHolidays[0].active).toBe(true)
    })

    it('filteredHolidays filters by active status', () => {
      const store = useHolidaysStore()
      store.holidays = [
        {
          id: 1,
          name: 'Active Holiday',
          active: true,
          holiday_date: '2025-01-01',
          is_federal: false,
        },
        {
          id: 2,
          name: 'Inactive Holiday',
          active: false,
          holiday_date: '2025-02-01',
          is_federal: false,
        },
      ]
      store.filters.active = true

      expect(store.filteredHolidays).toHaveLength(1)
      expect(store.filteredHolidays[0].active).toBe(true)
    })

    it('filteredHolidays filters by client_id', () => {
      const store = useHolidaysStore()
      store.holidays = [
        {
          id: 1,
          client_id: 1,
          name: 'Client 1 Holiday',
          holiday_date: '2025-07-04',
          is_federal: false,
        },
        {
          id: 2,
          client_id: 2,
          name: 'Client 2 Holiday',
          holiday_date: '2025-08-15',
          is_federal: false,
        },
      ]
      store.filters.client_id = 1

      expect(store.filteredHolidays).toHaveLength(1)
      expect(store.filteredHolidays[0].client_id).toBe(1)
    })

    it('filteredHolidays filters by year', () => {
      const store = useHolidaysStore()
      store.holidays = [
        {
          id: 1,
          name: '2024 Holiday',
          holiday_date: '2024-12-25',
          is_federal: false,
        },
        {
          id: 2,
          name: '2025 Holiday',
          holiday_date: '2025-01-01',
          is_federal: false,
        },
      ]
      store.filters.year = 2025

      expect(store.filteredHolidays).toHaveLength(1)
      expect(store.filteredHolidays[0].holiday_date).toContain('2025')
    })

    it('filteredHolidays filters by search term', () => {
      const store = useHolidaysStore()
      store.holidays = [
        {
          id: 1,
          name: 'Christmas Day',
          holiday_date: '2025-12-25',
          is_federal: false,
        },
        {
          id: 2,
          name: 'Independence Day',
          holiday_date: '2025-07-04',
          is_federal: false,
        },
      ]
      store.filters.search = 'Christmas'

      expect(store.filteredHolidays).toHaveLength(1)
      expect(store.filteredHolidays[0].name).toContain('Christmas')
    })

    it('holidaysCount returns total holidays', () => {
      const store = useHolidaysStore()
      store.holidays = [
        { id: 1, name: 'Holiday 1', holiday_date: '2025-01-01' },
        { id: 2, name: 'Holiday 2', holiday_date: '2025-02-01' },
      ]

      expect(store.holidaysCount).toBe(2)
    })

    it('activeHolidaysCount returns active holidays count', () => {
      const store = useHolidaysStore()
      store.holidays = [
        {
          id: 1,
          name: 'Active Holiday',
          active: true,
          holiday_date: '2025-01-01',
        },
        {
          id: 2,
          name: 'Inactive Holiday',
          active: false,
          holiday_date: '2025-02-01',
        },
        {
          id: 3,
          name: 'Another Active Holiday',
          active: true,
          holiday_date: '2025-03-01',
        },
      ]

      expect(store.activeHolidaysCount).toBe(2)
    })
  })

  describe('Actions', () => {
    describe('fetchHolidays', () => {
      it('fetches and sets holidays successfully', async () => {
        const mockHolidays = [
          {
            id: 1,
            client_id: 0,
            name: 'Federal Holiday',
            is_federal: true,
            active: true,
            holiday_date: '2025-01-01',
          },
          {
            id: 2,
            client_id: 1,
            name: 'Client Holiday',
            is_federal: false,
            active: true,
            holiday_date: '2025-07-04',
          },
        ]

        vi.mocked(holidaysApi.getAll).mockResolvedValue({
          success: true,
          data: mockHolidays,
        })

        const store = useHolidaysStore()
        await store.fetchHolidays()

        expect(store.loading).toBe(false)
        expect(store.holidays).toEqual(mockHolidays)
        expect(store.holidaysCount).toBe(2)
      })

      it('passes filter options to API', async () => {
        vi.mocked(holidaysApi.getAll).mockResolvedValue({
          success: true,
          data: [],
        })

        const store = useHolidaysStore()
        store.filters.active = true
        store.filters.client_id = 1

        await store.fetchHolidays()

        expect(holidaysApi.getAll).toHaveBeenCalledWith({
          active: true,
          client_id: 1,
        })
      })

      it('sets error state on fetch failure', async () => {
        vi.mocked(holidaysApi.getAll).mockRejectedValue(
          new Error('Network error')
        )

        const store = useHolidaysStore()
        await expect(store.fetchHolidays()).rejects.toThrow('Network error')
      })
    })

    describe('fetchFederalHolidays', () => {
      it('fetches federal holidays successfully', async () => {
        const mockFederalHolidays = [
          {
            id: 1,
            client_id: 0,
            name: 'New Year',
            is_federal: true,
            active: true,
            holiday_date: '2025-01-01',
          },
          {
            id: 2,
            client_id: 0,
            name: 'Christmas',
            is_federal: true,
            active: true,
            holiday_date: '2025-12-25',
          },
        ]

        vi.mocked(holidaysApi.getFederalHolidays).mockResolvedValue({
          success: true,
          data: mockFederalHolidays,
        })

        const store = useHolidaysStore()
        await store.fetchFederalHolidays()

        expect(store.loading).toBe(false)
        expect(store.federalHolidays).toHaveLength(2)
        expect(store.federalHolidays.every((h) => h.is_federal)).toBe(true)
      })
    })

    describe('fetchClientHolidays', () => {
      it('fetches holidays for specific client successfully', async () => {
        const mockClientHolidays = [
          {
            id: 1,
            client_id: 1,
            name: 'Company Day',
            is_federal: false,
            active: true,
            holiday_date: '2025-07-04',
          },
        ]

        vi.mocked(holidaysApi.getClientHolidays).mockResolvedValue({
          success: true,
          data: mockClientHolidays,
        })

        const store = useHolidaysStore()
        await store.fetchClientHolidays(1)

        expect(store.loading).toBe(false)
        expect(store.clientHolidays).toHaveLength(1)
        expect(store.clientHolidays[0].client_id).toBe(1)
      })

      it('passes year filter to API when provided', async () => {
        vi.mocked(holidaysApi.getClientHolidays).mockResolvedValue({
          success: true,
          data: [],
        })

        const store = useHolidaysStore()
        await store.fetchClientHolidays(1, 2025)

        expect(holidaysApi.getClientHolidays).toHaveBeenCalledWith(1, 2025)
      })
    })

    describe('createHoliday', () => {
      it('creates holiday and adds to store', async () => {
        const newHoliday = {
          id: 1,
          client_id: 1,
          holiday_date: '2025-07-04',
          name: 'New Holiday',
          is_federal: false,
          active: true,
        }

        vi.mocked(holidaysApi.create).mockResolvedValue({
          success: true,
          data: newHoliday,
        })

        const store = useHolidaysStore()
        await store.createHoliday(newHoliday as any)

        expect(store.loading).toBe(false)
        expect(store.holidays).toHaveLength(1)
      })

      it('sets error state on create failure', async () => {
        vi.mocked(holidaysApi.create).mockRejectedValue(
          new Error('Network error')
        )

        const store = useHolidaysStore()
        await expect(store.createHoliday({} as any)).rejects.toThrow(
          'Network error'
        )
      })
    })

    describe('updateHoliday', () => {
      it('updates holiday in store', async () => {
        const updatedHoliday = {
          id: 1,
          client_id: 1,
          holiday_date: '2025-07-04',
          name: 'Updated Holiday',
          is_federal: false,
          active: false,
        }

        vi.mocked(holidaysApi.update).mockResolvedValue({
          success: true,
          data: updatedHoliday,
        })

        const store = useHolidaysStore()
        store.holidays = [
          {
            id: 1,
            client_id: 1,
            name: 'Old Holiday',
            holiday_date: '2025-07-04',
            is_federal: false,
            active: true,
          },
        ]

        await store.updateHoliday(1, updatedHoliday as any)

        expect(store.loading).toBe(false)
        expect(store.holidays[0].name).toBe('Updated Holiday')
        expect(store.holidays[0].active).toBe(false)
      })

      it('sets error state on update failure', async () => {
        vi.mocked(holidaysApi.update).mockRejectedValue(
          new Error('Network error')
        )

        const store = useHolidaysStore()
        await expect(store.updateHoliday(1, {} as any)).rejects.toThrow(
          'Network error'
        )
      })
    })

    describe('deleteHoliday', () => {
      it('removes holiday from store', async () => {
        const deletedHoliday = {
          id: 1,
          client_id: 1,
          holiday_date: '2025-07-04',
          name: 'Deleted Holiday',
          is_federal: false,
          active: false,
        }

        vi.mocked(holidaysApi.delete).mockResolvedValue({
          success: true,
          data: null,
        })

        const store = useHolidaysStore()
        store.holidays = [deletedHoliday]

        await store.deleteHoliday(1)

        expect(store.loading).toBe(false)
        expect(store.holidays).toHaveLength(0)
      })

      it('sets error state on delete failure', async () => {
        vi.mocked(holidaysApi.delete).mockRejectedValue(
          new Error('Network error')
        )

        const store = useHolidaysStore()
        await expect(store.deleteHoliday(1)).rejects.toThrow('Network error')
      })
    })

    describe('checkDateIsHoliday', () => {
      it('returns holiday check result', async () => {
        const mockResult = {
          is_holiday: true,
          date: '2025-12-25',
          holiday_type: 'federal',
          holiday_name: 'Christmas Day',
          message: 'December 25, 2025 is a federal holiday',
        }

        vi.mocked(holidaysApi.checkDateIsHoliday).mockResolvedValue(mockResult)

        const store = useHolidaysStore()
        const result = await store.checkDateIsHoliday(0, '2025-12-25')

        expect(result.is_holiday).toBe(true)
        expect(result.holiday_name).toBe('Christmas Day')
        expect(result.holiday_type).toBe('federal')
      })

      it('handles API errors gracefully', async () => {
        vi.mocked(holidaysApi.checkDateIsHoliday).mockRejectedValue(
          new Error('Network error')
        )

        const store = useHolidaysStore()
        const result = await store.checkDateIsHoliday(0, '2025-12-25')

        expect(result.is_holiday).toBe(false)
        expect(result.holiday_name).toBeNull()
      })
    })

    describe('setFilters', () => {
      it('updates filter state', () => {
        const store = useHolidaysStore()

        store.setFilters({ active: true, client_id: 1 })

        expect(store.filters.active).toBe(true)
        expect(store.filters.client_id).toBe(1)
      })

      it('preserves existing filters when updating partial filters', () => {
        const store = useHolidaysStore()
        store.filters = {
          active: true,
          client_id: 1,
          year: 2024,
          search: 'test',
        }

        store.setFilters({ active: false })

        expect(store.filters.active).toBe(false)
        expect(store.filters.client_id).toBe(1)
        expect(store.filters.year).toBe(2024)
        expect(store.filters.search).toBe('test')
      })
    })

    describe('clearFilters', () => {
      it('resets filters to default state', () => {
        const store = useHolidaysStore()
        store.filters = {
          active: true,
          client_id: 1,
          year: 2024,
          search: 'test',
        }

        store.clearFilters()

        expect(store.filters).toEqual({
          active: null,
          client_id: null,
          year: null,
          search: '',
        })
      })
    })

    describe('clearError', () => {
      it('clears error state', () => {
        const store = useHolidaysStore()
        store.error = 'Test error'

        store.clearError()

        expect(store.error).toBe(null)
      })
    })
  })
})
