<template>
  <el-card class="chart-card" shadow="never">
    <template #header>
      <div class="card-header">
        <div class="header-title">
          <el-icon class="header-icon"><VideoCamera /></el-icon>
          <span>{{ $t("dashboard.popularMovies") }}</span>
        </div>
        <el-button
          type="primary"
          link
          @click="$router.push('/reports/movies')"
        >
          {{ $t("reports.viewDetails") }}
        </el-button>
      </div>
    </template>
    <div class="chart-container">
      <v-chart class="chart" :option="chartOption" autoresize />
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { VideoCamera } from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/app";
import reportService from "@/services/reportService";

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
]);

const appStore = useAppStore();
const chartData = ref([]);
const isDark = computed(() => appStore.theme === "dark");

const fetchData = async () => {
  try {
    const response = await reportService.getPopularMoviesReport();
    if (response.success) {
      chartData.value = response.data;
    }
  } catch (error) {
    console.error("Failed to fetch popular movies report:", error);
  }
};

onMounted(fetchData);

const chartOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
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
  xAxis: {
    type: "value",
    splitLine: {
      lineStyle: {
        color: isDark.value ? "#333" : "#f0f0f0",
      },
    },
    axisLabel: {
      color: isDark.value ? "#999" : "#666",
    },
  },
  yAxis: {
    type: "category",
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
  series: [
    {
      name: "Bookings",
      type: "bar",
      barWidth: "60%",
      data: chartData.value.map((item, index) => ({
        value: item.bookings,
        itemStyle: {
          color: ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316"][
            index % 5
          ],
        },
      })),
      itemStyle: {
        borderRadius: [0, 5, 5, 0],
      },
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
