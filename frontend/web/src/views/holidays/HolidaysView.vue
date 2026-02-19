<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <AppHeader />

    <div class="py-10">
      <main>
        <div class="w-[90%] mx-auto px-4">
          <div class="px-4 py-4 sm:px-0">
            <header>
              <div class="md:flex md:items-center md:justify-between">
                <div class="flex-1 min-w-0">
                  <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                    Holidays
                  </h1>
                  <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    Manage federal and client holidays for the timesheet application.
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
                    Add Holiday
                  </button>
                </div>
              </div>
            </header>

            <div class="mt-4 bg-white dark:bg-gray-800 shadow rounded-lg">
              <div class="px-6 py-4">
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label for="clientFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Client
                    </label>
                    <select
                      id="clientFilter"
                      v-model="filters.client_id"
                      @change="applyFilters"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option :value="null">All Clients</option>
                      <option :value="0">Federal Holidays</option>
                      <option v-for="client in clients" :key="client.id" :value="client.id">
                        {{ client.organisation }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label for="yearFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Year
                    </label>
                    <select
                      id="yearFilter"
                      v-model="filters.year"
                      @change="applyFilters"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option :value="null">All Years</option>
                      <option v-for="year in availableYears" :key="year" :value="year">
                        {{ year }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label for="activeFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </label>
                    <select
                      id="activeFilter"
                      v-model="filters.active"
                      @change="applyFilters"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option :value="null">All</option>
                      <option :value="true">Active</option>
                      <option :value="false">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label for="searchFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Search
                    </label>
                    <input
                      id="searchFilter"
                      v-model="filters.search"
                      @input="applyFilters"
                      type="text"
                      placeholder="Search by name..."
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="holidaysStore.loading" class="text-center py-8">
              <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 transition ease-in-out duration-150">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading holidays...
              </div>
            </div>

            <div v-else-if="holidaysStore.error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-6">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                    Error loading holidays
                  </h3>
                  <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                    {{ holidaysStore.error }}
                  </p>
                </div>
                <div class="ml-auto pl-3">
                  <button
                    @click="refreshHolidays"
                    class="text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-100"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>

            <DataTable
              v-else
              :data="holidaysStore.filteredHolidays"
              :columns="columns"
              :loading="holidaysStore.loading"
              :error="holidaysStore.error || undefined"
              :actions="actions"
              row-key="id"
              empty-title="No holidays found"
              :empty-message="searchQuery || yearFilter ? 'Try adjusting your filters.' : 'Get started by creating your first holiday.'"
              show-pagination
              :page-size="25"
              :default-sort="{ key: 'holiday_date', order: 'desc' }"
              @retry="refreshHolidays"
            >
              <template #cell-holiday_date="{ item }">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatDate(item.holiday_date) }}
                  </div>
                </div>
              </template>

              <template #cell-client="{ item }">
                <div>
                  <div v-if="item.is_federal" class="text-sm text-gray-900 dark:text-white">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                      Federal
                    </span>
                  </div>
                  <div v-else class="text-sm text-gray-900 dark:text-white">
                    {{ item.client_name || `Client ${item.client_id}` }}
                  </div>
                </div>
              </template>

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

              <template #empty>
                <button
                  @click="openCreateModal"
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  Add Holiday
                </button>
              </template>
            </DataTable>
          </div>
        </div>
      </main>
    </div>

    <HolidayModal
      v-if="showModal"
      :holiday="selectedHoliday"
      @close="closeModal"
      @saved="handleHolidaySaved"
    />

    <ConfirmationModal
      v-if="showDeleteModal"
      :is-open="showDeleteModal"
      title="Delete Holiday"
      :message="`Are you sure you want to delete '${holidayToDelete?.name}'? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      type="danger"
      @confirm="handleDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useHolidaysStore } from '@/stores/holidays'
import { useClientsStore } from '@/stores/clients'
import AppHeader from '@/components/layout/AppHeader.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import HolidayModal from './HolidayModal.vue'
import DataTable from '@/components/DataTable.vue'
import type { TableColumn, TableAction } from '@/components/DataTable.vue'
import type { Holiday } from '@/types/holiday'

// Stores
const holidaysStore = useHolidaysStore()
const clientsStore = useClientsStore()

// Modal state
const showModal = ref(false)
const selectedHoliday = ref<Holiday | null>(null)
const showDeleteModal = ref(false)
const holidayToDelete = ref<Holiday | null>(null)

// Filter state
const filters = ref({
  client_id: null as number | null,
  year: null as number | null,
  active: null as boolean | null,
  search: ''
})

const searchQuery = computed(() => filters.value.search)
const yearFilter = computed(() => filters.value.year)

const clients = computed(() => clientsStore.clients)

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear + 1; i >= currentYear - 2; i--) {
    years.push(i)
  }
  return years
})

// DataTable configuration
const columns: TableColumn[] = [
  {
    key: 'holiday_date',
    title: 'Date',
    sortable: true,
    width: 'w-32'
  },
  {
    key: 'name',
    title: 'Name',
    sortable: true,
    width: 'w-48'
  },
  {
    key: 'client',
    title: 'Client',
    sortable: false,
    width: 'w-40'
  },
  {
    key: 'description',
    title: 'Description',
    sortable: false
  },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    width: 'w-24'
  }
]

const actions: TableAction[] = [
  {
    key: 'edit',
    label: 'Edit',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    handler: (holiday: Holiday) => openEditModal(holiday)
  },
  {
    key: 'delete',
    label: 'Delete',
    variant: 'danger',
    icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    handler: (holiday: Holiday) => confirmDelete(holiday)
  }
]

// Methods
const refreshHolidays = async () => {
  try {
    await Promise.all([
      clientsStore.fetchClients(),
      holidaysStore.fetchHolidays(filters.value)
    ])
  } catch (error) {
    console.error('Failed to refresh holidays:', error)
  }
}

const openCreateModal = () => {
  selectedHoliday.value = null
  showModal.value = true
}

const openEditModal = (holiday: Holiday) => {
  selectedHoliday.value = holiday
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedHoliday.value = null
}

const handleHolidaySaved = () => {
  closeModal()
  refreshHolidays()
}

const confirmDelete = (holiday: Holiday) => {
  holidayToDelete.value = holiday
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  holidayToDelete.value = null
}

const handleDelete = async () => {
  if (!holidayToDelete.value) return

  try {
    await holidaysStore.deleteHoliday(holidayToDelete.value.id)
    showDeleteModal.value = false
    holidayToDelete.value = null
    await refreshHolidays()
  } catch (error) {
    console.error('Failed to delete holiday:', error)
  }
}

const applyFilters = async () => {
  await holidaysStore.fetchHolidays(filters.value)
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

// Lifecycle
onMounted(() => {
  filters.value.year = new Date().getFullYear()
  refreshHolidays()
})
</script>
