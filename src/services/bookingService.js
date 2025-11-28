import api from '@/utils/api';

export const bookingService = {
  /**
   * Get a paginated list of bookings with filters.
   * @param {object} params - Filtering and pagination parameters.
   * @returns {Promise<object>}
   */
  async getBookings(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      booking_status: params.booking_status,
      payment_status: params.payment_status,
      showtimeId: params.showtime_id,
      dateFrom: params.date_from,
      dateTo: params.date_to,
      sortBy: params.sortBy || 'booking_date',
      sortOrder: params.sortOrder || 'desc',
    };

    Object.keys(backendParams).forEach(
      (k) => (backendParams[k] === undefined || backendParams[k] === '') && delete backendParams[k]
    );

    const response = await api.get('/bookings', { params: backendParams });

    if (response.data?.success && response.data?.data) {
        const { bookings, pagination } = response.data.data;
        return {
            data: bookings.map(b => ({
                id: b._id,
                user: b.user,
                showtime: b.showtime,
                movie: b.movie,
                hall: b.hall,
                seats: b.seats,
                reference_code: b.reference_code,
                total_price: b.total_price,
                booking_status: b.booking_status,
                payment_status: b.payment_status,
                payment_id: b.payment_id,
                booking_date: b.booking_date,
                expired_at: b.expired_at,
                noted: b.noted,
                seat_count: b.seat_count,
                created_at: b.createdAt,
                updated_at: b.updatedAt,
            })),
            total: pagination.totalCount,
            current_page: pagination.currentPage,
            per_page: pagination.limit,
            total_pages: pagination.totalPages
        };
    }
    return response.data;
  },

  /**
   * Get a single booking by its ID.
   * @param {string} id - The booking ID.
   * @returns {Promise<object>}
   */
  async getBookingById(id) {
    const response = await api.get(`/bookings/${id}`);
    if (response.data?.success && response.data?.data?.booking) {
      const booking = response.data.data.booking;
       return {
            id: booking._id,
            user: booking.userId,
            showtime: booking.showtimeId,
            movie: booking.showtimeId?.movie_id,
            hall: booking.showtimeId?.hall_id,
            seats: booking.seats,
            reference_code: booking.reference_code,
            total_price: booking.total_price,
            booking_status: booking.booking_status,
            payment_status: booking.payment_status,
            payment_id: booking.payment_id,
            booking_date: booking.booking_date,
            expired_at: booking.expired_at,
            noted: booking.noted,
            seat_count: booking.seat_count,
            created_at: booking.createdAt,
            updated_at: booking.updatedAt,
        }
    }
    return response.data;
  },

  /**
   * Create a new booking.
   * @param {object} bookingData - The data for the new booking.
   * @returns {Promise<object>}
   */
  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  /**
   * Update an existing booking's statuses.
   * @param {string} id - The booking ID.
   * @param {object} updateData - The data to update (e.g., booking_status, payment_status).
   * @returns {Promise<object>}
   */
  async updateBooking(id, updateData) {
    const response = await api.put(`/bookings/${id}`, updateData);
    return response.data;
  },

  /**
   * Cancel a booking (soft delete).
   * @param {string} id - The booking ID.
   * @returns {Promise<object>}
   */
  async cancelBooking(id) {
    const response = await api.patch(`/bookings/${id}/cancel`);
    return response.data;
  },

  // Constants for statuses
  BOOKING_STATUSES: [
    { value: 'Confirmed', label: 'Confirmed', type: 'warning' }, // Changed color to type
    { value: 'Completed', label: 'Completed', type: 'success' }, // Changed color to type
    { value: 'Cancelled', label: 'Cancelled', type: 'danger' },   // Changed color to type
    { value: 'Pending', label: 'Pending', type: 'info' },     // Changed color to type
  ],

  PAYMENT_STATUSES: [
    { value: 'Pending', label: 'Pending', type: 'warning' }, // Changed color to type
    { value: 'Completed', label: 'Completed', type: 'success' }, // Changed color to type
    { value: 'Failed', label: 'Failed', type: 'danger' },   // Changed color to type
    { value: 'Refunded', label: 'Refunded', type: 'info' },   // Changed color to type
  ]
};