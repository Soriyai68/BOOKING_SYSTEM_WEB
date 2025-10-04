<template>
  <div class="theater-list">
    <div class="page-header">
      <h2>{{ $t('theaters.title') }}</h2>
      <el-button type="primary" @click="$router.push('/admin/theaters/create')">
        <el-icon><Plus /></el-icon>
        {{ $t('theaters.addTheater') }}
      </el-button>
    </div>

    <el-card>
      <div class="toolbar">
        <el-input v-model="searchText" :placeholder="$t('actions.search')" class="search-input" :prefix-icon="Search" clearable @input="debouncedSearch" />
        <el-input v-model="cityFilter" placeholder="City" class="search-input" clearable @input="debouncedSearch" />
        <el-input v-model="provinceFilter" placeholder="Province" class="search-input" clearable @input="debouncedSearch" />
        <el-select v-model="statusFilter" :placeholder="$t('theaters.status')" clearable>
          <el-option :label="$t('table.selectAll')" value="" />
          <el-option v-for="opt in theaterService.STATUS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </div>

      <el-table :data="rows" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" :label="$t('theaters.name')" />
        <el-table-column prop="city" :label="$t('theaters.city')" width="140" />
        <el-table-column prop="province" :label="$t('theaters.province')" width="140" />
        <el-table-column prop="total_screens" :label="$t('theaters.totalScreens')" width="140" />
        <el-table-column prop="total_capacity" :label="$t('theaters.totalCapacity')" width="160" />
        <el-table-column prop="status" :label="$t('theaters.status')" width="140">
          <template #default="{ row }">
            <el-tag size="small">{{ row.status_display || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('users.actions')" width="220">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="viewTheater(row.id)">{{ $t('actions.view') }}</el-button>
            <el-button size="small" link type="primary" @click="editTheater(row.id)">{{ $t('actions.edit') }}</el-button>
            <el-button size="small" link type="danger" @click="deleteTheater(row.id)">{{ $t('actions.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { theaterService } from '@/services/theaterService'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'

const router = useRouter()
const appStore = useAppStore()

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchText = ref('')
const statusFilter = ref('')
const cityFilter = ref('')
const provinceFilter = ref('')

const debouncedSearch = debounce(() => {
  currentPage.value = 1
  load()
}, 500)

const load = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      per_page: pageSize.value,
      search: searchText.value || undefined,
      status: statusFilter.value || undefined,
      city: cityFilter.value || undefined,
      province: provinceFilter.value || undefined,
      sort_by: 'name',
      sort_order: 'asc'
    }
    const res = await theaterService.getTheaters(params)
    rows.value = res.data
    total.value = res.total || 0
  } catch (e) {
    console.error(e)
    ElMessage.error('Failed to load theaters')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (size) => { pageSize.value = size; currentPage.value = 1; load() }
const handleCurrentChange = (page) => { currentPage.value = page; load() }

const viewTheater = (id) => router.push(`/admin/theaters/${id}`)
const editTheater = (id) => router.push(`/admin/theaters/${id}/edit`)

const deleteTheater = async (id) => {
  try {
    await ElMessageBox.confirm('Are you sure you want to delete this theater?', 'Delete Theater', { type: 'warning' })
    await theaterService.deleteTheater(id)
    ElMessage.success('Theater deleted')
    if (rows.value.length === 1 && currentPage.value > 1) currentPage.value--
    load()
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('Failed to delete theater')
  }
}

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: 'Dashboard', path: '/admin/dashboard' },
    { title: 'Theaters', path: '/admin/theaters' }
  ])
  load()
})
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.toolbar { display:flex; gap:12px; margin-bottom:16px; }
.search-input { width:220px; }
.pagination { margin-top:16px; display:flex; justify-content:center; }
</style>
