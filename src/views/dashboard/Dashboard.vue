<template>
  <div class="dashboard">
    <!-- Statistics Cards -->
    <el-row :gutter="24" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon users">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ totalUsers }}</h3>
              <p>Total Users</p>
              <span class="stat-change positive">+12%</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon movies">
              <el-icon><VideoCamera /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ totalMovies }}</h3>
              <p>Total Movies</p>
              <span class="stat-change positive">+5%</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bookings">
              <el-icon><Tickets /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ totalBookings }}</h3>
              <p>Total Bookings</p>
              <span class="stat-change positive">+18%</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon revenue">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <h3>${{ totalRevenue }}</h3>
              <p>Total Revenue</p>
              <span class="stat-change positive">+25%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row> 
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { useI18n } from "vue-i18n";
import {
  User,
  VideoCamera,
  Tickets,
  Money,
  Bell,
} from "@element-plus/icons-vue";
import reportService from "@/services/reportService";

const router = useRouter();
const appStore = useAppStore();

// Reactive data
const loading = ref(false);
const chartPeriod = ref("month");

// Statistics
const totalUsers = ref(0);
const totalMovies = ref(0);
const totalBookings = ref(0);
const totalRevenue = ref(0);

// i18n for translations
const { t } = useI18n();

// Recent activities
const recentActivities = ref([
  { id: 1, text: "New user registered: John Doe", time: "2 minutes ago" },
  { id: 2, text: 'Movie "Avatar 3" was added', time: "1 hour ago" },
  { id: 3, text: "Booking #1234 was confirmed", time: "3 hours ago" },
  { id: 4, text: "User payment processed", time: "5 hours ago" },
  { id: 5, text: "System maintenance completed", time: "1 day ago" },
]);

// Recent bookings
const recentBookings = ref([
  {
    id: 1001,
    user_name: "John Doe",
    movie_title: "Avatar: The Way of Water",
    show_date: "2024-03-15",
    seats: 2,
    total_amount: 25.5,
    status: "confirmed",
  },
  {
    id: 1002,
    user_name: "Jane Smith",
    movie_title: "Top Gun: Maverick",
    show_date: "2024-03-16",
    seats: 1,
    total_amount: 12.75,
    status: "pending",
  },
  {
    id: 1003,
    user_name: "Bob Johnson",
    movie_title: "Black Panther: Wakanda Forever",
    show_date: "2024-03-17",
    seats: 4,
    total_amount: 51.0,
    status: "confirmed",
  },
  {
    id: 1004,
    user_name: "Alice Brown",
    movie_title: "Thor: Love and Thunder",
    show_date: "2024-03-18",
    seats: 3,
    total_amount: 38.25,
    status: "cancelled",
  },
]);

const getStatusType = (status) => {
  switch (status) {
    case "confirmed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "info";
  }
};

const viewBooking = (id) => {
  router.push(`/admin/bookings/${id}`);
};

const loadDashboardData = async () => {
  loading.value = true;
  try {
    const [customersData, bookingsData, revenueData, moviesData] =
      await Promise.all([
        reportService.getTotalCustomers(),
        reportService.getTotalBookings(),
        reportService.getTotalRevenue(),
        reportService.getTotalMovies(),
      ]);

    totalUsers.value = customersData.totalCustomers;
    totalBookings.value = bookingsData.totalBookings;
    totalRevenue.value = revenueData.totalRevenue;
    totalMovies.value = moviesData.totalMovies;
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Set breadcrumbs
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
  ]);

  loadDashboardData();
});
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 24px;
}

.content-row {
  margin-bottom: 24px;
}

.stat-card {
  height: 140px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  margin-right: 16px;
}

.stat-icon.users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.movies {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.bookings {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.stat-info p {
  margin: 0 0 8px 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.stat-change {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 12px;
}

.stat-change.positive {
  background-color: #f0f9ff;
  color: #10b981;
}

.chart-card {
  height: 400px;
}

.activity-card {
  height: 400px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
  color: var(--el-text-color-secondary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-list {
  max-height: 320px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 4px 0;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.activity-time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.table-card {
  margin-top: 24px;
}
</style>
