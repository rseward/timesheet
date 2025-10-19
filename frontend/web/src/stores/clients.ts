import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { clientsApi } from '@/services/clients'
import type { Client, ClientCreateData, ClientUpdateData } from '@/types/client'

export interface ClientFilters {
  active?: boolean | null
  search?: string
}

export const useClientsStore = defineStore('clients', () => {
  // State
  const clients = ref<Client[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ClientFilters>({
    active: null,
    search: ''
  })

  // Getters
  const activeClients = computed(() => 
    clients.value.filter(client => client.active)
  )

  const filteredClients = computed(() => {
    let result = clients.value

    if (filters.value.active !== null && filters.value.active !== undefined) {
      result = result.filter(client => client.active === filters.value.active)
    }

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(client => 
        client.organisation.toLowerCase().includes(search) ||
        client.contactEmail.toLowerCase().includes(search) ||
        client.city?.toLowerCase().includes(search) ||
        client.state?.toLowerCase().includes(search)
      )
    }

    return result
  })

  const clientsCount = computed(() => clients.value.length)
  const activeClientsCount = computed(() => activeClients.value.length)

  // Actions
  const fetchClients = async (params?: any): Promise<void> => {
    console.log('[ClientsStore] fetchClients called with params:', params)
    loading.value = true
    error.value = null

    try {
      // Create filters from current store state if no params provided
      let queryParams = params || {}
      if (!params && (filters.value.active !== null || filters.value.search)) {
        queryParams = {
          ...(filters.value.active !== null && { active: filters.value.active }),
          ...(filters.value.search && { search: filters.value.search })
        }
      }
      
      console.log('[ClientsStore] Making API call with queryParams:', queryParams)
      const response = await clientsApi.getAll(queryParams)
      console.log('[ClientsStore] API response:', response)
      
      if (response.success && response.data) {
        clients.value = response.data
        console.log('[ClientsStore] Successfully updated clients state:', clients.value.length, 'clients loaded')
        console.log('[ClientsStore] Client names:', clients.value.map(c => c.organisation))
      } else {
        error.value = response.error || 'Failed to fetch clients'
        console.error('[ClientsStore] API call failed:', error.value)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch clients'
      console.error('[ClientsStore] Exception in fetchClients:', err)
      throw err
    } finally {
      loading.value = false
      console.log('[ClientsStore] fetchClients completed. Loading:', loading.value, 'Error:', error.value)
    }
  }

  const fetchClientById = async (id: number): Promise<Client | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await clientsApi.getById(id)
      if (response.success && response.data) {
        const client = response.data
        
        // Update client in store if it exists
        const index = clients.value.findIndex(c => c.client_id === id)
        if (index !== -1) {
          clients.value[index] = client
        } else {
          clients.value.push(client)
        }
        
        return client
      } else {
        error.value = response.error || 'Failed to fetch client'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch client'
      return null
    } finally {
      loading.value = false
    }
  }

  const createClient = async (clientData: ClientCreateData): Promise<any> => {
    loading.value = true
    error.value = null

    try {
      const response = await clientsApi.create(clientData)
      if (response.success && response.data) {
        clients.value.push(response.data)
        return response
      } else {
        error.value = response.error || 'Failed to create client'
        return response
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create client'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateClient = async (id: number, clientData: ClientUpdateData): Promise<any> => {
    loading.value = true
    error.value = null

    try {
      const response = await clientsApi.update(id, clientData)
      if (response.success && response.data) {
        const index = clients.value.findIndex(c => c.id === id)
        if (index !== -1) {
          clients.value[index] = response.data
        }
        return response
      } else {
        error.value = response.error || 'Failed to update client'
        return response
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update client'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteClient = async (id: number): Promise<any> => {
    loading.value = true
    error.value = null

    try {
      const response = await clientsApi.delete(id)
      if (response.success) {
        clients.value = clients.value.filter(c => c.id !== id)
        return response
      } else {
        error.value = response.error || 'Failed to delete client'
        return response
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete client'
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchClients = async (query: string): Promise<Client[]> => {
    loading.value = true
    error.value = null

    try {
      const results = await clientsApi.searchClients(query)
      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search clients'
      return []
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters: Partial<ClientFilters>): void => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = (): void => {
    filters.value = {
      active: null,
      search: ''
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  // Utility methods
  const getClientById = (id: number): Client | undefined => {
    return clients.value.find(c => c.id === id)
  }

  const getClientsByIds = (ids: number[]): Client[] => {
    return clients.value.filter(c => ids.includes(c.id))
  }

  return {
    // State (direct refs for test mutability)
    clients,
    loading,
    error,
    filters,

    // Getters
    activeClients,
    filteredClients,
    clientsCount,
    activeClientsCount,

    // Actions
    fetchClients,
    fetchClientById,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    setFilters,
    clearFilters,
    clearError,

    // Utilities
    getClientById,
    getClientsByIds
  }
})