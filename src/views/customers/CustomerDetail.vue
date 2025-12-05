<template>
  <div class="customer-detail">
    <div class="page-header">
      <h2>{{ $t("customers.customerDetails") }}</h2>
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        {{ $t("actions.back") }}
      </el-button>
    </div>

    <el-card v-loading="loading">
      <div v-if="loadError" class="error-state">
        <el-result
          icon="error"
          :title="$t('messages.error')"
          :sub-title="loadError"
        >
          <template #extra>
            <el-button type="primary" @click="loadCustomer">{{
              $t("actions.refresh")
            }}</el-button>
          </template>
        </el-result>
      </div>

      <el-descriptions v-else :column="2" border>
        <el-descriptions-item :label="$t('customers.name')">{{
          customer?.name || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customers.phone')">{{
          customer?.phone || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customers.email')">{{
          customer?.email || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customers.username')">{{
          customer?.username || "-"
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customers.customerType')">
          <el-tag :type="getCustomerTypeTag(customer?.customerType)">
            {{ $t(`customers.${customer?.customerType}`) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('customers.status')">
          <el-tag :type="customer?.isActive ? 'success' : 'danger'">
            {{ $t(`customers.${customer?.isActive ? "active" : "inactive"}`) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('customers.isVerified')">
          <el-tag :type="customer?.isVerified ? 'success' : 'danger'">
            {{
              customer?.isVerified
                ? $t("validation.verified")
                : $t("validation.unverified")
            }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item :label="$t('customers.lastLogin')">{{
          formatDate(customer?.lastLogin)
        }}</el-descriptions-item>
        <el-descriptions-item :label="$t('customers.passwordChangedAt')">{{
          formatDate(customer?.passwordChangedAt)
        }}</el-descriptions-item>

        <el-descriptions-item :label="$t('customers.created')">{{
          formatDate(customer?.created_at)
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/stores/app";
import { customerService } from "@/services/customerService";
import {
  ElMessage,
  ElResult,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
  ElButton,
  ElIcon,
} from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";

const route = useRoute();
const { t } = useI18n();
const appStore = useAppStore();

const loading = ref(true);
const customer = ref(null);
const loadError = ref("");

const loadCustomer = async () => {
  loading.value = true;
  loadError.value = "";
  try {
    const customerData = await customerService.getCustomer(route.params.id);
    customer.value = customerData;
    console.log(customerData);
  } catch (error) {
    console.error("Failed to load customer details:", error);
    loadError.value = t("customers.loadError");
    ElMessage.error(loadError.value);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString().slice(0,9);
};

const getCustomerTypeTag = (type) => {
  switch (type) {
    case "member":
      return "success";
    case "walkin":
      return "info";
    case "guest":
      return "warning";
    default:
      return "primary";
  }
};

onMounted(() => {
  loadCustomer();
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("customers.title"), path: "/admin/customers" },
    { title: t("customers.customerDetails"), path: "#" },
  ]);
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
}
.error-state {
  text-align: center;
  padding: 40px 20px;
}
</style>
