import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresGuest: true } // 👈 mark login for guests
  },

  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true , },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: 'Dashboard' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UserList.vue'),
        meta: { title: 'Users Management' }
      },
      {
        path: 'users/create',
        name: 'CreateUser',
        component: () => import('@/views/users/CreateUser.vue'),
        meta: { title: 'Create User' }
      },
      {
        path: 'users/:id/edit',
        name: 'EditUser',
        component: () => import('@/views/users/EditUser.vue'),
        meta: { title: 'Edit User' }
      },
      {
        path: 'theaters',
        name: 'Theaters',
        component: () => import('@/views/theaters/TheaterList.vue'),
        meta: { title: 'Theaters Management' }
      },
      {
        path: 'theaters/create',
        name: 'CreateTheater',
        component: () => import('@/views/theaters/CreateTheater.vue'),
        meta: { title: 'Create Theater' }
      },
      {
        path: 'theaters/:id',
        name: 'TheaterDetail',
        component: () => import('@/views/theaters/TheaterDetail.vue'),
        meta: { title: 'Theater Details' }
      },
      {
        path: 'theaters/:id/edit',
        name: 'EditTheater',
        component: () => import('@/views/theaters/EditTheater.vue'),
        meta: { title: 'Edit Theater' }
      },

      {
        path: 'screens',
        name: 'Screens',
        component: () => import('@/views/screens/ScreenList.vue'),
        meta: { title: 'Screens Management' }
      },
      {
        path: 'screens/create',
        name: 'CreateScreen',
        component: () => import('@/views/screens/CreateScreen.vue'),
        meta: { title: 'Create Screen' }
      },
      {
        path: 'screens/:id',
        name: 'ScreenDetail',
        component: () => import('@/views/screens/ScreenDetail.vue'),
        meta: { title: 'Screen Details' }
      },
      {
        path: 'screens/:id/edit',
        name: 'EditScreen',
        component: () => import('@/views/screens/EditScreen.vue'),
        meta: { title: 'Edit Screen' }
      },

      {
        path: 'movies',
        name: 'Movies',
        component: () => import('@/views/movies/MovieList.vue'),
        meta: { title: 'Movies Management' }
      },
      {
        path: 'movies/create',
        name: 'CreateMovie',
        component: () => import('@/views/movies/CreateMovie.vue'),
        meta: { title: 'Add Movie' }
      },
      {
        path: 'movies/:id/edit',
        name: 'EditMovie',
        component: () => import('@/views/movies/EditMovie.vue'),
        meta: { title: 'Edit Movie' }
      },
      {
        path: 'bookings',
        name: 'Bookings',
        component: () => import('@/views/bookings/BookingList.vue'),
        meta: { title: 'Bookings Management' }
      },
      {
        path: 'bookings/:id',
        name: 'BookingDetail',
        component: () => import('@/views/bookings/BookingDetail.vue'),
        meta: { title: 'Booking Details' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/Settings.vue'),
        meta: { title: 'Settings' }
      }
    ]
  },
  {
    path: '/',
    redirect: '/admin'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()

  // Wait for auth initialization if not already initialized
  if (!authStore.isInitialized) {
    console.log('Waiting for auth initialization...')
    try {
      await authStore.initializeAuth()
    } catch (error) {
      console.error('Auth initialization failed:', error)
    }
  }

  console.log('Route guard check:', {
    to: to.path,
    requiresAuth: to.matched.some(record => record.meta.requiresAuth),
    requiresAdmin: to.matched.some(record => record.meta.requiresAdmin),
    requiresGuest: to.matched.some(record => record.meta.requiresGuest),
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin,
    userRole: authStore.userRole
  })

  // Auth required?
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      console.log('Access denied: Not authenticated')
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    // Check admin if required
    if (to.matched.some(record => record.meta.requiresAdmin) && !authStore.isAdmin) {
      console.log('Access denied: Not admin')
      return next({ name: 'AdminDashboard' })
    }
  }

  // Guest routes (like login)
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (authStore.isAuthenticated) {
      console.log('Already authenticated, redirecting to dashboard')
      return next('/admin/dashboard')
    }
  }

  console.log('Route access granted')
  return next()
})

export default router
