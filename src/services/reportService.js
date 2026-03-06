import api from "@/utils/api";

const reportService = {
  getTotalCustomers: async () => {
    try {
      const response = await api.get("/reports/total-customers");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTotalBookings: async () => {
    try {
      const response = await api.get("/reports/total-bookings");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTotalRevenue: async () => {
    try {
      const response = await api.get("/reports/total-revenue");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTotalMovies: async () => {
    try {
      const response = await api.get("/reports/total-movies");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCustomerBookingFrequency: async (params) => {
    try {
      const response = await api.get("/reports/customer-booking-frequency", {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRevenueReport: async (timeframe = "month") => {
    try {
      const response = await api.get("/reports/revenue-report", {
        params: { timeframe },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getBookingStatusReport: async () => {
    try {
      const response = await api.get("/reports/booking-status-report");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPopularMoviesReport: async () => {
    try {
      const response = await api.get("/reports/popular-movies-report");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getSeatTypeRevenueReport: async () => {
    try {
      const response = await api.get("/reports/seat-type-revenue-report");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDetailedRevenueReport: async (params) => {
    try {
      const response = await api.get("/reports/detailed-revenue", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDetailedBookingReport: async (params) => {
    try {
      const response = await api.get("/reports/detailed-bookings", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDetailedMovieReport: async (params) => {
    try {
      const response = await api.get("/reports/detailed-movies", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default reportService;
