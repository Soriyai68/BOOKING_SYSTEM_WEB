<template>
  <div class="security-view">
    <!-- Session Management -->
    <el-card class="security-card main-section-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><Monitor /></el-icon>
            <span>{{ t("settings.activeSessions") }}</span>
          </div>
          <el-button
            type="danger"
            plain
            size="small"
            @click="handleLogoutOthers"
          >
            {{ t("settings.logoutOtherDevices") }}
          </el-button>
        </div>
      </template>

      <div class="session-list">
        <div
          v-for="(session, index) in sessions"
          :key="index"
          class="session-item"
        >
          <div class="session-icon">
            <el-icon :size="20">
              <component :is="getDeviceIcon(session.device)" />
            </el-icon>
          </div>
          <div class="session-info">
            <div class="session-main">
              <span class="device-name">{{ session.device }}</span>
              <el-tag
                v-if="session.current"
                size="small"
                type="success"
                effect="plain"
                class="current-tag"
              >
                {{ t("settings.thisDevice") }}
              </el-tag>
            </div>
            <div class="session-meta">
              <span class="session-location">{{ session.location }}</span>
              <span class="divider">•</span>
              <span class="session-time">{{ session.time }}</span>
              <span class="divider">•</span>
              <span class="session-ip">{{ session.ip }}</span>
            </div>
          </div>
          <el-button
            v-if="!session.current"
            link
            type="danger"
            @click="handleRevokeSession(session)"
          >
            {{ t("actions.remove") }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- Account Protection -->
    <el-card class="security-card main-section-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><ShieldCheck /></el-icon>
            <span>{{ t("settings.security") }}</span>
          </div>
        </div>
      </template>

      <div class="protection-list">
        <div class="protection-item">
          <div class="protection-info">
            <span class="protection-title">{{
              t("settings.changePassword")
            }}</span>
            <span class="protection-desc">{{
              t("profile.passwordOptional")
            }}</span>
          </div>
          <el-button type="primary" plain @click="goToProfilePassword">
            {{ t("actions.update") }}
          </el-button>
        </div>

        <el-divider />

        <div class="protection-item">
          <div class="protection-info">
            <span class="protection-title"
              >Two-Factor Authentication (2FA)</span
            >
            <span class="protection-desc"
              >Add an extra layer of security to your account.</span
            >
          </div>
          <el-tag type="info">Coming Soon</el-tag>
        </div>
      </div>
    </el-card>

    <!-- Danger Zone -->
    <el-card class="security-card main-section-card danger-zone" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><AlertCircle /></el-icon>
            <span>{{ t("settings.deleteAccountWarning") }}</span>
          </div>
        </div>
      </template>

      <div class="danger-content">
        <div class="danger-info">
          <span class="danger-title">{{ t("settings.deleteAccount") }}</span>
          <span class="danger-desc">{{ t("settings.deleteAccountDesc") }}</span>
        </div>
        <el-button type="danger" @click="handleDeleteAccount">
          {{ t("settings.confirmDeleteAccount") }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import {
  Monitor,
  Smartphone,
  Laptop,
  ShieldCheck,
  AlertCircle,
} from "lucide-vue-next";
import { ElMessage, ElMessageBox } from "element-plus";

const { t } = useI18n();
const router = useRouter();

// Mock sessions data - in a real app, this would come from the backend
const sessions = ref([
  {
    device: "Windows PC (Chrome)",
    location: "Phnom Penh, Cambodia",
    time: "Active now",
    ip: "119.124.xx.xxx",
    current: true,
  },
  {
    device: "iPhone 15 Pro (Safari)",
    location: "Siem Reap, Cambodia",
    time: "2 hours ago",
    ip: "103.24.xx.xxx",
    current: false,
  },
  {
    device: "iPad Air (App)",
    location: "Phnom Penh, Cambodia",
    time: "Yesterday",
    ip: "27.109.xx.xxx",
    current: false,
  },
]);

const getDeviceIcon = (deviceName) => {
  if (deviceName.toLowerCase().includes("phone")) return Smartphone;
  if (deviceName.toLowerCase().includes("ipad")) return Smartphone;
  return Laptop;
};

const handleLogoutOthers = () => {
  ElMessageBox.confirm(
    "This will log you out from all other devices. Continue?",
    "Confirm Logout",
    {
      confirmButtonText: "Logout Others",
      cancelButtonText: "Cancel",
      type: "warning",
      confirmButtonClass: "el-button--danger",
    },
  )
    .then(() => {
      // In a real app, call an API here
      sessions.value = sessions.value.filter((s) => s.current);
      ElMessage.success("Logged out from other devices successfully");
    })
    .catch(() => {});
};

const handleRevokeSession = (session) => {
  ElMessage.success(`Session on ${session.device} revoked`);
  sessions.value = sessions.value.filter((s) => s !== session);
};

const goToProfilePassword = () => {
  router.push({ name: "Profile" });
};

const handleDeleteAccount = () => {
  ElMessageBox.confirm(
    t("settings.deleteAccountConfirmDesc"),
    t("settings.deleteAccountConfirmTitle"),
    {
      confirmButtonText: t("settings.confirmDeleteAccount"),
      cancelButtonText: t("actions.cancel"),
      type: "error",
      confirmButtonClass: "el-button--danger",
    },
  )
    .then(() => {
      ElMessage.error(
        "This action is protected for admin accounts. Please contact the system owner.",
      );
    })
    .catch(() => {});
};
</script>

<style scoped>
.view-header {
  margin-bottom: 24px;
}

.view-title {
  margin-bottom: 24px;
  font-size: 22px;
  font-weight: 800;
  color: var(--primary-color);
}

.security-card {
  margin-bottom: 24px;
}

.main-section-card {
  background: transparent;
  border-radius: 16px;
  border: 1px solid var(--el-border-color-lighter);
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  color: var(--text-color-primary);
}

.header-title .el-icon {
  color: var(--primary-color);
  font-size: 20px;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  border-radius: 16px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.session-item:hover {
  background: rgba(var(--el-color-primary-rgb), 0.04);
  transform: translateX(4px);
}

.session-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.session-info {
  flex: 1;
}

.session-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.device-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.divider {
  opacity: 0.5;
}

.protection-list {
  display: flex;
  flex-direction: column;
}

.protection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.protection-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.protection-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--el-text-color-primary);
}

.protection-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.danger-zone {
  border: 1px solid var(--el-border-color-lighter);
  background: rgba(239, 68, 68, 0.04);
}

.danger-zone .header-title {
  color: #ef4444;
}

.danger-zone .header-title .el-icon {
  color: #ef4444;
}

.danger-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--el-bg-color-overlay);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

.danger-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.danger-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--danger-color);
}

.danger-desc {
  font-size: 13px;
  color: var(--text-color-secondary);
  max-width: 500px;
}

@media (max-width: 640px) {
  .danger-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
