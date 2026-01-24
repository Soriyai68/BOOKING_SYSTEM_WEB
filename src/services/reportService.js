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
};

export default reportService;