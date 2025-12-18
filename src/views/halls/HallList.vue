<template>
  <div class="hall-list">
    <div class="page-header">
      <h2>{{ $t("halls.title") }}</h2>
      <el-button v-permission="'halls.create'" type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        {{ $t("halls.addHall") }}
      </el-button>
    </div>

    <el-card class="filter-card" shadow="never">
      <div class="toolbar">
        <el-input
          v-model="searchText"
          :placeholder="$t('halls.searchHalls')"
          class="search-input"
          :prefix-icon="Search"
          clearable
          @input="debouncedSearch"
          style="min-width: 200px"
        />
        <el-select
          v-model="typeFilter"
          :placeholder="$t('halls.filterByType')"
          clearable
        >
          <el-option :label="$t('table.selectAll')" value="" />
          <el-option
            v-for="opt in hallService.SCREEN_TYPES"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-select
          v-model="statusFilter"
          :placeholder="$t('halls.filterByStatus')"
          clearable
          style="min-width: 200px"

        >
          <el-option :label="$t('table.selectAll')" value="" />
          <el-option
            v-for="opt in hallService.HALL_STATUSES"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-select
          v-model="theaterFilter"
          :placeholder="$t('halls.filterByTheater')"
          clearable
          filterable
        >
          <el-option
            v-for="theater in theaters"
            :key="theater.id"
            :label="theater.name"
            :value="theater.id"
          />
        </el-select>

        <el-select v-model="sortBy" :placeholder="$t('table.sortBy')">
          <el-option
            v-for="opt in hallService.SORT_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-select v-model="sortOrder" :placeholder="$t('halls.sortOrder')">
          <el-option label="ASC" value="asc" />
          <el-option label="DESC" value="desc" />
        </el-select>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table :data="rows" v-loading="loading" style="width: 100%" ref="hallTable" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="hall_name" :label="$t('halls.name')" />
        <el-table-column
          prop="screen_type"
          :label="$t('halls.screenType')"
          width="120"
        >
          <template #default="{ row }">
            <el-tag size="small">{{ row.screen_type?.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="theater_name" :label="$t('halls.theater')">
          <template #default="{ row }">
            {{ row.theater_name || row.theater_id || "-" }}
          </template>
        </el-table-column>
        <el-table-column
          prop="total_seats"
          :label="$t('halls.totalSeats')"
          width="120"
        />
        <el-table-column prop="status" :label="$t('halls.status')" width="140">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{
              row.status_display || row.status
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_at"
          :label="$t('users.created')"
          width="160"
        >
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('users.actions')" width="180">
          <template #default="{ row }">
            <el-button v-permission="'halls.view'"
              size="small"
              link
              type="primary"
              @click="viewHall(row.id)"
              >{{ $t("actions.view") }}</el-button
            >
            <el-button v-permission="'halls.edit'"
              size="small"
              link
              type="primary"
              @click="editHall(row.id)"
              >{{ $t("actions.edit") }}</el-button
            >
            <el-button v-permission="'halls.delete'"
              size="small"
              link
              type="danger"
              @click="deleteHall(row.id)"
              >{{ $t("actions.delete") }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- Bulk Actions -->
      <div
          class="bulk-actions"
          v-if="selectedHalls.length > 0"
      >
        <el-button
            type="danger"
            @click="bulkDeleteHalls"
            v-permission="'halls.delete'"
        >
          {{ $t("actions.deleteSelected") }} ({{ selectedHalls.length }})
        </el-button>
        <el-button type="default" @click="cancelSelection">
          {{ $t("actions.cancel") }}
        </el-button>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Dialogs -->
    <CreateHall v-model="showCreateDialog" :theater-id="selectedTheaterId" @success="handleDialogSuccess" />
    <EditHall v-model="showEditDialog" :hall-id="selectedHallId" @success="handleDialogSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";
import { hallService } from "@/services/hallService";
import { theaterService } from "@/services/theaterService";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";
import { debounce } from "lodash-es";
import { formatDate } from "@/utils/formatters";
import CreateHall from "./CreateHall.vue";
import EditHall from "./EditHall.vue";

const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const loading = ref(false);
const rows = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchText = ref("");
const statusFilter = ref("");
const typeFilter = ref("");
const theaterFilter = ref("");
const sortBy = ref("hall_name");
const sortOrder = ref("asc");
const theaters = ref([]);
const hallTable = ref(null);
const selectedHalls = ref([]);
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const selectedHallId = ref(null);
const selectedTheaterId = ref(null);

const handleSelectionChange = (val) => {
  selectedHalls.value = val;
};

const cancelSelection = () => {
  selectedHalls.value = [];
  if (hallTable.value) {
    hallTable.value.clearSelection();
  }
};

const bulkDeleteHalls = async () => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete ${selectedHalls.value.length} halls?`,
      "Delete Halls",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );

    const ids = selectedHalls.value.map((hall) => hall.id);
    // Assuming hallService.bulkDeleteHalls(ids) exists or will be created.
    await hallService.bulkDeleteHalls(ids);

    ElMessage.success(
      `${selectedHalls.value.length} halls deleted successfully`
    );
    cancelSelection();
    load(); // Reload the list
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to bulk delete halls:", error);
      ElMessage.error("Failed to delete halls");
    }
  }
};

const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  load();
}, 500);

watch([statusFilter, typeFilter, theaterFilter, sortBy, sortOrder], () => {
  currentPage.value = 1;
  load();
});

const loadTheaters = async () => {
  try {
    const res = await theaterService.getTheaters({ per_page: 100 });
    theaters.value = res.data || [];
  } catch (e) {
    console.error("Failed to load theaters:", e);
  }
};

const load = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      per_page: pageSize.value,
      theater_id: theaterFilter.value || undefined,
      search: searchText.value || undefined,
      status: statusFilter.value || undefined,
      screen_type: typeFilter.value || undefined, // keep screen_type
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
    };
    const res = await hallService.getHalls(params);

    // Enrich hall data with theater names
    const enrichedData = (res.data || []).map((hall) => {
      const theater = theaters.value.find((t) => t.id === hall.theater_id);
      return {
        ...hall,
        theater_name: theater?.name || null,
      };
    });

    rows.value = enrichedData;
    total.value = res.total || 0;
  } catch (e) {
    console.error(e);
    ElMessage.error("Failed to load halls");
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  load();
};
const handleCurrentChange = (page) => {
  currentPage.value = page;
  load();
};

const viewHall = (id) => router.push(`/admin/halls/${id}`);

const openCreateDialog = () => {
  selectedTheaterId.value = theaterFilter.value || null;
  showCreateDialog.value = true;
};

const editHall = (id) => {
  selectedHallId.value = id;
  showEditDialog.value = true;
};

const handleDialogSuccess = () => {
  load();
};

const deleteHall = async (id) => {
  try {
    await ElMessageBox.confirm(
      "Are you sure you want to delete this hall?",
      "Delete Hall",
      {
        type: "warning",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      }
    );
    await hallService.deleteHall(id);
    ElMessage.success("Hall deleted");
    if (rows.value.length === 1 && currentPage.value > 1) currentPage.value--;
    load();
  } catch (err) {
    if (err !== "cancel") {
      console.error(err);
      ElMessage.error("Failed to delete hall");
    }
  }
};

const statusTagType = (status) => {
  switch (status) {
    case "active":
      return "success";
    case "maintenance":
      return "warning";
    case "closed":
      return "danger";
    case "renovation":
      return "info";
    default:
      return "";
  }
};

// const formatDate = (str) => (str ? new Date(str).toLocaleDateString() : "-");

onMounted(async () => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("halls.title"), path: "/admin/halls" },
    { title: t("halls.allHalls"), path: "/admin/halls" },
  ]);
  await loadTheaters();
  load();
});
</script>

<style scoped>
.filter-card {
  margin-bottom: 10px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.search-input {
  width: 360px;
}
.bulk-actions {
  margin: 16px 0;
  padding: 12px;
  border-radius: 4px;
  background-color: var(--el-fill-color-lighter);
  display: flex;
  gap: 8px;
  align-items: center;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
