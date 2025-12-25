<template>
  <div class="create-booking-page">
    <div class="page-header">
      <h2>{{ $t("bookings.addBooking") }}</h2>
      <el-button @click="$router.back()" :icon="ArrowLeft">{{
        $t("actions.back")
      }}</el-button>
    </div>

    <el-card shadow="never" class="stepper-card">
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step :title="$t('bookings.steps.selectShowtime')" />
        <el-step :title="$t('bookings.steps.selectSeats')" />
        <el-step :title="$t('bookings.steps.confirm')" />
        <el-step :title="$t('bookings.steps.payment')" />
      </el-steps>
    </el-card>

    <el-card shadow="never">
      <!-- Step 1: Select Showtime -->
      <div v-if="activeStep === 0" class="step-content">
        <div class="filter-controls">
          <el-input
            style="width: 1200px"
            v-model="showtimeSearch"
            :placeholder="$t('bookings.searchByMovie')"
            clearable
            @input="debouncedLoadShowtimes"
          />
          <div class="date-filter-buttons">
            <el-button
              :type="selectedDateFilter === 'today' ? 'primary' : 'default'"
              @click="selectedDateFilter = 'today'"
            >
              {{ $t("actions.today") }}
            </el-button>
            <el-button
              :type="selectedDateFilter === 'tomorrow' ? 'primary' : 'default'"
              @click="selectedDateFilter = 'tomorrow'"
            >
              {{ $t("actions.tomorrow") }}
            </el-button>
          </div>
        </div>

        <div
          v-if="loading.showtimes"
          v-loading="loading.showtimes"
          style="min-height: 200px"
        ></div>
        <div v-else class="showtime-list">
          <div v-if="showtimeOptions.length > 0" class="showtime-grid">
            <div
              v-for="showtime in showtimeOptions"
              :key="showtime.id"
              @click="selectShowtime(showtime)"
              :class="[
                'showtime-card',
                { selected: selectedShowtimeId === showtime.id },
              ]"
            >
              <div class="showtime-card-content-wrapper">
                <!-- Poster Image -->
                <div class="poster-section">
                  <el-image
                    :src="showtime.movie_poster"
                    :alt="showtime.movie_title"
                    class="poster-image"
                    fit="cover"
                  />
                  <div
                    v-if="showtime.occupancy >= 0.9"
                    class="selling-fast-badge"
                  >
                    {{ $t("bookings.sellingFast") }}
                  </div>
                </div>

                <!-- Details -->
                <div class="details-section">
                  <div>
                    <div class="details-header">
                      <h3 class="movie-title">
                        {{ showtime.movie_title }}
                      </h3>
                      <!-- Info icon can be added here if needed -->
                    </div>

                    <div class="showtime-meta-grid">
                      <div class="showtime-meta-item">
                        <MapPin class="meta-icon" />
                        <span
                          >{{ showtime.theater_name }} •
                          {{ showtime.hall_name }}</span
                        >
                      </div>
                      <div class="showtime-meta-item">
                        <Calendar class="meta-icon" />
                        <span>{{ formatDate(showtime.show_date) }}</span>
                      </div>
                      <div class="showtime-meta-item">
                        <Clock class="meta-icon" />
                        <span class="font-semibold">{{
                          showtime.start_time
                        }}</span>
                      </div>
                      <div class="showtime-meta-item">
                        <Ticket class="meta-icon" />
                        <span
                          >{{ showtime.bookedCount }} /
                          {{ showtime.totalCount }}
                          {{ $t("bookings.seats") }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Progress Bar -->
                  <div class="occupancy-progress-container">
                    <div class="occupancy-labels">
                      <span class="occupancy-text">{{
                        $t("bookings.occupancy")
                      }}</span>
                      <span
                        :class="[
                          'occupancy-percentage',
                          { 'high-occupancy': showtime.occupancy > 0.9 },
                        ]"
                      >
                        {{ Math.round(showtime.occupancy * 100) }}%
                        {{ $t("bookings.full") }}
                      </span>
                    </div>
                    <div class="progress-bar-background">
                      <div
                        class="progress-bar-fill"
                        :style="{
                          width: `${showtime.occupancy * 100}%`,
                          backgroundColor: getProgressBarColor(
                            showtime.occupancy
                          ),
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-showtimes-placeholder">
            <div class="placeholder-icon-container">
              <el-icon :size="40"><Search /></el-icon>
            </div>
            <h3 class="placeholder-title">
              {{ $t("bookings.noShowtimesFound") }}
            </h3>
            <p class="placeholder-subtitle">
              {{ $t("bookings.tryAdjustingFilters") }}
            </p>
            <el-button
              link
              type="primary"
              @click="showtimeSearch = ''"
              class="clear-filters-button"
            >
              {{ $t("bookings.clearAllFilters") }}
            </el-button>
          </div>
        </div>
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
            <!-- <el-radio-group -->
            <!-- v-model="customerSelectionMode" -->
            <!-- style="margin-bottom: 10px" -->
            <!-- > -->
            <!-- <el-radio-button label="search">{{
                $t("customers.searchExistingCustomer")
              }}</el-radio-button> -->
            <!-- <el-radio-button label="walkin">{{
                $t("customers.newWalkInCustomer")
              }}</el-radio-button> -->
            <!-- <el-radio-button label="guest">{{
                $t("customers.newGuestCustomer")
              }}</el-radio-button> -->
            <!-- </el-radio-group> -->
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

          <!-- <div v-if="customerSelectionMode === 'walkin'">
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
                  v-model="displayPhone"
                  maxlength="10"
                  @input="formatPhoneNumber"
                />
              </el-form-item>
            </el-form>
          </div> -->

          <!-- <div v-if="customerSelectionMode === 'guest'">
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
          </div> -->
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
        style="margin: 0 auto"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElDialog } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import {
  Calendar,
  Clock,
  MapPin,
  Info,
  Ticket,
  ChevronRight,
  Search,
} from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { showtimeService } from "@/services/showtimeService";
import { seatService } from "@/services/seatService";
import { seatBookingService } from "@/services/seatBookingService";
import { customerService } from "@/services/customerService";
import { bookingService } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";
import {
  toInternationalPhone,
  formatCurrency,
  formatDate,
} from "@/utils/formatters";
import BakongQrPayment from "@/components/payments/BakongQRPayment.vue";
import { toLocalPhone } from "../../utils/formatters";

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
const showtimeSearch = ref("");

