<template>
  <div class="seats-list">
    <!-- Page Header -->
    <div class="page-header">
      <h2>{{ $t("seats.title") }}</h2>
      <el-button
        type="primary"
        :icon="Plus"
        @click="$router.push('/admin/seats/create')"
        v-if="authStore.isAdmin"
      >
        {{ $t("seats.addSeat") }}
      </el-button>
    </div>

    <!-- Filters and Search -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filters" :inline="true" class="filter-form">
        <el-form-item>
          <el-input
            v-model="filters.search"
            :placeholder="$t('seats.searchSeats')"
            :prefix-icon="Search"
            clearable
            @keyup.enter="loadSeats"
            @clear="loadSeats"
          />
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="filters.seat_type"
            :placeholder="$t('seats.filterByType')"
            clearable
          >
            <el-option
              v-for="type in seatTypes"
              :key="type.value"
              :label="$t(`seats.types.${type.value}`)"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="filters.status"
            :placeholder="$t('seats.filterByStatus')"
            clearable
          >
            <el-option
              v-for="status in seatStatuses"
              :key="status.value"
              :label="$t(`seats.statuses.${status.value}`)"
              :value="status.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="filters.is_available"
            :placeholder="$t('seats.filterByAvailability')"
            clearable
          >
            <el-option :label="$t('common.available')" value="true" />
            <el-option :label="$t('common.unavailable')" value="false" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadSeats" :loading="loading">
            {{ $t("actions.search") }}
          </el-button>
          <el-button @click="resetFilters">
            {{ $t("actions.reset") }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Seats Table -->
    <el-card shadow="never">
      <el-table
        :data="seats"
        v-loading="loading"
        :element-loading-text="$t('common.loading')"
        :empty-text="$t('messages.noData')"
        row-key="id"
      >
        <el-table-column
          prop="seat_identifier"
          :label="$t('seats.indentifier')"
          width="150"
        />

        <el-table-column prop="row" :label="$t('seats.row')" width="80" />

        <el-table-column
          prop="seat_number"
          :label="$t('seats.seatNumber')"
          width="120"
        />

        <el-table-column prop="seat_type" :label="$t('seats.type')" width="120">
          <template #default="{ row }">
            <el-tag :type="getSeatTypeColor(row.seat_type)">
              {{ $t(`seats.types.${row.seat_type}`) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" :label="$t('seats.status')" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ $t(`seats.statuses.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="is_available"
          :label="$t('seats.availability')"
          width="160"
        >
          <template #default="{ row }">
            <el-tag :type="row.is_available ? 'success' : 'danger'">
              {{
                row.is_available
                  ? $t("seats.available")
                  : $t("seats.unavailable")
              }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="price" :label="$t('seats.price')" width="100">
          <template #default="{ row }">
            ${{ row.price?.toFixed(2) || "0.00" }}
          </template>
        </el-table-column>

        <!-- <el-table-column
          prop="theater_id"
          :label="$t('seats.theaterId')"
          width="120"
        >
          <template #default="{ row }">
            {{ row.theater_id || "-" }}
          </template>
        </el-table-column> -->

        <el-table-column
          prop="created_at"
          :label="$t('seats.created')"
          width="150"
        >
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('seats.actions')"
          width="250"
          fixed="right"
          v-if="authStore.isAdmin"
        >
          <template #default="{ row }">
            <div class="flex gap-1">
              <el-button type="primary" size="small" @click="editSeat(row.id)">
                {{ $t("actions.edit") }}
              </el-button>

              <el-dropdown @command="handleCommand" trigger="click">
                <el-button type="info" size="small">
                  {{ $t("actions.more") }}
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="`status:${row.id}`">
                      {{ $t("seats.updateStatus") }}
                    </el-dropdown-item>
                    <el-dropdown-item :command="`delete:${row.id}`" divided>
                      <span style="color: #f56c6c">{{
                        $t("actions.delete")
                      }}</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current_page"
          v-model:page-size="pagination.per_page"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Status Update Dialog -->
    <el-dialog
      v-model="statusDialog.visible"
      :title="$t('seats.updateStatus')"
      width="400px"
    >
      <el-form :model="statusDialog" label-width="100px">
        <el-form-item :label="$t('seats.status')">
          <el-select v-model="statusDialog.status" style="width: 100%">
            <el-option
              v-for="status in seatStatuses"
              :key="status.value"
              :label="$t(`seats.statuses.${status.value}`)"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusDialog.visible = false">
            {{ $t("actions.cancel") }}
          </el-button>
          <el-button
            type="primary"
            @click="updateSeatStatus"
            :loading="statusDialog.loading"
          >
            {{ $t("actions.update") }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search, ArrowDown } from "@element-plus/icons-vue";
import { seatService } from "@/services/seatService";
import { useAuthStore } from "@/stores/auth";
import { useAppStore } from "@/stores/app";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const appStore = useAppStore();

// Reactive data
const loading = ref(false);
const seats = ref([]);

const filters = reactive({
  search: "",
  seat_type: "",
  status: "",
  is_available: "",
  sort_by: "row",
  sort_order: "asc",
});

const pagination = reactive({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
  has_next_page: false,
  has_prev_page: false,
});

const statusDialog = reactive({
  visible: false,
  loading: false,
  seatId: null,
  status: "",
});

// Seat types and statuses
const seatTypes = ref([
  { value: "regular", label: "Regular" },
  { value: "vip", label: "VIP" },
  { value: "queen", label: "Queen" },
  { value: "couple", label: "Couple" },
]);

const seatStatuses = ref([
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "out_of_order", label: "Out of Order" },
  { value: "reserved", label: "Reserved" },
]);

// Methods
const loadSeats = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current_page,
      per_page: pagination.per_page,
    };

    const response = await seatService.getSeats(params);

    seats.value = response.data || [];
    Object.assign(pagination, {
      current_page: response.current_page || 1,
      per_page: response.per_page || 20,
      total: response.total || 0,
      total_pages: response.total_pages || 0,
      has_next_page: response.has_next_page || false,
      has_prev_page: response.has_prev_page || false,
    });
    console.log("Seats loaded:", seats.value);
  } catch (error) {
    console.error("Load seats error:", error);
    ElMessage.error(error.response?.data?.message || "Failed to load seats");
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  Object.assign(filters, {
    search: "",
    seat_type: "",
    status: "",
    is_available: "",
    sort_by: "row",
    sort_order: "asc",
  });
  pagination.current_page = 1;
  loadSeats();
};

const handleSizeChange = (val) => {
  pagination.per_page = val;
  pagination.current_page = 1;
  loadSeats();
};

const handleCurrentChange = (val) => {
  pagination.current_page = val;
  loadSeats();
};

const editSeat = (id) => {
  router.push(`/admin/seats/${id}/edit`);
};

const handleCommand = (command) => {
  const [action, id] = command.split(":");

  if (action === "status") {
    const seat = seats.value.find((s) => s.id === id);
    if (seat) {
      statusDialog.seatId = id;
      statusDialog.status = seat.status;
      statusDialog.visible = true;
    }
  } else if (action === "delete") {
    deleteSeat(id);
  }
};

const updateSeatStatus = async () => {
  statusDialog.loading = true;
  try {
    await seatService.updateSeatStatus(
      statusDialog.seatId,
      statusDialog.status
    );
    ElMessage.success(t("seats.statusUpdated"));
    statusDialog.visible = false;
    loadSeats();
  } catch (error) {
    console.error("Update seat status error:", error);
    ElMessage.error(
      error.response?.data?.message || "Failed to update seat status"
    );
  } finally {
    statusDialog.loading = false;
  }
};

const deleteSeat = async (id) => {
  try {
    await ElMessageBox.confirm(t("seats.confirmDelete"), t("actions.delete"), {
      confirmButtonText: t("actions.delete"),
      cancelButtonText: t("actions.cancel"),
      type: "warning",
    });

    await seatService.deleteSeat(id);
    ElMessage.success(t("seats.deleteSuccess"));
    loadSeats();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Delete seat error:", error);
      ElMessage.error(error.response?.data?.message || "Failed to delete seat");
    }
  }
};

const getSeatTypeColor = (type) => {
  const colors = {
    regular: "",
    vip: "warning",
    king: "danger",
    queen: "success",
    recliner: "info",
  };
  return colors[type] || "";
};

const getStatusColor = (status) => {
  const colors = {
    active: "success",
    maintenance: "warning",
    out_of_order: "danger",
    reserved: "info",
  };
  return colors[status] || "";
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

// Watchers
watch(
  [
    () => filters.search,
    () => filters.seat_type,
    () => filters.status,
    () => filters.is_available,
  ],
  () => {
    pagination.current_page = 1;
    loadSeats();
  }
);

// Lifecycle
onMounted(async () => {
  await loadSeats();

  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("seats.title"), path: "/admin/seats" },
  ]);
});
</script>

<style scoped>
.seats-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
