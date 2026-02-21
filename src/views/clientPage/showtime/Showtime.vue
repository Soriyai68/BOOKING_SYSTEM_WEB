<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  MapPin,
  Clock,
  Armchair,
  TicketX,
  Ticket,
  ChevronRight,
  Search,
  X,
} from "lucide-vue-next";

const searchActive = ref(false);
const searchQuery = ref("");

const router = useRouter();

const dates = ref([
  { dayName: "Thu", dayNum: "12", day: "12", month: "Jun", active: true },
  { dayName: "Fri", dayNum: "13", day: "13", month: "Jun", active: false },
  { dayName: "Sat", dayNum: "14", day: "14", month: "Jun", active: false },
  { dayName: "Sun", dayNum: "15", day: "15", month: "Jun", active: false },
  { dayName: "Mon", dayNum: "16", day: "16", month: "Jun", active: false },
  { dayName: "Tue", dayNum: "17", day: "17", month: "Jun", active: false },
  { dayName: "Wed", dayNum: "18", day: "18", month: "Jun", active: false },
]);

const movies = ref([
  {
    id: 1,
    title: "Avatar: Way of Water",
    poster:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
    hall: "Hall 01",
    duration: "3h 12m",
    genre: "Sci-Fi / Action",
    availableSeats: 42,
    totalSeats: 120,
    time: "10:30",
    selected: true,
    disabled: false,
  },
  {
    id: 2,
    title: "Inception",
    poster:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400",
    hall: "Hall 04",
    duration: "2h 28m",
    genre: "Thriller",
    availableSeats: 12,
    totalSeats: 80,
    time: "13:15",
    selected: false,
    disabled: false,
  },
  {
    id: 3,
    title: "The Dark Knight",
    poster:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400",
    hall: "Hall 01",
    duration: "2h 32m",
    genre: "Action / Drama",
    availableSeats: 0,
    totalSeats: 50,
    time: "16:45",
    selected: false,
    disabled: true,
  },
  {
    id: 4,
    title: "Interstellar",
    poster:
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400",
    hall: "Hall 02",
    duration: "2h 49m",
    genre: "Sci-Fi / Adventure",
    availableSeats: 8,
    totalSeats: 100,
    time: "19:30",
    selected: false,
    disabled: false,
  },
  {
    id: 5,
    title: "Dune: Part Two",
    poster:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400",
    hall: "Hall 01",
    duration: "2h 15m",
    genre: "Sci-Fi / Drama",
    availableSeats: 60,
    totalSeats: 100,
    time: "22:15",
    selected: false,
    disabled: false,
  },
]);

const selectDate = (selectedDate) => {
  dates.value.forEach((date) => {
    date.active = date.day === selectedDate.day;
  });
};

const selectMovie = (selectedMovie) => {
  if (selectedMovie.disabled) return;
  movies.value.forEach((movie) => {
    movie.selected = movie.id === selectedMovie.id;
  });
};

const selectedMovie = computed(() => movies.value.find((m) => m.selected));

const currentMovieCount = computed(
  () => movies.value.filter((m) => !m.disabled).length,
);

const getSeatPercentage = (movie) => {
  return Math.round((movie.availableSeats / movie.totalSeats) * 100);
};

const getSeatColor = (movie) => {
  const pct = getSeatPercentage(movie);
  if (pct > 50) return "#22c55e";
  if (pct > 20) return "#eab308";
  return "#ef4444";
};

const toggleSettings = () => {
  router.push("/layout/settings");
};
const handleReserveSeats = () => {
  router.push("/layout/seats");
};
</script>

