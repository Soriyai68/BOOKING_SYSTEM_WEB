<template>
  <div class="step-content">
    <el-form style="margin-top: 20px" label-position="top">
      <el-form-item :label="$t('customers.customer')"></el-form-item>
      <div>
        <el-form-item>
          <el-select
            :model-value="customerId"
            @update:modelValue="$emit('update:customerId', $event)"
            filterable
            remote
            :remote-method="loadCustomers"
            :loading="loading.customers"
            :placeholder="$t('customers.searchAndSelectCustomer')"
            style="width: 100%"
          >
            <el-option
              v-for="customer in customerOptions"
              :key="customer.id"
              :label="getCustomerLabel(customer)"
              :value="customer.id"
            />
          </el-select>
        </el-form-item>
      </div>
      <el-form-item :label="$t('payments.paymentMethod')">
        <el-select
          :model-value="paymentMethod"
          @update:modelValue="$emit('update:paymentMethod', $event)"
          style="width: 100%"
        >
          <el-option
            v-for="method in paymentMethods"
            :key="method.value"
            :label="method.label"
            :value="method.value"
          />
        </el-select>
      </el-form-item>
      <div v-if="paymentMethod === 'Cash'" class="payment-details">
        <h4>{{ $t("payments.cashInstructions") }}</h4>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { customerService } from '@/services/customerService';
import { paymentService } from '@/services/paymentService';
import { toLocalPhone } from '@/utils/formatters';

const props = defineProps({
  customerId: {
    type: String,
    default: null
  },
  paymentMethod: {
    type: String,
    default: 'Cash'
  }
});

defineEmits(['update:customerId', 'update:paymentMethod']);

const { t } = useI18n();

const loading = reactive({
  customers: false,
});
const customerOptions = ref([]);

const paymentMethods = paymentService.PAYMENT_METHODS.filter(p =>
  ['Cash', 'Bakong', 'PayAtCinema'].includes(p.value)
);

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

const loadCustomers = async (query = '') => {
  loading.customers = true;
  try {
    const response = await customerService.getCustomers({ search: query, limit: 20 });
    customerOptions.value = response.data;
  } catch (error) {
    console.error('Failed to load customers:', error);
    ElMessage.error(t('errors.loadDataFailed'));
  } finally {
    loading.customers = false;
  }
};

onMounted(() => {
  loadCustomers();
});
</script>

<style scoped>
.step-content {
  margin: 20px 0;
  padding: 0 40px;
}
.payment-details {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
</style>
