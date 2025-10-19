import { createRouter, createWebHistory } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { createPermissionMeta, checkRoutePermissions, PERMISSIONS } from "@/composables/usePermissions";

const routes = [
  {
    path: "/login",
    name: "Login",
    alias: ["/cashier/login"],
    component: () => import("@/views/auth/Login.vue"),
    meta: { requiresGuest: true },
  },

  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true, },
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: "",
        redirect: "/admin/dashboard",
      },
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("@/views/dashboard/Dashboard.vue"),
        meta: {
          title: "Dashboard",
          ...createPermissionMeta(PERMISSIONS.DASHBOARD_VIEW)
        },
      },
      //users
      {
        path: "users",
        name: "Users",
        component: () => import("@/views/users/UserList.vue"),
        meta: {
          title: "Users Management",
          ...createPermissionMeta(PERMISSIONS.USERS_VIEW)
        },
      },
      {
        path: "users/create",
        name: "CreateUser",
        component: () => import("@/views/users/CreateUser.vue"),
        meta: {
          title: "Create User",
          ...createPermissionMeta(PERMISSIONS.USERS_CREATE)
        },
      },
      {
        path: 'users/:id/edit',
        name: 'EditUser',
        component: () => import('@/views/users/EditUser.vue'),
        meta: {
          title: 'Edit User',
          ...createPermissionMeta(PERMISSIONS.USERS_EDIT)
        }
      },
      {
        path: 'users/roles',
        name: 'UserRoles',
        component: () => import('@/views/users/UserRoles.vue'),
        meta: {
          title: 'User Roles',
          ...createPermissionMeta(PERMISSIONS.USERS_MANAGE)
        }
      },
      //seats
      {
        path: 'seats',
        name: 'Seats',
        component: () => import('@/views/seats/SeatsList.vue'),
        meta: {
          title: 'Seats Management',
          ...createPermissionMeta(PERMISSIONS.SEATS_VIEW)
        }
      },
      {
        path: 'seats/create',
        name: 'CreateSeat',
        component: () => import('@/views/seats/CreateSeat.vue'),
        meta: {
          title: 'Create Seat',
          ...createPermissionMeta(PERMISSIONS.SEATS_CREATE)
        }
      },
      {
        path: 'seats/:id',
        name: 'SeatDetail',
        component: () => import('@/views/seats/SeatDetail.vue'),
        meta: {
          title: 'Seat Details',
          ...createPermissionMeta(PERMISSIONS.SEATS_VIEW)
        }
      },
      {
        path: 'seats/:id/edit',
        name: 'EditSeat',
        component: () => import('@/views/seats/EditSeat.vue'),
        meta: {
          title: 'Edit Seat',
          ...createPermissionMeta(PERMISSIONS.SEATS_EDIT)
        }
      },
      //theaters
      {
        path: 'theaters',
        name: 'Theaters',
        component: () => import('@/views/theaters/TheaterList.vue'),
        meta: { title: 'Theaters Management', ...createPermissionMeta(PERMISSIONS.THEATERS_VIEW) }
      },
      {
        path: "theaters/create",
        name: "CreateTheater",
        component: () => import("@/views/theaters/CreateTheater.vue"),
        meta: { title: "Create Theater", ...createPermissionMeta(PERMISSIONS.THEATERS_CREATE) },
      },
      {
        path: "theaters/:id",
        name: "TheaterDetail",
        component: () => import("@/views/theaters/TheaterDetail.vue"),
        meta: { title: "Theater Details", ...createPermissionMeta(PERMISSIONS.THEATERS_VIEW) },
      },
      {
        path: "theaters/:id/edit",
        name: "EditTheater",
        component: () => import("@/views/theaters/EditTheater.vue"),
        meta: { title: "Edit Theater", ...createPermissionMeta(PERMISSIONS.THEATERS_EDIT) },
      },
      //halls
      {
        path: "halls",
        name: "Halls",
        component: () => import("@/views/halls/HallList.vue"),
        meta: { title: "Halls Management", ...createPermissionMeta(PERMISSIONS.HALLS_VIEW) },
      },
      {
        path: "halls/create",
        name: "CreateHall",
        component: () => import("@/views/halls/CreateHall.vue"),
        meta: { title: "Create Hall", ...createPermissionMeta(PERMISSIONS.HALLS_CREATE) },
      },
      {
        path: "halls/:id",
        name: "HallDetail",
        component: () => import("@/views/halls/HallDetail.vue"),
        meta: { title: "Hall Details", ...createPermissionMeta(PERMISSIONS.HALLS_VIEW) },
      },
      {
        path: "halls/:id/edit",
        name: "EditHall",
        component: () => import("@/views/halls/EditHall.vue"),
        meta: { title: "Edit Hall", ...createPermissionMeta(PERMISSIONS.HALLS_EDIT) },
      },
      //movies
      {
        path: "movies",
        name: "Movies",
        component: () => import("@/views/movies/MovieList.vue"),
        meta: { title: "Movies Management", ...createPermissionMeta(PERMISSIONS.MOVIES_VIEW) },
      },
      {
        path: 'movies/create',
        name: 'CreateMovie',
        component: () => import('@/views/movies/CreateMovie.vue'),
        meta: { title: 'Add Movie', ...createPermissionMeta(PERMISSIONS.MOVIES_CREATE) }
      },
      {
        path: 'movies/:id',
        name: 'MovieDetail',
        component: () => import('@/views/movies/MovieDetail.vue'),
        meta: { title: 'Movie Details', ...createPermissionMeta(PERMISSIONS.MOVIES_VIEW) }
      },
      {
        path: 'movies/:id/edit',
        name: 'EditMovie',
        component: () => import('@/views/movies/EditMovie.vue'),
        meta: { title: 'Edit Movie', ...createPermissionMeta(PERMISSIONS.MOVIES_EDIT) }
      },
      //showtime
      {
        path: "showtimes",
        name: "Showtimes",
        component: () => import("@/views/showtime/ShowtimeList.vue"),
        meta: { title: "Showtimes Management", ...createPermissionMeta(PERMISSIONS.SHOWTIMES_VIEW) },
      },
      {
        path: "showtimes/create",
        name: "CreateShowtime",
        component: () => import("@/views/showtime/CreateShowtime.vue"),
        meta: { title: "Create Showtime", ...createPermissionMeta(PERMISSIONS.SHOWTIMES_CREATE) },
      },
      {
        path: "showtimes/:id",
        name: "ShowtimeDetail",
        component: () => import("@/views/showtime/ShowtimeDetail.vue"),
        meta: { title: "Showtime Details", ...createPermissionMeta(PERMISSIONS.SHOWTIMES_VIEW) },
      },
      {
        path: "showtimes/:id/edit",
        name: "EditShowtime",
        component: () => import("@/views/showtime/EditShowtime.vue"),
        meta: { title: "Edit Showtime" },
      },
      //booking
      {
        path: "bookings",
        name: "Bookings",
        component: () => import("@/views/bookings/BookingList.vue"),
        meta: { title: "Bookings Management" },
      },
      {
        path: "bookings/:id",
        name: "BookingDetail",
        component: () => import("@/views/bookings/BookingDetail.vue"),
        meta: { title: "Booking Details" },
      },
      // System Management (SuperAdmin only)
      {
        path: "system/permissions",
        name: "SystemPermissions",
        component: () => import("@/views/system/Permissions.vue"),
        meta: {
          title: "System Permissions",
          titleKey: "system.permissions"
        }
      },
      {
        path: "system/role-permissions",
        name: "SystemRolePermissions",
        component: () => import("@/views/system/RolePermissions.vue"),
        meta: {
          title: "Role Permissions",
          titleKey: "system.rolePermissions"
        }
      },
      {
        path: "settings",
        name: "Settings",
        component: () => import("@/views/settings/Settings.vue"),
        meta: {
          title: "Settings",
          ...createPermissionMeta(PERMISSIONS.SETTINGS_VIEW)
        },
      },
    ],
  },
  {
    path: "/",
    redirect: "/admin",
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/error/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const { useAuthStore } = await import("@/stores/auth");
  const { usePermissionStore } = await import("@/stores/permission");
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  // Wait for auth initialization if not already initialized
  if (!authStore.isInitialized) {
    console.log("Waiting for auth initialization...");
    try {
      await authStore.initializeAuth();
    } catch (error) {
      console.error("Auth initialization failed:", error);
    }
  }

  // console.log("Route guard check:", {
  //   to: to.path,
  //   requiresAuth: to.matched.some((record) => record.meta.requiresAuth),
  //   requiresAdmin: to.matched.some((record) => record.meta.requiresAdmin),
  //   requiresGuest: to.matched.some((record) => record.meta.requiresGuest),
  //   requiresPermission: to.matched.some((record) => record.meta.requiresPermission),
  //   isAuthenticated: authStore.isAuthenticated,
  //   isAdmin: authStore.isAdmin,
  //   userRole: authStore.userRole,
  // });

  // Auth required?
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      console.log("Access denied: Not authenticated");
      return next({ path: "/login", query: { redirect: to.fullPath } });
    }

    // SuperAdmin bypass: full access
    if (authStore.isSuperAdmin) {
      return next();
    }

    // Initialize permissions if authenticated
    if (authStore.isAuthenticated && !permissionStore.isInitialized) {
      try {
        await permissionStore.initializePermissions();
      } catch (error) {
        console.error("Permission initialization failed:", error);
      }
    }

    // Check admin if required
    if (
      to.matched.some((record) => record.meta.requiresAdmin) &&
      !authStore.isAdmin
    ) {
      // console.log("Access denied: Not admin");
      // Avoid redirecting to the same route to prevent infinite loops
      return next({ name: "NotFound" });
    }

    // Check permissions if required
    if (to.matched.some((record) => record.meta.requiresPermission)) {
      const hasPermission = checkRoutePermissions(to, permissionStore);
      if (!hasPermission) {
        console.log("Access denied: Insufficient permissions");
        return next({ name: "AdminDashboard" });
      }
    }
  }

  // Guest routes (like login)
  if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (authStore.isAuthenticated) {
      // console.log("Already authenticated, redirecting to dashboard");
      return next("/admin/dashboard");
    }
  }

  console.log("Route access granted");
  return next();
});

export default router;
