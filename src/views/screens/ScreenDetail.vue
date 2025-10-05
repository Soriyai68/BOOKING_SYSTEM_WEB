<template>
  <div class="screen-detail">
    <div class="page-header">
      <h2>{{ $t('screens.screenDetails') }}</h2>
      <div>
        <el-button @click="$router.back()">{{ $t('actions.back') }}</el-button>
        <el-button type="primary" @click="goEdit">{{ $t('actions.edit') }}</el-button>
      </div>
    </div>

    <!-- Theater Context -->
    <el-card v-if="theater" class="theater-context">
      <template #header>
        <div class="context-header">
          <span>{{ $t('screens.belongsToTheater') }}</span>
          <el-button size="small" @click="goToTheater">
            <el-icon><ArrowRight /></el-icon>
            {{ $t('actions.view') }} {{ $t('theaters.title') }}
          </el-button>
        </div>
      </template>
      <el-descriptions :column="3" size="small">
        <el-descriptions-item :label="$t('theaters.name')">{{ theater.name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.city')">{{ theater.city }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.status')">
          <el-tag size="small">{{ theater.status_display || theater.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card v-loading="loading">
      <el-descriptions :title="screen?.display_name" :column="2" border>
        <el-descriptions-item :label="$t('screens.name')">{{ screen?.screen_name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('screens.type')">{{ screen?.screen_type?.toUpperCase() }}</el-descriptions-item>
        <el-descriptions-item :label="$t('screens.theater')">
          <span v-if="theater" class="theater-link" @click="goToTheater">{{ theater.name }}</span>
          <span v-else>{{ screen?.theater_id || '-' }}</span>
        </el-descriptions-item>
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
import { theaterService } from '@/services/theaterService'
import { ArrowRight } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()

const loading = ref(false)
const screen = ref(null)
const theater = ref(null)

const load = async () => {
  loading.value = true
  try {
    const data = await screenService.getScreen(route.params.id)
    screen.value = data
    
    // Load theater information if theater_id exists
    if (data.theater_id) {
      try {
        const theaterData = await theaterService.getTheater(data.theater_id)
        theater.value = theaterData
      } catch (e) {
        console.warn('Failed to load theater:', e)
      }
    }
  } finally {
    loading.value = false
  }
}

const goEdit = () => router.push(`/admin/screens/${route.params.id}/edit`)
const goToTheater = () => {
  if (theater.value) {
    router.push(`/admin/theaters/${theater.value.id}`)
  }
}

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
.theater-context { margin-bottom: 24px; }
.context-header { display:flex; justify-content:space-between; align-items:center; }
.theater-link { color: var(--el-color-primary); cursor: pointer; }
.theater-link:hover { text-decoration: underline; }
</style>
