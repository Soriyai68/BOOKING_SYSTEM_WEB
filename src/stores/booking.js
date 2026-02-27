import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useBookingStore = defineStore("booking", () => {
  const selectedShowtime = ref(null);
  const selectedSeats = ref([]);
  const movieDetails = ref(null);

  const isShowtimeSelected = computed(() => !!selectedShowtime.value);
  const totalSeatsCount = computed(() => selectedSeats.value.length);
  const totalPrice = computed(() => {
    return selectedSeats.value.reduce(
      (sum, seat) => sum + (seat.price || 0),
      0,
    );
  });

  const selectShowtime = (showtime, movie = null) => {
    selectedShowtime.value = showtime;
    if (movie) movieDetails.value = movie;
    // Clear selected seats when showtime changes
    selectedSeats.value = [];
  };

  const toggleSeat = (seat) => {
    const index = selectedSeats.value.findIndex((s) => s.id === seat.id);
    if (index >= 0) {
      selectedSeats.value.splice(index, 1);
    } else {
      selectedSeats.value.push(seat);
    }
  };

  const clearBooking = () => {
    selectedShowtime.value = null;
    selectedSeats.value = [];
    movieDetails.value = null;
  };

  return {
    selectedShowtime,
    selectedSeats,
    movieDetails,
    isShowtimeSelected,
    totalSeatsCount,
    totalPrice,
    selectShowtime,
    toggleSeat,
    clearBooking,
  };
});
