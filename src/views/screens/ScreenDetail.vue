<template>
  <div class="screen-detail">
    <div class="page-header">
      <h2>{{ $t('screens.screenDetails') }}</h2>
      <div>
        <el-button @click="$router.back()">{{ $t('actions.back') }}</el-button>
        <el-button type="primary" @click="goEdit">{{ $t('actions.edit') }}</el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <el-descriptions :title="screen?.display_name" :column="2" border>
        <el-descriptions-item :label="$t('screens.name')">{{ screen?.screen_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('screens.type')">{{ screen?.screen_type?.toUpperCase() }}</el-descriptions-item>
        <el-descriptions-item :label="$t('screens.theater')">{{ screen?.theater_id || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="$t('screens.totalSeats')">{{ screen?.total_seats }}</el-descriptions-item>
        <el-descriptions-item :label="$t('screens.status')">
          <el-tag :type="statusTagType(screen?.status)">{{ screen?.status_display || screen?.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('users.created')">{{ formatDateTime(screen?.created_at) }}</el-descriptions-item>
        <el-descriptions-item :label="$t('screens.notes')" :span="2">{{ screen?.notes || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { screenService } from '@/services/screenService'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()

const loading = ref(false)
const screen = ref(null)

const load = async () => {
  loading.value = true
  try {
    const data = await screenService.getScreen(route.params.id)
    screen.value = data
  } finally {
    loading.value = false
  }
}

const goEdit = () => router.push(`/admin/screens/${route.params.id}/edit`)

const statusTagType = (status) => {
  switch (status) {
    case 'active': return 'success'
    case 'maintenance': return 'warning'
    case 'closed': return 'danger'
    case 'renovation': return 'info'
    default: return ''
  }
}

const formatDateTime = (str) => (str ? new Date(str).toLocaleString() : '-')

onMounted(async () => {
  await load()
  appStore.setBreadcrumbs([
    { title: t('nav.dashboard'), path: '/admin/dashboard' },
    { title: t('screens.title'), path: '/admin/screens' },
    { title: t('screens.screenDetails'), path: '#' }
  ])
})
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
</style>