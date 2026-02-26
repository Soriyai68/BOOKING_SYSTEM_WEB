<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from "@/utils/api";
import {
  ArrowLeft,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Inbox,
  QrCode,
  Armchair,
  DollarSign,
  CreditCard,
  CalendarCheck,
} from "lucide-vue-next";

const router = useRouter();
const { t } = useI18n();

const activeTab = ref("upcoming");
const bookings = ref([]);
const isLoading = ref(true);
const selectedBooking = ref(null);

const getStatusLabel = (status) => {
  if (!status) return t("n_a");
  const key = `bookings.${status.toLowerCase()}`;
  const translated = t(key);
  return translated === key ? status : translated;
};

const getMethodLabel = (method) => {
  if (!method) return t("n_a");
  const mapping = {
    Bakong: "payments.bakongPayment",
    PayAtCinema: "payments.payAtCinema",
    Cash: "payments.cashPayment",
  };
  const key = mapping[method];
  if (!key) return method;
  const translated = t(key);
  return translated === key ? method : translated;
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Completed":
    case "Confirmed":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "Pending":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "Cancelled":
    case "Failed":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
  }
};

const getStatusDot = (status) => {
  switch (status) {
    case "Completed":
    case "Confirmed":
      return "bg-emerald-400";
    case "Pending":
      return "bg-amber-400";
    case "Cancelled":
    case "Failed":
      return "bg-red-400";
    default:
      return "bg-neutral-400";
  }
};

const fetchBookings = async () => {
  isLoading.value = true;
  try {
    const res = await api.get("/customer/bookings", {
      params: { type: activeTab.value },
    });
    if (res.data?.success) {
      bookings.value = res.data.data.bookings;
    }
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchBookings();
});

const handleTabChange = (tab) => {
  activeTab.value = tab;
  fetchBookings();
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};
</script>

