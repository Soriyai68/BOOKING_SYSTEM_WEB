<template>
  <div class="login-page">
    <div class="header-controls">
      <LanguageSwitcher />
      <el-button :icon="isDark ? Sunny : Moon" @click="toggleDark()" text circle />
    </div>
    <div class="login-wrapper">
      <div class="login-branding">
        <div class="branding-content">
          <el-icon class="branding-icon"><Film /></el-icon>
          <h2 class="branding-title">{{ $t("auth.brandingTitle") }}</h2>
          <p class="branding-description">
            {{ $t("auth.brandingSubtitle") }}
          </p>
        </div>
      </div>
      <div class="login-container">
        <div class="login-box">
          <div class="login-header">
            <h1>{{ $t("auth.loginTitle") }}</h1>
            <p>{{ $t("auth.loginSubtitle") }}</p>
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-width="0"
            class="login-form"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                :placeholder="$t('auth.usernamePlaceholder')"
                size="large"
                :prefix-icon="User"
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                :placeholder="$t('auth.passwordPlaceholder')"
                size="large"
                :prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <el-form-item>
              <el-checkbox v-model="loginForm.remember">
                {{ $t("auth.rememberMe") }}
              </el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                @click="handleLogin"
                class="login-button"
              >
                {{ $t("auth.signIn") }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { useDark, useToggle } from "@vueuse/core";
import { useAuthStore } from "@/stores/auth";
import { Film, User, Lock, Sunny, Moon } from "@element-plus/icons-vue";
import api from "@/utils/api";
import LanguageSwitcher from "@/components/common/LanguageSwitcher.vue";

const isDark = useDark();
const toggleDark = useToggle(isDark);

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const loginFormRef = ref();
const loading = ref(false);
const apiStatus = ref({
  title: t("auth.checkingApi"),
  type: "info",
  description: t("auth.testingConnection"),
});

const loginForm = reactive({
  username: "superadmin",
  password: "superadmin123",
  remember: false,
});

const loginRules = {
  username: [
    {
      required: true,
      message: t("validation.usernameRequired"),
      trigger: "blur",
    },
    { min: 2, message: t("validation.usernameMin"), trigger: "blur" },
  ],
  password: [
    {
      required: true,
      message: t("validation.passwordRequired"),
      trigger: "blur",
    },
    { min: 6, message: t("validation.passwordMin"), trigger: "blur" },
  ],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    // Ensure validation runs on loginForm.phone (international)
    await loginFormRef.value.validate();
    loading.value = true;

    await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
      remember: loginForm.remember,
    });

    ElMessage.success("Login successful!");

    const redirectPath =
      router.currentRoute.value.query.redirect || "/admin/dashboard";

    try {
      await router.replace(redirectPath);
    } catch {
      window.location.href = redirectPath;
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          ElMessage.error(data.message || "Invalid email or password");
          break;
        case 422:
          if (data.errors) {
            const firstError = Object.values(data.errors)[0];
            ElMessage.error(
              Array.isArray(firstError) ? firstError[0] : firstError
            );
          } else {
            ElMessage.error(data.message || "Validation failed");
          }
          break;
        case 429:
          ElMessage.warning("Too many login attempts. Please try again later.");
          break;
        case 500:
          ElMessage.error("Server error. Please try again later.");
          break;
        default:
          ElMessage.error(data.message || "Login failed. Please try again.");
      }
    } else if (error.request) {
      ElMessage.error(
        "Network error. Please check your connection and try again."
      );
    } else {
      ElMessage.error("Invalid email or password");
    }
  } finally {
    loading.value = false;
  }
};


const checkApiConnection = async () => {
  try {
    await api.get("/health");
    apiStatus.value = {
      title: t("auth.apiConnected"),
      type: "success",
      description: t("auth.apiCredentials"),
    };
  } catch {
    apiStatus.value = {
      title: t("auth.demoMode"),
      type: "warning",
      description: t("auth.demoCredentials"),
    };
  }
};

onMounted(() => {
  checkApiConnection();
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  position: relative;
  background-color: var(--bg-color-secondary);
  transition: background-color 0.3s;
}

.header-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-color-primary);
}

.login-wrapper {
  display: flex;
  min-height: 100vh;
}

.login-branding {
  width: 50%;
  background-image: url("@/assets/ek.jpg");
  background-size: cover;
  background-position: center;
  color: white; /* Text is always white on this side */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  position: relative;
}

.login-branding::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6); /* Dark overlay */
  transition: background-color 0.3s;
}

:global(html.dark) .login-branding::before {
  background: rgba(0, 0, 0, 0.8); /* Even darker overlay in dark mode */
}

.branding-content {
  max-width: 450px;
  position: relative;
}

.branding-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.branding-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.branding-description {
  font-size: 18px;
  line-height: 1.6;
  opacity: 0.9;
}

.login-container {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: var(--bg-color-primary);
  border-radius: 12px;
  padding: 48px;
  box-shadow: 0 10px 30px var(--shadow-color);
  transition: background-color 0.3s, box-shadow 0.3s;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color-primary);
}

.login-header p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 16px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-weight: 500;
}

:deep(.el-checkbox__label) {
  color: var(--text-color-secondary);
}

/* Responsive Design */
@media (max-width: 992px) {
  .login-branding {
    display: none;
  }
  .login-container {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .login-box {
    padding: 32px;
    box-shadow: none;
    border-radius: 0;
    background: transparent;
  }
  .login-container {
    padding: 20px;
  }
  .login-page {
    background: var(--bg-color-primary);
  }
}

/* Element Plus Overrides */
:deep(.el-form-item__content) {
  justify-content: space-between;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 4px 15px;
}

:deep(.el-button) {
  border-radius: 8px;
}
</style>
