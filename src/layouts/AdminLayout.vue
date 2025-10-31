<template>
  <el-container class="admin-layout">
    <!-- Sidebar -->
    <el-aside :width="sidebarWidth" class="sidebar">
      <AdminSidebar />
    </el-aside>

    <!-- Main content -->
    <el-container>
      <!-- Header -->
      <el-header height="60px" class="header">
        <AdminHeader />
      </el-header>

      <!-- Content -->
      <el-main class="main-content">
        <div class="breadcrumb-container" v-if="breadcrumbs.length > 0">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="(crumb, index) in breadcrumbs"
              :key="index"
              :to="crumb.path"
            >
              {{ crumb.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="page-content">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from "vue";
import { useAppStore } from "@/stores/app";
import AdminSidebar from "@/components/layout/AdminSidebar.vue";
import AdminHeader from "@/components/layout/AdminHeader.vue";

const appStore = useAppStore();

const sidebarWidth = computed(() => {
  return appStore.sidebarCollapsed ? "64px" : "240px";
});

const breadcrumbs = computed(() => appStore.breadcrumbs);

</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: var(--el-bg-color);
  transition: width 0.3s;
  overflow: hidden;
}

.header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  align-items: center;
  padding: 0;
  box-shadow: var(--el-box-shadow-lighter);
  z-index: 10;
}

.main-content {
  background-color: var(--el-bg-color-page);
  padding: 16px;
  overflow: auto;
}

.breadcrumb-container {
  margin-bottom: 16px;
  background: var(--el-bg-color);
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: var(--el-box-shadow-lighter);
}

.page-content {
  background: var(--el-bg-color);
  border-radius: 4px;
  padding: 24px;
  min-height: calc(100vh - 140px);
  box-shadow: var(--el-box-shadow-lighter);
}
</style>
