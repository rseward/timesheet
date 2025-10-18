import { describe, it, expect, vi, beforeEach } from 'vitest'
import { clientsApi } from '../clients'
import { apiService } from '../api'
import type { Client, ClientCreateData } from '@/types/client'

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
        data: mockApiResponse
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const result = await clientsApi.getAll()

      expect(mockApiService.get).toHaveBeenCalledWith('/clients', { params: {} })
      expect(result).toEqual(expectedResponse)
    })

    it('calls GET /clients with active filter', async () => {
      const mockApiResponse = [
        { id: 1, organisation: 'Active Corp', active: true }
      ]
      
      const expectedResponse = {
        success: true,
        data: mockApiResponse
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const result = await clientsApi.getAll({ active: true })

      expect(mockApiService.get).toHaveBeenCalledWith('/clients', { 
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
        data: mockApiResponse
      }
      
      mockApiService.get.mockResolvedValue(mockApiResponse)

      const result = await clientsApi.getAll({ search: 'test' })

      expect(mockApiService.get).toHaveBeenCalledWith('/clients', { 
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
    it('calls POST /clients with client data', async () => {
      const clientData: ClientCreateData = {
        organisation: 'New Corp',
        contactName: 'Jane Smith',
        contactEmail: 'jane@newcorp.com',
        active: true
      }

      const mockApiResponse = {
        id: 3,
        ...clientData
      }
      
      const expectedResponse = {
        success: true,
        data: mockApiResponse
      }
      
      mockApiService.post.mockResolvedValue(mockApiResponse)

      const result = await clientsApi.create(clientData)

      expect(mockApiService.post).toHaveBeenCalledWith('/clients', clientData)
      expect(result).toEqual(expectedResponse)
    })
  })

  describe('update', () => {
    it('calls PUT /clients/:id with update data', async () => {
      const updateData = {
        contactName: 'Updated Name',
        contactEmail: 'updated@email.com'
      }

      const mockApiResponse = {
        id: 1,
        organisation: 'Test Corp',
        contactName: 'Updated Name',
        contactEmail: 'updated@email.com',
        active: true
      }
      
      const expectedResponse = {
        success: true,
        data: mockApiResponse
      }
      
      mockApiService.put.mockResolvedValue(mockApiResponse)

      const result = await clientsApi.update(1, updateData)

      expect(mockApiService.put).toHaveBeenCalledWith('/clients/1', updateData)
      expect(result).toEqual(expectedResponse)
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