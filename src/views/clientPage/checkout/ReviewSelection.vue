<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useBookingStore } from "@/stores/booking";
import {
  ArrowLeft,
  Ticket,
  MapPin,
  Clock,
  Calendar,
  CreditCard,
  ChevronRight,
  Info,
} from "lucide-vue-next";

const router = useRouter();
const { t } = useI18n();
const bookingStore = useBookingStore();

if (!bookingStore.selectedShowtime || bookingStore.selectedSeats.length === 0) {
  router.push("/layout/showtimes");
}

const movie = computed(() => bookingStore.selectedShowtime);
const selectedSeats = computed(() => bookingStore.selectedSeats);
const totalPrice = computed(() => bookingStore.totalPrice);

const handleCheckout = () => {
  router.push("/layout/checkout");
};
</script>

<template>
  <div
    class="review-page min-h-screen text-white relative overflow-hidden pb-32"
  >
    <div class="review-bg"></div>

    <div class="relative z-10 max-w-2xl mx-auto px-4 py-6">
      <!-- Header -->
      <header class="flex items-center gap-4 mb-8">
        <button
          @click="router.back()"
          class="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer"
        >
          <ArrowLeft :size="20" />
        </button>
        <h1 class="text-xl font-bold">{{ t("client.review.title") }}</h1>
      </header>

      <!-- Selection Card -->
      <div class="space-y-6">
        <!-- Movie Summary -->
        <div class="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-5">
          <div class="flex gap-4">
            <div class="w-24 h-32 rounded-2xl overflow-hidden flex-shrink-0">
              <img
                :src="movie?.movie_poster"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 flex flex-col justify-center">
              <h2 class="text-lg font-bold mb-2">{{ movie?.movie_title }}</h2>
              <div class="space-y-2 text-sm text-neutral-400">
                <div class="flex items-center gap-2">
                  <MapPin :size="14" class="text-sky-500" />
                  <span>{{ movie?.hall_name }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Calendar :size="14" class="text-sky-500" />
                  <span>{{ movie?.show_date }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Clock :size="14" class="text-sky-500" />
                  <span>{{ movie?.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seats Summary -->
        <div class="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-5">
          <h3
            class="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4"
          >
            {{ t("client.review.selectedSeats") }}
          </h3>
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="seat in selectedSeats"
              :key="seat.id"
              class="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-bold"
            >
              {{ seat.seat_identifier || `${seat.row}-${seat.seat_number}` }}
            </span>
          </div>
          <div
            class="flex justify-between items-center pt-4 border-t border-white/[0.04]"
          >
            <span class="text-neutral-400">
              {{
                t("client.review.totalForSeats", {
                  count: selectedSeats.length,
                })
              }}
            </span>
            <span class="text-xl font-bold text-white"
              >${{ totalPrice.toFixed(2) }}</span
            >
          </div>
        </div>

        <!-- Promo Code Placeholder -->
        <div
          class="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-5 flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] transition-colors"
        >
          <div class="flex items-center gap-3">
            <Ticket :size="20" class="text-sky-500" />
            <span class="text-sm font-medium">{{
              t("client.review.addPromoCode")
            }}</span>
          </div>
          <ChevronRight
            :size="18"
            class="text-neutral-500 group-hover:text-white transition-colors"
          />
        </div>
      </div>
    </div>

    <!-- Bottom Action -->
    <div
      class="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c] to-transparent backdrop-blur-md"
    >
      <div class="max-w-2xl mx-auto">
        <button
          @click="handleCheckout"
          class="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold text-sm cursor-pointer shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-transform"
        >
          <span>{{ t("client.review.continueToPayment") }}</span>
          <ChevronRight :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-page {
  background: #0a0a0c;
}
.review-bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(
    circle at 20% 0%,
    rgba(14, 165, 233, 0.05) 0%,
    transparent 40%
  );
}
</style>
