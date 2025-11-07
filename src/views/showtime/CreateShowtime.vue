<template>
  <div class="create-showtime">
    <div class="page-header">
      <h2>{{ $t("showtimes.addShowtime") }}</h2>
      <el-button @click="$router.back()">
        <el-icon>
          <ArrowLeft/>
        </el-icon>
        {{ $t("actions.back") }}
      </el-button>
    </div>

    <el-card>
      <MultipleShowtimeCreator
          :movies="movies"
          :theaters="theaters"
          :halls="halls"
          :initial-theater-id="initialTheaterId"
          @theater-changed="loadHallsForMultiple"
          @submitted="handleShowtimesCreated"
      />
    </el-card>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useAppStore} from "@/stores/app";
import {movieService} from "@/services/movieService";
import {theaterService} from "@/services/theaterService";
import {hallService} from "@/services/hallService";
import {ElMessage} from "element-plus";
import {useI18n} from "vue-i18n";
import MultipleShowtimeCreator from "@/components/showtimes/MultipleShowtimeCreator.vue";
import {ArrowLeft} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const {t} = useI18n();

// --- State Management ---
const movies = ref([]);
const theaters = ref([]);
const halls = ref([]);
const initialTheaterId = ref(route.query.theater_id || "");

// --- Data Loading ---
const loadMovies = async () => {
  try {
    const response = await movieService.getMovies({
      status: "now_showing",
      per_page: 100,
    });
    movies.value = response.data || [];
  } catch (error) {
    console.error("Failed to load movies:", error);
    ElMessage.error(t("movies.loadFailed"));
  }
};

const loadTheaters = async () => {
  try {
    const response = await theaterService.getTheaters({
      status: "active",
      per_page: 100,
    });
    theaters.value = response.data || [];
  } catch (error) {
    console.error("Failed to load theaters:", error);
    ElMessage.error(t("theaters.loadFailed"));
  }
};

const loadHalls = async (theaterId) => {
  if (theaterId) {
    try {
      const response = await hallService.getHalls({
        theater_id: theaterId,
        per_page: 100,
      });
      halls.value = response.data || [];
    } catch (error) {
      console.error("Failed to load halls:", error);
      halls.value = [];
      ElMessage.error(t("halls.loadFailed"));
    }
  } else {
    halls.value = [];
  }
};

const loadHallsForMultiple = async (theaterId) => {
  await loadHalls(theaterId);
};

// --- Form Submission ---
const handleShowtimesCreated = () => {
  router.push("/admin/showtimes");
};

onMounted(async () => {
  appStore.setBreadcrumbs([
    {title: t("nav.dashboard"), path: "/admin/dashboard"},
    {title: t("showtimes.title"), path: "/admin/showtimes"},
    {title: t("showtimes.addShowtime"), path: "/admin/showtimes/create"},
  ]);
  await loadMovies();
  await loadTheaters();

  if (initialTheaterId.value) {
    await loadHalls(initialTheaterId.value);
  }
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
</style>
