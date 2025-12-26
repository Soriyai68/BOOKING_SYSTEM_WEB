<template>
  <div class="step-content">
    <div class="filter-controls">
      <el-input
        style="width: 650px"
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
            { selected: modelValue?.id === showtime.id },
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
              <!-- <div v-if="showtime.occupancy >= 0.9" class="selling-fast-badge">
                {{ $t("bookings.sellingFast") }}
              </div> -->
            </div>

            <!-- Details -->
            <div class="details-section">
              <div>
                <div class="details-header">
                  <h3 class="movie-title">
                    {{ showtime.movie_title }}
                  </h3>
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
                    <span>{{ showtime.show_date }}</span>
                  </div>
                  <div class="showtime-meta-item">
                    <Clock class="meta-icon" />
                    <span class="font-semibold">{{ showtime.start_time }}</span>
                  </div>
                  <div class="showtime-meta-item">
                    <Ticket class="meta-icon" />
                    <span
                      >{{ showtime.bookedCount }} / {{ showtime.totalCount }}
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
                      backgroundColor: getProgressBarColor(showtime.occupancy),
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
        <h3 class="placeholder-title">{{ $t("bookings.noShowtimesFound") }}</h3>
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
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { Calendar, Clock, MapPin, Ticket, Search } from "lucide-vue-next";
import { showtimeService } from "@/services/showtimeService";
import { seatService } from "@/services/seatService";
import { seatBookingService } from "@/services/seatBookingService";
import { formatDate } from "@/utils/formatters";

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const { t } = useI18n();

const loading = reactive({
  showtimes: false,
});

const showtimeOptions = ref([]);
const showtimeSearch = ref("");
const selectedDateFilter = ref("today");

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
            const bookedSeatsResponse =
              await seatBookingService.getSeatBookings({
                showtimeId: showtime.id,
                status: "booked",
                limit: 1,
              });
            const bookedCount = bookedSeatsResponse.total || 0;

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
              show_date: formatDate(showtime.start_time),
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
  if (props.modelValue?.id === showtime.id) {
    emit("update:modelValue", null);
  } else {
    emit("update:modelValue", showtime);
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

watch(selectedDateFilter, () => {
  loadShowtimes();
});

onMounted(() => {
  loadShowtimes();
});
</script>

<style scoped>
.step-content {
  margin: 0px;
  padding: 30px 40px;
  outline: 1px solid var(--el-border-color-lighter);
}

/* Showtime List Styles */
.showtime-list {
  width: 100%;
}

.showtime-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.showtime-card {
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
  padding: 0.75rem;
}

@media (min-width: 640px) {
  .showtime-card-content-wrapper {
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

.selling-fast-badge {
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
  gap: 2rem;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.movie-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: var(--el-text-color-primary);
  transition: color 0.3s;
}

.showtime-card:hover .movie-title {
  color: var(--el-color-primary);
}

.showtime-meta-grid {
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem 1rem;
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
}

@media (min-width: 640px) {
  .showtime-meta-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.showtime-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-icon {
  width: 1rem;
  height: 1rem;
  color: var(--el-color-primary);
}

.font-semibold {
  font-weight: 600;
  color: var(--el-text-color-regular);
}

.occupancy-progress-container {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

.occupancy-labels {
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
.filter-controls {
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 10px;
}
.date-filter-buttons {
  display: flex;
}
</style>
