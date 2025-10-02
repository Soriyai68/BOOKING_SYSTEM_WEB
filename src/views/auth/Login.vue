<template>
  <div class="login-container">
    <div class="language-switcher-top">
      <LanguageSwitcher />
    </div>
    <div class="login-box">
      <div class="login-header">
        <el-icon class="login-icon"><Film /></el-icon>
        <h1>{{ $t('auth.loginTitle') }}</h1>
        <p>{{ $t('auth.loginSubtitle') }}</p>
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
            v-model="loginForm.phone"
            :placeholder="$t('auth.phonePlaceholder')"
            size="large"
            :prefix-icon="User"
            @input="formatPhoneNumber"
            maxlength="13"
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
            {{ $t('auth.rememberMe') }}
          </el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%; margin-bottom: 8px;"
          >
            {{ $t('auth.signIn') }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- API Status & Demo credentials -->
      <!-- <div class="demo-info">
        <el-alert
          :title="apiStatus.title"
          :type="apiStatus.type"
          :description="apiStatus.description"
          show-icon
          :closable="false"
        />
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { Film, User, Lock } from '@element-plus/icons-vue'
import api from '@/utils/api'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const loginFormRef = ref()
const loading = ref(false)
const apiStatus = ref({
  title: t('auth.checkingApi'),
  type: 'info',
  description: t('auth.testingConnection')
})

const loginForm = reactive({
  phone: '+85581218840',
  password: 'superadmin123',
  remember: false
})

// Phone number validation for Cambodia (+855)
const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error(t('validation.phoneRequired')))
  } else if (!/^\+855[0-9]{8,9}$/.test(value)) {
    callback(new Error(t('validation.phoneInvalid')))
  } else {
    callback()
  }
}

const loginRules = {
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('validation.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('validation.passwordMin'), trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    // Use the auth store login method which handles both API and demo login
    const result = await authStore.login({
      phone: loginForm.phone,
      password: loginForm.password,
      remember: loginForm.remember
    })
    
    ElMessage.success('Login successful!')
    
    // Log successful login for debugging
    if (import.meta.env.VITE_APP_ENV === 'development') {
      console.log('Login successful, redirecting to dashboard...')
      console.log('User data:', result.user || result)
      console.log('Auth state after login:', {
        isAuthenticated: authStore.isAuthenticated,
        isAdmin: authStore.isAdmin,
        token: !!authStore.token
      })
    }
    
    // Force immediate redirect using multiple methods to ensure it works
    const redirectPath = router.currentRoute.value.query.redirect || '/admin/dashboard'
    console.log('Attempting redirect to:', redirectPath)
    
    try {
      // Method 1: Vue Router replace
      await router.replace(redirectPath)
      // console.log('Router redirect successful')
    } catch (routerError) {
      // console.warn('⚠️ Router redirect failed, using window.location:', routerError)
      // Method 2: Direct browser navigation as fallback
      window.location.href = redirectPath
    }
    
  } catch (error) {
    console.error('Login error:', error)
    
    // Handle different types of errors
    if (error.response) {
      // API error with response
      const status = error.response.status
      const data = error.response.data
      
      switch (status) {
        case 401:
          ElMessage.error(data.message || 'Invalid email or password')
          break
        case 422:
          // Validation errors
          if (data.errors) {
            const firstError = Object.values(data.errors)[0]
            ElMessage.error(Array.isArray(firstError) ? firstError[0] : firstError)
          } else {
            ElMessage.error(data.message || 'Validation failed')
          }
          break
        case 429:
          ElMessage.warning('Too many login attempts. Please try again later.')
          break
        case 500:
          ElMessage.error('Server error. Please try again later.')
          break
        default:
          ElMessage.error(data.message || 'Login failed. Please try again.')
      }
    } else if (error.request) {
      // Network error
      ElMessage.error('Network error. Please check your connection and try again.')
    } else {
      // Other errors
      ElMessage.error('Invalid email or password')
    }
  } finally {
    loading.value = false
  }
}

// Format phone number input
const formatPhoneNumber = (value) => {
  // Remove all non-digit characters except +
  let cleaned = value.replace(/[^+\d]/g, '')
  
  // If it doesn't start with +855, add it
  if (cleaned && !cleaned.startsWith('+855')) {
    if (cleaned.startsWith('855')) {
      cleaned = '+' + cleaned
    } else if (cleaned.startsWith('0')) {
      // Replace leading 0 with +855
      cleaned = '+855' + cleaned.substring(1)
    } else if (!cleaned.startsWith('+')) {
      // Add +855 prefix
      cleaned = '+855' + cleaned
    }
  }
  
  // Update the form value
  loginForm.phone = cleaned
}

// Test API connection on component mount
const checkApiConnection = async () => {
  try {
    // Try a simple health check or any endpoint that doesn't require auth
    await api.get('/health')
    apiStatus.value = {
      title: t('auth.apiConnected'),
      type: 'success',
      description: t('auth.apiCredentials')
    }
  } catch (error) {
    // API not available, show demo mode
    apiStatus.value = {
      title: t('auth.demoMode'),
      type: 'warning',
      description: t('auth.demoCredentials')
    }
  }
}

onMounted(() => {
  checkApiConnection()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
}

.language-switcher-top {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-icon {
  font-size: 48px;
  color: #1890ff;
  margin-bottom: 16px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.login-header p {
  margin: 0;
  color: #606266;
  font-size: 16px;
}

.login-form {
  margin-bottom: 24px;
}

.demo-info {
  margin-top: 24px;
}

:deep(.el-form-item__content) {
  justify-content: space-between;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
  height: 44px;
  font-weight: 500;
}
</style>