<template>
  <div class="edit-customer">
    <div class="page-header">
      <h2>{{ $t("customers.editCustomer") }}</h2>
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        {{ $t("actions.back") }}
      </el-button>
    </div>

    <el-card v-loading="pageLoading">
      <div v-if="loadError" class="error-state">
        <el-result
          icon="error"
          :title="$t('messages.error')"
          :sub-title="loadError"
        >
          <template #extra>
            <el-button type="primary" @click="loadCustomer">{{ $t("actions.refresh") }}</el-button>
          </template>
        </el-result>
      </div>

      <el-form
        v-else
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item :label="$t('customers.customerType')" prop="customerType">
          <el-select v-model="form.customerType" :placeholder="$t('customers.customerType')" style="width: 100%">
            <el-option :label="$t('customers.member')" value="member" />
            <el-option :label="$t('customers.walkin')" value="walkin" />
            <el-option :label="$t('customers.guest')" value="guest" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="form.customerType === 'member'" :label="$t('customers.name')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('customers.name')" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item v-if="form.customerType === 'member' || form.customerType === 'walkin'" :label="$t('customers.phone')" prop="phone">
          <el-input
            v-model="displayPhone"
            :placeholder="$t('auth.phonePlaceholder')"
            maxlength="10"
            @input="formatPhoneNumber"
          />
        </el-form-item>
        <el-form-item v-if="form.customerType === 'member'" :label="$t('customers.username')" prop="username">
          <el-input v-model="form.username" :placeholder="$t('customers.username')" />
        </el-form-item>
        <el-form-item v-if="form.customerType === 'guest'" :label="$t('customers.email')" prop="email">
          <el-input v-model="form.email" :placeholder="$t('auth.emailPlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('customers.status')" prop="isActive">
          <el-switch
            v-model="form.isActive"
            :active-text="$t('customers.active')"
            :inactive-text="$t('customers.inactive')"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSubmit">
            {{ $t("actions.save") }}
          </el-button>
          <el-button @click="resetForm">
            {{ $t("actions.reset") }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElResult } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { useAppStore } from '@/stores/app';
import { customerService } from '@/services/customerService';
import { toInternationalPhone, toLocalPhone } from "@/utils/formatters";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const formRef = ref();
const pageLoading = ref(true);
const saving = ref(false);
const loadError = ref('');
const originalCustomer = ref(null);
const displayPhone = ref("");

const form = reactive({
  name: '',
  phone: '',
  email: '',
  username: '',
  customerType: 'walkin',
  isActive: true,
});

const formatPhoneNumber = (inputValue) => {
  let cleanedDisplay = inputValue.replace(/\D/g, ''); // only digits
  if (cleanedDisplay.startsWith('855')) {
    cleanedDisplay = '0' + cleanedDisplay.substring(3);
  } else if (!cleanedDisplay.startsWith('0') && cleanedDisplay.length > 1) {
    cleanedDisplay = '0' + cleanedDisplay;
  }
  displayPhone.value = cleanedDisplay.substring(0, 10);
  form.phone = toInternationalPhone(displayPhone.value);
};

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error(t("validation.phoneRequired")));
  } else if (!/^\+855[0-9]{8,9}$/.test(value)) {
    callback(new Error(t("validation.phoneInvalid")));
  } else {
    callback();
  }
};

const rules = computed(() => {
  const currentType = form.customerType;
  let phoneRules = [];
  let nameRules = [];
  let emailRules = [{ type: 'email', message: t('validation.emailInvalid'), trigger: ['blur', 'change'] }];

  if (currentType === 'member') {
    nameRules.push({ required: true, message: t('validation.required'), trigger: 'blur' });
    phoneRules.push({ required: true, validator: validatePhone, trigger: 'blur' });
  } else if (currentType === 'walkin') {
    phoneRules.push({ required: true, validator: validatePhone, trigger: 'blur' });
  } else if (currentType === 'guest') {
    emailRules.push({ required: true, message: t('validation.required'), trigger: 'blur' });
  }

  return {
    name: nameRules,
    phone: phoneRules,
    email: emailRules,
    customerType: [{ required: true, message: t('validation.required'), trigger: 'change' }],
  };
});

watch(() => form.customerType, (newType) => {
  formRef.value?.clearValidate();
  if (newType === 'walkin') {
    form.email = '';
    form.username = '';
  } else if (newType === 'guest') {
    form.name = '';
    form.phone = '';
    form.username = '';
  }
});

const loadCustomer = async () => {
  pageLoading.value = true;
  loadError.value = '';
  try {
    const customerData = await customerService.getCustomer(route.params.id);
    originalCustomer.value = customerData;
    Object.assign(form, {
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email,
      username: customerData.username,
      customerType: customerData.customerType,
      isActive: customerData.isActive,
    });
    displayPhone.value = toLocalPhone(customerData.phone);
  } catch (error) {
    console.error('Failed to load customer:', error);
    loadError.value = t('customers.loadError');
  } finally {
    pageLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    saving.value = true;

    await customerService.updateCustomer(route.params.id, form);

    ElMessage.success(t('customers.updateSuccess'));
    router.push('/admin/customers');
  } catch (error) {
    console.error('Update customer error:', error);
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error(t('customers.updateError'));
    }
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  if (originalCustomer.value) {
    Object.assign(form, {
        name: originalCustomer.value.name,
        phone: originalCustomer.value.phone,
        email: originalCustomer.value.email,
        username: originalCustomer.value.username,
        customerType: originalCustomer.value.customerType,
        isActive: originalCustomer.value.isActive,
    });
    displayPhone.value = toLocalPhone(originalCustomer.value.phone);
  }
};

onMounted(() => {
  loadCustomer();
  appStore.setBreadcrumbs([
    { title: t('nav.dashboard'), path: '/admin/dashboard' },
    { title: t('customers.title'), path: '/admin/customers' },
    { title: t('customers.editCustomer'), path: '#' },
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
  color: var(--el-text-color-primary);
}
.el-form {
  max-width: 600px;
}
.error-state {
  text-align: center;
  padding: 40px 20px;
}
</style>
