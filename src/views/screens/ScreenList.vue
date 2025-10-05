<template>
  <div class="screen-list">
    <div class="page-header">
      <h2>{{ $t("screens.title") }}</h2>
      <el-button type="primary" @click="$router.push('/admin/screens/create')">
        <el-icon><Plus /></el-icon>
        {{ $t("screens.addScreen") }}
      </el-button>
    </div>

    <el-card>
      <div class="toolbar">
        <el-input
          v-model="searchText"
          :placeholder="$t('screens.searchScreens')"
          class="search-input"
          :prefix-icon="Search"
          clearable
          @input="debouncedSearch"
        />

        <el-select
          v-model="typeFilter"
          :placeholder="$t('screens.filterByType')"
          clearable
        >
          <el-option :label="$t('table.selectAll')" value="" />
          <el-option
            v-for="opt in screenService.SCREEN_TYPES"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-select
          v-model="statusFilter"
          :placeholder="$t('screens.filterByStatus')"
          clearable
        >
          <el-option :label="$t('table.selectAll')" value="" />
          <el-option
            v-for="opt in screenService.SCREEN_STATUSES"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-select v-model="sortBy" :placeholder="$t('table.sortBy')">
          <el-option
            v-for="opt in screenService.SORT_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <el-select v-model="sortOrder" :placeholder="$t('screens.sortOrder')">
          <el-option label="ASC" value="asc" />
          <el-option label="DESC" value="desc" />
        </el-select>
      </div>

      <el-table :data="rows" v-loading="loading" style="width: 100%">
        <el-table-column prop="screen_name" :label="$t('screens.name')" />
        <el-table-column
          prop="screen_type"
          :label="$t('screens.type')"
          width="120"
        >
          <template #default="{ row }">
            <el-tag size="small">{{ row.screen_type.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="theater_name" :label="$t('screens.theater')">
          <template #default="{ row }">
            {{ row.theater_name || row.theater_id || "-" }}
          </template>
        </el-table-column>
        <el-table-column
          prop="total_seats"
          :label="$t('screens.totalSeats')"
          width="120"
        />
        <el-table-column
          prop="status"
          :label="$t('screens.status')"
          width="140"
        >
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
            <el-button
              size="small"
              link
              type="primary"
              @click="viewScreen(row.id)"
              >{{ $t("actions.view") }}</el-button
            >
            <el-button
              size="small"
              link
              type="primary"
              @click="editScreen(row.id)"
              >{{ $t("actions.edit") }}</el-button
            >
            <el-button
              size="small"
              link
              type="danger"
              @click="deleteScreen(row.id)"
              >{{ $t("actions.delete") }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>

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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";
import { screenService } from "@/services/screenService";
import { theaterService } from "@/services/theaterService";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";
import { debounce } from "lodash-es";

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
const sortBy = ref("screen_name");
const sortOrder = ref("asc");
const theaters = ref([]);

const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  load();
}, 500);

watch([statusFilter, typeFilter, sortBy, sortOrder], () => {
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
      search: searchText.value || undefined,
      status: statusFilter.value || undefined,
      screen_type: typeFilter.value || undefined,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
    };
    const res = await screenService.getScreens(params);

    // Enrich screen data with theater names
    const enrichedData = (res.data || []).map((screen) => {
      const theater = theaters.value.find((t) => t.id === screen.theater_id);
      return {
        ...screen,
        theater_name: theater?.name || null,
      };
    });

    rows.value = enrichedData;
    total.value = res.total || 0;
  } catch (e) {
    console.error(e);
    ElMessage.error("Failed to load screens");
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

const viewScreen = (id) => router.push(`/admin/screens/${id}`);
const editScreen = (id) => router.push(`/admin/screens/${id}/edit`);

const deleteScreen = async (id) => {
  try {
    await ElMessageBox.confirm(
      "Are you sure you want to delete this screen?",
      "Delete Screen",
      {
        type: "warning",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      }
    );
    await screenService.deleteScreen(id);
    ElMessage.success("Screen deleted");
    if (rows.value.length === 1 && currentPage.value > 1) currentPage.value--;
    load();
  } catch (err) {
    if (err !== "cancel") {
      console.error(err);
      ElMessage.error("Failed to delete screen");
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

const formatDate = (str) => (str ? new Date(str).toLocaleDateString() : "-");

onMounted(async () => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("screens.title"), path: "/admin/screens" },
  ]);
  await loadTheaters();
  load();
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
  gap: 12px;
  
  margin-bottom: 16px;
}
.search-input {
  width: 360px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>