<template>
  <div class="sidebar-container">
    <!-- Logo -->
    <div class="logo">
      <div class="logo-content" :class="{ collapsed: sidebarCollapsed }">
        <img src="@/assets/ek.jpg" alt="Logo" class="logo-image" />
        <span v-show="!sidebarCollapsed" class="logo-text">Ninja Booking</span>
        <!-- Optional text if sidebar not collapsed -->
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
        <el-icon><LayoutDashboard /></el-icon>
        <template #title>{{ $t("nav.dashboard") }}</template>
      </el-menu-item>

      <el-sub-menu index="seats">
        <template #title>
          <el-icon><Armchair /></el-icon>
          <span>{{ $t("seats.title") }}</span>
        </template>
        <el-menu-item index="/admin/seats">
          <el-icon><Armchair /></el-icon>
          <template #title>{{ $t("seats.allSeats") }}</template>
        </el-menu-item>
        <el-menu-item index="/admin/seats/create">
          <el-icon><Plus /></el-icon>
          <template #title>{{ $t("seats.addSeat") }}</template>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="screens">
        <template #title>
          <el-icon><Monitor /></el-icon>
          <span>{{ $t("screens.title") }}</span>
        </template>
        <el-menu-item index="/admin/screens">
          <el-icon><Monitor /></el-icon>
          <template #title>{{ $t("screens.allScreens") }}</template>
        </el-menu-item>
        <el-menu-item index="/admin/screens/create">
          <el-icon><Plus /></el-icon>
          <template #title>{{ $t("screens.addScreen") }}</template>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="theaters">
        <template #title>
          <el-icon><Projector /></el-icon>
          <span>{{ $t("theaters.title") }}</span>
        </template>
        <el-menu-item index="/admin/theaters">
          <el-icon><Projector /></el-icon>
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
          <el-icon><Clapperboard /></el-icon>
          <template #title>{{ $t("movies.allMovies") }}</template>
        </el-menu-item>
        <el-menu-item index="/admin/movies/create">
          <el-icon><Plus /></el-icon>
          <template #title>{{ $t("movies.addMovie") }}</template>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="users">
        <template #title>
          <el-icon><Users /></el-icon>
          <span>{{ $t("users.title") }}</span>
        </template>
        <el-menu-item index="/admin/users">
          <el-icon><Users /></el-icon>
          <template #title>{{ $t("users.allUsers") }}</template>
        </el-menu-item>
        <el-menu-item index="/admin/users/create">
          <el-icon><UserPlus /></el-icon>
          <template #title>{{ $t("users.addUser") }}</template>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item index="/admin/settings">
        <el-icon><Settings /></el-icon>
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
  LayoutDashboard,
  Users,
  UserPlus,
  Plus,
  Clapperboard,
  Ticket,
  Settings,
  Armchair,
  Monitor,
  Projector,
} from "lucide-vue-next";

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
.logo-image {
  height: 36px; /* keeps it compact */
  width: auto;
  margin-right: 10px;
  border-radius: 8px; /* smooth rounded corners */
  object-fit: cover; /* prevents stretching */
  transition: all 0.3s ease;
}

/* Center logo when collapsed */
.logo-content.collapsed .logo-image {
  margin: 0 auto;
}

/* Add a hover effect */
.logo-image:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}
</style>
