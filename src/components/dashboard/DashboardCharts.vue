<template>
  <div class="dashboard-charts">
    <el-row :gutter="24">
      <!-- Revenue Overview Chart -->
      <el-col :xs="24" :lg="16">
        <RevenueChart />
      </el-col>

      <!-- Booking Distribution Chart -->
      <el-col :xs="24" :lg="8">
        <BookingStatusChart />
      </el-col>
    </el-row>

    <el-row :gutter="24" class="secondary-charts">
      <!-- Popular Movies Chart -->
      <el-col :xs="24" :lg="12">
        <PopularMoviesChart />
      </el-col>

      <!-- Seat Type Revenue Chart -->
      <el-col :xs="24" :lg="12">
        <SeatTypeRevenueChart />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import RevenueChart from "./RevenueChart.vue";
import BookingStatusChart from "./BookingStatusChart.vue";
import PopularMoviesChart from "./PopularMoviesChart.vue";
import SeatTypeRevenueChart from "./SeatTypeRevenueChart.vue";
</script>

<style scoped>
.dashboard-charts {
  margin-bottom: 24px;
}

.secondary-charts {
  margin-top: 24px;
}
</style>