// Step 2
const hallSeats = ref([]);
const bookedSeats = ref([]);
const selectedSeats = ref(new Set());

// Step 3 & 4
const customerOptions = ref([]);
const selectedCustomerId = ref(null);
const customerSelectionMode = ref("search"); // Always search
const displayPhone = ref("");
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

const formatPhoneNumber = (inputValue) => {
  let cleanedDisplay = inputValue.replace(/\D/g, ""); // only digits
  if (cleanedDisplay.startsWith("855")) {
    cleanedDisplay = "0" + cleanedDisplay.substring(3);
  } else if (!cleanedDisplay.startsWith("0") && cleanedDisplay.length > 1) {
    cleanedDisplay = "0" + cleanedDisplay;
  }
  displayPhone.value = cleanedDisplay.substring(0, 10);
  walkinCustomer.phone = toInternationalPhone(displayPhone.value);
};

const getCustomerLabel = (customer) => {
  if (customer.customerType === "walkin") {
    return "Walk-in Customer";
  }
  if (customer.customerType === "guest") {
    return `Guest Customer - ${customer.email || customer.name || customer.id}`;
  }
  // Default for member or other types
  if (customer.name && customer.phone) {
    return `${customer.name} - ${toLocalPhone(customer.phone)}`;
  }
  if (customer.name) {
    return customer.name;
  }
  if (customer.email) {
    return customer.email;
  }
  return customer.id; // fallback
};

const selectedDateFilter = ref("today"); // Default to today

const loadShowtimes = async () => {
  loading.showtimes = true;
  try {
    const params = {
      search: showtimeSearch.value,
      forBooking: true,
      per_page: 10,
      sort_by: "start_time",
      sort_order: "asc",
    };

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (selectedDateFilter.value === "today") {
      params.show_date = today.toISOString().split("T")[0];
    } else if (selectedDateFilter.value === "tomorrow") {
      params.show_date = tomorrow.toISOString().split("T")[0];
    }
    const response = await showtimeService.getShowtimes(params);
    if (response && response.data) {
      const showtimesWithOccupancy = await Promise.all(
        response.data.map(async (showtime) => {
          try {
            // Get booked seats count
            const bookedSeatsResponse =
              await seatBookingService.getSeatBookings({
                showtimeId: showtime.id,
                status: "booked",
                limit: 1, // We only need the total count
              });
            const bookedCount = bookedSeatsResponse.total || 0;

            // Get total seats for the hall
            const allSeatsResponse = await seatService.getSeatsByHall(
              showtime.hall_id,
              { per_page: 100 }
            );
            const totalCount = allSeatsResponse.data.length || 0;

            const occupancy = totalCount > 0 ? bookedCount / totalCount : 0;
            return {
              ...showtime,
              occupancy,
              bookedCount,
              totalCount,
            };
          } catch (e) {
            console.error(
              `Failed to load occupancy for showtime ${showtime.id}`,
              e
            );
            return {
              ...showtime,
              occupancy: 0,
              bookedCount: "?",
              totalCount: "?",
            };
          }
        })
      );
      showtimeOptions.value = showtimesWithOccupancy;
    }
  } catch (error) {
    console.error("Failed to load showtimes:", error);
    ElMessage.error(t("errors.loadDataFailed"));
  } finally {
    loading.showtimes = false;
  }
};

let debounceTimer;
const debouncedLoadShowtimes = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadShowtimes();
  }, 300);
};

