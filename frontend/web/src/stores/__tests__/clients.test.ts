import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useClientsStore } from '../clients'
import { clientsApi } from '@/services/clients'
import type { Client } from '@/types/client'

// Mock clients API
vi.mock('@/services/clients', () => ({
  clientsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleActive: vi.fn()
  }
}))

const mockClientsApi = vi.mocked(clientsApi)

describe('Clients Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockClients: Client[] = [
    {
      id: 1,
      organisation: 'Active Corp',
      contactName: 'John Doe',
      contactEmail: 'john@activecorp.com',
      active: true
    },
    {
      id: 2,
      organisation: 'Inactive Corp',
      contactName: 'Jane Smith',
      contactEmail: 'jane@inactivecorp.com',
      active: false
    },
    {
      id: 3,
      organisation: 'Test Company',
      contactName: 'Bob Johnson',
      contactEmail: 'bob@testcompany.com',
      active: true
    }
  ]

  describe('initialization', () => {
    it('initializes with empty state', () => {
      const store = useClientsStore()
      
      expect(store.clients).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.filters.active).toBeNull()
      expect(store.filters.search).toBe('')
    })
  })

  describe('computed properties', () => {
    it('activeClients returns only active clients', () => {
      const store = useClientsStore()
      store.clients = mockClients
      
      const activeClients = store.activeClients
      
      expect(activeClients).toHaveLength(2)
      expect(activeClients.every(client => client.active)).toBe(true)
      expect(activeClients.map(c => c.organisation)).toEqual(['Active Corp', 'Test Company'])
    })

    it('filteredClients applies active filter', () => {
      const store = useClientsStore()
      store.clients = mockClients
      store.filters.active = true
      
      const filteredClients = store.filteredClients
      
      expect(filteredClients).toHaveLength(2)
      expect(filteredClients.every(client => client.active)).toBe(true)
    })

    it('filteredClients applies search filter', () => {
      const store = useClientsStore()
      store.clients = mockClients
      store.filters.search = 'test'
      
      const filteredClients = store.filteredClients
      
      expect(filteredClients).toHaveLength(1)
      expect(filteredClients[0].organisation).toBe('Test Company')
    })

    it('filteredClients applies both filters', () => {
      const store = useClientsStore()
      store.clients = mockClients
      store.filters.active = true
      store.filters.search = 'corp'
      
      const filteredClients = store.filteredClients
      
      expect(filteredClients).toHaveLength(1)
      expect(filteredClients[0].organisation).toBe('Active Corp')
    })
  })

  describe('fetchClients', () => {
    it('fetches clients successfully', async () => {
      const store = useClientsStore()
      const mockResponse = {
        success: true,
        data: mockClients
      }
      
      mockClientsApi.getAll.mockResolvedValue(mockResponse)

      await store.fetchClients()

      expect(store.loading).toBe(false)
      expect(store.clients).toEqual(mockClients)
      expect(store.error).toBeNull()
      expect(mockClientsApi.getAll).toHaveBeenCalledWith({})
    })

    it('fetches clients with filters', async () => {
      const store = useClientsStore()
      store.filters.active = true
      store.filters.search = 'test'
      
      const mockResponse = {
        success: true,
        data: [mockClients[2]]
      }
      
      mockClientsApi.getAll.mockResolvedValue(mockResponse)

      await store.fetchClients()

      expect(mockClientsApi.getAll).toHaveBeenCalledWith({
        active: true,
        search: 'test'
      })
    })

    it('handles fetch error', async () => {
      const store = useClientsStore()
      const mockError = {
        success: false,
        data: [],
        error: 'Network error'
      }
      
      mockClientsApi.getAll.mockResolvedValue(mockError)

      await store.fetchClients()

      expect(store.loading).toBe(false)
      expect(store.clients).toEqual([])
      expect(store.error).toBe('Network error')
    })

    it('sets loading state during fetch', async () => {
      const store = useClientsStore()
      mockClientsApi.getAll.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true, data: [] }), 100))
      )

      const fetchPromise = store.fetchClients()
      
      expect(store.loading).toBe(true)
      
      await fetchPromise
      
      expect(store.loading).toBe(false)
    })
  })

  describe('createClient', () => {
    it('creates client successfully', async () => {
      const store = useClientsStore()
      const newClientData = {
        organisation: 'New Corp',
        contactName: 'Alice Brown',
        contactEmail: 'alice@newcorp.com',
        active: true
      }
      
      const newClient = { id: 4, ...newClientData }
      const mockResponse = {
        success: true,
        data: newClient
      }
      
      mockClientsApi.create.mockResolvedValue(mockResponse)

      const result = await store.createClient(newClientData)

      expect(store.clients).toHaveLength(1)
      expect(store.clients[0]).toEqual(newClient)
      expect(result).toEqual(mockResponse)
      expect(mockClientsApi.create).toHaveBeenCalledWith(newClientData)
    })

    it('handles create error', async () => {
      const store = useClientsStore()
      const mockError = {
        success: false,
        data: {} as any,
        error: 'Validation failed'
      }
      
      mockClientsApi.create.mockResolvedValue(mockError)

      const result = await store.createClient({
        organisation: '',
        contactName: '',
        contactEmail: '',
        active: true
      })

      expect(store.error).toBe('Validation failed')
      expect(result.success).toBe(false)
    })
  })

  describe('updateClient', () => {
    it('updates client successfully', async () => {
      const store = useClientsStore()
      store.clients = [...mockClients]
      
      const updateData = { contactName: 'Updated Name' }
      const updatedClient = { ...mockClients[0], ...updateData }
      const mockResponse = {
        success: true,
        data: updatedClient
      }
      
      mockClientsApi.update.mockResolvedValue(mockResponse)

      const result = await store.updateClient(1, updateData)

      expect(store.clients[0]).toEqual(updatedClient)
      expect(result).toEqual(mockResponse)
      expect(mockClientsApi.update).toHaveBeenCalledWith(1, updateData)
    })

    it('handles update error', async () => {
      const store = useClientsStore()
      const mockError = {
        success: false,
        data: {} as any,
        error: 'Client not found'
      }
      
      mockClientsApi.update.mockResolvedValue(mockError)

      const result = await store.updateClient(999, { contactName: 'New Name' })

      expect(store.error).toBe('Client not found')
      expect(result.success).toBe(false)
    })
  })

  describe('deleteClient', () => {
    it('deletes client successfully', async () => {
      const store = useClientsStore()
      store.clients = [...mockClients]
      
      const mockResponse = {
        success: true,
        data: null
      }
      
      mockClientsApi.delete.mockResolvedValue(mockResponse)

      const result = await store.deleteClient(1)

      expect(store.clients).not.toContain(mockClients[0])
      expect(store.clients).toHaveLength(2)
      expect(result).toEqual(mockResponse)
      expect(mockClientsApi.delete).toHaveBeenCalledWith(1)
    })

    it('handles delete error', async () => {
      const store = useClientsStore()
      const mockError = {
        success: false,
        data: null,
        error: 'Cannot delete client with active projects'
      }
      
      mockClientsApi.delete.mockResolvedValue(mockError)

      const result = await store.deleteClient(1)

      expect(store.error).toBe('Cannot delete client with active projects')
      expect(result.success).toBe(false)
    })
  })

  describe('setFilters', () => {
    it('updates filters', () => {
      const store = useClientsStore()
      
      store.setFilters({ active: true })
      expect(store.filters.active).toBe(true)
      expect(store.filters.search).toBe('')
      
      store.setFilters({ search: 'test' })
      expect(store.filters.active).toBe(true)
      expect(store.filters.search).toBe('test')
      
      store.setFilters({ active: null, search: '' })
      expect(store.filters.active).toBeNull()
      expect(store.filters.search).toBe('')
    })
  })

  describe('clearError', () => {
    it('clears error state', () => {
      const store = useClientsStore()
      store.error = 'Some error'
      
      store.clearError()
      
      expect(store.error).toBeNull()
    })
  })
})