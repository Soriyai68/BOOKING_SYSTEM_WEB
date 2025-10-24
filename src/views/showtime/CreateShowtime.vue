<template>
  <div class="create-showtime">
    <div class="page-header">
      <h2>{{ $t("showtimes.addShowtime") }}</h2>
    </div>

    <div class="mode-toggle">
      <span>{{ toggleTitle }}</span>
      <el-switch v-model="isMultipleMode" inline-prompt />
    </div>

    <el-card>
      <div v-if="!isMultipleMode">
        <el-form
          ref="singleShowtimeForm"
          :model="showtime"
          :rules="singleRules"
          label-width="140px"
          @submit.prevent="submitSingleForm"
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
              @change="loadHallsForSingle"
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
              v-permission="'showtimes.create'"
              type="primary"
              @click="submitSingleForm"
              >{{ $t("actions.create") }}</el-button
            >
            <el-button @click="$router.back()">{{
              $t("actions.cancel")
            }}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-else>
        <MultipleShowtimeCreator
          :movies="movies"
          :theaters="theaters"
          :halls="halls"
          :initial-theater-id="showtime.theater_id"
          @theater-changed="loadHallsForMultiple"
          @created="handleShowtimesCreated"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAppStore } from "@/stores/app";
import { showtimeService } from "@/services/showtimeService";
import { movieService } from "@/services/movieService";
import { theaterService } from "@/services/theaterService";
import { hallService } from "@/services/hallService";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import MultipleShowtimeCreator from "@/components/showtimes/MultipleShowtimeCreator.vue";

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const { t } = useI18n();

// --- State Management ---
const isMultipleMode = ref(false);
const singleShowtimeForm = ref(null);

const movies = ref([]);
const theaters = ref([]);
const halls = ref([]);

// --- Data Models ---
const showtime = reactive({
  movie_id: "",
  theater_id: route.query.theater_id || "",
  hall_id: "",
  show_date: "",
  start_time: "",
  end_time: "",
  language: "Original",
  subtitle: "EN",
  status: "scheduled",
});

// --- Validation Rules ---
const singleRules = computed(() => ({
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

const loadHallsForSingle = async () => {
  await loadHalls(showtime.theater_id);
  showtime.hall_id = "";
};

const loadHallsForMultiple = async (theaterId) => {
  await loadHalls(theaterId);
};

// --- Form Submission ---
const submitSingleForm = () => {
  singleShowtimeForm.value.validate(async (valid) => {
    if (valid) {
      appStore.setLoading(true);
      try {
        await showtimeService.createShowtime(showtime);
        ElMessage.success(t("showtimes.createSuccess"));
        router.push("/admin/showtimes");
      } catch (error) {
        console.error("Failed to create showtime:", error);
        ElMessage.error(t("showtimes.createFailed"));
      } finally {
        appStore.setLoading(false);
      }
    } else {
      return false;
    }
  });
};

const handleShowtimesCreated = () => {
  router.push("/admin/showtimes");
};

const toggleTitle = computed(() =>
  isMultipleMode.value
    ? t("showtimes.createMultiple")
    : t("showtimes.createSingle")
);

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

// --- Watchers & Lifecycle ---
watch(isMultipleMode, (newMode) => {
  halls.value = [];
  if (newMode) {
    loadHalls(showtime.theater_id);
  } else {
    loadHalls(showtime.theater_id);
  }
});

watch(
  () => [showtime.movie_id, showtime.start_time],
  () => {
    const movie = movies.value.find((m) => m.id === showtime.movie_id);
    if (movie && showtime.start_time) {
      showtime.end_time = calculateEndTime(
        showtime.start_time,
        movie.duration_minutes
      );
    }
  },
  { deep: true }
);

onMounted(async () => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("showtimes.title"), path: "/admin/showtimes" },
    { title: t("showtimes.addShowtime"), path: "/admin/showtimes/create" },
  ]);
  await loadMovies();
  await loadTheaters();

  if (showtime.theater_id) {
    await loadHalls(showtime.theater_id);
  }
});
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.mode-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.single-showtime-form {
  max-width: 600px;
}
</style>
