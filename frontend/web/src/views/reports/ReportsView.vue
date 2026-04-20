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
                    Export to CSV
                  </div>
                </div>
                <button 
                  @click="openClientReportForm"
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
                  @click="openTimekeeperReportForm"
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
                  @click="openTimeReportForm"
                  class="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  Generate Report
                </button>
              </div>
            </div>

            <!-- Client Period Report Form Modal -->
            <div v-if="showClientReportForm" class="fixed inset-0 z-50 overflow-y-auto">
              <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
                <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div class="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" @click="showClientReportForm = false"></div>
                </div>
                <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 z-10">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Client Period Report</h3>
                    <button @click="showClientReportForm = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <form @submit.prevent="generateClientReport" class="space-y-4">
                    <!-- Client Selection -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client *</label>
                      <select 
                        v-model="clientReportForm.client_id" 
                        required
                        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="" disabled>Select a client...</option>
                        <option v-for="client in reportClients" :key="client.client_id" :value="client.client_id">
                          {{ client.organisation }}
                        </option>
                      </select>
                    </div>

                    <!-- Project Selection (optional) -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project (optional)</label>
                      <select 
                        v-model="clientReportForm.project_id" 
                        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All projects</option>
                        <option v-for="project in filteredProjects" :key="project.project_id" :value="project.project_id">
                          {{ project.title }}
                        </option>
                      </select>
                    </div>

                    <!-- Date Range -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                        <input 
                          v-model="clientReportForm.start_date" 
                          type="date" 
                          required
                          class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                        <input 
                          v-model="clientReportForm.end_date" 
                          type="date" 
                          required
                          class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-3 pt-2">
                      <button 
                        type="button"
                        @click="showClientReportForm = false"
                        class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        :disabled="loading.client"
                        class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-md flex items-center"
                      >
                        <svg v-if="loading.client" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {{ loading.client ? 'Generating...' : 'Generate' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- TimeKeeper Period Report Form Modal -->
            <div v-if="showTimekeeperReportForm" class="fixed inset-0 z-50 overflow-y-auto">
              <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
                <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div class="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" @click="showTimekeeperReportForm = false"></div>
                </div>
                <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 z-10">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">TimeKeeper Period Report</h3>
                    <button @click="showTimekeeperReportForm = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <form @submit.prevent="generateTimekeeperReport" class="space-y-4">
                    <!-- Timekeeper Selection -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timekeeper *</label>
                      <select 
                        v-model="timekeeperReportForm.timekeeper_id" 
                        required
                        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="" disabled>Select a timekeeper...</option>
                        <option v-for="tk in timekeepers" :key="tk.timekeeper_id" :value="tk.timekeeper_id">
                          {{ tk.name }}
                        </option>
                      </select>
                    </div>

                    <!-- Date Range -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                        <input 
                          v-model="timekeeperReportForm.start_date" 
                          type="date" 
                          required
                          class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                        <input 
                          v-model="timekeeperReportForm.end_date" 
                          type="date" 
                          required
                          class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-3 pt-2">
                      <button type="button" @click="showTimekeeperReportForm = false"
                        class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">
                        Cancel
                      </button>
                      <button type="submit" :disabled="loading.timekeeper"
                        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md flex items-center">
                        <svg v-if="loading.timekeeper" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {{ loading.timekeeper ? 'Generating...' : 'Generate' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- Time Period Report Form Modal -->
            <div v-if="showTimeReportForm" class="fixed inset-0 z-50 overflow-y-auto">
              <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
                <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div class="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" @click="showTimeReportForm = false"></div>
                </div>
                <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 z-10">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Time Period Report</h3>
                    <button @click="showTimeReportForm = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <form @submit.prevent="generateTimeReport" class="space-y-4">
                    <!-- Date Range -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                        <input 
                          v-model="timeReportForm.start_date" 
                          type="date" 
                          required
                          class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                        <input 
                          v-model="timeReportForm.end_date" 
                          type="date" 
                          required
                          class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex justify-end space-x-3 pt-2">
                      <button type="button" @click="showTimeReportForm = false"
                        class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">
                        Cancel
                      </button>
                      <button type="submit" :disabled="loading.time"
                        class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-md flex items-center">
                        <svg v-if="loading.time" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {{ loading.time ? 'Generating...' : 'Generate' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- Report Results Section -->
            <div v-if="reportResult" class="mt-8">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ reportResult.report_type === 'client-period' ? 'Client Period Report' : reportResult.report_type === 'timekeeper-period' ? 'TimeKeeper Period Report' : 'Time Period Report' }}
                </h2>
                <div class="flex items-center space-x-3">
                  <!-- Template selector for Excel export -->
                  <div class="flex items-center space-x-2">
                    <label class="text-xs text-gray-500 dark:text-gray-400">Template:</label>
                    <select 
                      v-model="selectedTemplateId"
                      class="text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option :value="null">No template (plain)</option>
                      <option 
                        v-for="tmpl in filteredTemplates" 
                        :key="tmpl.template_id" 
                        :value="tmpl.template_id"
                      >
                        {{ tmpl.name }}
                      </option>
                    </select>
                  </div>
                  <button 
                    @click="exportCSV"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200"
                  >
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                  </button>
                  <button 
                    @click="exportExcel"
                    :disabled="loading.excel"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-md transition-colors duration-200"
                  >
                    <svg v-if="loading.excel" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6M4 6h16M4 6a2 2 0 01-2-2V4a2 2 0 012-2h16a2 2 0 012 2v0a2 2 0 01-2 2M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6" />
                    </svg>
                    {{ loading.excel ? 'Exporting...' : 'Excel' }}
                  </button>
                  <button 
                    @click="reportResult = null"
                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
              
              <!-- Summary Cards -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Total Entries</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ reportResult.summary.total_rows }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Total Hours</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ reportResult.summary.total_hours }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Resources</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ reportResult.summary.unique_resources }}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Projects</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ reportResult.summary.unique_projects }}</p>
                </div>
              </div>
              
              <!-- Results Table -->
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resource</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hours</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bill Rate</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr v-if="reportResult.rows.length === 0">
                        <td colspan="7" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No billing events found for the selected criteria.
                        </td>
                      </tr>
                      <tr v-for="(row, index) in reportResult.rows" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ row.client || '-' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ row.project || '-' }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ row.resource }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatDate(row.date) }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">{{ row.hours }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{{ row.bill_rate ? '$' + row.bill_rate.toFixed(2) : '-' }}</td>
                        <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{{ row.task || '-' }}</td>
                      </tr>
                    </tbody>
                    <tfoot v-if="reportResult.rows.length > 0" class="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <td colspan="3" class="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">Totals</td>
                        <td class="px-6 py-3"></td>
                        <td class="px-6 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">{{ reportResult.summary.total_hours }}</td>
                        <td class="px-6 py-3"></td>
                        <td class="px-6 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
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
                      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      @click="viewReport(report)"
                    >
                      <div class="flex items-center">
                        <div :class="[
                          'p-2 rounded-lg mr-3',
                          getReportIconClasses(report.type)
                        ]">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="report.type === 'client'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            <path v-else-if="report.type === 'timekeeper'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ report.name }}</h4>
                          <p class="text-xs text-gray-500 dark:text-gray-400">
                            {{ formatDate(report.generatedAt) }} &bull; {{ report.rowCount }} entries &bull; {{ report.totalHours }} hours
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button 
                          @click.stop="deleteReport(report.id)"
                          class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Remove from list"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Excel Templates Section -->
            <div class="mt-8">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Excel Templates</h2>
                <button 
                  @click="showTemplateUploadForm = true"
                  class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors duration-200"
                >
                  <svg class="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Template
                </button>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div class="p-6">
                  <div v-if="templates.length === 0" class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6M4 6h16M4 6a2 2 0 01-2-2V4a2 2 0 012-2h16a2 2 0 012 2v0a2 2 0 01-2 2M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No templates uploaded yet</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Upload an .xlsx template with custom formatting. Data will be written starting at row 2.
                    </p>
                  </div>
                  <div v-else class="space-y-3">
                    <div 
                      v-for="tmpl in templates" 
                      :key="tmpl.template_id"
                      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <div class="flex items-center">
                        <div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mr-3">
                          <svg class="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6M4 6h16M4 6a2 2 0 01-2-2V4a2 2 0 012-2h16a2 2 0 012 2v0a2 2 0 01-2 2M4 6v12a2 2 0 002 2h12a2 2 0 002-2V6" />
                          </svg>
                        </div>
                        <div>
                          <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ tmpl.name }}</h4>
                          <p class="text-xs text-gray-500 dark:text-gray-400">
                            {{ tmpl.report_type }} &bull; {{ tmpl.filename }} &bull; {{ tmpl.description || 'No description' }}
                          </p>
                          <p v-if="tmpl.created_at" class="text-xs text-gray-400 dark:text-gray-500">
                            Uploaded {{ formatDate(tmpl.created_at) }}
                          </p>
                        </div>
                      </div>
                      <button 
                        @click="deleteTemplate(tmpl.template_id)"
                        class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete template"
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

            <!-- Template Upload Modal -->
            <div v-if="showTemplateUploadForm" class="fixed inset-0 z-50 overflow-y-auto">
              <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
                <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div class="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" @click="showTemplateUploadForm = false"></div>
                </div>
                <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 z-10">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Upload Excel Template</h3>
                    <button @click="showTemplateUploadForm = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <form @submit.prevent="uploadTemplate" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template Name *</label>
                      <input 
                        v-model="templateForm.name" 
                        type="text" 
                        required
                        placeholder="e.g. Monthly Client Invoice Template"
                        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Type *</label>
                      <select 
                        v-model="templateForm.report_type" 
                        required
                        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="client-period">Client Period</option>
                        <option value="timekeeper-period">TimeKeeper Period</option>
                        <option value="time-period">Time Period</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                      <input 
                        v-model="templateForm.description" 
                        type="text" 
                        placeholder="Brief description of this template"
                        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excel File (.xlsx) *</label>
                      <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                        <div class="space-y-1 text-center">
                          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <div class="flex text-sm text-gray-600 dark:text-gray-400">
                            <label class="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2">
                              <span>Upload a file</span>
                              <input 
                                type="file" 
                                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                @change="onTemplateFileChange"
                                class="sr-only"
                              />
                            </label>
                            <span class="pl-1">or drag and drop</span>
                          </div>
                          <p v-if="!templateForm.file" class="text-xs text-gray-500 dark:text-gray-400">XLSX up to 5MB</p>
                          <p v-else class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{{ templateForm.file?.name }}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name (optional)</label>
                      <input 
                        v-model="templateForm.created_by" 
                        type="text" 
                        placeholder="Name of uploader"
                        class="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-3">
                      <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">Template Guidelines</h4>
                      <ul class="mt-1.5 text-xs text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                        <li>Row 1 is treated as the header row</li>
                        <li>Data will be written starting at row 2</li>
                        <li>Columns must match: Client, Resource, Date, Hours, Billing Rate, Task, Project</li>
                        <li>Custom formatting (fonts, colors, borders) will be preserved</li>
                      </ul>
                    </div>

                    <div class="flex justify-end space-x-3 pt-2">
                      <button type="button" @click="showTemplateUploadForm = false"
                        class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">
                        Cancel
                      </button>
                      <button type="submit" :disabled="loading.template || !templateForm.file"
                        class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-md flex items-center">
                        <svg v-if="loading.template" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {{ loading.template ? 'Uploading...' : 'Upload Template' }}
                      </button>
                    </div>
                  </form>
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
import { reportsApi, type ReportResult, type ReportTemplateItem } from '@/services/reports'
import dayjs from 'dayjs'

