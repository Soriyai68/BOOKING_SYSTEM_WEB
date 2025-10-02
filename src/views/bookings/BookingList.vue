<template>
  <div>
    <h2>Booking Management</h2>
    <el-card>
      <p>Booking management interface will be implemented here.</p>
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
    { title: 'Bookings', path: '/admin/bookings' }
  ])
})
</script>