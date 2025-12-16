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
        <el-step :title="$t('bookings.steps.payment')" />
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
      </div>

      <!-- Step 4: Payment -->
      <div v-if="activeStep === 3" class="step-content">
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
          <div v-if="selectedPaymentMethod === 'Cash'" class="payment-details">
            <h4>{{ $t("payments.cashInstructions") }}</h4>
          </div>
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
          v-if="activeStep < 3"
          :disabled="!isStepValid"
          >{{ $t("actions.next") }}</el-button
        >
        <el-button
          type="success"
          @click="submitBooking"
          v-if="activeStep === 3"
          :disabled="!isStepValid"
          :loading="loading.booking"
        >
          {{ $t("bookings.createBooking") }}
        </el-button>
      </div>
    </el-card>

    <el-dialog
      v-model="showBakongDialog"
      :title="$t('payments.bakongPayment')"
      width="400px"
      @closed="onPaymentDialogClose"
      :show-close="false"
    >
      <bakong-qr-payment
        v-if="bakongPaymentData"
        :payment="bakongPaymentData"
        @paid="onPaymentPaid"
        @close="onPaymentDialogClose"
        @regenerate="handleRegenerateQR"
        style="margin: 0 auto;"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElDialog } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/app";
import { showtimeService } from "@/services/showtimeService";
import { seatService } from "@/services/seatService";
import { seatBookingService } from "@/services/seatBookingService";
import { customerService } from "@/services/customerService";
import { bookingService } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";
import BakongQrPayment from "@/components/payments/BakongQRPayment.vue";

const { t } = useI18n();
const router = useRouter();
const appStore = useAppStore();

const activeStep = ref(0);
const showBakongDialog = ref(false);
const bakongPaymentData = ref(null);
const currentBookingId = ref(null);

const loading = reactive({
  showtimes: false,
  seats: false,
  customers: false,
  booking: false,
  regeneratingQR: false,
});

// Step 1
const showtimeOptions = ref([]);
const selectedShowtimeId = ref(null);
const selectedShowtime = ref(null);

// Step 2
const hallSeats = ref([]);
const bookedSeats = ref([]);
const selectedSeats = ref(new Set());

// Step 3 & 4
const customerOptions = ref([]);
const selectedCustomerId = ref(null);
const customerSelectionMode = ref("search"); // 'search' or 'walkin' or 'guest'
const walkinCustomer = reactive({
  phone: "",
});
const guestDetails = reactive({
  email: "",
});
const paymentMethods = paymentService.PAYMENT_METHODS.filter((p) =>
  ["Cash", "Bakong", "PayAtCinema"].includes(p.value)
);
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
    bookedSeats.value = bookings.seatBookings.map((b) =>
      b.seatId?._id.toString()
    );
  } catch (error) {
    console.error("Failed to load seat data:", error);
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
  if (activeStep.value === 2) return selectedSeats.value.size > 0;
  if (activeStep.value === 3) {
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
  if (activeStep.value < 3) {
    activeStep.value++;
    if (activeStep.value === 1) loadSeatData();
    if (activeStep.value === 3) loadCustomers();
  }
};

const prevStep = () => {
  if (activeStep.value > 0) activeStep.value--;
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
    bookingData.guestEmail = guestDetails.email;
  }

  try {
    // Step 1: Create the booking
    const bookingResponse = await bookingService.createBooking(bookingData);

    if (!bookingResponse.success) {
      ElMessage.error(bookingResponse.message || t("bookings.createFailed"));
      loading.booking = false;
      return;
    }

    currentBookingId.value = bookingResponse.data.booking?._id;

    // Step 2: Handle payment flow based on the selected method
    if (selectedPaymentMethod.value === "Bakong") {
      if (!currentBookingId.value) {
        ElMessage.error(t("bookings.errors.bakongPaymentFailed"));
        router.push("/admin/bookings");
        return;
      }

      const paymentResponse = await paymentService.createPayment({
        bookingId: currentBookingId.value,
        payment_method: "Bakong",
        amount: bookingSummary.value.totalPrice,
        currency: "USD",
      });

      if (paymentResponse.success && paymentResponse.data) {
        bakongPaymentData.value = paymentResponse.data.payment;
        showBakongDialog.value = true;
      } else {
        ElMessage.error(
          paymentResponse.message || t("bookings.errors.bakongPaymentFailed")
        );
        router.push("/admin/bookings");
      }
    } else if (selectedPaymentMethod.value === "Cash") {
      // For Cash, immediately update the status to Completed via a separate call
      if (currentBookingId.value) {
        await bookingService.updateBooking(currentBookingId.value, {
          booking_status: "Completed",
          payment_status: "Completed",
        });
      }
      ElMessage.success(t("bookings.createSuccess"));
      router.push("/admin/bookings");
    } else {
      // For other methods like 'PayAtCinema' which remain pending
      ElMessage.success(t("bookings.createSuccess"));
      router.push("/admin/bookings");
    }
  } catch (error) {
    ElMessage.error(error.message || t("bookings.createFailed"));
  } finally {
    loading.booking = false;
  }
};

