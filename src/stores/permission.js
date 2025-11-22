import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/utils/api";
import { useAuthStore } from "./auth";

export const usePermissionStore = defineStore("permission", () => {
  const authStore = useAuthStore();

  // State
  const permissions = ref([]);
  const permissionDetails = ref([]);
  const isLoading = ref(false);
  const isInitialized = ref(false);
  const lastFetched = ref(null);

  // Computed
  const isSuperAdmin = computed(() => authStore.isSuperAdmin);
  const userRole = computed(() => authStore.userRole);

  // Permission checking functions
  const hasPermission = (permission) => {
    if (!authStore.isAuthenticated) return false;

    // SuperAdmin has ALL permissions
    if (isSuperAdmin.value) {
      // console.log('SuperAdmin bypass for permission:', permission);
      return true;
    }

    if (Array.isArray(permission)) {
      // If array provided, user needs ANY of the permissions
      return permission.some(p => permissions.value.includes(p));
    }

    return permissions.value.includes(permission);
  };

  const hasAllPermissions = (permissionList) => {
    if (!authStore.isAuthenticated) return false;

    // SuperAdmin has ALL permissions
    if (isSuperAdmin.value) return true;

    if (!Array.isArray(permissionList)) {
      return hasPermission(permissionList);
    }

    return permissionList.every(permission => permissions.value.includes(permission));
  };

  const hasAnyPermission = (permissionList) => {
    if (!authStore.isAuthenticated) return false;

    // SuperAdmin has ALL permissions
    if (isSuperAdmin.value) return true;

    if (!Array.isArray(permissionList)) {
      return hasPermission(permissionList);
    }

    return permissionList.some(permission => permissions.value.includes(permission));
  };

  // Module-based permission checking
  const canView = (module) => hasPermission(`${module}.view`);
  const canCreate = (module) => hasPermission(`${module}.create`);
  const canEdit = (module) => hasPermission(`${module}.edit`);
  const canDelete = (module) => hasPermission(`${module}.delete`);
  const canManage = (module) => hasPermission(`${module}.manage`);

  // Specific module permissions
  const canViewDashboard = computed(() => hasPermission('dashboard.view'));
  const canViewAnalytics = computed(() => hasPermission('analytics.view'));
  const canViewSettings = computed(() => hasPermission('settings.view'));
  const canEditSettings = computed(() => hasPermission('settings.edit'));
  const canManageSettings = computed(() => hasPermission('settings.manage'));
  const canManageSystem = computed(() => hasPermission('system.manage'));

  const canViewUsers = computed(() => canView('users'));
  const canCreateUsers = computed(() => canCreate('users'));
  const canEditUsers = computed(() => canEdit('users'));
  const canDeleteUsers = computed(() => canDelete('users'));
  const canManageUsers = computed(() => canManage('users'));

  const canViewTheaters = computed(() => canView('theaters'));
  const canCreateTheaters = computed(() => canCreate('theaters'));
  const canEditTheaters = computed(() => canEdit('theaters'));
  const canDeleteTheaters = computed(() => canDelete('theaters'));
  const canManageTheaters = computed(() => canManage('theaters'));

  const canViewHalls = computed(() => canView('halls'));
  const canCreateHalls = computed(() => canCreate('halls'));
  const canEditHalls = computed(() => canEdit('halls'));
  const canDeleteHalls = computed(() => canDelete('halls'));
  const canManageHalls = computed(() => canManage('halls'));

  const canViewSeats = computed(() => canView('seats'));
  const canCreateSeats = computed(() => canCreate('seats'));
  const canEditSeats = computed(() => canEdit('seats'));
  const canDeleteSeats = computed(() => canDelete('seats'));
  const canManageSeats = computed(() => canManage('seats'));

  const canViewMovies = computed(() => canView('movies'));
  const canCreateMovies = computed(() => canCreate('movies'));
  const canEditMovies = computed(() => canEdit('movies'));
  const canDeleteMovies = computed(() => canDelete('movies'));
  const canManageMovies = computed(() => canManage('movies'));

  const canViewShowtimes = computed(() => canView('showtimes'));
  const canCreateShowtimes = computed(() => canCreate('showtimes'));
  const canEditShowtimes = computed(() => canEdit('showtimes'));
  const canDeleteShowtimes = computed(() => canDelete('showtimes'));
  const canManageShowtimes = computed(() => canManage('showtimes'));

  const canViewBookings = computed(() => canView('bookings'));
  const canCreateBookings = computed(() => canCreate('bookings'));
  const canEditBookings = computed(() => canEdit('bookings'));
  const canDeleteBookings = computed(() => canDelete('bookings'));
  const canManageBookings = computed(() => canManage('bookings'));

  const canViewPromotions = computed(() => canView('promotions'));
  const canCreatePromotions = computed(() => canCreate('promotions'));
  const canEditPromotions = computed(() => canEdit('promotions'));
  const canDeletePromotions = computed(() => canDelete('promotions'));
  const canManagePromotions = computed(() => canManage('promotions'));


  // Actions
  const fetchUserPermissions = async (force = false) => {
    // Don't fetch if not authenticated
    if (!authStore.isAuthenticated) {
      clearPermissions();
      return;
    }

    // Check if we need to fetch (not initialized, forced, or stale data)
    const shouldFetch = !isInitialized.value || force ||
      (lastFetched.value && Date.now() - lastFetched.value > 5 * 60 * 1000); // 5 minutes

    if (!shouldFetch) {
      return;
    }

    isLoading.value = true;

    try {
      const response = await api.get('/permissions/me');

      if (response.data.success) {
        const data = response.data.data;
        permissions.value = data.permissions || [];
        permissionDetails.value = data.permissionDetails || [];
        lastFetched.value = Date.now();
        isInitialized.value = true;

        // console.log('User permissions loaded:', {
        //   role: data.role,
        //   isSuperAdmin: data.isSuperAdmin,
        //   permissionCount: permissions.value.length
        // });
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      // Don't throw error, just log it
      clearPermissions();
    } finally {
      isLoading.value = false;
    }
  };

  const checkPermissionAPI = async (permissionList, requireAll = false) => {
    if (!authStore.isAuthenticated) return false;
    if (isSuperAdmin.value) return true;

    try {
      const response = await api.post('/permissions/check', {
        permissions: permissionList,
        requireAll
      });

      return response.data.success && response.data.data.hasPermission;
    } catch (error) {
      console.error('Error checking permission via API:', error);
      return false;
    }
  };

  const clearPermissions = () => {
    permissions.value = [];
    permissionDetails.value = [];
    isInitialized.value = false;
    lastFetched.value = null;
  };

  const refreshPermissions = () => {
    return fetchUserPermissions(true);
  };

  // Initialize permissions when auth state changes
  const initializePermissions = async () => {
    if (authStore.isAuthenticated) {
      await fetchUserPermissions();
    } else {
      clearPermissions();
    }
  };

  // Get permissions grouped by module
  const getPermissionsByModule = computed(() => {
    const grouped = {};

    permissionDetails.value.forEach(permission => {
      if (!grouped[permission.module]) {
        grouped[permission.module] = [];
      }
      grouped[permission.module].push(permission);
    });

    return grouped;
  });

  // Get available modules
  const getAvailableModules = computed(() => {
    return [...new Set(permissionDetails.value.map(p => p.module))];
  });

  return {
    // State
    permissions,
    permissionDetails,
    isLoading,
    isInitialized,
    lastFetched,

    // Computed
    isSuperAdmin,
    userRole,
    getPermissionsByModule,
    getAvailableModules,

    // Generic permission checking
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,

    // Module-based helpers
    canView,
    canCreate,
    canEdit,
    canDelete,
    canManage,

    // Specific module permissions
    canViewUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canManageUsers,

    canViewTheaters,
    canCreateTheaters,
    canEditTheaters,
    canDeleteTheaters,
    canManageTheaters,

    canViewHalls,
    canCreateHalls,
    canEditHalls,
    canDeleteHalls,
    canManageHalls,

    canViewSeats,
    canCreateSeats,
    canEditSeats,
    canDeleteSeats,
    canManageSeats,

    canViewMovies,
    canCreateMovies,
    canEditMovies,
    canDeleteMovies,
    canManageMovies,

    canViewShowtimes,
    canCreateShowtimes,
    canEditShowtimes,
    canDeleteShowtimes,
    canManageShowtimes,

    canViewBookings,
    canCreateBookings,
    canEditBookings,
    canDeleteBookings,
    canManageBookings,

    canViewPromotions,
    canCreatePromotions,
    canEditPromotions,
    canDeletePromotions,
    canManagePromotions,

    canViewDashboard,
    canViewAnalytics,
    canViewSettings,
    canEditSettings,
    canManageSettings,
    canManageSystem,

    // Actions
    fetchUserPermissions,
    checkPermissionAPI,
    clearPermissions,
    refreshPermissions,
    initializePermissions
  };
});