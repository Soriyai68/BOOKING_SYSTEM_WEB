<template>
  <div class="sidebar-container">
    <!-- Logo -->
    <div class="logo">
      <div class="logo-content" :class="{ collapsed: sidebarCollapsed }">
        <el-icon class="logo-icon"><Film /></el-icon>
        <span v-show="!sidebarCollapsed" class="logo-text">Ninja Booking</span>
      </div>
    </div>

    <!-- Navigation Menu -->
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="sidebarCollapsed"
      :unique-opened="true"
      router
      :background-color="sidebarBgColor"
      :text-color="sidebarTextColor"
      :active-text-color="sidebarActiveColor"
    >
      <el-menu-item index="/admin/dashboard">
        <el-icon><Odometer /></el-icon>
        <template #title>{{ $t("nav.dashboard") }}</template>
      </el-menu-item>

      <el-sub-menu index="seats">
        <template #title>
          <el-icon><Grid /></el-icon>
          <span>{{ $t("seats.title") }}</span>
        </template>
        <el-menu-item index="/admin/seats">
          <el-icon><Postcard /></el-icon>
          <template #title>{{ $t("seats.allSeats") }}</template>
        </el-menu-item>
        <el-menu-item index="/admin/seats/create">
          <el-icon><Plus /></el-icon>
          <template #title>{{ $t("seats.addSeat") }}</template>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="screens">
        <template #title>
          <el-icon><Grid /></el-icon>
          <span>{{ $t("screens.title") }}</span>
        </template>
        <el-menu-item index="/admin/screens">
          <el-icon><Postcard /></el-icon>
          <template #title>{{ $t("screens.allScreens") }}</template>
        </el-menu-item>
        <el-menu-item index="/admin/screens/create">
          <el-icon><Plus /></el-icon>
          <template #title>{{ $t("screens.addScreen") }}</template>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="theaters">
        <template #title>
          <el-icon><Odometer /></el-icon>
          <span>{{ $t("theaters.title") }}</span>
        </template>
        <el-menu-item index="/admin/theaters">
          <el-icon><Odometer /></el-icon>w
          <template #title>{{ $t("theaters.allTheaters") }}</template>
        </el-menu-item>
        <el-menu-item index="/admin/theaters/create">
          <el-icon><Plus /></el-icon>
          <template #title>{{ $t("theaters.addTheater") }}</template>
        </el-menu-item>
      </el-sub-menu>  

      <el-sub-menu index="movies">
        <template #title>
          <el-icon><Film /></el-icon>
          <span>{{ $t("movies.title") }}</span>
        </template>
        <el-menu-item index="/admin/movies">
          <el-icon><VideoCamera /></el-icon>
          <template #title>{{ $t("movies.allMovies") }}</template>
        </el-menu-item>
        <el-menu-item index="/admin/movies/create">
          <el-icon><Plus /></el-icon>
          <template #title>{{ $t("movies.addMovie") }}</template>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="users">
        <template #title>
          <el-icon><User /></el-icon>
          <span>{{ $t("users.title") }}</span>
        </template>
        <el-menu-item index="/admin/users">
          <el-icon><UserFilled /></el-icon>
          <template #title>{{ $t("users.allUsers") }}</template>
        </el-menu-item>
        <el-menu-item index="/admin/users/create">
          <el-icon><Plus /></el-icon>
          <template #title>{{ $t("users.addUser") }}</template>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item index="/admin/settings">
        <el-icon><Setting /></el-icon>
        <template #title>{{ $t("nav.settings") }}</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "@/stores/app";
import {
  Film,
  Odometer,
  User,
  UserFilled,
  Plus,
  VideoCamera,
  Tickets,
  Setting,
  Grid,
  Postcard,
} from "@element-plus/icons-vue";

const route = useRoute();
const appStore = useAppStore();

const activeMenu = computed(() => route.path);
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed);
const theme = computed(() => appStore.theme);

// Dynamic theme colors
const sidebarBgColor = computed(() => {
  return theme.value === "dark" ? "#1d1d1f" : "#001529";
});

const sidebarTextColor = computed(() => {
  return theme.value === "dark"
    ? "rgba(229, 229, 230,1)"
    : "rgba(255,255,255,0.85)";
});

const sidebarActiveColor = computed(() => {
  return theme.value === "dark" ? "#3B82F9" : "#1E40AF";
});
</script>

<style scoped>
.sidebar-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: v-bind(sidebarBgColor);
  transition: background-color 0.3s;
}

.logo-content {
  display: flex;
  align-items: center;
  color: var(--text-color-primary);
  font-weight: bold;
  font-size: 18px;
  transition: all 0.3s;
}

.logo-content.collapsed {
  justify-content: center;
}

.logo-icon {
  font-size: 24px;
  color: var(--primary-color);
  margin-right: 8px;
}

.logo-content.collapsed .logo-icon {
  margin-right: 0;
}

.logo-text {
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 240px;
}

/* Custom menu item styles */
:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
}

:deep(.el-sub-menu .el-menu-item) {
  height: 40px;
  line-height: 40px;
  padding-left: 50px !important;
}

:deep(.el-menu-item:hover) {
  background-color: #1c2636 !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #1c2636 !important;
}
</style>
