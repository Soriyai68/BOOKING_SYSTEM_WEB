<template>
  <div class="edit-seat">
    <!-- Page Header -->
    <div class="page-header">
      <h2>{{ $t("seats.editSeat") }}</h2>
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        {{ $t("actions.back") }}
      </el-button>
    </div>

    <!-- Loading State -->
    <div v-if="pageLoading" class="loading-placeholder">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- Error State -->
    <el-alert
      v-else-if="loadError"
      :title="$t('common.error')"
      :description="loadError"
      type="error"
      show-icon
      :closable="false"
    />

    <!-- Seat Form -->
    <el-card v-else>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item :label="$t('seats.row')" prop="row">
          <el-input
            v-model="form.row"
            maxlength="5"
            show-word-limit
            @input="form.row = form.row.toUpperCase()"
          />
        </el-form-item>

        <el-form-item :label="$t('seats.seatNumber')" prop="seat_number">
          <el-input
            v-model="form.seat_number"
            maxlength="10"
            show-word-limit
            @input="
              form.seat_number = form.seat_number.toString().toUpperCase()
            "
          />
        </el-form-item>

        <el-form-item :label="$t('seats.type')" prop="seat_type">
          <el-select v-model="form.seat_type" style="width: 100%">
            <el-option
              v-for="type in seatTypes"
              :key="type.value"
              :label="$t(`seats.types.${type.value}`)"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('seats.status')" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option
              v-for="status in seatStatuses"
              :key="status.value"
              :label="$t(`seats.statuses.${status.value}`)"
              :value="status.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('seats.price')" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :max="9999"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('seats.notes')" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- Form Actions -->
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            {{ $t("seats.updateSeat") }}
          </el-button>
          <el-button @click="resetForm">
            {{ $t("actions.reset") }}
          </el-button>
          <el-button type="danger" @click="handleDelete" v-if="canDelete">
            {{ $t("seats.deleteSeat") }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { seatService } from "@/services/seatService";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "../../stores/auth";
import { ArrowLeft } from "@element-plus/icons-vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const authStore = useAuthStore();

// Form reference
const formRef = ref();
const loading = ref(false);
const pageLoading = ref(false);
const loadError = ref("");
const originalSeat = ref(null);

// Form data
const form = reactive({
  theater_id: "",
  hall_id: "",
  row: "",
  seat_number: "",
  seat_type: "regular",
  status: "active",
  price: 0,
  is_available: true,
  notes: "",
});

// Seat types
const seatTypes = ref([
  { value: "regular", label: "Regular" },
  { value: "vip", label: "VIP" },
  { value: "couple", label: "Couple" },
  { value: "king", label: "King" },
  { value: "queen", label: "Queen" },
]);

const seatStatuses = ref([
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "out_of_order", label: "Out of Order" },
  { value: "reserved", label: "Reserved" },
]);

// Form validation rules
const rules = {
  row: [
    { required: true, message: t("validation.required"), trigger: "blur" },
    {
      min: 1,
      max: 5,
      message: "Row must be between 1 and 5 characters",
      trigger: "blur",
    },
    {
      pattern: /^[A-Z][A-Z0-9]*$/,
      message:
        "Row must start with a letter and contain only letters and numbers",
      trigger: "blur",
    },
  ],
  seat_number: [
    { required: true, message: t("validation.required"), trigger: "blur" },
    {
      min: 1,
      max: 10,
      message: "Seat number must be between 1 and 10 characters",
      trigger: "blur",
    },
    {
      pattern: /^[A-Z0-9]+$/,
      message: "Seat number must contain only letters and numbers",
      trigger: "blur",
    },
  ],
  seat_type: [
    { required: true, message: t("validation.required"), trigger: "change" },
  ],
  status: [
    { required: true, message: t("validation.required"), trigger: "change" },
  ],
  price: [
    {
      type: "number",
      min: 0,
      message: "Price must be greater than or equal to 0",
      trigger: "blur",
    },
  ],
};

// Computed properties
const seatIdentifier = computed(() => {
  return form.row && form.seat_number ? `${form.row}${form.seat_number}` : "-";
});

const displayName = computed(() => {
  return form.row && form.seat_number && form.seat_type
    ? `Seat ${form.row}${form.seat_number} (${form.seat_type})`
    : "-";
});

// Check if current user can delete this user
const canDelete = computed(() => {
  // Add logic to determine if the current user can delete this seat
  // For now, assuming admin can delete any seat
  return authStore.isAdmin;
});

// Load seat data
const loadSeat = async () => {
  const seatId = route.params.id;
  if (!seatId) {
    loadError.value = "Seat ID is missing";
    return;
  }

  pageLoading.value = true;
  loadError.value = "";

  try {
    const seatData = await seatService.getSeat(seatId);
    originalSeat.value = seatData;

    // Populate form with seat data
    Object.assign(form, {
      row: seatData.row || "",
      seat_number: seatData.seat_number || "",
      seat_type: seatData.seat_type || "regular",
      status: seatData.status || "active",
      price: seatData.price || 0,
      notes: seatData.notes || "",
    });
  } catch (error) {
    console.error("Load seat error:", error);
    loadError.value =
      error.response?.data?.message || "Failed to load seat data";
  } finally {
    pageLoading.value = false;
  }
};

// Submit form
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    await seatService.updateSeat(route.params.id, form);

    ElMessage.success(t("seats.updateSuccess") || "Seat updated successfully");
    router.push("/admin/seats");
  } catch (error) {
    console.error("Update seat error:", error);

    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error("Failed to update seat");
    }
  } finally {
    loading.value = false;
  }
};

// Delete seat
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      t("seats.confirmDelete"),
      t("seats.deleteSeat"),
      {
        confirmButtonText: t("seats.deleteSeat"),
        cancelButtonText: t("actions.cancel"),
        type: "warning",
      }
    );

    await seatService.deleteSeat(route.params.id);
    ElMessage.success(t("seats.deleteSuccess"));
    router.push("/admin/seats");
  } catch (error) {
    if (error !== "cancel") {
      console.error("Delete seat error:", error);
      ElMessage.error("Failed to delete seat");
    }
  }
};

// Reset form to original data
const resetForm = () => {
  if (originalSeat.value) {
    Object.assign(form, {
      row: originalSeat.value.row || "",
      seat_number: originalSeat.value.seat_number || "",
      seat_type: originalSeat.value.seat_type || "regular",
      status: originalSeat.value.status || "active",
      price: originalSeat.value.price || 0,
      notes: originalSeat.value.notes || "",
    });
  }

  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// Format date utility
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

// Format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

onMounted(async () => {
  await loadSeat();

  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("seats.title"), path: "/admin/seats" },
    { title: t("seats.editSeat"), path: "#" },
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

.el-form {
  max-width: 640px;
}

.loading-placeholder {
  padding: 20px;
}

.error-state {
  text-align: center;
  padding: 40px 20px;
}
</style>