<template>
  <div
    class="tickets-page min-h-screen text-white relative overflow-hidden flex flex-col"
  >
    <!-- Background -->
    <div class="tickets-bg"></div>

    <!-- Header -->
    <header
      class="relative z-10 py-3 px-5 flex items-center gap-3 border-b border-white/[0.05] bg-[#0a0a0c]/80 backdrop-blur-md"
    >
      <button
        @click="router.back()"
        class="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08]"
      >
        <ArrowLeft :size="18" class="text-neutral-400" />
      </button>
      <h1 class="text-sm font-bold">{{ t("my_tickets") }}</h1>
    </header>

    <!-- Tabs -->
    <div class="relative z-10 px-5 py-4 bg-[#0a0a0c]/40 backdrop-blur-sm">
      <div
        class="flex p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]"
      >
        <button
          @click="handleTabChange('upcoming')"
          :class="[
            'flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300',
            activeTab === 'upcoming'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
              : 'text-neutral-500 hover:text-neutral-300',
          ]"
        >
          {{ t("upcoming") }}
        </button>
        <button
          @click="handleTabChange('history')"
          :class="[
            'flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300',
            activeTab === 'history'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
              : 'text-neutral-500 hover:text-neutral-300',
          ]"
        >
          {{ t("history") }}
        </button>
      </div>
    </div>

    <!-- Ticket List -->
    <div class="relative z-10 flex-1 overflow-y-auto px-5 py-4">
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center py-20 opacity-50"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent mb-4"
        ></div>
      </div>

      <div
        v-else-if="bookings.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4 border border-white/[0.06]"
        >
          <Inbox :size="24" class="text-neutral-600" />
        </div>
        <p class="text-neutral-500 text-sm font-medium">
          {{ activeTab === "upcoming" ? t("no_tickets") : t("no_history") }}
        </p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="booking in bookings"
          :key="booking._id"
          @click="selectedBooking = booking"
          class="ticket-card group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 cursor-pointer active:scale-[0.98] overflow-hidden"
        >
          <!-- Top section: Movie title + status -->
          <div class="px-4 pt-4 pb-3">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <h3
                  class="font-bold text-[13px] leading-tight text-white truncate"
                >
                  {{ booking.movie.title }}
                </h3>
              </div>
              <span
                :class="[
                  'flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border flex-shrink-0',
                  getStatusStyle(booking.booking_status),
                ]"
              >
                <span
                  :class="[
                    'w-1.5 h-1.5 rounded-full',
                    getStatusDot(booking.booking_status),
                  ]"
                ></span>
                {{ getStatusLabel(booking.booking_status) }}
              </span>
            </div>

            <!-- Details row -->
            <div class="flex items-center gap-4 mt-2.5 text-neutral-400">
              <div class="flex items-center gap-1">
                <Calendar :size="11" class="text-neutral-500" />
                <span class="text-[10px]">{{
                  formatDate(booking.showtime.show_date)
                }}</span>
              </div>
              <div class="flex items-center gap-1">
                <Clock :size="11" class="text-neutral-500" />
                <span class="text-[10px]">{{
                  booking.showtime.start_time
                }}</span>
              </div>
              <div class="flex items-center gap-1">
                <MapPin :size="11" class="text-neutral-500" />
                <span class="text-[10px]">{{ booking.hall.hall_name }}</span>
              </div>
            </div>
          </div>

          <!-- Divider with punched holes -->
          <div class="relative flex items-center mx-1">
            <div
              class="absolute -left-3 w-5 h-5 rounded-full bg-[#0a0a0c]"
            ></div>
            <div
              class="flex-1 border-t border-dashed border-white/[0.08]"
            ></div>
            <div
              class="absolute -right-3 w-5 h-5 rounded-full bg-[#0a0a0c]"
            ></div>
          </div>

          <!-- Bottom section: Reference + seats -->
          <div class="px-4 pb-4 pt-3 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <Ticket :size="13" class="text-sky-400" />
              <span class="text-[11px] font-bold text-sky-400 tracking-wide">{{
                booking.reference_code
              }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Armchair :size="12" class="text-neutral-500" />
              <span class="text-[11px] font-medium text-neutral-400">
                {{ booking.seat_count }} {{ t("seat") }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Detail Modal -->
    <div
      v-if="selectedBooking"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300"
    >
      <div
        class="absolute inset-0 bg-black/80 backdrop-blur-md"
        @click="selectedBooking = null"
      ></div>

      <div
        class="relative w-full max-w-sm bg-[#0f0f12] border border-white/[0.08] rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
      >
        <!-- Modal Header -->
        <div class="p-6 pb-4">
          <div class="flex items-center justify-between mb-1">
            <h2
              class="text-base font-bold text-white leading-tight flex-1 min-w-0 pr-3 truncate"
            >
              {{ selectedBooking.movie.title }}
            </h2>
            <span
              :class="[
                'flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border flex-shrink-0',
                getStatusStyle(selectedBooking.booking_status),
              ]"
            >
              <span
                :class="[
                  'w-1.5 h-1.5 rounded-full',
                  getStatusDot(selectedBooking.booking_status),
                ]"
              ></span>
              {{ getStatusLabel(selectedBooking.booking_status) }}
            </span>
          </div>
        </div>

        <!-- Modal Content: Scrollable -->
        <div class="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
          <!-- Quick Info Row -->
          <div class="grid grid-cols-3 gap-2 mb-5">
            <div
              class="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 text-center"
            >
              <Calendar :size="14" class="text-sky-400 mx-auto mb-1.5" />
              <span class="text-[10px] text-neutral-400 block leading-tight">{{
                formatDate(selectedBooking.showtime.show_date)
              }}</span>
            </div>
            <div
              class="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 text-center"
            >
              <Clock :size="14" class="text-sky-400 mx-auto mb-1.5" />
              <span class="text-[10px] text-neutral-400 block leading-tight">{{
                selectedBooking.showtime.start_time
              }}</span>
            </div>
            <div
              class="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 text-center"
            >
              <MapPin :size="14" class="text-sky-400 mx-auto mb-1.5" />
              <span
                class="text-[10px] text-neutral-400 block leading-tight truncate"
                >{{ selectedBooking.hall.hall_name }}</span
              >
            </div>
          </div>

          <!-- QR / Reference Code Section -->
          <div
            class="bg-white rounded-2xl p-5 flex flex-col items-center justify-center space-y-2 mb-5"
          >
            <div class="text-black/15">
              <QrCode :size="100" stroke-width="1.5" />
            </div>
            <div class="text-center">
              <p
                class="text-[9px] text-neutral-400 font-semibold uppercase tracking-[0.15em]"
              >
                {{ $t("ticket_reference") }}
              </p>
              <p class="text-xl font-black text-black tracking-[0.2em] mt-0.5">
                {{ selectedBooking.reference_code }}
              </p>
            </div>
          </div>

          <!-- Booking Info List -->
          <div class="space-y-0">
            <div
              class="flex items-center justify-between py-3 border-b border-white/[0.05]"
            >
              <div class="flex items-center gap-2 text-neutral-400">
                <Armchair :size="13" />
                <span class="text-xs">{{ $t("bookings.seats") }}</span>
              </div>
              <span class="text-xs font-bold text-white">
                {{
                  selectedBooking.populatedSeats
                    ?.map((s) => `${s.row}-${s.seat_number}`)
                    .join(", ") || t("n_a")
                }}
              </span>
            </div>
            <div
              class="flex items-center justify-between py-3 border-b border-white/[0.05]"
            >
              <div class="flex items-center gap-2 text-neutral-400">
                <CreditCard :size="13" />
                <span class="text-xs">{{ $t("payment_method") }}</span>
              </div>
              <span class="text-xs font-bold text-white">{{
                getMethodLabel(selectedBooking.payment_method)
              }}</span>
            </div>
            <div
              class="flex items-center justify-between py-3 border-b border-white/[0.05]"
            >
              <div class="flex items-center gap-2 text-neutral-400">
                <DollarSign :size="13" />
                <span class="text-xs">{{ $t("total_price") }}</span>
              </div>
              <span class="text-xs font-bold text-sky-400"
                >${{ selectedBooking.total_price }}</span
              >
            </div>
            <div class="flex items-center justify-between py-3">
              <div class="flex items-center gap-2 text-neutral-400">
                <CalendarCheck :size="13" />
                <span class="text-xs">{{ $t("bookings.bookingDate") }}</span>
              </div>
              <span class="text-[11px] text-neutral-500">{{
                formatDate(selectedBooking.booking_date)
              }}</span>
            </div>
          </div>
        </div>

        <!-- Sticky Footer -->
        <div class="p-5 bg-[#0f0f12]/95 border-t border-white/[0.05]">
          <button
            @click="selectedBooking = null"
            class="w-full py-3.5 rounded-2xl bg-white/[0.05] text-white text-sm font-bold hover:bg-white/[0.08] transition-all border border-white/[0.08] active:scale-[0.98]"
          >
            {{ t("actions.close") || "Close" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tickets-page {
  background: #0a0a0c;
}

.tickets-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      circle at 0% 0%,
      rgba(14, 165, 233, 0.08) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 100% 100%,
      rgba(139, 92, 246, 0.05) 0%,
      transparent 40%
    );
  pointer-events: none;
}

.ticket-card {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
</style>
