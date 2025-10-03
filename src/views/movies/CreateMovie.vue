<template>
  <div>
    <h2>Add Movie</h2>
    <el-card>
      <p>Add movie form will be implemented here.</p>
      <el-button @click="$router.back()">Go Back</el-button>
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
    { title: t("movies.title"), path: "/admin/movies" },
    { title: t("movies.addMovie"), path: "/admin/movies/create" },
  ]);
});
</script>
