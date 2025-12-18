<template>
  <div class="hall-detail">
    <div class="page-header">
      <h2>{{ $t("halls.hallDetails") }}</h2>
      <div>
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t("actions.back") }}
        </el-button>
        <el-button v-permission="'halls.edit'" type="primary" @click="goEdit">{{
          $t("actions.edit")
        }}</el-button>
      </div>
    </div>

    <!-- Theater Context -->
    <el-card v-if="theater" class="theater-context">
      <template #header>
        <div class="context-header">
          <span>{{ $t("halls.belongsToTheater") }}</span>
          <el-button v-permission="'theaters.view'" size="small" @click="goToTheater">
            <el-icon><ArrowRight /></el-icon>
            {{ $t("actions.view") }} {{ $t("theaters.title") }}
          </el-button>
        </div>
      </template>
      <el-descriptions :column="3" size="small">
        <el-descriptions-item :label="$t('theaters.name')">{{
          theater.name
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.city')">{{
          theater.city
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.status')">
          <el-tag size="small">{{
            theater.status_display || theater.status
          }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-loading="loading">
      <el-descriptions :title="hall?.hall_name" :column="2" border>
        <el-descriptions-item :label="$t('halls.name')">{{
          hall?.hall_name
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('halls.type')">{{
          hall?.screen_type?.toUpperCase()
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('halls.theater')">
          <span v-if="theater" class="theater-link" @click="goToTheater">{{
            theater.name
          }}</span>
          <span v-else>{{ hall?.theater_id || "-" }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('halls.totalSeats')">{{
          hall?.total_seats
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('halls.status')">
          <el-tag :type="statusTagType(hall?.status)">{{
            hall?.status_display || hall?.status
          }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('users.created')">{{
          formatDate(hall?.created_at)
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('halls.notes')" :span="2">{{
          hall?.notes || "-"
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- Edit Hall Dialog -->
    <EditHall v-model="showEditDialog" :hall-id="route.params.id" @success="handleEditSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useI18n } from "vue-i18n";
import { hallService } from "@/services/hallService";
import { theaterService } from "@/services/theaterService";
import { ArrowRight, ArrowLeft } from "@element-plus/icons-vue";
import { formatDate } from "@/utils/formatters";
import EditHall from "./EditHall.vue";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const loading = ref(false);
const hall = ref(null);
const theater = ref(null);
const showEditDialog = ref(false);

const load = async () => {
  loading.value = true;
  try {
    const data = await hallService.getHall(route.params.id);
    hall.value = data;

    // Load theater information if theater_id exists
    if (data.theater_id) {
      try {
        const theaterData = await theaterService.getTheater(data.theater_id);
        theater.value = theaterData;
      } catch (e) {
        console.warn("Failed to load theater:", e);
      }
    }
  } finally {
    loading.value = false;
  }
};

const goEdit = () => {
  showEditDialog.value = true;
};

const handleEditSuccess = async () => {
  await load(); // Reload hall data after successful edit
};

const goToTheater = () => {
  if (theater.value) {
    router.push(`/admin/theaters/${theater.value.id}`);
  }
};

const statusTagType = (status) => {
  switch (status) {
    case "active":
      return "success";
    case "maintenance":
      return "warning";
    case "closed":
      return "danger";
    case "renovation":
      return "info";
    default:
      return "";
  }
}

onMounted(async () => {
  await load();
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("halls.title"), path: "/admin/halls" },
    { title: t("halls.hallDetails"), path: "#" },
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
.theater-context {
  margin-bottom: 24px;
}
.context-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.theater-link {
  color: var(--el-color-primary);
  cursor: pointer;
}
.theater-link:hover {
  text-decoration: underline;
}
</style>
