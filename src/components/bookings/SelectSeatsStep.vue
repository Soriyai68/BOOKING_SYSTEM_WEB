<template>
  <div class="select-seats-step">
    <el-alert :title="$t('bookings.selectSeatsInstruction')" type="info" show-icon :closable="false" style="margin-bottom: 20px;"></el-alert>
    <div v-if="loading.seats" v-loading="loading.seats" style="min-height: 300px; width: 100%;"></div>
    <div v-else class="seat-map-container">
      <div class="screen-container">
        <div class="screen-arc"></div>
        <div class="screen-text">{{ $t("bookings.screen") }}</div>
      </div>

      <div class="seat-map">
        <div v-for="row in seatLayout" :key="row.row" class="seat-row">
          <div class="row-label">{{ row.row }}</div>
          <div class="seats-container">
            <div class="seats-section" v-if="row.sections.left.length">
              <div
                  v-for="seat in row.sections.left"
                  :key="seat.id"
                  class="seat"
                  :class="getSeatClass(seat)"
                  @click="toggleSeat(seat)"
                  :title="`${seat.row}${seat.seat_number}`"
              >
                <span class="seat-number">{{ seat.seat_number }}</span>
              </div>
            </div>
            <div class="seats-section" v-if="row.sections.middle.length">
              <div
                  v-for="seat in row.sections.middle"
                  :key="seat.id"
                  class="seat"
                  :class="getSeatClass(seat)"
                  @click="toggleSeat(seat)"
                  :title="`${seat.row}${seat.seat_number}`"
              >
                <span class="seat-number">{{ seat.seat_number }}</span>
              </div>
            </div>
            <div class="seats-section" v-if="row.sections.right.length">
              <div
                  v-for="seat in row.sections.right"
                  :key="seat.id"
                  class="seat"
                  :class="getSeatClass(seat)"
                  @click="toggleSeat(seat)"
                  :title="`${seat.row}${seat.seat_number}`"
              >
                <span class="seat-number">{{ seat.seat_number }}</span>
              </div>
            </div>
          </div>
          <div class="row-label">{{ row.row }}</div>
        </div>
      </div>

      <div class="legend">
        <div class="legend-item">
          <div class="seat available"><span class="seat-number"></span></div>
          <span>{{ $t("seats.statuses.available") }}</span>
        </div>
        <div class="legend-item">
          <div class="seat selected"><span class="seat-number"></span></div>
          <span>{{ $t("seats.statuses.selected") }}</span>
        </div>
        <div class="legend-item">
          <div class="seat booked"><span class="seat-number"></span></div>
          <span>{{ $t("seats.statuses.booked") }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { seatService } from "@/services/seatService";
import { seatBookingService } from "@/services/seatBookingService";

const props = defineProps({
  showtime: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Set,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "update:selectedSeatDetails"]);

const loading = reactive({
  seats: false,
});

const hallSeats = ref([]);
const bookedSeats = ref([]);

const loadSeatData = async () => {
  if (!props.showtime?.hall_id) return;

  loading.seats = true;
  try {
    const [seatResponse, bookings] = await Promise.all([
      seatService.getSeatsByHall(props.showtime.hall_id, { per_page: 100 }),
      seatBookingService.getRawSeatBookingsForShowtime(props.showtime.id),
    ]);

    hallSeats.value = seatResponse.data;
    bookedSeats.value = bookings.seatBookings.map((b) => b.seatId?._id.toString());

    // After loading seat data, we can emit the details of any already selected seats.
    const newSelectedSeats = new Set(props.modelValue);
    const selectedDetails = hallSeats.value.filter(s => newSelectedSeats.has(s.id?.toString()));
    emit('update:selectedSeatDetails', selectedDetails);

  } catch (error) {
    console.error("Failed to load seat data:", error);
  } finally {
    loading.seats = false;
  }
};

const seatRows = computed(() => {
  if (!hallSeats.value) return [];
  const rows = {};
  hallSeats.value.forEach((seat) => {
    if (!rows[seat.row]) {
      rows[seat.row] = { row: seat.row, seats: [] };
    }
    rows[seat.row].seats.push(seat);
  });
  Object.values(rows).forEach((row) => {
    row.seats.sort((a, b) => a.seat_number - b.seat_number);
  });
  return Object.values(rows).sort((a, b) => a.row.localeCompare(b.row));
});

const seatLayout = computed(() => {
  if (!seatRows.value.length) return [];

  return seatRows.value.map(row => {
    const seats = row.seats;
    const totalSeats = seats.length;

    let leftSeats = [], middleSeats = [], rightSeats = [];

    if (totalSeats < 7) { // For small rows, display as a single block
      middleSeats = seats;
    } else if (totalSeats < 13) { // For medium rows, split into two blocks
      const splitPoint = Math.ceil(totalSeats / 2);
      leftSeats = seats.slice(0, splitPoint);
      rightSeats = seats.slice(splitPoint);
    } else { // For large rows, split into three blocks
      const sideSize = Math.floor(totalSeats / 4);
      leftSeats = seats.slice(0, sideSize);
      middleSeats = seats.slice(sideSize, totalSeats - sideSize);
      rightSeats = seats.slice(totalSeats - sideSize);
    }

    return {
      ...row,
      sections: {
        left: leftSeats,
        middle: middleSeats,
        right: rightSeats,
      }
    };
  });
});

const getSeatClass = (seat) => {
  const seatId = seat.id?.toString();
  if (bookedSeats.value.includes(seatId)) return "booked";
  if (props.modelValue.has(seatId)) return "selected";
  return "available";
};

const toggleSeat = (seat) => {
  const seatId = seat.id?.toString();
  if (bookedSeats.value.includes(seatId)) return;

  const newSelectedSeats = new Set(props.modelValue);
  if (newSelectedSeats.has(seatId)) {
    newSelectedSeats.delete(seatId);
  } else {
    newSelectedSeats.add(seatId);
  }
  emit("update:modelValue", newSelectedSeats);

  const selectedDetails = hallSeats.value.filter(s => newSelectedSeats.has(s.id?.toString()));
  emit('update:selectedSeatDetails', selectedDetails);
};

watch(() => props.showtime, (newShowtime) => {
      if (newShowtime) {
        loadSeatData();
      }
    }, { immediate: true });

</script>

<style scoped>
.select-seats-step {
  margin: 0 auto;
  padding: 20px 40px;
  max-width: 11000px;
  outline: 1px solid var(--el-border-color-lighter);
}

.seat-map-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--el-fill-color-lighter);
  padding: 40px;
  border-radius: 8px;
}

