<template>
  <el-card class="chart-card" shadow="never">
    <template #header>
      <div class="card-header">
        <div class="header-title">
          <el-icon class="header-icon"><Money /></el-icon>
          <span>{{ $t("dashboard.seatTypeRevenue") }}</span>
        </div>
      </div>
    </template>
    <div class="chart-container">
      <v-chart class="chart" :option="chartOption" autoresize />
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { Money } from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/app";
import reportService from "@/services/reportService";

use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

const appStore = useAppStore();
const { t } = useI18n();
const chartData = ref([]);
const isDark = computed(() => appStore.theme === "dark");

const fetchData = async () => {
  try {
    const response = await reportService.getSeatTypeRevenueReport();
    if (response.success) {
      chartData.value = response.data.map((item, index) => ({
        name:
          item._id.charAt(0).toUpperCase() + item._id.slice(1).toLowerCase(),
        value: item.revenue,
        itemStyle: {
          color: ["#6366f1", "#f59e0b", "#ec4899", "#10b981"][index % 4],
        },
      }));
      console.log(chartData.value);
    }
  } catch (error) {
    console.error("Failed to fetch seat type revenue report:", error);
  }
};

onMounted(fetchData);

const chartOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b}: ${c} ({d}%)",
    backgroundColor: isDark.value ? "#1a1a1a" : "#ffffff",
    borderColor: isDark.value ? "#333333" : "#eeeeee",
    textStyle: {
      color: isDark.value ? "#ffffff" : "#333333",
    },
  },
  legend: {
    orient: "vertical",
    left: "left",
    textStyle: {
      color: isDark.value ? "#999" : "#666",
    },
  },
  series: [
    {
      name: t("dashboard.seatTypeRevenue"),
      type: "pie",
      radius: "60%",
      data: chartData.value,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
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
