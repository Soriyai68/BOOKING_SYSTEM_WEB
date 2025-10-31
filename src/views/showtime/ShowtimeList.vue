<template>
  <div class="showtime-list">
    <div class="page-header">
      <h2>{{ $t("showtimes.title") }}</h2>
      <div>
        <el-button
            v-permission="'showtimes.create'"
            type="primary"
            @click="$router.push('/admin/showtimes/create')"
        >
          <el-icon>
            <Plus/>
          </el-icon>
          {{ $t("showtimes.addShowtime") }}
        </el-button>
      </div>
    </div>

    <el-card>
      <!-- Filters Toolbar -->
      <div class="toolbar">
        <!-- Search -->
        <el-input
            v-model="filters.search"
            :placeholder="$t('showtimes.searchShowtimes')"
            class="search-input"
            :prefix-icon="Search"
            clearable
            @input="debouncedSearch"
        />

        <!-- Status -->
        <el-select
            v-model="filters.status"
            :placeholder="$t('showtimes.filterByStatus')"
            clearable
            style="width: 200px"
        >
          <el-option
              v-for="status in showtimeService.STATUS_OPTIONS"
              :key="status.value"
              :label="$t(`showtimes.statuses.${status.value}`)"
              :value="status.value"
          />
        </el-select>

        <!-- Theater -->
        <el-select
            v-model="filters.theater_id"
            :placeholder="$t('showtimes.filterByTheater')"
            clearable
            style="width: 200px"
            filterable
            @change="handleTheaterFilterChange"
        >
          <el-option
              v-for="theater in theaters"
              :key="theater.id"
              :label="theater.name"
              :value="theater.id"
          />
        </el-select>

        <!-- Hall -->
        <el-select
            v-model="filters.hall_id"
            :placeholder="$t('showtimes.filterByHall')"
            :disabled="!filters.theater_id"
            clearable
            filterable
            style="width: 200px"
        >
          <el-option
              v-for="hall in filteredHalls"
              :key="hall.id"
              :label="hall.hall_name"
              :value="hall.id"
          />
        </el-select>

        <!-- Show Date -->
        <el-date-picker
            v-model="filters.show_date"
            type="date"
            :placeholder="$t('showtimes.showDate')"
            clearable
            style="width: 200px"
            value-format="YYYY-MM-DD"
        />
      </div>

      <!-- Showtime Table -->
      <el-table
          :data="showtimes"
          ref="showtimeTable"
          v-loading="loading"
          style="width: 100%"
          :empty-text="$t('messages.noData')"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"/>
        <el-table-column :label="$t('showtimes.movie')" width="250">
          <template #default="{ row }">
            <div style="display: flex; align-items: center">
              <el-image
                  :src="row.movie_poster"
                  fit="cover"
                  style="
                  width: 50px;
                  height: 75px;
                  border-radius: 4px;
                  margin-right: 10px;
                "
              />
              <span>{{ row.movie_title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('showtimes.theater')" prop="theater_name"/>
        <el-table-column
            :label="$t('showtimes.hall')"
            prop="hall_name"
            width="120"
        />
        <el-table-column
            :label="$t('showtimes.showDate')"
            prop="show_date"
            width="180"
        />
        <el-table-column :label="$t('showtimes.startTime')" width="180">
          <template #default="{ row }">{{ row.start_time }}</template>
        </el-table-column>
        <el-table-column :label="$t('showtimes.endTime')" width="180">
          <template #default="{ row }">{{ row.end_time }}</template>
        </el-table-column>
        <el-table-column :label="$t('showtimes.status')" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ $t(`showtimes.statuses.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('showtimes.actions')" width="200">
          <template #default="{ row }">
            <el-button
                v-permission="'showtimes.view'"
                type="primary"
                size="small"
                link
                @click="viewShowtime(row.id)"
            >
              {{ $t("showtimes.view") }}
            </el-button>
            <el-button
                v-permission="'showtimes.edit'"
                type="primary"
                size="small"
                link
                @click="editShowtime(row.id)"
            >
              {{ $t("showtimes.edit") }}
            </el-button>
            <el-button
                v-permission="'showtimes.delete'"
                type="danger"
                size="small"
                link
                @click="deleteShowtime(row.id)"
            >
              {{ $t("showtimes.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Bulk Actions -->
      <div
          class="bulk-actions flex items-center gap-1 mb-4 align-center"
          v-if="selectedShowtimes.length > 0"
      >
        <!-- Delete Selected (Force Delete) -->
        <el-button
            type="danger"
            @click="forceDeleteSelectedShowtimes"
            v-permission="'showtimes.delete'"
            class="flex items-center gap-1"
        >
          <!-- <Trash2 size="16" /> -->
          <span
          >{{ $t("actions.deleteSelected") }} ({{
              selectedShowtimes.length
            }})</span
          >
        </el-button>

        <!-- Duplicate Selected -->
        <el-button
            type="primary"
            @click="duplicateSelectedShowtimes"
            v-permission="'showtimes.create'"
            class="flex items-center gap-1"
        >
          <!-- <Copy size="16" /> -->
          <span
          >{{ $t("actions.duplicateSelected") }} ({{
              selectedShowtimes.length
            }})</span
          >
        </el-button>

        <!-- Cancel Selection -->
        <el-button type="default" @click="cancelSelection">
          {{ $t("actions.cancel") }}
        </el-button>
      </div>

      <!-- Pagination -->
      <div class="pagination">
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
  </div>
</template>

<script setup>
import {onMounted, reactive, ref, watch} from "vue";
import {useRouter} from "vue-router";
import {useAppStore} from "@/stores/app";
import {showtimeService} from "@/services/showtimeService";
import {theaterService} from "@/services/theaterService";
import {hallService} from "@/services/hallService";
import {ElMessage, ElMessageBox} from "element-plus";
import {Plus, Search} from "@element-plus/icons-vue";
import {useI18n} from "vue-i18n";
import {debounce} from "lodash-es";

const router = useRouter();
const appStore = useAppStore();
const {t} = useI18n();

const loading = ref(false);
const showtimes = ref([]);
const theaters = ref([]);
const showtimeTable = ref(null);
const halls = ref([]);
const filteredHalls = ref([]);
const selectedShowtimes = ref([]);

const handleSelectionChange = (val) => {
  selectedShowtimes.value = val;
};

// Filters
const filters = reactive({
  search: "",
  status: "",
  theater_id: "",
  hall_id: "",
  // show_date: new Date().toISOString().split("T")[0], // Default to today
  show_date: "",
  sort_by: "start_time",
  sort_order: "asc",
});

// Pagination
const pagination = reactive({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
  has_next_page: false,
  has_prev_page: false,
});

// Debounced search
const debouncedSearch = debounce(() => {
  pagination.current_page = 1;
  loadShowtimes();
}, 500);

// Watchers for filters
watch(
    [
      () => filters.show_date,
      () => filters.search,
      () => filters.status,
      () => filters.theater_id,
      () => filters.hall_id,
    ],
    () => {
      pagination.current_page = 1;
      loadShowtimes();
    }
);

// API Calls
const loadShowtimes = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current_page,
      per_page: pagination.per_page,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
      search: filters.search || undefined,
      status: filters.status || undefined,
      theater_id: filters.theater_id || undefined,
      hall_id: filters.hall_id || undefined,
      show_date: filters.show_date || undefined,
    };
    const response = await showtimeService.getShowtimes(params);
    if (response.data) {
      showtimes.value = response.data;
      pagination.total = response.total;
      pagination.current_page = response.current_page;
      pagination.per_page = response.per_page;
      pagination.total_pages = response.total_pages;
    }
  } catch (error) {
    console.error("Failed to load showtimes:", error);
    ElMessage.error(t("showtimes.loadFailed"));
  } finally {
    loading.value = false;
  }
};

const loadTheaters = async () => {
  try {
    const response = await theaterService.getTheaters({per_page: 100});
    if (response && response.data) {
      theaters.value = response.data;
    }
  } catch (error) {
    console.error("Load theaters error:", error);
  }
};

const loadHalls = async () => {
  try {
    const response = await hallService.getHalls({per_page: 100});
    if (response && response.data) {
      halls.value = response.data;
    }
  } catch (error) {
    console.error("Load halls error:", error);
  }
};

// Handle theater filter change
const handleTheaterFilterChange = () => {
  filters.hall_id = "";
  filteredHalls.value = filters.theater_id
      ? halls.value.filter((hall) => hall.theater_id === filters.theater_id)
      : [];
};

// Pagination handlers
const handleSizeChange = (newSize) => {
  pagination.per_page = newSize;
  pagination.current_page = 1;
  loadShowtimes();
};

const handleCurrentChange = (newPage) => {
  pagination.current_page = newPage;
  loadShowtimes();
};

// Actions
const viewShowtime = (id) => router.push(`/admin/showtimes/${id}`);
const editShowtime = (id) => router.push(`/admin/showtimes/${id}/edit`);

const deleteShowtime = async (id) => {
  try {
    await ElMessageBox.confirm(
        t("showtimes.deleteConfirm"),
        t("showtimes.deleteTitle"),
        {
          confirmButtonText: t("actions.delete"),
          cancelButtonText: t("actions.cancel"),
          type: "warning",
        }
    );
    await showtimeService.deleteShowtime(id);
    ElMessage.success(t("showtimes.deleteSuccess"));
    loadShowtimes();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to delete showtime:", error);
      ElMessage.error(t("showtimes.deleteFailed"));
    }
  }
};

const forceDeleteSelectedShowtimes = async () => {
  try {
    await ElMessageBox.confirm(
        t("showtimes.forceDeleteSelectedConfirm", {
          count: selectedShowtimes.value.length,
        }),
        t("showtimes.forceDeleteTitle"),
        {
          confirmButtonText: t("actions.forceDelete"),
          cancelButtonText: t("actions.cancel"),
          type: "error",
          dangerouslyUseHTMLString: true,
        }
    );
    const ids = selectedShowtimes.value.map((s) => s.id);
    console.log("Force delete showtime IDs:", ids);
    console.log("Number of IDs:", ids.length);
    console.log(
        "ID types:",
        ids.map((id) => typeof id)
    );
    await showtimeService.forceDeleteBulkShowtimes(ids);
    ElMessage.success(t("showtimes.forceDeleteSuccess"));
    loadShowtimes();
    cancelSelection();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to force delete selected showtimes:", error);
      console.error("Error response:", error.response?.data);
      const errorMsg =
          error.response?.data?.message || t("showtimes.forceDeleteFailed");
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
const cancelSelection = () => {
  selectedShowtimes.value = [];
  if (selectedShowtimes.value) {
    showtimeTable.value.clearSelection();
  }
};
const duplicateSelectedShowtimes = () => {
  const ids = selectedShowtimes.value.map((s) => s.id);
  router.push({
    name: "DuplicateShowtime",
    params: {ids: ids.join(",")},
  });
};
// Helpers
const getStatusTagType = (status) => {
  switch (status) {
    case "scheduled":
      return "primary";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "info";
  }
};

// Init
onMounted(async () => {
  await Promise.all([loadTheaters(), loadHalls()]);

  if (filters.theater_id) handleTheaterFilterChange();

  appStore.setBreadcrumbs([
    {title: t("nav.dashboard"), path: "/admin/dashboard"},
    {title: t("showtimes.title"), path: "/admin/showtimes"},
  ]);

  await loadShowtimes();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.bulk-actions {
  margin: 16px 0;
  padding: 12px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
}
</style>
