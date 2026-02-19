import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Route Meta Interface for TypeScript
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresGuest?: boolean // For login page when already authenticated
    title?: string
    breadcrumb?: string
    hideFromNav?: boolean
  }
}

// Route definitions with lazy loading
const routes: RouteRecordRaw[] = [
  // Authentication Routes
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      requiresGuest: true,
      title: 'Login',
      hideFromNav: true
    }
  },

  // Main Application Routes
  {
    path: '/',
    redirect: '/dashboard',
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
      breadcrumb: 'Home'
    }
  },

  // Client Management
  {
    path: '/clients',
    name: 'clients',
    component: () => import('@/views/clients/ClientsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Clients',
      breadcrumb: 'Clients'
    }
  },

  // Project Management  
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/projects/ProjectsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Projects',
      breadcrumb: 'Projects'
    }
  },

  // Task Management
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('@/views/tasks/TasksView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Tasks', 
      breadcrumb: 'Tasks'
    }
  },

  // Time Tracking (Hours/Billing Events)
  {
    path: '/hours',
    name: 'hours',
    component: () => import('@/views/hours/HoursView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Hours',
      breadcrumb: 'Time Tracking'
    }
  },

  // Reports
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/views/reports/ReportsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Reports',
      breadcrumb: 'Reports'
    }
  },

  // Holiday Management
  {
    path: '/holidays',
    name: 'holidays',
    component: () => import('@/views/holidays/HolidaysView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Holidays',
      breadcrumb: 'Holidays'
    }
  },
  {
    path: '/holidays/federal',
    name: 'holidays-federal',
    component: () => import('@/views/holidays/HolidaysView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Federal Holidays',
      breadcrumb: 'Federal Holidays'
    }
  },
  {
    path: '/holidays/client/:clientId',
    name: 'holidays-client',
    component: () => import('@/views/holidays/HolidaysView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Client Holidays',
      breadcrumb: 'Client Holidays'
    }
  },

  // User Preferences
  {
    path: '/preferences',
    name: 'preferences', 
    component: () => import('@/views/preferences/PreferencesView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Preferences',
      breadcrumb: 'Preferences'
    }
  },

  // User Profile
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/profile/ProfileView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Profile',
      breadcrumb: 'Profile'
    }
  },

  // 404 Error Page
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: {
      title: 'Page Not Found',
      hideFromNav: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// Router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    // Scroll to top on route changes, or restore position if available
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation Guards
router.beforeEach(async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Timesheet`
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // Initialize auth store if needed
    if (!authStore.isAuthenticated && authStore.token) {
      try {
        await authStore.getCurrentUser()
      } catch (error) {
        // Token invalid, clear it
        await authStore.logout()
      }
    }
    
    if (!authStore.isAuthenticated) {
      // Redirect to login with return URL
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // Check if route requires guest (like login page)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect authenticated users away from login
    const redirectPath = (from.query.redirect as string) || '/dashboard'
    next(redirectPath)
    return
  }

  next()
})

// Export router and utility functions
export default router

// Utility function for generating breadcrumbs
export function generateBreadcrumbs(route: RouteLocationNormalized) {
  const breadcrumbs: Array<{ name: string; path?: string }> = []
  
  // Always start with Home
  breadcrumbs.push({
    name: 'Home',
    path: '/dashboard'
  })
  
  // Add current page if not home and has breadcrumb
  if (route.name !== 'dashboard' && route.meta.breadcrumb) {
    breadcrumbs.push({
      name: route.meta.breadcrumb,
      path: route.path
    })
  }
  
  return breadcrumbs
}

// Navigation helper functions
export const navigation = {
  // Main navigation items for UI components
  items: [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'home',
      color: 'blue'
    },
    {
      name: 'Clients', 
      path: '/clients',
      icon: 'building-office',
      color: 'green'
    },
    {
      name: 'Projects',
      path: '/projects', 
      icon: 'folder',
      color: 'amber'
    },
    {
      name: 'Tasks',
      path: '/tasks',
      icon: 'list-bullet',
      color: 'cyan'
    },
    {
      name: 'Hours',
      path: '/hours',
      icon: 'clock',
      color: 'purple'
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: 'chart-bar',
      color: 'yellow'
    }
  ],
  
  // User menu items
  userMenu: [
    {
      name: 'Profile',
      path: '/profile',
      icon: 'user'
    },
    {
      name: 'Preferences',
      path: '/preferences', 
      icon: 'cog-6-tooth'
    }
  ]
}
