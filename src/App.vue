<script setup>
import { RouterView } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLoading from '@/components/common/AppLoading.vue'

const authStore = useAuthStore()

// Show loading while auth is initializing
const showLoading = computed(() => !authStore.isInitialized)

// Initialize auth on app start if not already initialized
onMounted(async () => {
  if (!authStore.isInitialized) {
    console.log('🏠 App mounted, initializing auth...')
    await authStore.initializeAuth()
  }
})
</script>

<template>
  <div id="app">
    <!-- Show loading screen during auth initialization -->
    <AppLoading v-if="showLoading" />
    
    <!-- Show app content once auth is initialized -->
    <RouterView v-else />
  </div>
</template>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: #f5f7fa;
}
</style>

