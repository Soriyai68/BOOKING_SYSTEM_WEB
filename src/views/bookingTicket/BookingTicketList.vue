<template>
  <div class="booking-ticket-list">
    <div class="page-header">
      <h2>{{ $t("bookingTickets.title") }}</h2>
    </div>

    <el-card class="filter-card" shadow="never">
      <div class="toolbar">
        <el-input
            v-model="searchText"
            :placeholder="$t('bookingTickets.search')"
            class="search-input"
            :prefix-icon="Search"
            clearable
            style="width: 250px"
            @input="debouncedSearch"
        />
        <el-select
            v-model="ticketTypeFilter"
            :placeholder="$t('bookingTickets.filterByTicketType')"
            clearable
            style="width: 250px"
        >
          <el-option :label="$t('table.selectAll')" value=""/>
          <el-option :label="$t('bookingTickets.standard')" value="regular"/>
          <el-option :label="$t('bookingTickets.vip')" value="vip"/>
        </el-select>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table
          :data="bookingTickets"
          v-loading="loading"
          style="width: 100%"
          :empty-text="$t('messages.noData')"
      >
        <el-table-column prop="ticket_code" :label="$t('bookingTickets.ticketCode')" width="180" />
        <el-table-column prop="customer_id.name" :label="$t('bookingTickets.user')" />
        <el-table-column prop="booking_id.reference_code" :label="$t('bookingTickets.bookingId')" />
        <el-table-column prop="showtime_id.movie_id.title" :label="$t('bookingTickets.movie')" />
        <el-table-column prop="seat.seat_number" :label="$t('bookingTickets.seat')" />
        <el-table-column prop="payment_method" :label="$t('bookingTickets.paymentMethod')" />
        <el-table-column prop="issuedAt" :label="$t('bookingTickets.issuedAt')" width="180">
          <template #default="{ row }">
            {{ formatDate(row.issuedAt) }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.actions')" width="120">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="printTicket(row._id)"
            >
              {{ $t('actions.print') }}
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
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { bookingTicketService } from "@/services/bookingTicketService";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { debounce } from "lodash-es";
import { formatDate } from "@/utils/formatters";

const appStore = useAppStore();
const router = useRouter();

const loading = ref(false);
const searchText = ref("");
const ticketTypeFilter = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const bookingTickets = ref([]);
const { t } = useI18n();

const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  loadBookingTickets();
}, 500);

watch([ticketTypeFilter], () => {
  currentPage.value = 1;
  loadBookingTickets();
});

const loadBookingTickets = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchText.value || undefined,
      ticket_type: ticketTypeFilter.value || undefined,
    };

    const response = await bookingTicketService.getBookingTickets(params);
    
    if (response.data) {
      bookingTickets.value = response.data;
      total.value = response.total;
    }
  } catch (error) {
    console.error("Failed to load booking tickets:", error);
    ElMessage.error(t("bookingTickets.load_error"));
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  loadBookingTickets();
};

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  loadBookingTickets();
};

const printTicket = (ticketId) => {
  const routeData = router.resolve({
    name: 'PrintBookingTicket',
    params: { id: ticketId },
  });
  window.open(routeData.href, '_blank');
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("bookingTickets.title"), path: "/admin/booking-tickets" },
  ]);

  loadBookingTickets();
});
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
  color: var(--el-text-color-primary);
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.filter-card {
  margin-bottom: 10px;
}
</style>
