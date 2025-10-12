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

    <!-- Filters -->
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
            v-model="filters.row"
            :placeholder="$t('seats.filterByRow')"
            clearable
            style="min-width: 140px"
            @change="loadSeats"
          >
            <el-option
              v-for="row in availableRows"
              :key="row"
              :label="row"
              :value="row"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="filters.seat_type"
            :placeholder="$t('seats.filterByType')"
            clearable
            style="min-width: 200px"
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
            style="min-width: 200px"
          >
            <el-option
              v-for="status in seatStatuses"
              :key="status.value"
              :label="$t(`seats.statuses.${status.value}`)"
              :value="status.value"
            />
          </el-select>
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
        <el-table-column prop="price" :label="$t('seats.price')" width="100">
          <template #default="{ row }">
            ${{ row.price?.toFixed(2) || "0.00" }}
          </template>
        </el-table-column>

        <el-table-column
          prop="created_at"
          :label="$t('common.createdAt')"
          width="150"
        >
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('common.actions')"
          width="280"
          fixed="right"
          v-if="authStore.isAdmin"
        >
          <template #default="{ row }">
            <div class="flex gap-1">
              <el-button
                size="small"
                link
                type="primary"
                @click="viewSeat(row.id)"
              >
                {{ $t("actions.view") }}
              </el-button>
              <el-button
                size="small"
                link
                type="primary"
                @click="editSeat(row.id)"
              >
                {{ $t("actions.edit") }}
              </el-button>

              <el-button
                size="small"
                link
                type="danger"
                @click="deleteSeat(row.id)"
              >
                {{ $t("actions.delete") }}
              </el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";
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
const availableRows = ref([]);

const filters = reactive({
  search: "",
  seat_type: "",
  status: "",
  is_available: "",
  theater_id: "",
  hall_id: "",
  sort_by: "row",
  sort_order: "asc",
  row: "",
});

const pagination = reactive({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
  has_next_page: false,
  has_prev_page: false,
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
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
      search: filters.search || undefined,
      seat_type: filters.seat_type || undefined,
      status: filters.status || undefined,
      row: filters.row || undefined,
    };

    const response = await seatService.getSeats(params);
    seats.value = response.data || [];
    // Extract unique rows for dropdown
    availableRows.value = [
      ...new Set(seats.value.map((seat) => seat.row)),
    ].sort();

    Object.assign(pagination, {
      current_page: response.current_page || 1,
      per_page: response.per_page || 20,
      total: response.total || 0,
      total_pages: response.total_pages || 0,
      has_next_page: response.has_next_page || false,
      has_prev_page: response.has_prev_page || false,
    });
  } catch (error) {
    console.error("Load seats error:", error);
    ElMessage.error(error.response?.data?.message || "Failed to load seats");
  } finally {
    loading.value = false;
  }
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

const viewSeat = (id) => {
  router.push(`/admin/seats/${id}`);
};

const editSeat = (id) => {
  router.push(`/admin/seats/${id}/edit`);
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

// Watchers (auto load when filters change)
watch(
  [
    () => filters.search,
    () => filters.seat_type,
    () => filters.status,
    () => filters.row,
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
    { title: t("nav.dashboard",), path: "/admin/dashboard" },
    { title: t("seats.title"), path: "/admin/seats" },
    { title: t("seats.allSeats"), path: "/admin/seats" },
  ]);
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.filter-card {
  margin-bottom: 10px;
}

.filter-form {
  display: flex;
  gap: 8px;
  /* flex-wrap: wrap; */
  margin-bottom: 0;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.text-muted {
  color: #909399;
}

.flex {
  display: flex;
}

.gap-1 {
  gap: 8px;
}
</style>
