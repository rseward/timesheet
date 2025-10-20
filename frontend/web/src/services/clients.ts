import { apiService } from './api'
import type { Client, ClientCreateData } from '@/types/client'

export const clientsApi = {
  async getAll(filters?: { active?: boolean; search?: string }): Promise<{ success: boolean; data: Client[] }> {
    console.log('[ClientsAPI] getAll called with filters:', filters)
    const params = { ...(filters || {}) }
    console.log('[ClientsAPI] Making API request to /clients/ with params:', params)
    
    try {
      const response = await apiService.get<any>('/clients/', { params })
      console.log('[ClientsAPI] Received response:', response)
      console.log('[ClientsAPI] Response type:', typeof response, 'Array:', Array.isArray(response))
      
      let clientsData: Client[]
      
      if (Array.isArray(response)) {
        // Direct array response
        clientsData = response
        console.log('[ClientsAPI] Direct array format detected')
      } else if (response && typeof response === 'object' && response.clients) {
        // Wrapped in clients property - could be array or object
        if (Array.isArray(response.clients)) {
          clientsData = response.clients
          console.log('[ClientsAPI] Clients array format detected')
        } else if (typeof response.clients === 'object') {
          // Backend returns clients as object with client_id as keys, convert to array
          clientsData = Object.values(response.clients)
          console.log('[ClientsAPI] Clients object format detected - converted to array')
        } else {
          clientsData = []
          console.warn('[ClientsAPI] Unexpected clients property format:', response.clients)
        }
      } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
        // Wrapped in data property
        clientsData = response.data
        console.log('[ClientsAPI] Data wrapper format detected')
      } else {
        console.warn('[ClientsAPI] Unexpected response format:', response)
        clientsData = []
      }
      
      // Map backend fields to frontend Client type
      if (Array.isArray(clientsData)) {
        clientsData = clientsData.map((backendClient: any) => {
          // Map backend ClientJson fields to frontend Client type
          const mappedClient: Client = {
            id: backendClient.client_id || backendClient.id,
            organisation: backendClient.organisation,
            description: backendClient.description,
            address1: backendClient.address1,
            address2: backendClient.address2,
            city: backendClient.city,
            state: backendClient.state,
            country: backendClient.country,
            postal_code: backendClient.postal_code,
            // Combine first and last name into contactName
            contactName: backendClient.contact_first_name && backendClient.contact_last_name 
              ? `${backendClient.contact_first_name} ${backendClient.contact_last_name}`
              : backendClient.contactName || '',
            contactEmail: backendClient.contact_email || backendClient.contactEmail,
            phone_number: backendClient.phone_number,
            fax_number: backendClient.fax_number,
            gsm_number: backendClient.gsm_number,
            http_url: backendClient.http_url,
            active: backendClient.active !== undefined ? backendClient.active : true,
            created_at: backendClient.created_at,
            updated_at: backendClient.updated_at
          }
          return mappedClient
        })
      }
      
      console.log('[ClientsAPI] Final clients data:', clientsData?.length || 0, 'clients')
      if (clientsData?.length) {
        clientsData.forEach((client, index) => {
          console.log(`[ClientsAPI] Client ${index}:`, {
            id: client.id,
            organisation: client.organisation,
            active: client.active
          })
        })
      }
      
      return {
        success: true,
        data: clientsData
      }
    } catch (error) {
      console.error('[ClientsAPI] Exception in getAll:', error)
      
      // Log specific error details
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 403) {
          console.error('[ClientsAPI] 🚫 403 Forbidden - Authentication failed for /api/clients/')
        } else if (axiosError.response?.status === 401) {
          console.error('[ClientsAPI] 🚫 401 Unauthorized - Invalid or expired token')
        }
      }
      
      throw error
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
    // Map frontend ClientCreateData to backend ClientJson format
    const backendData = {
      organisation: data.organisation,
      description: data.description || '',
      address1: data.address1 || '',
      address2: data.address2 || '',
      city: data.city || '',
      state: data.state || '',
      country: data.country || '',
      postal_code: data.postal_code || '',
      // Split contactName into first and last name
      contact_first_name: data.contactName?.split(' ')[0] || '',
      contact_last_name: data.contactName?.split(' ').slice(1).join(' ') || '',
      username: data.contactEmail || '',
      contact_email: data.contactEmail || '',
      phone_number: data.phone_number || '',
      fax_number: data.fax_number || null,
      gsm_number: data.gsm_number || null,
      http_url: data.http_url || null,
      active: data.active !== undefined ? data.active : true
    }
    
    const result = await apiService.post<any>('/clients/', backendData)
    
    // Map the response back to frontend format
    const mappedResult: Client = {
      id: result.client_id || result.id,
      organisation: result.organisation,
      description: result.description,
      address1: result.address1,
      address2: result.address2,
      city: result.city,
      state: result.state,
      country: result.country,
      postal_code: result.postal_code,
      contactName: result.contact_first_name && result.contact_last_name 
        ? `${result.contact_first_name} ${result.contact_last_name}`
        : '',
      contactEmail: result.contact_email,
      phone_number: result.phone_number,
      fax_number: result.fax_number,
      gsm_number: result.gsm_number,
      http_url: result.http_url,
      active: result.active !== undefined ? result.active : true,
      created_at: result.created_at,
      updated_at: result.updated_at
    }
    
    return {
      success: true,
      data: mappedResult
    }
  },

  async update(id: number, data: Partial<Client>): Promise<{ success: boolean; data: Client }> {
    // Map frontend Client data to backend ClientJson format
    const backendData = {
      client_id: id,
      organisation: data.organisation,
      description: data.description || '',
      address1: data.address1 || '',
      address2: data.address2 || '',
      city: data.city || '',
      state: data.state || '',
      country: data.country || '',
      postal_code: data.postal_code || '',
      // Split contactName back into first and last name
      contact_first_name: data.contactName?.split(' ')[0] || '',
      contact_last_name: data.contactName?.split(' ').slice(1).join(' ') || '',
      username: data.contactEmail || '',
      contact_email: data.contactEmail || '',
      phone_number: data.phone_number || '',
      fax_number: data.fax_number || null,
      gsm_number: data.gsm_number || null,
      http_url: data.http_url || null,
      active: data.active !== undefined ? data.active : true
    }
    
    const result = await apiService.put<any>('/clients/', backendData)
    
    // Map the response back to frontend format
    const mappedResult: Client = {
      id: result.client_id || result.id,
      organisation: result.organisation,
      description: result.description,
      address1: result.address1,
      address2: result.address2,
      city: result.city,
      state: result.state,
      country: result.country,
      postal_code: result.postal_code,
      contactName: result.contact_first_name && result.contact_last_name 
        ? `${result.contact_first_name} ${result.contact_last_name}`
        : '',
      contactEmail: result.contact_email,
      phone_number: result.phone_number,
      fax_number: result.fax_number,
      gsm_number: result.gsm_number,
      http_url: result.http_url,
      active: result.active !== undefined ? result.active : true,
      created_at: result.created_at,
      updated_at: result.updated_at
    }
    
    return {
      success: true,
      data: mappedResult
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