const notification = useNotification()

interface RecentReport {
  id: string
  name: string
  type: 'client' | 'timekeeper' | 'time'
  generatedAt: string
  result: ReportResult
  rowCount: number
  totalHours: number
}

const loading = reactive({
  client: false,
  timekeeper: false,
  time: false,
  excel: false,
  template: false
})

const showClientReportForm = ref(false)
const showTimekeeperReportForm = ref(false)
const showTimeReportForm = ref(false)
const showTemplateUploadForm = ref(false)
const reportResult = ref<ReportResult | null>(null)
const recentReports = ref<RecentReport[]>([])

// Template state
const selectedTemplateId = ref<number | null>(null)
const templates = ref<ReportTemplateItem[]>([])
const templateForm = reactive({
  name: '',
  report_type: 'client-period' as string,
  description: '',
  created_by: '',
  file: null as File | null,
})

// Report form data
const clientReportForm = reactive({
  client_id: '' as string | number,
  project_id: '' as string | number,
  start_date: dayjs().startOf('month').format('YYYY-MM-DD'),
  end_date: dayjs().endOf('month').format('YYYY-MM-DD'),
})

const timekeeperReportForm = reactive({
  timekeeper_id: '' as string | number,
  start_date: dayjs().startOf('month').format('YYYY-MM-DD'),
  end_date: dayjs().endOf('month').format('YYYY-MM-DD'),
})

