# DataTable Component Usage

The DataTable component is a comprehensive, feature-rich table component that provides sorting, filtering, pagination, row selection, and action buttons out of the box.

## Basic Usage

```vue
<template>
  <DataTable
    :data="clients"
    :columns="columns"
    :loading="loading"
    :error="error"
    @retry="loadClients"
  />
</template>

<script setup>
import { ref } from 'vue'
import DataTable from '@/components/DataTable.vue'

const clients = ref([])
const loading = ref(false)
const error = ref(null)

const columns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email', sortable: true },
  { key: 'status', title: 'Status', sortable: false }
]

const loadClients = async () => {
  loading.value = true
  error.value = null
  try {
    // Fetch clients from API
    clients.value = await fetchClients()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
```

## Advanced Features

### With Search and Filters

```vue
<DataTable
  :data="data"
  :columns="columns"
  show-search
  search-placeholder="Search clients..."
  :search-fields="['name', 'email', 'city']"
  show-filters
>
  <template #filters>
    <select v-model="statusFilter" class="filter-select">
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </template>
</DataTable>
```

### With Row Selection

```vue
<DataTable
  :data="data"
  :columns="columns"
  selectable
  @row-select="handleRowSelection"
/>

<script setup>
const handleRowSelection = (selectedItems) => {
  console.log('Selected items:', selectedItems)
}
</script>
```

### With Actions

```vue
<DataTable
  :data="data"
  :columns="columns"
  :actions="actions"
/>

<script setup>
const actions = [
  {
    key: 'edit',
    label: 'Edit',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    handler: (item) => editItem(item)
  },
  {
    key: 'delete',
    label: 'Delete',
    variant: 'danger',
    icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    handler: (item) => deleteItem(item),
    show: (item) => item.deletable
  }
]

const editItem = (item) => {
  // Handle edit
}

const deleteItem = (item) => {
  // Handle delete
}
</script>
```

### With Custom Cell Rendering

```vue
<DataTable
  :data="data"
  :columns="columns"
>
  <template #cell-status="{ item, value }">
    <span
      :class="{
        'px-2 py-1 text-xs rounded-full': true,
        'bg-green-100 text-green-800': value === 'active',
        'bg-red-100 text-red-800': value === 'inactive'
      }"
    >
      {{ value }}
    </span>
  </template>
</DataTable>
```

### With Pagination

```vue
<DataTable
  :data="data"
  :columns="columns"
  show-pagination
  :page-size="25"
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `any[]` | `[]` | Array of data to display |
| `columns` | `TableColumn[]` | `[]` | Column configuration |
| `loading` | `boolean` | `false` | Show loading state |
| `loadingText` | `string` | `'Loading data...'` | Custom loading message |
| `error` | `string` | `null` | Error message to display |
| `errorTitle` | `string` | `'Error loading data'` | Error title |
| `showRetry` | `boolean` | `true` | Show retry button on error |
| `emptyTitle` | `string` | `'No data found'` | Empty state title |
| `emptyMessage` | `string` | `'No items to display.'` | Empty state message |
| `selectable` | `boolean` | `false` | Enable row selection |
| `rowKey` | `string \| Function` | `'id'` | Key for row identification |
| `actions` | `TableAction[] \| Function` | `null` | Action buttons configuration |
| `showSearch` | `boolean` | `false` | Show search input |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder |
| `searchFields` | `string[]` | `[]` | Fields to search in |
| `showFilters` | `boolean` | `false` | Show filters section |
| `showPagination` | `boolean` | `false` | Show pagination controls |
| `pageSize` | `number` | `10` | Number of items per page |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `retry` | - | Emitted when retry button is clicked |
| `rowSelect` | `selectedItems: any[]` | Emitted when row selection changes |
| `sort` | `{ key: string, order: 'asc' \| 'desc' }` | Emitted when sorting changes |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `header` | - | Content above the table |
| `filters` | - | Filter controls |
| `empty` | - | Content for empty state |
| `cell-{key}` | `{ item, value, column }` | Custom cell content |
| `actions` | `{ item }` | Custom action buttons |

## Column Configuration

```typescript
interface TableColumn {
  key: string                    // Data key for display
  title: string                  // Column title
  sortable?: boolean             // Enable sorting
  sortKey?: string               // Optional: field to sort by (if different from key)
  width?: string                 // Column width class
  cellClass?: string             // Custom cell class
  render?: (item, value) => string // Custom render function
  component?: any                // Custom component
  componentProps?: object        // Props for custom component
  formatter?: (value) => string  // Value formatter
}
```

## Action Configuration

```typescript
interface TableAction {
  key: string                    // Action key
  label: string                  // Button label
  icon?: string                  // SVG path for icon
  variant?: 'default' | 'danger' // Button style
  handler: (item) => void        // Click handler
  show?: (item) => boolean       // Conditional visibility
}
```