<template>
  <div class="profile-page">
    <el-row :gutter="24">
      <!-- Profile Card -->
      <el-col :xs="24" :sm="24" :md="8" :lg="6">
        <el-card class="profile-card">
          <div class="profile-header">
            <div class="avatar-container">
              <el-avatar :size="100" class="profile-avatar" :src="user?.photoUrl">
                <el-icon :size="50"><User /></el-icon>
              </el-avatar>
              <el-upload
                class="avatar-uploader"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :http-request="handleAvatarUpload"
                accept="image/jpeg,image/jpg,image/png,image/webp"
              >
                <el-button
                  circle
                  size="small"
                  class="upload-btn"
                  :loading="uploadingPhoto"
                >
                  <el-icon><Camera /></el-icon>
                </el-button>
              </el-upload>
            </div>
            <h3 class="profile-name">{{ user?.name || "N/A" }}</h3>
            <el-tag :type="getRoleType(user?.role)" size="large">
              {{ $t(`users.${user?.role}`) || user?.role }}
            </el-tag>
          </div>

          <el-divider />

          <div class="profile-info">
            <div class="info-item">
              <el-icon class="info-icon"><Phone /></el-icon>
              <div class="info-content">
                <span class="info-label">{{ $t("users.phone") }}</span>
                <span class="info-value">{{ user?.phone || "N/A" }}</span>
              </div>
            </div>

            <div class="info-item">
              <el-icon class="info-icon"><Mail /></el-icon>
              <div class="info-content">
                <span class="info-label">{{ $t("users.email") }}</span>
                <span class="info-value">{{ user?.email || "N/A" }}</span>
              </div>
            </div>

            <div class="info-item">
              <el-icon class="info-icon"><Shield /></el-icon>
              <div class="info-content">
                <span class="info-label mt-1"
                  >{{ $t("users.status") }}</span
                >
                <el-tag type="success" size="small"> active </el-tag>
              </div>
            </div>

            <div class="info-item" v-if="user?.lastLogin">
              <el-icon class="info-icon"><Clock /></el-icon>
              <div class="info-content">
                <span class="info-label">{{ $t("users.lastLogin") }}</span>
                <span class="info-value">{{
                  formatDateTime(user.lastLogin)
                }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Profile Details & Settings -->
      <el-col :xs="24" :sm="24" :md="16" :lg="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>{{ $t("profile.accountSettings") }}</h3>
            </div>
          </template>

          <el-tabs v-model="activeTab">
            <!-- Profile Information Tab -->
            <el-tab-pane :label="$t('profile.profileInfo')" name="info">
              <el-form
                ref="profileFormRef"
                :model="profileForm"
                :rules="profileRules"
                label-width="140px"
                class="profile-form"
              >
                <el-form-item :label="$t('users.name')" prop="name">
                  <el-input
                    v-model="profileForm.name"
                    :placeholder="$t('users.name')"
                    maxlength="50"
                    show-word-limit
                  />
                </el-form-item>

                <el-form-item :label="$t('users.username')" prop="username">
                  <el-input
                    v-model="profileForm.username"
                    :placeholder="$t('users.username')"
                    maxlength="30"
                    disabled
                  />
                  <div class="form-tip">
                    {{ $t("profile.usernameCannotChange") }}
                  </div>
                </el-form-item>

                <el-form-item :label="$t('users.email')" prop="email">
                  <el-input
                    v-model="profileForm.email"
                    :placeholder="$t('users.email')"
                    type="email"
                  />
                </el-form-item>

                <el-form-item :label="$t('users.phone')" prop="phone">
                  <el-input
                    v-model="profileForm.phone"
                    :placeholder="$t('users.phone')"
                    disabled
                  />
                  <div class="form-tip">
                    {{ $t("profile.phoneCannotChange") }}
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="updating"
                    @click="updateProfile"
                  >
                    {{ $t("actions.update") }}
                  </el-button>
                  <el-button @click="resetProfileForm">
                    {{ $t("actions.reset") }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- Change Password Tab -->
            <el-tab-pane :label="$t('settings.changePassword')" name="password">
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="140px"
                class="profile-form"
              >
                <el-form-item
                  :label="$t('settings.currentPassword')"
                  prop="currentPassword"
                >
                  <el-input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    :placeholder="$t('settings.currentPassword')"
                    show-password
                  />
                </el-form-item>

                <el-form-item
                  :label="$t('settings.newPassword')"
                  prop="newPassword"
                >
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    :placeholder="$t('settings.newPassword')"
                    show-password
                  />
                </el-form-item>

                <el-form-item
                  :label="$t('settings.confirmPassword')"
                  prop="confirmPassword"
                >
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    :placeholder="$t('settings.confirmPassword')"
                    show-password
                  />
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    :loading="changingPassword"
                    @click="changePassword"
                  >
                    {{ $t("actions.update") }}
                  </el-button>
                  <el-button @click="resetPasswordForm">
                    {{ $t("actions.reset") }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAppStore } from "@/stores/app";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { User, Phone, Mail, Shield, Clock, Camera } from "lucide-vue-next";
import { userService } from "@/services/userService";
import api from "@/utils/api";

const authStore = useAuthStore();
const appStore = useAppStore();
const { t } = useI18n();

const activeTab = ref("info");
const updating = ref(false);
const changingPassword = ref(false);
const uploadingPhoto = ref(false);
const profileFormRef = ref();
const passwordFormRef = ref();

const user = computed(() => authStore.user);

// Profile form
const profileForm = reactive({
  name: "",
  username: "",
  email: "",
  phone: "",
});

// Password form
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Validation rules
const profileRules = {
  name: [
    { required: true, message: t("validation.required"), trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "Name must be between 2 and 50 characters",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: t("validation.emailRequired"), trigger: "blur" },
    { type: "email", message: t("validation.emailInvalid"), trigger: "blur" },
  ],
};

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error(t("validation.passwordRequired")));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error(t("profile.passwordsDoNotMatch")));
  } else {
    callback();
  }
};

