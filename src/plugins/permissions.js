import { usePermissionStore } from '@/stores/permission';
import { useAuthStore } from '@/stores/auth';
import { watch } from 'vue';

export function initializePermissionSystem() {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();
  
  // Watch for auth state changes and initialize/clear permissions accordingly
  watch(
    () => authStore.isAuthenticated,
    async (isAuthenticated) => {
      if (isAuthenticated) {
        console.log('🔐 User authenticated, initializing permissions...');
        try {
          await permissionStore.initializePermissions();
          console.log('✅ Permissions initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize permissions:', error);
        }
      } else {
        console.log('🔓 User logged out, clearing permissions...');
        permissionStore.clearPermissions();
      }
    },
    { immediate: true }
  );
  
  // Also watch for user role changes
  watch(
    () => authStore.user?.role,
    async (newRole, oldRole) => {
      if (newRole && newRole !== oldRole && authStore.isAuthenticated) {
        console.log(`🔄 User role changed from ${oldRole} to ${newRole}, refreshing permissions...`);
        try {
          await permissionStore.refreshPermissions();
          console.log('✅ Permissions refreshed successfully');
        } catch (error) {
          console.error('❌ Failed to refresh permissions:', error);
        }
      }
    }
  );
}

// Vue plugin format
export default {
  install(app) {
    // Initialize the permission system when the plugin is installed
    app.config.globalProperties.$initPermissions = initializePermissionSystem;
    
    // Make permission utilities globally available
    app.config.globalProperties.$permissions = {
      init: initializePermissionSystem,
      store: usePermissionStore
    };
  }
};