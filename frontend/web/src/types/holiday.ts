// Holiday entity types

export interface Holiday {
  id: number
  client_id: number
  holiday_date: string
  name: string
  description?: string
  is_federal: boolean
  active: boolean
  client_name?: string
}

export interface HolidayCreateData extends Omit<Holiday, 'id' | 'client_name'> {}

export interface HolidayUpdateData extends Partial<Omit<Holiday, 'id' | 'client_name'>> {}

export interface HolidayFilters {
  active?: boolean | null
  client_id?: number | null
  year?: number | null
  search?: string
}

export interface HolidayCheckResult {
  is_holiday: boolean
  date: string
  holiday_type: 'federal' | 'client' | null
  holiday_name: string | null
  holiday_description?: string | null
  message: string | null
}
