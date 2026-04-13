<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="py-10">
      <header>
        <div class="w-[90%] mx-auto px-4">
          <h1 class="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">Reports</h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Generate and view various timesheet and billing reports
          </p>
        </div>
      </header>
      <main>
        <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <!-- Report Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Client Period Report -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 dark:border-gray-700">
                <div class="flex items-center mb-4">
                  <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 class="ml-3 text-lg font-semibold text-gray-900 dark:text-white">Client Period Report</h3>
                </div>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  Generate detailed reports for specific clients within a date range, including project breakdowns and total hours.
                </p>
                <button
                  @click="openReportForm('client')"
                  class="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  Generate Report
                </button>
              </div>

              <!-- TimeKeeper Period Report -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 dark:border-gray-700">
                <div class="flex items-center mb-4">
                  <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 class="ml-3 text-lg font-semibold text-gray-900 dark:text-white">TimeKeeper Period Report</h3>
                </div>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  Comprehensive time tracking report showing all billable hours, tasks, and activities for a specific timekeeper within a specified period.
                </p>
                <button
                  @click="openReportForm('timekeeper')"
                  class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  Generate Report
                </button>
              </div>

              <!-- Time Period Report -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 dark:border-gray-700">
                <div class="flex items-center mb-4">
                  <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <svg class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 class="ml-3 text-lg font-semibold text-gray-900 dark:text-white">Time Period Report</h3>
                </div>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  General time analysis report showing work patterns, productivity metrics, and time distribution across all projects.
                </p>
                <button
                  @click="openReportForm('time')"
                  class="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  Generate Report
                </button>
              </div>
            </div>

            <!-- Report Generation Form Modal -->
            <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeForm">
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ formTitle }}</h2>
                  <button @click="closeForm" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form @submit.prevent="submitReport" class="space-y-4">
                  <!-- Date Range -->
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                      <input
                        v-model="form.startDate"
                        type="date"
                        required
                        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                      <input
                        v-model="form.endDate"
                        type="date"
                        required
                        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <!-- Client dropdown (Client Period Report only) -->
                  <div v-if="formReportType === 'client'">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client</label>
                    <select
                      v-model="form.clientId"
                      required
                      class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="" disabled>Select a client</option>
                      <option v-for="client in clients" :key="client.client_id" :value="client.client_id">
                        {{ client.organisation }}
                      </option>
                    </select>
                  </div>

                  <!-- Project dropdown (Client Period Report only, optional) -->
                  <div v-if="formReportType === 'client'">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project <span class="text-gray-400">(optional)</span></label>
                    <select
                      v-model="form.projectId"
                      class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">All projects</option>
                      <option v-for="project in filteredProjects" :key="project.project_id" :value="project.project_id">
                        {{ project.title }}
                      </option>
                    </select>
                  </div>

                  <!-- Timekeeper dropdown (TimeKeeper Period Report only) -->
                  <div v-if="formReportType === 'timekeeper'">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TimeKeeper</label>
                    <select
                      v-model="form.timekeeperId"
                      required
                      class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="" disabled>Select a timekeeper</option>
                      <option v-for="tk in timekeepers" :key="tk.timekeeper_id" :value="tk.timekeeper_id">
                        {{ tk.name }} ({{ tk.username }})
                      </option>
                    </select>
                  </div>

                  <!-- Submit -->
                  <div class="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      @click="closeForm"
                      class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      :disabled="generating"
                      :class="[
                        'px-4 py-2 text-sm font-medium text-white rounded-md transition-colors',
                        reportTypeButtonClass,
                        generating ? 'opacity-50 cursor-not-allowed' : ''
                      ]"
                    >
                      <svg v-if="generating" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ generating ? 'Generating...' : 'Generate' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Report Results -->
            <div v-if="reportResult" class="mt-8">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ reportResult.report_type === 'client-period' ? 'Client Period Report' : reportResult.report_type === 'timekeeper-period' ? 'TimeKeeper Period Report' : 'Time Period Report' }}
                </h2>
                <div class="flex space-x-2">
                  <button
                    @click="exportCsv"
                    class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg class="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                  <button
                    @click="clearReport"
                    class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg class="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                  </button>
                </div>
              </div>

              <!-- Summary -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Total Hours</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ reportResult.summary.total_hours }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Entries</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ reportResult.summary.total_rows }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Projects</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ reportResult.summary.unique_projects }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Clients</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ reportResult.summary.unique_clients }}</p>
                </div>
              </div>

              <!-- Report Parameters -->
              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 text-sm text-blue-800 dark:text-blue-300">
                <strong>Parameters:</strong>
                {{ reportResult.start_date }} to {{ reportResult.end_date }}
                <span v-if="reportResult.timekeeper_id"> | TimeKeeper ID: {{ reportResult.timekeeper_id }}</span>
                <span v-if="reportResult.client_id"> | Client ID: {{ reportResult.client_id }}</span>
              </div>

              <!-- Results Table -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resource</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hours</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bill Rate</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr v-if="reportResult.rows.length === 0">
                        <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          No billing events found for the selected criteria.
                        </td>
                      </tr>
                      <tr v-for="(row, index) in reportResult.rows" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ row.client || '-' }}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ row.project || '-' }}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ row.resource }}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ row.date }}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-medium">{{ row.hours }}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white text-right">{{ row.bill_rate != null ? '$' + row.bill_rate.toFixed(2) : '-' }}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ row.task || '-' }}</td>
                      </tr>
                    </tbody>
                    <tfoot v-if="reportResult.rows.length > 0" class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <td colspan="4" class="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">Totals</td>
                        <td class="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">{{ reportResult.summary.total_hours }}</td>
                        <td colspan="2" class="px-4 py-3 text-sm text-gray-900 dark:text-white"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <!-- Empty state when no report generated -->
            <div v-else class="mt-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Reports</h2>
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div class="p-6">
                  <div class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reports generated yet</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Generate your first report using the options above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useNotification } from '@/composables/useNotification'
