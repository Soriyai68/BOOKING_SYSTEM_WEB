<template>
  <div class="create-booking-page">
    <div class="page-header">
      <h2>{{ $t("bookings.addBooking") }}</h2>
      <el-button @click="$router.back()"><ArrowLeft :size="20" /> {{
        $t("actions.back")
      }}</el-button>
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
            <select-showtime-step v-show="activeStep === 0" v-model="bookingState.showtime" />
            <select-seats-step
              v-if="activeStep === 1"
              :showtime="bookingState.showtime"
              v-model="bookingState.selectedSeats"
              @update:selectedSeatDetails="bookingState.selectedSeatDetails = $event"
            />
            <payment-step
              v-if="activeStep === 2"
              v-model:customerId="bookingState.customerId"
              v-model:paymentMethod="bookingState.paymentMethod"
            />
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
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElDialog } from "element-plus";
import { ArrowLeft } from "lucide-vue-next";
import { useAppStore } from "@/stores/app";

import { bookingService } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";
import { formatCurrency, formatDate } from "@/utils/formatters";

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
  paymentMethod: 'Cash',
});

const bookingSummary = computed(() => {
  if (!bookingState.showtime) return {
    movie: '',
    hall: '',
    showDate: '',
    startTime: '',
    seats: '',
    totalPrice: 0,
  };

  const totalPrice = bookingState.selectedSeatDetails.reduce(
    (total, seat) => total + (seat?.price || 0),
    0
  );

  return {
    movie: bookingState.showtime.movie_title,
    hall: bookingState.showtime.hall_name,
    showDate: formatDate(bookingState.showtime.show_date),
    startTime: bookingState.showtime.start_time,
    seats: bookingState.selectedSeatDetails.map((s) => `${s.seat_identifier}`).join(", ") || '',
    totalPrice: totalPrice,
  };
});

const isStepValid = computed(() => {
  if (activeStep.value === 0) return !!bookingState.showtime;
  if (activeStep.value === 1) return bookingState.selectedSeats.size > 0;
  if (activeStep.value === 2) return !!bookingState.customerId;
  return false;
});

const nextStep = () => {
  if (activeStep.value < 2) {
    activeStep.value++;
  }
};

const prevStep = () => {
  if (activeStep.value > 0) activeStep.value--;
};

const submitBooking = async () => {
  if (!isStepValid.value) return;
  loading.booking = true;

  const bookingData = {
    showtimeId: bookingState.showtime.id,
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

    currentBookingId.value = bookingResponse.data.booking?._id;

    if (bookingState.paymentMethod === "Bakong") {
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
    } else if (bookingState.paymentMethod === "Cash") {
      if (!currentBookingId.value) {
        ElMessage.error(t("bookings.errors.cashPaymentFailed"));
        router.push("/admin/bookings");
        return;
      }

      const paymentResponse = await paymentService.createPayment({
        bookingId: currentBookingId.value,
        payment_method: "Cash",
        amount: bookingSummary.value.totalPrice,
        currency: "USD",
        payment_status: "Completed",
      });

      if (paymentResponse.success) {
        await bookingService.updateBooking(currentBookingId.value, {
          booking_status: "Confirmed",
          payment_status: "Completed",
        });
        ElMessage.success(t("bookings.createSuccess"));
        router.push("/admin/bookings");
      } else {
        ElMessage.error(
          paymentResponse.message || t("bookings.errors.cashPaymentFailed")
        );
        router.push("/admin/bookings");
      }
    } else {
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

onMounted(() => {
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
  margin-top: 20px;
  padding: 20px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
}

/* .summary-wrapper {
  position: sticky;
  top: 80px;
} */

@media (max-width: 768px) {
  .summary-wrapper {
    position: relative;
    top: 0;
    margin-top: 20px;
  }
}

</style>