const passwordRules = {
  currentPassword: [
    {
      required: true,
      message: t("validation.passwordRequired"),
      trigger: "blur",
    },
  ],
  newPassword: [
    {
      required: true,
      message: t("validation.passwordRequired"),
      trigger: "blur",
    },
    { min: 6, message: t("validation.passwordMin"), trigger: "blur" },
  ],
  confirmPassword: [
    {
      required: true,
      message: t("validation.passwordRequired"),
      trigger: "blur",
    },
    { validator: validateConfirmPassword, trigger: ["blur", "change"] },
  ],
};

// Get role type for tag color
const getRoleType = (role) => {
  if (role === "superadmin" || role === "admin") return "warning";
  if (role === "cashier") return "success";
  return "info";
};

// Format date time
const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString();
};

// Load user profile
const loadProfile = () => {
  if (user.value) {
    profileForm.name = user.value.name || "";
    profileForm.username = user.value.username || "";
    profileForm.email = user.value.email || "";
    profileForm.phone = user.value.phone || "";
  }
};

// Update profile
const updateProfile = async () => {
  if (!profileFormRef.value) return;

  try {
    await profileFormRef.value.validate();
    updating.value = true;

    const updateData = {
      name: profileForm.name,
      email: profileForm.email,
    };

    // Use the user's _id or id field
    const userId = user.value._id || user.value.id;
    if (!userId) {
      throw new Error("User ID not found");
    }

    await userService.updateUser(userId, updateData);

    // Update auth store
    await authStore.fetchUserProfile();

    ElMessage.success(t("profile.profileUpdated"));
  } catch (error) {
    if (error !== "cancel") {
      console.error("Update profile error:", error);
      ElMessage.error(
        error.response?.data?.message || t("profile.updateFailed")
      );
    }
  } finally {
    updating.value = false;
  }
};

// Reset profile form
const resetProfileForm = () => {
  loadProfile();
};

