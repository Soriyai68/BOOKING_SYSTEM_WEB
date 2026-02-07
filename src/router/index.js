import { createRouter, createWebHistory } from "vue-router";
import adminRoutes from "./adminRoutes";
import clientRoutes from "./clientRoutes";
import {
  checkRoutePermissions,
  PERMISSIONS,
} from "@/composables/usePermissions";

const ADMIN_SUBDOMAIN = "admin";
const IS_ADMIN_APP = window.location.hostname.startsWith(`${ADMIN_SUBDOMAIN}.`);

let allRoutes = [];
let defaultRedirect = "/";
const loginComponentName = "Login";

// Shared Login Route
const sharedLoginRoute = {
  path: "/login",
  name: loginComponentName,
  component: () => import("@/views/auth/Login.vue"),
  meta: { requiresGuest: true },
};

if (IS_ADMIN_APP) {
  allRoutes = [
    sharedLoginRoute,
    {
      path: "/cashier/login", // Alias moved here, redirect to the main login path
      redirect: "/login",
      meta: { requiresGuest: true },
    },
    ...adminRoutes,
  ];
  defaultRedirect = "/login"; // Admin app should redirect to login if not specified
} else {
  allRoutes = [
    sharedLoginRoute, // Client might also have a login or a different one. For now, sharing.
    ...clientRoutes,
  ];
  defaultRedirect = "/"; // Client app should redirect to home
}

const finalRoutes = [
  ...allRoutes,
  { path: "/", redirect: defaultRedirect },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/error/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: finalRoutes,
});

router.beforeEach(async (to, from, next) => {
  const { useAuthStore } = await import("@/stores/auth");
  const { usePermissionStore } = await import("@/stores/permission");
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  try {
    if (!authStore.isInitialized) {
      await authStore.initializeAuth();
    }
  } catch (error) {
    // console.error("Auth initialization failed:", error);
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      authStore.setToken(null);
      authStore.setRefreshToken(null);
      authStore.setUser(null);
      return next({ path: "/login", query: { redirect: to.fullPath } });
    }

    // --- Admin specific checks ---
    if (IS_ADMIN_APP) {
      if (authStore.isSuperAdmin) {
        return next();
      }

      if (!permissionStore.isInitialized) {
        try {
          await permissionStore.initializePermissions();
        } catch (error) {
          // console.error("Permission initialization failed:", error);
        }
      }

      if (to.matched.some((r) => r.meta.requiresAdmin) && !authStore.isAdmin) {
        return next({ name: "NotFound" });
      }

      if (to.matched.some((r) => r.meta.requiresPermission)) {
        const allowed = checkRoutePermissions(to, permissionStore);
        if (!allowed) {
          if (to.name === "AdminDashboard" || from.name === "AdminDashboard") {
            return next({ name: "NotFound" });
          }
          return next({ name: "AdminDashboard" });
        }
      }
    }
    // --- End Admin specific checks ---
  }

  if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (authStore.isAuthenticated) {
      // Redirect authenticated users away from guest-only routes
      if (IS_ADMIN_APP) {
        return next({ name: "AdminDashboard" });
      } else {
        return next({ name: "ClientHome" }); // Redirect to client home if authenticated
      }
    }
  }

  return next();
});

export default router;
