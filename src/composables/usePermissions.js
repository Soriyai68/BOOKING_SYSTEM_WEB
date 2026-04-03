import { usePermissionStore } from "@/stores/permission";
import { useAuthStore } from "@/stores/auth";

/**
 * Composable for permission checking in Vue components
 * @returns {object} Permission checking utilities and reactive state
 */
export function usePermissions() {
  const permissionStore = usePermissionStore();
  const authStore = useAuthStore();

  // Re-export all permission store functionality
  return {
    // State
    permissions: permissionStore.permissions,
    permissionDetails: permissionStore.permissionDetails,
    isLoading: permissionStore.isLoading,
    isInitialized: permissionStore.isInitialized,
    isSuperAdmin: permissionStore.isSuperAdmin,
    userRole: permissionStore.userRole,

    // Generic permission checking
    hasPermission: permissionStore.hasPermission,
    hasAllPermissions: permissionStore.hasAllPermissions,
    hasAnyPermission: permissionStore.hasAnyPermission,

    // Module-based helpers
    canView: permissionStore.canView,
    canCreate: permissionStore.canCreate,
    canEdit: permissionStore.canEdit,
    canDelete: permissionStore.canDelete,
    canManage: permissionStore.canManage,

    // Specific module permissions
    canViewUsers: permissionStore.canViewUsers,
    canCreateUsers: permissionStore.canCreateUsers,
    canEditUsers: permissionStore.canEditUsers,
    canDeleteUsers: permissionStore.canDeleteUsers,
    canManageUsers: permissionStore.canManageUsers,

    canViewTheaters: permissionStore.canViewTheaters,
    canCreateTheaters: permissionStore.canCreateTheaters,
    canEditTheaters: permissionStore.canEditTheaters,
    canDeleteTheaters: permissionStore.canDeleteTheaters,
    canManageTheaters: permissionStore.canManageTheaters,

    canViewHalls: permissionStore.canViewHalls,
    canCreateHalls: permissionStore.canCreateHalls,
    canEditHalls: permissionStore.canEditHalls,
    canDeleteHalls: permissionStore.canDeleteHalls,
    canManageHalls: permissionStore.canManageHalls,

    canViewSeats: permissionStore.canViewSeats,
    canCreateSeats: permissionStore.canCreateSeats,
    canEditSeats: permissionStore.canEditSeats,
    canDeleteSeats: permissionStore.canDeleteSeats,
    canManageSeats: permissionStore.canManageSeats,
    canViewSeatBookingHistory: permissionStore.canViewSeatBookingHistory,

    canViewMovies: permissionStore.canViewMovies,
    canCreateMovies: permissionStore.canCreateMovies,
    canEditMovies: permissionStore.canEditMovies,
    canDeleteMovies: permissionStore.canDeleteMovies,
    canManageMovies: permissionStore.canManageMovies,

    canViewShowtimes: permissionStore.canViewShowtimes,
    canCreateShowtimes: permissionStore.canCreateShowtimes,
    canEditShowtimes: permissionStore.canEditShowtimes,
    canDeleteShowtimes: permissionStore.canDeleteShowtimes,
    canManageShowtimes: permissionStore.canManageShowtimes,

    canViewBookings: permissionStore.canViewBookings,
    canCreateBookings: permissionStore.canCreateBookings,
    canEditBookings: permissionStore.canEditBookings,
    canDeleteBookings: permissionStore.canDeleteBookings,
    canManageBookings: permissionStore.canManageBookings,

    canViewBookingDetails: permissionStore.canViewBookingDetails,
    canCreateBookingDetails: permissionStore.canCreateBookingDetails,
    canEditBookingDetails: permissionStore.canEditBookingDetails,
    canDeleteBookingDetails: permissionStore.canDeleteBookingDetails,
    canManageBookingDetails: permissionStore.canManageBookingDetails,

    canViewBookingTickets: permissionStore.canViewBookingTickets,
    canCreateBookingTickets: permissionStore.canCreateBookingTickets,
    canEditBookingTickets: permissionStore.canEditBookingTickets,
    canDeleteBookingTickets: permissionStore.canDeleteBookingTickets,
    canManageBookingTickets: permissionStore.canManageBookingTickets,

    canViewInvoices: permissionStore.canViewInvoices,
    canCreateInvoices: permissionStore.canCreateInvoices,
    canEditInvoices: permissionStore.canEditInvoices,
    canDeleteInvoices: permissionStore.canDeleteInvoices,
    canManageInvoices: permissionStore.canManageInvoices,

    canViewPayments: permissionStore.canViewPayments,
    canCreatePayments: permissionStore.canCreatePayments,
    canEditPayments: permissionStore.canEditPayments,
    canDeletePayments: permissionStore.canDeletePayments,
    canManagePayments: permissionStore.canManagePayments,

    canViewPromotions: permissionStore.canViewPromotions,
    canCreatePromotions: permissionStore.canCreatePromotions,
    canEditPromotions: permissionStore.canEditPromotions,
    canDeletePromotions: permissionStore.canDeletePromotions,
    canManagePromotions: permissionStore.canManagePromotions,

    canViewDashboard: permissionStore.canViewDashboard,
    canViewAnalytics: permissionStore.canViewAnalytics,
    canViewSettings: permissionStore.canViewSettings,
    canEditSettings: permissionStore.canEditSettings,
    canManageSettings: permissionStore.canManageSettings,
    canManageSystem: permissionStore.canManageSystem,

    // Reports
    canViewReports: permissionStore.canViewReports,
    canViewTotalCustomersReport: permissionStore.canViewTotalCustomersReport,
    canViewTotalBookingsReport: permissionStore.canViewTotalBookingsReport,
    canViewTotalRevenueReport: permissionStore.canViewTotalRevenueReport,
    canViewTotalMoviesReport: permissionStore.canViewTotalMoviesReport,
    canViewCustomerFrequencyReport: permissionStore.canViewCustomerFrequencyReport,
    canViewRevenueReport: permissionStore.canViewRevenueReport,
    canViewBookingStatusReport: permissionStore.canViewBookingStatusReport,
    canViewPopularMoviesReport: permissionStore.canViewPopularMoviesReport,
    canViewSeatTypeRevenueReport: permissionStore.canViewSeatTypeRevenueReport,
    canViewDetailedRevenueReport: permissionStore.canViewDetailedRevenueReport,
    canViewDetailedBookingsReport: permissionStore.canViewDetailedBookingsReport,
    canViewDetailedMoviesReport: permissionStore.canViewDetailedMoviesReport,
    canViewPaymentMethodAnalysisReport: permissionStore.canViewPaymentMethodAnalysisReport,
    canViewShowtimeUtilizationReport: permissionStore.canViewShowtimeUtilizationReport,
    canViewCustomerDemographicReport: permissionStore.canViewCustomerDemographicReport,
    canViewStaffPerformanceReport: permissionStore.canViewStaffPerformanceReport,
    canViewInventorySeatManagementReport: permissionStore.canViewInventorySeatManagementReport,

    // Backup permissions
    canViewBackups: permissionStore.canViewBackups,
    canCreateBackups: permissionStore.canCreateBackups,
    canRestoreBackups: permissionStore.canRestoreBackups,
    canDeleteBackups: permissionStore.canDeleteBackups,
    canScheduleBackups: permissionStore.canScheduleBackups,
    canViewBackupStats: permissionStore.canViewBackupStats,
    canManageBackups: permissionStore.canManageBackups,

    // Data getters
    getPermissionsByModule: permissionStore.getPermissionsByModule,
    getAvailableModules: permissionStore.getAvailableModules,

    // Actions
    initializePermissions: permissionStore.initializePermissions,
    refreshPermissions: permissionStore.refreshPermissions,
    checkPermissionAPI: permissionStore.checkPermissionAPI
  };
}

