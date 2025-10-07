import api from "@/utils/api";

export const hallService = {
  // Get all halls with pagination and filters
  async getHalls(params = {}) {
    // Convert frontend params to backend format
    const backendParams = {
      page: params.page || 1,
      limit: params.per_page || 10,
      search: params.search,
      screen_type: params.screen_type,
      status: params.status,
      theater_id: params.theater_id,
      minSeats: params.min_seats,
      maxSeats: params.max_seats,
      hasFeatures: params.has_features,
      dateFrom: params.date_from,
      dateTo: params.date_to,
      includeDeleted: params.include_deleted || false,
      sortBy: params.sort_by || "hall_name",
      sortOrder: params.sort_order || "asc",
    };

    // Remove undefined values
    Object.keys(backendParams).forEach((key) => {
      if (backendParams[key] === undefined) {
        delete backendParams[key];
      }
    });

    const response = await api.get("/halls", { params: backendParams });

    // Backend returns: { success: true, data: { halls, pagination } }
    if (response.data?.success && response.data?.data) {
      const { halls, pagination } = response.data.data;
      return {
        data: halls.map((hall) => ({
          id: hall._id,
          hall_name: hall.hall_name,
          screen_type: hall.screen_type,
          total_seats: hall.total_seats,
          seat_layout_id: hall.seat_layout_id,
          theater_id: hall.theater_id,
          status: hall.status,
          capacity: hall.capacity || {
            standard: 0,
            premium: 0,
            vip: 0,
            wheelchair: 0,
            recliner: 0,
          },
          dimensions: hall.dimensions || { width: 10, height: 10 },
          features: hall.features || [],
          notes: hall.notes || "",
          created_at: hall.createdAt,
          updated_at: hall.updatedAt,
          deleted_at: hall.deletedAt,
          created_by: hall.createdBy,
          updated_by: hall.updatedBy,
          deleted_by: hall.deletedBy,
          restored_at: hall.restoredAt,
          restored_by: hall.restoredBy,
          is_deleted: !!hall.deletedAt,
          display_name: hall.theater_id
            ? `${hall.theater_id} - ${hall.hall_name}`
            : hall.hall_name,
          status_display: (() => {
            if (!!hall.deletedAt) return "Deleted";
            return (
              hall.status.charAt(0).toUpperCase() +
              hall.status.slice(1).replace("_", " ")
            );
          })(),
          capacity_display: (() => {
            const {
              standard = 0,
              premium = 0,
              vip = 0,
              wheelchair = 0,
              recliner = 0,
            } = hall.capacity || {};
            const total = standard + premium + vip + wheelchair + recliner;
            return `${total} seats`;
          })(),
          utilization_percentage: (() => {
            if (!hall.total_seats) return 0;
            const {
              standard = 0,
              premium = 0,
              vip = 0,
              wheelchair = 0,
              recliner = 0,
            } = hall.capacity || {};
            const calculatedCapacity =
              standard + premium + vip + wheelchair + recliner;
            return Math.round((calculatedCapacity / hall.total_seats) * 100);
          })(),
          screen_type_display: hall.screen_type.toUpperCase(),
          features_display:
            (hall.features || []).map((f) => f.replace("_", " ")).join(", ") ||
            "None",
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

  // Get single hall by ID
  async getHall(id) {
    const response = await api.get(`/halls/${id}`);

    if (response.data?.success && response.data?.data?.hall) {
      const hall = response.data.data.hall;
      return {
        id: hall._id,
        hall_name: hall.hall_name,
        screen_type: hall.screen_type,
        total_seats: hall.total_seats,
        seat_layout_id: hall.seat_layout_id,
        theater_id: hall.theater_id,
        status: hall.status,
        capacity: hall.capacity || {
          standard: 0,
          premium: 0,
          vip: 0,
          wheelchair: 0,
          recliner: 0,
        },
        dimensions: hall.dimensions || { width: 10, height: 10 },
        features: hall.features || [],
        notes: hall.notes || "",
        created_at: hall.createdAt,
        updated_at: hall.updatedAt,
        deleted_at: hall.deletedAt,
        created_by: hall.createdBy,
        updated_by: hall.updatedBy,
        deleted_by: hall.deletedBy,
        restored_at: hall.restoredAt,
        restored_by: hall.restoredBy,
        is_deleted: !!hall.deletedAt,
        display_name: hall.theater_id
          ? `${hall.theater_id} - ${hall.hall_name}`
          : hall.hall_name,
        status_display: (() => {
          if (!!hall.deletedAt) return "Deleted";
          return (
            hall.status.charAt(0).toUpperCase() +
            hall.status.slice(1).replace("_", " ")
          );
        })(),
      };
    }

    return response.data;
  },

  // Create new hall
  async createHall(hallData) {
    // Convert frontend format to backend format
    const backendData = {
      hall_name: hallData.hall_name?.trim(),
      total_seats: hallData.total_seats || 0,
      seat_layout_id: hallData.seat_layout_id || null,
      theater_id: hallData.theater_id || null,
      screen_type: hallData.screen_type || "standard",
      status: hallData.status || "active",
      capacity: hallData.capacity || {
        standard: 0,
        premium: 0,
        vip: 0,
        wheelchair: 0,
        recliner: 0,
      },
      dimensions: hallData.dimensions || { width: 10, height: 10 },
      features: hallData.features || [],
      notes: hallData.notes || "",
    };

    // Remove null/undefined values
    Object.keys(backendData).forEach((key) => {
      if (backendData[key] === null || backendData[key] === undefined) {
        delete backendData[key];
      }
    });

    const response = await api.post("/halls", backendData);
    return response.data;
  },

  // Update hall
  async updateHall(id, hallData) {
    // Convert frontend format to backend format
    const backendData = {
      hall_name: hallData.hall_name?.trim(),
      total_seats: hallData.total_seats,
      seat_layout_id: hallData.seat_layout_id,
      theater_id: hallData.theater_id,
      screen_type: hallData.screen_type,
      status: hallData.status,
      capacity: hallData.capacity,
      dimensions: hallData.dimensions,
      features: hallData.features,
      notes: hallData.notes,
    };

    // Remove undefined values
    Object.keys(backendData).forEach((key) => {
      if (backendData[key] === undefined) {
        delete backendData[key];
      }
    });

    const response = await api.put(`/halls/${id}`, backendData);
    return response.data;
  },

  // Delete hall (soft delete)
  // async deleteHall(id) {
  //   const response = await api.delete(`/halls/${id}`)
  //   return response.data
  // },

  //delete hall (force delete)
  async deleteHall(id) {
    const response = await api.delete(`/halls/${id}/force-delete`);
    return response.data;
  },

  // Update hall status
  async updateHallStatus(id, status) {
    const response = await api.put(`/halls/${id}/status`, { status });
    return response.data;
  },

  // Update hall capacity
  async updateHallCapacity(id, capacity) {
    const response = await api.put(`/halls/${id}/capacity`, { capacity });
    return response.data;
  },

  // Restore deleted hall
  async restoreHall(id) {
    const response = await api.put(`/halls/${id}/restore`);
    return response.data;
  },

  // Force delete hall (permanent)
  async forceDeleteHall(id) {
    const response = await api.delete(`/halls/${id}/force-delete`);
    return response.data;
  },

  // Get hall statistics
  async getHallStats() {
    const response = await api.get("/halls/stats");
    return response.data;
  },

  // Get deleted halls
  async getDeletedHalls(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.per_page || 10,
      sortBy: params.sort_by || "deletedAt",
      sortOrder: params.sort_order || "desc",
    };

    const response = await api.get("/halls/deleted", { params: backendParams });

    if (response.data?.success && response.data?.data) {
      const { halls, pagination } = response.data.data;
      return {
        data: halls.map((hall) => ({
          id: hall._id,
          hall_name: hall.hall_name,
          screen_type: hall.screen_type,
          total_seats: hall.total_seats,
          theater_id: hall.theater_id,
          status: hall.status,
          capacity: hall.capacity,
          features: hall.features || [],
          notes: hall.notes || "",
          created_at: hall.createdAt,
          updated_at: hall.updatedAt,
          deleted_at: hall.deletedAt,
          deleted_by: hall.deletedBy,
          restored_at: hall.restoredAt,
          restored_by: hall.restoredBy,
          is_deleted: true,
          display_name: hall.theater_id
            ? `${hall.theater_id} - ${hall.hall_name}`
            : hall.hall_name,
          delete_info: hall.deleteInfo,
          restore_info: hall.restoreInfo,
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

  // Get halls by type
  async getHallsByType(type, params = {}) {
    const response = await api.get(`/halls/type/${type}`, { params });
    return response.data;
  },

  // Get halls by theater
  async getHallsByTheater(theaterId, params = {}) {
    const response = await api.get(`/halls/theater/${theaterId}`, { params });
    return response.data;
  },

  // Get halls with seat counts
  async getHallsWithSeatCounts(params = {}) {
    const queryParams = {
      theater_id: params.theater_id,
      hall_type: params.hall_type,
      activeOnly:
        params.active_only !== undefined
          ? params.active_only.toString()
          : "true",
    };

    // Remove undefined values
    Object.keys(queryParams).forEach((key) => {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    const response = await api.get("/halls/with-seat-counts", {
      params: queryParams,
    });

    if (response.data?.success && response.data?.data) {
      return {
        halls: response.data.data.halls.map((hall) => ({
          id: hall._id,
          hall_name: hall.hall_name,
          hall_type: hall.screen_type,
          total_seats: hall.total_seats,
          theater_id: hall.theater_id,
          status: hall.status,
          capacity: hall.capacity,
          actual_capacity: hall.actualCapacity || {},
          actual_total_seats: hall.actualTotalSeats || 0,
          display_name: hall.theater_id
            ? `${hall.theater_id} - ${hall.hall_name}`
            : hall.hall_name,
          utilization:
            hall.actualTotalSeats && hall.total_seats
              ? Math.round((hall.actualTotalSeats / hall.total_seats) * 100)
              : 0,
        })),
        count: response.data.data.count,
        filters: response.data.data.filters,
      };
    }

    return response.data;
  },

  // Constants for frontend use
  SCREEN_TYPES: [
    { value: "2d", label: "2D", color: "#8A2BE2" },
    { value: "standard", label: "Standard", color: "#409EFF" },
    { value: "imax", label: "IMAX", color: "#E6A23C" },
    { value: "3d", label: "3D", color: "#67C23A" },
    { value: "4dx", label: "4DX", color: "#F56C6C" },
    { value: "vip", label: "VIP", color: "#909399" },
  ],

  HALL_STATUSES: [
    { value: "active", label: "Active", color: "#67C23A" },
    { value: "maintenance", label: "Maintenance", color: "#E6A23C" },
    { value: "closed", label: "Closed", color: "#F56C6C" },
    { value: "renovation", label: "Renovation", color: "#909399" },
  ],

  HALL_FEATURES: [
    { value: "dolby_atmos", label: "Dolby Atmos" },
    { value: "surround_sound", label: "Surround Sound" },
    { value: "premium_seating", label: "Premium Seating" },
    { value: "wheelchair_accessible", label: "Wheelchair Accessible" },
    { value: "air_conditioning", label: "Air Conditioning" },
    { value: "heating", label: "Heating" },
  ],

  SORT_OPTIONS: [
    { value: "hall_name", label: "Hall Name" },
    { value: "screen_type", label: "Sreen Type" },
    { value: "theater_id", label: "Theater" },
    { value: "total_seats", label: "Total Seats" },
    { value: "status", label: "Status" },
    { value: "createdAt", label: "Created Date" },
    { value: "updatedAt", label: "Updated Date" },
  ],

  CAPACITY_TYPES: [
    { value: "standard", label: "Standard", color: "#409EFF" },
    { value: "premium", label: "Premium", color: "#E6A23C" },
    { value: "vip", label: "VIP", color: "#F56C6C" },
    { value: "wheelchair", label: "Wheelchair", color: "#909399" },
    { value: "recliner", label: "Recliner", color: "#67C23A" },
  ],
};
