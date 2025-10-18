// BillingEvent (Hours/Time Entry) entity types

export interface BillingEvent {
  uid: string
  timekeeper_id: number
  project_id: number
  task_id: number
  project_name?: string
  task_name?: string
  trans_num?: string
  log_message?: string
  start_time: string
  end_time: string
  hours?: number // Calculated field
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface BillingEventCreateData extends Omit<BillingEvent, 'uid' | 'project_name' | 'task_name' | 'hours' | 'created_at' | 'updated_at'> {}

export interface BillingEventUpdateData extends Partial<Omit<BillingEvent, 'uid' | 'created_at' | 'updated_at'>> {}

export interface BillingEventFilters {
  client_id?: number | null
  project_id?: number | null
  task_id?: number | null
  timekeeper_id?: number | null
  start_date?: string
  end_date?: string
  active?: boolean | null
}

export interface BillingEventWithDetails extends BillingEvent {
  project_name: string
  task_name: string
  client_id?: number
  client_name?: string
}

export interface TimeEntry {
  project_id: number
  project_name: string
  task_id: number
  task_name: string
  trans_num: string
  log_message?: string
  start_time: string
  end_time: string
}

export interface HoursCalculation {
  totalHours: number
  entries: BillingEventWithDetails[]
  dateRange: {
    start: string
    end: string
  }
}

// Validation types for time entries
export interface TimeValidation {
  isValid: boolean
  errors: string[]
}

export interface TimeEntryValidationRules {
  startTimeRequired: boolean
  endTimeRequired: boolean
  startBeforeEnd: boolean
  sameDayRequired: boolean
  maxHoursPerDay?: number
  allowOverlap: boolean
}