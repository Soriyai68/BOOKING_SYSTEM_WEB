import { usePermissionStore } from '@/stores/permission'
import { useAuthStore } from '@/stores/auth'
import { watch } from 'vue'

export function initializePermissionSystem() {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  watch(
    () => authStore.isAuthenticated,
    async isAuthenticated => {
      if (isAuthenticated) {
        try {
          await permissionStore.initializePermissions()
        } catch (error) {
          // handle error silently
        }
      } else {
        permissionStore.clearPermissions()
      }
    },
    { immediate: true }
  )

  watch(
    () => authStore.user?.role,
    async (newRole, oldRole) => {
      if (newRole && newRole !== oldRole && authStore.isAuthenticated) {
        try {
          await permissionStore.refreshPermissions()
        } catch (error) {
          // handle error silently
        }
      }
    }
  )
}

export default {
  install(app) {
    app.config.globalProperties.$initPermissions = initializePermissionSystem

    app.config.globalProperties.$permissions = {
      init: initializePermissionSystem,
      store: usePermissionStore
    }
  }
}
