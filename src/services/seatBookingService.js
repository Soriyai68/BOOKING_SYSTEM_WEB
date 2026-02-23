import api from "@/utils/api";

export const seatBookingService = {
  // List seat bookings with pagination and filters
  async getSeatBookings(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      status: params.status,
      showtimeId: params.showtimeId,
      seatId: params.seatId,
      user_id: params.user_id,
      phone: params.phone,
      booking_id: params.booking_id,
      seat_type: params.seat_type,
      sortBy: params.sort_by || "createdAt",
      sortOrder: params.sort_order || "desc",
    };

    Object.keys(backendParams).forEach(
      (k) => backendParams[k] === undefined && delete backendParams[k],
    );

    const { data } = await api.get("/seatBookings", { params: backendParams });
    if (data?.success && data?.data) {
      const { seatBookings, pagination } = data.data;
      return {
        data: seatBookings.map((sb) => ({
          id: sb._id,
          reference_code: sb.bookingId?.reference_code || "N/A",
          customer_name: sb.bookingId?.customer?.name || "N/A",
          phone: sb.bookingId?.customer?.phone || "N/A",
          status: sb.status,
          seats: sb.seats || [],
          showtime: {
            movie_title: sb.showtimeId?.movie_id?.title,
            start_time: sb.showtimeId?.start_time,
            show_date: sb.showtimeId?.show_date,
          },
          created_at: sb.createdAt,
        })),
        total: pagination.totalCount,
        current_page: pagination.currentPage,
        per_page: pagination.limit,
        total_pages: pagination.totalPages,
      };
    }
    return data;
  },

  async getShowtimeSeatStatus(showtimeId) {
    if (!showtimeId) {
      throw new Error("showtimeId is required");
    }
    const response = await api.get(
      `/seatBookings/showtime/${showtimeId}/status`,
    );

    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  async getRawSeatBookingsForShowtime(showtimeId) {
    if (!showtimeId) {
      throw new Error("showtimeId is required");
    }
    const response = await api.get(`/seatBookings/showtime/${showtimeId}/raw`);
    if (response.data?.success) {
      return response.data.data || [];
    }
    // If success is false, or data is not in the expected format, return an empty array.
    // This prevents errors when 'No seat bookings found'.
    return [];
  },

  // New methods from backend routes
  async lockSeats(payload) {
    // Payload should contain showtimeId, seatIds, bookingId (optional), lockDuration
    const { data } = await api.post("/seatBookings/lock", payload);

    return data;
  },

  async extendLock(payload) {
    // Payload should contain seatBookingIds, extendDuration
    const { data } = await api.post("/seatBookings/extend-lock", payload);
    return data;
  },

  STATUS_OPTIONS: [
    { value: "booked", label: "Booked" },
    { value: "locked", label: "Locked" },
    { value: "available", label: "Available" },
    { value: "cancelled", label: "Cancelled" },
  ],
  getSeatBookingHistory: async (params) => {
    try {
      const response = await api.get("/seatBookings/history", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
