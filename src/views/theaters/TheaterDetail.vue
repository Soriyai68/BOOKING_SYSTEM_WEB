<template>
  <div class="theater-detail">
    <div class="page-header">
      <h2>{{ $t("theaters.theaterDetails") }}</h2>
      <div>
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t("actions.back") }}
        </el-button>
        <el-button type="primary" @click="goEdit">{{
          $t("actions.edit")
        }}</el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <el-descriptions :title="theater?.display_name" :column="2" border>
        <el-descriptions-item :label="$t('theaters.name')">{{
          theater?.name
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.status')">
          <el-tag>{{ theater?.status_display || theater?.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.address')" :span="2">{{
          theater?.address
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.city')">{{
          theater?.city
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.province')">{{
          theater?.province
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.totalHalls')">{{
          theater?.total_halls
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.totalCapacity')">{{
          theater?.total_capacity
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.features')" :span="2">{{
          (theater?.features || []).join(", ") || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('users.created')">{{
          formatDateTime(theater?.created_at)
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('theaters.notes')" :span="2">{{
          theater?.notes || "-"
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- Halls Management -->
    <el-card class="halls-section">
      <template #header>
        <div class="section-header">
          <span>{{ $t('theaters.halls') }} ({{ halls.length }})</span>
          <el-button type="primary" size="small" @click="goToCreateHall">
            <el-icon><Plus /></el-icon>
            {{ $t('halls.addHall') }}
          </el-button>
        </div>
      </template>
      
      <div v-if="hallsLoading" v-loading="hallsLoading" style="height: 100px;"></div>
      <div v-else-if="halls.length === 0" class="empty-state">
        <el-empty :description="$t('theaters.noHalls')" />
      </div>
      <div v-else>
        <el-table :data="halls" style="width: 100%">
          <el-table-column prop="hall_name" :label="$t('halls.name')" />
          <el-table-column prop="hall_type" :label="$t('halls.type')" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ row.hall_type?.toUpperCase() }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="total_seats" :label="$t('halls.totalSeats')" width="120" />
          <el-table-column prop="status" :label="$t('halls.status')" width="120">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small">{{ row.status_display || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="$t('users.actions')" width="180">
            <template #default="{ row }">
              <el-button size="small" link type="primary" @click="viewHall(row.id)">{{ $t('actions.view') }}</el-button>
              <el-button size="small" link type="primary" @click="editHall(row.id)">{{ $t('actions.edit') }}</el-button>
              <el-button size="small" link type="danger" @click="removeHall(row.id)">{{ $t('actions.remove') }}</el-button>
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
import { hallService } from '@/services/hallService'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const loading = ref(false)
const theater = ref(null)
const halls = ref([])
const hallsLoading = ref(false)

const load = async () => {
  loading.value = true;
  try {
    const data = await theaterService.getTheater(route.params.id)
    theater.value = data
    await loadHalls()
  } finally {
    loading.value = false
  }
}

const loadHalls = async () => {
  hallsLoading.value = true
  try {
    const response = await hallService.getHallsByTheater(route.params.id)
    halls.value = response.data || response.halls || []
  } catch (e) {
    console.error('Failed to load halls:', e)
    ElMessage.error('Failed to load theater halls')
  } finally {
    hallsLoading.value = false
  }
}

const goEdit = () => router.push(`/admin/theaters/${route.params.id}/edit`)
const goToCreateHall = () => router.push(`/admin/halls/create?theater_id=${route.params.id}`)
const viewHall = (id) => router.push(`/admin/halls/${id}`)
const editHall = (id) => router.push(`/admin/halls/${id}/edit`)

const removeHall = async (hallId) => {
  try {
    await ElMessageBox.confirm(
      t('theaters.confirmRemoveHall'),
      t('theaters.removeHall'),
      { type: 'warning', confirmButtonText: t('actions.remove'), cancelButtonText: t('actions.cancel') }
    )
    await theaterService.removeHall(route.params.id, hallId)
    ElMessage.success(t('theaters.hallRemoved'))
    // Reload both theater data and halls to update total_halls count
    await load()
  } catch (err) {
    if (err !== 'cancel') {
      console.error(err)
      ElMessage.error('Failed to remove hall from theater')
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
  await load();
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("theaters.title"), path: "/admin/theaters" },
    { title: t("theaters.theaterDetails"), path: "#" },
  ]);
});
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.halls-section { margin-top: 24px; }
.section-header { display:flex; justify-content:space-between; align-items:center; }
.empty-state { padding: 40px 0; }
</style>
