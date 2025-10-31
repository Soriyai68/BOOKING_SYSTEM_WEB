import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  // Initialize theme from localStorage or system preference
  const getInitialTheme = () => {
    const stored = localStorage.getItem('cinema_theme')
    if (stored) return stored

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const theme = ref(getInitialTheme())
  const loading = ref(false)
  const breadcrumbs = ref([])

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('cinema_theme', newTheme)

    // Update Element Plus theme
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    console.log(`Theme changed to: ${newTheme}`)
  }

  // Apply the theme on initial load
  setTheme(theme.value)

  const toggleTheme = () => {
    const newTheme = theme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const setLoading = (isLoading) => {
    loading.value = isLoading
  }

  const setBreadcrumbs = (items) => {
    breadcrumbs.value = items
  }

  const addBreadcrumb = (item) => {
    breadcrumbs.value.push(item)
  }



  return {
    sidebarCollapsed,
    theme,
    loading,
    breadcrumbs,
    toggleSidebar,
    setSidebarCollapsed,
    setTheme,
    toggleTheme,
    setLoading,
    setBreadcrumbs,
    addBreadcrumb
  }
})