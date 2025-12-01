<template>
  <div class="duplicate-showtime">
    <div class="page-header">
      <h2>{{ $t("showtimes.duplicateShowtime") }}</h2>
    </div>
    <el-card v-if="!loading">
      <multiple-showtime-creator
        :movies="movies"
        :theaters="theaters"
        :halls="hallsForSelectedTheater"
        :initial-data="form.showtimes"
        :initial-theater-id="form.theater_id"
        :is-duplicate-mode="true"
        @theater-changed="onTheaterChange"
        @submitted="onSubmitted"
      />
    </el-card>
    <div v-else class="loading-container">
      <app-loading />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { showtimeService } from "@/services/showtimeService";
import { movieService } from "@/services/movieService";
import { hallService } from "@/services/hallService";
import { theaterService } from "@/services/theaterService";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import MultipleShowtimeCreator from "@/components/showtimes/MultipleShowtimeCreator.vue";
import AppLoading from "@/components/common/AppLoading.vue";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

// const loading = ref(true);
const form = reactive({
  theater_id: "",
  showtimes: [],
});

const movies = ref([]);
const theaters = ref([]);
const allHalls = ref([]);

const hallsForSelectedTheater = computed(() => {
  if (!form.theater_id) return [];
  return allHalls.value.filter((hall) => hall.theater_id === form.theater_id);
});

const onTheaterChange = (theaterId) => {
  form.theater_id = theaterId;
};

const onSubmitted = () => {
  router.push("/admin/showtimes");
};

onMounted(async () => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("showtimes.title"), path: "/admin/showtimes" },
    {
      title: t("showtimes.duplicateShowtime"),
      path: route.fullPath,
    },
  ]);

  // loading.value = true;
  try {
    const [movieRes, hallRes, theaterRes] = await Promise.all([
      movieService.getMovies({ per_page: 100, status: "now_showing" }),
      hallService.getHalls({ per_page: 100 }),
      theaterService.getTheaters({ per_page: 100 }),
    ]);
    movies.value = movieRes.data || [];
    allHalls.value = hallRes.data || [];
    theaters.value = theaterRes.data || [];

    const ids = route.params.ids ? route.params.ids.split(",") : [];
    if (ids.length === 0) {
      ElMessage.warning(t("showtimes.noShowtimeToDuplicate"));
      router.back();
      return;
    }

    const showtimePromises = ids.map((id) => showtimeService.getShowtime(id));
    const results = await Promise.all(showtimePromises);

    const initialTheaterId = results.length > 0 ? results[0].theater_id : "";
    form.theater_id = initialTheaterId;

    form.showtimes = results.map((s) => {
      const date = new Date(s.show_date);
      const formattedDate = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
      return {
        ...s,
        show_date: formattedDate,
      };
    });
  } catch (error) {
    console.error("Failed to load data for duplication:", error);
    ElMessage.error(t("messages.loadFailed"));
  } finally {
    // loading.value = false;
  }
});
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>