const timeReportForm = reactive({
  start_date: dayjs().startOf('month').format('YYYY-MM-DD'),
  end_date: dayjs().endOf('month').format('YYYY-MM-DD'),
})

// Dropdown data from report API endpoints
const reportClients = ref<{ client_id: number; organisation: string }[]>([])
const reportProjects = ref<{ project_id: number; title: string; client_id: number; client_name: string }[]>([])
const timekeepers = ref<{ timekeeper_id: number; name: string; username: string }[]>([])

const filteredProjects = computed(() => {
  if (!clientReportForm.client_id) return reportProjects.value
  return reportProjects.value.filter(p => p.client_id === Number(clientReportForm.client_id))
})

const filteredTemplates = computed(() => {
  if (!reportResult.value) return templates.value
  const rt = reportResult.value.report_type
  return templates.value.filter(t => t.report_type === rt)
})

onMounted(async () => {
  await Promise.all([loadReportClients(), loadReportProjects(), loadTimekeepers(), loadTemplates()])
})

async function loadReportClients() {
  try {
    const result = await reportsApi.listClients()
    reportClients.value = result || []
  } catch (error) {
    console.error('Failed to load report clients:', error)
  }
}

async function loadReportProjects(clientId?: number) {
  try {
    const result = await reportsApi.listProjects(clientId)
    reportProjects.value = result || []
  } catch (error) {
    console.error('Failed to load report projects:', error)
  }
}

