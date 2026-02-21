<script setup>
import { ref, computed } from "vue";
import { ArrowLeft, Monitor, Info, Armchair } from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();

// Mock data — will be replaced with API calls
const movieTitle = ref("Avatar: The Way of Water");
const hallName = ref("Hall A");
const showtime = ref("7:30 PM");
const showDate = ref("Feb 20, 2026");
const screenType = ref("2D");

// Seat types config
const seatTypes = {
  regular: { label: "Regular", color: "#3b82f6", price: 3.00 },
  vip: { label: "VIP", color: "#a855f7", price: 5.00 },
  couple: { label: "Couple", color: "#ec4899", price: 8.00 },
  queen: { label: "Queen", color: "#f59e0b", price: 10.00 },
};

// Generate seat map (mock layout)
const seatMap = ref([
  { row: "A", seats: generateRow("A", 10, "regular") },
  { row: "B", seats: generateRow("B", 10, "regular") },
  { row: "C", seats: generateRow("C", 10, "regular") },
  { row: "D", seats: generateRow("D", 10, "regular") },
  { row: "E", seats: generateRow("E", 10, "regular") },
  { row: "F", seats: generateRow("F", 10, "vip") },
  { row: "G", seats: generateRow("G", 10, "vip") },
  { row: "H", seats: generateRow("H", 5, "couple") },
  { row: "I", seats: generateRow("I", 3, "queen") },
]);

function generateRow(row, count, type) {
  const seats = [];
  for (let i = 1; i <= count; i++) {
    // Add some randomly booked/unavailable seats for demo
    let status = "available";
    if ((row === "B" && (i === 3 || i === 4 || i === 5)) ||
        (row === "D" && (i === 7 || i === 8)) ||
        (row === "F" && i === 2) ||
        (row === "C" && i === 9)) {
      status = "booked";
    }
    if (row === "A" && i === 6) {
      status = "maintenance";
    }
    seats.push({
      id: `${row}${i}`,
      row,
      seat_number: i,
      seat_type: type,
      status,
      price: seatTypes[type].price,
    });
  }
  return seats;
}

const selectedSeats = ref([]);

function toggleSeat(seat) {
  if (seat.status === "booked" || seat.status === "maintenance") return;

  const index = selectedSeats.value.findIndex((s) => s.id === seat.id);
  if (index >= 0) {
    selectedSeats.value.splice(index, 1);
  } else {
    selectedSeats.value.push(seat);
  }
}

function isSeatSelected(seat) {
  return selectedSeats.value.some((s) => s.id === seat.id);
}

const totalPrice = computed(() => {
  return selectedSeats.value.reduce((sum, s) => sum + s.price, 0);
});

const seatWidthClass = (type) => {
  if (type === "couple") return "seats-couple";
  if (type === "queen") return "seats-queen";
  return "seats-single";
};

function getSeatColor(seat) {
  if (seat.status === "booked") return "bg-white/[0.06] border-white/[0.04]";
  if (seat.status === "maintenance") return "bg-red-900/20 border-red-500/20";
  if (isSeatSelected(seat)) return `border-transparent`;
  return "bg-white/[0.04] border-white/[0.08] hover:border-white/20";
}

function getSeatSelectedBg(seat) {
  if (!isSeatSelected(seat)) return "";
  const type = seat.seat_type;
  if (type === "vip") return "background: linear-gradient(135deg, #a855f7, #7c3aed)";
  if (type === "couple") return "background: linear-gradient(135deg, #ec4899, #db2777)";
  if (type === "queen") return "background: linear-gradient(135deg, #f59e0b, #d97706)";
  return "background: linear-gradient(135deg, #3b82f6, #2563eb)";
}
</script>

