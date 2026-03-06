<template>
  <div class="customer-frequency">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>{{ $t("reports.customerFrequency") }}</h2>
          <el-button
            type="primary"
            :icon="Refresh"
            @click="loadData"
            :loading="loading"
          >
            {{ $t("actions.refresh") }}
          </el-button>
        </div>
      </template>

      <el-table
        :data="customerData"
        v-loading="loading"
        style="width: 100%"
        stripe
        :default-sort="{ prop: 'total_bookings', order: 'descending' }"
      >
        <el-table-column type="index" label="#" width="60" />

        <el-table-column
          prop="customer_name"
          :label="$t('reports.customerName')"
          min-width="150"
        >
          <template #default="{ row }">
            <span>{{ row.customer_name || "N/A" }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="customer_phone"
          :label="$t('reports.phone')"
          min-width="130"
        >
          <template #default="{ row }">
            <span>{{ row.customer_phone || "N/A" }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="customer_email"
          :label="$t('reports.email')"
          min-width="180"
        >
          <template #default="{ row }">
            <span>{{ row.customer_email || "N/A" }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="total_bookings"
          :label="$t('reports.totalBookings')"
          width="140"
          sortable
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="primary" size="large">{{
              row.total_bookings
            }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="total_spend"
          :label="$t('reports.totalValue')"
          width="150"
          sortable
          align="right"
        >
          <template #default="{ row }">
            <span class="amount">${{ formatAmount(row.total_spend) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-section mt-6 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>

      <div v-if="!loading && customerData.length === 0" class="empty-state">
        <el-empty :description="$t('reports.noDataAvailable')" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import reportService from "@/services/reportService";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
const { t } = useI18n();
const loading = ref(false);
const customerData = ref([]);
const total = ref(0);

const pagination = reactive({
  page: 1,
  limit: 10,
});

const formatAmount = (amount) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const loadData = async () => {
  loading.value = true;
  try {
    const response =
      await reportService.getCustomerBookingFrequency(pagination);
    customerData.value = response.data || [];
    total.value = response.total || 0;
  } catch (error) {
    console.error("Failed to load customer booking frequency:", error);
    ElMessage.error(t("messages.loadDataFailed"));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("nav.reportsNav"), path: "/admin/reports" },
    {
      title: t("reports.customerFrequency"),
      path: "/admin/reports/customer-frequency",
    },
  ]);

  loadData();
});
</script>

<style scoped>
.customer-frequency {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.amount {
  font-weight: 600;
  color: var(--el-color-success);
  font-size: 15px;
}

.empty-state {
  padding: 40px 0;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: var(--el-fill-color-light);
  font-weight: 600;
}
</style>
