import api from "@/utils/api";

export const bookingService = {
  // Get all bookings with pagination and filters
  async getBookings(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      booking_status: params.booking_status,
      payment_status: params.payment_status,
      userId: params.user_id,
      showtimeId: params.showtime_id,
      dateFrom: params.date_from,
      dateTo: params.date_to,
      includeDeleted: params.include_deleted || false,
      sortBy: params.sort_by || "booking_date",
      sortOrder: params.sort_order || "desc",
    };

    // Remove undefined values
    Object.keys(backendParams).forEach((key) => {
      if (backendParams[key] === undefined) {
        delete backendParams[key];
      }
    });

    const response = await api.get("/bookings", { params: backendParams });

    // Backend returns: { success: true, data: { bookings, pagination } }
    if (response.data?.success && response.data?.data) {
      const { bookings, pagination } = response.data.data;
      return {
        data: bookings.map((booking) => ({
          id: booking._id,
          reference_code: booking.reference_code,
          user: booking.user || {},
          showtime: booking.showtime || {},
          movie: booking.movie || {},
          hall: booking.hall || {},
          total_price: booking.total_price,
          seat_count: booking.seat_count,
          booking_status: booking.booking_status,
          payment_status: booking.payment_status,
          payment_id: booking.payment_id,
          booking_date: booking.booking_date,
          expired_at: booking.expired_at,
          noted: booking.noted,
          created_at: booking.createdAt,
          updated_at: booking.updatedAt,
          deleted_at: booking.deletedAt,
          is_deleted: !!booking.deletedAt,
          booking_status_display: booking.booking_status
            ? booking.booking_status.charAt(0).toUpperCase() +
              booking.booking_status.slice(1)
            : "-",
          payment_status_display: booking.payment_status
            ? booking.payment_status.charAt(0).toUpperCase() +
              booking.payment_status.slice(1)
            : "-",
          user_info: `${booking.user?.username || "N/A"} (${booking.user?.email || "N/A"})`,
          movie_info: booking.movie?.title || "N/A",
          hall_info: booking.hall?.hall_name || "N/A",
          show_info: booking.showtime
            ? `${booking.showtime.show_date} ${booking.showtime.start_time}`
            : "N/A",
        })),
        total: pagination.totalCount,
        current_page: pagination.currentPage,
        per_page: pagination.limit,
        total_pages: pagination.totalPages,
        has_next_page: pagination.hasNextPage,
        has_prev_page: pagination.hasPrevPage,
      };
    }

    return response.data;
  },

  // Get single booking by ID
  async getBooking(id) {
    const response = await api.get(`/bookings/${id}`);

    if (response.data?.success && response.data?.data?.booking) {
      const booking = response.data.data.booking;
      return {
        id: booking._id,
        reference_code: booking.reference_code,
        user: booking.userId || {},
        showtime: booking.showtimeId || {},
        movie: booking.movie,
        hall: booking.hall,
        total_price: booking.total_price,
        seat_count: booking.seat_count,
        booking_status: booking.booking_status,
        payment_status: booking.payment_status,
        payment_id: booking.payment_id,
        booking_date: booking.booking_date,
        expired_at: booking.expired_at,
        noted: booking.noted,
        created_at: booking.createdAt,
        updated_at: booking.updatedAt,
      };
    }

    return response.data;
  },

  // Create new booking
  async createBooking(bookingData) {
    const backendData = {
      userId: bookingData.user_id,
      showtimeId: bookingData.showtime_id,
      total_price: bookingData.total_price,
      seat_count: bookingData.seat_count,
      reference_code: bookingData.reference_code,
      payment_id: bookingData.payment_id,
      payment_status: bookingData.payment_status || "Pending",
      booking_status: bookingData.booking_status || "Confirmed",
      expired_at: bookingData.expired_at,
      noted: bookingData.noted || "",
    };

    // Remove undefined values
    Object.keys(backendData).forEach((key) => {
      if (backendData[key] === undefined) {
        delete backendData[key];
      }
    });

    const response = await api.post("/bookings", backendData);
    return response.data;
  },

  // Update booking
  async updateBooking(id, bookingData) {
    const backendData = {
      total_price: bookingData.total_price,
      seat_count: bookingData.seat_count,
      booking_status: bookingData.booking_status,
      payment_status: bookingData.payment_status,
      payment_id: bookingData.payment_id,
      expired_at: bookingData.expired_at,
      noted: bookingData.noted,
    };

    // Remove undefined values
    Object.keys(backendData).forEach((key) => {
      if (backendData[key] === undefined) {
        delete backendData[key];
      }
    });

    const response = await api.put(`/bookings/${id}`, backendData);
    return response.data;
  },

  // Delete booking (soft delete)
  async deleteBooking(id) {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },

  // Force delete booking (permanent)
  async forceDeleteBooking(id) {
    const response = await api.delete(`/bookings/${id}/force-delete`);
    return response.data;
  },

  // Restore deleted booking
  async restoreBooking(id) {
    const response = await api.put(`/bookings/${id}/restore`);
    return response.data;
  },

  // Get deleted bookings
  async getDeletedBookings(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      sortBy: params.sort_by || "deletedAt",
      sortOrder: params.sort_order || "desc",
    };

    const response = await api.get("/bookings/deleted", {
      params: backendParams,
    });

    if (response.data?.success && response.data?.data) {
      const { bookings, pagination } = response.data.data;
      return {
        data: bookings.map((booking) => ({
          id: booking._id,
          reference_code: booking.reference_code,
          user: booking.userId || {},
          showtime: booking.showtimeId || {},
          total_price: booking.total_price,
          booking_status: booking.booking_status,
          payment_status: booking.payment_status,
          deleted_at: booking.deletedAt,
          created_at: booking.createdAt,
        })),
        total: pagination.totalCount,
        current_page: pagination.currentPage,
        per_page: pagination.limit,
        total_pages: pagination.totalPages,
      };
    }

    return response.data;
  },

  // Get booking analytics
  async getAnalytics() {
    const response = await api.get("/bookings/analytics");
    return response.data;
  },

  // Constants for frontend use
  BOOKING_STATUSES: [
    { value: "Confirmed", label: "Confirmed", color: "#67C23A" },
    { value: "Pending", label: "Pending", color: "#E6A23C" },
    { value: "Cancelled", label: "Cancelled", color: "#F56C6C" },
    { value: "Completed", label: "Completed", color: "#409EFF" },
  ],

  PAYMENT_STATUSES: [
    { value: "Pending", label: "Pending", color: "#E6A23C" },
    { value: "Completed", label: "Completed", color: "#67C23A" },
    { value: "Failed", label: "Failed", color: "#F56C6C" },
    { value: "Refunded", label: "Refunded", color: "#909399" },
  ],

  SORT_OPTIONS: [
    { value: "booking_date", label: "Booking Date" },
    { value: "reference_code", label: "Reference Code" },
    { value: "total_price", label: "Total Price" },
    { value: "booking_status", label: "Booking Status" },
    { value: "payment_status", label: "Payment Status" },
    { value: "createdAt", label: "Created Date" },
  ],
};
