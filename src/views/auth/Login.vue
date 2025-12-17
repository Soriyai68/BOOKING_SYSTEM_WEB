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
            <el-form-item prop="phone">
              <el-input
                v-model="displayPhone"
                :placeholder="$t('auth.phonePlaceholder')"
                size="large"
                :prefix-icon="User"
                @input="formatPhoneNumber"
                maxlength="10"
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
import { toInternationalPhone, toLocalPhone } from "@/utils/formatters";

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
  phone: "", // International format for backend, initialized in onMounted
  password: "superadmin123",
  remember: false,
});
const displayPhone = ref(""); // Local format for display

const validatePhone = (rule, value, callback) => {
  // Validate loginForm.phone (international format)
  if (!value) {
    callback(new Error(t("validation.phoneRequired")));
  } else if (!/^\+855[0-9]{8,9}$/.test(value)) {
    callback(new Error(t("validation.phoneInvalid")));
  } else {
    callback();
  }
};

const loginRules = {
  // Rule applies to loginForm.phone (international), but displayPhone is what user sees
  phone: [{ required: true, validator: validatePhone, trigger: "blur" }],
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
      phone: loginForm.phone,
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

const formatPhoneNumber = (inputValue) => {
  // 1. Clean input for local display (allow non-digits for initial typing, but strip them later)
  let cleanedDisplay = inputValue.replace(/\D/g, '');

  // If user types '855...' directly, convert to local '0' for display consistency
  if (cleanedDisplay.startsWith('855') && cleanedDisplay.length > 3) {
      cleanedDisplay = '0' + cleanedDisplay.substring(3);
  } else if (!cleanedDisplay.startsWith('0') && cleanedDisplay.length > 0 && cleanedDisplay.length < 10) {
      // If user starts typing without 0, prepend 0 for local display consistency
      // But only if it's not too long already (e.g. pasted international number)
      cleanedDisplay = '0' + cleanedDisplay;
  }
  displayPhone.value = cleanedDisplay.substring(0, 10); // Max 10 chars (0 + 9 digits)

  // 2. Update the hidden loginForm.phone with international format
  loginForm.phone = toInternationalPhone(displayPhone.value);
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
  // Initialize loginForm.phone (e.g., from stored user data or a default)
  const initialInternationalPhone = "+85581218840"; // Example initial value
  loginForm.phone = initialInternationalPhone;
  displayPhone.value = toLocalPhone(initialInternationalPhone);

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