const handleRegenerateQR = async () => {
  if (!currentBookingId.value) {
    ElMessage.error(t("bookings.errors.missingBookingForQR"));
    return;
  }
  loading.regeneratingQR = true;
  try {
    const paymentResponse = await paymentService.createPayment({
      bookingId: currentBookingId.value,
      payment_method: "Bakong",
      amount: bookingSummary.value.totalPrice,
      currency: "USD",
    });

    if (paymentResponse.success && paymentResponse.data) {
      bakongPaymentData.value = paymentResponse.data.payment;
    } else {
      ElMessage.error(
        paymentResponse.message || t("bookings.errors.regenerateQRFailed")
      );
    }
  } catch (error) {
    ElMessage.error(error.message || t("bookings.errors.regenerateQRError"));
  } finally {
    loading.regeneratingQR = false;
  }
};

const onPaymentPaid = async () => {
  try {
    if (!currentBookingId.value) return;

    await bookingService.updateBooking(currentBookingId.value, {
      payment_status: "Completed",
      booking_status: "Confirmed",
    });
    showBakongDialog.value = false;
    ElMessage.success(t("bookings.paymentAndBookingSuccess"));
    router.push("/admin/bookings");
  } catch (error) {
    ElMessage.error(t("bookings.errors.paymentUpdateFailed"));
  }
};

const onPaymentDialogClose = async (paidStatus) => {
  if (!paidStatus && currentBookingId.value) {
    ElMessage.warning(t("bookings.paymentPendingMessage"));

    try {
      await bookingService.updateBooking(currentBookingId.value, {
        payment_status: "Pending",
        booking_status: "Pending",
      });
    } catch (error) {
      console.error("Failed to update booking status to Pending:", error);
      ElMessage.error(t("bookings.errors.updateStatusFailed"));
    }
    router.push("/admin/bookings");
  }
  showBakongDialog.value = false;
  bakongPaymentData.value = null;
  currentBookingId.value = null;
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
  background-color: var(--el-color-info-dark-2); /* Use a darker info color for screen */
  color: var(--el-color-white);
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
  color: var(--el-text-color-regular); /* Ensure label color adapts */
}

.seat {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--el-border-color); /* Use Element Plus border color */
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  user-select: none;
}

.seat.available {
  background-color: var(--el-fill-color-blank); /* Use Element Plus blank fill color */
  color: var(--el-text-color-primary); /* Ensure text color adapts */
}
.seat.available:hover {
  background-color: var(--el-fill-color-light); /* Use Element Plus light fill color */
}
.seat.selected {
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
  border-color: var(--el-color-primary);
}
.seat.booked {
  background-color: var(--el-color-info-light-3); /* Use Element Plus info color for booked */
  color: var(--el-color-white);
  cursor: not-allowed;
  border-color: var(--el-color-info-light-3);
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

.payment-details {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}
</style>