const selectShowtime = (showtime) => {
  if (selectedShowtimeId.value === showtime.id) {
    selectedShowtimeId.value = null;
    selectedShowtime.value = null;
  } else {
    selectedShowtimeId.value = showtime.id;
    selectedShowtime.value = showtime;
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
    showDate: formatDate(selectedShowtime.value.show_date),
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
    return !!selectedCustomerId.value;
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
      if (!currentBookingId.value) {
        ElMessage.error(t("bookings.errors.cashPaymentFailed"));
        router.push("/admin/bookings");
        return;
      }

      // Create a payment record for Cash
      const paymentResponse = await paymentService.createPayment({
        bookingId: currentBookingId.value,
        payment_method: "Cash",
        amount: bookingSummary.value.totalPrice,
        currency: "USD",
        payment_status: "Completed", // Mark cash payment as completed immediately
      });

      if (paymentResponse.success) {
        // Now update the booking status
        await bookingService.updateBooking(currentBookingId.value, {
          booking_status: "Completed",
          payment_status: "Completed",
        });
        ElMessage.success(t("bookings.createSuccess"));
        router.push("/admin/bookings");
      } else {
        ElMessage.error(
          paymentResponse.message || t("bookings.errors.cashPaymentFailed")
        );
        // If payment creation failed, we might want to still redirect or handle this
        // For now, redirect to bookings list
        router.push("/admin/bookings");
      }
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

const getProgressBarColor = (occupancy) => {
  if (occupancy > 0.9) {
    return "var(--el-color-danger)";
  } else if (occupancy > 0.7) {
    return "var(--el-color-warning)";
  } else {
    return "var(--el-color-success)";
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
watch(selectedDateFilter, () => {
  loadShowtimes();
});

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

.stepper-card {
  margin-bottom: 20px;
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
  background-color: var(
    --el-color-info-dark-2
  ); /* Use a darker info color for screen */
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
  background-color: var(
    --el-fill-color-blank
  ); /* Use Element Plus blank fill color */
  color: var(--el-text-color-primary); /* Ensure text color adapts */
}
.seat.available:hover {
  background-color: var(
    --el-fill-color-light
  ); /* Use Element Plus light fill color */
}
.seat.selected {
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
  border-color: var(--el-color-primary);
}
.seat.booked {
  background-color: var(
    --el-color-info-light-3
  ); /* Use Element Plus info color for booked */
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

/* Showtime List Styles */
.showtime-list { /* Renamed from showtime-list-container */
  width: 100%;
}

.showtime-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.showtime-card { /* Renamed from showtime-card-new */
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid var(--el-border-color);
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: var(--el-bg-color);
}

.showtime-card:hover {
  border-color: var(--el-color-primary-light-3);
  background-color: var(--el-fill-color-light);
}

.showtime-card.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary);
}

.showtime-card-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: .75rem;
}

@media (min-width: 640px) {
  .showtime-card-content-wrapper { /* Renamed */
    flex-direction: row;
  }
}

.poster-section {
  position: relative;
  flex-shrink: 0;
}

.poster-image {
  width: 100%;
  height: 10rem;
  object-fit: cover;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (min-width: 640px) {
  .poster-image {
    width: 7rem;
    height: 9rem;
  }
}

.selling-fast-badge { /* Renamed from selling-fast-badge-new */
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background-color: var(--el-color-danger);
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.details-section {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.movie-title { /* Renamed from movie-title-new */
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--el-text-color-primary);
  transition: color 0.3s;
}

.showtime-card:hover .movie-title { /* Renamed from showtime-card-new:hover .movie-title-new */
  color: var(--el-color-primary);
}

.showtime-meta-grid { /* Renamed from meta-grid-new */
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.25rem 1rem;
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
}

@media (min-width: 640px) {
  .showtime-meta-grid { /* Renamed */
    grid-template-columns: repeat(2, 1fr);
  }
}

.showtime-meta-item { /* Renamed from meta-item-new */
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-icon { /* Renamed from meta-icon-new */
  width: 1rem;
  height: 1rem;
  color: var(--el-color-primary);
}

.font-semibold {
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.occupancy-progress-container { /* Renamed from progress-container-new */
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.occupancy-labels { /* Renamed from progress-labels-new */
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: bold;
}

.occupancy-text {
  color: var(--el-text-color-secondary);
}

.occupancy-percentage {
  color: var(--el-text-color-regular);
}

.occupancy-percentage.high-occupancy {
  color: var(--el-color-danger);
}

.progress-bar-background {
  height: 0.375rem;
  width: 100%;
  background-color: var(--el-border-color-lighter);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  transition: all 1s ease-out;
  border-radius: 9999px;
}

.no-showtimes-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  background-color: var(--el-fill-color-lighter);
  border-radius: 1.5rem;
  border: 1px dashed var(--el-border-color);
  text-align: center;
}

.placeholder-icon-container {
  background-color: var(--el-fill-color-light);
  padding: 1rem;
  margin-bottom: 1rem;
  color: var(--el-text-color-secondary);
}

.placeholder-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.placeholder-subtitle {
  color: var(--el-text-color-secondary);
  margin-top: 0.25rem;
}

.clear-filters-button {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.w-6 {
  width: 1.5rem;
}

.h-6 {
  height: 1.5rem;
}

.filter-controls {
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}
.date-filter-buttons {
  display: flex;
}
</style>