<template>
  <div class="seats-page min-h-screen text-white relative overflow-hidden">
    <!-- Background -->
    <div class="seats-bg"></div>

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header -->
      <header class="py-3 px-5 flex items-center justify-between border-b border-white/[0.05]">
        <div class="flex items-center gap-3">
          <button
            @click="router.back()"
            class="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer"
          >
            <ArrowLeft :size="18" class="text-neutral-400" />
          </button>
          <div class="flex items-center gap-3">
            <img
              src="@/assets/rsb-cinema.png"
              alt="RSB Cinema Logo"
              class="w-10 h-12 object-contain"
            />
            <div>
              <h1 class="text-[12px] font-bold leading-snug">
                រោងភាពយន្ត អ័រ អេស ប៊ី​ ឯកភ្នំ
              </h1>
              <p class="text-[10px] font-semibold text-neutral-500 mt-0.5 tracking-wide uppercase">
                RSB CINEMA EK PHNOM
              </p>
            </div>
          </div>
        </div>

        <!-- Movie info pill -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
          <span class="text-[11px] font-semibold text-neutral-300">{{ hallName }}</span>
          <span class="text-neutral-600">·</span>
          <span class="text-[11px] text-neutral-400">{{ screenType }}</span>
          <span class="text-neutral-600">·</span>
          <span class="text-[11px] text-neutral-400">{{ showtime }}</span>
        </div>
      </header>

      <!-- Movie Title Bar -->
      <div class="px-5 py-4 border-b border-white/[0.04]">
        <h2 class="text-lg font-bold">{{ movieTitle }}</h2>
        <p class="text-xs text-neutral-500 mt-0.5">{{ showDate }} · {{ showtime }} · {{ hallName }}</p>
      </div>

      <!-- Seat Map Area -->
      <div class="flex-1 flex flex-col items-center px-2 sm:px-4 py-4 sm:py-6 overflow-x-auto">
        <!-- Screen indicator -->
        <div class="w-full max-w-md mb-6 text-center">
          <div class="seats-screen mx-auto mb-2"></div>
          <div class="flex items-center justify-center gap-1.5 text-neutral-600">
            <Monitor :size="11" />
            <span class="text-[9px] uppercase tracking-widest font-medium">Screen</span>
          </div>
        </div>

        <!-- Seat Grid -->
        <div class="flex flex-col items-center gap-[5px] sm:gap-2 mb-6">
          <div
            v-for="rowData in seatMap"
            :key="rowData.row"
            class="flex items-center gap-1 sm:gap-2"
          >
            <!-- Row label -->
            <span class="w-4 sm:w-6 text-center text-[9px] sm:text-[11px] font-bold text-neutral-500">
              {{ rowData.row }}
            </span>

            <!-- Seats -->
            <div class="flex items-center gap-[3px] sm:gap-1.5">
              <button
                v-for="seat in rowData.seats"
                :key="seat.id"
                @click="toggleSeat(seat)"
                :class="[
                  'seats-seat rounded-md sm:rounded-lg border flex items-center justify-center text-[8px] sm:text-[10px] font-bold cursor-pointer',
                  seatWidthClass(seat.seat_type),
                  getSeatColor(seat),
                  seat.status === 'booked' || seat.status === 'maintenance'
                    ? 'cursor-not-allowed opacity-40'
                    : '',
                  isSeatSelected(seat) ? 'text-white' : 'text-neutral-500',
                ]"
                :style="isSeatSelected(seat) ? getSeatSelectedBg(seat) : ''"
                :disabled="seat.status === 'booked' || seat.status === 'maintenance'"
              >
                <!-- Old: seat number text -->
                {{ seat.seat_number }}

                <!-- New: seat icon from lucide-vue-next -->
                <!-- <Armchair
                  :size="seat.seat_type === 'couple' ? 18 : seat.seat_type === 'queen' ? 20 : 16"
                  :stroke-width="2"
                /> -->
              </button>
            </div>

            <!-- Row label right -->
            <span class="w-4 sm:w-6 text-center text-[9px] sm:text-[11px] font-bold text-neutral-500 hidden sm:block">
              {{ rowData.row }}
            </span>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex flex-col items-center justify-center gap-[10px] mt-6" >
        <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mb-3">
          <div class="flex items-center gap-1.5">
            <div class="w-4 h-4 rounded bg-white/[0.04] border border-white/[0.08]"></div>
            <span class="text-[9px] text-neutral-500">Available</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-4 h-4 rounded bg-blue-500"></div>
            <span class="text-[9px] text-neutral-500">Selected</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-4 h-4 rounded bg-white/[0.06] border border-white/[0.04] opacity-40"></div>
            <span class="text-[9px] text-neutral-500">Booked</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-4 h-4 rounded bg-red-900/20 border border-red-500/20"></div>
            <span class="text-[9px] text-neutral-500">Unavailable</span>
          </div>
        </div>

        <!-- Seat Type Legend -->
        <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-2 border-t border-white/[0.04]">
          <div v-for="(cfg, key) in seatTypes" :key="key" class="flex items-center gap-1.5">
            <div
              class="w-2.5 h-2.5 rounded-full"
              :style="{ background: cfg.color }"
            ></div>
            <span class="text-[9px] text-neutral-400">{{ cfg.label }} ${{ cfg.price.toFixed(2) }}</span>
          </div>
        </div>
        </div>
      </div>

      <!-- Bottom Bar / Summary -->
      <div
        class="seats-bottom-bar sticky bottom-0 px-5 py-4 border-t border-white/[0.06] flex items-center justify-between gap-4"
      >
        <div class="flex-1 min-w-0">
          <div v-if="selectedSeats.length > 0" class="flex flex-wrap gap-1.5 mb-1.5">
            <span
              v-for="seat in selectedSeats"
              :key="seat.id"
              class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold"
              :style="`background: ${seatTypes[seat.seat_type].color}22; color: ${seatTypes[seat.seat_type].color};`"
            >
              {{ seat.id }}
            </span>
          </div>
          <p v-if="selectedSeats.length > 0" class="text-xs text-neutral-400">
            {{ selectedSeats.length }} seat{{ selectedSeats.length > 1 ? "s" : "" }} ·
            <span class="font-bold text-white">${{ totalPrice.toFixed(2) }}</span>
          </p>
          <p v-else class="text-xs text-neutral-500">
            Tap a seat to select
          </p>
        </div>

        <button
          :disabled="selectedSeats.length === 0"
          :class="[
            'seats-confirm-btn px-8 py-3 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap',
            selectedSeats.length > 0
              ? 'text-white'
              : 'text-neutral-600 bg-white/[0.04] border border-white/[0.06] cursor-not-allowed',
          ]"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seats-page {
  background: #0a0a0c;
}

.seats-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(14, 165, 233, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse 50% 40% at 80% 100%, rgba(139, 92, 246, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.seats-screen {
  width: 70%;
  height: 4px;
  border-radius: 50%;
  background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.5), rgba(139, 92, 246, 0.4), transparent);
}

.seats-single {
  width: 28px;
  height: 28px;
}

.seats-couple {
  width: 48px;
  height: 28px;
}

.seats-queen {
  width: 56px;
  height: 28px;
}

@media (min-width: 640px) {
  .seats-single {
    width: 36px;
    height: 36px;
  }
  .seats-couple {
    width: 72px;
    height: 36px;
  }
  .seats-queen {
    width: 88px;
    height: 36px;
  }
}

.seats-seat {
  transition: none;
}

.seats-bottom-bar {
  background: rgba(10, 10, 12, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.seats-confirm-btn {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

.seats-confirm-btn:disabled {
  background: none;
}
</style>
