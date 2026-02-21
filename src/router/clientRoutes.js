import ClientLayout from "@/layouts/ClientLayout.vue";

const clientRoutes = [
  // Login — standalone (no layout wrapper)
  {
    path: "/",
    name: "Login Page",
    component: () => import("@/views/clientPage/auth/Login.vue"),
    meta: {
      title: "Login Page",
    },
  },

  // Authenticated pages — wrapped in ClientLayout
  {
    path: "/layout",
    component: ClientLayout,
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
    
    ],
  },
];

export default clientRoutes;
