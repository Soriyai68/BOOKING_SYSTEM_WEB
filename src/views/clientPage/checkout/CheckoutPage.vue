<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useBookingStore } from "@/stores/booking";
import {
  ArrowLeft,
  QrCode,
  Store,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/uiStore";
import { bookingService } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";
import ClientBakongQR from "@/components/payments/ClientBakongQR.vue";

const router = useRouter();
const { t } = useI18n();
const bookingStore = useBookingStore();

const paymentMethods = computed(() => [
  {
    id: "bakong",
    name: t("client.checkout.bakongName"),
    icon: QrCode,
    description: t("client.checkout.bakongDesc"),
    tag: t("client.checkout.instant"),
  },
  {
    id: "cash",
    name: t("client.checkout.cashName"),
    icon: Store,
    description: t("client.checkout.cashDesc"),
    tag: t("client.checkout.flexible"),
  },
]);

const selectedMethod = ref("bakong");
const isProcessing = ref(false);
const showBakongQR = ref(!!bookingStore.paymentData);
const paymentData = computed({
  get: () => bookingStore.paymentData,
  set: (val) => (bookingStore.paymentData = val),
});

const totalPrice = computed(() => bookingStore.totalPrice);

const authStore = useAuthStore();
const uiStore = useUiStore();

const handleCompleteBooking = async () => {
  if (isProcessing.value) return;
  if (
    !bookingStore.selectedShowtime ||
    bookingStore.selectedSeats.length === 0
  ) {
    uiStore.showToast(t("messages.error"), "error");
    return;
  }

  isProcessing.value = true;
  try {
    const bookingData = {
      customerId: authStore.user?.id || authStore.user?._id,
      showtimeId: bookingStore.selectedShowtime.id,
      seats: bookingStore.selectedSeats.map((s) => s.id),
      seat_count: bookingStore.selectedSeats.length,
      total_price: bookingStore.totalPrice,
      payment_method:
        selectedMethod.value === "bakong" ? "Bakong" : "PayAtCinema",
    };

    const response = await bookingService.createBooking(bookingData);
    console.log("Booking response:", response);

    if (response?.success && response?.data?.booking) {
      const bookingId = response.data.booking._id || response.data.booking.id;

      // If Bakong, we might need to create a payment record or handle QR
      if (selectedMethod.value === "bakong") {
        try {
          const paymentRes = await paymentService.createPayment({
            bookingId: bookingId,
            amount: bookingStore.totalPrice,
            payment_method: "Bakong",
            currency: "USD",
            status: "Pending",
            description: `Booking for ${bookingStore.selectedShowtime.movie_title}`,
          });
          console.log("Payment creation response:", paymentRes);
          if (paymentRes?.success && paymentRes?.data?.payment) {
            paymentData.value = paymentRes.data.payment;
            showBakongQR.value = true;
            return; // Don't redirect yet
          } else {
            // Payment creation failed but response was returned (e.g. business logic error)
            await bookingService.cancelBooking(bookingId);
            uiStore.showToast(
              paymentRes?.message || t("payments.initiateFailed"),
              "error",
            );
          }
        } catch (paymentErr) {
          console.error("Payment initiation failed:", paymentErr);
          // Gateway error or network issue - cancel the booking to avoid stale pending
          await bookingService.cancelBooking(bookingId);
          uiStore.showToast(t("payments.initiateFailed"), "error");
        }
      }

      // If Cash, redirect immediately
      if (selectedMethod.value === "cash") {
        router.push({
          path: "/layout/confirmation",
          query: { bookingId: bookingId },
        });
      }
    } else {
      console.warn("Booking creation unsuccessful:", response);
      uiStore.showToast(response?.message || t("messages.error"), "error");
    }
  } catch (error) {
    console.error("Booking failed with exception:", error);
    uiStore.showToast(t("messages.createFailed"), "error");
  } finally {
    isProcessing.value = false;
  }
};

const handlePaymentSuccess = () => {
  const bId =
    paymentData.value.bookingId?._id ||
    paymentData.value.bookingId?.id ||
    paymentData.value.bookingId;

  // Clear payment data from store upon success
  bookingStore.paymentData = null;
  showBakongQR.value = false;

  uiStore.showToast(t("payments.paymentSuccess"), "success");

  router.push({
    path: "/layout/confirmation",
    query: { bookingId: bId },
  });
};

const handleQRClose = async (isPaid) => {
  if (isPaid) {
    handlePaymentSuccess();
    return;
  }

  // If they close without paying, cancel the booking
  const bId =
    paymentData.value.bookingId?._id ||
    paymentData.value.bookingId?.id ||
    paymentData.value.bookingId;

  showBakongQR.value = false;
  isProcessing.value = true;

  try {
    await bookingService.cancelBooking(bId);
    uiStore.showToast(t("payments.paymentFailed"), "warning");
    // Optionally stay on checkout page or redirect to showtimes
  } catch (error) {
    console.error("Failed to cancel unpaid booking:", error);
  } finally {
    isProcessing.value = false;
    bookingStore.paymentData = null;
  }
};
</script>

<template>
  <div
    class="checkout-page min-h-screen text-white relative overflow-hidden pb-32"
  >
    <div class="checkout-bg"></div>

    <div class="relative z-10 max-w-2xl mx-auto px-4 py-6">
      <header class="flex items-center gap-4 mb-8">
        <button
          @click="router.back()"
          class="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer"
        >
          <ArrowLeft :size="20" />
        </button>
        <h1 class="text-xl font-bold">{{ t("client.checkout.title") }}</h1>
      </header>

      <div class="space-y-4">
        <div
          v-for="method in paymentMethods"
          :key="method.id"
          @click="selectedMethod = method.id"
          class="group relative overflow-hidden rounded-3xl border transition-all cursor-pointer p-5"
          :class="
            selectedMethod === method.id
              ? 'bg-sky-500/[0.08] border-sky-500/50'
              : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]'
          "
        >
          <div class="flex items-start justify-between">
            <div class="flex gap-4">
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                :class="
                  selectedMethod === method.id
                    ? 'bg-sky-500 text-white'
                    : 'bg-white/[0.05] text-neutral-400'
                "
              >
                <component :is="method.icon" :size="24" />
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold">{{ method.name }}</h3>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-500 font-bold uppercase tracking-wider"
                  >
                    {{ method.tag }}
                  </span>
                </div>
                <p
                  class="text-sm text-neutral-400 max-w-[200px] leading-relaxed"
                >
                  {{ method.description }}
                </p>
              </div>
            </div>

            <div
              class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
              :class="
                selectedMethod === method.id
                  ? 'border-sky-500 bg-sky-500'
                  : 'border-white/[0.1]'
              "
            >
              <CheckCircle2
                v-if="selectedMethod === method.id"
                :size="14"
                class="text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Summary -->
      <div
        class="mt-12 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6"
      >
        <div class="flex justify-between items-center mb-4">
          <span class="text-neutral-400 text-sm font-medium">{{
            t("client.checkout.toPayToday")
          }}</span>
          <span class="text-2xl font-bold text-white"
            >${{ totalPrice.toFixed(2) }}</span
          >
        </div>
        <div
          class="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.04]"
        >
          <span class="text-xs text-neutral-500 leading-relaxed">
            {{ t("client.checkout.termsInfo") }}
          </span>
        </div>
      </div>
    </div>

    <!-- Bottom Action -->
    <div
      class="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c] to-transparent backdrop-blur-md"
    >
      <div class="max-w-2xl mx-auto">
        <button
          @click="handleCompleteBooking"
          :disabled="isProcessing"
          class="w-full h-[60px] flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold text-sm cursor-pointer shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="isProcessing" class="animate-spin" :size="20" />
          <span v-else>{{ t("client.checkout.completeBooking") }}</span>
        </button>
      </div>
    </div>

    <!-- Bakong QR Modal -->
    <div
      v-if="showBakongQR"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <ClientBakongQR
        :payment="paymentData"
        @close="handleQRClose"
        @paid="handlePaymentSuccess"
      />
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  background: #0a0a0c;
}
.checkout-bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(
    circle at 80% 0%,
    rgba(14, 165, 233, 0.05) 0%,
    transparent 40%
  );
}
</style>
