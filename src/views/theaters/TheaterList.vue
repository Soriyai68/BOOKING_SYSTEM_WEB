<template>
  <div class="theater-list">
    <div class="page-header">
      <h2>{{ $t("theaters.title") }}</h2>
      <el-button v-permission="'theaters.create'" type="primary" @click="$router.push('/admin/theaters/create')">
        <el-icon>
          <Plus/>
        </el-icon>
        {{ $t("theaters.addTheater") }}
      </el-button>
    </div>

    <el-card class="filter-card" shadow="never">
      <div class="toolbar">
        <el-input
            v-model="searchText"
            :placeholder="$t('actions.search')"
            class="search-input"
            :prefix-icon="Search"
            clearable
            @input="debouncedSearch"
        />
        <el-input
            v-model="cityFilter"
            :placeholder="$t('theaters.city')"
            class="search-input"
            clearable
            @input="debouncedSearch"
        />
        <el-input
            v-model="provinceFilter"
            :placeholder="$t('theaters.province')"
            class="search-input"
            clearable
            @input="debouncedSearch"
        />
        <el-select
            v-model="statusFilter"
            :placeholder="$t('theaters.status')"
            clearable
        >
          <el-option :label="$t('table.selectAll')" value=""/>
          <el-option
              v-for="opt in theaterService.STATUS_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
          />
        </el-select>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table :data="rows" v-loading="loading" style="width: 100%" ref="theaterTable" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" :label="$t('theaters.name')"/>
        <el-table-column prop="city" :label="$t('theaters.city')" width="140"/>
        <el-table-column
            prop="province"
            :label="$t('theaters.province')"
            width="140"
        />
        <el-table-column
            prop="total_halls"
            :label="$t('theaters.totalHalls')"
            width="140"
        />
        <el-table-column
            prop="status"
            :label="$t('theaters.status')"
            width="140"
        >
          <template #default="{ row }">
            <el-tag size="small">{{ row.status_display || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('users.actions')" width="220">
          <template #default="{ row }">
            <el-button v-permission="'theaters.view'"
                       size="small"
                       link
                       type="primary"
                       @click="viewTheater(row.id)"
            >{{ $t("actions.view") }}
            </el-button
            >
            <el-button v-permission="'theaters.edit'"
                       size="small"
                       link
                       type="primary"
                       @click="editTheater(row.id)"
            >{{ $t("actions.edit") }}
            </el-button
            >
            <el-button v-permission="'theaters.delete'"
                       size="small"
                       link
                       type="danger"
                       @click="deleteTheater(row.id)"
            >{{ $t("actions.delete") }}
            </el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- Bulk Actions -->
      <div
          class="bulk-actions"
          v-if="selectedTheaters.length > 0"
      >
        <el-button
            type="danger"
            @click="bulkDeleteTheaters"
            v-permission="'theaters.delete'"
        >
          {{ $t("actions.deleteSelected") }} ({{ selectedTheaters.length }})
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
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useAppStore} from "@/stores/app";
import {theaterService} from "@/services/theaterService";
import {ElMessage, ElMessageBox} from "element-plus";
import {Plus, Search} from "@element-plus/icons-vue";
import {debounce} from "lodash-es";

const router = useRouter();
const appStore = useAppStore();
const {t} = useI18n();

const loading = ref(false);
const rows = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchText = ref("");
const statusFilter = ref("");
const cityFilter = ref("");
const provinceFilter = ref("");
const theaterTable = ref(null);
const selectedTheaters = ref([]);

const handleSelectionChange = (val) => {
  selectedTheaters.value = val;
};

const cancelSelection = () => {
  selectedTheaters.value = [];
  if (theaterTable.value) {
    theaterTable.value.clearSelection();
  }
};

const bulkDeleteTheaters = async () => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete ${selectedTheaters.value.length} theaters?`,
      "Delete Theaters",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );

    const ids = selectedTheaters.value.map((theater) => theater.id);
    // Assuming theaterService.bulkDeleteTheaters(ids) exists or will be created.
    await theaterService.bulkDeleteTheaters(ids);

    ElMessage.success(
      `${selectedTheaters.value.length} theaters deleted successfully`
    );
    cancelSelection();
    load(); // Reload the list
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to bulk delete theaters:", error);
      ElMessage.error("Failed to delete theaters");
    }
  }
};

const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  load();
}, 500);

const load = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      per_page: pageSize.value,
      search: searchText.value || undefined,
      status: statusFilter.value || undefined,
      city: cityFilter.value || undefined,
      province: provinceFilter.value || undefined,
      sort_by: "name",
      sort_order: "asc",
    };
    const res = await theaterService.getTheaters(params);
    rows.value = res.data;
    console.log("Theaters data:", res.data);
    total.value = res.total || 0;
  } catch (e) {
    console.error(e);
    ElMessage.error("Failed to load theaters");
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

const viewTheater = (id) => router.push(`/admin/theaters/${id}`);
const editTheater = (id) => router.push(`/admin/theaters/${id}/edit`);

const deleteTheater = async (id) => {
  try {
    await ElMessageBox.confirm(
        "Are you sure you want to delete this theater?",
        "Delete Theater",
        {type: "warning"}
    );
    await theaterService.deleteTheater(id);
    ElMessage.success("Theater deleted");
    if (rows.value.length === 1 && currentPage.value > 1) currentPage.value--;
    load();
  } catch (err) {
    if (err !== "cancel") ElMessage.error("Failed to delete theater");
  }
};

onMounted(() => {
  appStore.setBreadcrumbs([
    {title: t("nav.dashboard"), path: "/admin/dashboard"},
    {title: t("theaters.title"), path: "/admin/theaters"},
    {title: t("theaters.allTheaters"), path: "/admin/theaters"},
  ]);
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
  width: 220px;
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
