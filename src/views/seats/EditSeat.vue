<template>
  <div class="edit-seat">
    <!-- Page Header -->
    <div class="page-header">
      <h2>{{ t("seats.editSeat") }}</h2>
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        {{ t("actions.back") }}
      </el-button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="pageLoading" class="loading-placeholder">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- Error Message -->
    <el-alert
      v-else-if="loadError"
      :title="t('common.error')"
      :description="loadError"
      type="error"
      show-icon
      :closable="false"
    />

    <!-- Form -->
    <el-card v-else>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <!-- Single Select: Theater & Hall -->
        <el-form-item :label="t('seats.theaterAndHall')" prop="hall_id">
          <el-select
            v-model="form.hall_id"
            clearable
            filterable
            :loading="loadingHalls || loadingTheaters"
            placeholder="Select Theater & Hall"
          >
            <el-option
              v-for="option in hallOptions"
              :key="option.id"
              :label="option.label"
              :value="option.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('seats.row')" prop="row">
          <el-input
            v-model="form.row"
            maxlength="5"
            show-word-limit
            @input="form.row = form.row.toUpperCase()"
          />
        </el-form-item>

        <el-form-item :label="t('seats.seatNumber')" prop="seat_number">
          <el-input
            v-model="form.seat_number"
            maxlength="10"
            show-word-limit
            @input="form.seat_number = form.seat_number.toUpperCase()"
          />
        </el-form-item>

        <el-form-item :label="t('seats.type')" prop="seat_type">
          <el-select v-model="form.seat_type" style="width: 100%">
            <el-option
              v-for="type in seatTypes"
              :key="type.value"
              :label="t(`seats.types.${type.value}`)"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('seats.status')" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option
              v-for="status in seatStatuses"
              :key="status.value"
              :label="t(`seats.statuses.${status.value}`)"
              :value="status.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('seats.price')" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :max="9999"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="t('seats.notes')" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- Actions -->
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            {{ t("seats.updateSeat") }}
          </el-button>
          <el-button @click="resetForm">{{ t("actions.reset") }}</el-button>
          <el-button type="danger" @click="handleDelete" v-if="canDelete">
            {{ t("seats.deleteSeat") }}
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
import { hallService } from "@/services/hallService";
import { theaterService } from "@/services/theaterService";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import { ArrowLeft } from "@element-plus/icons-vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const authStore = useAuthStore();

const formRef = ref();
const loading = ref(false);
const pageLoading = ref(false);
const loadError = ref("");
const originalSeat = ref(null);

const halls = ref([]);
const theaters = ref([]);
const loadingHalls = ref(false);
const loadingTheaters = ref(false);

// Form data
const form = reactive({
  hall_id: "",
  row: "",
  seat_number: "",
  seat_type: "regular",
  status: "active",
  price: 0,
  notes: "",
});

// Seat types and statuses
const seatTypes = ref([
  { value: "regular" },
  { value: "vip" },
  { value: "couple" },
  { value: "king" },
  { value: "queen" },
]);

const seatStatuses = ref([
  { value: "active" },
  { value: "maintenance" },
  { value: "out_of_order" },
  { value: "reserved" },
]);

// Validation rules
const rules = {
  hall_id: [
    { required: true, message: t("validation.required"), trigger: "change" },
  ],
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
    { type: "number", min: 0, message: "Price must be >= 0", trigger: "blur" },
  ],
};

// Combine hall + theater name for single select
const hallOptions = computed(() => {
  return halls.value.map((hall) => {
    const theater = theaters.value.find((t) => t.id === hall.theater_id);
    return {
      id: hall.id,
      label: `${theater?.name || "Unknown Theater"} - ${hall.hall_name}`,
    };
  });
});

// Load theaters & halls
const loadHalls = async () => {
  loadingHalls.value = true;
  try {
    const response = await hallService.getHalls({ per_page: 100 });
    halls.value = response.data;
  } catch (error) {
    console.error("Failed to load halls:", error);
    ElMessage.error(t("halls.loadError"));
  } finally {
    loadingHalls.value = false;
  }
};

const loadTheaters = async () => {
  loadingTheaters.value = true;
  try {
    const response = await theaterService.getTheaters({ per_page: 100 });
    theaters.value = response.data;
  } catch (error) {
    console.error("Failed to load theaters:", error);
    ElMessage.error(t("theaters.loadError"));
  } finally {
    loadingTheaters.value = false;
  }
};

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
    console.log("Original Seat:", originalSeat.value);
    Object.assign(form, seatData);
  } catch (error) {
    console.error(error);
    loadError.value =
      error.response?.data?.message || "Failed to load seat data";
  } finally {
    pageLoading.value = false;
  }
};

// Can delete
const canDelete = computed(() => authStore.isAdmin);

// Handle submit
const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    loading.value = true;

    await seatService.updateSeat(route.params.id, form);
    ElMessage.success(t("messages.success"));
    router.push("/admin/seats");
  } catch (error) {
    console.error(error);
    ElMessage.error(error.response?.data?.message || "Failed to update seat");
  } finally {
    loading.value = false;
  }
};

// Handle delete
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
      console.error(error);
      ElMessage.error("Failed to delete seat");
    }
  }
};

// Reset form
const resetForm = () => {
  if (originalSeat.value) {
    Object.assign(form, {
      hall_id: originalSeat.value.hall_id || "",
      row: originalSeat.value.row || "",
      seat_number: originalSeat.value.seat_number || "",
      seat_type: originalSeat.value.seat_type || "regular",
      status: originalSeat.value.status || "active",
      price: originalSeat.value.price || 0,
      notes: originalSeat.value.notes || "",
    });
  }
  if (formRef.value) formRef.value.clearValidate();
};

onMounted(async () => {
  await Promise.all([loadTheaters(), loadHalls()]);
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
</style>
