import { apiService } from './api'
import type { Client, ClientCreateData } from '@/types/client'

export const clientsApi = {
  async getAll(filters?: { active?: boolean; search?: string }): Promise<{ success: boolean; data: Client[] }> {
    const params = { ...(filters || {}) }
    const data = await apiService.get<Client[]>('/clients', { params })
    return {
      success: true,
      data
    }
  },

  async getById(id: number): Promise<{ success: boolean; data: Client }> {
    const data = await apiService.get<Client>(`/clients/${id}`)
    return {
      success: true,
      data
    }
  },

  async create(data: ClientCreateData): Promise<{ success: boolean; data: Client }> {
    const result = await apiService.post<Client>('/clients', data)
    return {
      success: true,
      data: result
    }
  },

  async update(id: number, data: Partial<Client>): Promise<{ success: boolean; data: Client }> {
    const result = await apiService.put<Client>(`/clients/${id}`, data)
    return {
      success: true,
      data: result
    }
  },

  async delete(id: number): Promise<{ success: boolean; data: null }> {
    await apiService.delete(`/clients/${id}`)
    return {
      success: true,
      data: null
    }
  },

  async toggleActive(id: number): Promise<{ success: boolean; data: Client }> {
    const result = await apiService.put<Client>(`/clients/${id}/toggle-active`)
    return {
      success: true,
      data: result
    }
  },

  async getActiveClients(): Promise<Client[]> {
    const result = await this.getAll({ active: true })
    return result.data
  },

  async searchClients(query: string): Promise<Client[]> {
    const params = { search: query }
    const response = await apiService.get<Client[]>('/clients/search', { params })
    return response
  }
}