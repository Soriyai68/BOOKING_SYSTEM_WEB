<template>
  <div>
    <h2>Booking Details</h2>
    <el-card>
      <p>Booking details will be implemented here.</p>
      <p>Booking ID: {{ $route.params.id }}</p>
      <el-button @click="$router.back()">Go Back</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: 'Dashboard', path: '/admin/dashboard' },
    { title: 'Bookings', path: '/admin/bookings' },
    { title: 'Booking Details', path: '#' }
  ])
})
</script>