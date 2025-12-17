<template>
  <div class="user-roles-container">
    <!-- Enhanced Header -->
    <div class="page-header">
      <div class="header-background">
        <div class="header-content">
          <div class="header-main">
            <div class="title-section">
              <div class="icon-wrapper">
                <el-icon class="title-icon"><UserCog /></el-icon>
              </div>
              <div class="title-text">
                <h1 class="page-title">User Roles Management</h1>
                <p class="page-description">Manage user roles, permissions, and access levels across the system</p>
              </div>
            </div>
            <div class="header-stats">
              <div class="stat-card">
                <div class="stat-value">{{ totalUsers }}</div>
                <div class="stat-label">Total Users</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ activeUsersCount }}</div>
                <div class="stat-label">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Search and Filters -->
    <el-card class="filter-card" shadow="hover">
      <div class="filters-container">
        <div class="search-section">
          <div class="search-wrapper">
            <el-input
              v-model="searchQuery"
              placeholder="Search users by name, phone, or email..."
              prefix-icon="Search"
              class="search-input"
              @input="handleSearch"
              clearable
              size="large"
            >
              <template #prefix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
        
        <div class="filters-group">
          <div class="filter-item">
            <label class="filter-label">Role Filter</label>
            <el-select
              v-model="selectedRole"
              placeholder="All Roles"
              clearable
              @change="handleRoleFilter"
              class="role-filter"
              size="large"
            >
              <el-option label="All Roles" value="" />
              <el-option
                v-for="role in availableRoles"
                :key="role.value"
                :label="role.label"
                :value="role.value"
              >
                <div class="role-option">
                  <el-tag :type="getRoleTagType(role.value)" size="small" class="role-tag">
                    {{ role.label }}
                  </el-tag>
                </div>
              </el-option>
            </el-select>
          </div>
          
          <div class="filter-item">
            <label class="filter-label">Status Filter</label>
            <el-select
              v-model="selectedStatus"
              placeholder="All Status"
              clearable
              @change="handleStatusFilter"
              class="status-filter"
              size="large"
            >
              <el-option label="All Status" value="" />
              <el-option label="Active" value="active" />
              <el-option label="Inactive" value="inactive" />
            </el-select>
          </div>
        </div>
      </div>
    </el-card>

    <!-- Enhanced Users Table -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header-enhanced">
          <div class="header-left">
            <span class="card-title">Users & Roles Management</span>
            <el-tag v-if="filteredUsers.length > 0" type="info" size="small">
              {{ filteredUsers.length }} users found
            </el-tag>
          </div>
          <div class="header-actions">
            <el-button
              type="primary"
              :icon="RefreshCcw"
              @click="loadUsers"
              :loading="loading"
              class="refresh-btn"
              size="large"
            >
              Refresh Data
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="filteredUsers"
        stripe
        style="width: 100%"
        :empty-text="'No users matching your criteria'"
        class="enhanced-table"
        header-row-class-name="table-header"
      >
        <el-table-column prop="name" label="User" min-width="200">
          <template #default="{ row }">
            <div class="user-info-enhanced">
              <div class="user-avatar-enhanced" :class="getUserStatusClass(row)">
                {{ row.name.charAt(0).toUpperCase() }}
                <div class="status-indicator" :class="{ active: row.isActive }"></div>
              </div>
              <div class="user-details-enhanced">
                <div class="user-name">{{ row.name }}</div>
                <div class="user-contact">
                  <el-icon class="contact-icon"><Phone /></el-icon>
                  {{ toLocalPhone(row.phone) }}
                  <span v-if="row.email" class="user-email">
                    <el-icon><Message /></el-icon>
                    {{ row.email }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="role" label="Role" width="140">
          <template #default="{ row }">
            <el-tag 
              :type="getRoleTagType(row.role)" 
              size="small" 
              class="role-tag-enhanced"
              effect="dark"
            >
              <el-icon v-if="row.role === 'superadmin'" class="tag-icon"><Star /></el-icon>
              <el-icon v-else-if="row.role === 'admin'" class="tag-icon"><Setting /></el-icon>
              {{ getRoleDisplayName(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="isActive" label="Status" width="120">
          <template #default="{ row }">
            <div class="status-badge" :class="row.isActive ? 'active' : 'inactive'">
              <div class="status-dot"></div>
              <span>{{ row.isActive ? "Active" : "Inactive" }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="lastLogin" label="Last Login" width="180">
          <template #default="{ row }">
            <div class="date-info-enhanced">
              <el-icon class="date-icon"><Clock /></el-icon>
              <div class="date-content">
                <div class="date-main">{{ formatDate(row.lastLogin) }}</div>
                <div v-if="row.lastLogin" class="date-relative">
                  {{ getRelativeTime(row.lastLogin) }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="Member Since" width="180">
          <template #default="{ row }">
            <div class="date-info-enhanced">
              <el-icon class="date-icon"><Calendar /></el-icon>
              <div class="date-content">
                <div class="date-main">{{ formatDate(row.createdAt, true) }}</div>
                <div class="date-relative">
                  {{ getRelativeTime(row.createdAt) }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="220" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons-enhanced">
              <el-tooltip
                v-if="!canChangeRole(row)"
                content="You don't have permission to change this user's role"
                placement="top"
              >
                <span>
                  <el-button 
                    type="primary" 
                    size="small" 
                    :icon="UserCog" 
                    disabled
                    class="action-btn"
                  >
                    Change Role
                  </el-button>
                </span>
              </el-tooltip>
              <el-button
                v-else
                type="primary"
                size="small"
                :icon="UserCog"
                @click="openRoleDialog(row)"
                class="action-btn change-role-btn"
              >
                Change Role
              </el-button>

              <el-button
                type="default"
                size="small"
                :icon="Shield"
                @click="viewUserPermissions(row)"
                class="action-btn permissions-btn"
                :disabled="!canViewPermissions(row)"
              >
                Permissions
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Enhanced Pagination -->
      <div class="pagination-container-enhanced">
        <div class="pagination-info">
          Showing {{ showingStart }}-{{ showingEnd }} of {{ totalUsers }} users
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalUsers"
          layout="sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="enhanced-pagination"
        />
      </div>
    </el-card>

    <!-- Enhanced Role Change Dialog -->
    <el-dialog
      v-model="roleDialogVisible"
      title="Change User Role"
      width="600px"
      :before-close="handleDialogClose"
      class="role-dialog-enhanced"
    >
      <div v-if="selectedUser" class="role-dialog-content-enhanced">
        <div class="user-summary-enhanced">
          <div class="user-avatar-enhanced large" :class="getUserStatusClass(selectedUser)">
            {{ selectedUser.name.charAt(0).toUpperCase() }}
            <div class="status-indicator" :class="{ active: selectedUser.isActive }"></div>
          </div>
          <div class="user-info-details-enhanced">
            <h3>{{ selectedUser.name }}</h3>
            <p class="user-contact-info">
              <el-icon><Phone /></el-icon>
              {{ toLocalPhone(selectedUser.phone) }}
            </p>
            <div class="current-role-section">
              <span class="current-role-label">Current Role:</span>
              <el-tag :type="getRoleTagType(selectedUser.role)" size="small" effect="dark">
                {{ getRoleDisplayName(selectedUser.role) }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-divider class="custom-divider" />

        <div class="role-selection-enhanced">
          <label class="form-label-enhanced">Select New Role</label>
          <div class="role-options-grid">
            <div
              v-for="role in getAvailableRoles(selectedUser)"
              :key="role.value"
              class="role-option-card"
              :class="{
                'selected': newRole === role.value,
                'disabled': role.disabled
              }"
              @click="!role.disabled && (newRole = role.value)"
            >
              <div class="role-option-header">
                <el-radio 
                  v-model="newRole" 
                  :value="role.value" 
                  :disabled="role.disabled"
                  class="role-radio"
                />
                <div class="role-title">
                  <span class="role-name">{{ role.label }}</span>
                  <el-tag 
                    :type="getRoleTagType(role.value)" 
                    size="small" 
                    class="role-badge"
                  >
                    {{ role.value }}
                  </el-tag>
                </div>
              </div>
              <p class="role-description">{{ role.description }}</p>
              <div v-if="role.disabled" class="disabled-overlay">
                <el-icon><Lock /></el-icon>
                <span>Not permitted</span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="newRole && newRole !== selectedUser.role"
          class="permission-preview-enhanced"
        >
          <el-divider class="custom-divider" />
          <label class="form-label-enhanced">New Role Permissions Preview</label>
          <div class="permissions-preview-content">
            <div class="permissions-count">
              {{ (rolePermissions[newRole] || []).length }} permissions
            </div>
            <div class="permissions-grid-enhanced">
              <el-tag
                v-for="permission in rolePermissions[newRole] || []"
                :key="permission"
                size="small"
                class="permission-tag-enhanced"
                effect="plain"
              >
                {{ formatPermissionName(permission) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer-enhanced">
          <el-button @click="handleDialogClose" size="large" class="cancel-btn">
            Cancel
          </el-button>
          <el-button
            type="primary"
            @click="confirmRoleChange"
            :loading="updating"
            :disabled="!newRole || newRole === selectedUser?.role"
            size="large"
            class="confirm-btn"
          >
            <template #loading>
              <el-icon class="is-loading"><Loading /></el-icon>
              Updating...
            </template>
            Confirm Role Change
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Enhanced User Permissions Dialog -->
    <el-dialog
      v-model="permissionsDialogVisible"
      title="User Permissions"
      width="800px"
      class="permissions-dialog-enhanced"
    >
      <div v-if="selectedUser" class="permissions-dialog-content-enhanced">
        <div class="user-summary-enhanced">
          <div class="user-avatar-enhanced large" :class="getUserStatusClass(selectedUser)">
            {{ selectedUser.name.charAt(0).toUpperCase() }}
            <div class="status-indicator" :class="{ active: selectedUser.isActive }"></div>
          </div>
          <div class="user-info-details-enhanced">
            <h3>{{ selectedUser.name }}</h3>
            <p class="user-contact-info">
              <el-icon><Phone /></el-icon>
              {{ toLocalPhone(selectedUser.phone) }}
            </p>
            <div class="current-role-section">
              <span class="current-role-label">Role:</span>
              <el-tag :type="getRoleTagType(selectedUser.role)" size="small" effect="dark">
                {{ getRoleDisplayName(selectedUser.role) }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-divider class="custom-divider" />

        <div class="permissions-content-enhanced">
          <div
            v-if="selectedUser.role === 'superadmin'"
            class="superadmin-notice-enhanced"
          >
            <el-alert
              title="Super Administrator Access"
              type="success"
              description="This user has full system access with all available permissions and can manage all aspects of the system."
              show-icon
              :closable="false"
              class="superadmin-alert"
            />
          </div>
          <div v-else>
            <div class="permissions-header">
              <h4>Role Permissions Overview</h4>
              <div class="permissions-summary">
                <el-tag type="info" size="small">
                  {{ userPermissions.length }} total permissions
                </el-tag>
              </div>
            </div>
            
            <div v-if="userPermissions.length === 0" class="no-permissions-enhanced">
              <el-empty 
                description="No permissions assigned to this role" 
                :image-size="100"
              >
                <el-button type="primary" @click="openRoleDialog(selectedUser)">
                  Assign Permissions
                </el-button>
              </el-empty>
            </div>
            <div v-else class="permissions-by-module-enhanced">
              <div
                v-for="(permissions, module) in groupedUserPermissions"
                :key="module"
                class="module-permissions-enhanced"
              >
                <div class="module-header">
                  <h4 class="module-title">{{ formatModuleName(module) }}</h4>
                  <el-tag type="info" size="small">
                    {{ permissions.length }} permissions
                  </el-tag>
                </div>
                <div class="permission-list-enhanced">
                  <div
                    v-for="permission in permissions"
                    :key="permission.name"
                    class="permission-item"
                  >
                    <el-icon class="permission-icon"><Check /></el-icon>
                    <span class="permission-name">{{ permission.displayName }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { 
  UserCog, 
  Shield, 
  RefreshCcw, 
  Search, 
  Clock, 
  Calendar,
  Phone,
  Message,
  Star,
  Setting,
  Lock,
  Check,
  Loading
} from "lucide-vue-next";
import api from "@/utils/api";
import { usePermissions } from "@/composables/usePermissions";
import { useAuthStore } from "@/stores/auth";
import { toLocalPhone, formatDate, getRelativeTime } from "@/utils/formatters";

// Stores and permissions
const authStore = useAuthStore();
const { canManageUsers, isSuperAdmin } = usePermissions();

// State
const loading = ref(false);
const updating = ref(false);
const users = ref([]);
const searchQuery = ref("");
const selectedRole = ref("");
const selectedStatus = ref("");
const currentPage = ref(1);
const pageSize = ref(20);
const totalUsers = ref(0);

// Dialog states
const roleDialogVisible = ref(false);
const permissionsDialogVisible = ref(false);
const selectedUser = ref(null);
const newRole = ref("");
const userPermissions = ref([]);
const rolePermissions = ref({});

// Computed properties
const availableRoles = computed(() => [
  { label: "User", value: "user" },
  { label: "Cashier", value: "cashier" },
  { label: "Admin", value: "admin" },
  { label: "Super Admin", value: "superadmin" },
]);

const activeUsersCount = computed(() => {
  return users.value.filter(user => user.isActive).length;
});

const filteredUsers = computed(() => {
  let filtered = users.value;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.name.toLowerCase().includes(query) || 
        user.phone.includes(query) ||
        (user.email && user.email.toLowerCase().includes(query))
    );
  }

  // Role filter
  if (selectedRole.value) {
    filtered = filtered.filter((user) => user.role === selectedRole.value);
  }

  // Status filter
  if (selectedStatus.value) {
    filtered = filtered.filter((user) => 
      selectedStatus.value === 'active' ? user.isActive : !user.isActive
    );
  }

  return filtered;
});

const groupedUserPermissions = computed(() => {
  const grouped = {};
  userPermissions.value.forEach((permission) => {
    if (!grouped[permission.module]) {
      grouped[permission.module] = [];
    }
    grouped[permission.module].push(permission);
  });
  return grouped;
});

const showingStart = computed(() => {
  return (currentPage.value - 1) * pageSize.value + 1;
});

const showingEnd = computed(() => {
  return Math.min(currentPage.value * pageSize.value, totalUsers.value);
});

// Methods
const loadUsers = async () => {
  loading.value = true;
  try {
    const response = await api.get("/users", {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
        includeDeleted: false,
      },
    });

    if (response.data && response.data.success) {
      const userData = response.data.data;
      users.value = userData.users || userData || [];
      totalUsers.value = userData.total || userData.length || users.value.length;
    } else {
      users.value = Array.isArray(response.data) ? response.data : [];
      totalUsers.value = users.value.length;
    }

    if (users.value.length === 0) {
      ElMessage.info("No users found");
    }
  } catch (error) {
    console.error("Error loading users:", error);
    ElMessage({
      message: `Failed to load users: ${error.response?.data?.message || error.message}`,
      type: "error",
      duration: 5000,
    });
    users.value = [];
    totalUsers.value = 0;
  } finally {
    loading.value = false;
  }
};

const loadRolePermissions = async () => {
  try {
    const response = await api.get("/permissions/roles");
    if (response.data.success) {
      rolePermissions.value = {};
      Object.entries(response.data.data).forEach(([role, data]) => {
        rolePermissions.value[role] = data.permissions || [];
      });
    }
  } catch (error) {
    console.error("Error loading role permissions:", error);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleRoleFilter = () => {
  currentPage.value = 1;
};

const handleStatusFilter = () => {
  currentPage.value = 1;
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadUsers();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadUsers();
};

const getRoleTagType = (role) => {
  switch (role) {
    case "superadmin":
      return "danger";
    case "admin":
      return "warning";
    case "cashier":
      return "success";
    case "user":
      return "info";
    default:
      return "info";
  }
};

const getRoleDisplayName = (role) => {
  switch (role) {
    case "superadmin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "cashier":
      return "Cashier";
    case "user":
      return "User";
    default:
      return role;
  }
};

const getUserStatusClass = (user) => {
  return user.isActive ? 'status-active' : 'status-inactive';
};

const canChangeRole = (user) => {
  if (!authStore?.user) return false;
  if (user._id === authStore.user._id || user.phone === authStore.user.phone) {
    return false;
  }
  if (isSuperAdmin.value) return true;
  if (canManageUsers.value) return user.role === "user";
  return false;
};

const canViewPermissions = (user) => {
  return isSuperAdmin.value || canManageUsers.value;
};

const getAvailableRoles = (user) => {
  return [
    {
      value: "user",
      label: "User",
      description: "Regular user with basic access and no administrative privileges",
      disabled: false,
    },
    {
      value: "cashier",
      label: "Cashier",
      description: "Cashier with ticketing and POS permissions",
      disabled: !isSuperAdmin.value && user.role !== "user",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Administrator with management permissions for users and content",
      disabled: !isSuperAdmin.value && user.role !== "user",
    },
    {
      value: "superadmin",
      label: "Super Admin",
      description: "Full system access with all permissions and administrative rights",
      disabled: !isSuperAdmin.value,
    },
  ];
};

const openRoleDialog = (user) => {
  selectedUser.value = { ...user };
  newRole.value = user.role;
  roleDialogVisible.value = true;
};

const handleDialogClose = () => {
  selectedUser.value = null;
  newRole.value = "";
  roleDialogVisible.value = false;
};

const confirmRoleChange = async () => {
  if (!selectedUser.value || !newRole.value || newRole.value === selectedUser.value.role) {
    ElMessage.warning("Please select a different role");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `Change ${selectedUser.value.name}'s role from ${getRoleDisplayName(
        selectedUser.value.role
      )} to ${getRoleDisplayName(newRole.value)}?`,
      "Confirm Role Change",
      {
        confirmButtonText: "Change Role",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );

    updating.value = true;
    const response = await api.put(`/users/${selectedUser.value._id}`, {
      role: newRole.value,
    });

    if (response.data && response.data.success) {
      ElMessage({
        message: `Successfully changed ${selectedUser.value.name}'s role to ${getRoleDisplayName(newRole.value)}`,
        type: "success",
        duration: 3000,
      });

      const userIndex = users.value.findIndex(
        (u) => u._id === selectedUser.value._id
      );
      if (userIndex !== -1) {
        users.value[userIndex].role = newRole.value;
        users.value[userIndex].updatedAt = new Date().toISOString();
      }

      handleDialogClose();
      setTimeout(() => {
        loadUsers();
      }, 1000);
    } else {
      throw new Error(response.data?.message || "Unknown error occurred");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("Error updating user role:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update user role";
      ElMessage({
        message: errorMessage,
        type: "error",
        duration: 5000,
      });
    }
  } finally {
    updating.value = false;
  }
};

const viewUserPermissions = async (user) => {
  selectedUser.value = { ...user };

  if (user.role === "superadmin") {
    userPermissions.value = [];
    permissionsDialogVisible.value = true;
    return;
  }

  try {
    const response = await api.get(`/permissions/roles/${user.role}`);
    if (response.data.success) {
      userPermissions.value = response.data.data.permissionDetails || [];
    }
  } catch (error) {
    console.error("Error loading user permissions:", error);
    ElMessage.error("Failed to load user permissions");
  }

  permissionsDialogVisible.value = true;
};

const formatPermissionName = (permission) => {
  return permission
    .replace(/\./g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatModuleName = (module) => {
  return module.charAt(0).toUpperCase() + module.slice(1).replace(/([A-Z])/g, ' $1');
};

// Watchers
watch([currentPage, pageSize], () => {
  loadUsers();
});

// Lifecycle
onMounted(() => {
  loadUsers();
  loadRolePermissions();
});
</script>

<style scoped>
.user-roles-container {
  padding: 0;
  background: #f8fafc;
  min-height: 100vh;
}

/* Enhanced Header */
.page-header {
  margin-bottom: 0;
}

.header-background {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  padding: 16px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.title-icon {
  font-size: 32px;
  color: white;
}

.title-text h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
}

.title-text .page-description {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
}

.header-stats {
  display: flex;
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.2);
  padding: 16px 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  text-align: center;
  min-width: 120px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* Enhanced Filters */
.filter-card {
  margin: -20px 24px 24px 24px;
  border-radius: 16px;
  border: none;
  background: white;
}

.filters-container {
  display: flex;
  gap: 24px;
  align-items: end;
  flex-wrap: wrap;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  color: var(--el-color-primary);
}

.filters-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* Enhanced Table */
.table-card {
  margin: 0 24px 24px 24px;
  border-radius: 16px;
  border: none;
}

.card-header-enhanced {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.refresh-btn {
  border-radius: 8px;
}

.enhanced-table {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.table-header th) {
  background: #f8fafc !important;
  color: #64748b;
  font-weight: 600;
  padding: 16px 12px;
}

/* Enhanced User Info */
.user-info-enhanced {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-enhanced {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
  position: relative;
}

.user-avatar-enhanced.status-inactive {
  background: linear-gradient(135deg, #a0aec0 0%, #718096 100%);
}

.user-avatar-enhanced.large {
  width: 80px;
  height: 80px;
  font-size: 32px;
  border-radius: 20px;
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #e2e8f0;
  border: 2px solid white;
}

.status-indicator.active {
  background: #48bb78;
}

.user-details-enhanced .user-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.user-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.contact-icon {
  font-size: 12px;
}

.user-email {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 12px;
}

/* Enhanced Role Tags */
.role-tag-enhanced {
  font-weight: 600;
  border-radius: 6px;
}

.tag-icon {
  margin-right: 4px;
}

/* Enhanced Status Badges */
.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  width: fit-content;
}

.status-badge.active {
  background: #f0fff4;
  color: #38a169;
}

.status-badge.inactive {
  background: #fff5f5;
  color: #e53e3e;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-badge.active .status-dot {
  background: #48bb78;
}

.status-badge.inactive .status-dot {
  background: #f56565;
}

/* Enhanced Date Info */
.date-info-enhanced {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-icon {
  color: #a0aec0;
  font-size: 14px;
}

.date-content {
  display: flex;
  flex-direction: column;
}

.date-main {
  font-size: 13px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.date-relative {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* Enhanced Action Buttons */
.action-buttons-enhanced {
  display: flex;
  gap: 8px;
}

.action-btn {
  border-radius: 6px;
  font-weight: 500;
}

.change-role-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.permissions-btn {
  border-color: #e2e8f0;
  color: #64748b;
}

/* Enhanced Pagination */
.pagination-container-enhanced {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.enhanced-pagination {
  margin: 0;
}

/* Enhanced Dialogs */
.role-dialog-enhanced :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.role-dialog-enhanced :deep(.el-dialog__header) {
  background: #f8fafc;
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #e2e8f0;
}

.role-dialog-enhanced :deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 600;
}

.role-dialog-content-enhanced {
  padding: 0;
}

.user-summary-enhanced {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 24px 0;
}

.user-info-details-enhanced h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.user-contact-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  color: var(--el-text-color-regular);
}

.current-role-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-role-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.custom-divider {
  margin: 24px 0;
}

/* Enhanced Role Selection */
.role-selection-enhanced {
  padding: 0 24px;
}

.form-label-enhanced {
  display: block;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
  font-size: 16px;
}

.role-options-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-option-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.role-option-card:hover {
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.role-option-card.selected {
  border-color: var(--el-color-primary);
  background: #f0f4ff;
}

.role-option-card.disabled {
  background: #f7fafc;
  border-color: #e2e8f0;
  cursor: not-allowed;
  opacity: 0.6;
}

.role-option-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.role-radio :deep(.el-radio__input) {
  margin-right: 0;
}

.role-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.role-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 16px;
}

.role-badge {
  font-size: 11px;
  font-weight: 600;
}

.role-description {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.5;
  margin-left: 32px;
}

.disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(247, 250, 252, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #a0aec0;
  font-weight: 500;
  border-radius: 12px;
}

/* Enhanced Permission Preview */
.permission-preview-enhanced {
  padding: 0 24px;
}

.permissions-preview-content {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
}

.permissions-count {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 12px;
  font-weight: 500;
}

.permissions-grid-enhanced {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag-enhanced {
  background: white;
  border: 1px solid #e2e8f0;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

/* Enhanced Dialog Footer */
.dialog-footer-enhanced {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  border-radius: 8px;
  padding: 12px 24px;
}

.confirm-btn {
  border-radius: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

/* Enhanced Permissions Dialog */
.permissions-dialog-enhanced :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.permissions-dialog-enhanced :deep(.el-dialog__header) {
  background: #f8fafc;
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #e2e8f0;
}

.permissions-dialog-content-enhanced {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0;
}

.permissions-content-enhanced {
  padding: 0 24px 24px;
}

.superadmin-notice-enhanced {
  margin: 16px 0;
}

.superadmin-alert :deep(.el-alert__description) {
  line-height: 1.5;
}

.permissions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.permissions-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.no-permissions-enhanced {
  text-align: center;
  padding: 40px 20px;
}

.permissions-by-module-enhanced {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.module-permissions-enhanced {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  background: white;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.module-title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.permission-list-enhanced {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.permission-icon {
  color: #48bb78;
  font-size: 14px;
}

.permission-name {
  font-size: 14px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-main {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .filters-container {
    flex-direction: column;
  }
  
  .search-section,
  .filters-group {
    width: 100%;
  }
  
  .filters-group {
    flex-direction: column;
  }
  
  .pagination-container-enhanced {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .permission-list-enhanced {
    grid-template-columns: 1fr;
  }
  
  .user-summary-enhanced {
    flex-direction: column;
    text-align: center;
  }
  
  .role-option-card {
    padding: 16px;
  }
  
  .role-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 0 16px;
  }
  
  .filter-card,
  .table-card {
    margin: -20px 16px 16px 16px;
  }
  
  .stat-card {
    min-width: 100px;
    padding: 12px 16px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}
</style>