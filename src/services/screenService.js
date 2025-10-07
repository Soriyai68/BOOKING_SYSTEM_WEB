import api from '@/utils/api'

export const screenService = {
  // Get all screens with pagination and filters
  async getScreens(params = {}) {
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
      sortBy: params.sort_by || 'screen_name',
      sortOrder: params.sort_order || 'asc'
    }

    // Remove undefined values
    Object.keys(backendParams).forEach(key => {
      if (backendParams[key] === undefined) {
        delete backendParams[key]
      }
    })

    const response = await api.get('/screens', { params: backendParams })

    // Backend returns: { success: true, data: { screens, pagination } }
    if (response.data?.success && response.data?.data) {
      const { screens, pagination } = response.data.data
      return {
        data: screens.map(screen => ({
          id: screen._id,
          screen_name: screen.screen_name,
          screen_type: screen.screen_type,
          total_seats: screen.total_seats,
          seat_layout_id: screen.seat_layout_id,
          theater_id: screen.theater_id,
          status: screen.status,
          capacity: screen.capacity || {
            standard: 0,
            premium: 0,
            vip: 0,
            wheelchair: 0,
            recliner: 0
          },
          dimensions: screen.dimensions || { width: 10, height: 10 },
          features: screen.features || [],
          notes: screen.notes || '',
          created_at: screen.createdAt,
          updated_at: screen.updatedAt,
          deleted_at: screen.deletedAt,
          created_by: screen.createdBy,
          updated_by: screen.updatedBy,
          deleted_by: screen.deletedBy,
          restored_at: screen.restoredAt,
          restored_by: screen.restoredBy,
          is_deleted: !!screen.deletedAt,
          display_name: screen.theater_id
            ? `${screen.theater_id} - ${screen.screen_name}`
            : screen.screen_name,
          status_display: (() => {
            if (!!screen.deletedAt) return 'Deleted';
            return screen.status.charAt(0).toUpperCase() + screen.status.slice(1).replace('_', ' ');
          })(),
          capacity_display: (() => {
            const { standard = 0, premium = 0, vip = 0, wheelchair = 0, recliner = 0 } = screen.capacity || {};
            const total = standard + premium + vip + wheelchair + recliner;
            return `${total} seats`;
          })(),
          utilization_percentage: (() => {
            if (!screen.total_seats) return 0;
            const { standard = 0, premium = 0, vip = 0, wheelchair = 0, recliner = 0 } = screen.capacity || {};
            const calculatedCapacity = standard + premium + vip + wheelchair + recliner;
            return Math.round((calculatedCapacity / screen.total_seats) * 100);
          })(),
          screen_type_display: screen.screen_type.toUpperCase(),
          features_display: (screen.features || []).map(f => f.replace('_', ' ')).join(', ') || 'None'
        })),
        total: pagination.totalCount,
        current_page: pagination.currentPage,
        per_page: pagination.limit,
        total_pages: pagination.totalPages,
        has_next_page: pagination.hasNextPage,
        has_prev_page: pagination.hasPrevPage
      }
    }

    return response.data
  },

  // Get single screen by ID
  async getScreen(id) {
    const response = await api.get(`/screens/${id}`)

    if (response.data?.success && response.data?.data?.screen) {
      const screen = response.data.data.screen
      return {
        id: screen._id,
        screen_name: screen.screen_name,
        screen_type: screen.screen_type,
        total_seats: screen.total_seats,
        seat_layout_id: screen.seat_layout_id,
        theater_id: screen.theater_id,
        status: screen.status,
        capacity: screen.capacity || {
          standard: 0,
          premium: 0,
          vip: 0,
          wheelchair: 0,
          recliner: 0
        },
        dimensions: screen.dimensions || { width: 10, height: 10 },
        features: screen.features || [],
        notes: screen.notes || '',
        created_at: screen.createdAt,
        updated_at: screen.updatedAt,
        deleted_at: screen.deletedAt,
        created_by: screen.createdBy,
        updated_by: screen.updatedBy,
        deleted_by: screen.deletedBy,
        restored_at: screen.restoredAt,
        restored_by: screen.restoredBy,
        is_deleted: !!screen.deletedAt,
        display_name: screen.theater_id
          ? `${screen.theater_id} - ${screen.screen_name}`
          : screen.screen_name,
        status_display: (() => {
          if (!!screen.deletedAt) return 'Deleted';
          return screen.status.charAt(0).toUpperCase() + screen.status.slice(1).replace('_', ' ');
        })()
      }
    }

    return response.data
  },

  // Create new screen
  async createScreen(screenData) {
    // Convert frontend format to backend format
    const backendData = {
      screen_name: screenData.screen_name?.trim(),
      total_seats: screenData.total_seats || 0,
      seat_layout_id: screenData.seat_layout_id || null,
      theater_id: screenData.theater_id || null,
      screen_type: screenData.screen_type || 'standard',
      status: screenData.status || 'active',
      capacity: screenData.capacity || {
        standard: 0,
        premium: 0,
        vip: 0,
        wheelchair: 0,
        recliner: 0
      },
      dimensions: screenData.dimensions || { width: 10, height: 10 },
      features: screenData.features || [],
      notes: screenData.notes || ''
    }

    // Remove null/undefined values
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === null || backendData[key] === undefined) {
        delete backendData[key]
      }
    })

    const response = await api.post('/screens', backendData)
    return response.data
  },

  // Update screen
  async updateScreen(id, screenData) {
    // Convert frontend format to backend format
    const backendData = {
      screen_name: screenData.screen_name?.trim(),
      total_seats: screenData.total_seats,
      seat_layout_id: screenData.seat_layout_id,
      theater_id: screenData.theater_id,
      screen_type: screenData.screen_type,
      status: screenData.status,
      capacity: screenData.capacity,
      dimensions: screenData.dimensions,
      features: screenData.features,
      notes: screenData.notes
    }

    // Remove undefined values
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === undefined) {
        delete backendData[key]
      }
    })

    const response = await api.put(`/screens/${id}`, backendData)
    return response.data
  },

  // Delete screen (soft delete)
  // async deleteScreen(id) {
  //   const response = await api.delete(`/screens/${id}`)
  //   return response.data
  // },

  //delete screen (force delete)
  async deleteScreen(id) {
    const response = await api.delete(`/screens/${id}/force-delete`)
    return response.data
  },

  // Update screen status
  async updateScreenStatus(id, status) {
    const response = await api.put(`/screens/${id}/status`, { status })
    return response.data
  },

  // Update screen capacity
  async updateScreenCapacity(id, capacity) {
    const response = await api.put(`/screens/${id}/capacity`, { capacity })
    return response.data
  },

  // Restore deleted screen
  async restoreScreen(id) {
    const response = await api.put(`/screens/${id}/restore`)
    return response.data
  },

  // Force delete screen (permanent)
  async forceDeleteScreen(id) {
    const response = await api.delete(`/screens/${id}/force-delete`)
    return response.data
  },

  // Get screen statistics
  async getScreenStats() {
    const response = await api.get('/screens/stats')
    return response.data
  },

  // Get deleted screens
  async getDeletedScreens(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.per_page || 10,
      sortBy: params.sort_by || 'deletedAt',
      sortOrder: params.sort_order || 'desc'
    }

    const response = await api.get('/screens/deleted', { params: backendParams })

    if (response.data?.success && response.data?.data) {
      const { screens, pagination } = response.data.data
      return {
        data: screens.map(screen => ({
          id: screen._id,
          screen_name: screen.screen_name,
          screen_type: screen.screen_type,
          total_seats: screen.total_seats,
          theater_id: screen.theater_id,
          status: screen.status,
          capacity: screen.capacity,
          features: screen.features || [],
          notes: screen.notes || '',
          created_at: screen.createdAt,
          updated_at: screen.updatedAt,
          deleted_at: screen.deletedAt,
          deleted_by: screen.deletedBy,
          restored_at: screen.restoredAt,
          restored_by: screen.restoredBy,
          is_deleted: true,
          display_name: screen.theater_id
            ? `${screen.theater_id} - ${screen.screen_name}`
            : screen.screen_name,
          delete_info: screen.deleteInfo,
          restore_info: screen.restoreInfo
        })),
        total: pagination.totalCount,
        current_page: pagination.currentPage,
        per_page: pagination.limit,
        total_pages: pagination.totalPages,
        has_next_page: pagination.hasNextPage,
        has_prev_page: pagination.hasPrevPage
      }
    }

    return response.data
  },

  // Get screens by type
  async getScreensByType(type, params = {}) {
    const response = await api.get(`/screens/type/${type}`, { params })
    return response.data
  },

  // Get screens by theater
  async getScreensByTheater(theaterId, params = {}) {
    const response = await api.get(`/screens/theater/${theaterId}`, { params })
    return response.data
  },

  // Get screens with seat counts
  async getScreensWithSeatCounts(params = {}) {
    const queryParams = {
      theater_id: params.theater_id,
      screen_type: params.screen_type,
      activeOnly: params.active_only !== undefined ? params.active_only.toString() : 'true'
    }

    // Remove undefined values
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined) {
        delete queryParams[key]
      }
    })

    const response = await api.get('/screens/with-seat-counts', { params: queryParams })

    if (response.data?.success && response.data?.data) {
      return {
        screens: response.data.data.screens.map(screen => ({
          id: screen._id,
          screen_name: screen.screen_name,
          screen_type: screen.screen_type,
          total_seats: screen.total_seats,
          theater_id: screen.theater_id,
          status: screen.status,
          capacity: screen.capacity,
          actual_capacity: screen.actualCapacity || {},
          actual_total_seats: screen.actualTotalSeats || 0,
          display_name: screen.theater_id
            ? `${screen.theater_id} - ${screen.screen_name}`
            : screen.screen_name,
          utilization: screen.actualTotalSeats && screen.total_seats
            ? Math.round((screen.actualTotalSeats / screen.total_seats) * 100)
            : 0
        })),
        count: response.data.data.count,
        filters: response.data.data.filters
      }
    }

    return response.data
  },

  // Constants for frontend use
  SCREEN_TYPES: [
    { value: 'standard', label: 'Standard', color: '#409EFF' },
    { value: 'imax', label: 'IMAX', color: '#E6A23C' },
    { value: '2d', label: '2D', color: '#909399' },
    { value: '3d', label: '3D', color: '#67C23A' },
    { value: '4dx', label: '4DX', color: '#F56C6C' },
    { value: 'vip', label: 'VIP', color: '#909399' }
  ],

  SCREEN_STATUSES: [
    { value: 'active', label: 'Active', color: '#67C23A' },
    { value: 'maintenance', label: 'Maintenance', color: '#E6A23C' },
    { value: 'closed', label: 'Closed', color: '#F56C6C' },
    { value: 'renovation', label: 'Renovation', color: '#909399' }
  ],

  SCREEN_FEATURES: [
    { value: 'dolby_atmos', label: 'Dolby Atmos' },
    { value: 'surround_sound', label: 'Surround Sound' },
    { value: 'premium_seating', label: 'Premium Seating' },
    { value: 'wheelchair_accessible', label: 'Wheelchair Accessible' },
    { value: 'air_conditioning', label: 'Air Conditioning' },
    { value: 'heating', label: 'Heating' }
  ],

  SORT_OPTIONS: [
    { value: 'screen_name', label: 'Screen Name' },
    { value: 'screen_type', label: 'Screen Type' },
    { value: 'theater_id', label: 'Theater' },
    { value: 'total_seats', label: 'Total Seats' },
    { value: 'status', label: 'Status' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' }
  ],

  CAPACITY_TYPES: [
    { value: 'standard', label: 'Standard', color: '#409EFF' },
    { value: 'premium', label: 'Premium', color: '#E6A23C' },
    { value: 'vip', label: 'VIP', color: '#F56C6C' },
    { value: 'wheelchair', label: 'Wheelchair', color: '#909399' },
    { value: 'recliner', label: 'Recliner', color: '#67C23A' }
  ]
}