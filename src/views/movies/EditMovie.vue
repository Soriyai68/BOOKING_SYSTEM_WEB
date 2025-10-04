<template>
  <div>
    <h2>Edit Movie</h2>
    <el-card>
      <p>Edit movie form will be implemented here.</p>
      <p>Movie ID: {{ $route.params.id }}</p>
      <el-button @click="$router.back()">Go Back</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("movies.title"), path: "/admin/movies" },
    { title: t("movies.editMovie"), path: "#" },
  ]);
});
</script>
