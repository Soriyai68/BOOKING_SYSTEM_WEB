<template>
  <div>
    <h2>Movie Management</h2>
    <el-card>
      <p>Movie management interface will be implemented here.</p>
      <el-button type="primary" @click="$router.push('/admin/movies/create')">
        Add Movie
      </el-button>
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
    { title: 'Movies', path: '/admin/movies' }
  ])
})
</script>