<template>
  <div class="header-container">
    <!-- Left side -->
    <div class="header-left">
      <el-button
        :icon="sidebarCollapsed ? PanelRightClose : PanelLeftClose"
        text
        @click="toggleSidebar"
        class="toggle-btn"
      />
      <div class="page-title" v-if="pageTitle">
        {{ pageTitle }}
      </div>
    </div>

    <!-- Right side -->
    <div class="header-right">
      <!-- Language switcher -->
      <LanguageSwitcher />

      <!-- Theme toggle -->
      <el-tooltip content="Toggle Theme" placement="bottom">
        <el-button
          :icon="theme === 'dark' ? Sun : Moon"
          text
          @click="toggleTheme"
          class="header-btn"
        />
      </el-tooltip>

      <!-- Notifications -->
      <el-tooltip content="Notifications" placement="bottom">
        <el-badge :value="notificationCount" :hidden="notificationCount === 0">
          <el-button
            :icon="Bell"
            text
            @click="showNotifications"
            class="header-btn"
          />
        </el-badge>
      </el-tooltip>

      <!-- User menu -->
      <el-dropdown @command="handleUserMenuCommand" class="user-dropdown">
        <span class="user-info">
          <el-avatar :size="32" class="user-avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="username">{{ user?.name || "Admin" }}</span>
          <el-icon class="dropdown-icon"><ChevronDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              {{ $t("nav.profile") }}
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Settings /></el-icon>
              {{ $t("nav.settings") }}
            </el-dropdown-item>
            <el-dropdown-item divided command="logout" style="color: #f56c6c">
              <el-icon><LogOut /></el-icon>
              {{ $t("nav.logout") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import LanguageSwitcher from "@/components/common/LanguageSwitcher.vue";
import { useI18n } from "vue-i18n";
import {
  PanelLeftClose,
  PanelRightClose,
  Sun,
  Moon,
  Bell,
  User,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const authStore = useAuthStore();
const { t } = useI18n();

const notificationCount = ref(3); // Mock notification count

const sidebarCollapsed = computed(() => appStore.sidebarCollapsed);
const theme = computed(() => appStore.theme);
const user = computed(() => authStore.user);
const pageTitle = computed(() => {
  const meta = route.meta || {};
  return meta.titleKey ? t(meta.titleKey) : meta.title;
});

const toggleSidebar = () => {
  appStore.toggleSidebar();
};

const toggleTheme = () => {
  appStore.toggleTheme();
};

const showNotifications = () => {
  ElMessage.info("Notifications feature coming soon!");
};

const handleUserMenuCommand = async (command) => {
  switch (command) {
    case "profile":
      ElMessage.info("Profile page coming soon!");
      break;
    case "settings":
      router.push("/admin/settings");
      break;
    case "logout":
      let loadingInstance = null; // Declare loadingInstance here
      try {
        await ElMessageBox.confirm(
          t("auth.logoutConfirm.message"),
          t("auth.logoutConfirm.title"),
          {
            confirmButtonText: t("auth.logoutConfirm.confirmButton"),
            cancelButtonText: t("actions.cancel"),
            type: "warning",
          }
        );
        // Show loading indicator
        loadingInstance = ElLoading.service({ fullscreen: false });

        // Perform logout
        await authStore.logout();

        // Clear any remaining messages
        ElMessage.closeAll();

        // Show success message briefly
        ElMessage.success("Logged out successfully");

        // Redirect to login page
        await router.replace("/login");
      } catch (error) {
        if (error !== "cancel") {
          console.error("Logout error:", error);
        }
      } finally {
        if (loadingInstance) {
          loadingInstance.close();
        }
      }
      break;
  }
};
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  flex: 1;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-btn {
  font-size: 18px;
  padding: 8px;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  font-size: 16px;
  padding: 8px;
  color: var(--text-color-secondary);
}

.header-btn:hover {
  color: var(--primary-color);
}

.user-dropdown {
  margin-left: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: var(--bg-color-tertiary);
}

.user-avatar {
  background-color: var(--primary-color);
}

.username {
  color: var(--text-color-primary);
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 12px;
  color: var(--text-color-tertiary);
  transition: transform 0.3s;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 14px;
}
</style>
