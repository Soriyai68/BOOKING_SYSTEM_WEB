<template>
  <div class="seats-list">
    <!-- Page Header -->
    <div class="page-header">
      <h2>{{ $t("seats.seatBooking") }}</h2>
    </div>

    <!-- Filters -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" class="filter-form">
        <el-form-item>
          <el-input
            v-model="filters.search"
            :placeholder="$t('seats.searchSeats')"
            :prefix-icon="Search"
            clearable
            @keyup.enter="loadSeatBookings"
            @clear="loadSeatBookings"
          />
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="filters.showtimeId"
            filterable
            clearable
            :placeholder="$t('seats.selectShowtime')"
            @change="handleFilterChange"
            style="width: 250px"
            :loading="loading.showtimes"
          >
            <el-option
              v-for="item in showtimeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="filters.status"
            clearable
            :placeholder="$t('seats.filterByStatus')"
            @change="handleFilterChange"
            style="min-width: 200px"
          >
            <el-option
              v-for="status in seatBookingStatus"
              :key="status.value"
              :label="$t(`seats.statuses.${status.value}`)"
              :value="status.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="filters.seat_type"
            :placeholder="$t('seats.filterByType')"
            clearable
            @change="handleFilterChange"
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
      </el-form>
    </el-card>

    <!-- Seats Table -->
    <el-card shadow="never">
      <el-table
        :data="seatBookings"
        v-loading="loading.seatBookings"
        style="width: 100%"
        :element-loading-text="$t('common.loading')"
        :empty-text="$t('messages.noData')"
        row-key="id"
      >
        <el-table-column
          prop="reference_code"
          :label="$t('bookings.referenceCode')"
          width="400"
        />
        <el-table-column :label="$t('seats.indentifier')" width="400">
          <template #default="{ row }">
            <div class="seat-tags">
              <el-tag
                v-for="seat in row.seats"
                :key="seat._id"
                size="small"
                effect="plain"
                class="seat-tag"
              >
                {{ seat.seat_identifier }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('seats.status')" width="400">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ $t(`seats.statuses.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('seats.type')" width="400">
          <template #default="{ row }">
            <div class="seat-types">
              <el-tag
                v-for="(type, index) in [
                  ...new Set(row.seats.map((s) => s.seat_type)),
                ]"
                :key="index"
                :type="getSeatTypeColor(type)"
                size="small"
                class="type-tag"
              >
                {{ $t(`seats.types.${type}`) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper" v-if="pagination.total > 0">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.perPage"
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
import { onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { showtimeService } from "@/services/showtimeService";
import { seatBookingService } from "@/services/seatBookingService";
import { useAppStore } from "@/stores/app";
import { Search } from "@element-plus/icons-vue";

const { t } = useI18n();
const router = useRouter();
const appStore = useAppStore();

// Reactive data
const loading = reactive({
  showtimes: false,
  seatBookings: false,
});
const seatBookings = ref([]);
const showtimeOptions = ref([]);
const seatTypeOptions = ref([]);

const filters = reactive({
  search: "",
  status: "",
  showtimeId: "",
  seat_type: "",
});

const seatBookingStatus = ref([
  { value: "booked", label: "Booked" },
  { value: "locked", label: "Locked" },
]);

const seatTypes = ref([
  { value: "regular", label: "Regular" },
  { value: "vip", label: "VIP" },
  { value: "queen", label: "Queen" },
  { value: "couple", label: "Couple" },
]);
const pagination = reactive({
  currentPage: 1,
  perPage: 10,
  total: 0,
  total_pages: 0,
});

// Load filter data
const loadShowtimes = async ({
  limit = 100,
  status = "scheduled",
  forBooking = true,
  search = "",
} = {}) => {
  loading.showtimes = true;
  try {
    showtimeOptions.value = await showtimeService.getDropdownShowtimes({
      limit,
      status,
      forBooking,
      search,
    });
  } catch (error) {
    console.error("Failed to load showtimes:", error);
    ElMessage.error(t("errors.loadDataFailed"));
  } finally {
    loading.showtimes = false;
  }
};
// Main data loading
const loadSeatBookings = async () => {
  loading.seatBookings = true;
  try {
    const params = {
      showtimeId: filters.showtimeId || undefined,
      search: filters.search || undefined,
      page: pagination.currentPage,
      limit: pagination.perPage,
      status: filters.status || undefined,
      seat_type: filters.seat_type || undefined,
    };
    const response = await seatBookingService.getSeatBookings(params);
    console.log(response);
    if (response.data) {
      seatBookings.value = response.data.map((sb) => ({
        id: sb.id,
        reference_code: sb.reference_code,
        status: sb.status,
        seats: sb.seats,
        phone: sb.phone,
        customer_name: sb.customer_name,
        showtime: sb.showtime,
      }));

      pagination.currentPage =
        response.current_page || response.currentPage || 1;
      pagination.perPage = response.per_page || response.limit || 10;
      pagination.total = response.total || 0;
      pagination.total_pages = response.total_pages || response.totalPages || 0;
    } else {
      seatBookings.value = [];
      Object.assign(pagination, {
        currentPage: 1,
        perPage: 10,
        total: 0,
        total_pages: 0,
      });
    }
  } catch (error) {
    console.error("Load seat bookings error:", error);
    ElMessage.error(
      error.response?.data?.message || t("errors.loadDataFailed"),
    );
    seatBookings.value = [];
    Object.assign(pagination, {
      currentPage: 1,
      perPage: 10,
      total: 0,
      total_pages: 0,
    });
  } finally {
    loading.seatBookings = false;
  }
};
const handleFilterChange = () => {
  pagination.currentPage = 1;
  loadSeatBookings();
};

// Pagination handlers
const handleSizeChange = (val) => {
  pagination.perPage = val;
  pagination.currentPage = 1;
  loadSeatBookings();
};

const handleCurrentChange = (val) => {
  pagination.currentPage = val;
  loadSeatBookings();
};

const formatCurrency = (value) => {
  if (typeof value !== "number") return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

// Color getters
const getSeatTypeColor = (type) => {
  const colors = {
    regular: "",
    vip: "warning",
    queen: "success",
    recliner: "info",
  };
  return colors[type] || "";
};

const getStatusColor = (status) => {
  const colors = {
    booked: "info",
    locked: "warning",
    available: "success",
    cancelled: "danger",
  };
  return colors[status] || "";
};
// Watchers (autoload when filters change)
watch(
  () => [filters.search, filters.status, filters.showtimeId, filters.seat_type],
  () => {
    pagination.currentPage = 1;
    loadSeatBookings();
  },
  { deep: true },
);
// Lifecycle
onMounted(async () => {
  await loadShowtimes();
  await loadSeatBookings();
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("seats.seatBooking"), path: "/admin/seat-booking" },
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
  flex-wrap: wrap;
  margin-bottom: 0;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.seat-tags,
.seat-types {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.seat-tag {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-8);
}

.type-tag {
  font-weight: 500;
}
</style>
