<template>
  <div class="inventory-seat-report">
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
              {{ $t("reports.inventorySeatManagement") }}
            </h2>
          </div>
          <div class="action-section">
            <el-button 
              type="primary" 
              @click="handleExport('csv')"
              :icon="Download"
              class="export-btn"
            >
              CSV
            </el-button>
            <el-button 
              type="success" 
              @click="handleExport('excel')"
              :icon="Download"
              class="export-btn"
            >
              Excel
            </el-button>
            <el-button 
              type="danger" 
              @click="handleExport('pdf')"
              :icon="DocumentCopy"
              class="export-btn"
            >
              Print
            </el-button>
          </div>
        </div>
      </template>

      <!-- Date Range Filter -->
      <div class="filter-section mb-6">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="-"
              :start-placeholder="$t('reports.startDate')"
              :end-placeholder="$t('reports.endDate')"
              @change="loadData"
              style="width: 100%"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <el-button @click="resetFilters" :icon="Refresh">
              {{ $t("reports.reset") }}
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards mb-6">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card">
              <div class="card-label">{{ $t("reports.totalSeats") }}</div>
              <div class="card-value">{{ summaryData.total_seats }}</div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card">
              <div class="card-label">{{ $t("reports.bookedSeats") }}</div>
              <div class="card-value text-red-600">
                {{ summaryData.booked_seats }}
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card">
              <div class="card-label">{{ $t("reports.availableSeats") }}</div>
              <div class="card-value text-green-600">
                {{ summaryData.available_seats }}
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <div class="summary-card">
              <div class="card-label">{{ $t("reports.occupancyRate") }}</div>
              <div class="card-value text-blue-600">
                {{ summaryData.occupancy_rate }}%
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- Tabs for different views -->
      <el-tabs v-model="activeTab">
        <!-- Seat Inventory by Hall -->
        <el-tab-pane
          :label="$t('reports.seatInventoryByHall')"
          name="inventory"
        >
          <el-table
            :data="seatInventoryData"
            v-loading="loading"
            stripe
            style="width: 100%"
          >
            <el-table-column type="index" label="#" width="60" />
            <el-table-column
              prop="theater_name"
              :label="$t('reports.theater')"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column
              prop="hall_name"
              :label="$t('reports.hall')"
              min-width="150"
              show-overflow-tooltip
            />
            <el-table-column
              prop="total_seats"
              :label="$t('reports.totalSeats')"
              min-width="120"
              align="center"
              sortable
            />
            <el-table-column
              prop="booked_seats"
              :label="$t('reports.bookedSeats')"
              min-width="120"
              align="center"
              sortable
            >
              <template #default="{ row }">
                <el-tag type="danger">{{ row.booked_seats }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="available_seats"
              :label="$t('reports.availableSeats')"
              min-width="130"
              align="center"
              sortable
            >
              <template #default="{ row }">
                <el-tag type="success">{{ row.available_seats }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="occupancy_rate"
              :label="$t('reports.occupancyRate')"
              min-width="130"
              align="center"
              sortable
            >
              <template #default="{ row }">
                <el-progress
                  :percentage="row.occupancy_rate || 0"
                  :show-text="false"
                />
                <span class="text-xs">{{ row.occupancy_rate || 0 }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Seat Type Distribution -->
        <el-tab-pane :label="$t('reports.seatTypeDistribution')" name="types">
          <el-table
            :data="seatTypeData"
            v-loading="loading"
            stripe
            style="width: 100%"
          >
            <el-table-column type="index" label="#" width="60" />
            <el-table-column
              prop="_id"
              :label="$t('reports.seatType')"
              min-width="150"
            >
              <template #default="{ row }">
                <el-tag>{{ row._id }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="count"
              :label="$t('reports.totalCount')"
              min-width="120"
              align="center"
              sortable
            />
            <el-table-column
              prop="avg_price"
              :label="$t('reports.avgPrice')"
              min-width="120"
              align="right"
              sortable
            >
              <template #default="{ row }">
                <span>${{ row.avg_price?.toFixed(2) || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="total_value"
              :label="$t('reports.totalValue')"
              min-width="130"
              align="right"
              sortable
            >
              <template #default="{ row }">
                <span class="font-bold text-indigo-600"
                  >${{ row.total_value?.toFixed(2) || 0 }}</span
                >
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('reports.percentage')"
              min-width="130"
              align="center"
            >
              <template #default="{ row }">
                <el-progress
                  :percentage="calculatePercentage(row.count)"
                  :show-text="false"
                />
                <span class="text-xs"
                  >{{ calculatePercentage(row.count) }}%</span
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Seat Status Breakdown (Maintenance Status) -->
        <el-tab-pane :label="$t('reports.seatStatusBreakdown')" name="status">
          <el-table
            :data="seatStatusData"
            v-loading="loading"
            stripe
            style="width: 100%"
          >
            <el-table-column type="index" label="#" width="60" />
            <el-table-column
              prop="_id"
              :label="$t('reports.status')"
              min-width="150"
            >
              <template #default="{ row }">
                <el-tag :type="getMaintenanceStatusType(row._id)">{{
                  formatMaintenanceStatus(row._id)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="count"
              :label="$t('reports.count')"
              min-width="120"
              align="center"
              sortable
            />
            <el-table-column
              :label="$t('reports.percentage')"
              min-width="130"
              align="center"
            >
              <template #default="{ row }">
                <el-progress
                  :percentage="calculateStatusPercentage(row.count)"
                  :show-text="false"
                />
                <span class="text-xs"
                  >{{ calculateStatusPercentage(row.count) }}%</span
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- Seat Booking Status -->
        <el-tab-pane :label="$t('reports.seatBookingStatus')" name="booking">
          <el-table
            :data="seatBookingStatusData"
            v-loading="loading"
            stripe
            style="width: 100%"
          >
            <el-table-column type="index" label="#" width="60" />
            <el-table-column
              prop="_id"
              :label="$t('reports.status')"
              min-width="150"
            >
              <template #default="{ row }">
                <el-tag :type="getStatusType(row._id)">{{ row._id }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="count"
              :label="$t('reports.count')"
              min-width="120"
              align="center"
              sortable
            />
            <el-table-column
              :label="$t('reports.percentage')"
              min-width="130"
              align="center"
            >
              <template #default="{ row }">
                <el-progress
                  :percentage="calculateBookingStatusPercentage(row.count)"
                  :show-text="false"
                />
                <span class="text-xs"
                  >{{ calculateBookingStatusPercentage(row.count) }}%</span
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- Pagination -->
      <div class="pagination mt-6">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="
            (page) => {
              currentPage = page;
              loadData();
            }
          "
          @size-change="
            (size) => {
              pageSize = size;
              loadData();
            }
          "
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { ArrowLeft, Download, DocumentCopy, InfoFilled, Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import reportService from "@/services/reportService";
import { exportToCSV, exportToExcel, printTable } from "@/utils/exportUtils";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";

const { t } = useI18n();
const appStore = useAppStore();
const loading = ref(false);
const activeTab = ref("inventory");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dateRange = ref([]);

const seatInventoryData = ref([]);
const seatTypeData = ref([]);
const seatStatusData = ref([]);
const seatBookingStatusData = ref([]);
const summaryData = ref({
  total_seats: 0,
  booked_seats: 0,
  available_seats: 0,
  occupancy_rate: 0,
  total_inventory_value: 0,
});

const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    };

    if (dateRange.value && dateRange.value.length === 2) {
      params.dateFrom = dayjs(dateRange.value[0]).format("YYYY-MM-DD");
      params.dateTo = dayjs(dateRange.value[1]).format("YYYY-MM-DD");
    }

    const response = await reportService.getInventorySeatManagementReport(
      params
    );
    seatInventoryData.value = response.data.seatInventoryByHall || [];
    seatTypeData.value = response.data.seatTypeDistribution || [];
    seatStatusData.value = response.data.seatStatusBreakdown || [];
    seatBookingStatusData.value = response.data.seatBookingStatus || [];
    summaryData.value = response.data.inventorySummary || {};
    total.value = response.total || 0;
  } catch (error) {
    ElMessage.error(t("reports.failedToLoadData"));
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const calculatePercentage = (count) => {
  const total = seatTypeData.value.reduce((sum, item) => sum + item.count, 0);
  return total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0;
};

const calculateStatusPercentage = (count) => {
  const total = seatStatusData.value.reduce((sum, item) => sum + item.count, 0);
  return total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0;
};

const calculateBookingStatusPercentage = (count) => {
  const total = seatBookingStatusData.value.reduce(
    (sum, item) => sum + item.count,
    0
  );
  return total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0;
};

const getStatusType = (status) => {
  const statusMap = {
    booked: "danger",
    locked: "warning",
    available: "success",
  };
  return statusMap[status] || "info";
};

const getMaintenanceStatusType = (status) => {
  const statusMap = {
    active: "success",
    maintenance: "warning",
    out_of_order: "danger",
    closed: "info",
  };
  return statusMap[status] || "info";
};

const formatMaintenanceStatus = (status) => {
  const statusMap = {
    active: "Active",
    maintenance: "Maintenance",
    out_of_order: "Out of Order",
    closed: "Closed",
  };
  return statusMap[status] || status;
};

const handleExport = (type) => {
  const filename = `${t("reports.inventorySeatManagement")
    .toLowerCase()
    .replace(/\s+/g, "_")}_${dayjs().format("YYYYMMDD")}`;

  // Add date range info to filename if filters are applied
  let dateInfo = "";
  if (dateRange.value && dateRange.value.length === 2) {
    const from = dayjs(dateRange.value[0]).format("YYYYMMDD");
    const to = dayjs(dateRange.value[1]).format("YYYYMMDD");
    dateInfo = `_${from}_to_${to}`;
  }

  const exportFilename = filename + dateInfo;

  if (type === "csv") {
    // Export all data from current tab
    let data = [];
    if (activeTab.value === "inventory") {
      data = seatInventoryData.value.map((item) => ({
        [t("reports.theater")]: item.theater_name,
        [t("reports.hall")]: item.hall_name,
        [t("reports.totalSeats")]: item.total_seats,
        [t("reports.bookedSeats")]: item.booked_seats,
        [t("reports.availableSeats")]: item.available_seats,
        [t("reports.occupancyRate")]: item.occupancy_rate,
      }));
    } else if (activeTab.value === "types") {
      data = seatTypeData.value.map((item) => ({
        [t("reports.seatType")]: item._id,
        [t("reports.totalCount")]: item.count,
        [t("reports.avgPrice")]: item.avg_price?.toFixed(2) || 0,
        [t("reports.totalValue")]: item.total_value?.toFixed(2) || 0,
      }));
    } else if (activeTab.value === "status") {
      data = seatStatusData.value.map((item) => ({
        [t("reports.status")]: formatMaintenanceStatus(item._id),
        [t("reports.count")]: item.count,
      }));
    } else if (activeTab.value === "booking") {
      data = seatBookingStatusData.value.map((item) => ({
        [t("reports.status")]: item._id,
        [t("reports.count")]: item.count,
      }));
    }
    exportToCSV(data, exportFilename);
  } else if (type === "excel") {
    // Export all data from current tab
    let data = [];
    if (activeTab.value === "inventory") {
      data = seatInventoryData.value.map((item) => ({
        [t("reports.theater")]: item.theater_name,
        [t("reports.hall")]: item.hall_name,
        [t("reports.totalSeats")]: item.total_seats,
        [t("reports.bookedSeats")]: item.booked_seats,
        [t("reports.availableSeats")]: item.available_seats,
        [t("reports.occupancyRate")]: item.occupancy_rate,
      }));
    } else if (activeTab.value === "types") {
      data = seatTypeData.value.map((item) => ({
        [t("reports.seatType")]: item._id,
        [t("reports.totalCount")]: item.count,
        [t("reports.avgPrice")]: item.avg_price?.toFixed(2) || 0,
        [t("reports.totalValue")]: item.total_value?.toFixed(2) || 0,
      }));
    } else if (activeTab.value === "status") {
      data = seatStatusData.value.map((item) => ({
        [t("reports.status")]: formatMaintenanceStatus(item._id),
        [t("reports.count")]: item.count,
      }));
    } else if (activeTab.value === "booking") {
      data = seatBookingStatusData.value.map((item) => ({
        [t("reports.status")]: item._id,
        [t("reports.count")]: item.count,
      }));
    }
    exportToExcel(data, exportFilename);
  } else if (type === "pdf") {
    let pdfData = [];
    let columns = [];

    if (activeTab.value === "inventory") {
      pdfData = seatInventoryData.value.map((item) => ({
        theater: item.theater_name,
        hall: item.hall_name,
        total: item.total_seats,
        booked: item.booked_seats,
        available: item.available_seats,
        occupancy: item.occupancy_rate,
      }));
      columns = [
        { header: t("reports.theater"), dataKey: "theater" },
        { header: t("reports.hall"), dataKey: "hall" },
        { header: t("reports.totalSeats"), dataKey: "total" },
        { header: t("reports.bookedSeats"), dataKey: "booked" },
        { header: t("reports.availableSeats"), dataKey: "available" },
        { header: t("reports.occupancyRate"), dataKey: "occupancy" },
      ];
    } else if (activeTab.value === "types") {
      pdfData = seatTypeData.value.map((item) => ({
        type: item._id,
        count: item.count,
        avgPrice: item.avg_price?.toFixed(2) || 0,
        totalValue: item.total_value?.toFixed(2) || 0,
      }));
      columns = [
        { header: t("reports.seatType"), dataKey: "type" },
        { header: t("reports.totalCount"), dataKey: "count" },
        { header: t("reports.avgPrice"), dataKey: "avgPrice" },
        { header: t("reports.totalValue"), dataKey: "totalValue" },
      ];
    } else if (activeTab.value === "status") {
      pdfData = seatStatusData.value.map((item) => ({
        status: formatMaintenanceStatus(item._id),
        count: item.count,
      }));
      columns = [
        { header: t("reports.status"), dataKey: "status" },
        { header: t("reports.count"), dataKey: "count" },
      ];
    } else if (activeTab.value === "booking") {
      pdfData = seatBookingStatusData.value.map((item) => ({
        status: item._id,
        count: item.count,
      }));
      columns = [
        { header: t("reports.status"), dataKey: "status" },
        { header: t("reports.count"), dataKey: "count" },
      ];
    }

    printTable(pdfData, columns, t("reports.inventorySeatManagement"));
  }
};

const resetFilters = () => {
  dateRange.value = [];
  currentPage.value = 1;
  loadData();
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("nav.reportsNav"), path: "/admin/reports" },
    {
      title: t("reports.inventorySeatManagement"),
      path: "/admin/reports/inventory-seat-management",
    },
  ]);
  loadData();
});
</script>

<style scoped>
.inventory-seat-report {
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

.action-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.export-btn {
  transition: all 0.3s ease;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(151, 50, 50, 0.15);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-card {
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--el-border-color-lighter);
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

.pagination {
  display: flex;
  justify-content: flex-end;
}

.info-section {
  border-left: 4px solid #409eff;
}
</style>