<template>
  <div class="showtime-page min-h-screen text-white relative overflow-hidden">
    <!-- Background -->
    <div class="showtime-bg"></div>

    <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
      <!-- Header -->
      <header
        class="showtime-header sticky top-0 z-30 py-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <img
            src="@/assets/rsb-cinema.png"
            alt="RSB Cinema Logo"
            class="w-14 h-16 object-contain"
          />
          <div>
            <h1 class="text-[12px] font-bold leading-snug">
              រោងភាពយន្ត អ័រ អេស ប៊ី​ ឯកភ្នំ
            </h1>
            <p
              class="text-[10px] font-semibold text-neutral-500 mt-0.5 tracking-wide uppercase"
            >
              RSB CINEMA EK PHNOM
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="toggleSettings"
            class="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] overflow-hidden cursor-pointer hover:border-white/20"
          >
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Profile"
              class="w-full h-full object-cover"
            />
          </button>
        </div>
      </header>

      <!-- Welcome Section -->
      <div class="mt-6 mb-8">
        <p
          class="text-[11px] text-sky-400 font-semibold uppercase tracking-[0.2em] mb-2"
        >
          Welcome back, Alex
        </p>
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight">
          Today's <span class="showtime-gradient-text">Showtime</span>
        </h2>
        <p class="text-sm text-neutral-400 mt-1">
          {{ currentMovieCount }} sessions available
        </p>
      </div>

      <!-- Date Picker -->
      <div class="mb-8">
        <div
          class="flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:items-center sm:justify-center"
        >
          <button
            v-for="date in dates"
            :key="date.day"
            @click="selectDate(date)"
            class="flex flex-col items-center min-w-[60px] py-3 px-2 rounded-2xl border cursor-pointer"
            :class="
              date.active
                ? 'showtime-date-active'
                : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-neutral-400'
            "
          >
            <span
              class="text-[10px] uppercase font-semibold tracking-wider opacity-70"
              >{{ date.dayName }}</span
            >
            <span class="text-xl font-bold mt-1">{{ date.day }}</span>
            <span class="text-[9px] uppercase mt-0.5 opacity-50">{{
              date.month
            }}</span>
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-6">
        <div class="showtime-search-bar" :class="{ active: searchActive }">
          <Search :size="16" class="text-neutral-500 flex-shrink-0" />
          <input
            v-model="searchQuery"
            @focus="searchActive = true"
            @blur="!searchQuery ? (searchActive = false) : null"
            type="text"
            placeholder="Search movies..."
            class="showtime-search-input"
          />

          <button
            v-if="searchQuery"
            @click="
              searchQuery = '';
              searchActive = false;
            "
            class="showtime-search-clear"
          >
            <X :size="14" class="text-neutral-400" />
          </button>
        </div>
      </div>

      <!-- Movie Grid -->
      <div class="space-y-4">
        <div
          v-for="movie in movies"
          :key="movie.id"
          @click="selectMovie(movie)"
          class="group rounded-2xl border overflow-hidden cursor-pointer"
          :class="[
            movie.disabled
              ? 'opacity-40 cursor-not-allowed grayscale border-white/[0.04] bg-white/[0.02]'
              : movie.selected
                ? 'showtime-movie-selected border-sky-500/30 bg-sky-500/[0.04]'
                : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.12]',
          ]"
        >
          <div class="flex gap-4 p-4">
            <!-- Poster -->
            <div
              class="relative w-20 h-28 sm:w-24 sm:h-32 rounded-xl overflow-hidden flex-shrink-0"
            >
              <img
                :src="movie.poster"
                :alt="movie.title"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
              ></div>
              <!-- Time badge on poster -->
              <div
                class="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md"
                :class="
                  movie.disabled
                    ? 'bg-neutral-700/80 text-neutral-400'
                    : 'bg-sky-500/80 text-white'
                "
              >
                {{ movie.time }}
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 flex flex-col justify-between py-1">
              <div>
                <h3 class="text-base sm:text-lg font-bold leading-tight mb-1">
                  {{ movie.title }}
                </h3>
                <p class="text-[11px] text-neutral-500 font-medium mb-3">
                  {{ movie.genre }}
                </p>

                <div
                  class="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-neutral-400"
                >
                  <span class="flex items-center gap-1.5">
                    <MapPin
                      :size="12"
                      stroke-width="2"
                      class="text-neutral-500"
                    />
                    {{ movie.hall }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <Clock
                      :size="12"
                      stroke-width="2"
                      class="text-neutral-500"
                    />
                    {{ movie.duration }}
                  </span>
                </div>
              </div>

              <!-- Seat availability bar -->
              <div v-if="!movie.disabled" class="mt-3">
                <div class="flex items-center justify-between mb-1.5">
                  <span
                    class="flex items-center gap-1 text-[11px] text-neutral-400"
                  >
                    <Armchair :size="12" stroke-width="2" />
                    {{ movie.availableSeats }} / {{ movie.totalSeats }} seats
                  </span>
                  <span
                    class="text-[10px] font-bold"
                    :style="{ color: getSeatColor(movie) }"
                  >
                    {{ getSeatPercentage(movie) }}%
                  </span>
                </div>
                <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    :style="{
                      width: getSeatPercentage(movie) + '%',
                      background: `linear-gradient(90deg, ${getSeatColor(movie)}, ${getSeatColor(movie)}88)`,
                    }"
                  ></div>
                </div>
              </div>
              <div v-else class="mt-3">
                <span
                  class="flex items-center gap-1.5 text-[11px] text-red-400 font-semibold"
                >
                  <TicketX :size="13" stroke-width="2" />
                  Sold Out
                </span>
              </div>
            </div>

            <!-- Arrow indicator -->
            <div
              v-if="!movie.disabled"
              class="flex items-center self-center opacity-0 group-hover:opacity-100"
            >
              <ChevronRight :size="18" class="text-neutral-500" />
            </div>
          </div>

          <!-- Selected indicator line -->
          <div
            v-if="movie.selected && !movie.disabled"
            class="h-[2px] bg-gradient-to-r from-transparent via-sky-500 to-transparent"
          ></div>
        </div>
      </div>
    </div>

    <!-- Floating Reserve Button -->
    <div
      v-if="selectedMovie"
      class="fixed bottom-0 left-0 right-0 z-40 p-4 showtime-footer-blur"
    >
      <div class="max-w-5xl mx-auto">
        <button
          @click="handleReserveSeats"
          class="showtime-reserve-btn w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-bold text-sm cursor-pointer active:scale-[0.98]"
        >
          <Ticket :size="20" stroke-width="2" />
          <span>Reserve Seats — {{ selectedMovie.title }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.showtime-page {
  background: #0a0a0c;
}

.showtime-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      ellipse 80% 50% at 20% 0%,
      rgba(14, 165, 233, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse 60% 40% at 90% 100%,
      rgba(139, 92, 246, 0.03) 0%,
      transparent 50%
    );
  pointer-events: none;
}

