<template>
  <div class="user-list">
    <div class="page-header">
      <h2>{{ $t("users.title") }}</h2>
      <el-button type="primary" @click="$router.push('/admin/users/create')">
        <el-icon><Plus /></el-icon>
        {{ $t("users.addUser") }}
      </el-button>
    </div>

    <el-card>
      <div class="toolbar">
        <el-input
          v-model="searchText"
          :placeholder="$t('users.searchUsers')"
          class="search-input"
          :prefix-icon="Search"
          clearable
          @input="debouncedSearch"
        />
        <el-select
          v-model="statusFilter"
          :placeholder="$t('users.filterByStatus')"
          clearable
        >
          <el-option :label="$t('table.selectAll')" value="" />
          <el-option :label="$t('users.active')" value="active" />
          <el-option :label="$t('users.inactive')" value="inactive" />
        </el-select>
      </div>

      <el-table
        :data="users"
        v-loading="loading"
        style="width: 100%"
        :empty-text="$t('messages.noData')"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <!-- <el-table-column prop="id" label="ID" width="80" /> -->
        <el-table-column prop="name" :label="$t('users.name')" />
        <el-table-column prop="phone" :label="$t('users.phone')" />
        <el-table-column prop="role" :label="$t('users.role')" width="150">
          <template #default="{ row }">
            <el-tag
              :type="
                row.role === 'admin' || row.role === 'superadmin'
                  ? 'warning'
                  : 'info'
              "
            >
              {{ $t(`users.${row.role}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('users.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ $t(`users.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_at"
          :label="$t('users.created')"
          width="120"
        >
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('users.actions')" width="140">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="medium"
              link
              @click="editUser(row.id)"
            >
              {{ $t("users.edit") }}
            </el-button>
            <el-button
              type="danger"
              size="medium"
              link
              @click="deleteUser(row.id)"
            >
              {{ $t("users.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Bulk Actions -->
      <div class="bulk-actions" v-if="selectedUsers.length > 0">
        <el-button type="danger" @click="bulkDeleteUsers">
          {{ $t("users.deleteSelected") }} ({{ selectedUsers.length }})
        </el-button>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :small="false"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { userService } from "@/services/userService";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { debounce } from "lodash-es"; // You may need to install lodash-es

const router = useRouter();
const appStore = useAppStore();

// Reactive data
const loading = ref(false);
const searchText = ref("");
const statusFilter = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const users = ref([]);
const selectedUsers = ref([]);
const { t } = useI18n();

// Debounced search function
const debouncedSearch = debounce(() => {
  currentPage.value = 1; // Reset to first page when searching
  loadUsers();
}, 500);

// Watch for filter changes
watch([statusFilter], () => {
  currentPage.value = 1;
  loadUsers();
});

// Load users from API
const loadUsers = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      per_page: pageSize.value,
      search: searchText.value || undefined,
      status: statusFilter.value || undefined,
    };

    const response = await userService.getUsers(params);

    // Handle different response formats
    if (response.data) {
      users.value = response.data;
      total.value = response.total || response.meta?.total || 0;
    } else {
      users.value = response;
      total.value = response.length;
    }
  } catch (error) {
    console.error("Failed to load users:", error);
    ElMessage.error("Failed to load users");
    // Keep existing data if error occurs
  } finally {
    loading.value = false;
  }
};

// Handle pagination changes
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  loadUsers();
};

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  loadUsers();
};

// Handle table selection
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection;
};

// Edit user
const editUser = (id) => {
  router.push(`/admin/users/${id}/edit`);
};

// Delete single user
const deleteUser = async (id) => {
  try {
    await ElMessageBox.confirm(
      "Are you sure you want to delete this user?",
      "Delete User",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );

    await userService.deleteUser(id);
    ElMessage.success("User deleted successfully");

    // Reload users or remove from local array
    if (users.value.length === 1 && currentPage.value > 1) {
      currentPage.value--;
    }
    loadUsers();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to delete user:", error);
    }
  }
};

// Bulk delete users
const bulkDeleteUsers = async () => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete ${selectedUsers.value.length} users?`,
      "Delete Users",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );

    const userIds = selectedUsers.value.map((user) => user.id);
    await userService.bulkDeleteUsers(userIds);

    ElMessage.success(
      `${selectedUsers.value.length} users deleted successfully`
    );
    selectedUsers.value = [];
    loadUsers();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to delete users:", error);
    }
  }
};

// Format date utility
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

// Initialize component
onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("users.title"), path: "/admin/users" },
  ]);

  loadUsers();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.search-input {
  width: 300px;
}

.bulk-actions {
  margin: 16px 0;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

/* Loading state */
.el-table__empty-text {
  color: #909399;
}

/* Selection highlighting */
:deep(.el-table__row.current-row) {
  background-color: #ecf5ff;
}
</style>
