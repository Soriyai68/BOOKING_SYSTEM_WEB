import api from "@/utils/api";

export const bookingTicketService = {
  /**
   * Get a paginated list of booking tickets with filters.
   * @param {object} params - Filtering and pagination parameters.
   * @returns {Promise<object>}
   */
  async getBookingTickets(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      bookingId: params.bookingId,
      seatId: params.seatId,
      ticket_type: params.ticket_type,
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
    };
    
    Object.keys(backendParams).forEach(
      (k) =>
        (backendParams[k] === undefined || backendParams[k] === "") &&
        delete backendParams[k]
    );

    const response = await api.get("/booking-tickets", { params: backendParams });

    if (response.data?.success && response.data?.data) {
      const { tickets, pagination } = response.data.data;
      return {
        data: tickets,
        total: pagination.totalCount,
        current_page: pagination.currentPage,
        per_page: pagination.limit,
        total_pages: pagination.totalPages,
      };
    }
    return response.data;
  },

  /**
   * Get a single booking ticket by its ID.
   * @param {string} id - The booking ticket ID.
   * @returns {Promise<object>}
   */
  async getBookingTicketById(id) {
    const response = await api.get(`/booking-tickets/${id}`);
    if (response.data?.success && response.data?.data?.ticket) {
      return response.data.data.ticket;
    }
    return response.data;
  },

  /**
   * Create a new booking ticket.
   * @param {object} ticketData - The data for the new booking ticket.
   * @returns {Promise<object>}
   */
  async createBookingTicket(ticketData) {
    const response = await api.post("/booking-tickets", ticketData);
    return response.data;
  },

  /**
   * Update an existing booking ticket.
   * @param {string} id - The booking ticket ID.
   * @param {object} updateData - The data to update.
   * @returns {Promise<object>}
   */
  async updateBookingTicket(id, updateData) {
    const response = await api.put(`/booking-tickets/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete a booking ticket.
   * @param {string} id - The booking ticket ID.
   * @returns {Promise<object>}
   */
  async deleteBookingTicket(id) {
    const response = await api.delete(`/booking-tickets/${id}`);
    return response.data;
  },
};
