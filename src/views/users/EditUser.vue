<template>
  <div class="edit-user">
    <div class="page-header">
      <h2>{{ $t("users.editUser") }}</h2>
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        {{ $t("actions.back") }}
      </el-button>
    </div>

    <el-card v-loading="pageLoading">
      <!-- Loading state -->
      <div v-if="pageLoading" class="loading-placeholder">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- Error state -->
      <div v-else-if="loadError" class="error-state">
        <el-result
          icon="error"
          :title="$t('messages.error')"
          :sub-title="loadError"
        >
          <template #extra>
            <el-button type="primary" @click="loadUser">{{
              $t("actions.refresh")
            }}</el-button>
            <el-button @click="$router.back()">{{
              $t("actions.back")
            }}</el-button>
          </template>
        </el-result>
      </div>

      <!-- Edit form -->
      <el-form
        v-else
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        @submit.prevent="handleSubmit"
      >
        <!-- User Info Header -->
        <!-- <el-alert
          :title="`${$t('users.editUser')}: ${originalUser?.name || 'Unknown'}`"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <template #default>
            <p>{{ $t('users.phone') }}: <strong>{{ originalUser?.phone }}</strong></p>
            <p>{{ $t('users.created') }}: <strong>{{ formatDate(originalUser?.created_at) }}</strong></p>
          </template>
        </el-alert> -->

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
          v-if="form.role && form.role !== 'user'"
        >
          <el-input
            v-model="form.password"
            type="password"
            :placeholder="passwordRequired ? $t('auth.password') : $t('settings.changePassword')"
            show-password
          />
          <div class="form-tip" v-if="!passwordRequired">
            {{ $t("users.passwordOptional") }}
          </div>
        </el-form-item>

        <el-form-item :label="$t('users.status')" prop="status">
          <el-switch
            v-model="form.isActive"
            :active-text="$t('users.active')"
            :inactive-text="$t('users.inactive')"
          />
        </el-form-item>

        <!-- <el-form-item :label="$t('users.isVerified')">
          <el-switch
            v-model="form.isVerified"
            :active-text="$t('validation.verified')"
            :inactive-text="$t('validation.unverified')"
          />
        </el-form-item> -->

        <!-- Last Login Info -->
        <el-form-item
          :label="$t('users.lastLogin')"
          v-if="originalUser?.lastLogin"
        >
          <el-text type="info">{{
            formatDateTime(originalUser.lastLogin)
          }}</el-text>
        </el-form-item>

        <el-form-item>
          <el-button v-permission="'users.edit'" type="primary" :loading="loading" @click="handleSubmit">
            {{ $t("users.updateUser") }}
          </el-button>
          <el-button @click="resetForm">
            {{ $t("actions.reset") }}
          </el-button>
          <el-button v-permission="'users.delete'" type="danger" @click="handleDelete" v-if="canDelete">
            {{ $t("users.delete") }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import { userService } from "@/services/userService";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const authStore = useAuthStore();
const { t } = useI18n();

const formRef = ref();
const loading = ref(false);
const pageLoading = ref(false);
const loadError = ref("");
const originalUser = ref(null);

// Static roles (backend roles model removed)
const roleOptions = ref([
  { name: 'superadmin', displayName: 'Super Admin', isSystem: true },
  { name: 'admin', displayName: 'Admin', isSystem: true },
  { name: 'cashier', displayName: 'Cashier', isSystem: true },
  { name: 'user', displayName: 'User', isSystem: true },
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
  if (!originalUser.value) return false;
  return originalUser.value.role === 'user' && form.role !== 'user';
});

// Check if current user can delete this user
const canDelete = computed(() => {
  if (!originalUser.value) return false;

  // Can't delete yourself
  if (originalUser.value.id === authStore.user?.id) return false;

  // Only superadmin can delete superadmin
  if (originalUser.value.role === "superadmin" && !authStore.isSuperAdmin)
    return false;

  return authStore.isAdmin;
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

// Password validation (conditional)
const validatePassword = (rule, value, callback) => {
  if (form.role && form.role !== 'user') {
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
    { required: true, message: t("validation.required"), trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "Name must be between 2 and 50 characters",
      trigger: "blur",
    },
  ],
  phone: [{ required: true, validator: validatePhone, trigger: "blur" }],
  role: [
    { required: true, message: t("validation.required"), trigger: "change" },
  ],
  password: [{ validator: validatePassword, trigger: "blur" }],
};

// Roles are static; no fetch required

// Load user data
const loadUser = async () => {
  const userId = route.params.id;
  if (!userId) {
    loadError.value = "User ID is missing";
    return;
  }

  pageLoading.value = true;
  loadError.value = "";

  try {
    const userData = await userService.getUser(userId);
    originalUser.value = userData;

    // Populate form with user data
    Object.assign(form, {
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      password: "", // Always start with empty password
      isActive: userData.status === "active",
      isVerified: userData.isVerified,
    });
  } catch (error) {
    console.error("Load user error:", error);
    loadError.value =
      error.response?.data?.message || "Failed to load user data";
  } finally {
    pageLoading.value = false;
  }
};

// Re-validate password when role changes
watch(() => form.role, () => {
  if (formRef.value) formRef.value.validateField('password');
});

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

// Submit form
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    const updateData = {
      name: form.name,
      phone: form.phone,
      role: form.role,
      status: form.isActive ? "active" : "inactive",
      isVerified: form.isVerified,
    };

    // Only include password if provided (or required)
    if (form.password) {
      updateData.password = form.password;
    }

    await userService.updateUser(route.params.id, updateData);

    ElMessage.success(t("users.updateSuccess") || "User updated successfully");
    router.push("/admin/users");
  } catch (error) {
    console.error("Update user error:", error);

    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error("Failed to update user");
    }
  } finally {
    loading.value = false;
  }
};

// Delete user
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(t("users.confirmDelete"), t("users.delete"), {
      confirmButtonText: t("users.delete"),
      cancelButtonText: t("actions.cancel"),
      type: "warning",
    });

    await userService.deleteUser(route.params.id);
    ElMessage.success(t("users.deleteSuccess"));
    router.push("/admin/users");
  } catch (error) {
    if (error !== "cancel") {
      console.error("Delete user error:", error);
      ElMessage.error("Failed to delete user");
    }
  }
};

// Reset form to original data
const resetForm = () => {
  if (originalUser.value) {
    Object.assign(form, {
      name: originalUser.value.name,
      phone: originalUser.value.phone,
      role: originalUser.value.role,
      password: "",
      isActive: originalUser.value.status === "active",
      isVerified: originalUser.value.isVerified,
    });
  }

  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// Format date utility
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

// Format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

onMounted(async () => {
  await loadUser();

  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("users.title"), path: "/admin/users" },
    { title: t("users.editUser"), path: "#" },
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
  color: #303133;
}

.loading-placeholder {
  padding: 20px;
}

.error-state {
  text-align: center;
  padding: 40px 20px;
}

.el-form {
  max-width: 600px;
}

.el-form-item__label {
  font-weight: 500;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}

.el-alert {
  margin-bottom: 20px;
}

.el-alert p {
  margin: 4px 0;
}
</style>
