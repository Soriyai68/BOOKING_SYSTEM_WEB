<template>
  <div class="create-booking-page">
    <div class="page-header">
      <h2>{{ $t("bookings.addBooking") }}</h2>
      <el-button @click="$router.back()">
        <ArrowLeft :size="20" /> {{ $t("actions.back") }}
      </el-button>
    </div>

    <el-row :gutter="24">
      <el-col :xs="20" :sm="15">
        <el-card shadow="never" class="stepper-card">
          <el-steps :active="activeStep" finish-status="success" align-center>
            <el-step :title="$t('bookings.steps.selectShowtime')" />
            <el-step :title="$t('bookings.steps.selectSeats')" />
            <el-step :title="$t('bookings.steps.payment')" />
          </el-steps>
        </el-card>

        <div class="step-content-wrapper">
          <select-showtime-step
            v-show="activeStep === 0"
            v-model="bookingState.showtime"
            :active-step="activeStep"
          />

          <select-seats-step
            v-if="activeStep === 1"
            :showtime="bookingState.showtime"
            v-model="bookingState.selectedSeats"
            @update:selectedSeatDetails="
              bookingState.selectedSeatDetails = $event
            "
          />

          <payment-step
            v-if="activeStep === 2"
            v-model:customerId="bookingState.customerId"
            v-model:paymentMethod="bookingState.paymentMethod"
          />
        </div>

        <!-- Navigation -->
        <div class="step-navigation">
          <el-button v-if="activeStep > 0" @click="prevStep">
            {{ $t("actions.previous") }}
          </el-button>

          <el-button
            v-if="activeStep < 2"
            type="primary"
            :disabled="!isStepValid"
            @click="nextStep"
          >
            {{ $t("actions.next") }}
          </el-button>

          <el-button
            v-if="activeStep === 2"
            type="success"
            :disabled="!isStepValid"
            :loading="loading.booking"
            @click="submitBooking"
          >
            {{ $t("bookings.createBooking") }}
          </el-button>
        </div>
      </el-col>

      <el-col :xs="24" :sm="9">
        <div class="summary-wrapper">
          <confirmation-step :booking-summary="bookingSummary" />
        </div>
      </el-col>
    </el-row>

    <el-dialog
      v-model="showBakongDialog"
      :title="$t('payments.bakongPayment')"
      width="400px"
      :show-close="false"
      @closed="onPaymentDialogClose"
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
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "lucide-vue-next";
import { useAppStore } from "@/stores/app";

import { bookingService } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";
import { formatDate } from "@/utils/formatters";

import SelectShowtimeStep from "@/components/bookings/SelectShowtimeStep.vue";
import SelectSeatsStep from "@/components/bookings/SelectSeatsStep.vue";
import ConfirmationStep from "@/components/bookings/ConfirmationStep.vue";
import PaymentStep from "@/components/bookings/PaymentStep.vue";
import BakongQrPayment from "@/components/payments/BakongQRPayment.vue";

const { t } = useI18n();
const router = useRouter();
const appStore = useAppStore();

const activeStep = ref(0);
const showBakongDialog = ref(false);
const bakongPaymentData = ref(null);
const currentBookingId = ref(null);

const loading = reactive({
  booking: false,
  regeneratingQR: false,
});

const bookingState = reactive({
  showtime: null,
  selectedSeats: new Set(),
  selectedSeatDetails: [],
  customerId: null,
  paymentMethod: "Cash",
});

const bookingSummary = computed(() => {
  if (!bookingState.showtime)
    return {
      movie: "",
      hall: "",
      showDate: "",
      startTime: "",
      seats: "",
      totalPrice: 0,
    };

  const totalPrice = bookingState.selectedSeatDetails.reduce(
    (total, seat) => total + (seat?.price || 0),
    0,
  );

  return {
    movie: bookingState.showtime.movie_title,
    hall: bookingState.showtime.hall_name,
    showDate: formatDate(bookingState.showtime.show_date),
    startTime: bookingState.showtime.start_time,
    seats:
      bookingState.selectedSeatDetails
        .map((s) => `${s.seat_identifier}`)
        .join(", ") || "",
    totalPrice,
  };
});

const isStepValid = computed(() => {
  if (activeStep.value === 0) return !!bookingState.showtime;
  if (activeStep.value === 1) return bookingState.selectedSeats.size > 0;
  if (activeStep.value === 2) return !!bookingState.customerId;
  return false;
});

const nextStep = () => {
  if (activeStep.value < 2) activeStep.value++;
};