// Change password
const changePassword = async () => {
  console.log("changePassword function called");
  console.log("passwordFormRef:", passwordFormRef.value);

  if (!passwordFormRef.value) {
    console.error("passwordFormRef is null");
    return;
  }

  try {
    console.log("Starting validation...");
    await passwordFormRef.value.validate();
    console.log("Validation passed");

    changingPassword.value = true;

    console.log("Sending password change request with data:", {
      currentPassword: "***",
      newPassword: "***",
      confirmPassword: "***",
    });

    // Use the auth change-password endpoint
    const response = await api.post("/auth/change-password", {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    });

    console.log("Password change response:", response);

    if (response.data.success) {
      ElMessage.success(t("profile.passwordChanged"));
      resetPasswordForm();
    } else {
      ElMessage.error(
        response.data.message || t("profile.passwordChangeFailed")
      );
    }
  } catch (error) {
    console.error("Change password error:", error);
    console.error("Error response:", error.response);
    console.error("Error message:", error.message);

    if (error !== "cancel") {
      const errorMessage =
        error.response?.data?.message || t("profile.passwordChangeFailed");
      ElMessage.error(errorMessage);
    }
  } finally {
    changingPassword.value = false;
    console.log("changePassword function completed");
  }
};

// Reset password form
const resetPasswordForm = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields();
  }
  passwordForm.currentPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
};

// Before avatar upload validation
const beforeAvatarUpload = (file) => {
  const isImage = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
    file.type
  );
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error("Avatar must be JPG, PNG, or WebP format!");
    return false;
  }
  if (!isLt5M) {
    ElMessage.error("Avatar size must be less than 5MB!");
    return false;
  }
  return true;
};

// Handle avatar upload
const handleAvatarUpload = async (options) => {
  const { file } = options;
  uploadingPhoto.value = true;

  try {
    // Create form data
    const formData = new FormData();
    formData.append("image", file);

    // Upload to server
    const uploadResponse = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (uploadResponse.data.success) {
      const photoUrl = uploadResponse.data.data.url;

      // Update user profile with new photo URL
      const userId = user.value._id || user.value.id;
      await api.put(`/users/${userId}/photo`, { photoUrl });

      // Refresh user profile
      await authStore.fetchUserProfile();

      ElMessage.success(t("profile.photoUpdated"));
    } else {
      throw new Error(uploadResponse.data.message || "Upload failed");
    }
  } catch (error) {
    console.error("Avatar upload error:", error);
    ElMessage.error(
      error.response?.data?.message || t("profile.photoUploadFailed")
    );
  } finally {
    uploadingPhoto.value = false;
  }
};

onMounted(() => {
  appStore.setBreadcrumbs([
    { title: t("nav.dashboard"), path: "/admin/dashboard" },
    { title: t("nav.profile"), path: "/admin/profile" },
  ]);

  loadProfile();
});

// Watch for changes in newPassword to re-validate confirmPassword
watch(
  () => passwordForm.newPassword,
  () => {
    if (passwordFormRef.value && passwordForm.confirmPassword) {
      passwordFormRef.value.validateField("confirmPassword");
    }
  }
);
</script>

<style scoped>
.profile-page {
  padding: 0;
}

.profile-card {
  text-align: center;
}

.profile-header {
  padding: 20px 0;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.profile-avatar {
  background: linear-gradient(
    135deg,
    var(--el-color-primary),
    var(--el-color-primary-light-3)
  );
}

.avatar-uploader {
  position: absolute;
  bottom: 0;
  right: 0;
}

.upload-btn {
  background: var(--el-color-primary);
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.upload-btn:hover {
  background: var(--el-color-primary-dark-2);
}

.profile-name {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.profile-info {
  text-align: left;
  padding: 0 8px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  font-size: 18px;
  color: var(--el-color-primary);
  margin-top: 2px;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.info-value {
  font-size: 14px;
  color: var(--el-text-color-primary);
  word-break: break-word;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.profile-form {
  max-width: 600px;
  margin-top: 20px;
}

.form-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-top: 4px;
}

:deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .profile-form {
    max-width: 100%;
  }

  :deep(.el-form-item__label) {
    width: 100% !important;
    text-align: left;
  }
}
</style>