/**
 * Permission constants for easy reference in components
 */
export const PERMISSIONS = {
  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE: 'users.manage',

  // Theaters
  THEATERS_VIEW: 'theaters.view',
  THEATERS_CREATE: 'theaters.create',
  THEATERS_EDIT: 'theaters.edit',
  THEATERS_DELETE: 'theaters.delete',
  THEATERS_MANAGE: 'theaters.manage',

  // Halls
  HALLS_VIEW: 'halls.view',
  HALLS_CREATE: 'halls.create',
  HALLS_EDIT: 'halls.edit',
  HALLS_DELETE: 'halls.delete',
  HALLS_MANAGE: 'halls.manage',

  // Seats
  SEATS_VIEW: 'seats.view',
  SEATS_CREATE: 'seats.create',
  SEATS_EDIT: 'seats.edit',
  SEATS_DELETE: 'seats.delete',
  SEATS_MANAGE: 'seats.manage',
  VIEW_SEAT_BOOKING_HISTORY: 'seat_bookings.history.view',

  // Movies
  MOVIES_VIEW: 'movies.view',
  MOVIES_CREATE: 'movies.create',
  MOVIES_EDIT: 'movies.edit',
  MOVIES_DELETE: 'movies.delete',
  MOVIES_MANAGE: 'movies.manage',

  // Showtimes
  SHOWTIMES_VIEW: 'showtimes.view',
  SHOWTIMES_CREATE: 'showtimes.create',
  SHOWTIMES_EDIT: 'showtimes.edit',
  SHOWTIMES_DELETE: 'showtimes.delete',
  SHOWTIMES_MANAGE: 'showtimes.manage',

  // Bookings
  BOOKINGS_VIEW: 'bookings.view',
  BOOKINGS_CREATE: 'bookings.create',
  BOOKINGS_EDIT: 'bookings.edit',
  BOOKINGS_DELETE: 'bookings.delete',
  BOOKINGS_MANAGE: 'bookings.manage',

  // Booking Details
  BOOKING_DETAILS_VIEW: 'bookingDetails.view',
  BOOKING_DETAILS_CREATE: 'bookingDetails.create',
  BOOKING_DETAILS_EDIT: 'bookingDetails.edit',
  BOOKING_DETAILS_DELETE: 'bookingDetails.delete',
  BOOKING_DETAILS_MANAGE: 'bookingDetails.manage',

  // Booking Tickets
  BOOKING_TICKETS_VIEW: 'booking-tickets.view',
  BOOKING_TICKETS_CREATE: 'booking-tickets.create',
  BOOKING_TICKETS_EDIT: 'booking-tickets.edit',
  BOOKING_TICKETS_DELETE: 'booking-tickets.delete',
  BOOKING_TICKETS_MANAGE: 'booking-tickets.manage',

  // Promotions
  PROMOTION_VIEW: 'promotions.view',
  PROMOTION_CREATE: 'promotions.create',
  PROMOTION_EDIT: 'promotions.edit',
  PROMOTION_DELETE: 'promotions.delete',
  PROMOTION_MANAGE: 'promotions.manage',

  // Invoices
  INVOICES_VIEW: 'invoices.view',
  INVOICES_CREATE: 'invoices.create',
  INVOICES_EDIT: 'invoices.edit',
  INVOICES_DELETE: 'invoices.delete',
  INVOICES_MANAGE: 'invoices.manage',

  // Payments
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_EDIT: 'payments.edit',
  PAYMENTS_DELETE: 'payments.delete',
  PAYMENTS_MANAGE: 'payments.manage',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_TOTAL_CUSTOMERS: 'reports.total-customers.view',
  REPORTS_TOTAL_BOOKINGS: 'reports.total-bookings.view',
  REPORTS_TOTAL_REVENUE: 'reports.total-revenue.view',
  REPORTS_TOTAL_MOVIES: 'reports.total-movies.view',
  REPORTS_CUSTOMER_FREQUENCY: 'reports.customer-frequency.view',
  REPORTS_REVENUE: 'reports.revenue-report.view',
  REPORTS_BOOKING_STATUS: 'reports.booking-status-report.view',
  REPORTS_POPULAR_MOVIES: 'reports.popular-movies-report.view',
  REPORTS_SEAT_TYPE_REVENUE: 'reports.seat-type-revenue-report.view',
  REPORTS_DETAILED_REVENUE: 'reports.detailed-revenue.view',
  REPORTS_DETAILED_BOOKINGS: 'reports.detailed-bookings.view',
  REPORTS_DETAILED_MOVIES: 'reports.detailed-movies.view',
  REPORTS_PAYMENT_METHOD_ANALYSIS: 'reports.payment-method-analysis.view',
  REPORTS_SHOWTIME_UTILIZATION: 'reports.showtime-utilization.view',
  REPORTS_CUSTOMER_DEMOGRAPHIC: 'reports.customer-demographic.view',
  REPORTS_STAFF_PERFORMANCE: 'reports.staff-performance.view',
  REPORTS_INVENTORY_SEAT_MANAGEMENT: 'reports.inventory-seat-management.view',

  // System
  DASHBOARD_VIEW: 'dashboard.view',
  ANALYTICS_VIEW: 'analytics.view',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_MANAGE: 'settings.manage',
  SYSTEM_MANAGE: 'system.manage',

  // Backups
  BACKUPS_VIEW: 'backups.view',
  BACKUPS_CREATE: 'backups.create',
  BACKUPS_RESTORE: 'backups.restore',
  BACKUPS_DELETE: 'backups.delete',
  BACKUPS_SCHEDULE: 'backups.schedule',
  BACKUPS_STATS: 'backups.stats',
  BACKUPS_MANAGE: 'backups.manage'
};

