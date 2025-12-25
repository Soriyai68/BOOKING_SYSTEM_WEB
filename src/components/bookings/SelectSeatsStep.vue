<template>
  <div class="step-content">
    <div v-if="loading.seats" v-loading="loading.seats" style="min-height: 200px"></div>
    <div v-else class="seat-map-container">
      <div class="screen">{{ $t("bookings.screen") }}</div>
      <div class="seat-map">
        <div v-for="row in seatRows" :key="row.row" class="seat-row">
          <div class="row-label">{{ row.row }}</div>
          <div
            v-for="seat in row.seats"
            :key="seat.id"
            class="seat"
            :class="getSeatClass(seat)"
            @click="toggleSeat(seat)"
          >
            {{ seat.seat_number }}
          </div>
        </div>
      </div>
      <div class="legend">
        <div class="legend-item">
          <span class="seat available"></span>
          {{ $t("seats.statuses.available") }}
        </div>
        <div class="legend-item">
          <span class="seat selected"></span>
          {{ $t("seats.statuses.selected") }}
        </div>
        <div class="legend-item">
          <span class="seat booked"></span>
          {{ $t("seats.statuses.booked") }}
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
.step-content {
  margin: 20px 0;
  padding: 0 40px;
}
.seat-map-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.screen {
  width: 80%;
  padding: 10px;
  margin-bottom: 30px;
  background-color: var(
    --el-color-info-dark-2
  ); 
  color: var(--el-color-white);
  text-align: center;
  border-radius: 5px;
  text-transform: uppercase;
}

.seat-map {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.seat-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.row-label {
  width: 20px;
  font-weight: bold;
  color: var(--el-text-color-regular); 
}

.seat {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--el-border-color); 
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  user-select: none;
}

.seat.available {
  background-color: var(
    --el-fill-color-blank
  ); 
  color: var(--el-text-color-primary); 
}
.seat.available:hover {
  background-color: var(
    --el-fill-color-light
  ); 
}
.seat.selected {
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
  border-color: var(--el-color-primary);
}
.seat.booked {
  background-color: var(
    --el-color-info-light-3
  ); 
  color: var(--el-color-white);
  cursor: not-allowed;
  border-color: var(--el-color-info-light-3);
}

.legend {
  margin-top: 20px;
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-item .seat {
  width: 20px;
  height: 20px;
  cursor: default;
}
</style>
