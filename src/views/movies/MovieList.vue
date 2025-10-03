<template>
  <div>
    <h2>Movie Management</h2>
    <el-card>
      <p>Movie management interface will be implemented here.</p>
      <el-button type="primary" @click="$router.push('/admin/movies/create')">
        Add Movie
      </el-button>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useAppStore } from "@/stores/app";
import { useI18n } from "vue-i18n";

const appStore = useAppStore();
const { t } = useI18n();
onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("movies.title"), path: "/admin/movies" },
  ]);
});
</script>
