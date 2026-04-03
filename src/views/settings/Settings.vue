<template>
  <div class="settings-container">
    <el-row :gutter="24" class="settings-row">
      <!-- Content Area -->
      <el-col :xs="24" :sm="24" :md="24" :offset="0" class="content-col">
        <div class="content-wrapper glass-card">
          <!-- Persistent Header -->
          <div class="settings-header">
            <div class="header-left">
              <h2 class="view-title">{{ pageTitle }}</h2>
            </div>
            <el-button
              v-if="$route.name !== 'AdminSettings'"
              plain
              class="back-btn"
              @click="router.push({ name: 'AdminSettings' })"
            >
              {{ t("actions.back") }}
            </el-button>
          </div>

          <!-- Content Scroll Area -->
          <div class="settings-content">
            <router-view v-if="$route.name !== 'AdminSettings'" />
            <div v-else class="overview-content">
              <p class="welcome-text">{{ t("settings.manageAccount") }}</p>

              <div class="quick-links">
                <el-card class="stat-card" @click="handleMenuSelect('profile')">
                  <div class="stat-content">
                    <div class="stat-icon icon-blue">
                      <User :size="24" />
                    </div>
                    <div class="stat-details">
                      <span class="stat-title">{{
                        t("settings.profile")
                      }}</span>
                      <span class="stat-desc">{{
                        t("settings.profileDesc")
                      }}</span>
                    </div>
                  </div>
                </el-card>

                <el-card
                  class="stat-card"
                  @click="handleMenuSelect('activity-logs')"
                >
                  <div class="stat-content">
                    <div class="stat-icon icon-purple">
                      <Activity :size="24" />
                    </div>
                    <div class="stat-details">
                      <span class="stat-title">{{
                        t("activity_logs.title")
                      }}</span>
                      <span class="stat-desc">{{
                        t("settings.activityHistoryDesc")
                      }}</span>
                    </div>
                  </div>
                </el-card>

                <!-- <el-card
                  class="stat-card"
                  @click="handleMenuSelect('security')"
                >
                  <div class="stat-content">
                    <div class="stat-icon icon-red">
                      <Shield :size="24" />
                    </div>
                    <div class="stat-details">
                      <span class="stat-title">{{
                        t("settings.privacySecurity")
                      }}</span>
                      <span class="stat-desc">{{
                        t("settings.privacySecurityDesc")
                      }}</span>
                    </div>
                  </div>
                </el-card> -->

                <!-- System Management Cards (SuperAdmin Only) -->
                <template v-if="authStore.isSuperAdmin">
                  <el-card
                    class="stat-card"
                    @click="handleMenuSelect('permissions')"
                  >
                    <div class="stat-content">
                      <div class="stat-icon icon-blue">
                        <Shield :size="24" />
                      </div>
                      <div class="stat-details">
                        <span class="stat-title">{{
                          t("system.permissions")
                        }}</span>
                        <span class="stat-desc">
                          {{
                            t("system.permissionsDesc") ||
                            "Manage system access permissions"
                          }}
                        </span>
                      </div>
                    </div>
                  </el-card>

                  <el-card
                    class="stat-card"
                    @click="handleMenuSelect('role-permissions')"
                  >
                    <div class="stat-content">
                      <div class="stat-icon icon-purple">
                        <UserCog :size="24" />
                      </div>
                      <div class="stat-details">
                        <span class="stat-title">{{
                          t("system.rolePermissions")
                        }}</span>
                        <span class="stat-desc">
                          {{
                            t("system.rolePermissionsDesc") ||
                            "Assign permissions to roles"
                          }}
                        </span>
                      </div>
                    </div>
                  </el-card>
                </template>

                <!-- Backup Management Cards (Admin/SuperAdmin Only) -->
                <template v-if="canViewBackups">
                  <el-card
                    class="stat-card"
                    @click="handleMenuSelect('backup-restore')"
                  >
                    <div class="stat-content">
                      <div class="stat-icon icon-green">
                        <Database :size="24" />
                      </div>
                      <div class="stat-details">
                        <span class="stat-title">{{ t('backup.backupRestore') }}</span>
                        <span class="stat-desc">
                          {{ t('backup.backupRestoreDescription') }}
                        </span>
                      </div>
                    </div>
                  </el-card>

                  <el-card
                    v-if="canScheduleBackups"
                    class="stat-card"
                    @click="handleMenuSelect('backup-schedule')"
                  >
                    <div class="stat-content">
                      <div class="stat-icon icon-orange">
                        <Clock :size="24" />
                      </div>
                      <div class="stat-details">
                        <span class="stat-title">{{ t('backup.backupSchedule') }}</span>
                        <span class="stat-desc">
                          {{ t('backup.backupScheduleDescription') }}
                        </span>
                      </div>
                    </div>
                  </el-card>
                </template>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import { usePermissions } from "@/composables/usePermissions";
