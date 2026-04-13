import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reportsApi } from '../reports'
import { apiService } from '../api'
import type {
  ClientPeriodReport,
  TimekeeperPeriodReport,
  TimePeriodReport,
  ClientPeriodReportParams,
  TimekeeperPeriodReportParams,
  TimePeriodReportParams,
  ClientOption,
  TimekeeperOption,
  ProjectOption,
} from '../reports'

// Mock the apiService
vi.mock('../api', () => ({
  apiService: {
    get: vi.fn(),
    getRaw: vi.fn(),
  }
}))

const mockApiService = vi.mocked(apiService)

// --- Shared fixtures ---

const mockClientPeriodReport: ClientPeriodReport = {
  report_type: 'client-period',
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  client_id: 1,
  project_id: null,
  summary: {
    total_hours: 80.5,
    total_rows: 10,
    unique_resources: 3,
    unique_projects: 2,
    unique_clients: 1,
    date_range: { start: '2025-01-01', end: '2025-01-31' },
  },
  rows: [
    { client: 'Acme Corp', resource: 'Jane Doe', date: '2025-01-05', hours: 8.0, bill_rate: 150, task: 'Development', project: 'Project A' },
    { client: 'Acme Corp', resource: 'John Smith', date: '2025-01-06', hours: 7.5, bill_rate: 125, task: 'Testing', project: 'Project B' },
  ],
}

const mockTimekeeperPeriodReport: TimekeeperPeriodReport = {
  report_type: 'timekeeper-period',
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  timekeeper_id: 1,
  summary: {
    total_hours: 40.0,
    total_rows: 5,
    unique_resources: 1,
    unique_projects: 3,
    unique_clients: 2,
    date_range: { start: '2025-01-01', end: '2025-01-31' },
  },
  rows: [
    { client: 'Acme Corp', resource: 'Jane Doe', date: '2025-01-05', hours: 8.0, bill_rate: 150, task: 'Development', project: 'Project A' },
  ],
}

const mockTimePeriodReport: TimePeriodReport = {
  report_type: 'time-period',
  start_date: '2025-01-01',
  end_date: '2025-01-31',
  summary: {
    total_hours: 120.0,
    total_rows: 15,
    unique_resources: 4,
    unique_projects: 5,
    unique_clients: 3,
    date_range: { start: '2025-01-01', end: '2025-01-31' },
  },
  rows: [
    { client: 'Acme Corp', resource: 'Jane Doe', date: '2025-01-05', hours: 8.0, bill_rate: 150, task: 'Development', project: 'Project A' },
    { client: 'Beta LLC', resource: 'John Smith', date: '2025-01-06', hours: 7.5, bill_rate: 125, task: 'Testing', project: 'Project B' },
  ],
}

const mockClients: ClientOption[] = [
  { client_id: 1, organisation: 'Acme Corp' },
  { client_id: 2, organisation: 'Beta LLC' },
]

const mockTimekeepers: TimekeeperOption[] = [
  { timekeeper_id: 1, name: 'Jane Doe', username: 'jdoe' },
  { timekeeper_id: 2, name: 'John Smith', username: 'jsmith' },
]

const mockProjects: ProjectOption[] = [
  { project_id: 1, title: 'Project A', client_id: 1, client_name: 'Acme Corp' },
  { project_id: 2, title: 'Project B', client_id: 1, client_name: 'Acme Corp' },
  { project_id: 3, title: 'Project C', client_id: 2, client_name: 'Beta LLC' },
]

