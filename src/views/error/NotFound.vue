<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>Page Not Found</h1>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <el-button type="primary" @click="goToDashboard">
        {{ buttonText }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { usePath } from "@/composables/usePath";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const { getAdminPath } = usePath();
const authStore = useAuthStore();

const isCustomer = computed(() => {
  return (
    authStore.user &&
    ("customerType" in authStore.user || !("role" in authStore.user))
  );
});
const buttonText = computed(() =>
  isCustomer.value ? "Go to Home" : "Go to Dashboard",
);

const goToDashboard = () => {
  if (authStore.isAuthenticated) {
    if (isCustomer.value) {
      router.push("/layout");
    } else {
      router.push(getAdminPath("/dashboard"));
    }
  } else {
    // If not authenticated, determine context by subdomain
    const ADMIN_SUBDOMAIN = "admin";
    const IS_ADMIN_APP = window.location.hostname.startsWith(
      `${ADMIN_SUBDOMAIN}.`,
    );
    if (IS_ADMIN_APP) {
      router.push("/login");
    } else {
      router.push({ name: "Login Page" });
    }
  }
};
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.not-found-content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #e6a23c;
  margin-bottom: 16px;
}

h1 {
  font-size: 32px;
  margin-bottom: 16px;
  color: #303133;
}

p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 24px;
}
</style>
