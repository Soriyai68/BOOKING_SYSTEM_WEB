<template>
  <div class="create-user">
    <div class="page-header">
      <h2>{{ $t('users.createUser') }}</h2>
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        {{ $t('actions.back') }}
      </el-button>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item :label="$t('users.name')" prop="name">
          <el-input
            v-model="form.name"
            :placeholder="$t('users.name')"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="$t('users.phone')" prop="phone">
          <el-input
            v-model="form.phone"
            :placeholder="$t('auth.phonePlaceholder')"
            @input="formatPhoneNumber"
            maxlength="13"
          />
        </el-form-item>

        <el-form-item :label="$t('users.role')" prop="role">
          <el-select v-model="form.role" :placeholder="$t('users.role')" style="width: 100%">
            <el-option :label="$t('users.cashier')" value="cashier" />
            <el-option :label="$t('users.admin')" value="admin"/>
            <el-option :label="$t('users.superadmin')" value="superadmin" v-if="authStore.isSuperAdmin" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('auth.password')" prop="password" v-if="form.role === 'admin' || form.role === 'superadmin' || form.role === 'cashier' ">
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="$t('auth.password')"
            show-password
          />
        </el-form-item>

        <el-form-item :label="$t('users.status')" prop="isActive">
          <el-switch
            v-model="form.isActive"
            :active-text="$t('users.active')"
            :inactive-text="$t('users.inactive')"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            {{ $t('users.createUser') }}
          </el-button>
          <el-button @click="resetForm">
            {{ $t('actions.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const { t } = useI18n()

const formRef = ref()
const loading = ref(false)

const form = reactive({
  name: '',
  phone: '',
  role: 'user',
  password: '',
  isActive: true,
  isVerified: true
})

// Phone number validation
const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error(t('validation.phoneRequired')))
  } else if (!/^\+855[0-9]{8,9}$/.test(value)) {
    callback(new Error(t('validation.phoneInvalid')))
  } else {
    callback()
  }
}

// Password validation for admin roles
const validatePassword = (rule, value, callback) => {
  if ((form.role === 'admin' || form.role === 'superadmin') && !value) {
    callback(new Error(t('validation.passwordRequired')))
  } else if (value && value.length < 6) {
    callback(new Error(t('validation.passwordMin')))
  } else {
    callback()
  }
}

const rules = {
  name: [
    { required: true, message: t('validation.required'), trigger: 'blur' },
    { min: 2, max: 50, message: 'Name must be between 2 and 50 characters', trigger: 'blur' }
  ],
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  role: [{ required: true, message: t('validation.required'), trigger: 'change' }],
  password: [{ validator: validatePassword, trigger: 'blur' }]
}

// Format phone number
const formatPhoneNumber = (value) => {
  let cleaned = value.replace(/[^+\d]/g, '')

  if (cleaned && !cleaned.startsWith('+855')) {
    if (cleaned.startsWith('855')) {
      cleaned = '+' + cleaned
    } else if (cleaned.startsWith('0')) {
      cleaned = '+855' + cleaned.substring(1)
    } else if (!cleaned.startsWith('+')) {
      cleaned = '+855' + cleaned
    }
  }
  form.phone = cleaned
}

// Submit form
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true

    await userService.createUser(form)
    
    ElMessage.success(t('users.createSuccess') || 'User created successfully')
    router.push('/admin/users')
  } catch (error) {
    console.error('Create user error:', error)
    
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('Failed to create user')
    }
  } finally {
    loading.value = false
  }
}

// Reset form
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    name: '',
    phone: '',
    role: 'Cashier',
    password: '',
    isActive: true,
    isVerified: true
  })
}

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t('nav.dashboard'), path: '/admin/dashboard' },
    { title: t('users.title'), path: '/admin/users' },
    { title: t('users.createUser'), path: '/admin/users/create' }
  ])
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.el-form {
  max-width: 600px;
}

.el-form-item__label {
  font-weight: 500;
}
</style>
