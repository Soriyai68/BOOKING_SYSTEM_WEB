<template>
  <div class="movie-detail">
    <div class="page-header">
      <h2>{{ $t("movies.movieDetails") }}</h2>
      <div>
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t("actions.back") }}
        </el-button>
        <el-button type="primary" @click="goEdit">
          {{ $t("actions.edit") }}
        </el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <div v-if="movie" class="movie-content">
        <!-- Poster -->
        <div v-if="movie.poster_url" class="poster-section">
          <el-image
            :src="movie.poster_url"
            :alt="movie.title"
            class="poster-image"
          />
        </div>

        <!-- Movie Information -->
        <el-descriptions :title="movie.title" :column="2" border>
          <el-descriptions-item :label="$t('movies.director')">
            {{ movie.director || "-" }}
          </el-descriptions-item>

          <el-descriptions-item :label="$t('movies.duration')">
            {{ movie.duration_display }}
          </el-descriptions-item>

          <el-descriptions-item :label="$t('movies.releaseDate')">
            {{ formatDate(movie.release_date) }}
          </el-descriptions-item>

          <el-descriptions-item :label="$t('movies.releaseDate')">
            {{ formatDate(movie.end_date) }}
          </el-descriptions-item>

          <el-descriptions-item :label="$t('movies.rating')">
            <el-rate
              v-model="movie.rating"
              disabled
              show-score
              text-color="#ff9900"
              :max="10"
            />
          </el-descriptions-item>

          <el-descriptions-item :label="$t('movies.status')">
            <el-tag :type="statusTagType(movie.status)">
              {{ $t(`movies.statuses.${movie.status}`) }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item :label="$t('movies.genres')">
            <el-tag
              v-for="genre in movie.genres"
              :key="genre"
              size="small"
              style="margin-right: 4px"
            >
              {{ $t(`movies.genreTypes.${genre}`) }}
            </el-tag>
            <span v-if="!movie.genres || movie.genres.length === 0">-</span>
          </el-descriptions-item>

          <el-descriptions-item :label="$t('movies.languages')" :span="2">
            <el-tag
              v-for="lang in movie.languages"
              :key="lang"
              size="small"
              type="info"
              style="margin-right: 4px"
            >
              {{ lang }}
            </el-tag>
            <span v-if="!movie.languages || movie.languages.length === 0"
              >-</span
            >
          </el-descriptions-item>

          <el-descriptions-item :label="$t('movies.description')" :span="2">
            {{ movie.description || "-" }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('movies.producers')" :span="2">
            <div v-if="movie.producers && movie.producers.length > 0">
              {{ movie.producers.join(", ") }}
            </div>
            <span v-else>-</span>
          </el-descriptions-item>

          <el-descriptions-item
            v-if="movie.trailer_url"
            :label="$t('movies.trailerUrl')"
            :span="2"
          >
            <el-link :href="movie.trailer_url" target="_blank" type="primary">
              {{ $t("actions.watch") }} {{ $t("movies.trailerUrl") }}
            </el-link>
          </el-descriptions-item>

          <el-descriptions-item
            v-if="movie.notes"
            :label="$t('movies.notes')"
            :span="2"
          >
            {{ movie.notes }}
          </el-descriptions-item>

          <el-descriptions-item :label="$t('common.createdAt')">
            {{ formatDate(movie.created_at) }}
          </el-descriptions-item>

          <el-descriptions-item :label="$t('common.updatedAt')">
            {{ formatDate(movie.updated_at) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Actions -->
        <div class="actions-section">
          <el-button
            v-permission="'movies.edit'"
            type="primary"
            @click="goEdit"
          >
            {{ $t("actions.edit") }}
          </el-button>
          <el-button
            v-permission="'movies.delete'"
            type="danger"
            @click="handleDelete"
          >
            {{ $t("actions.delete") }}
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";
import { movieService } from "@/services/movieService";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import { formatDate } from "@/utils/formatters";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const loading = ref(false);
const movie = ref(null);

const load = async () => {
  loading.value = true;
  try {
    const data = await movieService.getMovie(route.params.id);
    movie.value = data;
  } catch (e) {
    console.error(e);
    ElMessage.error("Failed to load movie");
  } finally {
    loading.value = false;
  }
};

const goEdit = () => router.push(`/admin/movies/${route.params.id}/edit`);

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t("movies.confirmDelete"),
      t("movies.deleteMovie"),
      {
        type: "warning",
        confirmButtonText: t("actions.delete"),
        cancelButtonText: t("actions.cancel"),
      }
    );
    await movieService.deleteMovie(route.params.id);
    ElMessage.success(t("movies.deleteSuccess"));
    router.push("/admin/movies");
  } catch (err) {
    if (err !== "cancel") {
      console.error(err);
      ElMessage.error("Failed to delete movie");
    }
  }
};

const statusTagType = (status) => {
  switch (status) {
    case "now_showing":
      return "success";
    case "coming_soon":
      return "warning";
    case "ended":
      return "info";
    default:
      return "";
  }
};

const formatDateTime = (str) => (str ? new Date(str).toLocaleString() : "-");

onMounted(async () => {
  await load();
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("movies.title"), path: "/admin/movies" },
    { title: t("movies.movieDetails"), path: "#" },
  ]);
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.movie-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.poster-section {
  text-align: left;
  margin-bottom: 20px;
}

.poster-image {
  max-width: 300px;
  max-height: 450px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.cast-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.actions-section {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-start;
}
</style>
