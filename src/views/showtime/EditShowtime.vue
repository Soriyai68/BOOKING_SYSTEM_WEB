<template>
  <div class="edit-showtime">
    <div class="page-header">
      <h2>{{ $t("showtimes.editShowtime") }}</h2>
    </div>
    <el-card v-if="!loading">
      <el-form
        ref="showtimeForm"
        :model="showtime"
        :rules="rules"
        label-width="120px"
        @submit.prevent="submitForm"
      >
        <el-form-item :label="$t('showtimes.movie')" prop="movie_id">
          <el-select
            v-model="showtime.movie_id"
            placeholder="Select movie"
            filterable
          >
            <el-option
              v-for="movie in movies"
              :key="movie?.id"
              :label="movie.title"
              :value="movie?.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('showtimes.theater')" prop="theater_id">
          <el-select
            v-model="showtime.theater_id"
            placeholder="Select theater"
            filterable
            @change="loadHalls"
          >
            <el-option
              v-for="theater in theaters"
              :key="theater.id"
              :label="theater.name"
              :value="theater.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('showtimes.hall')" prop="hall_id">
          <el-select
            v-model="showtime.hall_id"
            placeholder="Select hall"
            filterable
            :disabled="!showtime.theater_id"
          >
            <el-option
              v-for="hall in halls"
              :key="hall.id"
              :label="hall.hall_name"
              :value="hall.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('showtimes.startTime')" prop="start_time">
          <el-date-picker
            v-model="showtime.start_time"
            type="datetime"
            placeholder="Select date and time"
          />
        </el-form-item>
        <el-form-item :label="$t('showtimes.endTime')" prop="end_time">
          <el-date-picker
            v-model="showtime.end_time"
            type="datetime"
            placeholder="Select date and time"
          />
        </el-form-item>
        <el-form-item :label="$t('showtimes.language')" prop="language">
          <el-select
            v-model="showtime.language"
            placeholder="Select language"
            filterable
          >
            <el-option
              v-for="language in showtimeService.LANGUAGE_OPTIONS"
              :key="language.value"
              :label="language.label"
              :value="language.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('showtimes.subtitle')" prop="subtitle">
          <el-select
            v-model="showtime.subtitle"
            placeholder="Select subtitle"
            filterable
          >
            <el-option
              v-for="subtitle in showtimeService.SUBTITLE_OPTIONS"
              :key="subtitle.value"
              :label="subtitle.label"
              :value="subtitle.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('showtimes.status')" prop="status">
          <el-select v-model="showtime.status" placeholder="Select status">
            <el-option
              v-for="status in showtimeService.STATUS_OPTIONS"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">{{
            $t("actions.update")
          }}</el-button>
          <el-button @click="$router.back()">{{
            $t("actions.cancel")
          }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <div v-else>{{ $t("messages.loading") }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { showtimeService } from "@/services/showtimeService";
import { movieService } from "@/services/movieService";
import { theaterService } from "@/services/theaterService";
import { hallService } from "@/services/hallService";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();
const showtimeForm = ref(null);
const loading = ref(true);

const showtime = reactive({
  id: null,
  movie_id: "",
  theater_id: "",
  hall_id: "",
  start_time: "",
  end_time: "",
  status: "",
});

const movies = ref([]);
const theaters = ref([]);
const halls = ref([]);

const rules = reactive({
  movie_id: [
    { required: true, message: "Please select a movie", trigger: "change" },
  ],
  theater_id: [
    { required: true, message: "Please select a theater", trigger: "change" },
  ],
  hall_id: [
    { required: true, message: "Please select a hall", trigger: "change" },
  ],
  start_time: [
    { required: true, message: "Please select a start time", trigger: "blur" },
  ],
  end_time: [
    { required: true, message: "Please select an end time", trigger: "blur" },
  ],
  status: [
    { required: true, message: "Please select a status", trigger: "change" },
  ],
});

const loadShowtime = async () => {
  loading.value = true;
  try {
    const response = await showtimeService.getShowtime(route.params.id);
    Object.assign(showtime, response);
    await Promise.all([loadMovies(), loadTheaters()]);
    await loadHalls(); // Load halls after getting theater_id
  } catch (error) {
    console.error("Failed to load showtime:", error);
    ElMessage.error(t("showtimes.loadFailed"));
  } finally {
    loading.value = false;
  }
};

const loadMovies = async () => {
  try {
    const response = await movieService.getMovies({
      status: "now_showing",
      per_page: 100,
    }); // Fetch all movies
    if (response.data) {
      movies.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load movies:", error);
    ElMessage.error(t("movies.loadFailed"));
  }
};

const loadTheaters = async () => {
  try {
    const response = await theaterService.getTheaters({ per_page: 100 }); // Fetch all theaters
    if (response.data) {
      theaters.value = response.data;
    }
  } catch (error) {
    console.error("Failed to load theaters:", error);
    ElMessage.error(t("theaters.loadFailed"));
  }
};

const loadHalls = async () => {
  if (showtime.theater_id) {
    try {
      const response = await hallService.getHalls({
        theater_id: showtime.theater_id,
        per_page: 100,
      });
      if (response.data) {
        halls.value = response.data;
      }
    } catch (error) {
      console.error("Failed to load halls:", error);
      ElMessage.error(t("halls.loadFailed"));
    }
  }
};

const submitForm = () => {
  showtimeForm.value.validate(async (valid) => {
    if (valid) {
      try {
        await showtimeService.updateShowtime(showtime.id, showtime);
        ElMessage.success(t("showtimes.updateSuccess"));
        router.push("/admin/showtimes");
      } catch (error) {
        console.error("Failed to update showtime:", error);
        ElMessage.error(t("showtimes.updateFailed"));
      }
    } else {
      return false;
    }
  });
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("showtimes.title"), path: "/admin/showtimes" },
    {
      title: t("showtimes.editShowtime"),
      path: `/admin/showtimes/${route.params.id}/edit`,
    },
  ]);
  loadShowtime();
});
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}
</style>
