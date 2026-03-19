<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useBookingStore } from "@/stores/booking";
import { isDark, toggleDark } from "@/composables/useTheme";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
  Sun,
  Moon,
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
    class="review-page min-h-screen bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white relative overflow-hidden pb-32 transition-colors duration-300"
  >
    <div class="review-bg"></div>

    <div class="relative z-10 max-w-2xl mx-auto px-4 py-6">
      <!-- Header -->
      <header class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <button
            @click="router.push('/layout/seats')"
            class="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.08] text-slate-600 dark:text-white cursor-pointer transition-colors"
          >
            <ArrowLeft :size="20" />
          </button>
          <h1 class="text-xl font-bold">{{ t("client.review.title") }}</h1>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="router.back()"
            class="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/[0.1] transition-colors cursor-pointer shadow-sm dark:shadow-none"
          >
            <ArrowLeft :size="20" />
          </button>
        </div>
      </header>

      <!-- Selection Card -->
      <div class="space-y-6">
        <!-- Movie Summary -->
        <div class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-3xl p-5 shadow-sm dark:shadow-none">
          <div class="flex gap-4">
            <div class="w-24 h-32 rounded-2xl overflow-hidden flex-shrink-0">
              <img
                :src="movie?.movie_poster"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 flex flex-col justify-center">
              <h2 class="text-lg font-bold mb-2 text-slate-900 dark:text-white">{{ movie?.movie_title }}</h2>
              <div class="space-y-2 text-sm text-slate-500 dark:text-neutral-400">
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
        <div class="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] rounded-3xl p-5 shadow-sm dark:shadow-none">
          <h3
            class="text-sm font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-4"
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
            class="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/[0.04]"
          >
            <span class="text-slate-500 dark:text-neutral-400">
              {{
                t("client.review.totalForSeats", {
                  count: selectedSeats.length,
                })
              }}
            </span>
            <span class="text-xl font-bold text-slate-900 dark:text-white"
              >${{ totalPrice.toFixed(2) }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action -->
    <div
      class="fixed bottom-0 left-0 right-0 z-40 p-4 review-footer-blur transition-colors duration-300"
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
.review-footer-blur {
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.8) 60%,
    transparent
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.dark .review-footer-blur {
  background: linear-gradient(
    to top,
    rgba(10, 10, 12, 0.95),
    rgba(10, 10, 12, 0.8) 60%,
    transparent
  );
}

.review-bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(
    circle at 20% 0%,
    rgba(14, 165, 233, 0.05) 0%,
    transparent 40%
  );
  pointer-events: none;
}
</style>
