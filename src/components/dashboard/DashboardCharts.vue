<template>
  <div class="dashboard-charts">
    <el-row :gutter="24">
      <!-- Revenue Overview Chart -->
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="header-icon"><Money /></el-icon>
                <span>{{
                  $t("dashboard.revenueOverview") || "Revenue Overview"
                }}</span>
              </div>
              <el-radio-group v-model="revenueTimeframe" size="small">
                <el-radio-button label="week">{{
                  $t("common.week") || "Week"
                }}</el-radio-button>
                <el-radio-button label="month">{{
                  $t("common.month") || "Month"
                }}</el-radio-button>
                <el-radio-button label="year">{{
                  $t("common.year") || "Year"
                }}</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="revenueOption" autoresize />
          </div>
        </el-card>
      </el-col>

      <!-- Booking Distribution Chart -->
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="header-icon"><Tickets /></el-icon>
                <span>{{
                  $t("dashboard.bookingStatus") || "Booking Status"
                }}</span>
              </div>
            </div>
          </template>
          <div class="chart-container">
            <v-chart class="chart" :option="statusOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, PieChart, BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { Money, Tickets } from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/app";

// Register ECharts modules
import * as echarts from "echarts/core";
echarts.use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

const appStore = useAppStore();
const revenueTimeframe = ref("month");

const isDark = computed(() => appStore.theme === "dark");

// Revenue Chart Option
const revenueOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
      label: {
        backgroundColor: "#6a7985",
      },
    },
    backgroundColor: isDark.value ? "#1a1a1a" : "#ffffff",
    borderColor: isDark.value ? "#333333" : "#eeeeee",
    textStyle: {
      color: isDark.value ? "#ffffff" : "#333333",
    },
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: [
    {
      type: "category",
      boundaryGap: false,
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisLine: {
        lineStyle: {
          color: isDark.value ? "#555" : "#ddd",
        },
      },
      axisLabel: {
        color: isDark.value ? "#999" : "#666",
      },
    },
  ],
  yAxis: [
    {
      type: "value",
      axisLine: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: isDark.value ? "#333" : "#f0f0f0",
        },
      },
      axisLabel: {
        color: isDark.value ? "#999" : "#666",
      },
    },
  ],
  series: [
    {
      name: "Revenue",
      type: "line",
      stack: "Total",
      smooth: true,
      lineStyle: {
        width: 3,
        color: "#6366f1",
      },
      showSymbol: false,
      areaStyle: {
        opacity: 0.8,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: "rgba(99, 102, 241, 0.3)",
          },
          {
            offset: 1,
            color: "rgba(99, 102, 241, 0)",
          },
        ]),
      },
      emphasis: {
        focus: "series",
      },
      data: [1200, 1320, 1010, 1340, 900, 2300, 2100],
    },
  ],
}));

// Status Pie Chart
const statusOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "item",
    backgroundColor: isDark.value ? "#1a1a1a" : "#ffffff",
    borderColor: isDark.value ? "#333333" : "#eeeeee",
    textStyle: {
      color: isDark.value ? "#ffffff" : "#333333",
    },
  },
  legend: {
    bottom: "0%",
    left: "center",
    textStyle: {
      color: isDark.value ? "#999" : "#666",
    },
  },
  series: [
    {
      name: "Booking Status",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: isDark.value ? "#141414" : "#fff",
        borderWidth: 2,
      },
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 1048, name: "Confirmed", itemStyle: { color: "#10b981" } },
        { value: 735, name: "Pending", itemStyle: { color: "#f59e0b" } },
        { value: 580, name: "Cancelled", itemStyle: { color: "#ef4444" } },
      ],
    },
  ],
}));
</script>

<style scoped>
.dashboard-charts {
  margin-bottom: 24px;
}

.chart-card {
  height: 450px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.header-icon {
  color: var(--el-color-primary);
  font-size: 18px;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-card__body) {
  padding: 20px;
}
</style>
