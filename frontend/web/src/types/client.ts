// Client entity types

export interface Client {
  client_id: number
  organisation: string
  description?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  contact_first_name?: string
  contact_last_name?: string
  username?: string
  contact_email?: string
  phone_number?: string
  fax_number?: string
  gsm_number?: string
  http_url?: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface ClientCreateData extends Omit<Client, 'client_id' | 'created_at' | 'updated_at'> {}

export interface ClientUpdateData extends Partial<Omit<Client, 'client_id' | 'created_at' | 'updated_at'>> {}

export interface ClientFilters {
  active?: boolean | null
  search?: string
  organisation?: string
  city?: string
  state?: string
}