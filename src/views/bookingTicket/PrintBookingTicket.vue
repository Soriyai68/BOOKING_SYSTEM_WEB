<template>
  <div class="print-ticket-container">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="40">
        <Loader2 />
      </el-icon>
      <p>{{ $t("messages.loading") }}</p>
    </div>

    <div v-else-if="ticket" class="ticket-wrapper">
      <!-- Cinema Ticket Design -->
      <div class="cinema-ticket">
        <!-- Left Section - Main Info -->
        <div class="ticket-main">
          <div class="ticket-header">
            <div class="cinema-logo">
              <Film :size="32" />
              <span class="cinema-name">CINEMA</span>
            </div>
            <div class="ticket-code">
              <Barcode :size="20" />
              <span>{{ ticket.ticket_code }}</span>
            </div>
          </div>

          <div class="movie-info">
            <h1 class="movie-title">{{ ticket.showtime_id?.movie_id?.title }}</h1>
            <div class="movie-meta">
              <span class="genre">{{ ticket.showtime_id?.movie_id?.genre }}</span>
              <span class="rating">{{ ticket.showtime_id?.movie_id?.rating }}</span>
              <span class="duration" v-if="ticket.showtime_id?.movie_id?.duration_minutes">
                {{ ticket.showtime_id?.movie_id?.duration_minutes }} min
              </span>
            </div>
          </div>

          <div class="ticket-details">
            <div class="detail-row">
              <div class="detail-item">
                <Calendar :size="18" />
                <div>
                  <span class="label">{{ $t("bookingTickets.date") }}</span>
                  <span class="value">{{ formatDate(ticket.showtime_id?.show_date) }}</span>
                </div>
              </div>
              <div class="detail-item">
                <Clock :size="18" />
                <div>
                  <span class="label">{{ $t("bookingTickets.time") }}</span>
                  <span class="value">{{ ticket.showtime_id?.start_time }}</span>
                </div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item">
                <MapPin :size="18" />
                <div>
                  <span class="label">{{ $t("bookingTickets.hall") }}</span>
                  <span class="value">{{ ticket.showtime_id?.hall_id?.hall_name || ticket.showtime_id?.hall_id?.name || ticket.showtime_id?.hall_name }}</span>
                </div>
              </div>
              <div class="detail-item">
                <Armchair :size="18" />
                <div>
                  <span class="label">{{ $t("bookingTickets.seat") }}</span>
                  <span class="value seat-number">{{ ticket.seat?.seat_number || ticket.seat?.seat_identifier }}</span>
                </div>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-item">
                <User :size="18" />
                <div>
                  <span class="label">{{ $t("bookingTickets.customer") }}</span>
                  <span class="value">{{ ticket.customer_id?.name }}</span>
                </div>
              </div>
              <div class="detail-item">
                <CreditCard :size="18" />
                <div>
                  <span class="label">{{ $t("bookingTickets.payment") }}</span>
                  <span class="value">{{ ticket.payment_method }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="ticket-footer">
            <div class="price-info">
              <span class="price-label">{{ $t("bookingTickets.price") }}</span>
              <span class="price-value">${{ ticket.seat?.price?.toFixed(2) }}</span>
            </div>
            <div class="issued-date">
              {{ $t("bookingTickets.issued") }}: {{ formatDateTime(ticket.issuedAt) }}
            </div>
          </div>

          <div class="ticket-terms">
            <div class="terms-title">{{ $t("bookingTickets.termsAndConditions") }}</div>
            <ul class="terms-list">
              <li>{{ $t("bookingTickets.noRefund") }}</li>
              <li>{{ $t("bookingTickets.arriveEarly") }}</li>
              <li>{{ $t("bookingTickets.validOnce") }}</li>
            </ul>
          </div>
        </div>

        <!-- Right Section - Stub -->
        <div class="ticket-stub">
          <div class="stub-content">
            <div class="stub-logo">
              <Film :size="24" />
            </div>
            
            <div class="stub-info">
              <div class="stub-movie">{{ truncateText(ticket.showtime_id?.movie_id?.title, 20) }}</div>
              <div class="stub-detail">
                <Calendar :size="14" />
                <span>{{ formatShortDate(ticket.showtime_id?.show_date) }}</span>
              </div>
              <div class="stub-detail">
                <Clock :size="14" />
                <span>{{ ticket.showtime_id?.start_time }}</span>
              </div>
              <div class="stub-detail">
                <MapPin :size="14" />
                <span>{{ ticket.showtime_id?.hall_id?.hall_name || ticket.showtime_id?.hall_id?.name || ticket.showtime_id?.hall_name }}</span>
              </div>
              <div class="stub-seat">
                <Armchair :size="16" />
                <span>{{ ticket.seat?.seat_number || ticket.seat?.seat_identifier }}</span>
              </div>
            </div>

            <div class="stub-barcode">
              <div class="barcode-lines">
                <span v-for="i in 12" :key="i"></span>
              </div>
              <div class="stub-code">{{ ticket.ticket_code?.slice(-8) }}</div>
            </div>
          </div>
        </div>

        <!-- Perforation Line -->
        <div class="perforation"></div>
      </div>

      <!-- Print Button (hidden when printing) -->
      <div class="print-actions no-print">
        <el-button type="primary" size="large" @click="handlePrint">
          <Printer :size="20" />
          {{ $t("actions.print") }}
        </el-button>
        <el-button type="success" size="large" @click="handleDownloadPNG" :loading="downloading">
          <Download :size="20" />
          {{ $t("actions.downloadPNG") }}
        </el-button>
        <el-button size="large" @click="handleClose">
          {{ $t("actions.close") }}
        </el-button>
      </div>
    </div>

    <div v-else class="error-state">
      <AlertCircle :size="48" />
      <p>{{ $t("bookingTickets.notFound") }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { bookingTicketService } from "@/services/bookingTicketService";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  Film,
  Calendar,
  Clock,
  MapPin,
  Armchair,
  User,
  CreditCard,
  Barcode,
  Printer,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-vue-next";

const route = useRoute();
const { t } = useI18n();

const loading = ref(true);
const ticket = ref(null);
const downloading = ref(false);

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatShortDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const loadTicket = async () => {
  loading.value = true;
  try {
    const ticketId = route.params.id;
    const response = await bookingTicketService.getBookingTicketById(ticketId);
    ticket.value = response;
  } catch (error) {
    console.error("Failed to load ticket:", error);
    ElMessage.error(t("bookingTickets.loadError"));
  } finally {
    loading.value = false;
  }
};

const handlePrint = () => {
  window.print();
};

const handleDownloadPNG = async () => {
  downloading.value = true;
  try {
    // Dynamically import html2canvas
    const html2canvas = (await import('html2canvas')).default;
    
    const ticketElement = document.querySelector('.cinema-ticket');
    if (!ticketElement) {
      ElMessage.error('Ticket element not found');
      return;
    }

    // Create canvas from the ticket element
    const canvas = await html2canvas(ticketElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
    });

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticket.value.ticket_code || 'booking'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      ElMessage.success(t('messages.downloadSuccess'));
    });
  } catch (error) {
    console.error('Failed to download PNG:', error);
    ElMessage.error(t('messages.downloadFailed'));
  } finally {
    downloading.value = false;
  }
};

