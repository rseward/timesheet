import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../DashboardView.vue'

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: {
      user_id: 1,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com'
    },
    logout: vi.fn()
  })
}))

// Mock router
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
    { path: '/clients', name: 'clients', component: { template: '<div>Clients</div>' } },
    { path: '/projects', name: 'projects', component: { template: '<div>Projects</div>' } },
    { path: '/tasks', name: 'tasks', component: { template: '<div>Tasks</div>' } },
    { path: '/hours', name: 'hours', component: { template: '<div>Hours</div>' } },
    { path: '/reports', name: 'reports', component: { template: '<div>Reports</div>' } },
    { path: '/profile', name: 'profile', component: { template: '<div>Profile</div>' } },
    { path: '/preferences', name: 'preferences', component: { template: '<div>Preferences</div>' } }
  ]
})

describe('DashboardView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const createWrapper = () => {
    return mount(DashboardView, {
      global: {
        plugins: [mockRouter]
      }
    })
  }

  describe('Component Rendering', () => {
    it('renders the dashboard title correctly', () => {
      const wrapper = createWrapper()
      
      // The first h1 is "Timesheet" in the header, the main title is "Dashboard"
      const headings = wrapper.findAll('h1')
      expect(headings.length).toBeGreaterThan(1)
      expect(headings[1].text()).toBe('Dashboard')
    })

    it('renders the welcome message', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.text()).toContain('Welcome to the Timesheet application')
    })

    it('displays user welcome message with name', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.text()).toContain('Welcome, Test User')
    })

    it('renders all navigation cards', () => {
      const wrapper = createWrapper()
      
      // Check for all 5 main navigation sections
      expect(wrapper.text()).toContain('Clients')
      expect(wrapper.text()).toContain('Projects') 
      expect(wrapper.text()).toContain('Tasks')
      expect(wrapper.text()).toContain('Hours')
      expect(wrapper.text()).toContain('Reports')
    })
  })

  describe('Navigation Cards', () => {
    it('renders clients card with correct color and link', () => {
      const wrapper = createWrapper()
      
      const clientsCard = wrapper.find('a[href="/clients"]')
      expect(clientsCard.exists()).toBe(true)
      expect(clientsCard.text()).toContain('View all clients')
      
      // Check for green color classes (clients are green)
      expect(wrapper.html()).toContain('bg-green-500')
    })

    it('renders projects card with correct color and link', () => {
      const wrapper = createWrapper()
      
      const projectsCard = wrapper.find('a[href="/projects"]')
      expect(projectsCard.exists()).toBe(true)
      expect(projectsCard.text()).toContain('View all projects')
      
      // Check for amber color classes (projects are amber)
      expect(wrapper.html()).toContain('bg-amber-500')
    })

    it('renders tasks card with correct color and link', () => {
      const wrapper = createWrapper()
      
      const tasksCard = wrapper.find('a[href="/tasks"]')
      expect(tasksCard.exists()).toBe(true)
      expect(tasksCard.text()).toContain('View all tasks')
      
      // Check for cyan color classes (tasks are cyan)
      expect(wrapper.html()).toContain('bg-cyan-500')
    })

    it('renders hours card with correct color and link', () => {
      const wrapper = createWrapper()
      
      const hoursCard = wrapper.find('a[href="/hours"]')
      expect(hoursCard.exists()).toBe(true)
      expect(hoursCard.text()).toContain('Track time')
      
      // Check for purple color classes (hours are purple)
      expect(wrapper.html()).toContain('bg-purple-500')
    })

    it('renders reports card with correct color and link', () => {
      const wrapper = createWrapper()
      
      const reportsCard = wrapper.find('a[href="/reports"]')
      expect(reportsCard.exists()).toBe(true)
      expect(reportsCard.text()).toContain('View reports')
      
      // Check for yellow color classes (reports are yellow)
      expect(wrapper.html()).toContain('bg-yellow-500')
    })
  })

  describe('Responsive Design', () => {
    it('applies correct grid classes for responsive layout', () => {
      const wrapper = createWrapper()
      
      const gridContainer = wrapper.find('.grid')
      expect(gridContainer.classes()).toContain('grid-cols-1')
      expect(gridContainer.classes()).toContain('sm:grid-cols-2')
      expect(gridContainer.classes()).toContain('lg:grid-cols-3')
      expect(gridContainer.classes()).toContain('xl:grid-cols-4')
      expect(gridContainer.classes()).toContain('2xl:grid-cols-5')
    })

    it('applies responsive gap classes', () => {
      const wrapper = createWrapper()
      
      const gridContainer = wrapper.find('.grid')
      expect(gridContainer.classes()).toContain('gap-4')
      expect(gridContainer.classes()).toContain('sm:gap-6')
    })
  })

  describe('Interactive Features', () => {
    it('applies hover effect classes to navigation cards', () => {
      const wrapper = createWrapper()
      
      const cards = wrapper.findAll('.group')
      expect(cards.length).toBe(5) // Should have 5 navigation cards
      
      cards.forEach(card => {
        expect(card.classes()).toContain('hover:shadow-lg')
        expect(card.classes()).toContain('transition-all')
        expect(card.classes()).toContain('hover:-translate-y-1')
        expect(card.classes()).toContain('cursor-pointer')
      })
    })

    it('applies color transition effects to card icons', () => {
      const wrapper = createWrapper()
      
      // Check that the HTML contains group-hover classes
      expect(wrapper.html()).toContain('group-hover:bg-green-600')
      expect(wrapper.html()).toContain('group-hover:bg-amber-600')
      expect(wrapper.html()).toContain('group-hover:bg-cyan-600')
      expect(wrapper.html()).toContain('group-hover:bg-purple-600')
      expect(wrapper.html()).toContain('group-hover:bg-yellow-600')
      expect(wrapper.html()).toContain('transition-colors')
      expect(wrapper.html()).toContain('duration-200')
    })
  })

  describe('User Interface', () => {
    it('has profile menu toggle functionality', () => {
      const wrapper = createWrapper()
      
      // Look for the profile/settings button (gear icon)
      const profileButtons = wrapper.findAll('button')
      const hasProfileButton = profileButtons.some(button => 
        button.html().includes('path') && button.html().includes('stroke')
      )
      expect(hasProfileButton).toBe(true)
    })

    it('has logout button functionality', () => {
      const wrapper = createWrapper()
      
      // const logoutButton = wrapper.find('button')
      const hasLogoutButton = wrapper.text().includes('Sign out') || wrapper.text().includes('Signing out')
      expect(hasLogoutButton).toBe(true)
    })

    it('displays correct user name in header', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.text()).toContain('Test User')
    })
  })

  describe('Dark Mode Support', () => {
    it('applies dark mode classes', () => {
      const wrapper = createWrapper()
      
      // Check that dark mode classes are present
      expect(wrapper.html()).toContain('dark:bg-gray-900')
      expect(wrapper.html()).toContain('dark:bg-gray-800')
      expect(wrapper.html()).toContain('dark:text-white')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const wrapper = createWrapper()
      
      const headings = wrapper.findAll('h1')
      expect(headings.length).toBeGreaterThan(0)
      // Check that "Dashboard" appears in one of the headings
      const hasDashboardHeading = headings.some(h => h.text() === 'Dashboard')
      expect(hasDashboardHeading).toBe(true)
    })

    it('has descriptive link text with arrows', () => {
      const wrapper = createWrapper()
      
      const links = wrapper.findAll('a')
      links.forEach(link => {
        if (link.text().includes('View') || link.text().includes('Track')) {
          expect(link.text()).toContain('→')
        }
      })
    })

    it('has proper color contrast with dark and light themes', () => {
      const wrapper = createWrapper()
      
      // Verify text color classes exist for both themes
      expect(wrapper.html()).toContain('text-gray-900')
      expect(wrapper.html()).toContain('dark:text-white')
      expect(wrapper.html()).toContain('text-gray-600')
      expect(wrapper.html()).toContain('dark:text-gray-400')
    })
  })
})