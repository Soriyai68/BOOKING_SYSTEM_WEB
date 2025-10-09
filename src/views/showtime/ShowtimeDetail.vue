<template>
  <div class="showtime-detail">
    <div class="page-header">
      <h2>{{ $t("showtimes.showtimeDetails") }}</h2>
    </div>
    <el-card v-if="!loading && showtime">
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('showtimes.movie')">
          <div style="display: flex; align-items: center">
            <el-image
              :src="showtime.movie_poster"
              fit="cover"
              style="
                width: 50px;
                height: 75px;
                border-radius: 4px;
                margin-right: 10px;
              "
            />
            <span>{{ showtime.movie_title }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('showtimes.theater')">{{
          showtime.theater_name
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('showtimes.hall')">{{
          showtime.hall_name
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('showtimes.screen_type')">{{
          showtime.screen_type
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('showtimes.theater_city')">{{
          showtime.theater_city
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('showtimes.theater_province')">{{
          showtime.theater_province
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('showtimes.language')">{{
          showtime.language
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('showtimes.subtitle')">{{
          showtime.subtitle
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('showtimes.startTime')">{{
          new Date(showtime.start_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('showtimes.endTime')">{{
          new Date(showtime.end_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('showtimes.status')">
          <el-tag :type="getStatusTagType(showtime.status)">{{
            showtime.status
          }}</el-tag>
        </el-descriptions-item>
        <!-- <el-descriptions-item :label="$t('showtimes.created_by')">{{
          showtime.created_by
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('showtimes.updated_by')">{{
          showtime.updated_by
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('showtimes.updated_at')">{{
          formatDateTime(showtime.updated_at)
        }}</el-descriptions-item> -->
        <el-descriptions-item :label="$t('showtimes.created_at')">{{
          formatDateTime(showtime.created_at)
        }}</el-descriptions-item>
      </el-descriptions>
      <div class="actions">
        <el-button type="primary" @click="editShowtime">{{
          $t("actions.edit")
        }}</el-button>
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
  router.push(`/admin/showtimes/${route.params.id}/edit`);
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
  return new Date(dateTimeString).toLocaleString();
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
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("showtimes.title"), path: "/admin/showtimes" },
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
.actions {
  margin-top: 24px;
}
</style>
