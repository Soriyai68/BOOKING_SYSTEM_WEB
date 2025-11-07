<template>
  <div class="edit-showtime">
    <div class="page-header">
      <h2>{{ $t("showtimes.editShowtime") }}</h2>
      <el-button @click="$router.back()">
        <el-icon>
          <ArrowLeft/>
        </el-icon>
        {{ $t("actions.back") }}
      </el-button>
    </div>
    
    <el-card v-loading="loading">
      <MultipleShowtimeCreator
        v-if="!loading"
        :movies="movies"
        :theaters="theaters"
        :halls="halls"
        :initial-theater-id="initialTheaterId"
        :initial-data="initialData"
        :is-update-mode="true"
        :showtime-id="route.params.id"
        @theater-changed="loadHalls"
        @submitted="handleUpdateSuccess"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { showtimeService } from "@/services/showtimeService";
import { movieService } from "@/services/movieService";
import { theaterService } from "@/services/theaterService";
import { hallService } from "@/services/hallService";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import MultipleShowtimeCreator from "@/components/showtimes/MultipleShowtimeCreator.vue";
import { ArrowLeft } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const loading = ref(true);
const movies = ref([]);
const theaters = ref([]);
const halls = ref([]);
const initialTheaterId = ref("");
const initialData = ref(null);

const loadShowtime = async () => {
  loading.value = true;
  try {
    const response = await showtimeService.getShowtime(route.params.id);
    const date = new Date(response.show_date);
    const formattedDate = date.toLocaleDateString("en-CA");

    // Prepare initial data for MultipleShowtimeCreator
    initialTheaterId.value = response.theater_id;
    initialData.value = [
      {
        key: Date.now(),
        id: response.id,
        movie_id: response.movie_id,
        hall_id: response.hall_id,
        show_date: formattedDate,
        start_time: response.start_time,
        end_time: response.end_time,
        status: response.status,
      },
    ];

    await Promise.all([loadMovies(), loadTheaters(), loadHalls(response.theater_id)]);
  } catch (error) {
    console.error("Failed to load showtime:", error);
    ElMessage.error(t("showtimes.loadFailed"));
  } finally {
    loading.value = false;
  }
};

const loadMovies = async () => {
  try {
    const response = await movieService.getMovies({ per_page: 100 });
    movies.value = response.data || [];
  } catch (error) {
    console.error("Failed to load movies:", error);
    ElMessage.error(t("movies.loadFailed"));
  }
};

const loadTheaters = async () => {
  try {
    const response = await theaterService.getTheaters({ per_page: 100 });
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

const handleUpdateSuccess = () => {
  router.push("/admin/showtimes");
};

onMounted(async () => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("showtimes.title"), path: "/admin/showtimes" },
    {
      title: t("showtimes.editShowtime"),
      path: `/admin/showtimes/${route.params.id}/edit`,
    },
  ]);
  await loadShowtime();
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