import { User, Activity, Shield, ArrowLeft, UserCog, Database, Clock } from "lucide-vue-next";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const authStore = useAuthStore();
const { canViewBackups, canScheduleBackups } = usePermissions();

const user = computed(() => authStore.user);

const pageTitle = computed(() => {
  if (route.name === "AdminActivityLogs") return t("activity_logs.title");
  // if (route.name === "AdminSecurity") return t("settings.privacySecurity");
  if (route.name === "Profile") return t("settings.profile");
  if (route.name === "SystemPermissions") return t("system.permissions");
  if (route.name === "SystemRolePermissions")
    return t("system.rolePermissions");
  if (route.name === "BackupRestore") return t("backup.backupRestore");
  if (route.name === "BackupSchedule") return t("backup.backupSchedule");
  return t("settings.accountSettings");
});

const handleMenuSelect = (index) => {
  if (index === "profile") {
    router.push({ name: "Profile" });
  } else if (index === "activity-logs") {
    router.push({ name: "AdminActivityLogs" });
  } else if (index === "security") {
    router.push({ name: "AdminSecurity" });
  } else if (index === "permissions") {
    router.push({ name: "SystemPermissions" });
  } else if (index === "role-permissions") {
    router.push({ name: "SystemRolePermissions" });
  } else if (index === "backup-restore") {
    router.push({ name: "BackupRestore" });
  } else if (index === "backup-schedule") {
    router.push({ name: "BackupSchedule" });
  }
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/dashboard" },
    { title: t("settings.title"), path: "/settings" },
  ]);
});
</script>

<style scoped>
.settings-container {
  padding: 0;
  min-height: calc(100vh - 120px);
}

.glass-card {
  background: var(--bg-color-primary);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border-color-light);
  border-radius: 20px;
  box-shadow:
    0 10px 30px -10px var(--shadow-color),
    0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:global(.dark) .glass-card {
  background: rgba(29, 29, 31, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.settings-row {
  display: flex;
  justify-content: center;
}

.settings-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1.5px solid var(--border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-title {
  margin: 0;
  font-size: 26px;
  font-weight: 850;
  color: var(--el-color-primary);
  letter-spacing: -0.025em;
}

.back-btn {
  border: 1px solid rgba(24, 144, 255, 0.2);
  background: rgba(24, 144, 255, 0.05);
  padding: 10px 20px;
  height: auto;
  font-weight: 700;
  font-size: 13px;
  border-radius: 10px;
  color: var(--primary-color);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.3px;
}

.back-btn:hover {
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.2);
}

.content-wrapper {
  padding: 24px;
  min-height: 500px;
}

.welcome-text {
  color: var(--text-color-secondary);
  font-size: 14px;
  margin-bottom: 24px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color-overlay);
}

.stat-card:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-fill-color-lighter);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-blue {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.icon-purple {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.icon-red {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.icon-green {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.icon-orange {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.stat-details {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.stat-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--text-color-primary);
}

.stat-desc {
  font-size: 12px;
  color: var(--text-color-secondary);
}
</style>
