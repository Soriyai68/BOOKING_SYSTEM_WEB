import { createRouter, createWebHistory } from "vue-router";
import adminRoutes, { adminRoutesChildren } from "./adminRoutes";
import clientRoutes from "./clientRoutes";
import AdminLayout from "@/layouts/AdminLayout.vue";
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
  // On the admin subdomain, we want the admin routes at the root
  allRoutes = [
    sharedLoginRoute,
    {
      path: "/",
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: "",
          redirect: "/dashboard",
        },
        ...adminRoutesChildren,
      ],
    },
    // Also include a redirect for anyone following an old /admin link
    {
      path: "/admin/:pathMatch(.*)*",
      redirect: (to) => {
        return { path: `/${to.params.pathMatch}` };
      },
    },
  ];
  defaultRedirect = "/login";
} else {
  // On main domain, keep client routes at root, but allow /admin access
  allRoutes = [
    sharedLoginRoute,
    ...clientRoutes,
    ...adminRoutes, // This includes /admin path
  ];
  defaultRedirect = "/";
}

const finalRoutes = [
  ...allRoutes,
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
      const loginPath = IS_ADMIN_APP ? "/login" : "/";
      return next({ path: loginPath, query: { redirect: to.fullPath } });
    }

    // --- Admin specific checks ---
    const requiresAdmin = to.matched.some((r) => r.meta.requiresAdmin);

    // If route requires admin, check if user is admin regardless of subdomain
    if (requiresAdmin && !authStore.isAdmin) {
      if (IS_ADMIN_APP) {
        if (to.path === "/login") return next();
        return next({ path: "/login", query: { redirect: to.fullPath } });
      } else {
        // On client app, if they try to access admin route without being admin
        return next({ path: "/" });
      }
    }

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
      if (IS_ADMIN_APP) {
        // On admin app, only redirect away from login if they ARE an admin
        if (authStore.isAdmin) {
          return next({ name: "AdminDashboard" });
        }
        // If they are a customer on the admin app, let them stay on login (or we could logout)
        return next();
      } else {
        // On client app, redirect to home if authenticated
        return next({ path: "/layout" });
      }
    }
  }

  return next();
});

export default router;
