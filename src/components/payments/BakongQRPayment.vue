<template>
  <el-card class="qr-payment-card" shadow="always">
    <template #header>
      <div class="card-header">
        <span>{{ $t("payments.paymentDetails") }}</span>
        <el-button class="close-btn" :icon="Close" circle @click="onClose" />
      </div>
    </template>
    <div class="card-content">
      <div class="amount-section">
        <p class="amount-label">{{ $t("payments.amount") }}</p>
        <p class="amount-value">
          {{ payment?.amount?.toLocaleString() }} {{ payment?.currency }}
        </p>
      </div>

      <div v-if="showQR" class="qr-code-section">
        <div class="qr-container">
          <qrcode-vue
            :value="payment.qr"
            :size="200"
            level="H"
            render-as="svg"
          />
        </div>
        <div class="expiry-info">
          <p class="expiry-label">{{ $t("payments.expiresIn") }}</p>
          <p class="expiry-time">{{ formatTime(remainingTime) }}</p>
        </div>
      </div>

      <div v-if="expired" class="status-section">
        <el-alert
          :title="$t('payments.paymentExpired')"
          type="error"
          show-icon
          :closable="false"
        />
        <el-button
          @click="onRegenerate"
          type="primary"
          class="regenerate-btn"
          >{{ $t("actions.regenerate") }}</el-button
        >
      </div>

      <div v-if="isPaid" class="status-section">
        <el-result
          icon="success"
          :title="$t('payments.paymentSuccess')"
          :sub-title="$t('payments.paymentCompleted')"
        >
        </el-result>
      </div>
    </div>
    <template #footer>
      <div class="card-footer">
        <el-button @click="onClose" class="w-full">{{
          $t("actions.close")
        }}</el-button>
      </div>
    </template>
  </el-card>
</template>

<script setup>
import { ref, onUnmounted, computed, watch } from "vue";
import QrcodeVue from "qrcode.vue";
import {
  ElMessage,
  ElBadge,
  ElCard,
  ElButton,
  ElAlert,
  ElResult,
} from "element-plus";
import { Close } from "@element-plus/icons-vue";
import { paymentService } from "@/services/paymentService";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  payment: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "regenerate", "paid"]);

const remainingTime = ref(0);
const isPaid = ref(false);
const hasExpiredToast = ref(false);

let countdownInterval = null;
let pollingTimeout = null;
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
  () => !isPaid.value && !expired.value && props?.payment?.qr
);

const onClose = () => emit("close", isPaid.value);
const onRegenerate = () => {
  hasExpiredToast.value = false;
  emit("regenerate");
};

const checkPayment = async () => {
  if (isCancelled || isPaid.value || !props?.payment?.md5) return;
  try {
    const paymentStatusResponse = await paymentService.checkPaymentStatus(
      props?.payment?.md5
    );
    if (paymentStatusResponse?.data?.paid || paymentStatusResponse?.status === 'COMPLETED') {
      isPaid.value = true;
      stopActivities();
      emit("paid");
    } else if (!isCancelled) {
      pollingTimeout = setTimeout(checkPayment, 5000);
    }
  } catch (err) {
    if (!isCancelled) {
      pollingTimeout = setTimeout(checkPayment, 5000);
    }
  }
};

const stopActivities = () => {
  isCancelled = true;
  clearInterval(countdownInterval);
  clearTimeout(pollingTimeout);
};

const startCountdown = () => {
  countdownInterval = setInterval(() => {
    let expirationTime = 0;
    if (typeof props.payment?.expiration === "string") {
      expirationTime = new Date(props.payment.expiration).getTime();
    } else if (props.payment?.expiration) {
      expirationTime = props.payment.expiration;
    } else {
      expirationTime = Date.now() + 5 * 60 * 1000; // Default to 5 minutes from now
    }
    const time = expirationTime - Date.now();
    remainingTime.value = time;

    if (time <= 0 && !hasExpiredToast.value && !isPaid.value) {
      hasExpiredToast.value = true;
      ElMessage.warning(t("payments.paymentExpired"));
      stopActivities();
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

      let expirationTime = 0;
      if (typeof newPayment.expiration === "string") {
        expirationTime = new Date(newPayment.expiration).getTime();
      } else if (newPayment.expiration) {
        expirationTime = newPayment.expiration;
      } else {
        expirationTime = Date.now() + 5 * 60 * 1000; // Default to 5 minutes from now
      }

      remainingTime.value = expirationTime - Date.now();

      if (isPaid.value) {
        emit("paid");
        return;
      }

      if (remainingTime.value > 0) {
        startCountdown();
        checkPayment();
      } else {
        if (!hasExpiredToast.value) {
          ElMessage.warning(t("payments.paymentExpired"));
          hasExpiredToast.value = true;
        }
      }
    }
  },
  { immediate: true, deep: true }
);

onUnmounted(() => {
  stopActivities();
});
</script>

<style scoped>
.qr-payment-card {
  width: 350px;
  text-align: center;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}
.amount-label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 4px;
}
.amount-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--el-color-primary);
}
.qr-code-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.qr-container {
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.expiry-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}
.expiry-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.expiry-time {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-color-warning);
}
.status-section {
  width: 100%;
  padding: 20px 0;
}
.regenerate-btn {
  margin-top: 15px;
}
.card-footer {
  display: flex;
  justify-content: center;
}
.w-full {
  width: 100%;
}
</style>
