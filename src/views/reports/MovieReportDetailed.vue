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
              {{ $t("reports.moviePerformanceDetailed") }}
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
        </el-form>
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
          prop="title"
          :label="$t('reports.movieTitle')"
          min-width="250"
          show-overflow-tooltip
        />
        <el-table-column
          prop="showtimes"
          :label="$t('reports.showtimes')"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.showtimes }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="total_bookings"
          :label="$t('reports.bookings')"
          width="120"
          align="center"
          sortable
        />
        <el-table-column
          prop="total_seats"
          :label="$t('reports.seatsSold')"
          width="120"
          align="center"
          sortable
        />
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
        class="info-section mt-6 p-4 bg-blue-50 text-blue-700 rounded-lg flex items-start gap-3"
      >
        <el-icon class="mt-1"><InfoFilled /></el-icon>
        <p class="text-sm m-0">
          {{ $t("reports.movieInfoNote") }}
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
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
const total = ref(0);
const dateRange = ref([]);

const filters = reactive({
  dateFrom: "",
  dateTo: "",
  page: 1,
  limit: 10,
});

// Watch for filter changes
watch(
  () => ({ ...filters }),
  (newFilters, oldFilters) => {
    // If any filter other than page/limit changed, reset to page 1
    const filterChanged =
      newFilters.dateFrom !== oldFilters.dateFrom ||
      newFilters.dateTo !== oldFilters.dateTo;

    if (filterChanged && filters.page !== 1) {
      filters.page = 1;
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
    const response = await reportService.getDetailedMovieReport(filters);
    reportData.value = response.data || [];
    total.value = response.total || 0;
  } catch (error) {
    ElMessage.error("Failed to load movie performance data");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleExport = (type) => {
  const data = reportData.value.map((item) => ({
    [t("reports.movie")]: item.title,
    [t("reports.showtimes")]: item.showtimes,
    [t("reports.bookings")]: item.total_bookings,
    [t("reports.seatsSold")]: item.total_seats,
    [t("reports.revenue")]: item.total_revenue,
  }));

  const filename = `${t("reports.moviePerformance")
    .toLowerCase()
    .replace(/\s+/g, "_")}_${dayjs().format("YYYYMMDD")}`;

  if (type === "csv") {
    exportToCSV(data, filename);
  } else if (type === "excel") {
    exportToExcel(data, filename);
  } else if (type === "pdf") {
    const pdfData = reportData.value.map((item) => ({
      movie: item.title,
      showtimes: item.showtimes,
      bookings: item.total_bookings,
      seats: item.total_seats,
      revenue: item.total_revenue,
    }));

    const columns = [
      { header: t("reports.movie"), dataKey: "movie" },
      { header: t("reports.showtimes"), dataKey: "showtimes" },
      { header: t("reports.bookings"), dataKey: "bookings" },
      { header: t("reports.seatsSold"), dataKey: "seats" },
      { header: t("reports.revenue"), dataKey: "revenue" },
    ];
    exportToPDF(
      pdfData,
      columns,
      t("reports.moviePerformanceDetailed"),
      filename,
    );
  }
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("nav.reportsNav"), path: "/admin/reports" },
    { title: t("reports.moviePerformance"), path: "/admin/reports/movies" },
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
