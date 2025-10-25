import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ReportsView from '../ReportsView.vue'

describe('ReportsView', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(ReportsView)
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('renders reports page with correct title', () => {
    expect(wrapper.find('h1').text()).toBe('Reports')
    expect(wrapper.find('p').text()).toContain('Generate and view various timesheet and billing reports')
  })

  it('displays all three report types', () => {
    const reportCards = wrapper.findAll('.grid > .bg-white.dark\\:bg-gray-800.rounded-lg')
    expect(reportCards).toHaveLength(3)
    
    const titles = reportCards.map(card => card.find('h3').text())
    expect(titles).toContain('Client Period Report')
    expect(titles).toContain('TimeKeeper Period Report')
    expect(titles).toContain('Time Period Report')
  })

  it('shows correct report descriptions', () => {
    const reportCards = wrapper.findAll('.grid > .bg-white.dark\\:bg-gray-800.rounded-lg')
    
    const clientCard = reportCards.find(card => 
      card.find('h3').text().includes('Client Period Report')
    )
    expect(clientCard.find('p').text()).toContain('Generate detailed reports for specific clients')
    
    const timekeeperCard = reportCards.find(card => 
      card.find('h3').text().includes('TimeKeeper Period Report')
    )
    expect(timekeeperCard.find('p').text()).toContain('Comprehensive time tracking report')
    
    const timeCard = reportCards.find(card => 
      card.find('h3').text().includes('Time Period Report')
    )
    expect(timeCard.find('p').text()).toContain('General time analysis report')
  })

  it('displays report features correctly', () => {
    const reportCards = wrapper.findAll('.grid > .bg-white.dark\\:bg-gray-800.rounded-lg')
    
    // Check Client Period Report features
    const clientCard = reportCards.find(card => 
      card.find('h3').text().includes('Client Period Report')
    )
    const clientFeatures = clientCard.findAll('.text-gray-500.dark\\:text-gray-400')
    expect(clientFeatures[0].text()).toContain('Date range selection')
    expect(clientFeatures[1].text()).toContain('Client filtering')
    expect(clientFeatures[2].text()).toContain('Export to PDF/CSV')
  })

  it('shows generate buttons in correct colors', () => {
    const buttons = wrapper.findAll('button')
    const generateButtons = buttons.filter(button => 
      button.text().includes('Generate Report')
    )
    
    expect(generateButtons).toHaveLength(3)
    expect(generateButtons[0].classes()).toContain('bg-green-600') // Client
    expect(generateButtons[1].classes()).toContain('bg-blue-600') // TimeKeeper
    expect(generateButtons[2].classes()).toContain('bg-purple-600') // Time
  })

  it('shows loading state when generating report', async () => {
    const clientButton = wrapper.findAll('button').find(button => 
      button.text().includes('Generate Report') && button.classes().includes('bg-green-600')
    )
    
    await clientButton.trigger('click')
    
    // Should show loading state
    expect(clientButton.text()).toContain('Generating...')
    expect(clientButton.find('.animate-spin').exists()).toBe(true)
    expect(clientButton.attributes('disabled')).toBeDefined()
  })

  it('shows recent reports section', () => {
    expect(wrapper.find('h2').text()).toBe('Recent Reports')
    expect(wrapper.find('.bg-white.dark\\:bg-gray-800.rounded-lg.shadow').exists()).toBe(true)
  })

  it('shows empty state when no recent reports', () => {
    const emptyState = wrapper.find('.text-center.py-8')
    expect(emptyState.exists()).toBe(true)
    expect(emptyState.text()).toContain('No reports generated yet')
    expect(emptyState.text()).toContain('Generate your first report')
  })

  it('displays recent reports when available', async () => {
    // Simulate generating a report
    const clientButton = wrapper.findAll('button').find(button => 
      button.text().includes('Generate Report') && button.classes().includes('bg-green-600')
    )
    
    await clientButton.trigger('click')
    
    // Wait for async operation
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 2100)) // Wait for report generation
    
    // Should show recent reports
    const reportItems = wrapper.findAll('.flex.items-center.justify-between.p-3')
    expect(reportItems.length).toBeGreaterThan(0)
    
    const firstReport = reportItems[0]
    expect(firstReport.text()).toContain('Client Period Report')
    expect(firstReport.text()).toContain('client')
  })

  it('has download and delete buttons for recent reports', async () => {
    // Generate a report first
    const clientButton = wrapper.findAll('button').find(button => 
      button.text().includes('Generate Report') && button.classes().includes('bg-green-600')
    )
    
    await clientButton.trigger('click')
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 2100))
    
    const reportItem = wrapper.find('.flex.items-center.justify-between.p-3')
    const actionButtons = reportItem.findAll('button[title]')
    
    expect(actionButtons).toHaveLength(2)
    expect(actionButtons[0].attributes('title')).toBe('Download report')
    expect(actionButtons[1].attributes('title')).toBe('Delete report')
  })

  it('handles report download', async () => {
    // Generate a report first
    const clientButton = wrapper.findAll('button').find(button => 
      button.text().includes('Generate Report') && button.classes().includes('bg-green-600')
    )
    
    await clientButton.trigger('click')
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 2100))
    
    const downloadButton = wrapper.find('button[title="Download report"]')
    await downloadButton.trigger('click')
    
    // Should show download notification (would be visible in NotificationContainer)
    // This is more of an integration test with the notification system
  })

  it('handles report deletion', async () => {
    // Generate a report first
    const clientButton = wrapper.findAll('button').find(button => 
      button.text().includes('Generate Report') && button.classes().includes('bg-green-600')
    )
    
    await clientButton.trigger('click')
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 2100))
    
    const initialCount = wrapper.findAll('.flex.items-center.justify-between.p-3').length
    
    const deleteButton = wrapper.find('button[title="Delete report"]')
    await deleteButton.trigger('click')
    
    await wrapper.vm.$nextTick()
    
    const finalCount = wrapper.findAll('.flex.items-center.justify-between.p-3').length
    expect(finalCount).toBe(initialCount - 1)
  })

  it('formats dates correctly', () => {
    const testDate = new Date('2024-01-15T10:30:00')
    const formattedDate = wrapper.vm.formatDate(testDate)
    
    expect(formattedDate).toMatch(/Jan 15, 2024 \d{1,2}:\d{2} [AP]M/)
  })

  it('has correct report icon classes', () => {
    expect(wrapper.vm.getReportIconClasses('client')).toContain('bg-green-100')
    expect(wrapper.vm.getReportIconClasses('timekeeper')).toContain('bg-blue-100')
    expect(wrapper.vm.getReportIconClasses('time')).toContain('bg-purple-100')
  })

  it('has proper responsive layout', () => {
    const grid = wrapper.find('.grid')
    expect(grid.classes()).toContain('grid-cols-1')
    expect(grid.classes()).toContain('md:grid-cols-2')
    expect(grid.classes()).toContain('lg:grid-cols-3')
  })
})