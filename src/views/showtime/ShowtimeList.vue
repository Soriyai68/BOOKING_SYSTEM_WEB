<template>
  <div class="showtime-list">
    <div class="page-header">
      <h2>{{ $t("showtimes.title") }}</h2>
      <el-button
        type="primary"
        @click="$router.push('/admin/showtimes/create')"
      >
        <el-icon><Plus /></el-icon>
        {{ $t("showtimes.addShowtime") }}
      </el-button>
    </div>

    <el-card>
      <div class="toolbar">
        <el-input
          v-model="searchText"
          :placeholder="$t('showtimes.searchShowtimes')"
          class="search-input"
          :prefix-icon="Search"
          clearable
          @input="debouncedSearch"
        />
        <el-select
          v-model="statusFilter"
          :placeholder="$t('showtimes.filterByStatus')"
          clearable
        >
          <el-option :label="$t('table.selectAll')" value="" />
          <el-option
            v-for="status in showtimeService.STATUS_OPTIONS"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </div>

      <el-table
        :data="showtimesWithTime"
        v-loading="loading"
        style="width: 100%"
        :empty-text="$t('messages.noData')"
      >
        <el-table-column :label="$t('showtimes.movie')" width="250">
          <template #default="{ row }">
            <div style="display: flex; align-items: center">
              <el-image
                :src="row.movie_poster"
                fit="cover"
                style="
                  width: 50px;
                  height: 75px;
                  border-radius: 4px;
                  margin-right: 10px;
                "
              />
              <span>{{ row.movie_title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('showtimes.theater')" prop="theater_name" />
        <el-table-column :label="$t('showtimes.hall')" prop="hall_name" />
        <el-table-column
          prop="start_time"
          :label="$t('showtimes.startTime')"
          width="180"
        >
          <template #default="{ row }">
            {{
              new Date(row.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="end_time"
          :label="$t('showtimes.endTime')"
          width="180"
        >
          <template #default="{ row }">
            {{
              new Date(row.end_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          :label="$t('showtimes.status')"
          width="140"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ $t(`showtimes.statuses.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('showtimes.actions')" width="200">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="viewShowtime(row.id)"
            >
              {{ $t("showtimes.view") }}
            </el-button>
            <el-button
              type="primary"
              size="small"
              link
              @click="editShowtime(row.id)"
            >
              {{ $t("showtimes.edit") }}
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="deleteShowtime(row.id)"
            >
              {{ $t("showtimes.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :small="false"
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
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { showtimeService } from "@/services/showtimeService";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { debounce } from "lodash-es";

const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const loading = ref(false);
const searchText = ref("");
const statusFilter = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const showtimes = ref([]);

const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  loadShowtimes();
}, 500);

watch([statusFilter], () => {
  currentPage.value = 1;
  loadShowtimes();
});

const loadShowtimes = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      per_page: pageSize.value,
      search: searchText.value || undefined,
      status: statusFilter.value || undefined,
    };
    const response = await showtimeService.getShowtimes(params);
    if (response.data) {
      showtimes.value = response.data;
      total.value = response.total;
    }
    console.log("showtime data:", showtimes.value);
  } catch (error) {
    console.error("Failed to load showtimes:", error);
    ElMessage.error(t("showtimes.loadFailed"));
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  loadShowtimes();
};

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  loadShowtimes();
};

const viewShowtime = (id) => {
  router.push(`/admin/showtimes/${id}`);
};

const editShowtime = (id) => {
  router.push(`/admin/showtimes/${id}/edit`);
};

const deleteShowtime = async (id) => {
  try {
    await ElMessageBox.confirm(
      t("showtimes.deleteConfirm"),
      t("showtimes.deleteTitle"),
      {
        confirmButtonText: t("actions.delete"),
        cancelButtonText: t("actions.cancel"),
        type: "warning",
      }
    );
    await showtimeService.deleteShowtime(id);
    ElMessage.success(t("showtimes.deleteSuccess"));
    loadShowtimes();
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to delete showtime:", error);
      ElMessage.error(t("showtimes.deleteFailed"));
    }
  }
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "-";
  return new Date(dateTimeString).toLocaleString();
};

const getStatusTagType = (status) => {
  switch (status) {
    case "scheduled":
      return "primary";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "info";
  }
};

const showtimesWithTime = computed(() => {
  return showtimes.value.map((s) => ({
    ...s,
    start_time_only: s.start_time
      ? new Date(s.start_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
    end_time_only: s.end_time
      ? new Date(s.end_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
  }));
});
onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("showtimes.title"), path: "/admin/showtimes" },
  ]);
  loadShowtimes();
});
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
  gap: 16px;
  margin-bottom: 16px;
}
.search-input {
  width: 300px;
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
