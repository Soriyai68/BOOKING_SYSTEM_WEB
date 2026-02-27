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
      <!-- Quick Booking Button -->
      <el-tooltip :content="$t('bookings.addBooking')" placement="bottom">
        <el-button
          :icon="TicketPlus"
          @click="goToCreateBooking"
          class="booking-btn"
          round
        >
          <span class="booking-btn-text">{{ $t("bookings.addBooking") }}</span>
        </el-button>
      </el-tooltip>

      <el-divider direction="vertical" class="header-divider" />

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
      <div class="notification-trigger">
        <el-badge
          :value="unreadCount"
          :hidden="unreadCount === 0"
          class="notification-badge"
          :class="{ pulsing: unreadCount > 0 }"
        >
          <el-button
            :icon="Bell"
            text
            class="header-btn"
            @click="showDrawer = true"
          />
        </el-badge>
      </div>

      <el-drawer
        v-model="showDrawer"
        :title="t('nav.notifications')"
        direction="rtl"
        size="380px"
        class="notification-drawer"
      >
        <template #header>
          <div class="drawer-header">
            <h3>{{ t("nav.notifications") }}</h3>
            <div class="header-actions">
              <el-tooltip
                v-if="unreadCount > 0"
                :content="t('actions.markAllAsRead')"
                placement="bottom"
              >
                <el-button
                  link
                  @click="markAllAsRead"
                  class="header-action-btn"
                  :icon="CheckCheck"
                />
              </el-tooltip>
              <el-tooltip
                v-if="notifications.length > 0"
                :content="t('nav.clearAll')"
                placement="bottom"
              >
                <el-button
                  link
                  @click="deleteAllNotifications"
                  class="header-action-btn clear-btn"
                  :icon="Trash2"
                />
              </el-tooltip>
            </div>
          </div>
        </template>

        <div class="notification-list" v-if="notifications.length > 0">
          <div
            v-for="item in notifications"
            :key="item._id"
            class="notification-item"
            :class="{ unread: !item.isRead }"
            @click="handleNotificationClick(item)"
          >
            <div class="notification-status-dot" v-if="!item.isRead"></div>
            <div class="notification-content-wrapper">
              <div class="notification-main">
                <div class="notification-title">
                  {{ getLocalizedTitle(item) }}
                </div>
                <div class="notification-message">
                  {{ getLocalizedMessage(item) }}
                </div>
                <div class="notification-time">
                  {{ getRelativeTime(item.createdAt) }}
                </div>
              </div>
              <el-button
                class="item-delete-btn"
                link
                :icon="Trash2"
                @click.stop="deleteNotification(item._id)"
              />
            </div>
          </div>
        </div>
        <div class="notification-empty" v-else>
          <el-icon class="empty-icon"><BellOff /></el-icon>
          <p>{{ t("messages.noNotifications") }}</p>
        </div>

        <template #footer>
          <div class="notification-footer">
            <el-button @click="goToNotifications" class="view-all-btn">
              {{ t("actions.viewAll") }}
            </el-button>
          </div>
        </template>
      </el-drawer>

      <!-- User menu -->
      <el-dropdown @command="handleUserMenuCommand" class="user-dropdown">
        <span class="user-info">
          <el-avatar :size="32" class="user-avatar" :src="user?.photoUrl">
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
import { useNotificationStore } from "@/stores/notification";
import { usePath } from "@/composables/usePath";
import LanguageSwitcher from "@/components/common/LanguageSwitcher.vue";
import { useI18n } from "vue-i18n";
import { getRelativeTime } from "@/utils/formatters";
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
  TicketPlus,
  Trash2,
  CheckCheck,
  BellOff,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const { getAdminPath } = usePath();
const { t, te } = useI18n();

const getLocalizedTitle = (item) => {
  if (!item) return "";
  const key = `notifications_i18n.${item.type}.title`;
  if (te(key)) {
    return t(key, item.metadata || {});
  }
  return item.title;
};

const getLocalizedMessage = (item) => {
  if (!item) return "";
  const key = `notifications_i18n.${item.type}.message`;
  if (te(key) && item.metadata && Object.keys(item.metadata).length > 0) {
    return t(key, item.metadata);
  }
  return item.message;
};

const showDrawer = ref(false);

const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);

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

const handleNotificationClick = (item) => {
  if (!item.isRead) {
    notificationStore.markAsRead(item._id);
  }
  // Navigate if relatedId exists
  if (item.relatedId) {
    showDrawer.value = false;
    router.push(getAdminPath(`/bookings/${item.relatedId}`));
  }
};

const markAllAsRead = () => {
  notificationStore.markAllAsRead();
};

const deleteNotification = (id) => {
  notificationStore.deleteNotification(id);
};

const deleteAllNotifications = () => {
  ElMessageBox.confirm(
    t("messages.clearAllNotifications"),
    t("actions.clearAll"),
    {
      confirmButtonText: t("actions.confirm"),
      cancelButtonText: t("actions.cancel"),
      type: "warning",
    },
  ).then(() => {
    notificationStore.deleteAllNotifications();
  });
};