const prevStep = () => {
  if (activeStep.value > 0) activeStep.value--;
};

/* ===================== */
/* ENTER KEY FUNCTIONALITY */
/* ===================== */
const handleEnterKey = (e) => {
  if (e.key !== "Enter") return;

  // prevent Enter from triggering inside textarea
  const tag = e.target.tagName;
  if (tag === "TEXTAREA") return;

  e.preventDefault();

  if (!isStepValid.value) return;

  if (activeStep.value < 2) {
    nextStep();
  } else if (activeStep.value === 2) {
    submitBooking();
  }
};

/* ===================== */
/* SUBMIT BOOKING FUNCTION */
/* ===================== */
const submitBooking = async () => {
  if (!isStepValid.value) return;
  loading.booking = true;

  const bookingData = {
    showtimeId: bookingState.showtime?.id,
    seats: Array.from(bookingState.selectedSeats),
    total_price: bookingSummary.value.totalPrice,
    seat_count: bookingState.selectedSeats.size,
    payment_method: bookingState.paymentMethod,
    customerId: bookingState.customerId,
    noted: "",
  };

  try {
    const bookingResponse = await bookingService.createBooking(bookingData);

    if (!bookingResponse.success) {
      ElMessage.error(bookingResponse.message || t("bookings.createFailed"));
      loading.booking = false;
      return;
    }

    const booking = bookingResponse.data.booking;
    currentBookingId.value = booking?._id;

    if (bookingState.paymentMethod === "Bakong") {
      // Initiate Bakong payment
      const paymentResponse = await paymentService.createPayment({
        bookingId: booking._id,
        amount: booking.total_price,
        payment_method: "Bakong",
        currency: "USD", // Default to USD
        description: `Payment for booking ${booking.reference_code}`,
      });

      if (paymentResponse.success) {
        bakongPaymentData.value = paymentResponse.data.payment;
        showBakongDialog.value = true;
      } else {
        ElMessage.error(
          paymentResponse.message || t("payments.initiateFailed"),
        );
        router.push(getAdminPath("/bookings"));
      }
    } else {
      ElMessage.success(t("bookings.createSuccess"));
      router.push(getAdminPath("/bookings"));
    }
  } catch (error) {
    ElMessage.error(error.message || t("bookings.createFailed"));
  } finally {
    loading.booking = false;
  }
};

/* ============ */
/* OTHER FUNCTIONS */
/* ============ */
const handleRegenerateQR = async () => {
  if (!currentBookingId.value) return;

  loading.regeneratingQR = true;
  try {
    const booking = bookingState.showtime
      ? {
          _id: currentBookingId.value,
          total_price: bookingSummary.value.totalPrice,
          reference_code: "", // Will be handled by backend
        }
      : null;

    if (!booking) return;

    const paymentResponse = await paymentService.createPayment({
      bookingId: booking._id,
      amount: booking.total_price,
      payment_method: "Bakong",
      currency: "USD",
      description: `Payment for booking`,
    });

    if (paymentResponse.success) {
      bakongPaymentData.value = paymentResponse.data.payment;
    } else {
      ElMessage.error(
        paymentResponse.message || t("payments.regenerateFailed"),
      );
    }
  } catch (error) {
    console.error("Failed to regenerate QR:", error);
    ElMessage.error(t("errors.actionFailed"));
  } finally {
    loading.regeneratingQR = false;
  }
};

const onPaymentPaid = async () => {
  ElMessage.success(t("payments.paymentSuccess"));
  showBakongDialog.value = false;
  router.push(getAdminPath("/bookings"));
};

const onPaymentDialogClose = (paid) => {
  showBakongDialog.value = false;
  if (paid) {
    router.push(getAdminPath("/bookings"));
  } else {
    // If not paid, we still redirect but maybe with a different message or just redirect to list
    router.push(getAdminPath("/bookings"));
  }
};

/* ===================== */
/* LIFECYCLE HOOKS */
/* ===================== */
onMounted(() => {
  window.addEventListener("keydown", handleEnterKey);

  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: getAdminPath("/dashboard") },
    { title: t("bookings.title"), path: getAdminPath("/bookings") },
    { title: t("bookings.addBooking"), path: getAdminPath("/bookings/create") },
  ]);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleEnterKey);
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

.step-content-wrapper {
  background-color: var(--el-bg-color);
  padding: 4px;
  border-radius: 4px;
  min-height: 400px;
  margin-bottom: 20px;
}

.step-navigation {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding: 20px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
}
</style>
