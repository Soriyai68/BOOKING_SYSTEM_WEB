<template>
  <div class="promotion-list">
    <div class="page-header">
      <h2>{{ $t('promotions.title') }}</h2>
      <el-button
        v-permission="'promotions.create'"
        type="primary"
        @click="$router.push('/admin/promotions/create')"
      >
        <el-icon>
          <Plus />
        </el-icon>
        {{ $t('promotions.addPromotion') || 'Add Promotion' }}
      </el-button>
    </div>

    <el-card class="filter-card" shadow="never">
      <div class="toolbar">
        <el-input
          v-model="searchText"
          :placeholder="$t('promotions.searchPromotions') || 'Search by code or title'"
          class="search-input"
          :prefix-icon="Search"
          clearable
          style="width: 200px"
          @input="debouncedSearch"
        />
        <el-select
          v-model="statusFilter"
          :placeholder="$t('promotions.filterByStatus') || 'Filter by status'"
          clearable
          @change="load"
          class="filter-select"
        >
          <el-option :label="$t('table.selectAll')" value="" />
          <el-option
            v-for="opt in promotionService.STATUS_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <el-select
          v-model="sortBy"
          :placeholder="$t('promotions.sortBy') || 'Sort by'"
          @change="load"
          class="filter-select"
        >
          <el-option
            v-for="opt in promotionService.SORT_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table
        :data="rows"
        v-loading="loading"
        style="width: 100%"
        ref="tableRef"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          prop="code"
          :label="$t('promotions.code') || 'Code'"
          width="140"
        />
        <el-table-column
          prop="title"
          :label="$t('promotions.titleColumn') || 'Title'"
          min-width="200"
        >
          <template #default="{ row }">
            <div class="promotion-title-cell">
              <img
                v-if="row.image_url"
                :src="row.image_url"
                class="promotion-image-thumb"
              />
              <span>{{ row.title || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="start_date"
          :label="$t('promotions.startDate') || 'Start Date'"
          width="160"
        >
          <template #default="{ row }">
            {{ formatDate(row.start_date) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="end_date"
          :label="$t('promotions.endDate') || 'End Date'"
          width="160"
        >
          <template #default="{ row }">
            {{ formatDate(row.end_date) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          :label="$t('promotions.status') || 'Status'"
          width="140"
        >
          <template #default="{ row }">
            <el-tag size="small" :type="getStatusTagType(row.status)">
              {{ row.status_display || row.status || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.actions') || 'Actions'"
          width="200"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              v-permission="'promotions.view'"
              size="small"
              link
              type="primary"
              @click="viewPromotion(row.id)"
            >
              {{ $t('actions.view') || 'View' }}
            </el-button>
            <el-button
              v-permission="'promotions.edit'"
              size="small"
              link
              type="primary"
              @click="editPromotion(row.id)"
            >
              {{ $t('actions.edit') || 'Edit' }}
            </el-button>
            <el-button
              v-permission="'promotions.delete'"
              size="small"
              link
              type="danger"
              @click="deletePromotion(row.id)"
            >
              {{ $t('actions.delete') || 'Delete' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="bulk-actions" v-if="selectedRows.length > 0">
        <el-button
          v-permission="'promotions.delete'"
          type="danger"
          @click="bulkDeletePromotions"
        >
          {{ $t('actions.deleteSelected') || 'Delete Selected' }} ({{ selectedRows.length }})
        </el-button>
        <el-button type="default" @click="clearSelection">
          {{ $t('actions.cancel') || 'Cancel' }}
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '@/stores/app';
import { promotionService } from '@/services/promotionService';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import { debounce } from 'lodash-es';

const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const loading = ref(false);
const rows = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchText = ref('');
const statusFilter = ref('');
const sortBy = ref('start_date');
const tableRef = ref(null);
const selectedRows = ref([]);

const handleSelectionChange = (val) => {
  selectedRows.value = val;
};

const clearSelection = () => {
  selectedRows.value = [];
  if (tableRef.value) {
    tableRef.value.clearSelection();
  }
};

const bulkDeletePromotions = async () => {
  try {
    await ElMessageBox.confirm(
      t('promotions.confirmBulkDelete') || `Are you sure you want to delete ${selectedRows.value.length} promotions?`,
      t('promotions.deletePromotions') || 'Delete Promotions',
      {
        confirmButtonText: t('actions.delete') || 'Delete',
        cancelButtonText: t('actions.cancel') || 'Cancel',
        type: 'warning',
      },
    );

    const ids = selectedRows.value.map((p) => p.id);
    await promotionService.deleteBulkPromotions(ids);

    ElMessage.success(
      t('promotions.bulkDeleteSuccess') || `${selectedRows.value.length} promotions deleted successfully`,
    );
    clearSelection();
    load();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to bulk delete promotions:', error);
      ElMessage.error(t('promotions.bulkDeleteFailed') || 'Failed to delete promotions');
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
      limit: pageSize.value,
      search: searchText.value || undefined,
      status: statusFilter.value || undefined,
      sort_by: sortBy.value || 'start_date',
      sort_order: 'desc',
    };
    const res = await promotionService.getPromotions(params);
    rows.value = res.data || [];
    total.value = res.total || 0;
  } catch (e) {
    console.error(e);
    ElMessage.error(t('promotions.loadFailed') || 'Failed to load promotions');
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

const viewPromotion = (id) => router.push(`/admin/promotions/${id}`);
const editPromotion = (id) => router.push(`/admin/promotions/${id}/edit`);

const deletePromotion = async (id) => {
  try {
    await ElMessageBox.confirm(
      t('promotions.confirmDelete') || 'Are you sure you want to delete this promotion?',
      t('promotions.deletePromotion') || 'Delete Promotion',
      { type: 'warning' },
    );
    await promotionService.deletePromotion(id);
    ElMessage.success(t('promotions.deleteSuccess') || 'Promotion deleted successfully');
    if (rows.value.length === 1 && currentPage.value > 1) {
      currentPage.value--;
    }
    load();
  } catch (err) {
    if (err !== 'cancel') {
      console.error(err);
      ElMessage.error(t('promotions.deleteFailed') || 'Failed to delete promotion');
    }
  }
};

const getStatusTagType = (status) => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Inactive':
      return 'info';
    case 'Expired':
      return 'warning';
    default:
      return '';
  }
};

const formatDate = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  return d.toLocaleDateString();
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t('nav.dashboard'), path: '/admin/dashboard' },
    { title: t('promotions.title') || 'Promotions', path: '/admin/promotions' },
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
  flex-wrap: wrap;
}

.search-input {
  width: 280px;
}

.filter-select {
  width: 180px;
}

.promotion-title-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.promotion-image-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
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
