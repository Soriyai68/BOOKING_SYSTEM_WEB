import ClientLayout from "@/layouts/ClientLayout.vue";

const clientRoutes = [
  // Login — standalone (no layout wrapper)
  {
    path: "/",
    name: "Login Page",
    component: () => import("@/views/clientPage/auth/Login.vue"),
    meta: {
      title: "Login Page",
      requiresGuest: true,
    },
  },

  // Authenticated pages — wrapped in ClientLayout
  {
    path: "/layout",
    component: ClientLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: { name: "Showtime Page" },
      },
      {
        path: "showtimes",
        name: "Showtime Page",
        component: () => import("@/views/clientPage/showtime/Showtime.vue"),
        meta: {
          title: "Showtime Page",
        },
      },
      {
        path: "seats",
        name: "Seat Selection",
        component: () => import("@/views/clientPage/seats/Seats.vue"),
        meta: {
          title: "Select Seats",
        },
      },
      {
        path: "settings",
        name: "Settings",
        component: () => import("@/views/clientPage/settings/Settings.vue"),
        meta: {
          title: "Settings",
        },
      },
      {
        path: "settings/personal-info",
        name: "Personal Info",
        component: () => import("@/views/clientPage/settings/PersonalInfo.vue"),
        meta: {
          title: "Personal Info",
        },
      },
      {
        path: "settings/notifications",
        name: "Notifications Setting",
        component: () =>
          import("@/views/clientPage/settings/Notifications.vue"),
        meta: {
          title: "Notifications",
        },
      },
      {
        path: "settings/privacy-security",
        name: "Privacy Security",
        component: () =>
          import("@/views/clientPage/settings/PrivacySecurity.vue"),
        meta: {
          title: "Privacy & Security",
        },
      },
    ],
  },
];

export default clientRoutes;
