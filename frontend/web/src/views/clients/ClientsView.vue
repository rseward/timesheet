<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- App Header with Profile Navigation -->
    <AppHeader :show-logout="false" />
    
    <div class="py-10">
      <header>
        <div class="w-[90%] mx-auto px-4">
          <div class="md:flex md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
              <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                Clients
              </h1>
              <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Manage your client organizations and contacts.
              </p>
            </div>
            <div class="mt-4 flex md:mt-0 md:ml-4">
              <button
                @click="openCreateModal"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Add Client
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div class="w-[90%] mx-auto px-4">
          <div class="px-4 py-8 sm:px-0">
            <!-- Search and Filter Controls -->
            <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <!-- Search Input -->
              <div>
                <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search clients
                </label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by name, email, city, or state..."
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <!-- Active Filter -->
              <div>
                <label for="active-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  id="active-filter"
                  v-model="activeFilter"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option :value="null">All clients</option>
                  <option :value="true">Active only</option>
                  <option :value="false">Inactive only</option>
                </select>
              </div>

              <!-- Stats Display -->
              <div class="sm:col-span-2 lg:col-span-1">
                <div class="text-sm text-gray-700 dark:text-gray-300">
                  <div>Total: {{ clientsStore.clientsCount }}</div>
                  <div>Active: {{ clientsStore.activeClientsCount }}</div>
                  <div>Filtered: {{ clientsStore.filteredClients.length }}</div>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="clientsStore.loading" class="text-center py-8">
              <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 transition ease-in-out duration-150">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading clients...
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="clientsStore.error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-6">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                    Error loading clients
                  </h3>
                  <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                    {{ clientsStore.error }}
                  </p>
                </div>
                <div class="ml-auto pl-3">
                  <button
                    @click="refreshClients"
                    class="text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-100"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>

            <!-- Data Table with DataTable Component -->
            <DataTable
              v-if="!clientsStore.loading"
              :data="clientsStore.filteredClients"
              :columns="columns"
              :loading="clientsStore.loading"
              :error="clientsStore.error || undefined"
              :actions="actions"
              row-key="id"
              empty-title="No clients found"
              :empty-message="searchQuery || activeFilter !== null ? 'Try adjusting your search or filters.' : 'Get started by creating your first client.'"
              show-pagination
              :page-size="25"
              :default-sort="{ key: 'organisation', order: 'asc' }"
              @retry="refreshClients"
            >
              <!-- Custom cell for Organisation -->
              <template #cell-organisation="{ item }">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ item.organisation }}
                  </div>
                  <div v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400">
                    {{ item.description }}
                  </div>
                </div>
              </template>

              <!-- Custom cell for Location -->
              <template #cell-location="{ item }">
                <div>
                  <div class="text-sm text-gray-900 dark:text-white">
                    <div v-if="item.city && item.state">
                      {{ item.city }}, {{ item.state }}
                    </div>
                    <div v-else-if="item.city">
                      {{ item.city }}
                    </div>
                    <div v-else-if="item.state">
                      {{ item.state }}
                    </div>
                    <div v-else class="text-gray-400 dark:text-gray-500">
                      —
                    </div>
                  </div>
                  <div v-if="item.country" class="text-sm text-gray-500 dark:text-gray-400">
                    {{ item.country }}
                  </div>
                </div>
              </template>

              <!-- Custom cell for Contact -->
              <template #cell-contact="{ item }">
                <div>
                  <div v-if="item.contactEmail" class="text-sm text-gray-900 dark:text-white">
                    <a :href="`mailto:${item.contactEmail}`" class="hover:text-blue-600 dark:hover:text-blue-400">
                      {{ item.contactEmail }}
                    </a>
                  </div>
                  <div v-if="item.contactName" class="text-sm text-gray-500 dark:text-gray-400">
                    {{ item.contactName }}
                  </div>
                  <div v-if="item.phone_number" class="text-sm text-gray-500 dark:text-gray-400">
                    {{ item.phone_number }}
                  </div>
                  <div v-if="!item.contactEmail && !item.contactName && !item.phone_number" class="text-sm text-gray-400 dark:text-gray-500">
                    —
                  </div>
                </div>
              </template>

              <!-- Custom cell for Website -->
              <template #cell-website="{ item }">
                <div v-if="item.http_url" class="text-sm text-gray-900 dark:text-white">
                  <a :href="item.http_url" target="_blank" rel="noopener noreferrer" class="hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center">
                    {{ item.http_url }}
                    <svg class="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <div v-else class="text-sm text-gray-400 dark:text-gray-500">
                  —
                </div>
              </template>

              <!-- Custom cell for Status -->
              <template #cell-status="{ item }">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    item.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  ]"
                >
                  {{ item.active ? 'Active' : 'Inactive' }}
                </span>
              </template>

              <!-- Empty state slot with Add Client button -->
              <template #empty>
                <button
                  v-if="!searchQuery && activeFilter === null"
                  @click="openCreateModal"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  Add Client
                </button>
              </template>
            </DataTable>
          </div>
        </div>
      </main>
    </div>

    <!-- Client Modal -->
    <ClientModal
      v-if="showModal"
      :client="selectedClient"
      @close="closeModal"
      @saved="handleClientSaved"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :is-open="showDeleteModal"
      title="Delete Client"
      :message="`Are you sure you want to delete '${clientToDelete?.organisation}'? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useClientsStore } from '@/stores/clients'
