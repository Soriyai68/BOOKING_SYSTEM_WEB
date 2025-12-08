<template>
  <div class="create-booking-page">
    <div class="page-header">
      <h2>{{ $t("bookings.addBooking") }}</h2>
      <el-button @click="$router.back()" :icon="ArrowLeft">{{
        $t("actions.back")
      }}</el-button>
    </div>

    <el-card>
      <el-steps
        :active="activeStep"
        finish-status="success"
        align-center
        style="margin-bottom: 40px"
      >
        <el-step :title="$t('bookings.steps.selectShowtime')" />
        <el-step :title="$t('bookings.steps.selectSeats')" />
        <el-step :title="$t('bookings.steps.confirm')" />
      </el-steps>

      <!-- Step 1: Select Showtime -->
      <div v-if="activeStep === 0" class="step-content">
        <el-form label-position="top">
          <el-form-item :label="$t('seats.selectShowtime')">
            <el-select
              v-model="selectedShowtimeId"
              filterable
              remote
              :remote-method="loadShowtimes"
              :loading="loading.showtimes"
              :placeholder="$t('seats.selectShowtime')"
              style="width: 100%"
              @change="handleShowtimeChange"
            >
              <el-option
                v-for="item in showtimeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 2: Select Seats -->
      <div v-if="activeStep === 1" class="step-content">
        <div
          v-if="loading.seats"
          v-loading="loading.seats"
          style="min-height: 200px"
        ></div>
        <div v-else class="seat-map-container">
          <div class="screen">{{ $t("bookings.screen") }}</div>
          <div class="seat-map">
            <div v-for="row in seatRows" :key="row.row" class="seat-row">
              <div class="row-label">{{ row.row }}</div>
              <div
                v-for="seat in row.seats"
                :key="seat.id"
                class="seat"
                :class="getSeatClass(seat)"
                @click="toggleSeat(seat)"
              >
                {{ seat.seat_number }}
              </div>
            </div>
          </div>
          <div class="legend">
            <div class="legend-item">
              <span class="seat available"></span>
              {{ $t("seats.statuses.available") }}
            </div>
            <div class="legend-item">
              <span class="seat selected"></span>
              {{ $t("seats.statuses.selected") }}
            </div>
            <div class="legend-item">
              <span class="seat booked"></span>
              {{ $t("seats.statuses.booked") }}
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Confirmation -->
      <div v-if="activeStep === 2" class="step-content">
        <el-descriptions
          :title="$t('bookings.bookingSummary')"
          :column="2"
          border
        >
          <el-descriptions-item :label="$t('showtimes.movie')">{{
            bookingSummary.movie
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('showtimes.hall')">{{
            bookingSummary.hall
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('showtimes.showDate')">{{
            bookingSummary.showDate
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('showtimes.startTime')">{{
            bookingSummary.startTime
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('seats.title')">{{
            bookingSummary.seats
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('bookings.totalPrice')">
            <span style="font-weight: bold; color: var(--primary-color)">{{
              formatCurrency(bookingSummary.totalPrice)
            }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <el-form style="margin-top: 20px" label-position="top">
          <el-form-item :label="$t('customers.customer')">
            <el-radio-group
              v-model="customerSelectionMode"
              style="margin-bottom: 10px"
            >
              <el-radio-button label="search">{{
                $t("customers.searchExistingCustomer")
              }}</el-radio-button>
              <el-radio-button label="walkin">{{
                $t("customers.newWalkInCustomer")
              }}</el-radio-button>
              <el-radio-button label="guest">{{
                $t("customers.newGuestCustomer")
              }}</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <div v-if="customerSelectionMode === 'search'">
            <el-form-item>
              <el-select
                v-model="selectedCustomerId"
                filterable
                remote
                :remote-method="loadCustomers"
                :loading="loading.customers"
                :placeholder="$t('customers.searchAndSelectCustomer')"
                style="width: 100%"
              >
                <el-option
                  v-for="customer in customerOptions"
                  :key="customer.id"
                  :label="getCustomerLabel(customer)"
                  :value="customer.id"
                />
              </el-select>
            </el-form-item>
          </div>

          <div v-if="customerSelectionMode === 'walkin'">
            <el-form
              :model="walkinCustomer"
              label-position="top"
              ref="walkinForm"
            >
              <el-form-item
                :label="$t('customers.phone')"
                prop="phone"
                :rules="{ required: true, message: 'Phone is required' }"
              >
                <el-input
                  :placeholder="$t('auth.phonePlaceholder')"
                  v-model="walkinCustomer.phone"
                />
              </el-form-item>
            </el-form>
          </div>

          <div v-if="customerSelectionMode === 'guest'">
            <el-form :model="guestDetails" label-position="top" ref="guestForm">
              <el-form-item
                :label="$t('customers.email')"
                prop="email"
                :rules="{
                  required: true,
                  type: 'email',
                  message: 'Valid email is required',
                }"
              >
                <el-input
                  v-model="guestDetails.email"
                  :placeholder="$t('auth.emailPlaceholder')"
                />
              </el-form-item>
            </el-form>
          </div>
          <el-form-item :label="$t('payments.paymentMethod')">
            <el-select v-model="selectedPaymentMethod" style="width: 100%">
              <el-option
                v-for="method in paymentMethods"
                :key="method.value"
                :label="method.label"
                :value="method.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- Navigation -->
      <div class="step-navigation">
        <el-button @click="prevStep" v-if="activeStep > 0">{{
          $t("actions.previous")
        }}</el-button>
        <el-button
          type="primary"
          @click="nextStep"
          v-if="activeStep < 2"
          :disabled="!isStepValid"
          >{{ $t("actions.next") }}</el-button
        >
        <el-button
          type="success"
          @click="submitBooking"
          v-if="activeStep === 2"
          :disabled="!isStepValid"
          :loading="loading.booking"
        >
          {{ $t("bookings.createBooking") }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/app";
import { showtimeService } from "@/services/showtimeService";
import { seatService } from "@/services/seatService";
import { seatBookingService } from "@/services/seatBookingService";
import { customerService } from "@/services/customerService";
import { bookingService } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";

const { t } = useI18n();
const router = useRouter();
const appStore = useAppStore();

const activeStep = ref(0);

const loading = reactive({
  showtimes: false,
  seats: false,
  customers: false,
  booking: false,
});

// Step 1
const showtimeOptions = ref([]);
const selectedShowtimeId = ref(null);
const selectedShowtime = ref(null);

// Step 2
const hallSeats = ref([]);
const bookedSeats = ref([]);
const selectedSeats = ref(new Set());

// Step 3
const customerOptions = ref([]);
const selectedCustomerId = ref(null);
const customerSelectionMode = ref("search"); // 'search' or 'walkin'
const walkinCustomer = reactive({
  phone: "",
});
const guestDetails = reactive({
  email: "",
});
const paymentMethods = paymentService.PAYMENT_METHODS;
const selectedPaymentMethod = ref("Cash");

const getCustomerLabel = (customer) => {
  if (customer.customerType === "walkin") {
    return `Walk-in Customer (${
      customer.phone || customer.name || customer.id
    })`;
  }
  if (customer.customerType === "guest") {
    return `Guest Customer (${customer.email || customer.name || customer.id})`;
  }
  // Default for member or other types
  if (customer.name && customer.phone) {
    return `${customer.name} (${customer.phone})`;
  }
  if (customer.name) {
    return customer.name;
  }
  if (customer.email) {
    return customer.email;
  }
  return customer.id; // fallback
};

const loadShowtimes = async (query = "") => {
  loading.showtimes = true;
  try {
    showtimeOptions.value = await showtimeService.getDropdownShowtimes(query);
  } catch (error) {
    console.error("Failed to load showtimes:", error);
    ElMessage.error(t("errors.loadDataFailed"));
  } finally {
    loading.showtimes = false;
  }
};

const handleShowtimeChange = async (showtimeId) => {
  if (!showtimeId) {
    selectedShowtime.value = null;
    return;
  }
  try {
    loading.showtimes = true;
    selectedShowtime.value = await showtimeService.getShowtime(showtimeId);
    console.log("Selected showtime:", selectedShowtime.value);
  } catch (error) {
    console.error("Failed to load showtime details:", error);
    ElMessage.error(t("errors.loadDataFailed"));
  } finally {
    loading.showtimes = false;
  }
};

const loadSeatData = async () => {
  if (!selectedShowtime.value?.hall_id) return;

  loading.seats = true;
  try {
    const [seatResponse, bookings] = await Promise.all([
      seatService.getSeatsByHall(selectedShowtime.value.hall_id, {
        per_page: 100,
      }),
      seatBookingService.getRawSeatBookingsForShowtime(
        selectedShowtime.value.id
      ),
    ]);

    hallSeats.value = seatResponse.data;
    console.log("booking res:", bookings.seatBookings);
    bookedSeats.value = bookings.seatBookings.map((b) =>
      b.seatId?._id.toString()
    );
  } catch (error) {
    console.error("Failed to load seat data:", error);
    // ElMessage.error(t("errors.loadDataFailed"));
  } finally {
    loading.seats = false;
  }
};

const loadCustomers = async (query = "") => {
  loading.customers = true;
  try {
    const response = await customerService.getCustomers({
      search: query,
      limit: 20,
    });
    customerOptions.value = response.data;
  } catch (error) {
    console.error("Failed to load customers:", error);
    ElMessage.error(t("errors.loadDataFailed"));
  } finally {
    loading.customers = false;
  }
};

const seatRows = computed(() => {
  if (!hallSeats.value) return [];
  const rows = {};
  hallSeats.value.forEach((seat) => {
    if (!rows[seat.row]) {
      rows[seat.row] = { row: seat.row, seats: [] };
    }
    rows[seat.row].seats.push(seat);
  });
  // sort seats within row
  Object.values(rows).forEach((row) => {
    row.seats.sort((a, b) => a.seat_number - b.seat_number);
  });
  return Object.values(rows).sort((a, b) => a.row.localeCompare(b.row));
});

const getSeatClass = (seat) => {
  const seatId = seat.id?.toString();
  if (bookedSeats.value.includes(seatId)) return "booked";
  if (selectedSeats.value.has(seatId)) return "selected";
  return "available";
};

const toggleSeat = (seat) => {
  const seatId = seat.id?.toString();
  if (bookedSeats.value.includes(seatId)) return;

  if (selectedSeats.value.has(seatId)) {
    selectedSeats.value.delete(seatId);
  } else {
    selectedSeats.value.add(seatId);
  }
};

const bookingSummary = computed(() => {
  if (!selectedShowtime.value) return {};
  const selectedSeatDetails = hallSeats.value.filter((s) =>
    selectedSeats.value.has(s.id?.toString())
  );

  const totalPrice = selectedSeatDetails.reduce(
    (total, seat) => total + (seat?.price || 0),
    0
  );

  return {
    movie: selectedShowtime.value.movie_title,
    hall: selectedShowtime.value.hall_name,
    showDate: new Date(selectedShowtime.value.show_date).toLocaleDateString(),
    startTime: selectedShowtime.value.start_time,
    seats: selectedSeatDetails.map((s) => `${s.seat_identifier}`).join(", "),
    totalPrice: totalPrice,
  };
});

const isStepValid = computed(() => {
  if (activeStep.value === 0) return !!selectedShowtimeId.value;

  if (activeStep.value === 1) return selectedSeats.value.size > 0;

  if (activeStep.value === 2) {
    if (customerSelectionMode.value === "search") {
      return !!selectedCustomerId.value;
    } else if (customerSelectionMode.value === "walkin") {
      return !!walkinCustomer.phone;
    } else if (customerSelectionMode.value === "guest") {
      const emailRegex = /.+@.+\..+/;

      return !!(guestDetails.email && emailRegex.test(guestDetails.email));
    }
  }

  return false;
});

const nextStep = () => {
  if (activeStep.value < 2) {
    activeStep.value++;

    if (activeStep.value === 1) {
      loadSeatData();
    }

    if (activeStep.value === 2) {
      loadCustomers();
    }
  }
};

const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--;
  }
};

const submitBooking = async () => {
  if (!isStepValid.value) return;
  loading.booking = true;

  const bookingData = {
    showtimeId: selectedShowtimeId.value,
    seats: Array.from(selectedSeats.value),
    total_price: bookingSummary.value.totalPrice,
    seat_count: selectedSeats.value.size,
    payment_method: selectedPaymentMethod.value,
    noted: "",
  };

  if (customerSelectionMode.value === "search") {
    bookingData.customerId = selectedCustomerId.value;
  } else if (customerSelectionMode.value === "walkin") {
    bookingData.phone = walkinCustomer.phone;
  } else {
    // guest
    bookingData.guestEmail = guestDetails.email;
  }

  console.log("Submitting booking:", bookingData);
  try {
    const response = await bookingService.createBooking(bookingData);
    console.log("Booking creation response:", response);
    // const bookingId = response.data.booking._id;

    if (response.success) {
      ElMessage.success(t("bookings.createSuccess"));
      router.push("/admin/bookings");
    } else {
      ElMessage.error(response.message || t("errors.createFailed"));
    }
  } catch (error) {
    ElMessage.error(error.message || t("errors.createFailed"));
    console.error(error);
  } finally {
    loading.booking = false;
  }
};

const formatCurrency = (value) => {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

onMounted(() => {
  loadShowtimes();
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("bookings.title"), path: "/admin/bookings" },
    { title: t("bookings.addBooking"), path: "/admin/booking/create" },
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

.step-content {
  margin: 20px 0;
  padding: 0 40px;
}

.step-navigation {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.seat-map-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.screen {
  width: 80%;
  padding: 10px;
  margin-bottom: 30px;
  background-color: #333;
  color: white;
  text-align: center;
  border-radius: 5px;
  text-transform: uppercase;
}

.seat-map {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.seat-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.row-label {
  width: 20px;
  font-weight: bold;
}

.seat {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  user-select: none;
}

.seat.available {
  background-color: #fff;
}
.seat.available:hover {
  background-color: #f0f0f0;
}
.seat.selected {
  background-color: var(--el-color-primary);
  color: white;
  border-color: var(--el-color-primary);
}
.seat.booked {
  background-color: #909399;
  color: white;
  cursor: not-allowed;
  border-color: #909399;
}

.legend {
  margin-top: 20px;
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-item .seat {
  width: 20px;
  height: 20px;
  cursor: default;
}
</style>
