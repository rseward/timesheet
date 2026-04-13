import { apiService } from './api'

export interface ReportRow {
  client: string | null
  resource: string
  date: string
  hours: number
  bill_rate: number | null
  task: string | null
  project: string | null
}

export interface ReportSummary {
  total_hours: number
  total_rows: number
  unique_resources: number
  unique_projects: number
  unique_clients: number
  date_range: {
    start: string | null
    end: string | null
  }
}

export interface ClientPeriodReportParams {
  start_date: string
  end_date: string
  client_id: number
  project_id?: number
}

export interface TimekeeperPeriodReportParams {
  start_date: string
  end_date: string
  timekeeper_id: number
}

export interface TimePeriodReportParams {
  start_date: string
  end_date: string
}

export interface ReportResult {
  report_type: string
  start_date: string
  end_date: string
  summary: ReportSummary
  rows: ReportRow[]
  client_id?: number
  project_id?: number
  timekeeper_id?: number
}

export const reportsApi = {
  async generateClientPeriodReport(params: ClientPeriodReportParams): Promise<ReportResult> {
    console.log('[ReportsAPI] Generating Client Period Report with params:', params)
    const queryParams: Record<string, any> = {
      start_date: params.start_date,
      end_date: params.end_date,
      client_id: params.client_id,
    }
    if (params.project_id) {
      queryParams.project_id = params.project_id
    }
    const response = await apiService.get<ReportResult>('/reports/client-period', { params: queryParams })
    console.log('[ReportsAPI] Client Period Report response:', response)
    return response
  },

  async generateTimekeeperPeriodReport(params: TimekeeperPeriodReportParams): Promise<ReportResult> {
    console.log('[ReportsAPI] Generating TimeKeeper Period Report with params:', params)
    const queryParams: Record<string, any> = {
      start_date: params.start_date,
      end_date: params.end_date,
      timekeeper_id: params.timekeeper_id,
    }
    const response = await apiService.get<ReportResult>('/reports/timekeeper-period', { params: queryParams })
    console.log('[ReportsAPI] TimeKeeper Period Report response:', response)
    return response
  },

  async generateTimePeriodReport(params: TimePeriodReportParams): Promise<ReportResult> {
    console.log('[ReportsAPI] Generating Time Period Report with params:', params)
    const queryParams: Record<string, any> = {
      start_date: params.start_date,
      end_date: params.end_date,
    }
    const response = await apiService.get<ReportResult>('/reports/time-period', { params: queryParams })
    console.log('[ReportsAPI] Time Period Report response:', response)
    return response
  },

  async listClients(): Promise<{ clients: { client_id: number; organisation: string }[] }> {
    const response = await apiService.get<{ clients: { client_id: number; organisation: string }[] }>('/reports/clients')
    return response
  },

  async listTimekeepers(): Promise<{ timekeepers: { timekeeper_id: number; name: string; username: string }[] }> {
    const response = await apiService.get<{ timekeepers: { timekeeper_id: number; name: string; username: string }[] }>('/reports/timekeepers')
    return response
  },

  async listProjects(clientId?: number): Promise<{ projects: { project_id: number; title: string; client_id: number; client_name: string }[] }> {
    const params: Record<string, any> = {}
    if (clientId) params.client_id = clientId
    const response = await apiService.get<{ projects: { project_id: number; title: string; client_id: number; client_name: string }[] }>('/reports/projects', { params })
    return response
  },

  getCSVUrl(type: 'client-period' | 'timekeeper-period' | 'time-period', params: Record<string, any>): string {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    const queryString = new URLSearchParams(params).toString()
    return `${baseURL}/reports/${type}/csv?${queryString}`
  }
}