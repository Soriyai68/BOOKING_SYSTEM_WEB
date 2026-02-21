import AdminLayout from "@/layouts/AdminLayout.vue";
import { createPermissionMeta, PERMISSIONS } from "@/composables/usePermissions";

const adminRoutes = [
  {
    path: "/admin",
    component: AdminLayout,
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
          titleKey: "dashboard.title",
        },
      },
      //users
      {
        path: "users",
        name: "Users",
        component: () => import("@/views/users/UserList.vue"),
        meta: {
          title: "Users Management",
          titleKey: "users.title",
          ...createPermissionMeta(PERMISSIONS.USERS_VIEW),
        },
      },
      {
        path: "users/create",
        name: "CreateUser",
        component: () => import("@/views/users/CreateUser.vue"),
        meta: {
          title: "Create User",
          titleKey: "users.createUser",
          ...createPermissionMeta(PERMISSIONS.USERS_CREATE),
        },
      },
      {
        path: "users/:id/edit",
        name: "EditUser",
        component: () => import("@/views/users/EditUser.vue"),
        meta: {
          title: "Edit User",
          titleKey: "users.editUser",
          ...createPermissionMeta(PERMISSIONS.USERS_EDIT),
        },
      },
      {
        path: "users/roles",
        name: "UserRoles",
        component: () => import("@/views/users/UserRoles.vue"),
        meta: {
          title: "User Roles",
          titleKey: "users.userRoles",
          ...createPermissionMeta(PERMISSIONS.USERS_MANAGE),
        },
      },

      //customers
      {
        path: "customers",
        name: "Customers",
        component: () => import("@/views/customers/CustomerList.vue"),
        meta: {
          title: "Customers Management",
          titleKey: "customers.title",
        },
      },
      {
        path: "customers/create",
        name: "CreateCustomer",
        component: () => import("@/views/customers/CreateCustomer.vue"),
        meta: {
          title: "Create Customer",
          titleKey: "customers.createCustomer",
        },
      },
      {
        path: "customers/:id/edit",
        name: "EditCustomer",
        component: () => import("@/views/customers/EditCustomer.vue"),
        meta: {
          title: "Edit Customer",
          titleKey: "customers.editCustomer",
        },
      },
      {
        path: "customers/:id",
        name: "CustomerDetail",
        component: () => import("@/views/customers/CustomerDetail.vue"),
        meta: {
          title: "Customer Details",
          titleKey: "customers.customerDetails",
        },
      },

      //seats
      {
        path: "seats",
        name: "Seats",
        component: () => import("@/views/seats/SeatsList.vue"),
        meta: {
          title: "Seats Management",
          titleKey: "seats.title",
          ...createPermissionMeta(PERMISSIONS.SEATS_VIEW),
        },
      },
      {
        path: "seats/create",
        name: "CreateSeat",
        component: () => import("@/views/seats/CreateSeat.vue"),
        meta: {
          title: "Create Seat",
          titleKey: "seats.createSeat",
          ...createPermissionMeta(PERMISSIONS.SEATS_CREATE),
        },
      },
      {
        path: "seats/:id",
        name: "SeatDetail",
        component: () => import("@/views/seats/SeatDetail.vue"),
        meta: {
          title: "Seat Details",
          titleKey: "seats.seatDetails",
          ...createPermissionMeta(PERMISSIONS.SEATS_VIEW),
        },
      },
      {
        path: "seats/:id/edit",
        name: "EditSeat",
        component: () => import("@/views/seats/EditSeat.vue"),
        meta: {
          title: "Edit Seat",
          titleKey: "seats.editSeat",
          ...createPermissionMeta(PERMISSIONS.SEATS_EDIT),
        },
      },
      {
        path: "seat-booking",
        name: "SeatBooking",
        component: () => import("@/views/seats/SeatBooking.vue"),
        meta: {
          title: "Seat Booking",
          titleKey: "seats.seatBooking",
          ...createPermissionMeta(PERMISSIONS.BOOKINGS_VIEW),
        },
      },

      //theaters
      {
        path: "theaters",
        name: "Theaters",
        component: () => import("@/views/theaters/TheaterList.vue"),
        meta: {
          title: "Theaters Management",
          titleKey: "theaters.title",
          ...createPermissionMeta(PERMISSIONS.THEATERS_VIEW),
        },
      },
      {
        path: "theaters/create",
        name: "CreateTheater",
        component: () => import("@/views/theaters/CreateTheater.vue"),
        meta: {
          title: "Create Theater",
          titleKey: "theaters.createTheater",
          ...createPermissionMeta(PERMISSIONS.THEATERS_CREATE),
        },
      },
      {
        path: "theaters/:id",
        name: "TheaterDetail",
        component: () => import("@/views/theaters/TheaterDetail.vue"),
        meta: {
          title: "Theater Details",
          titleKey: "theaters.theaterDetails",
          ...createPermissionMeta(PERMISSIONS.THEATERS_VIEW),
        },
      },
      {
        path: "theaters/:id/edit",
        name: "EditTheater",
        component: () => import("@/views/theaters/EditTheater.vue"),
        meta: {
          title: "Edit Theater",
          titleKey: "theaters.editTheater",
          ...createPermissionMeta(PERMISSIONS.THEATERS_EDIT),
        },
      },

      //halls
      {
        path: "halls",
        name: "Halls",
        component: () => import("@/views/halls/HallList.vue"),
        meta: {
          title: "Halls Management",
          titleKey: "halls.title",
          ...createPermissionMeta(PERMISSIONS.HALLS_VIEW),
        },
      },
      {
        path: "halls/create",
        name: "CreateHall",
        component: () => import("@/views/halls/CreateHall.vue"),
        meta: {
          title: "Create Hall",
          titleKey: "halls.createHall",
          ...createPermissionMeta(PERMISSIONS.HALLS_CREATE),
        },
      },
      {
        path: "halls/:id",
        name: "HallDetail",
        component: () => import("@/views/halls/HallDetail.vue"),
        meta: {
          title: "Hall Details",
          titleKey: "halls.hallDetails",
          ...createPermissionMeta(PERMISSIONS.HALLS_VIEW),
        },
      },
      {
        path: "halls/:id/edit",
        name: "EditHall",
        component: () => import("@/views/halls/EditHall.vue"),
        meta: {
          title: "Edit Hall",
          titleKey: "halls.editHall",
          ...createPermissionMeta(PERMISSIONS.HALLS_EDIT),
        },
      },

      //movies
      {
        path: "movies",
        name: "Movies",
        component: () => import("@/views/movies/MovieList.vue"),
        meta: {
          title: "Movies Management",
          titleKey: "movies.title",
          ...createPermissionMeta(PERMISSIONS.MOVIES_VIEW),
        },
      },

      // promotions
      {
        path: "promotions",
        name: "Promotions",
        component: () => import("@/views/promotions/PromotionList.vue"),
        meta: {
          title: "Promotions Management",
          titleKey: "promotions.title",
          ...createPermissionMeta(PERMISSIONS.PROMOTION_VIEW),
        },
      },
      {
        path: "promotions/create",
        name: "CreatePromotion",
        component: () => import("@/views/promotions/CreatePromotion.vue"),
        meta: {
          title: "Create Promotion",
          titleKey: "promotions.createPromotion",
          ...createPermissionMeta(PERMISSIONS.PROMOTION_CREATE),
        },
      },
      {
        path: "promotions/:id",
        name: "PromotionDetail",
        component: () => import("@/views/promotions/PromotionDetail.vue"),
        meta: {
          title: "Promotion Details",
          titleKey: "promotions.promotionDetails",
          ...createPermissionMeta(PERMISSIONS.PROMOTION_VIEW),
        },
      },
      {
        path: "promotions/:id/edit",
        name: "EditPromotion",
        component: () => import("@/views/promotions/EditPromotion.vue"),
        meta: {
          title: "Edit Promotion",
          titleKey: "promotions.editPromotion",
          ...createPermissionMeta(PERMISSIONS.PROMOTION_EDIT),
        },
      },
      {
        path: "movies/create",
        name: "CreateMovie",
        component: () => import("@/views/movies/CreateMovie.vue"),
        meta: {
          title: "Add Movie",
          titleKey: "movies.createMovie",
          ...createPermissionMeta(PERMISSIONS.MOVIES_CREATE),
        },
      },
      {
        path: "movies/:id",
        name: "MovieDetail",
        component: () => import("@/views/movies/MovieDetail.vue"),
        meta: {
          title: "Movie Details",
          titleKey: "movies.movieDetails",
          ...createPermissionMeta(PERMISSIONS.MOVIES_VIEW),
        },
      },
      {
        path: "movies/:id/edit",
        name: "EditMovie",
        component: () => import("@/views/movies/EditMovie.vue"),
        meta: {
          title: "Edit Movie",
          titleKey: "movies.editMovie",
          ...createPermissionMeta(PERMISSIONS.MOVIES_EDIT),
        },
      },

      //showtimes
      {
        path: "showtimes",
        name: "Showtimes",
        component: () => import("@/views/showtime/ShowtimeList.vue"),
        meta: {
          title: "Showtimes Management",
          titleKey: "showtimes.title",
          ...createPermissionMeta(PERMISSIONS.SHOWTIMES_VIEW),
        },
      },
      {
        path: "showtimes/create",
        name: "CreateShowtime",
        component: () => import("@/views/showtime/CreateShowtime.vue"),
        meta: {
          title: "Create Showtime",
          titleKey: "showtimes.addShowtime",
          ...createPermissionMeta(PERMISSIONS.SHOWTIMES_CREATE),
        },
      },
      {
        path: "showtimes/:ids/duplicate",
        name: "DuplicateShowtime",
        component: () => import("@/views/showtime/DuplicateShowtime.vue"),
        meta: {
          title: "Duplicate Showtime",
          titleKey: "showtimes.duplicateShowtime",
          ...createPermissionMeta(PERMISSIONS.SHOWTIMES_CREATE),
        },
      },
      {
        path: "showtimes/multiple-create",
        name: "MultipleShowtimeCreator",
        component: () =>
          import("@/components/showtimes/MultipleShowtimeCreator.vue"),
        meta: {
          title: "Duplicate Showtimes",
          titleKey: "showtimes.duplicateShowtimes",
          ...createPermissionMeta(PERMISSIONS.SHOWTIMES_CREATE),
        },
      },
      {
        path: "showtimes/:id",
        name: "ShowtimeDetail",
        component: () => import("@/views/showtime/ShowtimeDetail.vue"),
        meta: {
          title: "Showtime Details",
          titleKey: "showtimes.showtimeDetails",
          ...createPermissionMeta(PERMISSIONS.SHOWTIMES_VIEW),
        },
      },
      {
        path: "showtimes/:id/edit",
        name: "EditShowtime",
        component: () => import("@/views/showtime/EditShowtime.vue"),
        meta: {
          title: "Edit Showtime",
          titleKey: "showtimes.editShowtime",
          ...createPermissionMeta(PERMISSIONS.SHOWTIMES_EDIT),
        },
      },

      // bookings
      {
        path: "bookings",
        name: "Bookings",
        component: () => import("@/views/bookings/BookingList.vue"),
        meta: {
          title: "Bookings Management",
          titleKey: "bookings.title",
          ...createPermissionMeta(PERMISSIONS.BOOKINGS_VIEW),
        },
      },
      {
        path: "booking/create",
        name: "CreateBooking",
        component: () => import("@/views/bookings/CreateBooking.vue"),
        meta: {
          title: "Create Booking",
          titleKey: "bookings.addBooking",
          ...createPermissionMeta(PERMISSIONS.BOOKINGS_CREATE),
        },
      },
      {
        path: "bookings/:id",
        name: "BookingDetail",
        component: () => import("@/views/bookings/BookingDetail.vue"),
        meta: {
          title: "Booking Details",
          titleKey: "bookings.bookingDetails",
          ...createPermissionMeta(PERMISSIONS.BOOKINGS_VIEW),
        },
      },
      // {
      //   path: "bookings/:id/edit",
      //   name: "EditBooking",
      //   component: () => import("@/views/bookings/UpdateBooking.vue"),
      //   meta: {
      //     title: "Edit Booking",
      //     titleKey: "bookings.editBooking",
      //     ...createPermissionMeta(PERMISSIONS.BOOKINGS_EDIT),
      //   },
      // },

      // booking tickets
      {
        path: "booking-tickets",
        name: "BookingTickets",
        component: () =>
          import("@/views/bookingTicket/BookingTicketList.vue"),
        meta: {
          title: "Booking Tickets Management",
          titleKey: "bookingTickets.title",
          ...createPermissionMeta(PERMISSIONS.BOOKING_TICKETS_VIEW),
        },
      },
      // {
      //   path: "booking-tickets/:id/print",
      //   name: "PrintBookingTicket",
      //   component: () => import("@/views/bookingTicket/PrintTicket.vue"),
      //   meta: {
      //     title: "Print Booking Ticket",
      //     titleKey: "bookingTickets.printTicket",
      //     ...createPermissionMeta(PERMISSIONS.BOOKING_TICKETS_VIEW),
      //     hideInMenu: true,
      //   },
      // },

      {
        path: "seat-booking-history",
        name: "AdminSeatBookingHistory",
        component: () => import("@/views/seats/SeatBookingHistory.vue"),
        meta: {
          title: "Seat Booking History",
          titleKey: "seats.seatBookingHistory",
        },
      },

      // payments
      {
        path: "payments",
        name: "PaymentList",
        component: () => import("@/views/payments/PaymentList.vue"),
        meta: {
          title: "Payment List",
          titleKey: "payments.paymentList",
          ...createPermissionMeta(PERMISSIONS.PAYMENTS_VIEW),
        },
      },
      // system
      {
        path: "system/permissions",
        name: "SystemPermissions",
        component: () => import("@/views/system/Permissions.vue"),
        meta: {
          title: "System Permissions",
          titleKey: "system.permissions",
        },
      },
      {
        path: "system/role-permissions",
        name: "SystemRolePermissions",
        component: () => import("@/views/system/RolePermissions.vue"),
        meta: {
          title: "Role Permissions",
          titleKey: "system.rolePermissions",
        },
      },
      {
        path: "settings",
        name: "Settings",
        component: () => import("@/views/settings/Settings.vue"),
        meta: {
          title: "Settings",
          titleKey: "settings.title",
          ...createPermissionMeta(PERMISSIONS.SETTINGS_VIEW),
        },
      },
    ],
  },
];

export default adminRoutes;
