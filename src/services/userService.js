import api from '@/utils/api'

const ALLOWED_ROLES = ['superadmin', 'admin', 'cashier', 'user']
const sanitizeRole = (role, fallback = 'user') => {
  if (!role) return fallback
  const r = String(role).toLowerCase()
  return ALLOWED_ROLES.includes(r) ? r : fallback
}

export const userService = {
  // Get all users with pagination and filters
  async getUsers(params = {}) {
    // Convert frontend params to backend format
    const backendParams = {
      page: params.page || 1,
      limit: params.per_page || 10,
      search: params.search,
      status: params.status === 'active' ? true : params.status === 'inactive' ? false : undefined,
      role: params.role,
      sortBy: params.sort_by || 'createdAt',
      sortOrder: params.sort_order || 'desc'
    }

    // Remove undefined values
    Object.keys(backendParams).forEach(key => {
      if (backendParams[key] === undefined) {
        delete backendParams[key]
      }
    })

    const response = await api.get('/users', { params: backendParams })
    
    // Backend returns: { success: true, data: { users, pagination } }
    if (response.data?.success && response.data?.data) {
      const { users, pagination } = response.data.data
      return {
        data: users.map(user => ({
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email || user.phone, // Use phone as email if no email
          role: user.role,
          status: user.isActive ? 'active' : 'inactive',
          isVerified: user.isVerified,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
          lastLogin: user.lastLogin
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

  // Get single user by ID
  async getUser(id) {
    const response = await api.get(`/users/${id}`)
    
    if (response.data?.success && response.data?.data?.user) {
      const user = response.data.data.user
      return {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email || user.phone,
        role: user.role,
        status: user.isActive ? 'active' : 'inactive',
        isVerified: user.isVerified,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        lastLogin: user.lastLogin,
        provider: user.provider
      }
    }
    
    return response.data
  },

  // Create new user
  async createUser(userData) {
    // Convert frontend format to backend format
    const backendData = {
      name: userData.name,
      phone: userData.phone,
      role: sanitizeRole(userData.role, 'user'),
      password: userData.password,
      isVerified: userData.isVerified ?? true,
      isActive: userData.isActive ?? true
    }
    
    const response = await api.post('/users', backendData)
    return response.data
  },

  // Update user
  async updateUser(id, userData) {
    // Convert frontend format to backend format
    const backendData = {
      name: userData.name,
      phone: userData.phone,
      role: userData.role ? sanitizeRole(userData.role) : undefined,
      isActive: userData.status === 'active',
      isVerified: userData.isVerified
    }
    
    // Only include password if provided
    if (userData.password) {
      backendData.password = userData.password
    }
    
    const response = await api.put(`/users/${id}`, backendData)
    return response.data
  },

  // Delete user (soft delete)
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // Update user status
  async updateUserStatus(id, isActive) {
    const response = await api.put(`/users/${id}`, { isActive })
    return response.data
  },

  // Get user statistics
  async getUserStats() {
    const response = await api.get('/users/stats')
    return response.data
  },

  // Search users with advanced filters
  async searchUsers(searchData) {
    const response = await api.post('/users/search', searchData)
    return response.data
  },

  // Get users by role
  async getUsersByRole(role, params = {}) {
    const response = await api.get(`/users/role/${role}`, { params })
    return response.data
  },

  // Get deleted users
  async getDeletedUsers(params = {}) {
    const response = await api.get('/users/deleted', { params })
    return response.data
  },

  // Restore deleted user
  async restoreUser(id) {
    const response = await api.put(`/users/${id}/restore`)
    return response.data
  }
}
