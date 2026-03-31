<template>
  <div class="reports-management">
    <!-- <div class="header-section mb-8">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
        {{ $t("reports.managementTitle") }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        {{ $t("reports.subheader") }}
      </p>
    </div> -->

    <el-row :gutter="20">
      <el-col
        :xs="24"
        :sm="12"
        :md="8"
        v-for="report in reportsList"
        :key="report.id"
      >
        <el-card
          class="report-card hover-lift"
          shadow="hover"
          @click="navigateToReport(report.path)"
        >
          <div class="report-card-content">
            <div
              class="icon-wrapper"
              :style="{
                backgroundColor: report.color + '20',
                color: report.color,
              }"
            >
              <el-icon :size="32"><component :is="report.icon" /></el-icon>
            </div>
            <div class="report-info">
              <h3 class="report-title">
                {{ $t(report.titleKey) }}
              </h3>
              <p class="report-description text-gray-500 dark:text-gray-400">
                {{ $t(report.descriptionKey) }}
              </p>
            </div>
            <div class="card-footer">
              <el-button type="primary" link>{{
                $t("reports.viewReport")
              }}</el-button>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";
import { usePermissions, PERMISSIONS } from "@/composables/usePermissions";
import {
  Money,
  Tickets,
  VideoCamera,
  User,
  ArrowRight,
  CreditCard,
  Clock,
  DataAnalysis,
  UserFilled,
  Box,
} from "@element-plus/icons-vue";

const router = useRouter();
const { t } = useI18n();
const appStore = useAppStore();
const { hasPermission } = usePermissions();

const allReports = [
  {
    id: "revenue",
    title: "Revenue Report",
    titleKey: "reports.revenueReport",
    description: "Detailed financial data including payments and methods.",
    descriptionKey: "reports.revenueDesc",
    icon: Money,
    color: "#6366f1",
    path: "reports/revenue",
    permission: PERMISSIONS.REPORTS_DETAILED_REVENUE,
  },
  {
    id: "bookings",
    title: "Booking Report",
    titleKey: "reports.bookingReport",
    description: "Track all customer bookings with status and movie details.",
    descriptionKey: "reports.bookingDesc",
    icon: Tickets,
    color: "#10b981",
    path: "reports/bookings",
    permission: PERMISSIONS.REPORTS_DETAILED_BOOKINGS,
  },
  {
    id: "movies",
    title: "Movie Performance",
    titleKey: "reports.moviePerformance",
    description: "Analyze which movies are driving the most revenue.",
    descriptionKey: "reports.movieDesc",
    icon: VideoCamera,
    color: "#f59e0b",
    path: "reports/movies",
    permission: PERMISSIONS.REPORTS_DETAILED_MOVIES,
  },
  {
    id: "frequency",
    title: "Customer Frequency",
    titleKey: "reports.customerFrequency",
    description: "Identify your most loyal customers and their spending.",
    descriptionKey: "reports.frequencyDesc",
    icon: User,
    color: "#ec4899",
    path: "reports/customer-frequency",
    permission: PERMISSIONS.REPORTS_CUSTOMER_FREQUENCY,
  },
  {
    id: "payment-methods",
    title: "Payment Method Analysis",
    titleKey: "reports.paymentMethodAnalysis",
    description: "Analyze payment methods, success rates, and transaction patterns.",
    descriptionKey: "reports.paymentMethodDesc",
    icon: CreditCard,
    color: "#8b5cf6",
    path: "reports/payment-methods",
    permission: PERMISSIONS.REPORTS_PAYMENT_METHOD_ANALYSIS,
  },
  {
    id: "showtimes",
    title: "Showtime Utilization",
    titleKey: "reports.showtimeUtilization",
    description: "Analyze showtime performance, occupancy rates, and revenue per seat.",
    descriptionKey: "reports.showtimeUtilizationDesc",
    icon: Clock,
    color: "#06b6d4",
    path: "reports/showtimes",
    permission: PERMISSIONS.REPORTS_SHOWTIME_UTILIZATION,
  },
  // {
  //   id: "staff-performance",
  //   title: "Staff Performance",
  //   titleKey: "reports.staffPerformance",
  //   description: "Track staff productivity, revenue generation, and booking metrics.",
  //   descriptionKey: "reports.staffPerformanceDesc",
  //   icon: UserFilled,
  //   color: "#f97316",
  //   path: "reports/staff-performance",
  //   permission: PERMISSIONS.REPORTS_STAFF_PERFORMANCE,
  // },
  // {
  //   id: "inventory-seat-management",
  //   title: "Inventory & Seat Management",
  //   titleKey: "reports.inventorySeatManagement",
  //   description: "Analyze seat availability, occupancy rates, and seat type distribution.",
  //   descriptionKey: "reports.inventorySeatManagementDesc",
  //   icon: Box,
  //   color: "#8b5cf6",
  //   path: "reports/inventory-seat-management",
  //   permission: PERMISSIONS.REPORTS_INVENTORY_SEAT_MANAGEMENT,
  // },
];

// Filter reports based on user permissions
const reportsList = computed(() => {
  return allReports.filter((report) => hasPermission(report.permission));
});

const navigateToReport = (path) => {
  router.push(path);
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("nav.reportsNav"), path: "/admin/reports" },
  ]);
});
</script>

<style scoped>
.reports-management {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
}

.report-card {
  height: 100%;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid var(--el-border-color-lighter);
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.report-card-content {
  display: flex;
  flex-direction: column;
  height: 160px;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.report-info {
  flex: 1;
}

.report-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.report-description {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 12px;
  gap: 4px;
}

.arrow-icon {
  font-size: 14px;
  color: var(--el-color-primary);
}

:deep(.el-card__body) {
  padding: 24px;
}
</style>
