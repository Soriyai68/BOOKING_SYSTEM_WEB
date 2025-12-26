<template>
  <div class="payment-step">
    <el-card shadow="never" class="payment-card">
      <template #header>
        <div class="card-header">
          <span class="flex gap-[10px] items-center"><Wallet :size="18" /> {{ $t("payments.paymentDetails") }}</span>
        </div>
      </template>

      <el-form label-position="top">
        <el-form-item :label="$t('customers.customer')">
          <el-select
            :model-value="customerId"
            @update:modelValue="$emit('update:customerId', $event)"
            filterable
            remote
            :remote-method="loadCustomers"
            :loading="loading.customers"
            :placeholder="$t('customers.searchAndSelectCustomer')"
            style="width: 100%"
            size="large"
          >
            <template #prefix><User :size="18" /></template>
            <el-option
              v-for="customer in customerOptions"
              :key="customer.id"
              :label="getCustomerLabel(customer)"
              :value="customer.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('payments.paymentMethod')">
          <el-radio-group
            :model-value="paymentMethod"
            @update:modelValue="$emit('update:paymentMethod', $event)"
            size="large"
            style="width: 100%"
          >
            <el-radio-button
              v-for="method in paymentMethods"
              :key="method.value"
              :label="method.value"
            >
              <div class="payment-method-option">
                <component
                  :is="getPaymentMethodIcon(method.value)"
                  :size="20"
                />
                <span>{{ method.label }}</span>
              </div>
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <div v-if="paymentMethod" class="payment-instructions">
          <el-alert
            :title="
              $t(`payments.${paymentMethod.toLowerCase()}InstructionsTitle`)
            "
            type="info"
            show-icon
            :closable="false"
          >
            <p>
              {{ $t(`payments.${paymentMethod.toLowerCase()}Instructions`) }}
            </p>
          </el-alert>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { customerService } from "@/services/customerService";
import { paymentService } from "@/services/paymentService";
import { toLocalPhone } from "@/utils/formatters";
import { CircleDollarSign , Wallet, User, Store, CreditCard } from "lucide-vue-next";

defineProps({
  customerId: {
    type: String,
    default: null,
  },
  paymentMethod: {
    type: String,
    default: "Cash",
  },
});

defineEmits(["update:customerId", "update:paymentMethod"]);

const { t } = useI18n();

const loading = reactive({
  customers: false,
});
const customerOptions = ref([]);

const paymentMethods = paymentService.PAYMENT_METHODS.filter((p) =>
  ["Cash", "Bakong", "PayAtCinema"].includes(p.value)
);

const getPaymentMethodIcon = (method) => {
  switch (method) {
    case "Cash":
      return CircleDollarSign ;
    case "Bakong":
      return CreditCard;
    case "PayAtCinema":
      return Store;
    default:
      return DollarSign;
  }
};

const getCustomerLabel = (customer) => {
  if (customer.customerType === "walkin") {
    return "Walk-in Customer";
  }
  if (customer.customerType === "guest") {
    return `Guest Customer - ${customer.email || customer.name || customer.id}`;
  }
  if (customer.name && customer.phone) {
    return `${customer.name} - ${toLocalPhone(customer.phone)}`;
  }
  if (customer.name) {
    return customer.name;
  }
  if (customer.email) {
    return customer.email;
  }
  return customer.id;
};

const loadCustomers = async (query = "") => {
  loading.customers = true;
  try {
    const response = await customerService.getCustomers({
      search: query,
      limit: 20,
    });
    customerOptions.value = response.data;
  } catch (error) {
    console.error("Failed to load customers:", error);
    ElMessage.error(t("errors.loadDataFailed"));
  } finally {
    loading.customers = false;
  }
};

onMounted(() => {
  loadCustomers();
});
</script>

<style scoped>
.payment-card {
  border: none;
  background-color: transparent;
}
.card-header {
  font-size: 1.2em;
  font-weight: 600;
  display: flex;;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}
.payment-method-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}
.payment-instructions {
  margin-top: 20px;
}

.el-radio-group {
  display: flex;
}

.el-radio-button {
  flex: 1;
}

:deep(.el-radio-button__inner) {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
