import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clientsApi } from '../clients'
import { apiService } from '../api'
import type { ClientCreateData } from '@/types/client'

// Mock the API service
vi.mock('../api', () => ({
  apiService: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

const mockApiService = vi.mocked(apiService)

describe('clientsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('calls GET /clients without filters', async () => {
      const mockApiResponse = [
        { id: 1, organisation: 'Test Corp', active: true },
        { id: 2, organisation: 'Another Corp', active: false }
      ]
      
      const expectedResponse = {
        success: true,
        data: [
          {
            id: 1,
            organisation: 'Test Corp',
            description: undefined,
            address1: undefined,
            address2: undefined,
            city: undefined,
            state: undefined,
            country: undefined,
            postal_code: undefined,
            contactName: '',
            contactEmail: undefined,
            phone_number: undefined,
            fax_number: undefined,
            gsm_number: undefined,
            http_url: undefined,
            active: true,
            created_at: undefined,
            updated_at: undefined
          },
          {
            id: 2,
            organisation: 'Another Corp',
            description: undefined,
            address1: undefined,
            address2: undefined,
            city: undefined,
            state: undefined,
            country: undefined,
            postal_code: undefined,
            contactName: '',
            contactEmail: undefined,
            phone_number: undefined,
            fax_number: undefined,
            gsm_number: undefined,
            http_url: undefined,
            active: false,
            created_at: undefined,
            updated_at: undefined
          }
        ]
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const result = await clientsApi.getAll()

      expect(mockApiService.get).toHaveBeenCalledWith('/clients/', { params: {} })
      expect(result).toEqual(expectedResponse)
    })

    it('calls GET /clients with active filter', async () => {
      const mockApiResponse = [
        { id: 1, organisation: 'Active Corp', active: true }
      ]
      
      const expectedResponse = {
        success: true,
        data: [
          {
            id: 1,
            organisation: 'Active Corp',
            description: undefined,
            address1: undefined,
            address2: undefined,
            city: undefined,
            state: undefined,
            country: undefined,
            postal_code: undefined,
            contactName: '',
            contactEmail: undefined,
            phone_number: undefined,
            fax_number: undefined,
            gsm_number: undefined,
            http_url: undefined,
            active: true,
            created_at: undefined,
            updated_at: undefined
          }
        ]
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const result = await clientsApi.getAll({ active: true })

      expect(mockApiService.get).toHaveBeenCalledWith('/clients/', { 
        params: { active: true } 
      })
      expect(result).toEqual(expectedResponse)
    })

    it('calls GET /clients with search filter', async () => {
      const mockApiResponse = [
        { id: 1, organisation: 'Test Corp', active: true }
      ]
      
      const expectedResponse = {
        success: true,
        data: [
          {
            id: 1,
            organisation: 'Test Corp',
            description: undefined,
            address1: undefined,
            address2: undefined,
            city: undefined,
            state: undefined,
            country: undefined,
            postal_code: undefined,
            contactName: '',
            contactEmail: undefined,
            phone_number: undefined,
            fax_number: undefined,
            gsm_number: undefined,
            http_url: undefined,
            active: true,
            created_at: undefined,
            updated_at: undefined
          }
        ]
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const result = await clientsApi.getAll({ search: 'test' })

      expect(mockApiService.get).toHaveBeenCalledWith('/clients/', { 
        params: { search: 'test' } 
      })
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('getById', () => {
    it('calls GET /clients/:id', async () => {
      const mockApiResponse = {
        id: 1,
        organisation: 'Test Corp',
        contactName: 'John Doe',
        contactEmail: 'john@testcorp.com',
        active: true
      }
      
      const expectedResponse = {
        success: true,
        data: mockApiResponse
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const result = await clientsApi.getById(1)

      expect(mockApiService.get).toHaveBeenCalledWith('/clients/1')
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('create', () => {
    it('calls POST /clients/ with transformed client data', async () => {
      const clientData: ClientCreateData = {
        organisation: 'New Corp',
        contactName: 'Jane Smith',
        contactEmail: 'jane@newcorp.com',
        active: true
      }

      const mockApiResponse = {
        id: 3,
        organisation: 'New Corp',
        contact_first_name: 'Jane',
        contact_last_name: 'Smith',
        contact_email: 'jane@newcorp.com',
        active: true
      }

      const expectedBackendData = {
        organisation: 'New Corp',
        description: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        contact_first_name: 'Jane',
        contact_last_name: 'Smith',
        username: 'jane@newcorp.com',
        contact_email: 'jane@newcorp.com',
        phone_number: '',
        fax_number: null,
        gsm_number: null,
        http_url: null,
        active: true
      }

      mockApiService.post.mockResolvedValue(mockApiResponse)

      const result = await clientsApi.create(clientData)

      expect(mockApiService.post).toHaveBeenCalledWith('/clients/', expectedBackendData)
      expect(result.success).toBe(true)
      expect(result.data.organisation).toBe('New Corp')
    })
  })

  describe('update', () => {
    it('calls PUT /clients/ with transformed update data including client_id', async () => {
      const updateData = {
        contactName: 'Updated Name',
        contactEmail: 'updated@email.com',
        active: true
      }

      const mockApiResponse = {
        client_id: 1,
        organisation: 'Test Corp',
        contact_first_name: 'Updated',
        contact_last_name: 'Name',
        contact_email: 'updated@email.com',
        active: true
      }

      const expectedBackendData = {
        client_id: 1,
        organisation: undefined,
        description: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        contact_first_name: 'Updated',
        contact_last_name: 'Name',
        username: 'updated@email.com',
        contact_email: 'updated@email.com',
        phone_number: '',
        fax_number: null,
        gsm_number: null,
        http_url: null,
        active: true
      }

      mockApiService.put.mockResolvedValue(mockApiResponse)

      const result = await clientsApi.update(1, updateData)

      expect(mockApiService.put).toHaveBeenCalledWith('/clients/', expectedBackendData)
      expect(result.success).toBe(true)
      expect(result.data.contactEmail).toBe('updated@email.com')
    })
  })

  describe('delete', () => {
    it('calls DELETE /clients/:id', async () => {
      const mockResponse = {
        success: true,
        data: null
      }
      
      mockApiService.delete.mockResolvedValue(mockResponse)

      const result = await clientsApi.delete(1)

      expect(mockApiService.delete).toHaveBeenCalledWith('/clients/1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('toggleActive', () => {
    it('calls PUT /clients/:id/toggle-active', async () => {
      const mockApiResponse = {
        id: 1,
        organisation: 'Test Corp',
        active: false
      }
      
      const expectedResponse = {
        success: true,
        data: mockApiResponse
      }
      
      mockApiService.put.mockResolvedValue(mockApiResponse)

      const result = await clientsApi.toggleActive(1)

      expect(mockApiService.put).toHaveBeenCalledWith('/clients/1/toggle-active')
      expect(result).toEqual(expectedResponse)
    })
  })
})