import { reportsApi, type ClientOption, type TimekeeperOption, type ProjectOption, type TimePeriodReport, type ClientPeriodReport, type TimekeeperPeriodReport } from '@/services/reports'
import dayjs from 'dayjs'

const notification = useNotification()

type ReportType = 'client' | 'timekeeper' | 'time'
type ReportResult = TimePeriodReport | ClientPeriodReport | TimekeeperPeriodReport

// State
const showForm = ref(false)
const formReportType = ref<ReportType>('timekeeper')
const generating = ref(false)
const reportResult = ref<ReportResult | null>(null)

// Form data
const form = reactive({
  startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD'),
  clientId: '' as string | number,
  projectId: '' as string | number,
  timekeeperId: '' as string | number,
})

// Dropdown data
const clients = ref<ClientOption[]>([])
const timekeepers = ref<TimekeeperOption[]>([])
const projects = ref<ProjectOption[]>([])

// Loading states for dropdowns
const loadingDropdowns = ref(false)

// Computed
const formTitle = computed(() => {
  switch (formReportType.value) {
    case 'client': return 'Client Period Report'
    case 'timekeeper': return 'TimeKeeper Period Report'
    case 'time': return 'Time Period Report'
  }
})

const reportTypeButtonClass = computed(() => {
  switch (formReportType.value) {
    case 'client': return 'bg-green-600 hover:bg-green-700'
    case 'timekeeper': return 'bg-blue-600 hover:bg-blue-700'
    case 'time': return 'bg-purple-600 hover:bg-purple-700'
  }
})

const filteredProjects = computed(() => {
  if (!form.clientId) return projects.value
  const clientId = typeof form.clientId === 'string' ? parseInt(form.clientId) : form.clientId
  return projects.value.filter(p => p.client_id === clientId)
})

