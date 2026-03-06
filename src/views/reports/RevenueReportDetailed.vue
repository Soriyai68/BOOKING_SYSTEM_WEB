<template>
  <div class="detailed-report">
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
              {{ $t("reports.revenueReportDetailed") }}
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
          <el-form-item :label="$t('reports.paymentMethod')">
            <el-select
              v-model="filters.payment_method"
              :placeholder="$t('reports.allMethods')"
              clearable
              @change="handleFilterChange"
              style="width: 240px"
            >
              <el-option :label="$t('reports.allMethods')" value="" />
              <el-option label="Bakong" value="Bakong" />
              <el-option label="Cash" value="Cash" />
              <!-- <el-option label="Card" value="Card" /> -->
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('customers.customerType')">
            <el-select
              v-model="filters.customerType"
              :placeholder="$t('customers.allCustomers')"
              clearable
              style="width: 240px"
            >
              <el-option :label="$t('customers.allTypes')" value="" />
              <el-option :label="$t('customers.member')" value="member" />
              <el-option :label="$t('customers.walkin')" value="walkin" />
              <!-- <el-option :label="$t('customers.guest')" value="guest" /> -->
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- Table -->
      <el-table
        :data="reportData"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column
          prop="payment_date"
          :label="$t('reports.date')"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.payment_date) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="reference_code"
          :label="$t('reports.bookingRef')"
          width="150"
        />
        <el-table-column
          prop="customer_name"
          :label="$t('reports.customer')"
          min-width="150"
        />
        <el-table-column
          prop="payment_method"
          :label="$t('reports.method')"
          width="150"
        >
          <template #default="{ row }">
            <el-tag :type="getPaymentMethodTag(row.payment_method)">{{
              row.payment_method
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="amount"
          :label="$t('reports.amount')"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            <span class="font-bold text-green-600"
              >${{ row.amount?.toFixed(2) }}</span
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-section mt-6 flex justify-end">
        <el-pagination
          v-model:current-page="filters.page"
          v-model:page-size="filters.limit"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>

      <div
        class="summary-footer mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center"
      >
        <span class="text-gray-600"
          >{{ $t("reports.totalRecords") }}:
          <strong class="text-black">{{ reportData.length }}</strong></span
        >
        <span class="text-xl font-bold text-indigo-600">
          {{ $t("reports.totalRevenue") }}: ${{ totalAmount.toFixed(2) }}
        </span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { ArrowLeft, Download, Search } from "@element-plus/icons-vue";
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
  payment_method: "",
  customerType: "",
  page: 1,
  limit: 10,
});

const total = ref(0);

const totalAmount = computed(() => {
  return reportData.value.reduce((sum, item) => sum + (item.amount || 0), 0);
});

const formatDateTime = (date) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm");
};

const getPaymentMethodTag = (method) => {
  const tags = {
    Bakong: "success",
    Cash: "info",
    Card: "warning",
  };
  return tags[method] || "";
};

// Watch for filter changes
watch(
  () => ({ ...filters }),
  (newFilters, oldFilters) => {
    // If any filter other than page/limit changed, reset to page 1
    const filterChanged =
      newFilters.dateFrom !== oldFilters.dateFrom ||
      newFilters.dateTo !== oldFilters.dateTo ||
      newFilters.payment_method !== oldFilters.payment_method ||
      newFilters.customerType !== oldFilters.customerType;

    if (filterChanged && filters.page !== 1) {
      filters.page = 1;
      // loadData will be triggered by the watch on the new page value
      return;
    }
    loadData();
  },
  { deep: true },
);

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
    const response = await reportService.getDetailedRevenueReport(filters);
    reportData.value = response.data || [];
    total.value = response.total || 0;
  } catch (error) {
    ElMessage.error("Failed to load revenue data");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleExport = (type) => {
  const data = reportData.value.map((item) => ({
    [t("reports.date")]: formatDateTime(item.payment_date),
    [t("reports.bookingRef")]: item.reference_code,
    [t("reports.customer")]: item.customer_name,
    [t("reports.method")]: item.payment_method,
    [t("reports.amount")]: item.amount,
  }));

  const filename = `${t("reports.revenueReport")
    .toLowerCase()
    .replace(/\s+/g, "_")}_${dayjs().format("YYYYMMDD")}`;

  if (type === "csv") {
    exportToCSV(data, filename);
  } else if (type === "excel") {
    exportToExcel(data, filename);
  } else if (type === "pdf") {
    const pdfData = reportData.value.map((item) => ({
      date: formatDateTime(item.payment_date),
      ref: item.reference_code,
      customer: item.customer_name,
      method: item.payment_method,
      amount: item.amount,
    }));

    const columns = [
      { header: t("reports.date"), dataKey: "date" },
      { header: t("reports.bookingRef"), dataKey: "ref" },
      { header: t("reports.customer"), dataKey: "customer" },
      { header: t("reports.method"), dataKey: "method" },
      { header: t("reports.amount"), dataKey: "amount" },
    ];
    exportToPDF(pdfData, columns, t("reports.revenueReportDetailed"), filename);
  }
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("nav.reportsNav"), path: "/admin/reports" },
    { title: t("reports.revenueReport"), path: "/admin/reports/revenue" },
  ]);
  loadData();
});
</script>

<style scoped>
.detailed-report {
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
</style>
