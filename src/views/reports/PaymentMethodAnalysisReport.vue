<template>
  <div class="payment-analysis-report">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="title-section">
            <el-button
              @click="$router.push('/admin/reports')"
              link
              :icon="ArrowLeft"
              class="mr-2"
            />
            <h2 class="text-xl font-bold">
              {{ $t("reports.paymentMethodAnalysis") }}
            </h2>
          </div>
          <div class="action-section">
            <el-dropdown trigger="click" @command="handleExport">
              <el-button type="primary" :icon="Download">
                {{ $t("reports.export") }}
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="csv">CSV</el-dropdown-item>
                  <el-dropdown-item command="excel">Excel</el-dropdown-item>
                  <el-dropdown-item command="pdf">PDF</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <!-- Filters -->
      <div class="filters-section mb-6">
        <el-form :inline="true" :model="filters" class="demo-form-inline">
          <el-form-item :label="$t('reports.dateRange')">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              :range-separator="$t('reports.to')"
              :start-placeholder="$t('reports.startDate')"
              :end-placeholder="$t('reports.endDate')"
              @change="handleFilterChange"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData" :icon="Search">
              {{ $t("reports.search") }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards mb-6">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card">
              <div class="card-label">{{ $t("reports.totalTransactions") }}</div>
              <div class="card-value">{{ totalTransactions }}</div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card">
              <div class="card-label">{{ $t("reports.totalRevenue") }}</div>
              <div class="card-value text-green-600">
                ${{ totalRevenue.toFixed(2) }}
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card">
              <div class="card-label">{{ $t("reports.successfulTransactions") }}</div>
              <div class="card-value text-blue-600">{{ totalSuccessful }}</div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card">
              <div class="card-label">{{ $t("reports.failedTransactions") }}</div>
              <div class="card-value text-red-600">{{ totalFailed }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- Table -->
      <el-table
        :data="reportData"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="60" />
        <el-table-column
          prop="payment_method"
          :label="$t('reports.paymentMethod')"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-tag>{{ row.payment_method || "N/A" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="total_transactions"
          :label="$t('reports.totalTransactions')"
          width="140"
          align="center"
          sortable
        />
        <el-table-column
          prop="successful_transactions"
          :label="$t('reports.successful')"
          width="120"
          align="center"
          sortable
        >
          <template #default="{ row }">
            <el-tag type="success" size="small">
              {{ row.successful_transactions }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="failed_transactions"
          :label="$t('reports.failed')"
          width="100"
          align="center"
          sortable
        >
          <template #default="{ row }">
            <el-tag type="danger" size="small">
              {{ row.failed_transactions }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="pending_transactions"
          :label="$t('reports.pending')"
          width="100"
          align="center"
          sortable
        >
          <template #default="{ row }">
            <el-tag type="warning" size="small">
              {{ row.pending_transactions }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="success_rate"
          :label="$t('reports.successRate')"
          width="120"
          align="center"
          sortable
        >
          <template #default="{ row }">
            <el-progress
              :percentage="row.success_rate"
              :color="getProgressColor(row.success_rate)"
              :show-text="false"
            />
            <span class="text-xs">{{ row.success_rate }}%</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="failed_rate"
          :label="$t('reports.failedRate')"
          width="120"
          align="center"
          sortable
        >
          <template #default="{ row }">
            <span class="text-red-600">{{ row.failed_rate }}%</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="total_revenue"
          :label="$t('reports.revenue')"
          width="150"
          align="right"
          sortable
        >
          <template #default="{ row }">
            <span class="font-bold text-indigo-600"
              >${{ row.total_revenue?.toFixed(2) }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="revenue_contribution_percentage"
          :label="$t('reports.revenueContribution')"
          width="140"
          align="center"
          sortable
        >
          <template #default="{ row }">
            <el-progress
              :percentage="row.revenue_contribution_percentage"
              :color="getProgressColor(row.revenue_contribution_percentage)"
              :show-text="false"
            />
            <span class="text-xs">{{ row.revenue_contribution_percentage }}%</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="avg_transaction_value"
          :label="$t('reports.avgTransactionValue')"
          width="160"
          align="right"
          sortable
        >
          <template #default="{ row }">
            <span>${{ row.avg_transaction_value?.toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>

   
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import {
  ArrowLeft,
  Download,
  InfoFilled,
  Search,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import reportService from "@/services/reportService";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";

const { t } = useI18n();
const appStore = useAppStore();
const loading = ref(false);
const reportData = ref([]);
const dateRange = ref([]);

const filters = reactive({
  dateFrom: "",
  dateTo: "",
});

// Computed properties for summary
const totalTransactions = computed(() => {
  return reportData.value.reduce((sum, item) => sum + item.total_transactions, 0);
});

const totalRevenue = computed(() => {
  return reportData.value.reduce((sum, item) => sum + item.total_revenue, 0);
});

const totalSuccessful = computed(() => {
  return reportData.value.reduce((sum, item) => sum + item.successful_transactions, 0);
});

const totalFailed = computed(() => {
  return reportData.value.reduce((sum, item) => sum + item.failed_transactions, 0);
});

// Watch for dateRange change to update filters
watch(dateRange, (val) => {
  if (val && val.length === 2) {
    filters.dateFrom = val[0];
    filters.dateTo = val[1];
  } else {
    filters.dateFrom = "";
    filters.dateTo = "";
  }
});

const loadData = async () => {
  loading.value = true;
  try {
    const response = await reportService.getPaymentMethodAnalysisReport(filters);
    reportData.value = response.data || [];
  } catch (error) {
    ElMessage.error(t("reports.failedToLoadData"));
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = () => {
  loadData();
};

const getProgressColor = (percentage) => {
  if (percentage >= 80) return "#67C23A";
  if (percentage >= 60) return "#409EFF";
  if (percentage >= 40) return "#E6A23C";
  return "#F56C6C";
};

const handleExport = (type) => {
  const data = reportData.value.map((item) => ({
    [t("reports.paymentMethod")]: item.payment_method,
    [t("reports.totalTransactions")]: item.total_transactions,
    [t("reports.successful")]: item.successful_transactions,
    [t("reports.failed")]: item.failed_transactions,
    [t("reports.pending")]: item.pending_transactions,
    [t("reports.successRate")]: `${item.success_rate}%`,
    [t("reports.failedRate")]: `${item.failed_rate}%`,
    [t("reports.revenue")]: item.total_revenue,
    [t("reports.revenueContribution")]: `${item.revenue_contribution_percentage}%`,
    [t("reports.avgTransactionValue")]: item.avg_transaction_value,
  }));

  const filename = `${t("reports.paymentMethodAnalysis")
    .toLowerCase()
    .replace(/\s+/g, "_")}_${dayjs().format("YYYYMMDD")}`;

  if (type === "csv") {
    exportToCSV(data, filename);
  } else if (type === "excel") {
    exportToExcel(data, filename);
  } else if (type === "pdf") {
    const pdfData = reportData.value.map((item) => ({
      method: item.payment_method,
      transactions: item.total_transactions,
      successful: item.successful_transactions,
      failed: item.failed_transactions,
      pending: item.pending_transactions,
      successRate: `${item.success_rate}%`,
      failedRate: `${item.failed_rate}%`,
      revenue: item.total_revenue,
      contribution: `${item.revenue_contribution_percentage}%`,
      avgValue: item.avg_transaction_value,
    }));

    const columns = [
      { header: t("reports.paymentMethod"), dataKey: "method" },
      { header: t("reports.totalTransactions"), dataKey: "transactions" },
      { header: t("reports.successful"), dataKey: "successful" },
      { header: t("reports.failed"), dataKey: "failed" },
      { header: t("reports.pending"), dataKey: "pending" },
      { header: t("reports.successRate"), dataKey: "successRate" },
      { header: t("reports.failedRate"), dataKey: "failedRate" },
      { header: t("reports.revenue"), dataKey: "revenue" },
      { header: t("reports.revenueContribution"), dataKey: "contribution" },
      { header: t("reports.avgTransactionValue"), dataKey: "avgValue" },
    ];
    exportToPDF(
      pdfData,
      columns,
      t("reports.paymentMethodAnalysis"),
      filename,
    );
  }
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("nav.reportsNav"), path: "/admin/reports" },
    { title: t("reports.paymentMethodAnalysis"), path: "/admin/reports/payment-methods" },
  ]);
  loadData();
});
</script>

<style scoped>
.payment-analysis-report {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
}

.filters-section {
  background-color: var(--el-fill-color-blank);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.summary-card:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.summary-card:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.summary-card:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-label {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
}

.info-section {
  border-left: 4px solid #409eff;
}
</style>