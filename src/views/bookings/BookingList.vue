<template>
  <div class="booking-list">
    <!-- Page Header -->
    <div class="page-header">
      <h2>{{ $t("bookings.title") }}</h2>
    </div>

    <!-- Filters -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item :label="$t('common.search')">
          <el-input
              v-model="filters.search"
              :placeholder="$t('bookings.searchPlaceholder')"
              clearable
              @keyup.enter="handleFilterChange"
              @clear="handleFilterChange"
          />
        </el-form-item>
        <el-form-item :label="$t('bookings.bookingStatus')">
          <el-select v-model="filters.booking_status" clearable @change="handleFilterChange">
            <el-option
                v-for="status in bookingStatusOptions"
                :key="status.value"
                :label="status.label"
                :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bookings.paymentStatus')">
          <el-select v-model="filters.payment_status" clearable @change="handleFilterChange">
            <el-option
                v-for="status in paymentStatusOptions"
                :key="status.value"
                :label="status.label"
                :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('showtimes.title')">
          <el-select
              v-model="filters.showtime_id"
              filterable
              remote
              reserve-keyword
              :remote-method="loadShowtimes"
              clearable
              :placeholder="$t('seats.selectShowtime')"
              @change="handleFilterChange"
              style="width: 300px"
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
        <el-form-item :label="$t('common.dateRange')">
          <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="-"
              :start-placeholder="$t('common.startDate')"
              :end-placeholder="$t('common.endDate')"
              @change="handleFilterChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilters">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Bookings Table -->
    <el-card shadow="never">
      <el-table :data="bookings" v-loading="loading.bookings" style="width: 100%">
        <el-table-column prop="reference_code" :label="$t('bookings.referenceCode')" width="180"/>
        <el-table-column :label="$t('users.title')" width="250">
            <template #default="{ row }">
                <div>{{ row.user.username }}</div>
                <small class="text-muted">{{ row.user.email }}</small>
            </template>
        </el-table-column>
        <el-table-column :label="$t('movies.title')" width="200">
            <template #default="{ row }">{{ row.movie.title }}</template>
        </el-table-column>
        <el-table-column :label="$t('showtimes.details')" width="200">
            <template #default="{ row }">
                <div>{{ row.hall.hall_name }}</div>
                <small class="text-muted">{{ row.showtime.show_date }} {{ row.showtime.start_time }}</small>
            </template>
        </el-table-column>
        <el-table-column prop="seat_count" :label="$t('bookings.seatCount')" width="100" />
        <el-table-column prop="total_price" :label="$t('bookings.totalPrice')" width="120">
             <template #default="{ row }">{{ formatCurrency(row.total_price) }}</template>
        </el-table-column>
        <el-table-column :label="$t('bookings.bookingStatus')" width="140">
            <template #default="{ row }">
                <el-tag :color="getStatusColor(bookingStatusOptions, row.booking_status)" effect="dark" style="border: none;">
                    {{ row.booking_status_display }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column :label="$t('bookings.paymentStatus')" width="140">
            <template #default="{ row }">
                <el-tag :color="getStatusColor(paymentStatusOptions, row.payment_status)" effect="dark" style="border: none;">
                    {{ row.payment_status_display }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column :label="$t('common.actions')" fixed="right" width="150">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewBooking(row.id)">{{ $t('actions.view') }}</el-button>
            <el-button link type="primary" size="small" @click="openEditDialog(row)">{{ $t('actions.edit') }}</el-button>
            <el-button link type="danger" size="small" @click="deleteBooking(row.id)">{{ $t('actions.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper" v-if="pagination.total > 0">
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
    
    <!-- Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="$t('bookings.editBooking')" width="500px">
        <el-form :model="editForm" label-position="top">
            <el-form-item :label="$t('bookings.bookingStatus')">
                <el-select v-model="editForm.booking_status" style="width: 100%;">
                    <el-option v-for="status in bookingStatusOptions" :key="status.value" :label="status.label" :value="status.value" />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('bookings.paymentStatus')">
                <el-select v-model="editForm.payment_status" style="width: 100%;">
                    <el-option v-for="status in paymentStatusOptions" :key="status.value" :label="status.label" :value="status.value" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="dialogVisible = false">{{ $t('actions.cancel') }}</el-button>
            <el-button type="primary" @click="handleUpdate" :loading="loading.edit">
                {{ $t('actions.update') }}
            </el-button>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { bookingService } from '@/services/bookingService';
import { showtimeService } from '@/services/showtimeService';
import { useAppStore } from '@/stores/app';

const { t } = useI18n();
const router = useRouter();
const appStore = useAppStore();

const loading = reactive({
  bookings: false,
  showtimes: false,
  edit: false,
});
const bookings = ref([]);
const showtimeOptions = ref([]);

const filters = reactive({
  search: '',
  booking_status: '',
  payment_status: '',
  showtime_id: '',
  dateRange: [],
});

const pagination = reactive({
  current_page: 1,
  per_page: 10,
  total: 0,
});

const dialogVisible = ref(false);
const editForm = reactive({
  id: null,
  booking_status: '',
  payment_status: '',
});

const bookingStatusOptions = bookingService.BOOKING_STATUSES;
const paymentStatusOptions = bookingService.PAYMENT_STATUSES;

const loadBookings = async () => {
  loading.bookings = true;
  try {
    const params = {
      page: pagination.current_page,
      limit: pagination.per_page,
      search: filters.search,
      booking_status: filters.booking_status,
      payment_status: filters.payment_status,
      showtime_id: filters.showtime_id,
      date_from: filters.dateRange?.[0] ? new Date(filters.dateRange[0]).toISOString() : undefined,
      date_to: filters.dateRange?.[1] ? new Date(filters.dateRange[1]).toISOString() : undefined,
    };
    const response = await bookingService.getBookings(params);
    bookings.value = response.data;
    Object.assign(pagination, {
      total: response.total,
      current_page: response.current_page,
      per_page: response.per_page,
    });
  } catch (error) {
    ElMessage.error(t('errors.loadDataFailed'));
    console.error(error);
  } finally {
    loading.bookings = false;
  }
};

const loadShowtimes = async (query = '') => {
  loading.showtimes = true;
  try {
    showtimeOptions.value = await showtimeService.getDropdownShowtimes(query, 50);
  } catch (error) {
    console.error("Failed to load showtimes:", error);
  } finally {
    loading.showtimes = false;
  }
};

const handleFilterChange = () => {
  pagination.current_page = 1;
  loadBookings();
};

const resetFilters = () => {
  Object.assign(filters, {
    search: '',
    booking_status: '',
    payment_status: '',
    showtime_id: '',
    dateRange: [],
  });
  loadBookings();
};

const handleSizeChange = (size) => {
  pagination.per_page = size;
  pagination.current_page = 1;
  loadBookings();
};

const handleCurrentChange = (page) => {
  pagination.current_page = page;
  loadBookings();
};

const viewBooking = (id) => {
  router.push({ name: 'BookingDetail', params: { id } });
};

const openEditDialog = (booking) => {
  editForm.id = booking.id;
  editForm.booking_status = booking.booking_status;
  editForm.payment_status = booking.payment_status;
  dialogVisible.value = true;
};

const handleUpdate = async () => {
    loading.edit = true;
    try {
        await bookingService.updateBooking(editForm.id, {
            booking_status: editForm.booking_status,
            payment_status: editForm.payment_status,
        });
        ElMessage.success(t('bookings.updateSuccess'));
        dialogVisible.value = false;
        await loadBookings();
    } catch (error) {
        ElMessage.error(t('errors.updateFailed'));
        console.error(error);
    } finally {
        loading.edit = false;
    }
};

const deleteBooking = async (id) => {
  try {
    await ElMessageBox.confirm(t('bookings.confirmDelete'), t('common.warning'), {
      confirmButtonText: t('actions.delete'),
      cancelButtonText: t('actions.cancel'),
      type: 'warning',
    });
    await bookingService.deleteBooking(id);
    ElMessage.success(t('bookings.deleteSuccess'));
    await loadBookings();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('errors.deleteFailed'));
      console.error(error);
    }
  }
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const getStatusColor = (options, status) => {
    const option = options.find(opt => opt.value === status);
    return option ? option.color : '#909399';
};

onMounted(() => {
  loadBookings();
  loadShowtimes(); // Load initial showtimes
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("bookings.title"), path: "/admin/bookings" },
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
  margin-bottom: 20px;
}
.filter-form {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.text-muted {
  color: #909399;
}
</style>