import AppHeader from '@/components/layout/AppHeader.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import ClientModal from './ClientModal.vue'
import DataTable from '@/components/DataTable.vue'
import type { TableColumn, TableAction } from '@/components/DataTable.vue'
import type { Client } from '@/types/client'

// Store
const clientsStore = useClientsStore()

// Modal state
const showModal = ref(false)
const selectedClient = ref<Client | null>(null)
const showDeleteModal = ref(false)
const clientToDelete = ref<Client | null>(null)

// Filter state
const searchQuery = ref('')
const activeFilter = ref<boolean | null>(null)

// DataTable configuration
const columns: TableColumn[] = [
  {
    key: 'organisation',
    title: 'Organisation',
    sortable: true,
    width: 'w-[18%]'
  },
  {
    key: 'location',
    title: 'Location',
    sortable: true,
    sortKey: 'city',  // Sort by city field
    width: 'w-[22%]'
  },
  {
    key: 'contact',
    title: 'Contact',
    sortable: true,
    sortKey: 'contactEmail',  // Sort by email field
    width: 'w-[22%]'
  },
  {
    key: 'website',
    title: 'Website',
    sortable: true,
    sortKey: 'http_url',  // Sort by URL field
    width: 'w-[18%]'
  },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    sortKey: 'active',  // Sort by active field
    width: 'w-[12%]'
  }
]

const actions: TableAction[] = [
  {
    key: 'edit',
    label: 'Edit',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    handler: (client: Client) => openEditModal(client)
  },
  {
    key: 'delete',
    label: 'Delete',
    variant: 'danger',
    icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    handler: (client: Client) => confirmDelete(client)
  }
]

// Update store filters when local filters change
watch([searchQuery, activeFilter], () => {
  clientsStore.setFilters({
    search: searchQuery.value,
    active: activeFilter.value
  })
})

// Methods
const refreshClients = async () => {
  try {
    await clientsStore.fetchClients()
  } catch (error) {
    console.error('Failed to refresh clients:', error)
  }
}

const openCreateModal = () => {
  selectedClient.value = null
  showModal.value = true
}

const openEditModal = (client: Client) => {
  selectedClient.value = client
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedClient.value = null
}

const handleClientSaved = () => {
  closeModal()
  refreshClients()
}

const confirmDelete = (client: Client) => {
  clientToDelete.value = client
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  clientToDelete.value = null
}

const handleDelete = async () => {
  if (!clientToDelete.value) return

  try {
    await clientsStore.deleteClient(clientToDelete.value.id)
    showDeleteModal.value = false
    clientToDelete.value = null
    // Refresh the list to reflect changes
    await refreshClients()
  } catch (error) {
    console.error('Failed to delete client:', error)
    // Error handling is done in the store, the UI will show the error
  }
}

// Initialize
onMounted(() => {
  refreshClients()
})
</script>