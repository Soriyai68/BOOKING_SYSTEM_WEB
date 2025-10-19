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
        <!-- Single Select: Theater & Hall -->
        <el-form-item :label="$t('seats.theaterAndHall')" prop="hall_id">
          <el-select
            v-model="form.hall_id"
            clearable
            filterable
            placeholder=""
            :loading="loadingHalls || loadingTheaters"
          >
            <el-option
              v-for="option in hallOptions"
              :key="option.id"
              :label="option.label"
              :value="option.id"
            />
          </el-select>
        </el-form-item>

        <!-- Row -->
        <el-form-item :label="$t('seats.row')" prop="row">
          <el-input
            v-model="form.row"
            maxlength="5"
            show-word-limit
            @input="form.row = form.row.toUpperCase()"
          />
        </el-form-item>

        <!-- Multi-seat toggle -->
        <el-form-item :label="$t('seats.multiSeat')">
          <el-switch
            v-model="isMultiSeat"
            :active-text="$t('seats.multiSeatMode')"
            :inactive-text="$t('seats.singleSeatMode')"
            @change="handleSeatModeChange"
          />
        </el-form-item>

        <!-- Single Seat Number -->
        <el-form-item 
          v-if="!isMultiSeat" 
          :label="$t('seats.seatNumber')" 
          prop="seat_number"
        >
          <el-input
            v-model="form.seat_number"
            maxlength="10"
            show-word-limit
            placeholder="e.g., 1, A1, 15"
            @input="form.seat_number = form.seat_number.toUpperCase()"
          />
        </el-form-item>

        <!-- Multi Seat Numbers -->
        <el-form-item 
          v-if="isMultiSeat" 
          :label="$t('seats.seatNumbers')" 
          prop="seat_numbers"
        >
          <div class="multi-seat-input">
            <el-input
              v-model="seatNumbersInput"
              type="textarea"
              :rows="3"
              placeholder="Enter multiple seat numbers separated by commas or spaces&#10;e.g., 1, 2, 3 or A1 A2 A3 or 10,11,12"
              maxlength="200"
              show-word-limit
              @input="handleMultiSeatInput"
            />
            <div v-if="parsedSeatNumbers.length > 0" class="seat-preview">
              <el-tag 
                v-for="seat in parsedSeatNumbers" 
                :key="seat" 
                closable
                @close="removeSeatNumber(seat)"
                style="margin: 2px;"
              >
                {{ seat }}
              </el-tag>
              <div class="seat-count">
                Total: {{ parsedSeatNumbers.length }} seat(s)
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- Seat Type -->
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

        <!-- Status -->
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

        <!-- Price -->
        <el-form-item :label="$t('seats.price')" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :max="9999"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>

        <!-- Notes -->
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
          <el-button v-permission="'seats.create'" type="primary" :loading="loading" @click="handleSubmit">
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
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { seatService } from "@/services/seatService";
import { hallService } from "@/services/hallService";
import { theaterService } from "@/services/theaterService";
import { useAppStore } from "@/stores/app";
import { ArrowLeft } from "@element-plus/icons-vue";

const { t } = useI18n();
const router = useRouter();
const appStore = useAppStore();

const formRef = ref();
const loading = ref(false);
const isMultiSeat = ref(false);
const seatNumbersInput = ref("");

const form = reactive({
  hall_id: "",
  row: "",
  seat_number: "",
  seat_numbers: [],
  seat_type: "regular",
  status: "active",
  price: 0,
  notes: "",
});

const halls = ref([]);
const theaters = ref([]);
const loadingHalls = ref(false);
const loadingTheaters = ref(false);

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
  { value: "closed", label: "Closed" },
]);

// Parse seat numbers from input
const parsedSeatNumbers = computed(() => {
  if (!seatNumbersInput.value) return [];
  
  // Split by comma, space, or newline and clean up
  const numbers = seatNumbersInput.value
    .split(/[,\s\n]+/)
    .map(s => s.trim().toUpperCase())
    .filter(s => s.length > 0);
  
  // Remove duplicates
  return [...new Set(numbers)];
});

// Validation rules
const rules = computed(() => {
  const baseRules = {
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

  if (isMultiSeat.value) {
    baseRules.seat_numbers = [
      { 
        validator: (rule, value, callback) => {
          if (parsedSeatNumbers.value.length === 0) {
            callback(new Error("At least one seat number is required"));
          } else if (parsedSeatNumbers.value.length > 10) {
            callback(new Error("Maximum 10 seat numbers allowed"));
          } else {
            callback();
          }
        }, 
        trigger: "change" 
      },
    ];
  } else {
    baseRules.seat_number = [
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
    ];
  }

  return baseRules;
});

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

// Handle multi-seat input change
const handleMultiSeatInput = () => {
  // Update the seat_numbers in form for validation
  form.seat_numbers = parsedSeatNumbers.value;
};

// Remove a seat number from the list
const removeSeatNumber = (seatToRemove) => {
  const numbers = seatNumbersInput.value
    .split(/[,\s\n]+/)
    .map(s => s.trim().toUpperCase())
    .filter(s => s.length > 0 && s !== seatToRemove);
  
  seatNumbersInput.value = numbers.join(", ");
  handleMultiSeatInput();
};

// Handle seat mode change
const handleSeatModeChange = (value) => {
  if (value) {
    // Switching to multi-seat mode
    form.seat_number = "";
    if (seatNumbersInput.value) {
      handleMultiSeatInput();
    }
  } else {
    // Switching to single-seat mode
    form.seat_numbers = [];
    seatNumbersInput.value = "";
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    const payload = { 
      ...form,
      seat_number: isMultiSeat.value ? parsedSeatNumbers.value : form.seat_number
    };
    
    // Remove the seat_numbers field as backend expects seat_number
    delete payload.seat_numbers;

    await seatService.createSeat(payload);

    ElMessage.success(t("seats.createSuccess"));
    router.push("/admin/seats");
  } catch (error) {
    console.error("Create seat error:", error);
    ElMessage.error(error.response?.data?.message || t("seats.createError"));
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(form, {
    hall_id: "",
    row: "",
    seat_number: "",
    seat_numbers: [],
    seat_type: "regular",
    status: "active",
    price: 0,
    notes: "",
  });
  isMultiSeat.value = false;
  seatNumbersInput.value = "";
};

onMounted(async () => {
  await Promise.all([loadTheaters(), loadHalls()]);

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

.multi-seat-input {
  width: 100%;
}

.seat-preview {
  margin-top: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.seat-count {
  margin-top: 8px;
  font-size: 14px;
  color: #606266;
  text-align: right;
}
</style>
