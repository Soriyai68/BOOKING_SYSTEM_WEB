<template>
  <div class="create-customer">
    <div class="page-header">
      <h2>{{ $t("customers.createCustomer") }}</h2>
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        {{ $t("actions.back") }}
      </el-button>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <!-- Customer Type -->
        <el-form-item :label="$t('customers.customerType')" prop="customerType">
          <el-select
            v-model="form.customerType"
            :placeholder="$t('customers.customerType')"
            style="width: 100%"
          >
            <el-option :label="$t('customers.member')" value="member" />
            <el-option :label="$t('customers.walkin')" value="walkin" />
            <el-option :label="$t('customers.guest')" value="guest" />
          </el-select>
        </el-form-item>

        <!-- Name (member only) -->
        <el-form-item
          v-if="['member'].includes(form.customerType)"
          :label="$t('customers.name')"
          prop="name"
        >
          <el-input
            v-model="form.name"
            :placeholder="$t('customers.name')"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <!-- Phone (member + walkin only) -->
        <el-form-item
          v-if="['member', 'walkin'].includes(form.customerType)"
          :label="$t('customers.phone')"
          prop="phone"
        >
          <el-input
            v-model="displayPhone"
            :placeholder="$t('auth.phonePlaceholder')"
            maxlength="10"
            @input="formatPhoneNumber"
          />
        </el-form-item>

        <!-- Email (member + guest only) -->
        <el-form-item
          v-if="['guest'].includes(form.customerType)"
          :label="$t('customers.email')"
          prop="email"
        >
          <el-input v-model="form.email" :placeholder="$t('customers.email')" />
        </el-form-item>

        <!-- Username (member only) -->
        <el-form-item
          v-if="form.customerType === 'member'"
          :label="$t('customers.username')"
          prop="username"
        >
          <el-input
            v-model="form.username"
            :placeholder="$t('customers.username')"
          />
        </el-form-item>

        <!-- Status -->
        <el-form-item :label="$t('customers.status')" prop="isActive">
          <el-switch
            v-model="form.isActive"
            :active-text="$t('customers.active')"
            :inactive-text="$t('customers.inactive')"
          />
        </el-form-item>

        <!-- Buttons -->
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            {{ $t("customers.createCustomer") }}
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
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/app";
import { customerService } from "@/services/customerService";
import { toInternationalPhone } from "@/utils/formatters";

const router = useRouter();
const appStore = useAppStore();
const { t } = useI18n();

const formRef = ref();
const loading = ref(false);
const displayPhone = ref("");

const form = reactive({
  name: "",
  phone: "",
  email: "",
  username: "",
  customerType: "walkin",
  isActive: true,
});

const formatPhoneNumber = (inputValue) => {
  let cleanedDisplay = inputValue.replace(/\D/g, ""); // only digits
  if (cleanedDisplay.startsWith("855")) {
    cleanedDisplay = "0" + cleanedDisplay.substring(3);
  } else if (!cleanedDisplay.startsWith("0") && cleanedDisplay.length > 1) {
    cleanedDisplay = "0" + cleanedDisplay;
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
  let emailRules = [
    {
      type: "email",
      message: t("validation.emailInvalid"),
      trigger: ["blur", "change"],
    },
  ];

  if (currentType === "member") {
    nameRules.push({
      required: true,
      message: t("validation.required"),
      trigger: "blur",
    });
    phoneRules.push({
      required: true,
      validator: validatePhone,
      trigger: "blur",
    });
  } else if (currentType === "guest") {
    emailRules.push({
      required: true,
      message: t("validation.required"),
      trigger: "blur",
    });
  }

  return {
    name: nameRules,
    phone: phoneRules,
    email: emailRules,
    customerType: [
      { required: true, message: t("validation.required"), trigger: "change" },
    ],
  };
});

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    await customerService.createCustomer(form);

    ElMessage.success(t("customers.createSuccess"));
    router.push("/admin/customers");
  } catch (error) {
    console.error("Create customer error:", error);
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error(t("customers.createError"));
    }
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
  displayPhone.value = "";
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("customers.title"), path: "/admin/customers" },
    { title: t("customers.createCustomer"), path: "/admin/customers/create" },
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
</style>
