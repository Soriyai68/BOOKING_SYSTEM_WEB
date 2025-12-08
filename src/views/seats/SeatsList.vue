<template>
  <div class="seats-list">
    <!-- Page Header -->
    <div class="page-header">
      <h2>{{ $t("seats.title") }}</h2>
      <el-button
          type="primary"
          :icon="Plus"
          @click="openCreateDialog"
          v-permission="'seats.create'"
      >
        {{ $t("seats.addSeat") }}
      </el-button>
    </div>

    <!-- Filters -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filters" :inline="true" class="filter-form">
        <el-form-item>
          <el-input
              v-model="filters.search"
              :placeholder="$t('seats.searchSeats')"
              :prefix-icon="Search"
              clearable
              @keyup.enter="loadSeats"
              @clear="loadSeats"
          />
        </el-form-item>
        <el-form-item>
          <el-select
              v-model="filters.row"
              :placeholder="$t('seats.filterByRow')"
              clearable
              style="min-width: 200px"
              @change="loadSeats"
          >
            <el-option
                v-for="row in allRows"
                :key="row"
                :label="row"
                :value="row"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select
              v-model="filters.theater_id"
              :placeholder="$t('seats.filterByTheater')"
              clearable
              style="min-width: 200px"
              @change="handleTheaterChange"
          >
            <el-option
                v-for="theater in theaters"
                :key="theater.id"
                :label="theater.name"
                :value="theater.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
              v-model="filters.hall_id"
              :placeholder="$t('seats.filterByHall')"
              clearable
              style="min-width: 200px"
              :disabled="!filters.theater_id"
          >
            <el-option
                v-for="hall in filterHallBytheater.length
                ? filterHallBytheater
                : halls"
                :key="hall.id"
                :label="hall.hall_name"
                :value="hall.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
              v-model="filters.seat_type"
              :placeholder="$t('seats.filterByType')"
              clearable
              style="min-width: 200px"
          >
            <el-option
                v-for="type in seatTypes"
                :key="type.value"
                :label="$t(`seats.types.${type.value}`)"
                :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select
              v-model="filters.status"
              :placeholder="$t('seats.filterByStatus')"
              clearable
              style="min-width: 200px"
          >
            <el-option
                v-for="status in seatStatuses"
                :key="status.value"
                :label="$t(`seats.statuses.${status.value}`)"
                :value="status.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Seats Table -->
    <el-card shadow="never">
      <el-table
          :data="seats"
          ref="seatTable"
          v-loading="loading"
          style="width: 100%"
          :element-loading-text="$t('common.loading')"
          :empty-text="$t('messages.noData')"
          row-key="id"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"/>
        <el-table-column
            prop="seat_identifier"
            :label="$t('seats.indentifier')"
            width="220"
        />

        <el-table-column prop="row" :label="$t('seats.row')" width="180"/>
        <el-table-column
            prop="seat_number"
            :label="$t('seats.number')"
            width="220"
        >
          <template #default="{ row }">
            {{ Array.isArray(row.seat_number) ? row.seat_number.join(', ') : row.seat_number }}
          </template>
        </el-table-column>
        <el-table-column
            prop="hall_name"
            :label="$t('seats.hallName')"
            width="200"
        >
          <template #default="{ row }">
            {{ row.hall?.hall_name || "-" }}
          </template>
        </el-table-column>
        <el-table-column
            prop="theater.name"
            :label="$t('seats.theaterName')"
            width="300"
        >
          <template #default="{ row }">
            {{ row.theater?.name || "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="seat_type" :label="$t('seats.type')" width="120">
          <template #default="{ row }">
            <el-tag :type="getSeatTypeColor(row.seat_type)">
              {{ $t(`seats.types.${row.seat_type}`) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="price" :label="$t('seats.price')" width="120">
          <template #default="{ row }">
            {{ formatCurrency(row.price) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" :label="$t('seats.status')" width="200">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ $t(`seats.statuses.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
            :label="$t('common.actions')"
            width="220"
            fixed="right"
        >
          <template #default="{ row }">
            <div class="flex gap-1">
              <el-button
                  v-permission="'seats.view'"
                  size="small"
                  link
                  type="primary"
                  @click="viewSeat(row.id)"
              >
                {{ $t("actions.view") }}
              </el-button>
              <el-button
                  v-permission="'seats.edit'"
                  size="small"
                  link
                  type="primary"
                  @click="openEditDialog(row)"
              >
                {{ $t("actions.edit") }}
              </el-button>

              <el-button
                  v-permission="'seats.delete'"
                  size="small"
                  link
                  type="danger"
                  @click="deleteSeat(row.id)"
              >
                {{ $t("actions.delete") }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Bulk Actions -->
      <div
          class="bulk-actions flex items-center gap-1 mb-4 align-center"
          v-if="selectedSeats.length > 0"
      >
        <!-- Bulk Update Selected -->
        <el-button
            type="primary"
            @click="openBulkUpdateDialog"
            v-permission="'seats.edit'"
            class="flex items-center gap-1"
        >
          <span>{{ $t("actions.bulkUpdate") }} ({{ selectedSeats.length }})</span>
        </el-button>

        <!-- Duplicate Selected to Hall -->
        <el-button
            type="success"
            @click="openDuplicateDialog"
            v-permission="'seats.create'"
            class="flex items-center gap-1"
        >
          <span>{{ $t("seats.duplicateToHall") }} ({{ selectedSeats.length }})</span>
        </el-button>

        <!-- Delete Selected (Force Delete) -->
        <el-button
            type="danger"
            @click="forceDeleteSelectedSeats"
            v-permission="'showtimes.delete'"
            class="flex items-center gap-1"
        >
          <!-- <Trash2 size="16" /> -->
          <span
          >{{ $t("actions.deleteSelected") }} ({{
              selectedSeats.length
            }})</span
          >
        </el-button>

        <!-- Cancel Selection -->
        <el-button type="default" @click="cancelSelection">
          {{ $t("actions.cancel") }}
        </el-button>
      </div>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="pagination.current_page"
            v-model:page-size="pagination.per_page"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Create/Edit Dialog -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogMode === 'create' ? $t('seats.addSeat') : $t('seats.editSeat')"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="160px">
        <!-- Theater & Hall -->
        <el-form-item :label="$t('seats.theaterAndHall')" prop="hall_id">
          <el-select
              v-model="dialogForm.hall_id"
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
              v-model="dialogForm.row"
              maxlength="5"
              show-word-limit
              @input="dialogForm.row = dialogForm.row.toUpperCase()"
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
                v-for="seat in parsedSeatNumbers"
                :key="seat"
                style="margin: 2px"
            >
              {{ seat }}
            </el-tag>
            <div class="seat-count">
              {{ t("seats.seatTotal", {count: parsedSeatNumbers.length}) }}
            </div>
          </div>
        </el-form-item>

        <!-- Seat Type -->
        <el-form-item :label="$t('seats.type')" prop="seat_type">
          <el-select v-model="dialogForm.seat_type" style="width: 100%">
            <el-option
                v-for="type in seatTypes"
                :key="type.value"
                :label="$t(`seats.types.${type.value}`)"
                :value="type.value"
            />
          </el-select>
        </el-form-item>

        <!-- Price -->
        <el-form-item :label="$t('seats.price')" prop="price">
          <el-input-number
              v-model="dialogForm.price"
              :min="0"
              :precision="2"
              :step="0.5"
              controls-position="right"
              style="width: 100%"
          />
        </el-form-item>

        <!-- Status -->
        <el-form-item :label="$t('seats.status')" prop="status">
          <el-select v-model="dialogForm.status" style="width: 100%">
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
              v-model="dialogForm.notes"
              type="textarea"
              :rows="3"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">{{ $t("actions.cancel") }}</el-button>
          <el-button type="primary" :loading="dialogLoading" @click="handleDialogSubmit">
            {{ $t("actions.submit") }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Bulk Update Dialog -->
    <el-dialog
        v-model="bulkUpdateDialogVisible"
        :title="$t('seats.bulkUpdate')"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-alert
          type="info"
          :closable="false"
          style="margin-bottom: 16px"
      >
        {{ $t('seats.bulkUpdateInfo', { count: selectedSeats.length }) }}
      </el-alert>

      <el-form ref="bulkUpdateFormRef" :model="bulkUpdateForm" label-width="120px">
        <!-- Seat Type -->
        <el-form-item :label="$t('seats.type')">
          <el-select v-model="bulkUpdateForm.seat_type" clearable style="width: 100%" :placeholder="$t('seats.keepCurrent')">
            <el-option
                v-for="type in seatTypes"
                :key="type.value"
                :label="$t(`seats.types.${type.value}`)"
                :value="type.value"
            />
          </el-select>
        </el-form-item>

        <!-- Price -->
        <el-form-item :label="$t('seats.price')">
          <el-input-number
              v-model="bulkUpdateForm.price"
              :min="0"
              :precision="2"
              :step="0.5"
              controls-position="right"
              style="width: 100%"
              :placeholder="$t('seats.keepCurrent')"
          />
        </el-form-item>

        <!-- Status -->
        <el-form-item :label="$t('seats.status')">
          <el-select v-model="bulkUpdateForm.status" clearable style="width: 100%" :placeholder="$t('seats.keepCurrent')">
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
        <span class="dialog-footer">
          <el-button @click="closeBulkUpdateDialog">{{ $t("actions.cancel") }}</el-button>
          <el-button type="primary" :loading="bulkUpdateLoading" @click="handleBulkUpdate">
            {{ $t("actions.update") }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Duplicate Seats Dialog -->
    <el-dialog
        v-model="duplicateDialogVisible"
        :title="$t('seats.duplicateToHall')"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-alert
          type="info"
          :closable="false"
          style="margin-bottom: 16px"
      >
        {{ $t('seats.duplicateSelectedInfo', { count: selectedSeats.length }) }}
      </el-alert>

      <!-- Selected Seats Preview -->
      <div class="selected-seats-preview" v-if="selectedSeats.length > 0">
        <div class="preview-label">{{ $t('seats.selectedSeats') }} ({{ selectedSeats.length }}):</div>
        <div class="seats-tags">
          <el-tag
              v-for="seat in sortedSelectedSeats"
              :key="seat.id"
              type="info"
              style="margin: 2px"
          >
            {{ seat.row }}{{ Array.isArray(seat.seat_number) ? seat.seat_number.join(',') : seat.seat_number }}
          </el-tag>
        </div>
        <div class="source-hall-info" v-if="selectedSeatsSourceHall">
          {{ $t('seats.fromHall') }}: <strong>{{ selectedSeatsSourceHall }}</strong>
        </div>
      </div>

      <el-divider />

      <el-form ref="duplicateFormRef" :model="duplicateForm" :rules="duplicateRules" label-width="140px">
        <!-- Target Hall -->
        <el-form-item :label="$t('seats.targetHall')" prop="target_hall_id">
          <el-select
              v-model="duplicateForm.target_hall_id"
              filterable
              style="width: 100%"
              :placeholder="$t('seats.selectTargetHall')"
              :loading="loadingHalls"
          >
            <el-option
                v-for="option in duplicateHallOptions"
                :key="option.id"
                :label="option.label"
                :value="option.id"
            />
          </el-select>
        </el-form-item>

        <el-divider>{{ $t('seats.optionalOverrides') }}</el-divider>

        <!-- Override Seat Type -->
        <el-form-item :label="$t('seats.type')">
          <el-select v-model="duplicateForm.seat_type" clearable style="width: 100%" :placeholder="$t('seats.keepOriginal')">
            <el-option
                v-for="type in seatTypes"
                :key="type.value"
                :label="$t(`seats.types.${type.value}`)"
                :value="type.value"
            />
          </el-select>
        </el-form-item>

        <!-- Override Price -->
        <el-form-item :label="$t('seats.price')">
          <el-input-number
              v-model="duplicateForm.price"
              :min="0"
              :precision="2"
              :step="0.5"
              controls-position="right"
              style="width: 100%"
              :placeholder="$t('seats.keepOriginal')"
          />
        </el-form-item>

        <!-- Override Status -->
        <el-form-item :label="$t('seats.status')">
          <el-select v-model="duplicateForm.status" clearable style="width: 100%" :placeholder="$t('seats.keepOriginal')">
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
        <span class="dialog-footer">
          <el-button @click="closeDuplicateDialog">{{ $t("actions.cancel") }}</el-button>
          <el-button type="primary" :loading="duplicateLoading" @click="handleDuplicate">
            {{ $t("seats.duplicate") }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {ElMessage, ElMessageBox} from "element-plus";
import {Plus, Search} from "@element-plus/icons-vue";
import {seatService} from "@/services/seatService";
import {hallService} from "@/services/hallService";
import {theaterService} from "@/services/theaterService";
import {useAuthStore} from "@/stores/auth";
import {useAppStore} from "@/stores/app";

const {t} = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const appStore = useAppStore();

// Reactive data
const loading = ref(false);
const seats = ref([]);
const halls = ref([]);
const theaters = ref([]);
const allRows = ref([]);
const filterHallBytheater = ref([]);
const selectedSeats = ref([]);
const seatTable = ref([null]);
const loadingHalls = ref(false);
const loadingTheaters = ref(false);

// Dialog state
const dialogVisible = ref(false);
const dialogMode = ref('create'); // 'create' or 'edit'
const dialogLoading = ref(false);
const dialogFormRef = ref();
const editingSeatId = ref(null);

const seatNumberRange = reactive({
  start: "",
  end: "",
});

const dialogForm = reactive({
  hall_id: "",
  row: "",
  seat_numbers: [],
  seat_type: "regular",
  price: 0,
  status: "active",
  notes: "",
});

// Bulk update state
const bulkUpdateDialogVisible = ref(false);
const bulkUpdateLoading = ref(false);
const bulkUpdateFormRef = ref();
const bulkUpdateForm = reactive({
  seat_type: null,
  price: null,
  status: null,
});

// Duplicate seats state
const duplicateDialogVisible = ref(false);
const duplicateLoading = ref(false);
const duplicateFormRef = ref();
const duplicateForm = reactive({
  target_hall_id: null,
  seat_type: null,
  price: null,
  status: null,
});
const handleSelectionChange = (val) => {
  selectedSeats.value = val;
};
const cancelSelection = () => {
  selectedSeats.value = [];
  if (selectedSeats.value) {
    seatTable.value.clearSelection();
  }
};

// Computed properties for dialog
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

const dialogRules = computed(() => ({
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
  price: [
    {required: true, message: t("validation.required"), trigger: "blur"},
    {
      type: 'number',
      message: 'Price must be a number',
      trigger: ['blur', 'change'],
    },
    {
      validator: (rule, value, callback) => {
        if (value < 0) {
          callback(new Error('Price cannot be negative'));
        } else {
          callback();
        }
      },
      trigger: ['blur', 'change'],
    },
  ],
  status: [
    {required: true, message: t("validation.required"), trigger: "change"},
  ],
}));

const duplicateRules = computed(() => ({
  target_hall_id: [
    {required: true, message: t("validation.required"), trigger: "change"},
  ],
}));

// Get source hall ID from selected seats
const selectedSeatsSourceHallId = computed(() => {
  if (selectedSeats.value.length === 0) return null;
  return selectedSeats.value[0].hall?.id || null;
});

// Get source hall name from selected seats
const selectedSeatsSourceHall = computed(() => {
  if (selectedSeats.value.length === 0) return null;
  const firstSeat = selectedSeats.value[0];
  if (firstSeat.hall?.hall_name && firstSeat.theater?.name) {
    return `${firstSeat.theater.name} - ${firstSeat.hall.hall_name}`;
  }
  return firstSeat.hall?.hall_name || null;
});

// Hall options for duplicate - exclude source hall
const duplicateHallOptions = computed(() => {
  return hallOptions.value.filter(opt => opt.id !== selectedSeatsSourceHallId.value);
});

// Get sorted selected seats for display
const sortedSelectedSeats = computed(() => {
  if (selectedSeats.value.length === 0) return [];
  return [...selectedSeats.value].sort((a, b) => {
    // Sort by row first
    if (a.row !== b.row) {
      return a.row.localeCompare(b.row);
    }
    // Then by seat number
    const aNum = Array.isArray(a.seat_number) ? a.seat_number[0] : a.seat_number;
    const bNum = Array.isArray(b.seat_number) ? b.seat_number[0] : b.seat_number;
    return aNum - bNum;
  });
});

const handleRangeInput = () => {
  dialogForm.seat_numbers = parsedSeatNumbers.value;
};
const filters = reactive({
  search: "",
  seat_type: "",
  status: "",
  is_available: "",
  sort_by: "row",
  sort_order: "asc",
  row: "",
  hall_id: "",
  theater_id: "",
});

const pagination = reactive({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
  has_next_page: false,
  has_prev_page: false,
});

// Seat types and statuses
const seatTypes = ref([
  {value: "regular", label: "Regular"},
  {value: "vip", label: "VIP"},
  {value: "queen", label: "Queen"},
  {value: "couple", label: "Couple"},
]);

const seatStatuses = ref([
  {value: "active", label: "Active"},
  {value: "maintenance", label: "Maintenance"},
  {value: "out_of_order", label: "Out of Order"},
]);

// Methods
const loadSeats = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current_page,
      per_page: pagination.per_page,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
      search: filters.search || undefined,
      seat_type: filters.seat_type || undefined,
      status: filters.status || undefined,
      row: filters.row || undefined,
      hall_id: filters.hall_id || undefined,
    };

    const response = await seatService.getSeats(params);
    // Sort seats by row then by seat_number
    const sortedData = (response.data || []).sort((a, b) => {
      // Sort by row first
      if (a.row !== b.row) {
        return a.row.localeCompare(b.row);
      }
      // Then by seat_number
      const aNum = Array.isArray(a.seat_number) ? a.seat_number[0] : a.seat_number;
      const bNum = Array.isArray(b.seat_number) ? b.seat_number[0] : b.seat_number;
      return aNum - bNum;
    });
    seats.value = sortedData;
    Object.assign(pagination, {
      current_page: response.current_page || 1,
      per_page: response.per_page || 10,
      total: response.total || 0,
      total_pages: response.total_pages || 0,
      has_next_page: response.has_next_page || false,
      has_prev_page: response.has_prev_page || false,
    });
  } catch (error) {
    console.error("Load seats error:", error);
    ElMessage.error(error.response?.data?.message || "Failed to load seats");
  } finally {
    loading.value = false;
  }
};

const loadAllRows = async () => {
  try {
    const response = await seatService.getSeats({per_page: 100, page: 1});
    if (response.data) {
      const uniqueRows = [...new Set(response.data.map(seat => seat.row))];
      allRows.value = uniqueRows.sort();
    }
  } catch (error) {
    console.error("Error loading all rows for filter:", error);
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

// Dialog methods
const openCreateDialog = () => {
  dialogMode.value = 'create';
  resetDialogForm();
  dialogVisible.value = true;
};

const openEditDialog = (seat) => {
  dialogMode.value = 'edit';
  editingSeatId.value = seat.id;

  // Populate form with seat data
  Object.assign(dialogForm, {
    hall_id: seat.hall_id || seat.hall?.id || '',
    row: seat.row || '',
    seat_type: seat.seat_type || 'regular',
    status: seat.status || 'active',
    notes: seat.notes || '',
    price: seat.price || 0,
  });

  // For edit, show current seat numbers as range if possible
  if (Array.isArray(seat.seat_number) && seat.seat_number.length > 0) {
    const numbers = seat.seat_number.map(n => parseInt(n)).sort((a, b) => a - b);
    seatNumberRange.start = String(numbers[0]);
    seatNumberRange.end = String(numbers[numbers.length - 1]);
  } else if (seat.seat_number) {
    seatNumberRange.start = String(seat.seat_number);
    seatNumberRange.end = String(seat.seat_number);
  }

  handleRangeInput();
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  resetDialogForm();
  editingSeatId.value = null;
};

const resetDialogForm = () => {
  if (dialogFormRef.value) {
    dialogFormRef.value.resetFields();
  }
  Object.assign(dialogForm, {
    hall_id: "",
    row: "",
    seat_numbers: [],
    seat_type: "regular",
    price: 0,
    status: "active",
    notes: "",
  });
  seatNumberRange.start = "";
  seatNumberRange.end = "";
};

const handleDialogSubmit = async () => {
  if (!dialogFormRef.value) return;

  try {
    await dialogFormRef.value.validate();
    dialogLoading.value = true;

    const payload = {
      ...dialogForm,
      range: {
        start: seatNumberRange.start,
        end: seatNumberRange.end,
      },
    };

    if (dialogMode.value === 'create') {
      await seatService.bulkCreateSeats(payload);
      ElMessage.success(t("seats.createSuccess"));
    } else {
      // For edit, use update endpoint
      await seatService.updateSeat(editingSeatId.value, payload);
      ElMessage.success(t("seats.updateSuccess"));
    }

    closeDialog();
    loadSeats();
  } catch (error) {
    console.error("Dialog submit error:", error);
    ElMessage.error(error.response?.data?.message || t("seats.saveError"));
  } finally {
    dialogLoading.value = false;
  }
};

// Bulk update methods
const openBulkUpdateDialog = () => {
  resetBulkUpdateForm();
  bulkUpdateDialogVisible.value = true;
};

const closeBulkUpdateDialog = () => {
  bulkUpdateDialogVisible.value = false;
  resetBulkUpdateForm();
};

const resetBulkUpdateForm = () => {
  Object.assign(bulkUpdateForm, {
    seat_type: null,
    price: null,
    status: null,
  });
};

const handleBulkUpdate = async () => {
  if (selectedSeats.value.length === 0) {
    ElMessage.warning(t("seats.noSeatsSelected"));
    return;
  }

  // Build update data only with non-null values
  const updateData = {};
  if (bulkUpdateForm.seat_type) updateData.seat_type = bulkUpdateForm.seat_type;
  if (bulkUpdateForm.price !== null && bulkUpdateForm.price !== undefined) updateData.price = bulkUpdateForm.price;
  if (bulkUpdateForm.status) updateData.status = bulkUpdateForm.status;

  if (Object.keys(updateData).length === 0) {
    ElMessage.warning(t("seats.noChangesSelected"));
    return;
  }

  try {
    bulkUpdateLoading.value = true;

    // Build seatUpdates array with id and update fields
    const seatUpdates = selectedSeats.value.map(seat => ({
      id: seat.id,
      ...updateData,
    }));

    await seatService.bulkUpdateSeats(seatUpdates);
    ElMessage.success(t("seats.bulkUpdateSuccess", { count: selectedSeats.value.length }));
    closeBulkUpdateDialog();
    cancelSelection();
    loadSeats();
  } catch (error) {
    console.error("Bulk update error:", error);
    ElMessage.error(error.response?.data?.message || t("seats.bulkUpdateError"));
  } finally {
    bulkUpdateLoading.value = false;
  }
};

// Duplicate seats methods
const openDuplicateDialog = () => {
  resetDuplicateForm();
  duplicateDialogVisible.value = true;
};

const closeDuplicateDialog = () => {
  duplicateDialogVisible.value = false;
  resetDuplicateForm();
};

const resetDuplicateForm = () => {
  Object.assign(duplicateForm, {
    target_hall_id: null,
    seat_type: null,
    price: null,
    status: null,
  });
  if (duplicateFormRef.value) {
    duplicateFormRef.value.resetFields();
  }
};

const handleDuplicate = async () => {
  if (!duplicateFormRef.value) return;
  
  if (selectedSeats.value.length === 0) {
    ElMessage.warning(t("seats.noSeatsSelected"));
    return;
  }

  try {
    await duplicateFormRef.value.validate();
    duplicateLoading.value = true;

    // Build payload with seat_ids from selected seats
    const payload = {
      seat_ids: selectedSeats.value.map(seat => seat.id),
      target_hall_id: duplicateForm.target_hall_id,
    };
    if (duplicateForm.seat_type) payload.seat_type = duplicateForm.seat_type;
    if (duplicateForm.price !== null && duplicateForm.price !== undefined) payload.price = duplicateForm.price;
    if (duplicateForm.status) payload.status = duplicateForm.status;

    const response = await seatService.bulkDuplicateSeats(payload);
    
    const message = t("seats.duplicateSuccess", { 
      count: response.data?.createdCount || 0 
    });
    ElMessage.success(message);
    
    if (response.data?.skippedCount > 0) {
      ElMessage.warning(t("seats.duplicateSkipped", { 
        count: response.data.skippedCount 
      }));
    }
    
    closeDuplicateDialog();
    cancelSelection();
    loadSeats();
  } catch (error) {
    console.error("Duplicate seats error:", error);
    ElMessage.error(error.response?.data?.message || t("seats.duplicateError"));
  } finally {
    duplicateLoading.value = false;
  }
};

const handleTheaterChange = () => {
  filters.hall_id = "";
  filterHallBytheater.value = halls.value.filter(
      (hall) => hall.theater_id === filters.theater_id
  );
};

const handleSizeChange = (val) => {
  pagination.per_page = val;
  pagination.current_page = 1;
  loadSeats();
};

const handleCurrentChange = (val) => {
  pagination.current_page = val;
  loadSeats();
};

const viewSeat = (id) => {
  router.push(`/admin/seats/${id}`);
};

const deleteSeat = async (id) => {
  try {
    await ElMessageBox.confirm(t("seats.confirmDelete"), t("actions.delete"), {
      confirmButtonText: t("actions.delete"),
      cancelButtonText: t("actions.cancel"),
      type: "warning",
    });

    await seatService.deleteSeat(id);
    ElMessage.success(t("seats.deleteSuccess"));
    loadSeats();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Delete seat error:", error);
      ElMessage.error(error.response?.data?.message || "Failed to delete seat");
    }
  }
};
const forceDeleteSelectedSeats = async () => {
  try {
    await ElMessageBox.confirm(
        t("seats.forceDeleteSelectedConfirm", {
          count: selectedSeats.value.length,
        }),
        t("seats.forceDeleteTitle"),
        {
          confirmButtonText: t("actions.forceDelete"),
          cancelButtonText: t("actions.cancel"),
          type: "error",
          dangerouslyUseHTMLString: true,
        }
    );
    const ids = selectedSeats.value.map((seat) => seat.id);
    await seatService.bulkForceDeleteSeats(ids);
    ElMessage.success(t("seats.forceDeleteSuccess"));
    loadSeats();
    cancelSelection();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to force delete selected seats:", error);
      console.error("Error response:", error.response?.data);
      const errorMsg =
          error.response?.data?.message || t("seats.forceDeleteFailed");
      const errors = error.response?.data?.errors;
      if (errors && errors.length > 0) {
        errors.forEach((err) => {
          console.error(`Validation error - ${err.field}: ${err.message}`);
        });
      }
      ElMessage.error(errorMsg);
    }
  }
};
const getSeatTypeColor = (type) => {
  const colors = {
    regular: "",
    vip: "warning",
    king: "danger",
    queen: "success",
    recliner: "info",
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

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

// Watchers (autoload when filters change)
watch(
    [
      () => filters.search,
      () => filters.seat_type,
      () => filters.status,
      () => filters.row,
      () => filters.hall_id,
    ],
    () => {
      pagination.current_page = 1;
      loadSeats();
    }
);

// Lifecycle
onMounted(async () => {
  await Promise.all([loadSeats(), loadHalls(), loadTheaters(), loadAllRows()]);

  appStore.setBreadcrumbs([
    {title: t("nav.dashboard"), path: "/admin/dashboard"},
    {title: t("seats.title"), path: "/admin/seats"},
    {title: t("seats.allSeats"), path: "/admin/seats"},
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

.filter-card {
  margin-bottom: 10px;
}

.filter-form {
  display: flex;
  gap: 8px;
  /* flex-wrap: wrap; */
  margin-bottom: 0;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.text-muted {
  color: #909399;
}

.flex {
  display: flex;
}

.gap-1 {
  gap: 8px;
}

.bulk-actions {
  margin: 16px 0;
  padding: 12px;
  border-radius: 4px;
  background-color: var(--el-fill-color-lighter);
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

.selected-seats-preview {
  padding: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  margin-bottom: 8px;
}

.selected-seats-preview .preview-label {
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.selected-seats-preview .seats-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-height: 120px;
  overflow-y: auto;
}

.selected-seats-preview .source-hall-info {
  margin-top: 10px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
