<template>
  <div>
    <h2>Booking Management</h2>
    <el-card>
      <p>Booking management interface will be implemented here.</p>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
const { t } = useI18n();
onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("bookings.title"), path: "/admin/movies" },
  ]);
});
</script>