async function loadTimekeepers() {
  try {
    const result = await reportsApi.listTimekeepers()
    timekeepers.value = result || []
  } catch (error) {
    console.error('Failed to load timekeepers:', error)
  }
}

function openClientReportForm() {
  // Reload projects for the selected client
  if (clientReportForm.client_id) {
    loadReportProjects(Number(clientReportForm.client_id))
  }
  showClientReportForm.value = true
}

function openTimekeeperReportForm() {
  showTimekeeperReportForm.value = true
}

function openTimeReportForm() {
  showTimeReportForm.value = true
}

async function generateClientReport() {
  loading.client = true
  try {
    const params = {
      start_date: clientReportForm.start_date,
      end_date: clientReportForm.end_date,
      client_id: Number(clientReportForm.client_id),
      project_id: clientReportForm.project_id ? Number(clientReportForm.project_id) : undefined,
    }
    
    const result = await reportsApi.generateClientPeriodReport(params)
    
    reportResult.value = result
    showClientReportForm.value = false
    
    // Add to recent reports
    const clientName = reportClients.value.find(c => c.client_id === params.client_id)?.organisation || 'Unknown'
    const newReport: RecentReport = {
      id: `client-${Date.now()}`,
      name: `Client Period - ${clientName}`,
      type: 'client',
      generatedAt: new Date().toISOString(),
      result,
      rowCount: result.summary.total_rows,
      totalHours: result.summary.total_hours,
    }
    recentReports.value.unshift(newReport)
    
    notification.success(
      'Report Generated',
      `Client Period Report generated with ${result.summary.total_rows} entries (${result.summary.total_hours} hours).`
    )
  } catch (error: any) {
    console.error('Failed to generate client report:', error)
    const detail = error?.response?.data?.detail || 'Please try again.'
    notification.error('Report Generation Failed', detail)
  } finally {
    loading.client = false
  }
}

