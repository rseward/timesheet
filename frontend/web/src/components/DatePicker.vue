<template>
  <div class="relative">
    <!-- Date Input Field -->
    <div class="relative">
      <input
        :id="inputId"
        ref="dateInput"
        v-model="displayValue"
        type="text"
        :class="inputClass"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        @input="handleInput"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @click="showCalendar = !showCalendar"
        autocomplete="off"
      />
      
      <!-- Calendar Icon Button -->
      <button
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
        @click.stop="toggleCalendar"
        :disabled="disabled"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
    
    <!-- Validation Error -->
    <p v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    
    <!-- Natural Language Suggestions -->
    <div v-if="suggestions.length > 0" class="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-auto">
      <div
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
        :class="{ 'bg-blue-50 dark:bg-blue-900/20': index === selectedSuggestionIndex }"
        @click="selectSuggestion(suggestion)"
      >
        <div class="font-medium text-gray-900 dark:text-white">{{ suggestion.display }}</div>
        <div class="text-gray-500 dark:text-gray-400 text-xs">{{ formatDate(suggestion.date) }}</div>
      </div>
    </div>
    
    <!-- Calendar Popup -->
    <div
      v-if="showCalendar"
      class="absolute z-30 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-4"
      @click.stop
    >
      <!-- Calendar Header -->
      <div class="flex items-center justify-between mb-4">
        <button
          type="button"
          class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          @click="previousMonth"
        >
          <svg class="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div class="flex items-center space-x-2">
          <select
            v-model="calendarMonth"
            class="text-sm font-medium bg-transparent border-none text-gray-900 dark:text-white focus:outline-none"
            @change="updateCalendar"
          >
            <option v-for="(month, index) in monthNames" :key="index" :value="index">
              {{ month }}
            </option>
          </select>
          
          <select
            v-model="calendarYear"
            class="text-sm font-medium bg-transparent border-none text-gray-900 dark:text-white focus:outline-none"
            @change="updateCalendar"
          >
            <option v-for="year in yearRange" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        
        <button
          type="button"
          class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          @click="nextMonth"
        >
          <svg class="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <!-- Quick Date Buttons -->
      <div class="flex flex-wrap gap-1 mb-4">
        <button
          v-for="quickDate in quickDates"
          :key="quickDate.label"
          type="button"
          class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          @click="selectQuickDate(quickDate.date)"
        >
          {{ quickDate.label }}
        </button>
      </div>
      
      <!-- Day Headers -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="day in dayHeaders"
          :key="day"
          class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
        >
          {{ day }}
        </div>
      </div>
      
      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="date in calendarDates"
          :key="`${date.year}-${date.month}-${date.day}`"
          type="button"
          class="w-8 h-8 text-sm rounded flex items-center justify-center transition-colors"
          :class="getDateClasses(date)"
          @click="selectDate(date)"
          :disabled="date.disabled"
        >
          {{ date.day }}
        </button>
      </div>
      
      <!-- Today Button -->
      <div class="mt-4 flex justify-between">
        <button
          type="button"
          class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40"
          @click="selectToday"
        >
          Today
        </button>
        <button
          type="button"
          class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          @click="clearDate"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

interface CalendarDate {
  day: number
  month: number
  year: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  disabled: boolean
}

interface DateSuggestion {
  display: string
  date: Date
}

interface QuickDate {
  label: string
  date: Date
}

interface Props {
  modelValue?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  inputId?: string
  inputClass?: string
  minDate?: string
  maxDate?: string
  allowNaturalLanguage?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select a date or type naturally (e.g., "today", "tomorrow")',
  inputClass: 'mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 pr-10 text-gray-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm',
  allowNaturalLanguage: true
})

const emit = defineEmits<Emits>()

// Component state
const dateInput = ref<HTMLInputElement>()
const showCalendar = ref(false)
const displayValue = ref('')
const error = ref('')
const suggestions = ref<DateSuggestion[]>([])
const selectedSuggestionIndex = ref(-1)

// Calendar state
const calendarMonth = ref(new Date().getMonth())
const calendarYear = ref(new Date().getFullYear())
const selectedDate = ref<Date | null>(null)

// Constants
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const quickDates = computed<QuickDate[]>(() => {
  const today = new Date()
  return [
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    { label: 'Yesterday', date: new Date(today.getTime() - 24 * 60 * 60 * 1000) },
    { label: 'This Monday', date: getThisWeekday(1) },
    { label: 'This Friday', date: getThisWeekday(5) },
  ]
})

