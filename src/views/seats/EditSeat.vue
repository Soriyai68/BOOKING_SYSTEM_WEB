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
    <el-card v-else shadow="never">
      <!-- Original Seat Info -->
      <div v-if="originalSeat" class="original-info">
        <h4>{{ $t("seats.originalInfo") }}</h4>
        <el-descriptions :column="3" size="small" border>
          <el-descriptions-item :label="$t('seats.seatId')">
            {{ originalSeat.seat_identifier }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('seats.type')">
            {{ $t(`seats.types.${originalSeat.seat_type}`) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('common.createdAt')">
            {{ formatDateTime(originalSeat.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('common.updatedAt')">
            {{ formatDateTime(originalSeat.updated_at) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-divider />

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="150px"
        class="seat-form"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item :label="$t('seats.row')" prop="row">
              <el-input
                v-model="form.row"
                :placeholder="$t('seats.rowPlaceholder')"
                maxlength="5"
                show-word-limit
                @input="form.row = form.row.toUpperCase()"
              />
              <div class="form-help">
                {{ $t("seats.rowHelp") }}
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item :label="$t('seats.seatNumber')" prop="seat_number">
              <el-input
                v-model="form.seat_number"
                :placeholder="$t('seats.seatNumberPlaceholder')"
                maxlength="10"
                show-word-limit
                @input="
                  form.seat_number = form.seat_number.toString().toUpperCase()
                "
              />
              <div class="form-help">
                {{ $t("seats.seatNumberHelp") }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item :label="$t('seats.type')" prop="seat_type">
              <el-select v-model="form.seat_type" style="width: 100%">
                <el-option
                  v-for="type in seatTypes"
                  :key="type.value"
                  :label="$t(`seats.types.${type.value}`)"
                  :value="type.value"
                />
              </el-select>
              <div class="form-help">
                {{ $t("seats.typeHelp") }}
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item :label="$t('seats.status')" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option
                  v-for="status in seatStatuses"
                  :key="status.value"
                  :label="$t(`seats.statuses.${status.value}`)"
                  :value="status.value"
                />
              </el-select>
              <div class="form-help">
                {{ $t("seats.statusHelp") }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item :label="$t('seats.price')" prop="price">
              <el-input-number
                v-model="form.price"
                :min="0"
                :max="9999"
                :precision="2"
                style="width: 100%"
              />
              <div class="form-help">
                {{ $t("seats.priceHelp") }}
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item :label="$t('seats.availability')">
              <el-switch
                v-model="form.is_available"
                :active-text="$t('common.available')"
                :inactive-text="$t('common.unavailable')"
              />
              <div class="form-help">
                {{ $t("seats.availabilityHelp") }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item :label="$t('seats.theaterId')" prop="theater_id">
              <el-input
                v-model="form.theater_id"
                :placeholder="$t('seats.theaterIdPlaceholder')"
              />
              <div class="form-help">
                {{ $t("seats.theaterIdHelp") }}
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item :label="$t('seats.screenId')" prop="screen_id">
              <el-input
                v-model="form.screen_id"
                :placeholder="$t('seats.screenIdPlaceholder')"
              />
              <div class="form-help">
                {{ $t("seats.screenIdHelp") }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('seats.notes')" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            :placeholder="$t('seats.notesPlaceholder')"
            maxlength="500"
            show-word-limit
          />
          <div class="form-help">
            {{ $t("seats.notesHelp") }}
          </div>
        </el-form-item>

        <!-- Preview -->
        <el-divider>{{ $t("seats.preview") }}</el-divider>
        <div class="seat-preview">
          <div class="preview-item">
            <span class="preview-label">{{ $t("seats.seatIdentifier") }}:</span>
            <span class="preview-value">{{ seatIdentifier }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">{{ $t("seats.displayName") }}:</span>
            <span class="preview-value">{{ displayName }}</span>
          </div>
        </div>

        <!-- Form Actions -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ $t("seats.updateSeat") }}
          </el-button>
          <el-button @click="resetForm">
            {{ $t("actions.reset") }}
          </el-button>
          <el-button @click="$router.back()">
            {{ $t("actions.cancel") }}
          </el-button>
          <el-button
            type="danger"
            @click="handleDelete"
            v-if="originalSeat && !originalSeat.deleted_at"
          >
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
import { ArrowLeft } from "@element-plus/icons-vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

// Form reference
const formRef = ref();
const loading = ref(false);
const pageLoading = ref(false);
const loadError = ref("");
const originalSeat = ref(null);

// Form data
const form = reactive({
  row: "",
  seat_number: "",
  seat_type: "regular",
  is_available: true,
});

// Seat types
const seatTypes = ref([
  { value: "regular", label: "Regular" },
  { value: "vip", label: "VIP" },
  { value: "couple", label: "Couple" },
  { value: "king", label: "King" },
  { value: "queen", label: "Queen" },
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
      is_available: seatData.is_available ?? true,
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
      is_available: originalSeat.value.is_available ?? true,
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
.edit-seat {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.loading-placeholder {
  padding: 20px;
}

.original-info {
  margin-bottom: 20px;
}

.original-info h4 {
  margin: 0 0 16px 0;
  color: #606266;
}

.seat-form {
  max-width: 1000px;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.seat-preview {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.preview-item {
  display: flex;
  margin-bottom: 8px;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-label {
  font-weight: 500;
  min-width: 120px;
  color: #606266;
}

.preview-value {
  color: #303133;
  font-weight: 500;
}
</style>
