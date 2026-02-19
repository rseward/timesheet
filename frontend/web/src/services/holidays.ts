import { apiService } from './api'
import type { Holiday, HolidayCreateData, HolidayUpdateData, HolidayCheckResult } from '@/types/holiday'

export const holidaysApi = {
  async getAll(filters?: { active?: boolean; client_id?: number; year?: number }): Promise<{ success: boolean; data: Holiday[]; error?: string }> {
    console.log('[HolidaysAPI] getAll called with filters:', filters)
    const params = { ...(filters || {}) }
    console.log('[HolidaysAPI] Making API request to /holidays/ with params:', params)

    try {
      const response = await apiService.get<any>('/holidays/', { params })
      console.log('[HolidaysAPI] Received response:', response)

      let holidaysData: Holiday[]

      if (response && typeof response === 'object' && response.holidays) {
        if (Array.isArray(response.holidays)) {
          holidaysData = response.holidays
          console.log('[HolidaysAPI] Holidays array format detected')
        } else if (typeof response.holidays === 'object') {
          holidaysData = Object.values(response.holidays)
          console.log('[HolidaysAPI] Holidays object format detected - converted to array')
        } else {
          holidaysData = []
          console.warn('[HolidaysAPI] Unexpected holidays property format:', response.holidays)
        }
      } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
        holidaysData = response.data
        console.log('[HolidaysAPI] Data wrapper format detected')
      } else {
        console.warn('[HolidaysAPI] Unexpected response format:', response)
        holidaysData = []
      }

      // Map backend fields to frontend Holiday type
      if (Array.isArray(holidaysData)) {
        holidaysData = holidaysData.map((backendHoliday: any) => {
          const mappedHoliday: Holiday = {
            id: backendHoliday.id || backendHoliday.holiday_id,
            client_id: backendHoliday.client_id,
            holiday_date: backendHoliday.holiday_date,
            name: backendHoliday.name,
            description: backendHoliday.description,
            is_federal: backendHoliday.is_federal || false,
            active: backendHoliday.active !== undefined ? backendHoliday.active : true,
            client_name: backendHoliday.client_name
          }
          return mappedHoliday
        })
      }

      console.log('[HolidaysAPI] Final holidays data:', holidaysData?.length || 0, 'holidays')

      return {
        success: true,
        data: holidaysData
      }
    } catch (error) {
      console.error('[HolidaysAPI] Exception in getAll:', error)
      throw error
    }
  },

  async getById(id: number): Promise<{ success: boolean; data: Holiday; error?: string }> {
    const response = await apiService.get<{ holiday: Holiday }>(`/holidays/${id}`)
    const holidayData = response.holiday as any
    return {
      success: true,
      data: {
        id: holidayData.id || holidayData.holiday_id,
        client_id: holidayData.client_id,
        holiday_date: holidayData.holiday_date,
        name: holidayData.name,
        description: holidayData.description,
        is_federal: holidayData.is_federal,
        active: holidayData.active,
        client_name: holidayData.client_name
      }
    }
  },

  async getFederalHolidays(year?: number): Promise<{ success: boolean; data: Holiday[]; error?: string }> {
    const params = year ? { year } : {}
    const response = await apiService.get<{ holidays: { [key: string]: Holiday } }>('/holidays/federal', { params })

    const holidays = Object.values(response.holidays || {}).map((h: any) => {
      const holidayData = h as any
      return {
        id: holidayData.id || holidayData.holiday_id,
        client_id: holidayData.client_id,
        holiday_date: holidayData.holiday_date,
        name: holidayData.name,
        description: holidayData.description,
        is_federal: holidayData.is_federal,
        active: holidayData.active,
        client_name: holidayData.client_name
      }
    })

    return {
      success: true,
      data: holidays
    }
  },

  async getClientHolidays(clientId: number, year?: number): Promise<{ success: boolean; data: Holiday[]; error?: string }> {
    const params = year ? { year } : {}
    const response = await apiService.get<{ holidays: { [key: string]: Holiday } }>(`/holidays/client/${clientId}`, { params })

    const holidays = Object.values(response.holidays || {}).map((h: any) => ({
      ...h,
      id: h.holiday_id
    }))

    return {
      success: true,
      data: holidays
    }
  },

  async checkDateIsHoliday(clientId: number, date: string): Promise<HolidayCheckResult> {
    const response = await apiService.get<HolidayCheckResult>('/holidays/check-date', {
      params: { client_id: clientId, date }
    })
    return response
  },

  async create(data: HolidayCreateData): Promise<{ success: boolean; data: Holiday; error?: string }> {
    const backendData = {
      client_id: data.client_id,
      holiday_date: data.holiday_date,
      name: data.name,
      description: data.description || null,
      is_federal: data.is_federal || false,
      active: data.active !== undefined ? data.active : true
    }

    const result = await apiService.post<any>('/holidays/', backendData)

    const mappedResult: Holiday = {
      id: result.holiday_id || result.id,
      client_id: result.client_id,
      holiday_date: result.holiday_date,
      name: result.name,
      description: result.description,
      is_federal: result.is_federal,
      active: result.active,
      client_name: result.client_name
    }

    return {
      success: true,
      data: mappedResult
    }
  },

  async update(id: number, data: HolidayUpdateData): Promise<{ success: boolean; data: Holiday; error?: string }> {
    const backendData = {
      holiday_id: id,
      client_id: data.client_id,
      holiday_date: data.holiday_date,
      name: data.name,
      description: data.description || null,
      is_federal: data.is_federal || false,
      active: data.active !== undefined ? data.active : true
    }

    const result = await apiService.put<any>('/holidays/', backendData)

    const mappedResult: Holiday = {
      id: result.holiday_id || result.id,
      client_id: result.client_id,
      holiday_date: result.holiday_date,
      name: result.name,
      description: result.description,
      is_federal: result.is_federal,
      active: result.active,
      client_name: result.client_name
    }

    return {
      success: true,
      data: mappedResult
    }
  },

  async delete(id: number): Promise<{ success: boolean; data: null; error?: string }> {
    await apiService.delete(`/holidays/${id}`)
    return {
      success: true,
      data: null
    }
  }
}
