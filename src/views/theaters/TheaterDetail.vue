<template>
  <div class="theater-detail">
    <div class="page-header">
      <h2>{{ $t("theaters.theaterDetails") }}</h2>
      <div>
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t("actions.back") }}
        </el-button>
        <el-button v-permission="'theaters.edit'" type="primary" @click="goEdit">{{
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
        <el-descriptions-item :label="$t('theaters.address')" :span="1">{{
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
        <el-descriptions-item :label="$t('theaters.features')" :span="1">{{
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
          <span>{{ $t('theaters.halls') }}({{ halls.length }})</span>
          <el-button v-permission="'halls.create'" type="primary" size="small" @click="openCreateHallDialog">
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
          <el-table-column prop="screen_type" :label="$t('halls.screenType')" width="120">
            <template #default="{ row }">
              <el-tag size="small">{{ row.screen_type?.toUpperCase() }}</el-tag>
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
              <el-button v-permission="'halls.view'" size="small" link type="primary" @click="viewHall(row.id)">{{ $t('actions.view') }}</el-button>
              <el-button v-permission="'halls.edit'" size="small" link type="primary" @click="openEditHallDialog(row.id)">{{ $t('actions.edit') }}</el-button>
              <el-button v-permission="'halls.delete'" size="small" link type="danger" @click="deleteHall(row.id)">{{ $t('actions.delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- Edit Theater Dialog -->
    <EditTheater v-model="showEditDialog" :theater-id="route.params.id" @success="handleEditSuccess" />

    <!-- Create/Edit Hall Dialogs -->
    <CreateHall v-model="showCreateHallDialog" :theater-id="route.params.id" @success="handleHallDialogSuccess" />
    <EditHall v-model="showEditHallDialog" :hall-id="selectedHallId" @success="handleHallDialogSuccess" />
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
import EditTheater from './EditTheater.vue'
import CreateHall from '../halls/CreateHall.vue'
import EditHall from '../halls/EditHall.vue'

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const loading = ref(false)
const theater = ref(null)
const halls = ref([])
const hallsLoading = ref(false)
const showEditDialog = ref(false)

// Hall dialog states
const showCreateHallDialog = ref(false)
const showEditHallDialog = ref(false)
const selectedHallId = ref(null)

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
    halls.value = response.data.halls || []
    console.log("hall count:", halls.value.length)
  } catch (e) {
    console.error('Failed to load halls:', e)
    ElMessage.error('Failed to load theater halls')
  } finally {
    hallsLoading.value = false
  }
}

const goEdit = () => {
  showEditDialog.value = true
}

const handleEditSuccess = async () => {
  await load() // Reload theater data after successful edit
}

const openCreateHallDialog = () => {
  showCreateHallDialog.value = true
}
const openEditHallDialog = (id) => {
  selectedHallId.value = id
  showEditHallDialog.value = true
}
const viewHall = (id) => router.push(`/admin/halls/${id}`)

const deleteHall = async (hallId) => {
  try {
    await ElMessageBox.confirm(
      t('theaters.confirmRemoveHall'),
      t('theaters.removeHall'),
      { type: 'warning', confirmButtonText: t('actions.remove'), cancelButtonText: t('actions.cancel') }
    )
    await hallService.deleteHall(hallId)
    ElMessage.success(t('halls.deleteSuccess'))
    // Reload both theater data and halls to update total_halls count
    await load()
  } catch (err) {
    if (err !== 'cancel') {
      console.error(err)
      ElMessage.error('Failed to remove hall from theater')
    }
  }
}

const handleHallDialogSuccess = async () => {
  // Reload halls after create/update
  await load()
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
