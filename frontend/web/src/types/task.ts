// Task entity types

export type TaskStatus = 'Pending' | 'Started' | 'Suspended' | 'Complete'

export interface Task {
  task_id: number
  project_id: number
  project_name?: string
  name: string
  description?: string
  assigned?: string
  started?: string
  suspended?: string
  completed?: string
  http_link?: string
  status: TaskStatus
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface TaskCreateData extends Omit<Task, 'task_id' | 'project_name' | 'created_at' | 'updated_at'> {}

export interface TaskUpdateData extends Partial<Omit<Task, 'task_id' | 'created_at' | 'updated_at'>> {}

export interface TaskFilters {
  client_id?: number | null
  project_id?: number | null
  active?: boolean | null
  status?: TaskStatus | null
  search?: string
}

export interface TaskWithProject extends Task {
  project_name: string
  client_id?: number
  client_name?: string
}

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Started', label: 'Started' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Complete', label: 'Complete' },
]