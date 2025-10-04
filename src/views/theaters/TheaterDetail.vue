<template>
  <div class="theater-detail">
    <div class="page-header">
      <h2>{{ $t("theaters.theaterDetails") }}</h2>
      <div>
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t("actions.back") }}
        </el-button>
        <el-button type="primary" @click="goEdit">{{
          $t("actions.edit")
        }}</el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <el-descriptions :title="theater?.display_name" :column="2" border>
        <el-descriptions-item :label="$t('theaters.name')">{{
          theater?.name
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.status')">
          <el-tag>{{ theater?.status_display || theater?.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.address')" :span="2">{{
          theater?.address
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.city')">{{
          theater?.city
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.province')">{{
          theater?.province
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.totalScreens')">{{
          theater?.total_screens
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.totalCapacity')">{{
          theater?.total_capacity
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.features')" :span="2">{{
          (theater?.features || []).join(", ") || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('users.created')">{{
          formatDateTime(theater?.created_at)
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.notes')" :span="2">{{
          theater?.notes || "-"
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useI18n } from "vue-i18n";
import { theaterService } from "@/services/theaterService";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const loading = ref(false);
const theater = ref(null);

const load = async () => {
  loading.value = true;
  try {
    const data = await theaterService.getTheater(route.params.id);
    theater.value = data;
  } finally {
    loading.value = false;
  }
};

const goEdit = () => router.push(`/admin/theaters/${route.params.id}/edit`);

const formatDateTime = (str) => (str ? new Date(str).toLocaleString() : "-");

onMounted(async () => {
  await load();
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("theaters.title"), path: "/admin/theaters" },
    { title: t("theaters.theaterDetails"), path: "#" },
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
</style>