/**
 * Helper to create permission-based route meta
 * @param {string|string[]} permissions - Required permission(s)
 * @param {boolean} requireAll - Whether to require all permissions (default: false)
 * @returns {object} Route meta object
 */
export function createPermissionMeta(permissions, requireAll = false) {
  return {
    requiresPermission: true,
    permissions: Array.isArray(permissions) ? permissions : [permissions],
    requireAll
  };
}

/**
 * Check if user has permission for a route
 * @param {object} route - Vue route object
 * @param {object} permissionStore - Permission store instance
 * @returns {boolean} Whether user has required permissions
 */
export function checkRoutePermissions(route, permissionStore) {
  // Check if route requires permissions
  const requiresPermission = route.matched.some(record =>
    record.meta.requiresPermission
  );

  if (!requiresPermission) {
    return true; // No permissions required
  }

  // Get all required permissions from matched routes
  const allRequiredPermissions = [];
  let requireAll = false;

  route.matched.forEach(record => {
    if (record.meta.requiresPermission) {
      const routePermissions = record.meta.permissions || [];
      allRequiredPermissions.push(...routePermissions);

      // If any route requires all permissions, set requireAll to true
      if (record.meta.requireAll) {
        requireAll = true;
      }
    }
  });

  // Remove duplicates
  const uniquePermissions = [...new Set(allRequiredPermissions)];

  // Check permissions
  if (requireAll) {
    return permissionStore.hasAllPermissions(uniquePermissions);
  } else {
    return permissionStore.hasAnyPermission(uniquePermissions);
  }
}