.showtime-header {
  background: rgba(10, 10, 12, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  margin: 0 -1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.showtime-gradient-text {
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.showtime-date-active {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  border-color: rgba(14, 165, 233, 0.4);
  color: #fff;
  box-shadow:
    0 0 0 1px rgba(14, 165, 233, 0.2),
    0 4px 16px -4px rgba(14, 165, 233, 0.3);
}

.showtime-movie-selected {
  box-shadow:
    0 0 0 1px rgba(14, 165, 233, 0.15),
    0 4px 24px -8px rgba(14, 165, 233, 0.15);
}

.showtime-footer-blur {
  background: linear-gradient(
    to top,
    rgba(10, 10, 12, 0.95),
    rgba(10, 10, 12, 0.8) 60%,
    transparent
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.showtime-reserve-btn {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  box-shadow:
    0 0 0 1px rgba(14, 165, 233, 0.3),
    0 8px 32px -8px rgba(14, 165, 233, 0.4);
}

.showtime-reserve-btn:hover {
  box-shadow:
    0 0 0 1px rgba(14, 165, 233, 0.5),
    0 12px 40px -8px rgba(14, 165, 233, 0.5);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.showtime-search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 10px 14px;
  transition: all 0.25s ease;
}

.showtime-search-bar.active {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(14, 165, 233, 0.25);
  box-shadow:
    0 0 0 1px rgba(14, 165, 233, 0.08),
    0 2px 8px -2px rgba(14, 165, 233, 0.1);
}

.showtime-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 13px;
  min-width: 0;
}

.showtime-search-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.showtime-search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.showtime-search-clear:hover {
  background: rgba(255, 255, 255, 0.12);
}
</style>
