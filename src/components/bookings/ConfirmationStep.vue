<template>
  <div class="booking-summary-container">
    <div class="summary-header">
      <div class="header-icon-wrapper">
        <Ticket :size="36" class="text-blue-500" />
      </div>
      <h1 class="summary-title">{{ $t("bookings.bookingSummary") }}</h1>
    </div>

    <el-card shadow="never" class="custom-card">
      <div class="card-body">
        <!-- List of details -->
        <div class="summary-items-list">
          <div
            v-for="(item, idx) in summaryDetails"
            :key="idx"
            class="summary-item"
          >
            <div class="item-content-left">
              <div class="item-icon-box">
                <component :is="item.icon" :size="18" />
              </div>
              <div>
                <div class="item-label">
                  {{ $t(`bookings.${item.labelKey}`) }}
                </div>
                <div class="item-value">
                  {{ item.value }}
                </div>
              </div>
            </div>
            <!-- <ChevronRight :size="16" class="text-gray-700" /> -->
          </div>
        </div>

        <!-- Pricing Section -->
        <div class="pricing-section">
          <div class="pricing-blob"></div>

          <div class="pricing-details">
            <div>
              <p class="price-total-label">{{ $t("bookings.totalPrice") }}</p>
              <div class="price-taxes-info">
                <CreditCard :size="14" />
              </div>
            </div>
            <div class="price-value-final">
              {{ formatCurrency(bookingSummary.totalPrice) }}
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { formatCurrency } from "@/utils/formatters";
import {
  Film,
  Video,
  Calendar,
  Clock,
  Armchair,
  CreditCard,
  Ticket,
} from "lucide-vue-next";

const props = defineProps({
  bookingSummary: {
    type: Object,
    required: true,
  },
});

const summaryDetails = computed(() => [
  { icon: Film, labelKey: "movie", value: props.bookingSummary.movie },
  { icon: Video, labelKey: "hall", value: props.bookingSummary.hall },
  {
    icon: Calendar,
    labelKey: "showDate",
    value: props.bookingSummary.showDate,
  },
  { icon: Clock, labelKey: "startTime", value: props.bookingSummary.startTime },
  { icon: Armchair, labelKey: "seats", value: props.bookingSummary.seats },
]);
</script>

<style scoped>
.booking-summary-container {
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  font-family: var(--el-font-family);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  outline: 1px solid var(--el-border-color-lighter);
  border-radius: 1.5rem;
}

.summary-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  text-align: center;
}

.header-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
}

.summary-title {
  font-size: 1.75rem; /* Increased font size */
  line-height: 2rem; /* tracking-tight */
  font-weight: 800; /* font-extrabold */
  color: var(--el-text-color-primary);
  margin-bottom: 0.5rem; /* Increased margin */
}

.summary-subtitle {
  color: var(--el-text-color-secondary); /* text-gray-500 */
  font-size: 0.8rem; /* Slightly increased font size */
}

.custom-card {
  background-color: var(
    --el-bg-color
  ) !important; /* Adjusted for better theme fit */
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 1.25rem !important; /* Increased border-radius */
  overflow: hidden;
  /* box-shadow: var(--el-box-shadow-dark); shadow-2xl */
  width: 100%;
  max-width: 26rem; /* Increased max-width */
}

.card-body {
  padding: 1.5rem; /* Increased padding */
}

.summary-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* Increased gap */
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem; /* Increased padding */
  padding-bottom: 0.875rem; /* Increased padding */
  border-bottom: 1px solid var(--el-border-color-lighter); /* border-gray-800/50 */
  transition: all 0.3s ease-in-out; /* transition-all duration-300 */
  color: var(--el-text-color-regular);
}

.summary-item:last-child {
  border-bottom: 0;
}

.summary-item:hover .item-icon-box {
  color: var(--el-color-primary);
}

.item-content-left {
  display: flex;
  align-items: center;
  gap: 1rem; /* Increased gap */
}

.item-icon-box {
  padding: 0.625rem; /* Increased padding */
  background-color: var(
    --el-fill-color-light
  ); /* Adjusted for better theme fit */
  border-radius: 0.875rem; /* Increased border-radius */
  color: var(--el-text-color-secondary); /* text-gray-500 */
  transition: background-color 0.3s, color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-label {
  font-size: 13px; /* Increased font size */
  font-weight: 700; /* font-bold */
  color: var(--el-text-color-secondary); /* text-gray-500 */
  text-transform: uppercase;
  letter-spacing: 0.075em; /* tracking-widest */
  line-height: 1; /* leading-none */
  margin-bottom: 0.5rem; /* Reduced margin */
}

.item-value {
  font-size: 13px; /* Increased font size */
  font-weight: 600; /* font-semibold */
  color: var(--el-text-color-primary); /* text-gray-100 */
}

.pricing-section {
  margin-top: 2rem; /* Increased margin */
  padding: 1.25rem; /* Increased padding */
  background-color: var(--el-bg-color); /* #0a0a0b */
  border-radius: 1rem; /* Increased border-radius */
  border: 1px solid var(--el-border-color-light); /* border-gray-800 */
  position: relative;
  overflow: hidden;
}

.pricing-blob {
  position: absolute;
  top: 0;
  right: 0;
  width: 5rem; /* Increased size */
  height: 5rem; /* Increased size */
  background-color: rgba(234, 179, 8, 0.05); /* yellow-500/5 */
  filter: blur(2.5rem); /* Increased blur */
  border-radius: 0px; /* rounded-full */
  margin-right: -2rem; /* Adjusted margin */
  margin-top: -2rem; /* Adjusted margin */
}

.pricing-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative; /* Ensure content is above blob */
  z-index: 10;
}

.price-total-label {
  font-size: 0.75rem; /* Increased font size */
  font-weight: 700; /* font-bold */
  color: var(--el-text-color-secondary); /* text-gray-500 */
  text-transform: uppercase;
  letter-spacing: -0.025em; /* tracking-tighter */
  margin-bottom: 0.25rem; /* Increased margin */
}

.price-taxes-info {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Increased gap */
  color: var(--el-text-color-regular); /* text-gray-400 */
}

.price-taxes-info span {
  font-size: 0.625rem; /* Increased font size */
  text-transform: uppercase;
  font-weight: 700; /* font-bold */
}

.price-value-final {
  font-size: 1.75rem; /* Increased font size */
  font-weight: 900; /* font-black */
  color: var(--el-color-primary); /* text-yellow-500 */
  letter-spacing: -0.05em; /* tracking-tighter */
}

.branding-footer {
  margin-top: 2.5rem; /* Increased margin */
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.3;
}

.branding-dots-wrapper {
  display: flex;
  align-items: center;
  gap: 0.4rem; /* Increased gap */
  margin-bottom: 0.4rem; /* Increased margin */
}

.branding-dot {
  width: 0.3rem; /* Increased size */
  height: 0.3rem; /* Increased size */
  border-radius: 9999px; /* rounded-full */
  background-color: var(--el-color-primary); /* bg-yellow-500 */
}

.branding-text {
  font-size: 0.625rem; /* Increased font size */
  font-weight: 700; /* font-bold */
  text-transform: uppercase;
  letter-spacing: 0.25em; /* Adjusted letter-spacing */
  color: var(--el-text-color-primary);
}
</style>
