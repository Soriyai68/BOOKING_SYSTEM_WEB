<template>
  <div class="image-upload">
    <!-- Preview Section -->
    <div v-if="previewUrl" class="preview-section">
      <img :src="previewUrl" alt="Preview" class="preview-image" />
      <div class="preview-actions">
        <el-button size="small" type="danger" @click="handleRemove">
          <el-icon><Trash2 /></el-icon>
          {{ $t("actions.remove") }}
        </el-button>
      </div>
    </div>

    <!-- Upload Section -->
    <div v-else class="upload-section">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileChange"
        :before-upload="beforeUpload"
        :accept="acceptedTypes"
        drag
      >
        <div class="upload-content">
          <el-icon class="upload-icon"><Upload /></el-icon>
          <div class="upload-text">
            <p>{{ $t("upload.dragDrop") }}</p>
            <p class="upload-hint">
              {{ $t("upload.or") }} <em>{{ $t("upload.clickToUpload") }}</em>
            </p>
          </div>
          <div class="upload-info">
            <p>{{ acceptedFormats }}</p>
            <p>{{ $t("upload.maxSize", { size: maxSizeMB }) }}</p>
          </div>
        </div>
      </el-upload>

      <!-- URL Input Option -->
      <el-divider>{{ $t("upload.orUseUrl") }}</el-divider>
      <el-input
        v-model="urlInput"
        :placeholder="$t('upload.enterImageUrl')"
        clearable
        @change="handleUrlChange"
      >
        <template #prepend>
          <el-icon><Link2 /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="upload-progress">
      <el-progress :percentage="uploadProgress" :status="uploadStatus" />
      <p class="progress-text">{{ uploadProgressText }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import api from "@/utils/api";
import { Upload, Link2, Trash2 } from "lucide-vue-next";

const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  maxSizeMB: {
    type: Number,
    default: 10,
  },
  acceptedTypes: {
    type: String,
    default: "image/jpeg,image/jpg,image/png,image/gif,image/webp",
  },
});

const emit = defineEmits([
  "update:modelValue",
  "upload-success",
  "upload-error",
]);

const uploadRef = ref();
const previewUrl = ref(props.modelValue || "");
const urlInput = ref("");
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadStatus = ref("");
const uploadProgressText = ref("");
const currentFile = ref(null);

const acceptedFormats = computed(() => {
  const formats = props.acceptedTypes
    .split(",")
    .map((type) => type.split("/")[1].toUpperCase());
  return `${t("upload.supportedFormats")}: ${formats.join(", ")}`;
});

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue !== previewUrl.value) {
      previewUrl.value = newValue;
    }
  }
);

const beforeUpload = (file) => {
  // Check file type
  if (!props.acceptedTypes.includes(file.type)) {
    ElMessage.error(t("upload.invalidFileType"));
    return false;
  }

  // Check file size
  const maxSize = props.maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error(t("upload.fileTooLarge", { size: props.maxSizeMB }));
    return false;
  }

  return true;
};

const handleFileChange = (file) => {
  if (!beforeUpload(file.raw)) {
    return;
  }

  currentFile.value = file.raw;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file.raw);

  // Auto upload
  uploadImage();
};

const uploadImage = async () => {
  if (!currentFile.value) return;

  uploading.value = true;
  uploadProgress.value = 0;
  uploadStatus.value = "";
  uploadProgressText.value = t("upload.uploading");

  try {
    const formData = new FormData();
    formData.append("image", currentFile.value);

    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
      },
    });

    if (response.data.success) {
      const imageUrl = response.data.data.url;
      previewUrl.value = imageUrl;
      emit("update:modelValue", imageUrl);
      emit("upload-success", response.data.data);

      uploadStatus.value = "success";
      uploadProgressText.value = t("upload.uploadSuccess");

      setTimeout(() => {
        uploading.value = false;
      }, 1000);
    } else {
      throw new Error(response.data.message || "Upload failed");
    }
  } catch (error) {
    console.error("Upload error:", error);
    uploadStatus.value = "exception";
    uploadProgressText.value = t("upload.uploadFailed");

    ElMessage.error(error.response?.data?.message || t("upload.uploadFailed"));
    emit("upload-error", error);

    // Clear preview on error
    previewUrl.value = "";
    currentFile.value = null;

    setTimeout(() => {
      uploading.value = false;
    }, 2000);
  }
};

const handleUrlChange = () => {
  if (urlInput.value) {
    // Validate URL format
    try {
      new URL(urlInput.value);
      previewUrl.value = urlInput.value;
      emit("update:modelValue", urlInput.value);
      emit("upload-success", { url: urlInput.value, source: "url" });
    } catch (e) {
      ElMessage.error(t("upload.invalidUrl"));
      urlInput.value = "";
    }
  }
};

const handleRemove = () => {
  previewUrl.value = "";
  urlInput.value = "";
  currentFile.value = null;
  emit("update:modelValue", "");

  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// Expose method to parent components
defineExpose({
  clearUpload: handleRemove,
});
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.preview-section {
  position: relative;
  display: inline-block;
}

.preview-image {
  max-width: 300px;
  max-height: 450px;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  display: block;
}

.preview-actions {
  margin-top: 12px;
  text-align: center;
}

.upload-section {
  width: 100%;
}

.upload-content {
  padding: 40px 20px;
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: var(--el-color-primary);
  margin-bottom: 16px;
}

.upload-text {
  margin-bottom: 16px;
}

.upload-text p {
  margin: 4px 0;
  color: var(--el-text-color-regular);
}

.upload-hint {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.upload-hint em {
  color: var(--el-color-primary);
  font-style: normal;
}

.upload-info {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.upload-info p {
  margin: 4px 0;
}

.upload-progress {
  margin-top: 16px;
}

.progress-text {
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  background-color: var(--el-fill-color-lighter);
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
}
</style>
