<template>
  <div class="print-ticket-page" v-if="booking">
    <div class="no-print actions-toolbar">
      <el-button type="primary" size="large" @click="handlePrint">
        <el-icon><Printer /></el-icon> Print Ticket
      </el-button>
      <el-button size="large" @click="$router.back()">Back</el-button>
    </div>

    <TicketPreview :booking="booking" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import api from "@/utils/api";
import { Printer } from "@element-plus/icons-vue";
import TicketPreview from "@/components/bookingTicket/TicketPreview.vue";

const route = useRoute();
const booking = ref(null);
const loading = ref(true);

const handlePrint = () => {
  window.print();
};

const loadGroupedTickets = async () => {
  loading.value = true;
  try {
    const response = await api.get("/booking-tickets", {
      params: { bookingId: route.params.id },
    });

    if (response.data?.success && response.data?.data?.tickets?.length > 0) {
      booking.value = response.data.data.tickets[0];
    }
  } catch (error) {
    console.error("Failed to load tickets for printing:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadGroupedTickets();
});
</script>

<style scoped>
.print-ticket-page {
  background: #f5f7fa;
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.actions-toolbar {
  margin-bottom: 30px;
  background: white;
  padding: 15px 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 15px;
}

.ticket-container {
  width: 80mm;
  text-align: center;
  background: white;
  padding: 10px;
  color: black;
  font-family: "Courier New", Courier, monospace;
}

.cinema-name {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.datetime {
  font-size: 14px;
  margin-bottom: 20px;
}

.main-info {
  display: flex;
  justify-content: space-between;
  border-top: 2px solid black;
  border-bottom: 2px solid black;
  padding: 10px 0;
  margin-bottom: 15px;
}

.main-info > div {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 16px;
  font-weight: bold;
}

.value {
  font-size: 32px;
  font-weight: 924px; /* Matches 900+ weight */
}

.details {
  text-align: left;
  font-size: 12px;
  line-height: 1.4;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.movie-title {
  font-size: 14px;
  font-weight: bold;
  margin: 5px 0;
}

.separator {
  border-top: 1px dashed black;
  margin-top: 20px;
}

@media print {
  /* Hide EVERYTHING by default */
  :deep(.el-aside),
  :deep(.el-header),
  .no-print,
  .actions-toolbar {
    display: none !important;
  }

  /* Reset main layout padding/background */
  :deep(.el-main) {
    padding: 0 !important;
    background: white !important;
  }

  /* Force the print-ticket-page to be simple */
  .print-ticket-page {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
  }

  .ticket-container {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }

  @page {
    margin: 0;
    size: auto;
  }
}
</style>
