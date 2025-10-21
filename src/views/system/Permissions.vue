<template>
  <div class="system-permissions">
    <!-- <el-page-header :content="$t('system.permissions')" /> -->

    <el-card class="mt-3" shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ $t("system.allPermissions") }}</span>
          <el-button
            :loading="loading"
            @click="fetchPermissions"
            type="info"
            plain
            round
            size="small"
          >
            {{ $t("actions.refresh") }}
          </el-button>
        </div>
      </template>

      <el-skeleton v-if="loading" rows="6" animated />

      <div v-else>
        <el-empty
          v-if="modules.length === 0"
          :description="$t('system.noPermissions')"
        />
        <el-collapse v-else v-model="activeModules">
          <el-collapse-item
            v-for="module in modules"
            :key="module"
            :name="module"
          >
            <template #title>
              <strong style="text-transform: capitalize">{{ module }}</strong>
            </template>
            <div class="perm-list">
              <el-tag
                v-for="perm in groupedPermissions[module]"
                :key="perm._id"
                class="mr-1 mb-1"
                size="small"
              >
                {{ perm.displayName }}
              </el-tag>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/utils/api";
import { useAppStore } from "@/stores/app";
import { useI18n } from "vue-i18n";

const loading = ref(false);
const permissions = ref([]);
const groupedPermissions = ref({});
const modules = ref([]);
const activeModules = ref([]);
const appStore = useAppStore();
const {t} = useI18n();

const fetchPermissions = async () => {
  loading.value = true;
  try {
    const res = await api.get("/permissions/all");
    if (res.data?.success) {
      permissions.value = res.data.data.permissions || [];
      groupedPermissions.value = res.data.data.groupedPermissions || {};
      modules.value =
        res.data.data.modules || Object.keys(groupedPermissions.value);
      activeModules.value = modules.value.slice(0, 0);
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchPermissions();
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("system.permissions"), path: "system/permissions" },
  ]);
});
</script>

<style scoped>
.mt-3 {
  margin-top: 12px;
}
.mr-1 {
  margin-right: 6px;
}
.mb-1 {
  margin-bottom: 6px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.perm-list {
  display: flex;
  flex-wrap: wrap;
}
</style>