const yearRange = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear - 10; year <= currentYear + 5; year++) {
    years.push(year)
  }
  return years
})

const calendarDates = computed<CalendarDate[]>(() => {
  const firstDay = new Date(calendarYear.value, calendarMonth.value, 1)
  const lastDay = new Date(calendarYear.value, calendarMonth.value + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const dates: CalendarDate[] = []
  const currentDate = new Date(startDate)
  const today = new Date()
  
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    const date: CalendarDate = {
      day: currentDate.getDate(),
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      isCurrentMonth: currentDate.getMonth() === calendarMonth.value,
      isToday: isSameDate(currentDate, today),
      isSelected: selectedDate.value ? isSameDate(currentDate, selectedDate.value) : false,
      disabled: isDateDisabled(currentDate)
    }
    
    dates.push(date)
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
})

// Helper functions
function getThisWeekday(targetDay: number): Date {
  const today = new Date()
  const currentDay = today.getDay()
  const diff = targetDay - currentDay
  const result = new Date(today)
  result.setDate(today.getDate() + diff)
  return result
}

function isSameDate(date1: Date, date2: Date): boolean {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

function isDateDisabled(date: Date): boolean {
  if (props.minDate) {
    const minDate = new Date(props.minDate)
    if (date < minDate) return true
  }
  
  if (props.maxDate) {
    const maxDate = new Date(props.maxDate)
    if (date > maxDate) return true
  }
  
  return false
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatDateValue(date: Date): string {
  return date.toISOString().split('T')[0]
}

function parseNaturalLanguage(input: string): DateSuggestion[] {
  const suggestions: DateSuggestion[] = []
  const lower = input.toLowerCase().trim()
  const today = new Date()
  
  if (!lower || lower.length < 2) return suggestions
  
  // Common natural language patterns
  const patterns = [
    { regex: /^today$/i, offset: 0, display: 'Today' },
    { regex: /^tomorrow$/i, offset: 1, display: 'Tomorrow' },
    { regex: /^yesterday$/i, offset: -1, display: 'Yesterday' },
    { regex: /^(\d+)\s*days?\s*ago$/i, offset: (match: RegExpMatchArray) => -parseInt(match[1]), display: (match: RegExpMatchArray) => `${match[1]} day${match[1] !== '1' ? 's' : ''} ago` },
    { regex: /^in\s*(\d+)\s*days?$/i, offset: (match: RegExpMatchArray) => parseInt(match[1]), display: (match: RegExpMatchArray) => `In ${match[1]} day${match[1] !== '1' ? 's' : ''}` },
    { regex: /^next\s*week$/i, offset: 7, display: 'Next week' },
    { regex: /^last\s*week$/i, offset: -7, display: 'Last week' },
  ]
  
  patterns.forEach(pattern => {
    const match = lower.match(pattern.regex)
    if (match) {
      const offset = typeof pattern.offset === 'function' ? pattern.offset(match) : pattern.offset
      const date = new Date(today.getTime() + offset * 24 * 60 * 60 * 1000)
      const display = typeof pattern.display === 'function' ? pattern.display(match) : pattern.display
      
      if (!isDateDisabled(date)) {
        suggestions.push({ display, date })
      }
    }
  })
  
  // Weekday names
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  weekdays.forEach((weekday, index) => {
    if (lower.includes(weekday)) {
      const thisWeekday = getThisWeekday(index)
      const nextWeekday = new Date(thisWeekday.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      if (lower.includes('next')) {
        if (!isDateDisabled(nextWeekday)) {
          suggestions.push({
            display: `Next ${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`,
            date: nextWeekday
          })
        }
      } else if (lower.includes('this') || !lower.includes('last')) {
        if (!isDateDisabled(thisWeekday)) {
          suggestions.push({
            display: `This ${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`,
            date: thisWeekday
          })
        }
      }
      
      if (lower.includes('last')) {
        const lastWeekday = new Date(thisWeekday.getTime() - 7 * 24 * 60 * 60 * 1000)
        if (!isDateDisabled(lastWeekday)) {
          suggestions.push({
            display: `Last ${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`,
            date: lastWeekday
          })
        }
      }
    }
  })
  
  return suggestions.slice(0, 5) // Limit to 5 suggestions
}

function getDateClasses(date: CalendarDate): string {
  const classes = []
  
  if (!date.isCurrentMonth) {
    classes.push('text-gray-400 dark:text-gray-600')
  } else {
    classes.push('text-gray-900 dark:text-white')
  }
  
  if (date.isToday) {
    classes.push('bg-blue-100 dark:bg-blue-900/20 font-semibold')
  }
  
  if (date.isSelected) {
    classes.push('bg-blue-600 text-white font-semibold')
  } else if (date.isCurrentMonth && !date.disabled) {
    classes.push('hover:bg-gray-100 dark:hover:bg-gray-700')
  }
  
  if (date.disabled) {
    classes.push('opacity-50 cursor-not-allowed')
  }
  
  return classes.join(' ')
}

// Event handlers
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  if (props.allowNaturalLanguage) {
    suggestions.value = parseNaturalLanguage(value)
    selectedSuggestionIndex.value = -1
  }
  
  // Try to parse as regular date
  const date = new Date(value)
  if (!isNaN(date.getTime()) && !isDateDisabled(date)) {
    selectedDate.value = date
    calendarMonth.value = date.getMonth()
    calendarYear.value = date.getFullYear()
    error.value = ''
    emit('update:modelValue', formatDateValue(date))
    emit('change', formatDateValue(date))
  } else if (value && suggestions.value.length === 0) {
    error.value = 'Please enter a valid date'
  } else {
    error.value = ''
  }
}

function handleBlur() {
  // Delay hiding suggestions to allow for click
  setTimeout(() => {
    suggestions.value = []
    selectedSuggestionIndex.value = -1
  }, 200)
}

function handleKeydown(event: KeyboardEvent) {
  if (suggestions.value.length > 0) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        selectedSuggestionIndex.value = Math.min(selectedSuggestionIndex.value + 1, suggestions.value.length - 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1)
        break
      case 'Enter':
        event.preventDefault()
        if (selectedSuggestionIndex.value >= 0) {
          selectSuggestion(suggestions.value[selectedSuggestionIndex.value])
        }
        break
      case 'Escape':
        suggestions.value = []
        selectedSuggestionIndex.value = -1
        break
    }
  }
  
  if (event.key === 'Escape' && showCalendar.value) {
    showCalendar.value = false
  }
}

function toggleCalendar() {
  showCalendar.value = !showCalendar.value
  suggestions.value = []
}

function selectSuggestion(suggestion: DateSuggestion) {
  selectedDate.value = suggestion.date
  displayValue.value = formatDateValue(suggestion.date)
  calendarMonth.value = suggestion.date.getMonth()
  calendarYear.value = suggestion.date.getFullYear()
  suggestions.value = []
  selectedSuggestionIndex.value = -1
  error.value = ''
  
  emit('update:modelValue', formatDateValue(suggestion.date))
  emit('change', formatDateValue(suggestion.date))
  
  showCalendar.value = false
}

function selectDate(date: CalendarDate) {
  if (date.disabled) return
  
  const selectedDateObj = new Date(date.year, date.month, date.day)
  selectedDate.value = selectedDateObj
  displayValue.value = formatDateValue(selectedDateObj)
  showCalendar.value = false
  error.value = ''
  
  emit('update:modelValue', formatDateValue(selectedDateObj))
  emit('change', formatDateValue(selectedDateObj))
}

function selectQuickDate(date: Date) {
  if (isDateDisabled(date)) return
  
  selectedDate.value = date
  displayValue.value = formatDateValue(date)
  calendarMonth.value = date.getMonth()
  calendarYear.value = date.getFullYear()
  showCalendar.value = false
  error.value = ''
  
  emit('update:modelValue', formatDateValue(date))
  emit('change', formatDateValue(date))
}

function selectToday() {
  selectQuickDate(new Date())
}

function clearDate() {
  selectedDate.value = null
  displayValue.value = ''
  showCalendar.value = false
  error.value = ''
  
  emit('update:modelValue', '')
  emit('change', '')
}

function previousMonth() {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
}

function nextMonth() {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
}

function updateCalendar() {
  // Calendar updates automatically through computed properties
}

// Click outside handler
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showCalendar.value = false
    suggestions.value = []
  }
}

// Initialize component
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue)
    if (!isNaN(date.getTime())) {
      selectedDate.value = date
      displayValue.value = newValue
      calendarMonth.value = date.getMonth()
      calendarYear.value = date.getFullYear()
    }
  } else {
    selectedDate.value = null
    displayValue.value = ''
  }
}, { immediate: true })

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>