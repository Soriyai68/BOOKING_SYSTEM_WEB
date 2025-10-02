<template>
  <div>
    <h2>Settings</h2>
    <el-card>
      <p>Application settings will be implemented here.</p>
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
    { title: 'Settings', path: '/admin/settings' }
  ])
})
</script>