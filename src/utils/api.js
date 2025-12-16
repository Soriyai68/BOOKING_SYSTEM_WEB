import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElNotification } from 'element-plus'
import router from '@/router'

// Create axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_VERSION ? '/' + import.meta.env.VITE_API_VERSION : ''}` || 'http://localhost:8080/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Prevent multiple simultaneous 401 handlers from running
let isHandling401 = false

// Request interceptor with debugging
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()

    // Add auth token to headers
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() }

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (import.meta.env.VITE_APP_ENV === 'development') {
      const duration = Date.now() - response.config.metadata.startTime
      // console.log(`API: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`, response.status)
    }

    return response
  },
  async (error) => {
    // Don't show error messages for login/logout attempts (let components handle it)
    const isLoginAttempt = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/admin-login')
    const isLogoutAttempt = error.config?.url?.includes('/auth/logout')
    const isAuthAttempt = isLoginAttempt || isLogoutAttempt

    if (error.response) {
      const { status, data } = error.response
      const { url, method } = error.config;

      // Special handling for check-payment polling: a 400 status is an expected "not yet paid" state.
      // We suppress the global error message for this specific case to avoid user confusion.
      if (status === 400 && method === 'post' && url && url.includes('/payments/check-payment')) {
        return Promise.reject(error);
      }

      // Log API errors in development
      if (import.meta.env.VITE_APP_ENV === 'development') {
        console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status,
          data,
          message: error.message
        })
      }

      // Only show automatic error messages for non-auth requests
      if (!isAuthAttempt) {
        switch (status) {
          case 401: {
            // Unauthorized - token expired or invalid (but not for login)
            const authStore = useAuthStore()

            // Avoid repeated logout/redirect when multiple requests fail with 401
            if (!isHandling401 && authStore.isAuthenticated) {
              isHandling401 = true
              try {
                await authStore.logout()
                ElMessage.error('Session expired. Please login again.')

                const currentPath = router.currentRoute.value.path
                if (currentPath !== '/login') {
                  router.push('/login')
                }
              } finally {
                isHandling401 = false
              }
            }
            break
          }

          case 403:
            ElMessage.error('Access denied. You don\'t have permission to perform this action.')
            break

          case 404:
            ElMessage.error('Resource not found.')
            break

          case 422:
            // Validation errors - show all errors
            if (data.errors) {
              const errorMessages = Object.values(data.errors).flat()
              errorMessages.forEach(message => {
                ElMessage.error(message)
              })
            } else {
              ElMessage.error(data.message || 'Validation failed.')
            }
            break

          case 429:
            ElMessage.warning('Too many requests. Please try again later.')
            break

          case 500:
            ElMessage.error('Server error. Please try again later.')
            ElNotification({
              title: 'Server Error',
              message: 'An internal server error occurred. Please contact support if this persists.',
              type: 'error',
              duration: 5000
            })
            break

          default:
            ElMessage.error(data.message || `HTTP Error: ${status}`)
        }
      }
    } else if (error.request) {
      // Network error - only show for non-auth requests
      if (!isAuthAttempt) {
        ElMessage.error('Network error. Please check your connection.')
        ElNotification({
          title: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          type: 'error',
          duration: 5000
        })
      }
    } else {
      // Other errors
      if (!isAuthAttempt) {
        ElMessage.error('An unexpected error occurred.')
      }
    }

    return Promise.reject(error)
  }
)

export default api