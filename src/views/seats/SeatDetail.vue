<template>
  <div>
    <div class="page-header">
      <h2>{{ $t("seats.seatDetails") }}</h2>
      <div>
        <el-button @click="$router.back()">{{ $t("actions.back") }}</el-button>
        <el-button v-permission="'seats.edit'" type="primary" @click="goEdit">{{
            $t("actions.edit")
          }}
        </el-button>
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
          {{ Array.isArray(seat?.seat_number) ? seat.seat_number.join(', ') : seat?.seat_number }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('seats.hallName')">
          {{ seat?.hall?.hall_name || "-" }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('seats.theaterName')">
          {{ seat?.theater?.name || "-" }}
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

        <el-descriptions-item :label="$t('users.updated')">
          {{ formatDateTime(seat?.updated_at) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('seats.notes')" :span="2">
          {{ seat?.notes || "-" }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- Actions Section -->
    <el-card class="actions-section">
      <template #header>
        <span>{{ $t("seats.actions") }}</span>
      </template>
      <el-space wrap>
        <el-button v-permission="'seats.edit'" type="info" @click="showUpdateStatusDialog = true">
          {{ $t("seats.updateStatus") }}
        </el-button>
        <el-button v-permission="'seats.delete'" type="danger" @click="handleDelete">
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

    <!-- Edit Seat Dialog -->
    <el-dialog
        v-model="showEditDialog"
        :title="$t('seats.editSeat')"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="160px">
        <!-- Theater & Hall -->
        <el-form-item :label="$t('seats.theaterAndHall')" prop="hall_id">
          <el-select
              v-model="editForm.hall_id"
              clearable
              filterable
              placeholder=""
              :loading="loadingHalls || loadingTheaters"
              style="width: 100%"
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
              v-model="editForm.row"
              maxlength="5"
              show-word-limit
              @input="editForm.row = editForm.row.toUpperCase()"
          />
        </el-form-item>

        <!-- Multi Seat Numbers Range -->
        <el-form-item
            :label="$t('seats.seatNumberRange')"
            prop="seat_numbers"
        >
          <div class="multi-seat-range">
            <el-input
                v-model="seatNumberRange.start"
                :placeholder="t('seats.seatRangeStart')"
                style="width: 140px"
                @input="handleRangeInput"
                maxlength="2"
            />
            <span class="range-separator">-</span>
            <el-input
                v-model="seatNumberRange.end"
                :placeholder="t('seats.seatRangeEnd')"
                style="width: 140px"
                @input="handleRangeInput"
                maxlength="2"
            />
          </div>
          <div v-if="parsedSeatNumbers.length > 0" class="seat-preview">
            <el-tag
                v-for="num in parsedSeatNumbers"
                :key="num"
                style="margin: 2px"

            >
              {{ num }}
            </el-tag>
            <div class="seat-count">
              {{ t("seats.seatTotal", {count: parsedSeatNumbers.length}) }}
            </div>
          </div>
        </el-form-item>

        <!-- Seat Type -->
        <el-form-item :label="$t('seats.type')" prop="seat_type">
          <el-select v-model="editForm.seat_type" style="width: 100%">
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
          <el-select v-model="editForm.status" style="width: 100%">
            <el-option
                v-for="status in seatStatuses"
                :key="status.value"
                :label="$t(`seats.statuses.${status.value}`)"
                :value="status.value"
            />
          </el-select>
        </el-form-item>

        <!-- Notes -->
        <el-form-item :label="$t('seats.notes')" prop="notes">
          <el-input
              v-model="editForm.notes"
              type="textarea"
              :rows="3"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeEditDialog">{{ $t("actions.cancel") }}</el-button>
          <el-button type="primary" :loading="editLoading" @click="handleEditSubmit">
            {{ $t("actions.submit") }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useAppStore} from "@/stores/app";
import {useAuthStore} from "@/stores/auth";
import {useI18n} from "vue-i18n";
import {seatService} from "@/services/seatService";
import {hallService} from "@/services/hallService";
import {theaterService} from "@/services/theaterService";
import {ElMessage, ElMessageBox} from "element-plus";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const authStore = useAuthStore();
const {t} = useI18n();

const loading = ref(false);
const actionLoading = ref(false);
const seat = ref(null);
const showUpdateStatusDialog = ref(false);
const newStatus = ref("active");

// Edit dialog state
const showEditDialog = ref(false);
const editLoading = ref(false);
const editFormRef = ref();
const halls = ref([]);
const theaters = ref([]);
const loadingHalls = ref(false);
const loadingTheaters = ref(false);

const seatNumberRange = reactive({
  start: "",
  end: "",
});

const editForm = reactive({
  hall_id: "",
  row: "",
  seat_numbers: [],
  seat_type: "regular",
  status: "active",
  notes: "",
});

const seatTypes = ref([
  {value: "regular", label: "Regular"},
  {value: "vip", label: "VIP"},
  {value: "couple", label: "Couple"},
  {value: "queen", label: "Queen"},
]);

const seatStatuses = ref([
  {value: "active", label: "Active"},
  {value: "maintenance", label: "Maintenance"},
  {value: "out_of_order", label: "Out of Order"},
  {value: "closed", label: "Closed"},
]);

// Computed properties
const hallOptions = computed(() => {
  return halls.value.map((hall) => {
    const theater = theaters.value.find((t) => t.id === hall.theater_id);
    return {
      id: hall.id,
      label: `${theater?.name || "Unknown Theater"} - ${hall.hall_name}`,
    };
  });
});

const parsedSeatNumbers = computed(() => {
  const start = seatNumberRange.start.trim();
  const end = seatNumberRange.end.trim();

  if (!start || !end || !/^\d+$/.test(start) || !/^\d+$/.test(end)) {
    return [];
  }

  const startNum = parseInt(start, 10);
  const endNum = parseInt(end, 10);

  if (startNum > endNum) return [];

  const seats = [];
  for (let i = startNum; i <= endNum; i++) {
    seats.push(String(i));
  }
  return seats;
});

const editRules = computed(() => ({
  hall_id: [
    {required: true, message: t("validation.required"), trigger: "change"},
  ],
  row: [
    {required: true, message: t("validation.required"), trigger: "blur"},
    {
      min: 1,
      max: 5,
      message: "Row must be between 1 and 5 characters",
      trigger: "blur",
    },
    {
      pattern: /^[A-Z][A-Z0-9]*$/,
      message: "Row must start with a letter and contain only letters and numbers",
      trigger: "blur",
    },
  ],
  seat_numbers: [
    {
      validator: (rule, value, callback) => {
        const start = seatNumberRange.start.trim();
        const end = seatNumberRange.end.trim();

        if (!start || !end) {
          return callback(new Error(t("seats.validation.rangeRequired")));
        }

        if (!/^\d+$/.test(start) || !/^\d+$/.test(end)) {
          return callback(new Error(t("seats.validation.mustBeNumericRange")));
        }

        const startNum = parseInt(start, 10);
        const endNum = parseInt(end, 10);

        if (startNum > endNum) {
          return callback(new Error(t("seats.validation.startAfterEnd")));
        }

        if ((endNum - startNum + 1) > 50) {
          return callback(new Error(t("seats.validation.rangeTooLarge", {max: 50})));
        }

        callback();
      },
      trigger: "blur"
    },
  ],
  seat_type: [
    {required: true, message: t("validation.required"), trigger: "change"},
  ],
  status: [
    {required: true, message: t("validation.required"), trigger: "change"},
  ],
}));

const handleRangeInput = () => {
  editForm.seat_numbers = parsedSeatNumbers.value;
};

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

const loadHalls = async () => {
  loadingHalls.value = true;
  try {
    const response = await hallService.getHalls({per_page: 100});
    halls.value = response.data || [];
  } catch (error) {
    console.error("Load halls error:", error);
  } finally {
    loadingHalls.value = false;
  }
};

const loadTheaters = async () => {
  loadingTheaters.value = true;
  try {
    const response = await theaterService.getTheaters({per_page: 100});
    theaters.value = response.data || [];
  } catch (error) {
    console.error("Load theaters error:", error);
  } finally {
    loadingTheaters.value = false;
  }
};

const goEdit = () => {
  // Populate edit form with current seat data
  // Extract hall_id properly - handle both direct ID and nested object
  let hallId = '';
  if (seat.value.hall_id) {
    // If hall_id is an object, extract the id/string property
    hallId = typeof seat.value.hall_id === 'object'
        ? (seat.value.hall_id._id || seat.value.hall_id.id || '')
        : seat.value.hall_id;
  } else if (seat.value.hall) {
    hallId = seat.value.hall._id || seat.value.hall.id || '';
  }

  Object.assign(editForm, {
    hall_id: hallId,
    row: seat.value.row || '',
    seat_type: seat.value.seat_type || 'regular',
    status: seat.value.status || 'active',
    notes: seat.value.notes || '',
  });

  // Set seat number range
  if (Array.isArray(seat.value.seat_number) && seat.value.seat_number.length > 0) {
    const numbers = seat.value.seat_number.map(n => parseInt(n)).sort((a, b) => a - b);
    seatNumberRange.start = String(numbers[0]);
    seatNumberRange.end = String(numbers[numbers.length - 1]);
  } else if (seat.value.seat_number) {
    seatNumberRange.start = String(seat.value.seat_number);
    seatNumberRange.end = String(seat.value.seat_number);
  }

  handleRangeInput();
  showEditDialog.value = true;
};

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

const closeEditDialog = () => {
  showEditDialog.value = false;
  // Reset form
  if (editFormRef.value) {
    editFormRef.value.resetFields();
  }
  Object.assign(editForm, {
    hall_id: "",
    row: "",
    seat_numbers: [],
    seat_type: "regular",
    status: "active",
    notes: "",
  });
  seatNumberRange.start = "";
  seatNumberRange.end = "";
};

const handleEditSubmit = async () => {
  if (!editFormRef.value) return;

  try {
    await editFormRef.value.validate();
    editLoading.value = true;

    const payload = {
      ...editForm,
      range: {
        start: seatNumberRange.start,
        end: seatNumberRange.end,
      },
    };

    await seatService.updateSeat(route.params.id, payload);
    ElMessage.success(t("seats.updateSuccess"));

    closeEditDialog();
    await load(); // Reload seat data
  } catch (error) {
    console.error("Edit submit error:", error);
    ElMessage.error(error.response?.data?.message || t("seats.updateError"));
  } finally {
    editLoading.value = false;
  }
};

const formatDateTime = (str) => (str ? new Date(str).toLocaleString() : "-");

onMounted(async () => {
  await Promise.all([load(), loadHalls(), loadTheaters()]);
  appStore.setBreadcrumbs([
    {title: t("nav.dashboard"), path: "/admin/dashboard"},
    {title: t("seats.title"), path: "/admin/seats"},
    {title: t("seats.seatDetails"), path: "#"},
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

.multi-seat-range {
  display: flex;
  align-items: center;
  width: 100%;
}

.range-separator {
  margin: 0 10px;
}

.seat-preview {
  margin-top: 12px;
  padding: 12px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;

}

.seat-count {
  margin-top: 8px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-align: right;
}
</style>
