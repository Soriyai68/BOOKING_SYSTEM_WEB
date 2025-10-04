<template>
  <div class="create-seat">
    <!-- Page Header -->
    <div class="page-header">
      <h2>{{ $t("seats.addSeat") }}</h2>
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        {{ $t("actions.back") }}
      </el-button>
    </div>

    <!-- Seat Form -->
    <el-card shadow="never">
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
                :placeholder="$t('seats.row')"
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
                :placeholder="$t('seats.seatNumber')"
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
            <el-form-item :label="$t('seats.availability')">
              <el-switch
                v-model="form.is_available"
                :active-text="$t('seats.available')"
                :inactive-text="$t('seats.unavailable')"
              />
              <div class="form-help">
                {{ $t("seats.availabilityHelp") }}
              </div>
            </el-form-item>
          </el-col>
        </el-row>

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
            {{ $t("seats.createSeat") }}
          </el-button>
          <el-button @click="resetForm">
            {{ $t("actions.reset") }}
          </el-button>
          <el-button @click="$router.back()">
            {{ $t("actions.cancel") }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { seatService } from "@/services/seatService";
import { useAppStore } from "@/stores/app";

const { t } = useI18n();
const router = useRouter();
const appStore = useAppStore();

// Form reference
const formRef = ref();
const loading = ref(false);

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
  ],
  seat_number: [
    { required: true, message: t("validation.required"), trigger: "blur" },
    {
      min: 1,
      max: 10,
      message: "Seat number must be between 1 and 10 characters",
      trigger: "blur",
    },
  ],
  seat_type: [
    { required: true, message: t("validation.required"), trigger: "change" },
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

// Methods
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    await seatService.createSeat(form);

    ElMessage.success(t("seats.createSuccess") || "Seat created successfully");
    router.push("/admin/seats");
  } catch (error) {
    console.error("Create seat error:", error);

    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error("Failed to create seat");
    }
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }

  Object.assign(form, {
    row: "",
    seat_number: "",
    seat_type: "regular",
    is_available: true,
  });
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("seats.title"), path: "/admin/seats" },
    { title: t("seats.addSeat"), path: "/admin/seats/create" },
  ]);
});
</script>

<style scoped>
.create-seat {
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
