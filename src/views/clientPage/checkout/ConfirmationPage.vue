<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useBookingStore } from "@/stores/booking";
import { bookingService } from "@/services/bookingService";
import {
  CheckCircle2,
  Ticket,
  ArrowRight,
  Share2,
  Calendar,
  MapPin,
  Clock,
  Loader2,
} from "lucide-vue-next";
import { formatTime, formatDate } from "../../../utils/formatters";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const bookingStore = useBookingStore();

const loading = ref(true);
const booking = ref(null);

onMounted(async () => {
  const bookingId = route.query.bookingId;
  if (!bookingId) {
    router.push("/layout/showtimes");
    return;
  }

  try {
    const response = await bookingService.getBookingById(bookingId);
    if (response?.success && response?.data) {
      booking.value = response.data;
    }
  } catch (error) {
    console.error("Failed to fetch booking:", error);
  } finally {
    loading.value = false;
  }
});

const handleFinish = () => {
  bookingStore.clearBooking();
  router.push("/layout/showtimes");
};

const goToTickets = () => {
  bookingStore.clearBooking();
  router.push("/layout/settings/tickets");
};
</script>

<template>
  <div
    class="confirmation-page min-h-screen text-white relative overflow-hidden flex flex-col items-center justify-center px-4 py-12"
  >
    <div class="conf-bg"></div>

    <div v-if="loading" class="relative z-10 flex flex-col items-center gap-4">
      <Loader2 class="animate-spin text-sky-500" :size="40" />
      <p class="text-neutral-400">{{ t("messages.loading") }}</p>
    </div>

    <div v-else-if="booking" class="relative z-10 w-full max-w-md text-center">
      <!-- Success Icon -->
      <div class="mb-8 relative inline-block">
        <div
          class="w-20 h-20 rounded-3xl bg-sky-500 shadow-2xl shadow-sky-500/40 flex items-center justify-center"
        >
          <CheckCircle2 :size="40" stroke-width="2.5" />
        </div>
        <div
          class="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center animate-bounce"
        >
          <Ticket :size="20" class="text-sky-400" />
        </div>
      </div>

      <h1 class="text-3xl font-bold mb-3">
        {{ t("client.confirmation.title") }}
      </h1>
      <p class="text-neutral-400 mb-10 leading-relaxed px-4">
        {{ t("client.confirmation.desc") }}
      </p>

      <!-- Ticket Summary Card -->
      <div
        class="bg-white/[0.03] border border-white/[0.06] rounded-[2.5rem] p-6 mb-10 text-left relative overflow-hidden group"
      >
        <div class="absolute top-0 right-0 p-4">
          <div
            class="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center cursor-pointer hover:bg-white/[0.1] transition-colors"
          >
            <Share2 :size="18" class="text-neutral-400" />
          </div>
        </div>

        <div class="flex gap-4 mb-6">
          <div class="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img
              :src="booking.movie?.poster_url"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex-1 flex flex-col justify-center">
            <h2 class="font-bold text-lg leading-tight mb-2">
              {{ booking.movie?.title }}
            </h2>
            <div class="flex gap-1.5 flex-wrap">
              <span
                v-for="seat in booking.seats"
                :key="seat.seatId"
                class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-sky-400"
              >
                {{ seat.seat_identifier }}
              </span>
            </div>
            <p class="text-[10px] text-neutral-500 mt-2 font-mono">
              {{ t("client.confirmation.bookingRef") }}: #{{
                booking.reference_code
              }}
            </p>
          </div>
        </div>

        <div class="space-y-3 pt-6 border-t border-white/[0.04]">
          <div class="flex items-center gap-3 text-sm">
            <Calendar :size="16" class="text-neutral-500" />
            <span class="text-neutral-300 font-medium">{{
              formatDate(booking.showtime?.show_date)
            }}</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <Clock :size="16" class="text-neutral-500" />
            <span class="text-neutral-300 font-medium">{{
              formatTime(booking.showtime?.start_time)
            }}</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <MapPin :size="16" class="text-neutral-500" />
            <span class="text-neutral-300 font-medium">{{
              booking.hall?.hall_name
            }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-4 w-full px-4">
        <button
          @click="goToTickets"
          class="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>{{ t("client.confirmation.viewTickets") }}</span>
          <ArrowRight :size="18" />
        </button>
        <button
          @click="handleFinish"
          class="w-full py-4 rounded-2xl bg-white/[0.06] text-white font-bold text-sm cursor-pointer hover:bg-white/[0.1] active:scale-[0.98] transition-all"
        >
          {{ t("client.confirmation.backToHome") }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirmation-page {
  background: #0a0a0c;
}
.conf-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      circle at 50% 100%,
      rgba(14, 165, 233, 0.08) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 50% 0%,
      rgba(139, 92, 246, 0.05) 0%,
      transparent 40%
    );
}
</style>
