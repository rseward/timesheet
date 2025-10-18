// Project entity types

export type ProjectStatus = 'Pending' | 'Started' | 'Suspended' | 'Complete'

export interface Project {
  project_id: number
  client_id: number
  client_name?: string
  title: string
  description?: string
  start_date?: string
  deadline?: string
  http_link?: string
  proj_status: ProjectStatus
  proj_leader?: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface ProjectCreateData extends Omit<Project, 'project_id' | 'client_name' | 'created_at' | 'updated_at'> {}

export interface ProjectUpdateData extends Partial<Omit<Project, 'project_id' | 'created_at' | 'updated_at'>> {}

export interface ProjectFilters {
  client_id?: number | null
  active?: boolean | null
  status?: ProjectStatus | null
  search?: string
}

export interface ProjectWithClient extends Project {
  client_name: string
}

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Started', label: 'Started' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Complete', label: 'Complete' },
]