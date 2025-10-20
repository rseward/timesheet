# DatePicker Component

A comprehensive date picker component with calendar popup, natural language input support, and keyboard navigation.

## Features

### 🎯 Core Functionality
- **Calendar Popup**: Interactive calendar with month/year navigation
- **Natural Language Input**: Type phrases like "today", "tomorrow", "next monday"
- **Keyboard Navigation**: Full keyboard support including arrow keys and Enter/Escape
- **Quick Date Selection**: Buttons for common dates (Today, Tomorrow, Yesterday, etc.)
- **Date Validation**: Built-in validation with error messages
- **Min/Max Date Support**: Restrict selectable date ranges

### 🎨 UI/UX Features
- **Dark Theme Support**: Automatically adapts to light/dark themes
- **Responsive Design**: Works on mobile and desktop
- **Click Outside to Close**: Intuitive calendar dismissal
- **Visual Feedback**: Hover states, selection highlighting, today highlighting
- **Accessibility**: Proper ARIA labels and keyboard navigation

### 💡 Smart Input
- **Natural Language Patterns**:
  - `today`, `tomorrow`, `yesterday`
  - `in 3 days`, `5 days ago`
  - `next week`, `last week`
  - `next monday`, `this friday`, `last wednesday`
- **Suggestion Dropdown**: Shows parsed natural language with full date preview
- **Keyboard Navigation**: Arrow keys to navigate suggestions, Enter to select

## Usage

### Basic Usage
```vue
<template>
  <DatePicker 
    v-model="selectedDate" 
    placeholder="Select a date"
    :required="true"
  />
</template>

<script setup>
import { ref } from 'vue'
import DatePicker from '@/components/DatePicker.vue'

const selectedDate = ref('')
</script>
```

### Advanced Usage
```vue
<template>
  <DatePicker 
    v-model="selectedDate"
    input-id="birth-date"
    placeholder="Enter your birth date or type naturally"
    :required="true"
    :disabled="false"
    :min-date="minDate"
    :max-date="maxDate"
    :allow-natural-language="true"
    @change="handleDateChange"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import DatePicker from '@/components/DatePicker.vue'

const selectedDate = ref('')

// Restrict to past 100 years and future 5 years
const minDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 100)
  return date.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 5)
  return date.toISOString().split('T')[0]
})

function handleDateChange(dateValue) {
  console.log('Date changed to:', dateValue)
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | The selected date in YYYY-MM-DD format |
| `placeholder` | `string` | `'Select a date or type naturally...'` | Input placeholder text |
| `required` | `boolean` | `false` | Whether the field is required |
| `disabled` | `boolean` | `false` | Whether the input is disabled |
| `inputId` | `string` | `undefined` | ID attribute for the input element |
| `inputClass` | `string` | Default Tailwind classes | CSS classes for the input element |
| `minDate` | `string` | `undefined` | Minimum selectable date (YYYY-MM-DD) |
| `maxDate` | `string` | `undefined` | Maximum selectable date (YYYY-MM-DD) |
| `allowNaturalLanguage` | `boolean` | `true` | Enable natural language input parsing |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted when the selected date changes |
| `change` | `string` | Emitted when the selected date changes (for compatibility) |

## Natural Language Examples

The component understands many natural language patterns:

### Relative Days
- `today` → Current date
- `tomorrow` → Next day  
- `yesterday` → Previous day
- `in 3 days` → 3 days from now
- `5 days ago` → 5 days in the past

### Relative Weeks
- `next week` → 7 days from now
- `last week` → 7 days ago

### Specific Weekdays
- `monday` / `this monday` → This week's Monday
- `next friday` → Next week's Friday  
- `last wednesday` → Last week's Wednesday

All patterns are case-insensitive and flexible with spacing.

## Calendar Features

### Navigation
- **Month/Year Dropdowns**: Quick navigation to any month/year
- **Previous/Next Buttons**: Navigate month by month
- **Quick Date Buttons**: Jump to common dates instantly

### Visual Indicators
- **Today**: Highlighted with blue background
- **Selected Date**: Highlighted with solid blue background
- **Current Month**: Full opacity dates
- **Other Months**: Reduced opacity dates
- **Disabled Dates**: Grayed out and non-clickable

## Accessibility

- **Keyboard Navigation**: Full support for keyboard-only users
- **Screen Reader Support**: Proper labels and ARIA attributes
- **Focus Management**: Logical tab order and focus indicators
- **High Contrast**: Works with system high contrast modes

## Integration with Forms

The DatePicker integrates seamlessly with Vue 3's form handling:

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="event-date">Event Date</label>
      <DatePicker 
        v-model="form.eventDate"
        input-id="event-date"
        :required="true"
      />
    </div>
    <button type="submit">Save</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  eventDate: ''
})

function handleSubmit() {
  if (form.eventDate) {
    console.log('Submitting date:', form.eventDate)
  }
}
</script>
```

## Styling

The component uses Tailwind CSS classes and supports dark mode out of the box. You can customize the appearance by:

1. **Custom Input Classes**: Pass custom classes via the `inputClass` prop
2. **CSS Overrides**: Override specific classes in your component styles
3. **Theme Variables**: Customize Tailwind's color palette for consistent theming

## Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Features**: Uses modern JavaScript features with graceful degradation