const goToNotifications = () => {
  showDrawer.value = false;
  router.push(getAdminPath("/notifications"));
};

const handleNotificationCommand = (command) => {
  // Can handle specific commands if needed
};

const goToCreateBooking = () => {
  router.push(getAdminPath("/bookings/create"));
};

const handleUserMenuCommand = async (command) => {
  let loadingInstance = null;

  if (command === "profile") {
    router.push(getAdminPath("/profile"));
    return;
  }

  if (command === "settings") {
    router.push(getAdminPath("/settings"));
    return;
  }

  if (command === "logout") {
    try {
      await ElMessageBox.confirm(
        t("auth.logoutConfirm.message"),
        t("auth.logoutConfirm.title"),
        {
          confirmButtonText: t("auth.logoutConfirm.confirmButton"),
          cancelButtonText: t("actions.cancel"),
          type: "warning",
        },
      );

      loadingInstance = ElLoading.service({ fullscreen: false });

      try {
        await authStore.logout();
      } catch (err) {
        console.warn("Logout API call failed:", err.message);
      }

      await router.replace("/login");

      ElMessage.closeAll();
      ElMessage({
        message: t("auth.logoutSuccess") || "Logged out successfully",
        type: "success",
        center: true,
      });
    } catch (error) {
      if (error !== "cancel") {
        console.error("Logout error:", error);
      }
    } finally {
      if (loadingInstance) {
        loadingInstance.close();
      }
    }

    return;
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
  color: var(--el-text-color-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-divider {
  height: 24px;
  margin: 0;
}

.booking-btn {
  font-weight: 500;
  padding: 8px 20px;
  height: 36px;
  background: var(--el-text-color-primary);
  color: var(--el-bg-color);
  border: 2px solid var(--el-text-color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.booking-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  transition: left 0.5s;
}

.booking-btn:hover::before {
  left: 100%;
}

.booking-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border-color: var(--el-text-color-primary);
}

.booking-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.booking-btn-text {
  font-size: 14px;
  letter-spacing: 0.3px;
}

/* Responsive: Hide text on smaller screens */
@media (max-width: 768px) {
  .booking-btn-text {
    display: none;
  }

  .booking-btn {
    padding: 8px 12px;
    width: 36px;
  }
}

.header-btn {
  font-size: 16px;
  padding: 8px;
  color: var(--el-text-color-regular);
}

.header-btn:hover {
  color: var(--el-color-primary);
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
  background-color: var(--el-fill-color-light);
}

.user-avatar {
  background-color: var(--el-color-primary);
  flex-shrink: 0;
}

.user-avatar img {
  object-fit: cover;
}

.username {
  color: var(--el-text-color-primary);
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  transition: transform 0.3s;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 14px;
  gap: 8px;
}

.notification-dropdown {
  width: 320px;
  background: var(--el-bg-color);
}

.notification-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.clear-btn {
  color: var(--el-color-danger);
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.header-action-btn {
  padding: 8px;
  font-size: 18px;
}

.header-action-btn:hover {
  background-color: var(--el-fill-color-light) !important;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.notification-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.notification-main {
  flex: 1;
  min-width: 0;
}

.item-delete-btn {
  padding: 4px;
  color: var(--el-text-color-secondary);
  opacity: 0;
  transition: all 0.2s;
}

.notification-item:hover .item-delete-btn {
  opacity: 1;
}

.item-delete-btn:hover {
  color: var(--el-color-danger);
}

.notification-item:hover {
  background-color: var(--el-fill-color-lighter);
}

.notification-item.unread {
  background-color: var(--el-color-primary-light-9);
  position: relative;
}

.notification-status-dot {
  position: absolute;
  left: 8px;
  top: 18px;
  width: 6px;
  height: 6px;
  background-color: var(--el-color-primary);
  border-radius: 50%;
}

.notification-item.unread:hover {
  background-color: var(--el-color-primary-light-8);
}

/* Drawer specific styles */
:deep(.notification-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 0;
}

.drawer-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-lighter);
  width: 100%;
}

.drawer-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

:deep(.notification-drawer .el-drawer__body) {
  padding: 0;
}

.notification-title {
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.notification-empty {
  padding: 48px 20px;
  text-align: center;
  color: var(--el-text-color-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.3;
}

.notification-empty p {
  margin: 0;
  font-size: 14px;
}

.notification-footer {
  padding: 16px;
  text-align: center;
  border-top: 1px solid var(--el-border-color-lighter);
}

.view-all-btn {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  border: none;
  font-weight: 500;
  transition: all 0.3s;
}

.view-all-btn:hover {
  background: var(--el-fill-color);
  color: var(--el-color-primary);
}

/* Pulse animation for unread notifications */
.pulsing :deep(.el-badge__content) {
  animation: badge-pulse 2s infinite;
}

@keyframes badge-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(245, 108, 108, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
  }
}
</style>
