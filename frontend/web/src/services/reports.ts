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
  project_id?: number | null
  timekeeper_id?: number
}

// Type aliases used by ReportsView
export type ClientOption = { client_id: number; organisation: string }
export type TimekeeperOption = { timekeeper_id: number; name: string; username: string }
export type ProjectOption = { project_id: number; title: string; client_id: number; client_name: string }

// Report Template types
export type ReportTemplateItem = {
  template_id: number
  name: string
  description: string | null
  report_type: string
  filename: string
  created_by: string | null
  created_at: string | null
  active: boolean
}

// Report result types discriminated by report_type
export interface TimePeriodReport extends ReportResult {
  report_type: 'time-period'
}

export interface ClientPeriodReport extends ReportResult {
  report_type: 'client-period'
  client_id: number
  project_id: number | null
}

export interface TimekeeperPeriodReport extends ReportResult {
  report_type: 'timekeeper-period'
  timekeeper_id: number
}

export const reportsApi = {
  // --- Convenience methods (positional args, used by ReportsView) ---

  async getClientPeriodReport(startDate: string, endDate: string, clientId: number, projectId?: number): Promise<ClientPeriodReport> {
    const params: Record<string, any> = {
      start_date: startDate,
      end_date: endDate,
      client_id: clientId,
    }
    if (projectId !== undefined) {
      params.project_id = projectId
    }
    return apiService.get<ClientPeriodReport>('/reports/client-period', { params })
  },

  async getTimekeeperPeriodReport(startDate: string, endDate: string, timekeeperId: number): Promise<TimekeeperPeriodReport> {
    const params: Record<string, any> = {
      start_date: startDate,
      end_date: endDate,
      timekeeper_id: timekeeperId,
    }
    return apiService.get<TimekeeperPeriodReport>('/reports/timekeeper-period', { params })
  },

  async getTimePeriodReport(startDate: string, endDate: string): Promise<TimePeriodReport> {
    const params: Record<string, any> = {
      start_date: startDate,
      end_date: endDate,
    }
    return apiService.get<TimePeriodReport>('/reports/time-period', { params })
  },

  // --- Object-param methods (kept for backward compatibility) ---

  async generateClientPeriodReport(params: ClientPeriodReportParams): Promise<ClientPeriodReport> {
    console.log('[ReportsAPI] Generating Client Period Report with params:', params)
    const queryParams: Record<string, any> = {
      start_date: params.start_date,
      end_date: params.end_date,
      client_id: params.client_id,
    }
    if (params.project_id) {
      queryParams.project_id = params.project_id
    }
    return apiService.get<ClientPeriodReport>('/reports/client-period', { params: queryParams })
  },

  async generateTimekeeperPeriodReport(params: TimekeeperPeriodReportParams): Promise<TimekeeperPeriodReport> {
    console.log('[ReportsAPI] Generating TimeKeeper Period Report with params:', params)
    const queryParams: Record<string, any> = {
      start_date: params.start_date,
      end_date: params.end_date,
      timekeeper_id: params.timekeeper_id,
    }
    return apiService.get<TimekeeperPeriodReport>('/reports/timekeeper-period', { params: queryParams })
  },

  async generateTimePeriodReport(params: TimePeriodReportParams): Promise<TimePeriodReport> {
    console.log('[ReportsAPI] Generating Time Period Report with params:', params)
    const queryParams: Record<string, any> = {
      start_date: params.start_date,
      end_date: params.end_date,
    }
    return apiService.get<TimePeriodReport>('/reports/time-period', { params: queryParams })
  },

  // --- Dropdown data for report forms ---

  async listClients(): Promise<ClientOption[]> {
    const response = await apiService.get<{ clients: ClientOption[] }>('/reports/clients')
    return response.clients
  },

  async listTimekeepers(): Promise<TimekeeperOption[]> {
    const response = await apiService.get<{ timekeepers: TimekeeperOption[] }>('/reports/timekeepers')
    return response.timekeepers
  },

  async listProjects(clientId?: number): Promise<ProjectOption[]> {
    const params: Record<string, any> = {}
    if (clientId) params.client_id = clientId
    const response = await apiService.get<{ projects: ProjectOption[] }>('/reports/projects', { params })
    return response.projects
  },

  // --- CSV download methods ---

  async downloadClientPeriodCsv(startDate: string, endDate: string, clientId: number, projectId?: number): Promise<Blob> {
    const params: Record<string, any> = {
      start_date: startDate,
      end_date: endDate,
      client_id: clientId,
    }
    if (projectId !== undefined) {
      params.project_id = projectId
    }
    const response = await apiService.getRaw('/reports/client-period/csv', {
      params,
      responseType: 'blob',
    })
    return response.data as Blob
  },

  async downloadTimekeeperPeriodCsv(startDate: string, endDate: string, timekeeperId: number): Promise<Blob> {
    const params: Record<string, any> = {
      start_date: startDate,
      end_date: endDate,
      timekeeper_id: timekeeperId,
    }
    const response = await apiService.getRaw('/reports/timekeeper-period/csv', {
      params,
      responseType: 'blob',
    })
    return response.data as Blob
  },

  async downloadTimePeriodCsv(startDate: string, endDate: string): Promise<Blob> {
    const params: Record<string, any> = {
      start_date: startDate,
      end_date: endDate,
    }
    const response = await apiService.getRaw('/reports/time-period/csv', {
      params,
      responseType: 'blob',
    })
    return response.data as Blob
  },

  // --- CSV URL helper (kept for backward compatibility) ---

  getCSVUrl(type: 'client-period' | 'timekeeper-period' | 'time-period', params: Record<string, any>): string {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    const queryString = new URLSearchParams(params).toString()
    return `${baseURL}/reports/${type}/csv?${queryString}`
  },

  // --- Excel download methods ---

  async downloadClientPeriodExcel(startDate: string, endDate: string, clientId: number, projectId?: number, templateId?: number): Promise<Blob> {
    const params: Record<string, any> = {
      start_date: startDate,
      end_date: endDate,
      client_id: clientId,
    }
    if (projectId !== undefined) params.project_id = projectId
    if (templateId !== undefined) params.template_id = templateId
    const response = await apiService.getRaw('/reports/client-period/excel', {
      params,
      responseType: 'blob',
    })
    return response.data as Blob
  },

  async downloadTimekeeperPeriodExcel(startDate: string, endDate: string, timekeeperId: number, templateId?: number): Promise<Blob> {
    const params: Record<string, any> = {
      start_date: startDate,
      end_date: endDate,
      timekeeper_id: timekeeperId,
    }
    if (templateId !== undefined) params.template_id = templateId
    const response = await apiService.getRaw('/reports/timekeeper-period/excel', {
      params,
      responseType: 'blob',
    })
    return response.data as Blob
  },

  async downloadTimePeriodExcel(startDate: string, endDate: string, templateId?: number): Promise<Blob> {
    const params: Record<string, any> = {
      start_date: startDate,
      end_date: endDate,
    }
    if (templateId !== undefined) params.template_id = templateId
    const response = await apiService.getRaw('/reports/time-period/excel', {
      params,
      responseType: 'blob',
    })
    return response.data as Blob
  },

  // --- Report Template methods ---

  async listTemplates(reportType?: string): Promise<ReportTemplateItem[]> {
    const params: Record<string, any> = {}
    if (reportType) params.report_type = reportType
    const response = await apiService.get<{ templates: ReportTemplateItem[] }>('/reports/templates', { params })
    return response.templates
  },

  async uploadTemplate(formData: FormData): Promise<{ template_id: number; name: string; message: string }> {
    const response = await apiService.post<{ template_id: number; name: string; message: string }>(
      '/reports/templates',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response
  },

  async deleteTemplate(templateId: number): Promise<void> {
    await apiService.delete(`/reports/templates/${templateId}`)
  },
}