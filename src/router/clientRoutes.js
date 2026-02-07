import ClientLayout from "@/layouts/ClientLayout.vue"; // Assuming you have a ClientLayout
import {
  checkRoutePermissions,
  createPermissionMeta,
  PERMISSIONS,
} from "@/composables/usePermissions"; // Keep if permissions are also used on client side

const clientRoutes = [
  {
    path: "/",
    component: ClientLayout, // Use a client-specific layout
    children: [
      {
        path: "",
        name: "ClientHome",
        component: () => import("@/views/clientPage/HomePage.vue"), // A client home page
        meta: {
          title: "Home",
        },
      },
      {
        path: "register",
        name: "ClientRegister",
        component: () => import("@/views/clientPage/RegisterPage.vue"),
        meta: {
          title: "Register",
        },
      },
      // Add other client-specific routes here
    ],
  },
];

export default clientRoutes;
