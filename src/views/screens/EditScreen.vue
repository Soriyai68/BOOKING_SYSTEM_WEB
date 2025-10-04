<template>
  <div class="edit-screen">
    <div class="page-header">
      <h2>{{ $t('screens.editScreen') }}</h2>
      <el-button @click="$router.back()"><el-icon><ArrowLeft /></el-icon>{{ $t('actions.back') }}</el-button>
    </div>

    <el-card v-loading="pageLoading">
      <div v-if="loadError" class="error-state">
        <el-result icon="error" :title="$t('messages.error')" :sub-title="loadError">
          <template #extra>
            <el-button type="primary" @click="load">{{ $t('actions.refresh') }}</el-button>
            <el-button @click="$router.back()">{{ $t('actions.back') }}</el-button>
          </template>
        </el-result>
      </div>

      <el-form v-else ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item :label="$t('screens.name')" prop="screen_name">
          <el-input v-model="form.screen_name" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item :label="$t('screens.theater')" prop="theater_id">
          <el-input v-model="form.theater_id" />
        </el-form-item>

        <el-form-item :label="$t('screens.type')" prop="screen_type">
          <el-select v-model="form.screen_type" style="width:100%">
            <el-option v-for="opt in screenService.SCREEN_TYPES" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('screens.totalSeats')" prop="total_seats">
          <el-input-number v-model="form.total_seats" :min="1" :max="1000" />
        </el-form-item>

        <el-form-item :label="$t('screens.status')" prop="status">
          <el-select v-model="form.status" style="width:100%">
            <el-option v-for="opt in screenService.SCREEN_STATUSES" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('screens.notes')" prop="notes">
          <el-input v-model="form.notes" type="textarea" :rows="3" maxlength="1000" show-word-limit />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('screens.updateScreen') }}</el-button>
          <el-button @click="resetForm">{{ $t('actions.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { screenService } from '@/services/screenService'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()

const formRef = ref()
const loading = ref(false)
const pageLoading = ref(false)
const loadError = ref('')

const original = ref(null)

const form = reactive({
  screen_name: '',
  theater_id: '',
  screen_type: 'standard',
  total_seats: 1,
  status: 'active',
  notes: ''
})

const rules = {
  screen_name: [{ required: true, message: t('validation.required'), trigger: 'blur' }],
  total_seats: [{ required: true, message: t('validation.required'), trigger: 'change' }]
}

const load = async () => {
  pageLoading.value = true
  loadError.value = ''
  try {
    const data = await screenService.getScreen(route.params.id)
    original.value = data
    Object.assign(form, {
      screen_name: data.screen_name,
      theater_id: data.theater_id || '',
      screen_type: data.screen_type || 'standard',
      total_seats: data.total_seats || 1,
      status: data.status || 'active',
      notes: data.notes || ''
    })
  } catch (e) {
    console.error(e)
    loadError.value = e?.response?.data?.message || 'Failed to load screen'
  } finally {
    pageLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    loading.value = true
    await screenService.updateScreen(route.params.id, form)
    ElMessage.success(t('screens.updateSuccess'))
    router.push('/admin/screens')
  } catch (e) {
    console.error(e)
    if (e?.response?.data?.message) ElMessage.error(e.response.data.message)
    else ElMessage.error('Failed to update screen')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  if (!original.value) return
  Object.assign(form, {
    screen_name: original.value.screen_name,
    theater_id: original.value.theater_id || '',
    screen_type: original.value.screen_type || 'standard',
    total_seats: original.value.total_seats || 1,
    status: original.value.status || 'active',
    notes: original.value.notes || ''
  })
  if (formRef.value) formRef.value.clearValidate()
}

onMounted(async () => {
  await load()
  appStore.setBreadcrumbs([
    { title: t('nav.dashboard'), path: '/admin/dashboard' },
    { title: t('screens.title'), path: '/admin/screens' },
    { title: t('screens.editScreen'), path: '#' }
  ])
})
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.error-state { text-align:center; padding:40px 20px; }
.el-form { max-width: 640px; }
</style>