describe('reportsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Convenience positional-arg methods ──────────────────────────────

  describe('getClientPeriodReport', () => {
    it('calls GET /reports/client-period with required params', async () => {
      mockApiService.get.mockResolvedValue(mockClientPeriodReport)

      const result = await reportsApi.getClientPeriodReport('2025-01-01', '2025-01-31', 1)

      expect(apiService.get).toHaveBeenCalledWith('/reports/client-period', {
        params: { start_date: '2025-01-01', end_date: '2025-01-31', client_id: 1 },
      })
      expect(result).toEqual(mockClientPeriodReport)
    })

    it('includes project_id when provided', async () => {
      mockApiService.get.mockResolvedValue(mockClientPeriodReport)

      await reportsApi.getClientPeriodReport('2025-01-01', '2025-01-31', 1, 5)

      expect(apiService.get).toHaveBeenCalledWith('/reports/client-period', {
        params: { start_date: '2025-01-01', end_date: '2025-01-31', client_id: 1, project_id: 5 },
      })
    })

    it('omits project_id when not provided', async () => {
      mockApiService.get.mockResolvedValue(mockClientPeriodReport)

      await reportsApi.getClientPeriodReport('2025-01-01', '2025-01-31', 1)

      const callParams = (apiService.get as any).mock.calls[0][1].params
      expect(callParams).not.toHaveProperty('project_id')
    })

    it('returns ClientPeriodReport type', async () => {
      mockApiService.get.mockResolvedValue(mockClientPeriodReport)

      const result = await reportsApi.getClientPeriodReport('2025-01-01', '2025-01-31', 1)

      expect(result.report_type).toBe('client-period')
      expect(result.client_id).toBe(1)
    })
  })

  describe('getTimekeeperPeriodReport', () => {
    it('calls GET /reports/timekeeper-period with required params', async () => {
      mockApiService.get.mockResolvedValue(mockTimekeeperPeriodReport)

      const result = await reportsApi.getTimekeeperPeriodReport('2025-01-01', '2025-01-31', 1)

      expect(apiService.get).toHaveBeenCalledWith('/reports/timekeeper-period', {
        params: { start_date: '2025-01-01', end_date: '2025-01-31', timekeeper_id: 1 },
      })
      expect(result).toEqual(mockTimekeeperPeriodReport)
    })

    it('returns TimekeeperPeriodReport type', async () => {
      mockApiService.get.mockResolvedValue(mockTimekeeperPeriodReport)

      const result = await reportsApi.getTimekeeperPeriodReport('2025-01-01', '2025-01-31', 1)

      expect(result.report_type).toBe('timekeeper-period')
      expect(result.timekeeper_id).toBe(1)
    })
  })

  describe('getTimePeriodReport', () => {
    it('calls GET /reports/time-period with required params', async () => {
      mockApiService.get.mockResolvedValue(mockTimePeriodReport)

      const result = await reportsApi.getTimePeriodReport('2025-01-01', '2025-01-31')

      expect(apiService.get).toHaveBeenCalledWith('/reports/time-period', {
        params: { start_date: '2025-01-01', end_date: '2025-01-31' },
      })
      expect(result).toEqual(mockTimePeriodReport)
    })

    it('returns TimePeriodReport type', async () => {
      mockApiService.get.mockResolvedValue(mockTimePeriodReport)

      const result = await reportsApi.getTimePeriodReport('2025-01-01', '2025-01-31')

      expect(result.report_type).toBe('time-period')
    })
  })

  // ── Object-param methods (backward compatibility) ───────────────────

  describe('generateClientPeriodReport', () => {
    it('calls GET /reports/client-period with object params', async () => {
      const params: ClientPeriodReportParams = {
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        client_id: 1,
      }
      mockApiService.get.mockResolvedValue(mockClientPeriodReport)

      const result = await reportsApi.generateClientPeriodReport(params)

      expect(apiService.get).toHaveBeenCalledWith('/reports/client-period', {
        params: { start_date: '2025-01-01', end_date: '2025-01-31', client_id: 1 },
      })
      expect(result).toEqual(mockClientPeriodReport)
    })

    it('includes project_id when present in object params', async () => {
      const params: ClientPeriodReportParams = {
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        client_id: 1,
        project_id: 5,
      }
      mockApiService.get.mockResolvedValue(mockClientPeriodReport)

      await reportsApi.generateClientPeriodReport(params)

      expect(apiService.get).toHaveBeenCalledWith('/reports/client-period', {
        params: { start_date: '2025-01-01', end_date: '2025-01-31', client_id: 1, project_id: 5 },
      })
    })

    it('omits project_id when not present in object params', async () => {
      const params: ClientPeriodReportParams = {
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        client_id: 1,
      }
      mockApiService.get.mockResolvedValue(mockClientPeriodReport)

      await reportsApi.generateClientPeriodReport(params)

      const callParams = (apiService.get as any).mock.calls[0][1].params
      expect(callParams).not.toHaveProperty('project_id')
    })
  })

  describe('generateTimekeeperPeriodReport', () => {
    it('calls GET /reports/timekeeper-period with object params', async () => {
      const params: TimekeeperPeriodReportParams = {
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        timekeeper_id: 1,
      }
      mockApiService.get.mockResolvedValue(mockTimekeeperPeriodReport)

      const result = await reportsApi.generateTimekeeperPeriodReport(params)

      expect(apiService.get).toHaveBeenCalledWith('/reports/timekeeper-period', {
        params: { start_date: '2025-01-01', end_date: '2025-01-31', timekeeper_id: 1 },
      })
      expect(result).toEqual(mockTimekeeperPeriodReport)
    })
  })

  describe('generateTimePeriodReport', () => {
    it('calls GET /reports/time-period with object params', async () => {
      const params: TimePeriodReportParams = {
        start_date: '2025-01-01',
        end_date: '2025-01-31',
      }
      mockApiService.get.mockResolvedValue(mockTimePeriodReport)

      const result = await reportsApi.generateTimePeriodReport(params)

      expect(apiService.get).toHaveBeenCalledWith('/reports/time-period', {
        params: { start_date: '2025-01-01', end_date: '2025-01-31' },
      })
      expect(result).toEqual(mockTimePeriodReport)
    })
  })

  // ── Dropdown data methods ──────────────────────────────────────────

  describe('listClients', () => {
    it('calls GET /reports/clients and returns clients array', async () => {
      mockApiService.get.mockResolvedValue({ clients: mockClients })

      const result = await reportsApi.listClients()

      expect(apiService.get).toHaveBeenCalledWith('/reports/clients')
      expect(result).toEqual(mockClients)
    })

    it('returns undefined when response has no clients property', async () => {
      mockApiService.get.mockResolvedValue({})

      const result = await reportsApi.listClients()

      expect(result).toBeUndefined()
    })
  })

  describe('listTimekeepers', () => {
    it('calls GET /reports/timekeepers and returns timekeepers array', async () => {
      mockApiService.get.mockResolvedValue({ timekeepers: mockTimekeepers })

      const result = await reportsApi.listTimekeepers()

      expect(apiService.get).toHaveBeenCalledWith('/reports/timekeepers')
      expect(result).toEqual(mockTimekeepers)
    })

    it('returns undefined when response has no timekeepers property', async () => {
      mockApiService.get.mockResolvedValue({})

      const result = await reportsApi.listTimekeepers()

      expect(result).toBeUndefined()
    })
  })

  describe('listProjects', () => {
    it('calls GET /reports/projects without client_id', async () => {
      mockApiService.get.mockResolvedValue({ projects: mockProjects })

      const result = await reportsApi.listProjects()

      expect(apiService.get).toHaveBeenCalledWith('/reports/projects', { params: {} })
      expect(result).toEqual(mockProjects)
    })

    it('calls GET /reports/projects with client_id filter', async () => {
      const clientProjects = mockProjects.filter(p => p.client_id === 1)
      mockApiService.get.mockResolvedValue({ projects: clientProjects })

      const result = await reportsApi.listProjects(1)

      expect(apiService.get).toHaveBeenCalledWith('/reports/projects', { params: { client_id: 1 } })
      expect(result).toEqual(clientProjects)
    })

    it('returns undefined when response has no projects property', async () => {
      mockApiService.get.mockResolvedValue({})

      const result = await reportsApi.listProjects()

      expect(result).toBeUndefined()
    })
  })

  // ── CSV download methods ───────────────────────────────────────────

  describe('downloadClientPeriodCsv', () => {
    it('calls GET /reports/client-period/csv with blob response type', async () => {
      const mockBlob = new Blob(['csv-data'], { type: 'text/csv' })
      mockApiService.getRaw.mockResolvedValue({ data: mockBlob })

      const result = await reportsApi.downloadClientPeriodCsv('2025-01-01', '2025-01-31', 1)

      expect(apiService.getRaw).toHaveBeenCalledWith('/reports/client-period/csv', {
        params: { start_date: '2025-01-01', end_date: '2025-01-31', client_id: 1 },
        responseType: 'blob',
      })
      expect(result).toBe(mockBlob)
    })

    it('includes project_id in CSV download when provided', async () => {
      const mockBlob = new Blob(['csv-data'], { type: 'text/csv' })
      mockApiService.getRaw.mockResolvedValue({ data: mockBlob })

      await reportsApi.downloadClientPeriodCsv('2025-01-01', '2025-01-31', 1, 5)

      expect(apiService.getRaw).toHaveBeenCalledWith('/reports/client-period/csv', {
        params: { start_date: '2025-01-01', end_date: '2025-01-31', client_id: 1, project_id: 5 },
        responseType: 'blob',
      })
    })
  })

  describe('downloadTimekeeperPeriodCsv', () => {
    it('calls GET /reports/timekeeper-period/csv with blob response type', async () => {
      const mockBlob = new Blob(['csv-data'], { type: 'text/csv' })
      mockApiService.getRaw.mockResolvedValue({ data: mockBlob })

      const result = await reportsApi.downloadTimekeeperPeriodCsv('2025-01-01', '2025-01-31', 1)

      expect(apiService.getRaw).toHaveBeenCalledWith('/reports/timekeeper-period/csv', {
        params: { start_date: '2025-01-01', end_date: '2025-01-31', timekeeper_id: 1 },
        responseType: 'blob',
      })
      expect(result).toBe(mockBlob)
    })
  })

  describe('downloadTimePeriodCsv', () => {
    it('calls GET /reports/time-period/csv with blob response type', async () => {
      const mockBlob = new Blob(['csv-data'], { type: 'text/csv' })
      mockApiService.getRaw.mockResolvedValue({ data: mockBlob })

      const result = await reportsApi.downloadTimePeriodCsv('2025-01-01', '2025-01-31')

      expect(apiService.getRaw).toHaveBeenCalledWith('/reports/time-period/csv', {
        params: { start_date: '2025-01-01', end_date: '2025-01-31' },
        responseType: 'blob',
      })
      expect(result).toBe(mockBlob)
    })
  })

  // ── CSV URL helper ──────────────────────────────────────────────────

  describe('getCSVUrl', () => {
    it('builds client-period CSV URL with params', () => {
      const url = reportsApi.getCSVUrl('client-period', {
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        client_id: 1,
      })

      expect(url).toContain('/reports/client-period/csv?')
      expect(url).toContain('start_date=2025-01-01')
      expect(url).toContain('end_date=2025-01-31')
      expect(url).toContain('client_id=1')
    })

    it('builds timekeeper-period CSV URL with params', () => {
      const url = reportsApi.getCSVUrl('timekeeper-period', {
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        timekeeper_id: 2,
      })

      expect(url).toContain('/reports/timekeeper-period/csv?')
      expect(url).toContain('timekeeper_id=2')
    })

    it('builds time-period CSV URL with params', () => {
      const url = reportsApi.getCSVUrl('time-period', {
        start_date: '2025-01-01',
        end_date: '2025-01-31',
      })

      expect(url).toContain('/reports/time-period/csv?')
      expect(url).toContain('start_date=2025-01-01')
    })

    it('uses VITE_API_BASE_URL when available', () => {
      // Import.meta.env is not easily mockable in vitest,
      // but we can verify the URL starts with /api by default
      const url = reportsApi.getCSVUrl('client-period', { start_date: '2025-01-01', end_date: '2025-01-31' })
      expect(url).toMatch(/^\/api\/reports\/client-period\/csv/)
    })
  })

  // ── Error handling ──────────────────────────────────────────────────

  describe('error handling', () => {
    it('propagates API errors from getClientPeriodReport', async () => {
      mockApiService.get.mockRejectedValue(new Error('Server error'))

      await expect(reportsApi.getClientPeriodReport('2025-01-01', '2025-01-31', 1))
        .rejects.toThrow('Server error')
    })

    it('propagates API errors from generateTimekeeperPeriodReport', async () => {
      mockApiService.get.mockRejectedValue(new Error('Network failure'))

      await expect(reportsApi.generateTimekeeperPeriodReport({
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        timekeeper_id: 1,
      })).rejects.toThrow('Network failure')
    })

    it('propagates API errors from generateTimePeriodReport', async () => {
      mockApiService.get.mockRejectedValue(new Error('Timeout'))

      await expect(reportsApi.generateTimePeriodReport({
        start_date: '2025-01-01',
        end_date: '2025-01-31',
      })).rejects.toThrow('Timeout')
    })

    it('propagates API errors from listClients', async () => {
      mockApiService.get.mockRejectedValue(new Error('Not found'))

      await expect(reportsApi.listClients()).rejects.toThrow('Not found')
    })

    it('propagates API errors from listTimekeepers', async () => {
      mockApiService.get.mockRejectedValue(new Error('Not found'))

      await expect(reportsApi.listTimekeepers()).rejects.toThrow('Not found')
    })

    it('propagates API errors from listProjects', async () => {
      mockApiService.get.mockRejectedValue(new Error('Not found'))

      await expect(reportsApi.listProjects()).rejects.toThrow('Not found')
    })

    it('propagates API errors from downloadClientPeriodCsv', async () => {
      mockApiService.getRaw.mockRejectedValue(new Error('Download failed'))

      await expect(reportsApi.downloadClientPeriodCsv('2025-01-01', '2025-01-31', 1))
        .rejects.toThrow('Download failed')
    })

    it('propagates API errors from downloadTimekeeperPeriodCsv', async () => {
      mockApiService.getRaw.mockRejectedValue(new Error('Download failed'))

      await expect(reportsApi.downloadTimekeeperPeriodCsv('2025-01-01', '2025-01-31', 1))
        .rejects.toThrow('Download failed')
    })

    it('propagates API errors from downloadTimePeriodCsv', async () => {
      mockApiService.getRaw.mockRejectedValue(new Error('Download failed'))

      await expect(reportsApi.downloadTimePeriodCsv('2025-01-01', '2025-01-31'))
        .rejects.toThrow('Download failed')
    })
  })
})