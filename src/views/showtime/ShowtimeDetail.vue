<template>
  <div class="showtime-detail">
    <div class="page-header">
      <h2>{{ $t("showtimes.showtimeDetails") }}</h2>
    </div>
    <el-card v-if="!loading && showtime">
      <div class="detail-content">
        <!-- Poster Section -->
        <div v-if="showtime.movie_poster" class="poster-section">
          <el-image
            :src="showtime.movie_poster"
            :alt="showtime.movie_title"
            class="poster-image"
          />
        </div>

        <!-- Details Section -->
        <el-descriptions :column="2" border>
          <router-link
            :to="{ name: 'MovieDetail', params: { id: showtime.movie_id } }"
            class="tracking-link"
          >
            {{ showtime.movie_title }}
          </router-link>
          <el-descriptions-item :label="$t('showtimes.theater')">
            <router-link
              :to="{
                name: 'TheaterDetail',
                params: { id: showtime.theater_id },
              }"
              class="tracking-link"
            >
              {{ showtime.theater_name }}
            </router-link>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('showtimes.hall')">
            <router-link
              :to="{ name: 'HallDetail', params: { id: showtime.hall_id } }"
              class="tracking-link"
            >
              {{ showtime.hall_name }}
            </router-link>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('showtimes.screen_type')">{{
            showtime.screen_type
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('showtimes.theater_city')">{{
            showtime.theater_city
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('showtimes.theater_province')">{{
            showtime.theater_province
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('showtimes.startTime')">{{
            showtime.start_time
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('showtimes.endTime')">{{
            showtime.end_time
          }}</el-descriptions-item>
          <el-descriptions-item :label="$t('showtimes.showDate')">
            {{ formatDate(showtime.show_date) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('showtimes.status')">
            <el-tag :type="getStatusTagType(showtime.status)">{{
              showtime.status
            }}</el-tag>
          </el-descriptions-item>
          <!-- <el-descriptions-item :label="$t('showtimes.created_at')">{{
            formatDate(showtime.created_at)
          }}</el-descriptions-item> -->
        </el-descriptions>
      </div>
      <div class="actions">
        <el-button
          v-permission="'showtimes.edit'"
          type="primary"
          @click="editShowtime"
          >{{ $t("actions.edit") }}</el-button
        >
        <el-button @click="$router.back()">{{ $t("actions.back") }}</el-button>
      </div>
    </el-card>
    <div v-else-if="loading">{{ $t("messages.loading") }}</div>
    <div v-else>{{ $t("messages.noData") }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { showtimeService } from "@/services/showtimeService";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { formatDate } from "@/utils/formatters";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const loading = ref(true);
const showtime = ref(null);

const loadShowtime = async () => {
  loading.value = true;
  try {
    const response = await showtimeService.getShowtime(route.params.id);
    showtime.value = response;
  } catch (error) {
    console.error("Failed to load showtime:", error);
    ElMessage.error(t("showtimes.loadFailed"));
  } finally {
    loading.value = false;
  }
};

const editShowtime = () => {
  router.push({ name: "EditShowtime", params: { id: route.params.id } });
};

const getStatusTagType = (status) => {
  switch (status) {
    case "scheduled":
      return "primary";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "info";
  }
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/" },
    { title: t("showtimes.title"), path: "/showtimes" },
    {
      title: t("showtimes.showtimeDetails"),
      path: `/admin/showtimes/${route.params.id}`,
    },
  ]);
  loadShowtime();
});
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}
.detail-content {
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

.actions {
  margin-top: 24px;
}

.tracking-link {
  color: var(--el-color-primary);
  text-decoration: none;
  font-weight: 500;
}

.tracking-link:hover {
  text-decoration: underline;
}
</style>