const handleClose = () => {
  window.close();
};

onMounted(() => {
  loadTicket();
});
</script>

<style scoped>
.print-ticket-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-state,
.error-state {
  text-align: center;
  color: white;
  font-size: 18px;
}

.loading-state .el-icon {
  margin-bottom: 16px;
}

.error-state svg {
  margin-bottom: 16px;
  color: #f56c6c;
}

.ticket-wrapper {
  max-width: 900px;
  width: 100%;
}

.cinema-ticket {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  position: relative;
  overflow: hidden;
  margin-bottom: 32px;
}

.ticket-main {
  flex: 1;
  padding: 40px;
  position: relative;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.cinema-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #667eea;
}

.cinema-name {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 2px;
}

.ticket-code {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Courier New", monospace;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 8px 16px;
  border-radius: 8px;
}

.movie-info {
  margin-bottom: 32px;
}

.movie-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.movie-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.movie-meta span {
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 4px;
}

.ticket-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.detail-item svg {
  color: #667eea;
  flex-shrink: 0;
  margin-top: 2px;
}

.detail-item > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.seat-number {
  font-size: 20px;
  color: #667eea;
}

.ticket-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 2px dashed #e0e0e0;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
}

.price-value {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
}

.issued-date {
  font-size: 12px;
  color: #999;
}

.ticket-terms {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px dashed #e0e0e0;
}

.terms-title {
  font-size: 11px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.terms-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.terms-list li {
  font-size: 10px;
  color: #999;
  line-height: 1.4;
  padding-left: 12px;
  position: relative;
}

.terms-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

/* Ticket Stub */
.ticket-stub {
  width: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.stub-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 24px;
}

.stub-logo {
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.stub-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stub-movie {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1.3;
}

.stub-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  opacity: 0.9;
}

.stub-seat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  margin-top: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  justify-content: center;
}

.stub-barcode {
  text-align: center;
}

.barcode-lines {
  display: flex;
  gap: 2px;
  justify-content: center;
  margin-bottom: 8px;
  height: 40px;
}

.barcode-lines span {
  width: 3px;
  background: white;
  opacity: 0.8;
}

.barcode-lines span:nth-child(odd) {
  opacity: 1;
}

.stub-code {
  font-family: "Courier New", monospace;
  font-size: 11px;
  opacity: 0.8;
}

/* Perforation */
.perforation {
  position: absolute;
  right: 200px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 8px,
    #ddd 8px,
    #ddd 12px
  );
}

.perforation::before,
.perforation::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
}

.perforation::before {
  top: -10px;
}

.perforation::after {
  bottom: -10px;
}

/* Print Actions */
.print-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* Print Styles */
@media print {
  .print-ticket-container {
    background: white;
    padding: 0;
    min-height: auto;
  }

  .no-print {
    display: none !important;
  }

  .cinema-ticket {
    box-shadow: none;
    page-break-inside: avoid;
  }

  .ticket-main {
    padding: 30px;
  }

  .ticket-stub {
    width: 180px;
    padding: 30px 20px;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .cinema-ticket {
    flex-direction: column;
  }

  .ticket-stub {
    width: 100%;
    padding: 24px;
  }

  .perforation {
    display: none;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }

  .movie-title {
    font-size: 24px;
  }
}
</style>
