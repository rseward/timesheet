import { describe, it, expect, vi, beforeEach } from 'vitest'
import { billingEventsApi } from '../billingEvents'
import { apiService } from '../api'
import type { BillingEventCreateData, BillingEventUpdateData } from '@/types/billingEvent'

// Mock the API service
vi.mock('../api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

const mockApiService = vi.mocked(apiService)

describe('billingEventsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockBillingEvent = {
    uid: '1',
    timekeeper_id: 1,
    project_id: 1,
    task_id: 1,
    project_name: 'Test Project',
    task_name: 'Test Task',
    start_time: '2023-01-01T09:00:00',
    end_time: '2023-01-01T17:00:00',
    hours: 8,
    trans_num: 'T001',
    log_message: 'Test work',
    active: true,
    created_at: '2023-01-01T08:00:00',
    updated_at: '2023-01-01T08:00:00'
  }

  describe('getAll', () => {
    it('calls GET /billingevents without filters', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getAll()

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { params: {} })
      expect(result).toEqual(mockResponse)
    })

    it('calls GET /billingevents with client filter', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getAll({ clientId: 1 })

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { client_id: 1 } 
      })
      expect(result).toEqual(mockResponse)
    })

    it('calls GET /billingevents with project filter', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getAll({ projectId: 1 })

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { project_id: 1 } 
      })
      expect(result).toEqual(mockResponse)
    })

    it('calls GET /billingevents with task filter', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getAll({ taskId: 1 })

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { task_id: 1 } 
      })
      expect(result).toEqual(mockResponse)
    })

    it('calls GET /billingevents with date range filters', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getAll({ 
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      })

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { 
          start_date: '2023-01-01',
          end_date: '2023-01-31'
        } 
      })
      expect(result).toEqual(mockResponse)
    })

    it('calls GET /billingevents with timekeeper filter', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getAll({ timekeeperId: 1 })

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { timekeeper_id: 1 } 
      })
      expect(result).toEqual(mockResponse)
    })

    it('calls GET /billingevents with multiple filters', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getAll({ 
        clientId: 1,
        projectId: 1,
        taskId: 1,
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        timekeeperId: 1
      })

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { 
          client_id: 1,
          project_id: 1,
          task_id: 1,
          start_date: '2023-01-01',
          end_date: '2023-01-31',
          timekeeper_id: 1
        } 
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getById', () => {
    it('calls GET /billingevents/:id', async () => {
      mockApiService.get.mockResolvedValue(mockBillingEvent)

      const result = await billingEventsApi.getById(1)

      expect(mockApiService.get).toHaveBeenCalledWith('/events/1')
      expect(result).toEqual(mockBillingEvent)
    })
  })

  describe('create', () => {
    it('calls POST /billingevents with billing event data', async () => {
      const createData: BillingEventCreateData = {
        timekeeper_id: 1,
        project_id: 1,
        task_id: 1,
        start_time: '2023-01-01T09:00:00',
        end_time: '2023-01-01T17:00:00',
        trans_num: 'T001',
        log_message: 'Test work',
        active: true
      }

      mockApiService.post.mockResolvedValue(mockBillingEvent)

      const result = await billingEventsApi.create(createData)

      expect(mockApiService.post).toHaveBeenCalledWith('/events', createData)
      expect(result).toEqual(mockBillingEvent)
    })
  })

  describe('update', () => {
    it('calls PUT /billingevents/:id with update data', async () => {
      const updateData: BillingEventUpdateData = {
        start_time: '2023-01-01T10:00:00',
        end_time: '2023-01-01T18:00:00',
        log_message: 'Updated work description'
      }

      const updatedBillingEvent = { ...mockBillingEvent, ...updateData }
      mockApiService.put.mockResolvedValue(updatedBillingEvent)

      const result = await billingEventsApi.update(1, updateData)

      expect(mockApiService.put).toHaveBeenCalledWith('/events/1', updateData)
      expect(result).toEqual(updatedBillingEvent)
    })
  })

  describe('delete', () => {
    it('calls DELETE /billingevents/:id', async () => {
      mockApiService.delete.mockResolvedValue(undefined)

      await billingEventsApi.delete(1)

      expect(mockApiService.delete).toHaveBeenCalledWith('/events/1')
    })
  })

  describe('getByDateRange', () => {
    it('calls getAll with date range filters', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getByDateRange('2023-01-01', '2023-01-31')

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { 
          start_date: '2023-01-01',
          end_date: '2023-01-31'
        } 
      })
      expect(result).toEqual(mockResponse)
    })

    it('calls getAll with date range and additional filters', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getByDateRange('2023-01-01', '2023-01-31', {
        clientId: 1,
        projectId: 1
      })

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { 
          client_id: 1,
          project_id: 1,
          start_date: '2023-01-01',
          end_date: '2023-01-31'
        } 
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getByProject', () => {
    it('calls getAll with project filter', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getByProject(1)

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { project_id: 1 } 
      })
      expect(result).toEqual(mockResponse)
    })

    it('calls getAll with project filter and date range', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getByProject(1, {
        start: '2023-01-01',
        end: '2023-01-31'
      })

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { 
          project_id: 1,
          start_date: '2023-01-01',
          end_date: '2023-01-31'
        } 
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getByClient', () => {
    it('calls getAll with client filter', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getByClient(1)

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { client_id: 1 } 
      })
      expect(result).toEqual(mockResponse)
    })

    it('calls getAll with client filter and date range', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getByClient(1, {
        start: '2023-01-01',
        end: '2023-01-31'
      })

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { 
          client_id: 1,
          start_date: '2023-01-01',
          end_date: '2023-01-31'
        } 
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getTotalHours', () => {
    it('calls GET /billingevents/total-hours without filters', async () => {
      const mockResponse = { total_hours: 40 }
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getTotalHours()

      expect(mockApiService.get).toHaveBeenCalledWith('/events/total-hours', { params: {} })
      expect(result).toBe(40)
    })

    it('calls GET /billingevents/total-hours with filters', async () => {
      const mockResponse = { total_hours: 20 }
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getTotalHours({
        clientId: 1,
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      })

      expect(mockApiService.get).toHaveBeenCalledWith('/events/total-hours', { 
        params: { 
          client_id: 1,
          start_date: '2023-01-01',
          end_date: '2023-01-31'
        } 
      })
      expect(result).toBe(20)
    })
  })

  describe('getTimeSheet', () => {
    it('calls getAll with timekeeper and date filters', async () => {
      const mockResponse = [mockBillingEvent]
      mockApiService.get.mockResolvedValue(mockResponse)

      const result = await billingEventsApi.getTimeSheet(1, '2023-01-01', '2023-01-31')

      expect(mockApiService.get).toHaveBeenCalledWith('/events/', { 
        params: { 
          timekeeper_id: 1,
          start_date: '2023-01-01',
          end_date: '2023-01-31'
        } 
      })
      expect(result).toEqual(mockResponse)
    })
  })
})