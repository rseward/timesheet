// Client entity types

export interface Client {
  id: number
  organisation: string
  description?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  contactName?: string
  contactEmail?: string
  phone_number?: string
  fax_number?: string
  gsm_number?: string
  http_url?: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface ClientCreateData extends Omit<Client, 'id' | 'created_at' | 'updated_at'> {}

export interface ClientUpdateData extends Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>> {}

export interface ClientFilters {
  active?: boolean | null
  search?: string
  organisation?: string
  city?: string
  state?: string
}