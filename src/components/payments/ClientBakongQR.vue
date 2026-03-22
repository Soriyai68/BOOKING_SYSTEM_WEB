<template>
  <div class="client-qr-container">
    <div class="glass-morph-overlay"></div>

    <div class="qr-card-wrapper">
      <!-- Decorative Ticket Notches -->
      <div class="ticket-notch notch-left"></div>
      <div class="ticket-notch notch-right"></div>

      <div class="card-header-premium">
        <div class="header-content">
          <span class="premium-label">{{ $t("payments.paymentDetails") }}</span>
          <div class="header-line"></div>
        </div>
        <button class="close-action-btn" @click="onClose" aria-label="Close">
          <X :size="18" />
        </button>
      </div>

      <div class="card-main-body">
        <div class="amount-section">
          <p class="label-muted">{{ $t("payments.amount") }}</p>
          <div class="price-display">
            <span class="currency-symbol">$</span>
            <span class="value-large">{{
              payment?.amount?.toLocaleString()
            }}</span>
            <span class="currency-code">{{ payment?.currency }}</span>
          </div>
        </div>

        <div v-if="showQR" class="qr-interaction-zone">
          <div class="qr-canvas-frame">
            <div class="qr-frame-border"></div>
            <div class="corner t-l"></div>
            <div class="corner t-r"></div>
            <div class="corner b-l"></div>
            <div class="corner b-r"></div>
            <div class="qr-inner-shadow" ref="qrRef">
              <qrcode-vue
                :value="payment.qr"
                :size="200"
                level="H"
                render-as="canvas"
              />
            </div>
          </div>

          <div class="timer-badge-unique">
            <div class="timer-icon">
              <Clock :size="14" />
            </div>
            <div class="timer-text-group">
              <span class="timer-label">{{ $t("payments.expiresIn") }}</span>
              <span
                class="timer-countdown"
                :class="{ 'text-critical': remainingTime < 60000 }"
              >
                {{ formatTime(remainingTime) }}
              </span>
            </div>
          </div>

          <button @click="downloadQR" class="btn-client-secondary">
            <Download :size="18" />
            <span>{{ $t("payments.saveQR") || "Save QR Image" }}</span>
          </button>

          <p class="hint-text-premium">{{ $t("payments.scanToPay") }}</p>
        </div>

        <div v-if="expired" class="status-view-unique">
          <div class="status-icon-box error">
            <AlertCircle :size="40" />
          </div>
          <h3 class="status-title-large error">
            {{ $t("payments.paymentExpired") }}
          </h3>
          <p class="status-subtitle-premium">
            {{ $t("payments.expiredTryAgain") || "Please close and try booking again." }}
          </p>
        </div>

        <div v-if="isPaid" class="status-view-unique">
          <div class="status-icon-box success">
            <CheckCircle :size="40" />
          </div>
          <h3 class="status-title-large success">
            {{ $t("payments.paymentSuccess") }}
          </h3>
          <p class="status-subtitle-premium">
            {{ $t("payments.paymentCompleted") }}
          </p>
        </div>
      </div>

      <div class="card-footer-action">
        <button @click="onClose" class="btn-client-dismiss">
          {{ $t("actions.close") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed, watch } from "vue";
import QrcodeVue from "qrcode.vue";
import {
  X,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-vue-next";
import { useSocket } from "@/services/socketService";
import { paymentService } from "@/services/paymentService";
import { useUiStore } from "@/stores/uiStore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const uiStore = useUiStore();

const props = defineProps({
  payment: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "paid", "expired"]);

const qrRef = ref(null);
const remainingTime = ref(0);
const isPaid = ref(false);
const hasExpiredToast = ref(false);

const downloadQR = () => {
  const canvas = qrRef.value.querySelector("canvas");
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = `cinema-qr-${props.payment.md5?.substring(0, 8) || "payment"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();

  uiStore.showToast(
    t("messages.qrSaved") || "QR Code saved to your device",
    "success",
  );
};

let countdownInterval = null;
let successTimeout = null;
let isCancelled = false;

const formatTime = (ms) => {
  if (ms < 0) ms = 0;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const expired = computed(() => !isPaid.value && remainingTime.value <= 0);
const showQR = computed(
  () => !isPaid.value && !expired.value && props?.payment?.qr,
);

const onClose = () => emit("close", isPaid.value);

const stopActivities = () => {
  isCancelled = true;
  clearInterval(countdownInterval);
  if (successTimeout) {
    clearTimeout(successTimeout);
    successTimeout = null;
  }
};

// Socket listener for real-time payment status
const { onEvent } = useSocket();

onEvent("payment:status", (data) => {
  if (isPaid.value || isCancelled) return;
  
  // Verify this payment update is for our current payment
  // Checking both md5 and bookingId for maximum reliability
  const isMatch = (data?.md5 && data.md5 === props.payment?.md5) || 
                  (data?.bookingId && data.bookingId === props.payment?.bookingId);

  if (isMatch) {
    const isCompleted = data.status === "COMPLETED" || 
                        data.status === "SUCCESS" || 
                        data.status === "Completed" ||
                        data.paid;
                        
    if (isCompleted) {
      console.log("Payment confirmed via Socket.io!");
      isPaid.value = true;
      stopActivities();
      successTimeout = setTimeout(() => {
        emit("paid");
        successTimeout = null;
      }, 1500);
    }
  }
});

const startCountdown = () => {
  countdownInterval = setInterval(() => {
    let expirationTime = 0;
    if (typeof props.payment?.expiration === "string") {
      expirationTime = new Date(props.payment.expiration).getTime();
    } else if (props.payment?.expiration) {
      expirationTime = props.payment.expiration;
    } else {
      expirationTime = Date.now() + 5 * 60 * 1000;
    }
    const time = expirationTime - Date.now();
    remainingTime.value = time;

    if (time <= 0 && !hasExpiredToast.value && !isPaid.value) {
      hasExpiredToast.value = true;
      uiStore.showToast(t("payments.paymentExpired"), "warning");
      stopActivities();
      // Notify parent that payment has expired
      emit("expired");
    }
  }, 1000);
};

watch(
  () => props.payment,
  (newPayment) => {
    stopActivities();
    isCancelled = false;
    hasExpiredToast.value = false;

    if (newPayment) {
      isPaid.value = newPayment.paid || newPayment.status === "Completed";
      let expTime = newPayment.expiration
        ? new Date(newPayment.expiration).getTime()
        : Date.now() + 5 * 60 * 1000;
      remainingTime.value = expTime - Date.now();

      if (isPaid.value) {
        emit("paid");
        return;
      }

      if (remainingTime.value > 0) {
        startCountdown();
      }
    }
  },
  { immediate: true, deep: true },
);

onUnmounted(() => stopActivities());
</script>

<style scoped>
.client-qr-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.glass-morph-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 15, 20, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.6);
  z-index: -1;
}

.qr-card-wrapper {
  width: 100%;
  padding: 32px;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Ticket Notches */
.ticket-notch {
  position: absolute;
  top: 50%;
  width: 24px;
  height: 24px;
  background: #0a0a0c; /* Matches site background */
  border-radius: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.notch-left {
  left: -12px;
}

.notch-right {
  right: -12px;
}

.card-header-premium {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.premium-label {
  font-size: 11px;
  font-weight: 800;
  color: #0ea5e9;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.header-line {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #0ea5e9, transparent);
}

.close-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-action-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.amount-section {
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 32px;
}

.label-muted {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 8px;
}

.price-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.currency-symbol {
  font-size: 20px;
  font-weight: 800;
  color: #8b5cf6;
}

.value-large {
  font-size: 42px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.01em;
}

.currency-code {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
}

.qr-interaction-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.qr-canvas-frame {
  position: relative;
  background: #fff;
  padding: 12px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.qr-frame-border {
  position: absolute;
  inset: -1px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 32px;
  height: 32px;
  border: 3px solid #0ea5e9;
  z-index: 5;
}

.t-l {
  top: -8px;
  left: -8px;
  border-right: none;
  border-bottom: none;
  border-radius: 12px 0 0 0;
}
.t-r {
  top: -8px;
  right: -8px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 12px 0 0;
}
.b-l {
  bottom: -8px;
  left: -8px;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 12px;
}
.b-r {
  bottom: -8px;
  right: -8px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 12px 0;
}

.timer-badge-unique {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 100px;
}

.timer-icon {
  color: #eab308;
}

.timer-countdown {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.text-critical {
  color: #ef4444;
}

.timer-label {
  display: block;
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  margin-bottom: -2px;
}

.btn-client-primary {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  border: none;
  border-radius: 16px;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 8px 24px -6px rgba(14, 165, 233, 0.4);
}

.btn-client-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -6px rgba(14, 165, 233, 0.5);
}

.btn-client-secondary {
  width: 100%;
  height: 52px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-client-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.hint-text-premium {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  text-align: center;
  line-height: 1.6;
}

.status-view-unique {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  text-align: center;
}

.status-icon-box {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.status-icon-box.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-icon-box.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-title-large {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
}

.status-title-large.success {
  color: #fff;
}
.status-title-large.error {
  color: #ef4444;
}

.status-subtitle-premium {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.btn-client-dismiss {
  width: 100%;
  padding: 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;
}

.btn-client-dismiss:hover {
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

@media (max-width: 440px) {
  .client-qr-container {
    padding: 16px;
  }
  .ticket-notch {
    display: none;
  }
}
</style>
