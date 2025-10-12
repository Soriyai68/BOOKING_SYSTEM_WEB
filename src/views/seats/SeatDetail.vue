<template>
  <div>
    <div class="page-header">
      <h2>{{ $t("seats.seatDetails") }}</h2>
      <div>
        <el-button @click="$router.back()">{{ $t("actions.back") }}</el-button>
        <el-button type="primary" @click="goEdit" v-if="authStore.isAdmin">{{
          $t("actions.edit")
        }}</el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <el-descriptions :title="seat?.display_name" :column="2" border>
        <el-descriptions-item :label="$t('seats.indentifier')">
          {{ seat?.seat_identifier }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('seats.row')">
          {{ seat?.row }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('seats.seatNumber')">
          {{ seat?.seat_number }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('seats.type')">
          <el-tag :type="getSeatTypeColor(seat?.seat_type)" size="small">
            {{ $t(`seats.types.${seat?.seat_type}`) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('seats.status')">
          <el-tag :type="getStatusColor(seat?.status)" size="small">
            {{ $t(`seats.statuses.${seat?.status}`) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('seats.price')">
          ${{ seat?.price?.toFixed(2) || "0.00" }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('users.created')">
          {{ formatDateTime(seat?.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('users.updated')">
          {{ formatDateTime(seat?.updated_at) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('seats.notes')" :span="2">
          {{ seat?.notes || "-" }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- Actions Section -->
    <el-card class="actions-section" v-if="authStore.isAdmin">
      <template #header>
        <span>{{ $t("seats.actions") }}</span>
      </template>
      <el-space wrap>
        <el-button type="info" @click="showUpdateStatusDialog = true">
          {{ $t("seats.updateStatus") }}
        </el-button>
        <el-button type="danger" @click="handleDelete">
          {{ $t("seats.deleteSeat") }}
        </el-button>
      </el-space>
    </el-card>

    <!-- Update Status Dialog -->
    <el-dialog
      v-model="showUpdateStatusDialog"
      :title="$t('seats.updateStatus')"
      width="400px"
    >
      <el-form label-width="100px">
        <el-form-item :label="$t('seats.status')">
          <el-select v-model="newStatus" style="width: 100%">
            <el-option
              v-for="status in seatStatuses"
              :key="status.value"
              :label="$t(`seats.statuses.${status.value}`)"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showUpdateStatusDialog = false">
          {{ $t("actions.cancel") }}
        </el-button>
        <el-button
          type="primary"
          @click="updateStatus"
          :loading="actionLoading"
        >
          {{ $t("actions.update") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";
import { seatService } from "@/services/seatService";
import { ElMessage, ElMessageBox } from "element-plus";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const authStore = useAuthStore();
const { t } = useI18n();

const loading = ref(false);
const actionLoading = ref(false);
const seat = ref(null);
const showUpdateStatusDialog = ref(false);
const newStatus = ref("active");

const seatStatuses = ref([
  { value: t("active"), label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "out_of_order", label: "Out of Order" },
  { value: "reserved", label: "Reserved" },
]);

const load = async () => {
  loading.value = true;
  try {
    const data = await seatService.getSeat(route.params.id);
    seat.value = data;
    newStatus.value = data.status;
  } catch (e) {
    console.error("Failed to load seat:", e);
    ElMessage.error(t("seats.loadError"));
  } finally {
    loading.value = false;
  }
};

const goEdit = () => router.push(`/admin/seats/${route.params.id}/edit`);

const updateStatus = async () => {
  actionLoading.value = true;
  try {
    await seatService.updateSeatStatus(route.params.id, newStatus.value);
    ElMessage.success(t("seats.statusUpdated"));
    showUpdateStatusDialog.value = false;
    await load();
  } catch (e) {
    console.error("Update status error:", e);
    ElMessage.error(t("seats.updateError"));
  } finally {
    actionLoading.value = false;
  }
};

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t("seats.confirmDelete"),
      t("seats.deleteSeat"),
      {
        type: "warning",
        confirmButtonText: t("actions.delete"),
        cancelButtonText: t("actions.cancel"),
      }
    );

    await seatService.deleteSeat(route.params.id);
    ElMessage.success(t("seats.deleteSuccess"));
    router.push("/admin/seats");
  } catch (err) {
    if (err !== "cancel") {
      console.error("Delete error:", err);
      ElMessage.error(t("seats.deleteError"));
    }
  }
};

const getSeatTypeColor = (type) => {
  const colors = {
    regular: "",
    vip: "warning",
    couple: "success",
    queen: "danger",
  };
  return colors[type] || "";
};

const getStatusColor = (status) => {
  const colors = {
    active: "success",
    maintenance: "warning",
    out_of_order: "danger",
    reserved: "info",
  };
  return colors[status] || "";
};

const formatDateTime = (str) => (str ? new Date(str).toLocaleString() : "-");

onMounted(async () => {
  await load();
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("seats.title"), path: "/admin/seats" },
    { title: t("seats.seatDetails"), path: "#" },
  ]);
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.actions-section {
  margin-top: 24px;
}

.text-muted {
  color: #909399;
}
</style>
