import api from "@/utils/api";
import { last } from "lodash-es";

export const customerService = {
  // Get all customers with pagination and filters
  async getCustomers(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.per_page || 10,
      search: params.search,
      isActive: params.isActive,
      customerType: params.customerType,
      sortBy: params.sort_by || "createdAt",
      sortOrder: params.sort_order || "desc",
    };

    // Remove undefined values
    Object.keys(backendParams).forEach((key) => {
      if (backendParams[key] === undefined || backendParams[key] === "") {
        delete backendParams[key];
      }
    });

    const response = await api.get("/customers", { params: backendParams });

    if (response.data?.success && response.data?.data) {
      const { customers, pagination } = response.data.data;
      return {
        data: customers.map((customer) => ({
          id: customer._id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          username: customer.username,
          customerType: customer.customerType,
          isActive: customer.isActive,
          isVerified: customer.isVerified,
          created_at: customer.createdAt,
          updated_at: customer.updatedAt,
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

  // Get single customer by ID
  async getCustomer(id) {
    const response = await api.get(`/customers/${id}`);

    if (response.data?.success && response.data?.data?.customer) {
      const customer = response.data.data.customer;
      return {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        username: customer.username,
        customerType: customer.customerType,
        isActive: customer.isActive,
        isVerified: customer.isVerified,
        created_at: customer.createdAt,
        updated_at: customer.updatedAt,
        lastLogin: customer.lastLogin,
        passwordChangedAt: customer.passwordChangedAt,
        provider: customer.provider,
      };
    }

    return response.data;
  },

  // Create new customer
  async createCustomer(customerData) {
    const response = await api.post("/customers", customerData);
    return response.data;
  },

  // Update customer
  async updateCustomer(id, customerData) {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  // Delete customer (soft delete)
  async deleteCustomer(id) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // Restore deleted customer
  async restoreCustomer(id) {
    const response = await api.put(`/customers/${id}/restore`);
    return response.data;
  },

  // Get customer statistics
  async getCustomerStats() {
    const response = await api.get("/customers/stats");
    return response.data;
  },
};
