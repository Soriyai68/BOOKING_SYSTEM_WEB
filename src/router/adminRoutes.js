import AdminLayout from "@/layouts/AdminLayout.vue";
import {
  createPermissionMeta,
  PERMISSIONS,
} from "@/composables/usePermissions";

const adminRoutesChildren = [
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
    path: "bookings/create",
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
    name: "BookingTicketList",
    component: () => import("@/views/bookingTicket/BookingTicketList.vue"),
    meta: {
      title: "Booking Tickets",
      titleKey: "bookingTickets.title",
      ...createPermissionMeta(PERMISSIONS.BOOKING_TICKETS_VIEW),
    },
  },
  {
    path: "booking-tickets/:id/print",
    name: "PrintBookingTicket",
    component: () => import("@/views/bookingTicket/PrintTicket.vue"),
    meta: {
      title: "Print Booking Ticket",
      titleKey: "bookingTickets.printTicket",
      ...createPermissionMeta(PERMISSIONS.BOOKING_TICKETS_VIEW),
      hideInMenu: true,
    },
  },

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

  // reports
  {
    path: "reports",
    name: "ReportsManagement",
    component: () => import("@/views/reports/ReportsManagement.vue"),
    meta: {
      title: "Reports Management",
      titleKey: "nav.reportsNav",
      ...createPermissionMeta(PERMISSIONS.REPORTS_VIEW),
    },
  },
  {
    path: "reports/customer-frequency",
    name: "CustomerBookingFrequency",
    component: () => import("@/views/reports/Customerfrequency.vue"),
    meta: {
      title: "Customer Booking Frequency",
      titleKey: "reports.customerFrequency",
      ...createPermissionMeta(PERMISSIONS.REPORTS_CUSTOMER_FREQUENCY),
      hideInMenu: true,
    },
  },
  {
    path: "reports/revenue",
    name: "RevenueReportDetailed",
    component: () => import("@/views/reports/RevenueReportDetailed.vue"),
    meta: {
      title: "Detailed Revenue Report",
      titleKey: "reports.revenueReport",
      ...createPermissionMeta(PERMISSIONS.REPORTS_DETAILED_REVENUE),
      hideInMenu: true,
    },
  },
  {
    path: "reports/bookings",
    name: "BookingReportDetailed",
    component: () => import("@/views/reports/BookingReportDetailed.vue"),
    meta: {
      title: "Detailed Booking Report",
      titleKey: "reports.bookingReport",
      ...createPermissionMeta(PERMISSIONS.REPORTS_DETAILED_BOOKINGS),
      hideInMenu: true,
    },
  },
  {
    path: "reports/movies",
    name: "MovieReportDetailed",
    component: () => import("@/views/reports/MovieReportDetailed.vue"),
    meta: {
      title: "Movie Performance Report",
      titleKey: "reports.moviePerformance",
      ...createPermissionMeta(PERMISSIONS.REPORTS_DETAILED_MOVIES),
      hideInMenu: true,
    },
  },
  {
    path: "reports/total-customers",
    name: "TotalCustomersReport",
    component: () => import("@/views/reports/ReportsManagement.vue"),
    meta: {
      title: "Total Customers Report",
      titleKey: "reports.totalCustomers",
      ...createPermissionMeta(PERMISSIONS.REPORTS_TOTAL_CUSTOMERS),
      hideInMenu: true,
    },
  },
  {
    path: "reports/total-bookings",
    name: "TotalBookingsReport",
    component: () => import("@/views/reports/ReportsManagement.vue"),
    meta: {
      title: "Total Bookings Report",
      titleKey: "reports.totalBookings",
      ...createPermissionMeta(PERMISSIONS.REPORTS_TOTAL_BOOKINGS),
      hideInMenu: true,
    },
  },
  {
    path: "reports/total-revenue",
    name: "TotalRevenueReport",
    component: () => import("@/views/reports/ReportsManagement.vue"),
    meta: {
      title: "Total Revenue Report",
      titleKey: "reports.totalRevenue",
      ...createPermissionMeta(PERMISSIONS.REPORTS_TOTAL_REVENUE),
      hideInMenu: true,
    },
  },
  {
    path: "reports/total-movies",
    name: "TotalMoviesReport",
    component: () => import("@/views/reports/ReportsManagement.vue"),
    meta: {
      title: "Total Movies Report",
      titleKey: "reports.totalMovies",
      ...createPermissionMeta(PERMISSIONS.REPORTS_TOTAL_MOVIES),
      hideInMenu: true,
    },
  },
  {
    path: "reports/booking-status",
    name: "BookingStatusReport",
    component: () => import("@/views/reports/ReportsManagement.vue"),
    meta: {
      title: "Booking Status Report",
      titleKey: "reports.bookingStatus",
      ...createPermissionMeta(PERMISSIONS.REPORTS_BOOKING_STATUS),
      hideInMenu: true,
    },
  },
  {
    path: "reports/popular-movies",
    name: "PopularMoviesReport",
    component: () => import("@/views/reports/ReportsManagement.vue"),
    meta: {
      title: "Popular Movies Report",
      titleKey: "reports.popularMovies",
      ...createPermissionMeta(PERMISSIONS.REPORTS_POPULAR_MOVIES),
      hideInMenu: true,
    },
  },
  {
    path: "reports/seat-type-revenue",
    name: "SeatTypeRevenueReport",
    component: () => import("@/views/reports/ReportsManagement.vue"),
    meta: {
      title: "Seat Type Revenue Report",
      titleKey: "reports.seatTypeRevenue",
      ...createPermissionMeta(PERMISSIONS.REPORTS_SEAT_TYPE_REVENUE),
      hideInMenu: true,
    },
  },
  {
    path: "reports/payment-methods",
    name: "PaymentMethodAnalysisReport",
    component: () => import("@/views/reports/PaymentMethodAnalysisReport.vue"),
    meta: {
      title: "Payment Method Analysis Report",
      titleKey: "reports.paymentMethodAnalysis",
      ...createPermissionMeta(PERMISSIONS.REPORTS_PAYMENT_METHOD_ANALYSIS),
      hideInMenu: true,
    },
  },
  {
    path: "reports/showtimes",
    name: "ShowtimeUtilizationReport",
    component: () => import("@/views/reports/ShowtimeUtilizationReport.vue"),
    meta: {
      title: "Showtime Utilization Report",
      titleKey: "reports.showtimeUtilization",
      ...createPermissionMeta(PERMISSIONS.REPORTS_SHOWTIME_UTILIZATION),
      hideInMenu: true,
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
    name: "AdminSettings",
    component: () => import("@/views/settings/Settings.vue"),
    meta: {
      title: "Settings",
      titleKey: "settings.title",
      ...createPermissionMeta(PERMISSIONS.SETTINGS_VIEW),
    },
    children: [
      {
        path: "activity-logs",
        name: "AdminActivityLogs",
        component: () => import("@/views/settings/ActivityLogs.vue"),
        meta: {
          title: "Activity Logs",
          titleKey: "activity_logs.title",
        },
      },
      {
        path: "security",
        name: "AdminSecurity",
        component: () => import("@/views/settings/Security.vue"),
        meta: {
          title: "Privacy & Security",
          titleKey: "settings.privacySecurity",
        },
      },
    ],
  },
  {
    path: "profile",
    name: "Profile",
    component: () => import("@/views/profile/profile.vue"),
    meta: {
      title: "Profile",
      titleKey: "profile.title",
    },
  },
];

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
      ...adminRoutesChildren,
    ],
  },
];

export { adminRoutesChildren };
export default adminRoutes;
