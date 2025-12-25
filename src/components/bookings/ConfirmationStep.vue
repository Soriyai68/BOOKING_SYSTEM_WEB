<template>
  <div class="step-content">
    <el-descriptions :title="$t('bookings.bookingSummary')" :column="2" border>
      <el-descriptions-item :label="$t('showtimes.movie')">{{ bookingSummary.movie }}</el-descriptions-item>
      <el-descriptions-item :label="$t('showtimes.hall')">{{ bookingSummary.hall }}</el-descriptions-item>
      <el-descriptions-item :label="$t('showtimes.showDate')">{{ bookingSummary.showDate }}</el-descriptions-item>
      <el-descriptions-item :label="$t('showtimes.startTime')">{{ bookingSummary.startTime }}</el-descriptions-item>
      <el-descriptions-item :label="$t('seats.title')">{{ bookingSummary.seats }}</el-descriptions-item>
      <el-descriptions-item :label="$t('bookings.totalPrice')">
        <span style="font-weight: bold; color: var(--primary-color)">{{ formatCurrency(bookingSummary.totalPrice) }}</span>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup>
import { formatCurrency } from "@/utils/formatters";

defineProps({
  bookingSummary: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.step-content {
  margin: 20px 0;
  padding: 0 40px;
}
</style>
