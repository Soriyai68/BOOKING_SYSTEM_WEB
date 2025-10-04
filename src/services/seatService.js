import api from "@/utils/api";

export const seatService = {
  // Get all seats with pagination and filters
  async getSeats(params = {}) {
    // Convert frontend params to backend format
    const backendParams = {
      page: params.page || 1,
      limit: params.per_page || 10,
      search: params.search,
      seat_type: params.seat_type,
      is_available: params.is_available,
      sortBy: params.sort_by || "row",
      sortOrder: params.sort_order || "asc",
    };

    // Remove undefined values
    Object.keys(backendParams).forEach((key) => {
      if (backendParams[key] === undefined) {
        delete backendParams[key];
      }
    });

    const response = await api.get("/seats", { params: backendParams });

    // Backend returns: { success: true, data: { seats, pagination } }
    if (response.data?.success && response.data?.data) {
      const { seats, pagination } = response.data.data;
      return {
        data: seats.map((seat) => ({
          id: seat._id,
          row: seat.row,
          seat_number: seat.seat_number,
          seat_type: seat.seat_type,
          is_available: seat.is_available,
          status: seat.status,
          created_at: seat.createdAt,
          updated_at: seat.updatedAt,
          seat_identifier: `${seat.row}${seat.seat_number}`,
          display_name: `Seat ${seat.row}${seat.seat_number} (${seat.seat_type})`,
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

  // Get single seat by ID
  async getSeat(id) {
    const response = await api.get(`/seats/${id}`);

    if (response.data?.success && response.data?.data?.seat) {
      const seat = response.data.data.seat;
      return {
        id: seat._id,
        row: seat.row,
        seat_number: seat.seat_number,
        seat_type: seat.seat_type,
        is_available: seat.is_available,
        status: seat.status,
        created_at: seat.createdAt,
        updated_at: seat.updatedAt,
        seat_identifier: `${seat.row}${seat.seat_number}`,
        display_name: `Seat ${seat.row}${seat.seat_number} (${seat.seat_type})`,
      };
    }

    return response.data;
  },

  // Create new seat
  async createSeat(seatData) {
    // Convert frontend format to backend format
    const backendData = {
      row: seatData.row?.toUpperCase(),
      seat_number: seatData.seat_number?.toString().toUpperCase(),
      seat_type: seatData.seat_type || "regular",
      is_available: seatData.is_available ?? true,
    };

    const response = await api.post("/seats", backendData);
    return response.data;
  },

  // Update seat
  async updateSeat(id, seatData) {
    // Convert frontend format to backend format
    const backendData = {
      row: seatData.row?.toUpperCase(),
      seat_number: seatData.seat_number?.toString().toUpperCase(),
      seat_type: seatData.seat_type,
      is_available: seatData.is_available,
    };

    // Remove undefined values
    Object.keys(backendData).forEach((key) => {
      if (backendData[key] === undefined) {
        delete backendData[key];
      }
    });

    const response = await api.put(`/seats/${id}`, backendData);
    return response.data;
  },

  // Delete seat (soft delete)
  async deleteSeat(id) {
    const response = await api.delete(`/seats/${id}`);
    return response.data;
  },

  // Toggle seat availability
  async toggleSeatAvailability(id) {
    const response = await api.put(`/seats/${id}/toggle`);
    return response.data;
  },

  // Get available seats
  async getAvailableSeats(params = {}) {
    const response = await api.get("/seats/available", { params });
    return response.data;
  },

  // Get seats by type
  async getSeatsByType(type, params = {}) {
    const response = await api.get(`/seats/type/${type}`, { params });
    return response.data;
  },
};
