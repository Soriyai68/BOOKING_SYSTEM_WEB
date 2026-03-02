import { defineStore } from "pinia";
import { computed } from "vue";
import { useLocalStorage } from "@vueuse/core";

export const useBookingStore = defineStore("booking", () => {
  const customSerializer = {
    read: (v) => {
      if (!v) return null;
      try {
        return JSON.parse(v);
      } catch (e) {
        return null;
      }
    },
    write: (v) => JSON.stringify(v),
  };

  const selectedShowtime = useLocalStorage("booking_showtime", null, {
    serializer: customSerializer,
  });
  const selectedSeats = useLocalStorage("booking_seats", []);
  const movieDetails = useLocalStorage("booking_movie", null, {
    serializer: customSerializer,
  });

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
