import api from '@/utils/api'

export const theaterService = {
  // List theaters with pagination and filters
  async getTheaters(params = {}) {
    const backendParams = {
      page: params.page || 1,
      limit: params.per_page || 10,
      search: params.search,
      status: params.status,
      city: params.city,
      province: params.province,
      minScreens: params.min_screens,
      maxScreens: params.max_screens,
      minCapacity: params.min_capacity,
      maxCapacity: params.max_capacity,
      hasFeatures: params.has_features,
      dateFrom: params.date_from,
      dateTo: params.date_to,
      includeDeleted: params.include_deleted || false,
      sortBy: params.sort_by || 'name',
      sortOrder: params.sort_order || 'asc',
    }

    Object.keys(backendParams).forEach((k) => backendParams[k] === undefined && delete backendParams[k])

    const { data } = await api.get('/theaters', { params: backendParams })
    if (data?.success && data?.data) {
      const { theaters, pagination } = data.data
      return {
        data: theaters.map((t) => ({
          id: t._id,
          name: t.name,
          address: t.address,
          city: t.city,
          province: t.province,
          status: t.status,
          features: t.features || [],
          total_screens: t.total_screens || 0,
          total_capacity: t.total_capacity || 0,
          screens_id: t.screens_id || [],
          contact_info: t.contact_info || {},
          operating_hours: t.operating_hours || {},
          location: t.location || null,
          notes: t.notes || '',
          created_at: t.createdAt,
          updated_at: t.updatedAt,
          deleted_at: t.deletedAt,
          display_name: `${t.name} - ${t.city}, ${t.province}`,
          status_display: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1).replace('_', ' ') : 'Active',
        })),
        total: pagination.totalCount,
        current_page: pagination.currentPage,
        per_page: pagination.limit,
        total_pages: pagination.totalPages,
      }
    }
    return data
  },

  // Get a single theater by ID
  async getTheater(id) {
    const { data } = await api.get(`/theaters/${id}`)
    if (data?.success && data?.data?.theater) {
      const t = data.data.theater
      return {
        id: t._id,
        name: t.name,
        address: t.address,
        city: t.city,
        province: t.province,
        status: t.status,
        features: t.features || [],
        total_screens: t.total_screens || 0,
        total_capacity: t.total_capacity || 0,
        screens_id: t.screens_id || [],
        contact_info: t.contact_info || {},
        operating_hours: t.operating_hours || {},
        location: t.location || null,
        notes: t.notes || '',
        created_at: t.createdAt,
        updated_at: t.updatedAt,
        deleted_at: t.deletedAt,
        display_name: `${t.name} - ${t.city}, ${t.province}`,
      }
    }
    return data
  },

  // Create a theater
  async createTheater(payload) {
    const backendData = {
      name: payload.name?.trim(),
      address: payload.address?.trim(),
      city: payload.city?.trim(),
      province: payload.province?.trim(),
      status: payload.status || 'active',
      features: payload.features || [],
      total_capacity: payload.total_capacity || 0,
      notes: payload.notes || '',
    }
    Object.keys(backendData).forEach((k) => backendData[k] === undefined && delete backendData[k])
    const { data } = await api.post('/theaters', backendData)
    return data
  },

  // Update a theater
  async updateTheater(id, payload) {
    const backendData = {
      name: payload.name?.trim(),
      address: payload.address?.trim(),
      city: payload.city?.trim(),
      province: payload.province?.trim(),
      status: payload.status,
      features: payload.features,
      total_capacity: payload.total_capacity,
      notes: payload.notes,
    }
    Object.keys(backendData).forEach((k) => backendData[k] === undefined && delete backendData[k])
    const { data } = await api.put(`/theaters/${id}`, backendData)
    return data
  },

  async deleteTheater(id) {
    const { data } = await api.delete(`/theaters/${id}`)
    return data
  },

  async updateStatus(id, status) {
    const { data } = await api.put(`/theaters/${id}/status`, { status })
    return data
  },

  async addScreen(theaterId, screen_id) {
    const { data } = await api.post(`/theaters/${theaterId}/screens`, { screen_id })
    return data
  },

  async removeScreen(theaterId, screen_id) {
    const { data } = await api.delete(`/theaters/${theaterId}/screens`, { data: { screen_id } })
    return data
  },

  async updateLocation(id, longitude, latitude) {
    const { data } = await api.put(`/theaters/${id}/location`, { longitude, latitude })
    return data
  },

  async getAnalytics(params = {}) {
    const { data } = await api.get('/theaters/analytics', { params })
    return data
  },

  STATUS_OPTIONS: [
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'closed', label: 'Closed' },
    { value: 'renovation', label: 'Renovation' },
  ],
}
