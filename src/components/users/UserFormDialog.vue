<template>
  <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? $t('users.editUser') : $t('users.createUser')"
      width="600px"
      :close-on-click-modal="false"
      @closed="handleClosed"
  >
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="handleSubmit"
    >
      <el-form-item :label="$t('users.name')" prop="name">
        <el-input
            v-model="form.name"
            :placeholder="$t('users.name')"
            maxlength="50"
            show-word-limit
        />
      </el-form-item>

      <el-form-item :label="$t('users.phone')" prop="phone">
        <el-input
            v-model="form.phone"
            :placeholder="$t('auth.phonePlaceholder')"
            @input="formatPhoneNumber"
            maxlength="13"
        />
      </el-form-item>

      <el-form-item :label="$t('users.role')" prop="role">
        <el-select
            v-model="form.role"
            :placeholder="$t('users.role')"
            style="width: 100%"
            filterable
        >
          <el-option
              v-for="r in roleOptions"
              :key="r.name"
              :label="r.displayName || r.name"
              :value="r.name"
              :disabled="r.name === 'superadmin' && !authStore.isSuperAdmin"
          />
        </el-select>
      </el-form-item>

      <el-form-item
          :label="$t('auth.password')"
          prop="password"
          v-if="form.role"
      >
        <el-input
            v-model="form.password"
            type="password"
            :placeholder="passwordPlaceholder"
            show-password
        />
        <div class="form-tip" v-if="isEditMode && !passwordRequired">
          {{ $t("users.passwordOptional") }}
        </div>
      </el-form-item>

      <el-form-item :label="$t('users.status')" prop="isActive">
        <el-switch
            v-model="form.isActive"
            :active-text="$t('users.active')"
            :inactive-text="$t('users.inactive')"
        />
      </el-form-item>

      <el-form-item
          v-if="isEditMode && originalUser?.lastLogin"
          :label="$t('users.lastLogin')"
      >
        <el-text type="info">{{ formatDateTime(originalUser.lastLogin) }}</el-text>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ $t("actions.cancel") }}
      </el-button>
      <el-button
          v-permission="isEditMode ? 'users.edit' : 'users.create'"
          type="primary"
          :loading="loading"
          @click="handleSubmit"
      >
        {{ isEditMode ? $t("actions.update") : $t("actions.create") }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {computed, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {ElMessage} from "element-plus";
import {useAuthStore} from "@/stores/auth";
import {userService} from "@/services/userService";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "success"]);

const authStore = useAuthStore();
const {t} = useI18n();

const formRef = ref();
const loading = ref(false);
const originalUser = ref(null);

const isEditMode = computed(() => !!props.userId);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const roleOptions = ref([
  {name: "superadmin", displayName: "Super Admin", isSystem: true},
  {name: "admin", displayName: "Admin", isSystem: true},
  {name: "cashier", displayName: "Cashier", isSystem: true},
  {name: "user", displayName: "User", isSystem: true},
]);

const form = reactive({
  name: "",
  phone: "",
  role: "user",
  password: "",
  isActive: true,
  isVerified: true,
});

// Require password only when promoting from user -> non-user
const passwordRequired = computed(() => {
  if (!originalUser.value || !isEditMode.value) {
    return form.role && form.role !== "user";
  }
  return originalUser.value.role === "user" && form.role !== "user";
});

const passwordPlaceholder = computed(() => {
  if (!isEditMode.value) {
    return t("auth.password");
  }
  return passwordRequired.value
      ? t("auth.password")
      : t("settings.changePassword");
});

// Phone number validation
const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error(t("validation.phoneRequired")));
  } else if (!/^\+855[0-9]{8,9}$/.test(value)) {
    callback(new Error(t("validation.phoneInvalid")));
  } else {
    callback();
  }
};

// Password validation
const validatePassword = (rule, value, callback) => {
  if (form.role) {
    if (passwordRequired.value && !value) {
      return callback(new Error(t("validation.passwordRequired")));
    }
    if (value && value.length < 6) {
      return callback(new Error(t("validation.passwordMin")));
    }
  } else if (value && value.length < 6) {
    return callback(new Error(t("validation.passwordMin")));
  }
  callback();
};

const rules = {
  name: [
    {required: true, message: t("validation.required"), trigger: "blur"},
    {
      min: 2,
      max: 50,
      message: "Name must be between 2 and 50 characters",
      trigger: "blur",
    },
  ],
  phone: [{required: true, validator: validatePhone, trigger: "blur"}],
  role: [
    {required: true, message: t("validation.required"), trigger: "change"},
  ],
  password: [{validator: validatePassword, trigger: "blur"}],
};

// Format phone number
const formatPhoneNumber = (value) => {
  let cleaned = value.replace(/[^+\d]/g, "");

  if (cleaned && !cleaned.startsWith("+855")) {
    if (cleaned.startsWith("855")) {
      cleaned = "+" + cleaned;
    } else if (cleaned.startsWith("0")) {
      cleaned = "+855" + cleaned.substring(1);
    } else if (!cleaned.startsWith("+")) {
      cleaned = "+855" + cleaned;
    }
  }
  form.phone = cleaned;
};

// Load user data for edit mode
const loadUser = async () => {
  if (!props.userId) return;

  loading.value = true;
  try {
    const userData = await userService.getUser(props.userId);
    originalUser.value = userData;

    // Populate form
    Object.assign(form, {
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      password: "",
      isActive: userData.status === "active",
      isVerified: userData.isVerified,
    });
  } catch (error) {
    console.error("Load user error:", error);
    ElMessage.error("Failed to load user data");
    dialogVisible.value = false;
  } finally {
    loading.value = false;
  }
};

// Submit form
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    if (isEditMode.value) {
      // Update user
      const updateData = {
        name: form.name,
        phone: form.phone,
        role: form.role,
        status: form.isActive ? "active" : "inactive",
        isVerified: form.isVerified,
      };

      if (form.password) {
        updateData.password = form.password;
      }

      await userService.updateUser(props.userId, updateData);
      ElMessage.success(t("users.updateSuccess") || "User updated successfully");
    } else {
      // Create user
      await userService.createUser(form);
      ElMessage.success(t("users.createSuccess") || "User created successfully");
    }

    dialogVisible.value = false;
    emit("success");
  } catch (error) {
    console.error("Submit user error:", error);

    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error(
          isEditMode.value ? "Failed to update user" : "Failed to create user"
      );
    }
  } finally {
    loading.value = false;
  }
};

// Reset form when dialog closes
const handleClosed = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(form, {
    name: "",
    phone: "",
    role: "user",
    password: "",
    isActive: true,
    isVerified: true,
  });
  originalUser.value = null;
};

// Format date time
const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

// Watch dialog visibility to load user data
watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal && isEditMode.value) {
        loadUser();
      }
    }
);

// Watch role changes to re-validate password
watch(
    () => form.role,
    () => {
      if (formRef.value) {
        formRef.value.validateField("password");
      }
    }
);
</script>

<style scoped>
.el-form-item__label {
  font-weight: 500;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}
</style>