// Methods
const openReportForm = async (type: ReportType) => {
  formReportType.value = type
  showForm.value = true
  reportResult.value = null

  // Reset form fields specific to report type
  form.clientId = ''
  form.projectId = ''
  form.timekeeperId = ''

  // Load dropdown data
  await loadDropdownData()
}

const closeForm = () => {
  showForm.value = false
}

const loadDropdownData = async () => {
  if (loadingDropdowns.value) return
  loadingDropdowns.value = true

  try {
    // Load based on report type to avoid unnecessary API calls
    if (formReportType.value === 'client') {
      const [clientsData, projectsData] = await Promise.all([
        reportsApi.listClients(),
        reportsApi.listProjects(),
      ])
      clients.value = clientsData
      projects.value = projectsData
    } else if (formReportType.value === 'timekeeper') {
      timekeepers.value = await reportsApi.listTimekeepers()
    }
    // Time period report doesn't need any dropdowns
  } catch (error) {
    console.error('[ReportsView] Error loading dropdown data:', error)
    notification.error('Error', 'Failed to load report parameters. Please try again.')
  } finally {
    loadingDropdowns.value = false
  }
}

const submitReport = async () => {
  generating.value = true

  try {
    let result: ReportResult

    switch (formReportType.value) {
      case 'client': {
        const clientId = typeof form.clientId === 'string' ? parseInt(form.clientId) : form.clientId
        const projectId = form.projectId ? (typeof form.projectId === 'string' ? parseInt(form.projectId) : form.projectId) : undefined
        result = await reportsApi.getClientPeriodReport(form.startDate, form.endDate, clientId, projectId)
        break
      }
      case 'timekeeper': {
        const timekeeperId = typeof form.timekeeperId === 'string' ? parseInt(form.timekeeperId) : form.timekeeperId
        result = await reportsApi.getTimekeeperPeriodReport(form.startDate, form.endDate, timekeeperId)
        break
      }
      case 'time': {
        result = await reportsApi.getTimePeriodReport(form.startDate, form.endDate)
        break
      }
    }

    reportResult.value = result
    showForm.value = false

    notification.success(
      'Report Generated',
      `${formTitle.value} generated successfully with ${result.summary.total_rows} entries.`
    )
  } catch (error) {
    console.error('[ReportsView] Error generating report:', error)
    notification.error(
      'Report Generation Failed',
      'There was an error generating the report. Please try again.'
    )
  } finally {
    generating.value = false
  }
}

const exportCsv = async () => {
  if (!reportResult.value) return

  try {
    let blob: Blob

    switch (reportResult.value.report_type) {
      case 'client-period': {
        const r = reportResult.value as ClientPeriodReport
        blob = await reportsApi.downloadClientPeriodCsv(r.start_date, r.end_date, r.client_id, r.project_id ?? undefined)
        break
      }
      case 'timekeeper-period': {
        const r = reportResult.value as TimekeeperPeriodReport
        blob = await reportsApi.downloadTimekeeperPeriodCsv(r.start_date, r.end_date, r.timekeeper_id)
        break
      }
      case 'time-period': {
        const r = reportResult.value as TimePeriodReport
        blob = await reportsApi.downloadTimePeriodCsv(r.start_date, r.end_date)
        break
      }
      default:
        return
    }

    // Trigger download
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportResult.value.report_type}-${reportResult.value.start_date}-to-${reportResult.value.end_date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    notification.success('Download Complete', 'Report CSV has been downloaded successfully.')
  } catch (error) {
    console.error('[ReportsView] Error exporting CSV:', error)
    notification.error('Export Failed', 'There was an error exporting the report. Please try again.')
  }
}

const clearReport = () => {
  reportResult.value = null
}

// Set default dates on mount
onMounted(() => {
  form.startDate = dayjs().startOf('month').format('YYYY-MM-DD')
  form.endDate = dayjs().format('YYYY-MM-DD')
})
</script>