.screen-container {
  width: 100%;
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  height: 50px; /* Made thinner */
}

.screen-arc {
  width: 80%;
  height: 100px;
  border:  4px solid var(--el-fill-color-light);
  border-color: var(--el-text-color-primary) transparent transparent transparent;
  border-radius: 100% / 25px;
  position: absolute;
  left: 10%;
  top: 0;
  box-sizing: content-box;
  opacity: 0.2;
}

.screen-text {
  position: relative;
  top: -25px;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  font-weight: bold;
}

.seat-map {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.seat-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.row-label {
  width: 25px;
  font-weight: bold;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.seats-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 36px;
}

.seats-section {
  display: flex;
  gap: 12px;
}

.seat {
  width: 25px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px 6px 2px 2px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease-in-out;
  font-weight: 600;
  position: relative;
}

.seat-number {
  font-size: 12px;
}

.seat.available {
  background-color: var(--el-color-info-light-7);
  color: var(--el-text-color-regular);
}
.seat.available:hover {
  background-color: var(--el-color-info-light-5);
  transform: scale(1.1);
}

.seat.selected {
  background-color: var(--el-color-primary);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 12px var(--el-color-primary-light-3);
}

.seat.booked {
  background-color: var(--el-color-info);
  color: var(--el-color-white);
  cursor: not-allowed;
}

.legend {
  margin-top: 50px;
  display: flex;
  gap: 25px;
  padding: 10px 10px;
  background: var(--el-bg-color-overlay);
  border-radius: 6px;
  box-shadow: var(--el-box-shadow-light);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.legend-item .seat {
  width: 13px;
  height: 15px;
  cursor: default;
  transform: scale(1);
  box-shadow: none;
}
.legend-item .seat:hover {
  transform: none;
}
.legend-item .seat .seat-number {
  display: none;
}

</style>