async function generateTimekeeperReport() {
  loading.timekeeper = true
  try {
    const params = {
      start_date: timekeeperReportForm.start_date,
      end_date: timekeeperReportForm.end_date,
      timekeeper_id: Number(timekeeperReportForm.timekeeper_id),
    }
    
    const result = await reportsApi.generateTimekeeperPeriodReport(params)
    
    reportResult.value = result
    showTimekeeperReportForm.value = false
    
    const tkName = timekeepers.value.find(t => t.timekeeper_id === params.timekeeper_id)?.name || 'Unknown'
    const newReport: RecentReport = {
      id: `tk-${Date.now()}`,
      name: `TimeKeeper Period - ${tkName}`,
      type: 'timekeeper',
      generatedAt: new Date().toISOString(),
      result,
      rowCount: result.summary.total_rows,
      totalHours: result.summary.total_hours,
    }
    recentReports.value.unshift(newReport)
    
    notification.success(
      'Report Generated',
      `TimeKeeper Period Report generated with ${result.summary.total_rows} entries (${result.summary.total_hours} hours).`
    )
  } catch (error: any) {
    console.error('Failed to generate timekeeper report:', error)
    const detail = error?.response?.data?.detail || 'Please try again.'
    notification.error('Report Generation Failed', detail)
  } finally {
    loading.timekeeper = false
  }
}

async function generateTimeReport() {
  loading.time = true
  try {
    const params = {
      start_date: timeReportForm.start_date,
      end_date: timeReportForm.end_date,
    }
    
    const result = await reportsApi.generateTimePeriodReport(params)
    
    reportResult.value = result
    showTimeReportForm.value = false
    
    const newReport: RecentReport = {
      id: `time-${Date.now()}`,
      name: `Time Period - ${params.start_date} to ${params.end_date}`,
      type: 'time',
      generatedAt: new Date().toISOString(),
      result,
      rowCount: result.summary.total_rows,
      totalHours: result.summary.total_hours,
    }
    recentReports.value.unshift(newReport)
    
    notification.success(
      'Report Generated',
      `Time Period Report generated with ${result.summary.total_rows} entries (${result.summary.total_hours} hours).`
    )
  } catch (error: any) {
    console.error('Failed to generate time report:', error)
    const detail = error?.response?.data?.detail || 'Please try again.'
    notification.error('Report Generation Failed', detail)
  } finally {
    loading.time = false
  }
}

async function loadTemplates() {
  try {
    const result = await reportsApi.listTemplates()
    templates.value = result || []
  } catch (error) {
    console.error('Failed to load templates:', error)
  }
}

