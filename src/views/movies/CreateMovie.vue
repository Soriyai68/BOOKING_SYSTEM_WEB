<template>
  <div>
    <h2>Add Movie</h2>
    <el-card>
      <p>Add movie form will be implemented here.</p>
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
    { title: 'Movies', path: '/admin/movies' },
    { title: 'Add Movie', path: '/admin/movies/create' }
  ])
})
</script>