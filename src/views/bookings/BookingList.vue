<template>
  <div class="booking-list">
    <!-- Page Header -->
    <div class="page-header">
      <h2>{{ $t("bookings.title") }}</h2>
      <div>
        <el-button
          v-permission="'bookings.create'"
          type="primary"
          @click="$router.push('/admin/booking/create')"
        >
          <el-icon>
            <Plus />
          </el-icon>
          {{ $t("bookings.addBooking") }}
        </el-button>
      </div>
    </div>

    <!-- Filters -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item>
          <el-input
            v-model="filters.search"
            :placeholder="$t('bookings.searchBookings')"
            clearable
            @keyup.enter="loadBookings"
            @clear="loadBookings"
          />
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="filters.showtime_id"
            filterable
            clearable
            :placeholder="$t('seats.selectShowtime')"
            @change="handleFilterChange"
            style="width: 500px"
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
          <el-date-picker
            v-model="filters.show_date"
            type="date"
            :placeholder="$t('showtimes.showDate')"
            clearable
            style="width: 200px"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="filters.booking_status"
            clearable
            @change="handleFilterChange"
            style="width: 200px"
            :placeholder="$t('bookings.bookingStatus')"
          >
            <el-option
              v-for="status in bookingStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="filters.payment_status"
            clearable
            @change="handleFilterChange"
            style="width: 200px"
            :placeholder="$t('bookings.paymentStatus')"
          >
            <el-option
              v-for="status in paymentStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item>
          <el-date-pick
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
        </el-form-item> -->
      </el-form>
    </el-card>

    <!-- Bookings Table -->
    <el-card shadow="never">
      <el-table
        :data="bookings"
        v-loading="loading.bookings"
        style="width: 100%"
        :empty-text="$t('messages.noData')"
      >
        <el-table-column
          prop="reference_code"
          :label="$t('bookings.referenceCode')"
          width="200"
        />
        <el-table-column :label="$t('customers.customer')" width="250">
          <template #default="{ row }">
            <div v-if="row.customer">
              <div>
                <strong>
                  {{
                    row.customer.name ||
                    (row.customer.phone
                      ? "Walk-in Customer"
                      : row.customer.email
                      ? "Guest Customer"
                      : "-")
                  }}
                </strong>
              </div>

              <div
                v-if="row.customer.phone"
                class="text-muted"
                style="display: flex; align-items: center; gap: 4px"
              >
                <el-icon><Phone /></el-icon>
                <span>{{ toLocalPhone(row.customer.phone) }}</span>
              </div>
              <div
                v-if="row.customer.email"
                class="text-muted"
                style="display: flex; align-items: center; gap: 4px"
              >
                <el-icon><ChatLineSquare /></el-icon>
                <span>{{ row.customer.email }}</span>
              </div>
              <el-tag
                :type="getCustomerTypeTag(row.customer.customerType)"
                size="small"
                v-if="row.customer.customerType"
                style="margin-top: 4px"
              >
                {{ $t(`customers.${row.customer.customerType}`) }}
              </el-tag>
            </div>
            <div v-else>
              <span class="text-muted">No customer data</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('showtimes.movie')" width="220">
          <template #default="{ row }">{{ row.movie?.title }}</template>
        </el-table-column>
        <el-table-column :label="$t('showtimes.showtimeDetails')" width="220">
          <template #default="{ row }">
            <div v-if="row.hall">{{ row.hall.hall_name }}</div>
            <small v-if="row.showtime" class="text-muted"
              >{{ formatDate(row.showtime.show_date) }}
              {{ row.showtime.start_time }}</small
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="seat_count"
          :label="$t('bookings.seatCount')"
          width="100"
        />
        <el-table-column
          prop="total_price"
          :label="$t('bookings.totalPrice')"
          width="120"
        >
          <template #default="{ row }">{{
            formatCurrency(row.total_price)
          }}</template>
        </el-table-column>
        <el-table-column :label="$t('bookings.bookingStatus')" width="160">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(bookingStatusOptions, row.booking_status)"
            >
              {{ row.booking_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('bookings.paymentStatus')" width="160">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(paymentStatusOptions, row.payment_status)"
            >
              {{ row.payment_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.actions')"
          fixed="right"
          width="100"
        >
          <template #default="{ row }">
            <el-dropdown
              trigger="click"
              @command="(command) => handleCommand(command, row)"
            >
              <el-button size="small" :icon="MoreFilled" circle @click.stop />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="view" class="text-info">
                    <el-icon>
                      <View />
                    </el-icon>
                    {{ $t("actions.view") }}
                  </el-dropdown-item>
                  <el-dropdown-item command="edit" class="text-primary">
                    <el-icon>
                      <Edit />
                    </el-icon>
                    {{ $t("actions.edit") }}
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" class="text-danger">
                    <el-icon>
                      <Delete />
                    </el-icon>
                    {{ $t("actions.delete") }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.payment_status === 'Pending'"
                    command="createPayment"
                    class="text-success"
                  >
                    <el-icon>
                      <Wallet />
                    </el-icon>
                    {{ $t("payments.createPayment") }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

    <!-- Edit Booking Dialog -->
    <el-dialog
      v-model="editDialogVisible"
      :title="$t('bookings.editBooking')"
      width="500px"
    >
      <el-form :model="editForm" label-position="top">
        <el-form-item :label="$t('bookings.bookingStatus')">
          <el-select v-model="editForm.booking_status" style="width: 100%">
            <el-option
              v-for="status in bookingStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('bookings.paymentStatus')">
          <el-select v-model="editForm.payment_status" style="width: 100%">
            <el-option
              v-for="status in paymentStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">{{
          $t("actions.cancel")
        }}</el-button>
        <el-button type="primary" @click="handleUpdate" :loading="loading.edit">
          {{ $t("actions.update") }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Create Payment Dialog -->
    <el-dialog
      v-model="paymentDialogVisible"
      :title="$t('payments.createPayment')"
      width="500px"
    >
      <el-form :model="paymentForm" label-position="top">
        <el-form-item :label="$t('payments.amount')">
          <el-input
            :model-value="formatCurrency(paymentForm.amount)"
            readonly
          />
        </el-form-item>
        <el-form-item
          :label="$t('payments.paymentMethod')"
          prop="payment_method"
        >
          <el-select v-model="paymentForm.payment_method" style="width: 100%">
            <el-option
              v-for="method in paymentMethods"
              :key="method.value"
              :label="method.label"
              :value="method.value"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item
          :label="$t('payments.transactionId')"
          prop="transaction_id"
        >
          <el-input v-model="paymentForm.transaction_id" />
        </el-form-item> -->
        <el-form-item :label="$t('payments.description')" prop="description">
          <el-input type="textarea" v-model="paymentForm.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="paymentDialogVisible = false">{{
          $t("actions.cancel")
        }}</el-button>
        <el-button
          type="primary"
          @click="handleCreatePayment"
          :loading="loading.payment"
        >
          {{ $t("actions.submit") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { bookingService } from "@/services/bookingService";
import { showtimeService } from "@/services/showtimeService";
import { paymentService } from "@/services/paymentService";
import { useAppStore } from "@/stores/app";
import { formatDate, formatCurrency, toLocalPhone } from "@/utils/formatters";
import {
  Delete,
  Edit,
  MoreFilled,
  View,
  Wallet,
  Phone,
  ChatLineSquare,
} from "@element-plus/icons-vue"; // Import icons

const { t } = useI18n();
const router = useRouter();
const appStore = useAppStore();

const loading = reactive({
  bookings: false,
  showtimes: false,
  edit: false,
  payment: false,
});
const bookings = ref([]);
const showtimeOptions = ref([]);

const filters = reactive({
  search: "",
  booking_status: "",
  payment_status: "",
  showtime_id: "",
  show_date: "",
  dateRange: [],
});

const pagination = reactive({
  current_page: 1,
  per_page: 10,
  total: 0,
});

const editDialogVisible = ref(false);
const editForm = reactive({
  id: null,
  booking_status: "",
  payment_status: "",
});

const paymentDialogVisible = ref(false);
const paymentForm = reactive({
  bookingId: null,
  amount: 0,
  currency: "USD",
  payment_method: "Cash",
  status: "Completed",
  transaction_id: "",
  description: "",
});

const getCustomerTypeTag = (type) => {
  switch (type) {
    case "member":
      return "success";
    case "walkin":
      return "info";
    case "guest":
      return "warning";
    default:
      return "primary";
  }
};
const bookingStatusOptions = bookingService.BOOKING_STATUSES;
const paymentStatusOptions = bookingService.PAYMENT_STATUSES;
const paymentMethods = paymentService.PAYMENT_METHODS;

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
      show_date: filters.show_date || undefined,
      date_from: filters.dateRange?.[0]
        ? new Date(filters.dateRange[0]).toISOString()
        : undefined,
      date_to: filters.dateRange?.[1]
        ? new Date(filters.dateRange[1]).toISOString()
        : undefined,
    };
    const response = await bookingService.getBookings(params);
    if (response.data) {
      bookings.value = response.data;
      // console.log("Loaded bookings:", bookings.value);
      pagination.total = response.total;
      pagination.current_page = response.current_page;
      pagination.per_page = response.per_page;
    } else {
      bookings.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    ElMessage.error(error?.message || t("errors.loadDataFailed"));
    console.error(error);
  } finally {
    loading.bookings = false;
  }
};

const loadShowtimes = async (query = "") => {
  loading.showtimes = true;
  try {
    showtimeOptions.value = await showtimeService.getDropdownShowtimes(query);
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
    search: "",
    booking_status: "",
    payment_status: "",
    showtime_id: "",
    dateRange: [],
  });
  handleFilterChange();
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

const handleRowClick = (row, column, event) => {
  // Prevent row click from triggering when action buttons/dropdown are clicked
  const target = event.target;
  const isButtonClick =
    target.tagName === "BUTTON" ||
    target.closest(".el-button") ||
    target.closest(".el-dropdown");
  if (isButtonClick) {
    return;
  }
  router.push({ name: "BookingDetail", params: { id: row.id } });
};

const handleCommand = (command, row) => {
  switch (command) {
    case "view":
      router.push({ name: "BookingDetail", params: { id: row.id } });
      break;
    case "edit":
      openEditDialog(row);
      break;
    case "delete":
      cancelBooking(row.id);
      break;
    case "createPayment":
      openCreatePaymentDialog(row);
      break;
    default:
      break;
  }
};

const openEditDialog = (booking) => {
  editForm.id = booking.id;
  editForm.booking_status = booking.booking_status;
  editForm.payment_status = booking.payment_status;
  editDialogVisible.value = true;
};

const handleUpdate = async () => {
  loading.edit = true;
  try {
    const response = await bookingService.updateBooking(editForm.id, {
      booking_status: editForm.booking_status,
      payment_status: editForm.payment_status,
    });
    if (response.success) {
      ElMessage.success(t("bookings.updateSuccess"));
      editDialogVisible.value = false;
      await loadBookings();
    } else {
      ElMessage.error(response.message || t("errors.updateFailed"));
    }
  } catch (error) {
    ElMessage.error(error?.message || t("errors.updateFailed"));
    console.error(error);
  } finally {
    loading.edit = false;
  }
};

const cancelBooking = async (id) => {
  try {
    await ElMessageBox.confirm(
      t("bookings.confirmDelete"),
      t("common.warning"),
      {
        confirmButtonText: t("actions.delete"),
        cancelButtonText: t("actions.cancel"),
        type: "warning",
      }
    );
    const response = await bookingService.cancelBooking(id);
    if (response.success) {
      ElMessage.success(t("bookings.deleteSuccess"));
      await loadBookings();
    } else {
      ElMessage.error(response.message || t("errors.deleteFailed"));
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(error?.message || t("errors.deleteFailed"));
      console.error(error);
    }
  }
};

const openCreatePaymentDialog = (booking) => {
  paymentForm.bookingId = booking.id;
  paymentForm.amount = booking.total_price;
  paymentForm.description = `Payment for booking ${booking.reference_code}`;
  paymentDialogVisible.value = true;
};

const handleCreatePayment = async () => {
  loading.payment = true;
  try {
    const response = await paymentService.createPayment(paymentForm);
    if (response.success) {
      ElMessage.success(t("payments.createSuccess"));
      paymentDialogVisible.value = false;
      await loadBookings();
    } else {
      ElMessage.error(response.message || t("errors.createFailed"));
    }
  } catch (error) {
    ElMessage.error(error?.message || t("errors.createFailed"));
    console.error(error);
  } finally {
    loading.payment = false;
  }
};

const getStatusType = (options, status) => {
  const option = options.find((opt) => opt.value === status);
  return option ? option.type : "info";
};

watch(
  [
    () => filters.search,
    () => filters.booking_status,
    () => filters.payment_status,
    () => filters.showtime_id,
    () => filters.show_date,
  ],
  () => {
    pagination.current_page = 1;
    loadBookings();
  }
);
onMounted(() => {
  loadBookings();
  loadShowtimes();
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("bookings.title"), path: "/admin/bookings" },
  ]);
});
</script>

<!-- Global styles for dropdown items -->
<style>
.el-dropdown-menu__item.text-info,
.el-dropdown-menu__item.text-info .el-icon {
  color: var(--el-color-info);
}

.el-dropdown-menu__item.text-info:hover,
.el-dropdown-menu__item.text-info:hover .el-icon {
  color: var(--el-color-info) !important; /* Keep color on hover */
  background-color: var(
    --el-color-info-light-9
  ); /* Element Plus default hover background */
}

.el-dropdown-menu__item.text-primary,
.el-dropdown-menu__item.text-primary .el-icon {
  color: var(--el-color-primary);
}

.el-dropdown-menu__item.text-danger,
.el-dropdown-menu__item.text-danger .el-icon {
  color: var(--el-color-danger);
}

.el-dropdown-menu__item.text-danger:hover,
.el-dropdown-menu__item.text-danger:hover .el-icon {
  color: var(--el-color-danger) !important; /* Keep color on hover */
  background-color: var(--el-color-danger-light-9);
}

.el-dropdown-menu__item.text-success,
.el-dropdown-menu__item.text-success .el-icon {
  color: var(--el-color-success);
}

.el-dropdown-menu__item.text-success:hover,
.el-dropdown-menu__item.text-success:hover .el-icon {
  color: var(--el-color-success) !important; /* Keep color on hover */
  background-color: var(--el-color-success-light-9);
}
</style>

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
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.text-muted {
  color: #909399;
}
</style>
