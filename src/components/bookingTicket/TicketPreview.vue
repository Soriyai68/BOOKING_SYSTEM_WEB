<template>
  <div class="ticket-preview-container" v-if="booking">
    <div class="ticket-container printable-ticket">
      <div class="header">
        <h1 class="cinema-name">Ninja Booking</h1>
        <p class="datetime">
          {{ formatDateWithDay(booking.showtime_id?.show_date) }} |
          {{ formatTime(booking.showtime_id?.start_time) }}
        </p>
      </div>

      <div class="main-info">
        <div class="hall-info">
          <span class="label">HALL</span>
          <span class="value">{{
            booking.showtime_id?.hall_id?.hall_name || "1"
          }}</span>
        </div>
        <div class="seat-info">
          <span class="label">Seat:</span>
          <span class="value">{{
            booking.seats
              ? booking.seats.map((s) => s.seat_number).join(", ")
              : ""
          }}</span>
        </div>
      </div>

      <div class="details">
        <div class="detail-row">
          <span class="codes">{{ booking.ticket_code }}</span>
          <span class="type">
            {{
              booking.seats[0]?.ticket_type
                ? booking.seats[0].ticket_type.charAt(0).toUpperCase() +
                  booking.seats[0].ticket_type.slice(1)
                : ""
            }}
          </span>
          <span class="price">{{
            formatCurrency(booking.seats[0]?.price)
          }}</span>
        </div>
        <p class="movie-title">{{ booking.showtime_id?.movie_id?.title }}</p>
        <p class="print-time">
          {{ formatDateTimeWithAMPM(new Date()) }}
        </p>
      </div>

      <div class="footer">
        <div class="separator"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  formatCurrency,
  formatDateWithDay,
  formatTime,
  formatDateTimeWithAMPM,
} from "@/utils/formatters";

defineProps({
  booking: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.ticket-preview-container {
  display: flex;
  justify-content: center;
  padding: 10px;
}

.ticket-container {
  width: 80mm;
  text-align: center;
  background: white;
  padding: 15px;
  color: black;
  font-family: "Courier New", Courier, monospace;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  line-height: 1.2;
}

.cinema-name {
  font-size: 18px;
  font-weight: bold;
  margin: 5px 0;
}

.datetime {
  font-size: 11px;
  margin-bottom: 10px;
}

.main-info {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  padding: 8px 0;
  margin-bottom: 10px;
}

.main-info > div {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  font-weight: bold;
}

.value {
  font-size: 24px;
  font-weight: bold;
}

.details {
  text-align: left;
  font-size: 10px;
  line-height: 1.3;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
}

.movie-title {
  font-size: 12px;
  font-weight: bold;
  margin: 4px 0;
}

.print-time {
  font-size: 9px;
  margin-top: 5px;
}

.separator {
  border-top: 1px dashed black;
  margin-top: 15px;
}

@media print {
  .ticket-container {
    box-shadow: none;
    width: 80mm; /* Fix width at 80mm for thermal printers */
    margin: 0 auto;
    padding: 10px 0;
  }
}
</style>
