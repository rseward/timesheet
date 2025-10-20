import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useClientsStore } from '../clients'
import { clientsApi } from '@/services/clients'
import type { Client } from '@/types/client'

// Mock client data factory function to ensure fresh data for each test
const createMockClientsData = () => [
  {
    client_id: 1,
    id: 1,
    organisation: 'Bluestone Consulting',
    contactEmail: 'rseward@bluestone-consulting.com',
    active: true,
    city: 'Portland',
    state: 'OR',
    address: '123 Main St',
    phone: '555-0101'
  },
  {
    client_id: 2,
    id: 2,
    organisation: 'Tech Innovations LLC',
    contactEmail: 'contact@techinnovations.com',
    active: true,
    city: 'Seattle',
    state: 'WA',
    address: '456 Tech Ave',
    phone: '555-0202'
  },
  {
    client_id: 3,
    id: 3,
    organisation: 'Old Company Inc',
    contactEmail: 'info@oldcompany.com',
    active: false,
    city: 'San Francisco',
    state: 'CA',
    address: '789 Old St',
    phone: '555-0303'
  }
]

// Keep the original for backward compatibility where it's not mutated
const mockClientsData = createMockClientsData()

describe('Clients Store Integration Tests', () => {
  let clientsStore: ReturnType<typeof useClientsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    clientsStore = useClientsStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchClients', () => {
    it('should successfully fetch and store clients data', async () => {
      // Mock successful service response
      vi.spyOn(clientsApi, 'getAll').mockResolvedValue({
        success: true,
        data: mockClientsData
      })

      // Execute
      await clientsStore.fetchClients()

      // Verify service call
      expect(clientsApi.getAll).toHaveBeenCalledWith({})

      // Verify store state
      expect(clientsStore.loading).toBe(false)
      expect(clientsStore.error).toBe(null)
      expect(clientsStore.clients).toHaveLength(3)
      expect(clientsStore.clients[0].organisation).toBe('Bluestone Consulting')
      expect(clientsStore.clients[1].organisation).toBe('Tech Innovations LLC')
      expect(clientsStore.clients[2].organisation).toBe('Old Company Inc')
    })

    it('should handle service wrapper response format', async () => {
      vi.spyOn(clientsApi, 'getAll').mockResolvedValue({
        success: true,
        data: mockClientsData
      })

      await clientsStore.fetchClients()

      expect(clientsStore.clients).toHaveLength(3)
      expect(clientsStore.error).toBe(null)
    })

    it('should handle wrapped error response', async () => {
      // Mock service throwing an error
      vi.spyOn(clientsApi, 'getAll').mockRejectedValue(new Error('Failed to fetch clients from server'))

      await clientsStore.fetchClients()

      expect(clientsStore.clients).toHaveLength(0)
      expect(clientsStore.error).toBe('Failed to fetch clients from server')
      expect(clientsStore.loading).toBe(false)
    })

    it('should handle network/API errors with exception thrown', async () => {
      // Mock service throwing error
      const networkError = new Error('Network timeout')
      vi.spyOn(clientsApi, 'getAll').mockRejectedValue(networkError)

      // Should propagate the error
      await expect(clientsStore.fetchClients()).rejects.toThrow('Network timeout')

      expect(clientsStore.clients).toHaveLength(0)
      expect(clientsStore.error).toBe('Network timeout')
      expect(clientsStore.loading).toBe(false)
    })

    it('should handle 401 authentication errors', async () => {
      const authError = new Error('Unauthorized')
      authError.name = 'AxiosError'
      ;(authError as any).response = { status: 401 }

      vi.spyOn(clientsApi, 'getAll').mockRejectedValue(authError)

      await expect(clientsStore.fetchClients()).rejects.toThrow('Unauthorized')
      expect(clientsStore.error).toBe('Unauthorized')
    })

    it('should handle 404 endpoint not found errors', async () => {
      const notFoundError = new Error('Request failed with status code 404')
      notFoundError.name = 'AxiosError'
      ;(notFoundError as any).response = { status: 404 }

      vi.spyOn(clientsApi, 'getAll').mockRejectedValue(notFoundError)

      await expect(clientsStore.fetchClients()).rejects.toThrow('Request failed with status code 404')
      expect(clientsStore.error).toBe('Request failed with status code 404')
    })

    it('should apply filters when fetching clients', async () => {
      vi.spyOn(clientsApi, 'getAll').mockResolvedValue({
        success: true,
        data: mockClientsData
      })

      // Set filters in store
      clientsStore.setFilters({ active: true, search: 'tech' })

      await clientsStore.fetchClients()

      expect(clientsApi.getAll).toHaveBeenCalledWith({ active: true, search: 'tech' })
    })

    it('should override store filters with provided params', async () => {
      vi.spyOn(clientsApi, 'getAll').mockResolvedValue({
        success: true,
        data: mockClientsData
      })

      // Set filters in store
      clientsStore.setFilters({ active: true, search: 'old' })

      // But pass different params to fetchClients
      await clientsStore.fetchClients({ active: false, search: 'new' })

      expect(clientsApi.getAll).toHaveBeenCalledWith({ active: false, search: 'new' })
    })

    it('should show loading state during fetch', async () => {
      let resolvePromise!: (value: { success: boolean; data: Client[] }) => void
      const promise = new Promise<{ success: boolean; data: Client[] }>(resolve => {
        resolvePromise = resolve
      })

      vi.spyOn(clientsApi, 'getAll').mockReturnValue(promise)

      // Start fetch
      const fetchPromise = clientsStore.fetchClients()

      // Should be loading
      expect(clientsStore.loading).toBe(true)
      expect(clientsStore.error).toBe(null)

      // Resolve
      resolvePromise({ success: true, data: mockClientsData })
      await fetchPromise

      // Should no longer be loading
      expect(clientsStore.loading).toBe(false)
    })
  })

  describe('computed properties', () => {
    beforeEach(async () => {
      vi.spyOn(clientsApi, 'getAll').mockResolvedValue({
        success: true,
        data: mockClientsData
      })
      await clientsStore.fetchClients()
    })

    it('should filter active clients correctly', () => {
      expect(clientsStore.activeClients).toHaveLength(2)
      expect(clientsStore.activeClients.map(c => c.organisation)).toEqual([
        'Bluestone Consulting',
        'Tech Innovations LLC'
      ])
    })

    it('should filter clients by search term', () => {
      clientsStore.setFilters({ search: 'blue' })
      
      expect(clientsStore.filteredClients).toHaveLength(1)
      expect(clientsStore.filteredClients[0].organisation).toBe('Bluestone Consulting')
    })

    it('should filter clients by active status', () => {
      clientsStore.setFilters({ active: false })
      
      expect(clientsStore.filteredClients).toHaveLength(1)
      expect(clientsStore.filteredClients[0].organisation).toBe('Old Company Inc')
    })

    it('should combine active and search filters', () => {
      clientsStore.setFilters({ active: true, search: 'tech' })
      
      expect(clientsStore.filteredClients).toHaveLength(1)
      expect(clientsStore.filteredClients[0].organisation).toBe('Tech Innovations LLC')
    })

    it('should search across multiple fields', () => {
      // Search by email
      clientsStore.setFilters({ search: 'rseward' })
      expect(clientsStore.filteredClients).toHaveLength(1)
      expect(clientsStore.filteredClients[0].organisation).toBe('Bluestone Consulting')

      // Search by city
      clientsStore.setFilters({ search: 'seattle' })
      expect(clientsStore.filteredClients).toHaveLength(1)
      expect(clientsStore.filteredClients[0].organisation).toBe('Tech Innovations LLC')

      // Search by state
      clientsStore.setFilters({ search: 'ca' })
      expect(clientsStore.filteredClients).toHaveLength(1)
      expect(clientsStore.filteredClients[0].organisation).toBe('Old Company Inc')
    })

    it('should provide correct counts', () => {
      expect(clientsStore.clientsCount).toBe(3)
      expect(clientsStore.activeClientsCount).toBe(2)
    })
  })

  describe('fetchClientById', () => {
    it('should fetch and update existing client in store', async () => {
      // First populate store with fresh data
      const freshMockData = createMockClientsData()
      vi.spyOn(clientsApi, 'getAll').mockResolvedValue({
        success: true,
        data: freshMockData
      })
      await clientsStore.fetchClients()

      // Mock single client fetch
      const updatedClient = { ...freshMockData[0], organisation: 'Updated Bluestone' }
      vi.spyOn(clientsApi, 'getById').mockResolvedValue({
        success: true,
        data: updatedClient
      })

      const result = await clientsStore.fetchClientById(1)

      expect(clientsApi.getById).toHaveBeenCalledWith(1)
      expect(result).toEqual(updatedClient)
      expect(clientsStore.clients[0].organisation).toBe('Updated Bluestone')
    })

    it('should add new client to store if not exists', async () => {
      const newClient = {
        client_id: 4,
        id: 4,
        organisation: 'New Client',
        contactEmail: 'new@client.com',
        active: true,
        city: 'Denver',
        state: 'CO'
      }

      vi.spyOn(clientsApi, 'getById').mockResolvedValue({
        success: true,
        data: newClient
      })

      const result = await clientsStore.fetchClientById(4)

      expect(result).toEqual(newClient)
      expect(clientsStore.clients).toHaveLength(1)
      expect(clientsStore.clients[0].organisation).toBe('New Client')
    })

    it('should handle fetch error gracefully', async () => {
      vi.spyOn(clientsApi, 'getById').mockRejectedValue(new Error('Client not found'))

      const result = await clientsStore.fetchClientById(999)

      expect(result).toBeNull()
      expect(clientsStore.error).toBe('Client not found')
    })
  })

  describe('createClient', () => {
    it('should create client and add to store', async () => {
      const newClientData = {
        organisation: 'Brand New Corp',
        contactEmail: 'contact@brandnew.com',
        active: true,
        city: 'Austin',
        state: 'TX'
      }

      const createdClient = {
        ...newClientData,
        client_id: 4,
        id: 4
      }

      const successResponse = {
        success: true,
        data: createdClient
      }

      vi.spyOn(clientsApi, 'create').mockResolvedValue(successResponse)

      const result = await clientsStore.createClient(newClientData)

      expect(clientsApi.create).toHaveBeenCalledWith(newClientData)
      expect(result.success).toBe(true)
      expect(clientsStore.clients).toHaveLength(1)
      expect(clientsStore.clients[0].organisation).toBe('Brand New Corp')
    })

    it('should handle create error response', async () => {
      vi.spyOn(clientsApi, 'create').mockRejectedValue(new Error('Validation failed'))

      const result = await clientsStore.createClient({
        organisation: 'Test',
        contactEmail: 'test@test.com',
        active: true
      })

      expect(result.success).toBe(false)
      expect(clientsStore.error).toBe('Validation failed')
      expect(clientsStore.clients).toHaveLength(0)
    })
  })

  describe('utility methods', () => {
    beforeEach(async () => {
      // Ensure clean state by directly setting clients array
      clientsStore.clients = []
      
      vi.spyOn(clientsApi, 'getAll').mockResolvedValue({
        success: true,
        data: createMockClientsData() // Create fresh data to avoid mutation
      })
      await clientsStore.fetchClients()
    })

    it('should find client by id', () => {
      const client = clientsStore.getClientById(2)
      expect(client?.organisation).toBe('Tech Innovations LLC')
    })

    it('should return undefined for non-existent client', () => {
      const client = clientsStore.getClientById(999)
      expect(client).toBeUndefined()
    })

    it('should get multiple clients by ids', () => {
      const clients = clientsStore.getClientsByIds([1, 3])
      expect(clients).toHaveLength(2)
      expect(clients.map(c => c.organisation)).toEqual([
        'Bluestone Consulting',
        'Old Company Inc'
      ])
    })

    it('should clear error state', () => {
      clientsStore.error = 'Some error'
      clientsStore.clearError()
      expect(clientsStore.error).toBe(null)
    })

    it('should clear filters', () => {
      clientsStore.setFilters({ active: true, search: 'test' })
      clientsStore.clearFilters()
      
      expect(clientsStore.filters.active).toBe(null)
      expect(clientsStore.filters.search).toBe('')
    })
  })
})