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
        path: "review",
        name: "Review Selection",
        component: () =>
          import("@/views/clientPage/checkout/ReviewSelection.vue"),
        meta: {
          title: "Review Your Selection",
        },
      },
      {
        path: "checkout",
        name: "Checkout",
        component: () => import("@/views/clientPage/checkout/CheckoutPage.vue"),
        meta: {
          title: "Checkout",
        },
      },
      {
        path: "confirmation",
        name: "Booking Confirmation",
        component: () =>
          import("@/views/clientPage/checkout/ConfirmationPage.vue"),
        meta: {
          title: "Booking Successful",
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
      {
        path: "settings/activity-logs",
        name: "Activity Logs",
        component: () => import("@/views/clientPage/settings/ActivityLogs.vue"),
        meta: {
          title: "Activity History",
        },
      },

      {
        path: "settings/tickets",
        name: "My Tickets",
        component: () => import("@/views/clientPage/settings/Tickets.vue"),
        meta: {
          title: "My Tickets",
        },
      },
    ],
  },
];

export default clientRoutes;
