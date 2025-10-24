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
        label-width="140px"
        @submit.prevent="submitForm"
        class="single-showtime-form"
      >
        <el-form-item :label="$t('showtimes.movie')" prop="movie_id">
          <el-select
            v-model="showtime.movie_id"
            :placeholder="$t('showtimes.selectMovie')"
            filterable
          >
            <el-option
              v-for="movie in movies"
              :key="movie.id"
              :label="movie.title"
              :value="movie.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('showtimes.theater')" prop="theater_id">
          <el-select
            v-model="showtime.theater_id"
            :placeholder="$t('showtimes.selectTheater')"
            filterable
            @change="handleTheaterChange"
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
            :placeholder="$t('showtimes.selectHall')"
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
        <el-form-item :label="$t('showtimes.showDate')" prop="show_date">
          <el-date-picker
            v-model="showtime.show_date"
            type="date"
            :placeholder="$t('showtimes.selectShowDate')"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item :label="$t('showtimes.startTime')" prop="start_time">
          <el-time-picker
            v-model="showtime.start_time"
            :placeholder="$t('showtimes.selectStartTime')"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item :label="$t('showtimes.endTime')" prop="end_time">
          <el-time-picker
            v-model="showtime.end_time"
            :placeholder="$t('showtimes.selectEndTime')"
            format="HH:mm"
            value-format="HH:mm"
            readonly
          />
        </el-form-item>
        <el-form-item :label="$t('showtimes.status')" prop="status">
          <el-select
            v-model="showtime.status"
            :placeholder="$t('showtimes.selectStatus')"
          >
            <el-option
              v-for="status in showtimeService.STATUS_OPTIONS"
              :key="status.value"
              :label="$t(`showtimes.statuses.${status.value}`)"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            v-permission="'showtimes.edit'"
            type="primary"
            @click="submitForm"
            >{{ $t("actions.update") }}</el-button
          >
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
import { ref, reactive, onMounted, computed, watch } from "vue";
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
  id: route.params.id,
  movie_id: "",
  theater_id: "",
  hall_id: "",
  show_date: "",
  start_time: "",
  end_time: "",
  status: "",
});

const movies = ref([]);
const theaters = ref([]);
const halls = ref([]);

const rules = computed(() => ({
  movie_id: [
    {
      required: true,
      message: t("validations.movieRequired"),
      trigger: "change",
    },
  ],
  theater_id: [
    {
      required: true,
      message: t("validations.theaterRequired"),
      trigger: "change",
    },
  ],
  hall_id: [
    {
      required: true,
      message: t("validations.hallRequired"),
      trigger: "change",
    },
  ],
  show_date: [
    {
      required: true,
      message: t("validations.showDateRequired"),
      trigger: "change",
    },
  ],
  start_time: [
    {
      required: true,
      message: t("validations.startTimeRequired"),
      trigger: "blur",
    },
  ],
  status: [
    {
      required: true,
      message: t("validations.statusRequired"),
      trigger: "change",
    },
  ],
}));

const loadShowtime = async () => {
  loading.value = true;
  try {
    const response = await showtimeService.getShowtime(route.params.id);
    const date = new Date(response.show_date);
    const formattedDate = date.toLocaleDateString("en-CA");

    Object.assign(showtime, { ...response, show_date: formattedDate });

    await Promise.all([loadMovies(), loadTheaters(), loadHalls()]);
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

const loadHalls = async () => {
  if (showtime.theater_id) {
    try {
      const response = await hallService.getHalls({
        theater_id: showtime.theater_id,
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

const handleTheaterChange = async () => {
  showtime.hall_id = "";
  await loadHalls();
};

const submitForm = () => {
  showtimeForm.value.validate(async (valid) => {
    if (valid) {
      appStore.setLoading(true);
      try {
        await showtimeService.updateShowtime(showtime.id, showtime);
        ElMessage.success(t("showtimes.updateSuccess"));
        router.push("/admin/showtimes");
      } catch (error) {
        console.error("Failed to update showtime:", error);
        ElMessage.error(t("showtimes.updateFailed"));
      } finally {
        appStore.setLoading(false);
      }
    }
  });
};

const calculateEndTime = (startTime, durationMinutes) => {
  if (!startTime || !durationMinutes) return "";
  const [hours, minutes] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  startDate.setMinutes(startDate.getMinutes() + durationMinutes);
  const hh = String(startDate.getHours()).padStart(2, "0");
  const mm = String(startDate.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

watch(
  () => showtime.movie_id,
  async (newMovieId) => {
    if (!newMovieId) return;
    const movie = movies.value.find((m) => m.id === newMovieId);
    if (movie && showtime.start_time) {
      showtime.end_time = calculateEndTime(
        showtime.start_time,
        movie.duration_minutes
      );
    }
  }
);

watch(
  () => showtime.start_time,
  (newStartTime) => {
    if (!newStartTime || !showtime.movie_id) return;
    const movie = movies.value.find((m) => m.id === showtime.movie_id);
    if (movie) {
      showtime.end_time = calculateEndTime(
        newStartTime,
        movie.duration_minutes
      );
    }
  }
);

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
.single-showtime-form {
  max-width: 600px;
}
</style>