async function exportExcel() {
  if (!reportResult.value) return
  loading.excel = true
  try {
    let blob: Blob
    const sd = reportResult.value.start_date
    const ed = reportResult.value.end_date
    const tid = selectedTemplateId.value ?? undefined

    if (reportResult.value.report_type === 'client-period') {
      const r = reportResult.value as any
      blob = await reportsApi.downloadClientPeriodExcel(sd, ed, r.client_id, r.project_id ?? undefined, tid)
    } else if (reportResult.value.report_type === 'timekeeper-period') {
      const r = reportResult.value as any
      blob = await reportsApi.downloadTimekeeperPeriodExcel(sd, ed, r.timekeeper_id, tid)
    } else {
      blob = await reportsApi.downloadTimePeriodExcel(sd, ed, tid)
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${reportResult.value.report_type}_${sd}_to_${ed}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    notification.success('Export Complete', 'Report has been exported as Excel.')
  } catch (error: any) {
    console.error('Failed to export Excel:', error)
    const detail = error?.response?.data?.detail || 'Excel export failed. Please try again.'
    notification.error('Excel Export Failed', detail)
  } finally {
    loading.excel = false
  }
}

function onTemplateFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    templateForm.file = target.files[0]
  }
}

async function uploadTemplate() {
  if (!templateForm.file) return
  loading.template = true
  try {
    const formData = new FormData()
    formData.append('name', templateForm.name)
    formData.append('report_type', templateForm.report_type)
    formData.append('file', templateForm.file)
    if (templateForm.description) formData.append('description', templateForm.description)
    if (templateForm.created_by) formData.append('created_by', templateForm.created_by)

    await reportsApi.uploadTemplate(formData)
    showTemplateUploadForm.value = false
    // Reset form
    templateForm.name = ''
    templateForm.report_type = 'client-period'
    templateForm.description = ''
    templateForm.created_by = ''
    templateForm.file = null
    // Reload templates
    await loadTemplates()
    notification.success('Template Uploaded', 'Excel template has been uploaded successfully.')
  } catch (error: any) {
    console.error('Failed to upload template:', error)
    const detail = error?.response?.data?.detail || 'Upload failed. Please try again.'
    notification.error('Upload Failed', detail)
  } finally {
    loading.template = false
  }
}

async function deleteTemplate(templateId: number) {
  try {
    await reportsApi.deleteTemplate(templateId)
    templates.value = templates.value.filter(t => t.template_id !== templateId)
    if (selectedTemplateId.value === templateId) selectedTemplateId.value = null
    notification.success('Template Deleted', 'Excel template has been removed.')
  } catch (error: any) {
    console.error('Failed to delete template:', error)
    const detail = error?.response?.data?.detail || 'Delete failed.'
    notification.error('Delete Failed', detail)
  }
}

function exportCSV() {
  if (!reportResult.value) return
  
  // Build CSV from current result data
  const headers = ['Client', 'Project', 'Resource', 'Date', 'Hours', 'Billing Rate', 'Task']
  const csvRows = [headers.join(',')]
  
  for (const row of reportResult.value.rows) {
    const escapedTask = row.task ? `"${row.task.replace(/"/g, '""')}"` : ''
    const escapedClient = row.client ? `"${row.client.replace(/"/g, '""')}"` : ''
    const escapedProject = row.project ? `"${row.project.replace(/"/g, '""')}"` : ''
    const escapedResource = `"${row.resource.replace(/"/g, '""')}"`
    
    csvRows.push([
      escapedClient,
      escapedProject,
      escapedResource,
      row.date,
      row.hours,
      row.bill_rate || '',
      escapedTask
    ].join(','))
  }
  
  // Summary
  csvRows.push('')
  csvRows.push(['', '', '', 'TOTALS', reportResult.value.summary.total_hours, '', ''].join(','))
  
  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${reportResult.value.report_type}_${reportResult.value.start_date}_to_${reportResult.value.end_date}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  notification.success('Export Complete', 'Report has been exported as CSV.')
}

function viewReport(report: RecentReport) {
  reportResult.value = report.result
}

function deleteReport(reportId: string) {
  const index = recentReports.value.findIndex(r => r.id === reportId)
  if (index !== -1) {
    const report = recentReports.value[index]
    recentReports.value.splice(index, 1)
    if (reportResult.value && reportResult.value === report.result) {
      reportResult.value = null
    }
    notification.warning('Report Removed', `${report.name} has been removed from the list.`)
  }
}

function formatDate(date: string) {
  return dayjs(date).format('MMM D, YYYY')
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