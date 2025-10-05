<template>
  <div class="theater-detail">
    <div class="page-header">
      <h2>{{ $t('theaters.theaterDetails') }}</h2>
      <div>
        <el-button @click="$router.back()">{{ $t('actions.back') }}</el-button>
        <el-button type="primary" @click="goEdit">{{ $t('actions.edit') }}</el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <el-descriptions :title="theater?.display_name" :column="2" border>
        <el-descriptions-item :label="$t('theaters.name')">{{ theater?.name }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.status')">
          <el-tag>{{ theater?.status_display || theater?.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.address')" :span="2">{{ theater?.address }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.city')">{{ theater?.city }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.province')">{{ theater?.province }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.totalScreens')">{{ theater?.total_screens }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.totalCapacity')">{{ theater?.total_capacity }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.features')" :span="2">{{ (theater?.features || []).join(', ') || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="$t('users.created')">{{ formatDateTime(theater?.created_at) }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.notes')" :span="2">{{ theater?.notes || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- Screens Management -->
    <el-card class="screens-section">
      <template #header>
        <div class="section-header">
          <span>{{ $t('theaters.screens') }} ({{ screens.length }})</span>
          <el-button type="primary" size="small" @click="goToCreateScreen">
            <el-icon><Plus /></el-icon>
            {{ $t('screens.addScreen') }}
          </el-button>
        </div>
      </template>
      
      <div v-if="screensLoading" v-loading="screensLoading" style="height: 100px;"></div>
      <div v-else-if="screens.length === 0" class="empty-state">
        <el-empty :description="$t('theaters.noScreens')" />
      </div>
      <div v-else>
        <el-table :data="screens" style="width: 100%">
          <el-table-column prop="screen_name" :label="$t('screens.name')" />
          <el-table-column prop="screen_type" :label="$t('screens.type')" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ row.screen_type?.toUpperCase() }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="total_seats" :label="$t('screens.totalSeats')" width="120" />
          <el-table-column prop="status" :label="$t('screens.status')" width="120">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small">{{ row.status_display || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('users.actions')" width="180">
            <template #default="{ row }">
              <el-button size="small" link type="primary" @click="viewScreen(row.id)">{{ $t('actions.view') }}</el-button>
              <el-button size="small" link type="primary" @click="editScreen(row.id)">{{ $t('actions.edit') }}</el-button>
              <el-button size="small" link type="danger" @click="removeScreen(row.id)">{{ $t('actions.remove') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { theaterService } from '@/services/theaterService'
import { screenService } from '@/services/screenService'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()

const loading = ref(false)
const theater = ref(null)
const screens = ref([])
const screensLoading = ref(false)

const load = async () => {
  loading.value = true
  try {
    const data = await theaterService.getTheater(route.params.id)
    theater.value = data
    await loadScreens()
  } finally {
    loading.value = false
  }
}

const loadScreens = async () => {
  screensLoading.value = true
  try {
    const response = await screenService.getScreensByTheater(route.params.id)
    screens.value = response.data || response.screens || []
  } catch (e) {
    console.error('Failed to load screens:', e)
    ElMessage.error('Failed to load theater screens')
  } finally {
    screensLoading.value = false
  }
}

const goEdit = () => router.push(`/admin/theaters/${route.params.id}/edit`)
const goToCreateScreen = () => router.push(`/admin/screens/create?theater_id=${route.params.id}`)
const viewScreen = (id) => router.push(`/admin/screens/${id}`)
const editScreen = (id) => router.push(`/admin/screens/${id}/edit`)

const removeScreen = async (screenId) => {
  try {
    await ElMessageBox.confirm(
      t('theaters.confirmRemoveScreen'),
      t('theaters.removeScreen'),
      { type: 'warning', confirmButtonText: t('actions.remove'), cancelButtonText: t('actions.cancel') }
    )
    await theaterService.removeScreen(route.params.id, screenId)
    ElMessage.success(t('theaters.screenRemoved'))
    // Reload both theater data and screens to update total_screens count
    await load()
  } catch (err) {
    if (err !== 'cancel') {
      console.error(err)
      ElMessage.error('Failed to remove screen from theater')
    }
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
    { title: t('theaters.title'), path: '/admin/theaters' },
    { title: t('theaters.theaterDetails'), path: '#' }
  ])
})
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.screens-section { margin-top: 24px; }
.section-header { display:flex; justify-content:space-between; align-items:center; }
.empty-state { padding: 40px 0; }
</style>
