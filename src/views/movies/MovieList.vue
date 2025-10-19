<template>
  <div class="movie-list">
    <div class="page-header">
      <h2>{{ $t('movies.title') }}</h2>
      <el-button v-permission="'movies.create'" type="primary" @click="$router.push('/admin/movies/create')">
        <el-icon><Plus /></el-icon>
        {{ $t('movies.addMovie') }}
      </el-button>
    </div>

    <el-card>
      <div class="toolbar">
        <el-input 
          v-model="searchText" 
          :placeholder="$t('movies.searchMovies')" 
          class="search-input" 
          :prefix-icon="Search" 
          clearable 
          @input="debouncedSearch" 
        />
        <el-select 
          v-model="statusFilter" 
          :placeholder="$t('movies.filterByStatus')" 
          clearable 
          @change="load"
          class="filter-select"
        >
          <el-option :label="$t('table.selectAll')" value="" />
          <el-option 
            v-for="opt in movieService.MOVIE_STATUSES" 
            :key="opt.value" 
            :label="opt.label" 
            :value="opt.value" 
          />
        </el-select>
        <el-select 
          v-model="genreFilter" 
          :placeholder="$t('movies.filterByGenre')" 
          clearable 
          @change="load"
          class="filter-select"
        >
          <el-option :label="$t('table.selectAll')" value="" />
          <el-option 
            v-for="opt in movieService.MOVIE_GENRES" 
            :key="opt.value" 
            :label="opt.label" 
            :value="opt.value" 
          />
        </el-select>
        <el-select 
          v-model="sortBy" 
          :placeholder="$t('movies.sortBy')" 
          @change="load"
          class="filter-select"
        >
          <el-option 
            v-for="opt in movieService.SORT_OPTIONS" 
            :key="opt.value" 
            :label="opt.label" 
            :value="opt.value" 
          />
        </el-select>
      </div>

      <el-table :data="rows" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" :label="$t('movies.movieTitle')" min-width="200">
          <template #default="{ row }">
            <div class="movie-title-cell">
              <img v-if="row.poster_url" :src="row.poster_url" class="movie-poster-thumb" />
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="director" :label="$t('movies.director')" width="140" />
        <el-table-column prop="genres" :label="$t('movies.genres')" width="180">
          <template #default="{ row }">
            <el-tag 
              v-for="genre in row.genres" 
              :key="genre" 
              size="small" 
              style="margin: 2px"
            >
              {{ $t(`movies.genreTypes.${genre}`) }}
            </el-tag>
            <span v-if="!row.genres || row.genres.length === 0">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="duration_display" :label="$t('movies.duration')" width="100" />
        <el-table-column prop="release_date_formatted" :label="$t('movies.releaseDate')" width="140" />
        <el-table-column prop="rating" :label="$t('movies.rating')" width="100">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled :max="10" style="height: 20px" />
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('movies.status')" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ $t(`movies.statuses.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.actions')" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'movies.view'" size="small" link type="primary" @click="viewMovie(row.id)">
              {{ $t('actions.view') }}
            </el-button>
            <el-button v-permission="'movies.edit'" size="small" link type="primary" @click="editMovie(row.id)">
              {{ $t('actions.edit') }}
            </el-button>
            <el-button v-permission="'movies.delete'" size="small" link type="danger" @click="deleteMovie(row.id)">
              {{ $t('actions.delete') }}
            </el-button>
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
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { movieService } from '@/services/movieService'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'

const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()

const loading = ref(false)
const rows = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchText = ref('')
const statusFilter = ref('')
const genreFilter = ref('')
const sortBy = ref('release_date')

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
      genre: genreFilter.value || undefined,
      sort_by: sortBy.value || 'release_date',
      sort_order: 'desc'
    }
    const res = await movieService.getMovies(params)
    rows.value = res.data
    total.value = res.total || 0
  } catch (e) {
    console.error(e)
    ElMessage.error('Failed to load movies')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (size) => { 
  pageSize.value = size
  currentPage.value = 1
  load() 
}

const handleCurrentChange = (page) => { 
  currentPage.value = page
  load() 
}

const viewMovie = (id) => router.push(`/admin/movies/${id}`)
const editMovie = (id) => router.push(`/admin/movies/${id}/edit`)

const deleteMovie = async (id) => {
  try {
    await ElMessageBox.confirm(
      t('movies.confirmDelete'),
      t('movies.deleteMovie'),
      { type: 'warning' }
    )
    await movieService.deleteMovie(id)
    ElMessage.success(t('movies.deleteSuccess'))
    if (rows.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
    load()
  } catch (err) {
    if (err !== 'cancel') {
      console.error(err)
      ElMessage.error('Failed to delete movie')
    }
  }
}

const getStatusTagType = (status) => {
  switch (status) {
    case 'now_showing': return 'success'
    case 'coming_soon': return 'warning'
    case 'ended': return 'info'
    default: return ''
  }
}

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t('nav.dashboard'), path: '/admin/dashboard' },
    { title: t('movies.title'), path: '/admin/movies' },
    { title: t('movies.allMovies'), path: '/admin/movies' }
  ])
  load()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 280px;
}

.filter-select {
  width: 180px;
}

.movie-title-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.movie-poster-thumb {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
