<script setup>
import { RouterView } from "vue-router";
import { computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { usePermissionStore } from "@/stores/permission";
import AppLoading from "@/components/common/AppLoading.vue";

const authStore = useAuthStore();
const permissionStore = usePermissionStore();

// Show loading while auth is initializing
const showLoading = computed(() => !authStore.isInitialized);

// Initialize auth and permissions on app start
onMounted(async () => {
  if (!authStore.isInitialized) {
    console.log("🏠 App mounted, initializing auth...");
    await authStore.initializeAuth();
    
    // Initialize permissions after auth is initialized
    if (authStore.isAuthenticated) {
      console.log("🔐 Initializing permissions...");
      await permissionStore.initializePermissions();
    }
  }
});
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
/* Inter for English */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
/*Siemreap for Khmer */
@import url("https://fonts.googleapis.com/css2?family=Siemreap&display=swap");
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Inter", "Siemreap", sans-serif;
}
body {
  margin: 0;
  background-color: #f5f7fa;
}
</style>
