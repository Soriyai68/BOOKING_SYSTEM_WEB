<template>
  <el-card class="chart-card" shadow="never">
    <template #header>
      <div class="card-header">
        <div class="header-title">
          <el-icon class="header-icon"><Money /></el-icon>
          <span>{{ $t("dashboard.revenueOverview") }}</span>
        </div>
        <div class="header-actions">
          <el-radio-group v-model="timeframe" size="small" class="mr-3">
            <el-radio-button label="week">{{
              $t("common.week")
            }}</el-radio-button>
            <el-radio-button label="month">{{
              $t("common.month")
            }}</el-radio-button>
            <el-radio-button label="year">{{
              $t("common.year")
            }}</el-radio-button>
          </el-radio-group>
          <el-button
            type="primary"
            link
            @click="$router.push('/reports/revenue')"
          >
            {{ $t("reports.viewDetails") }}
          </el-button>
        </div>
      </div>
    </template>
    <div class="chart-container">
      <v-chart class="chart" :option="chartOption" autoresize />
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { Money } from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/app";
import * as echarts from "echarts/core";
import reportService from "@/services/reportService";

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

const appStore = useAppStore();
const timeframe = ref("month");
const loading = ref(false);
const chartData = ref([]);
const isDark = computed(() => appStore.theme === "dark");

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await reportService.getRevenueReport(timeframe.value);
    if (response.success) {
      chartData.value = response.data;
    }
  } catch (error) {
    console.error("Failed to fetch revenue report:", error);
  } finally {
    loading.value = false;
  }
};

watch(timeframe, fetchData);

onMounted(fetchData);

const chartOption = computed(() => ({
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
      data: chartData.value.map((item) => item._id),
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
      data: chartData.value.map((item) => item.revenue),
    },
  ],
}));
</script>

<style scoped>
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
