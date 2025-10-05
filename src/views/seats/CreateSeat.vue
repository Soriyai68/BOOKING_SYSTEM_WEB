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
    <el-card>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item :label="$t('seats.theater')" prop="theater_id">
          <el-select
            v-model="form.theater_id"
            style="width: 100%"
            :loading="loadingTheaters"
            filterable
            @change="handleTheaterChange"
          >
            <el-option
              v-for="theater in theaters"
              :key="theater.id"
              :label="theater.display_name || theater.name"
              :value="theater.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('seats.screen')" prop="screen_id">
          <el-select
            v-model="form.screen_id"
            :disabled="!form.theater_id"
            :loading="loadingScreens"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="screen in filteredScreens"
              :key="screen.id"
              :label="screen.screen_name"
              :value="screen.id"
            />
          </el-select>
        </el-form-item>

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
            type="number"
            min="1"
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

        <el-form-item :label="$t('seats.availability')">
          <el-switch
            v-model="form.is_available"
            :active-text="$t('seats.available')"
            :inactive-text="$t('seats.unavailable')"
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
            {{ $t("actions.submit") }}
          </el-button>
          <el-button @click="resetForm">
            {{ $t("actions.reset") }}
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
import { theaterService } from "@/services/theaterService";
import { screenService } from "@/services/screenService";
import { useAppStore } from "@/stores/app";

const { t } = useI18n();
const router = useRouter();
const appStore = useAppStore();

// Form reference
const formRef = ref();
const loading = ref(false);

// Form data
const form = reactive({
  theater_id: "",
  screen_id: "",
  row: "",
  seat_number: "",
  seat_type: "regular",
  status: "active",
  price: 0,
  is_available: true,
  notes: "",
});

// Data
const theaters = ref([]);
const screens = ref([]);
const filteredScreens = ref([]);
const loadingTheaters = ref(false);
const loadingScreens = ref(false);

// Seat types and statuses
const seatTypes = ref([
  { value: "regular", label: "Regular" },
  { value: "vip", label: "VIP" },
  { value: "couple", label: "Couple" },
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
  ],
  theater_id: [
    { required: true, message: t("validation.required"), trigger: "blur" },
  ],
  screen_id: [
    { required: true, message: t("validation.required"), trigger: "blur" },
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
    theater_id: "",
    screen_id: "",
    row: "",
    seat_number: "",
    seat_type: "regular",
    status: "active",
    price: 0,
    is_available: true,
    notes: "",
  });
};

// Load theaters
const loadTheaters = async () => {
  loadingTheaters.value = true;
  try {
    const response = await theaterService.getTheaters({ per_page: 100 });
    theaters.value = response.data || [];
  } catch (error) {
    console.error("Load theaters error:", error);
    ElMessage.error("Failed to load theaters");
  } finally {
    loadingTheaters.value = false;
  }
};

// Load screens
const loadScreens = async () => {
  loadingScreens.value = true;
  try {
    const response = await screenService.getScreens({ per_page: 100 });
    screens.value = response.data || [];
  } catch (error) {
    console.error("Load screens error:", error);
    ElMessage.error("Failed to load screens");
  } finally {
    loadingScreens.value = false;
  }
};

// Handle theater change
const handleTheaterChange = () => {
  // Filter screens by selected theater
  if (form.theater_id) {
    filteredScreens.value = screens.value.filter(
      (screen) => screen.theater_id === form.theater_id
    );
  } else {
    filteredScreens.value = [];
  }
  // Reset screen selection
  form.screen_id = "";
};

onMounted(async () => {
  await Promise.all([loadTheaters(), loadScreens()]);

  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("seats.title"), path: "/admin/seats" },
    { title: t("seats.addSeat"), path: "/admin/seats/create" },
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
</style>
