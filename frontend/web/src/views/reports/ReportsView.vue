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
                <div class="space-y-2">
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Date range selection
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Client filtering
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m12 0H6" />
                    </svg>
                    Export to PDF/CSV
                  </div>
                </div>
                <button 
                  @click="generateReport('client')"
                  :disabled="loading.client"
                  class="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  <svg v-if="loading.client" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ loading.client ? 'Generating...' : 'Generate Report' }}
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
                  Comprehensive time tracking report showing all billable hours, tasks, and activities within a specified period.
                </p>
                <div class="space-y-2">
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Date range selection
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Task breakdown
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Hour calculations
                  </div>
                </div>
                <button 
                  @click="generateReport('timekeeper')"
                  :disabled="loading.timekeeper"
                  class="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  <svg v-if="loading.timekeeper" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ loading.timekeeper ? 'Generating...' : 'Generate Report' }}
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
                  General time analysis report showing work patterns, productivity metrics, and time distribution across projects.
                </p>
                <div class="space-y-2">
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Flexible date ranges
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    Visual analytics
                  </div>
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Summary statistics
                  </div>
                </div>
                <button 
                  @click="generateReport('time')"
                  :disabled="loading.time"
                  class="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  <svg v-if="loading.time" class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ loading.time ? 'Generating...' : 'Generate Report' }}
                </button>
              </div>
            </div>

            <!-- Recent Reports Section -->
            <div class="mt-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Reports</h2>
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div class="p-6">
                  <div v-if="recentReports.length === 0" class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reports generated yet</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Generate your first report using the options above.
                    </p>
                  </div>
                  <div v-else class="space-y-3">
                    <div 
                      v-for="report in recentReports" 
                      :key="report.id"
                      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div class="flex items-center">
                        <div :class="[
                          'p-2 rounded-lg mr-3',
                          getReportIconClasses(report.type)
                        ]">
                          <component :is="getReportIcon(report.type)" class="h-4 w-4" />
                        </div>
                        <div>
                          <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ report.name }}</h4>
                          <p class="text-xs text-gray-500 dark:text-gray-400">
                            {{ formatDate(report.generatedAt) }} • {{ report.type }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button 
                          @click="downloadReport(report)"
                          class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="Download report"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button 
                          @click="deleteReport(report.id)"
                          class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete report"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
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
import { ref, reactive } from 'vue'
import { useNotification } from '@/composables/useNotification'
import dayjs from 'dayjs'

const notification = useNotification()

interface RecentReport {
  id: string
  name: string
  type: 'client' | 'timekeeper' | 'time'
  generatedAt: Date
  downloadUrl?: string
}

const loading = reactive({
  client: false,
  timekeeper: false,
  time: false
})

const recentReports = ref<RecentReport[]>([])

const generateReport = async (type: 'client' | 'timekeeper' | 'time') => {
  loading[type] = true
  
  try {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const reportNames = {
      client: 'Client Period Report',
      timekeeper: 'TimeKeeper Period Report',
      time: 'Time Period Report'
    }
    
    const newReport: RecentReport = {
      id: `${type}-${Date.now()}`,
      name: reportNames[type],
      type,
      generatedAt: new Date(),
      downloadUrl: `/api/reports/${type}/download`
    }
    
    recentReports.value.unshift(newReport)
    
    notification.success(
      'Report Generated Successfully',
      `${reportNames[type]} has been generated and is ready for download.`
    )
    
  } catch (error) {
    notification.error(
      'Report Generation Failed',
      'There was an error generating the report. Please try again.'
    )
  } finally {
    loading[type] = false
  }
}

const downloadReport = (report: RecentReport) => {
  // Simulate download
  notification.info(
    'Download Started',
    `Downloading ${report.name}...`
  )
  
  // In a real implementation, this would trigger a file download
  setTimeout(() => {
    notification.success(
      'Download Complete',
      `${report.name} has been downloaded successfully.`
    )
  }, 1000)
}

const deleteReport = (reportId: string) => {
  const index = recentReports.value.findIndex(r => r.id === reportId)
  if (index !== -1) {
    const report = recentReports.value[index]
    recentReports.value.splice(index, 1)
    notification.warning(
      'Report Deleted',
      `${report.name} has been removed from recent reports.`
    )
  }
}

const formatDate = (date: Date) => {
  return dayjs(date).format('MMM D, YYYY h:mm A')
}

const getReportIcon = (type: string) => {
  switch (type) {
    case 'client':
      return {
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        `
      }
    case 'timekeeper':
      return {
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `
      }
    case 'time':
      return {
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        `
      }
    default:
      return {
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        `
      }
  }
}

const getReportIconClasses = (type: string) => {
  switch (type) {
    case 'client':
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    case 'timekeeper':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    case 'time':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    default:
      return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
  }
}
</script>