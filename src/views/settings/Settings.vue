<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="20"><Setting /></el-icon>
          <span>Generation Settings</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="default"
      >
        <!-- Static Configuration Section -->
        <el-divider content-position="left">
          <el-icon><DocumentCopy /></el-icon>
          Static Configuration
        </el-divider>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="Code Prefix" prop="prefix">
              <el-input v-model="form.prefix" placeholder="e.g. BK-" clearable>
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="Start Number" prop="startNumber">
              <el-input-number
                v-model="form.startNumber"
                :min="1"
                :max="999999"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="Number Length" prop="length">
              <el-input-number
                v-model="form.length"
                :min="1"
                :max="12"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Preview -->
        <el-alert
          :title="`Next Code Preview: ${previewCode}`"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            This is a preview based on your current settings.
          </template>
        </el-alert>

        <!-- Behavior Section -->
        <el-divider content-position="left">
          <el-icon><Tools /></el-icon>
          Behavior
        </el-divider>

        <el-form-item>
          <el-switch
            v-model="form.autoGenerate"
            active-text="Auto-generate on new booking"
            inactive-text="Manual generation only"
            style="--el-switch-on-color: #13ce66"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="Reset Counter" prop="resetType">
              <el-select
                v-model="form.resetType"
                placeholder="Select reset frequency"
                style="width: 100%"
              >
                <el-option label="Never Reset" value="never" />
                <el-option label="Daily" value="daily" />
                <el-option label="Monthly" value="monthly" />
                <el-option label="Yearly" value="yearly" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Date Format" prop="dateFormat">
              <el-select
                v-model="form.dateFormat"
                placeholder="Select format"
                style="width: 100%"
              >
                <el-option label="YYYYMMDD (20250122)" value="YYYYMMDD" />
                <el-option label="YYMMDD (250122)" value="YYMMDD" />
                <el-option label="MMDDYY (012225)" value="MMDDYY" />
                <el-option label="None" value="none" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Advanced Options -->
        <el-divider content-position="left">
          <el-icon><Operation /></el-icon>
          Advanced
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Custom Pattern (Optional)">
              <el-input
                v-model="form.customPattern"
                placeholder="e.g. {prefix}{date}{number}"
                clearable
              >
                <template #append>
                  <el-button :icon="QuestionFilled" @click="showPatternHelp" />
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Action Buttons -->
        <el-divider />

        <div class="action-buttons">
          <el-button @click="resetToDefault" :icon="RefreshLeft">
            Reset to Default
          </el-button>

          <div class="right-buttons">
            <el-button
              type="warning"
              :icon="MagicStick"
              @click="generateNow"
              :loading="isGenerating"
            >
              Generate Now
            </el-button>

            <el-button
              type="primary"
              :icon="Check"
              @click="save"
              :loading="isSaving"
            >
              Save Settings
            </el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- Statistics Card -->
    <el-card class="stats-card">
      <template #header>
        <div class="card-header">
          <el-icon><DataAnalysis /></el-icon>
          <span>Generation Statistics</span>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <el-statistic title="Total Generated" :value="stats.total">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-statistic>
        </el-col>

        <el-col :xs="12" :sm="6">
          <el-statistic title="Today" :value="stats.today">
            <template #prefix>
              <el-icon><Calendar /></el-icon>
            </template>
          </el-statistic>
        </el-col>

        <el-col :xs="12" :sm="6">
          <el-statistic title="This Month" :value="stats.thisMonth">
            <template #prefix>
              <el-icon><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-col>

        <el-col :xs="12" :sm="6">
          <el-statistic title="Last Number" :value="stats.lastNumber">
            <template #prefix>
              <el-icon><Stamp /></el-icon>
            </template>
          </el-statistic>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Setting,
  DocumentCopy,
  Key,
  Tools,
  Operation,
  QuestionFilled,
  RefreshLeft,
  MagicStick,
  Check,
  DataAnalysis,
  Document,
  Calendar,
  TrendCharts,
  Stamp,
} from "@element-plus/icons-vue";

const formRef = ref();
const isSaving = ref(false);
const isGenerating = ref(false);

const form = reactive({
  prefix: "BK-",
  startNumber: 1,
  length: 4,
  autoGenerate: true,
  resetType: "never",
  dateFormat: "none",
  customPattern: "",
});

const stats = reactive({
  total: 1247,
  today: 23,
  thisMonth: 456,
  lastNumber: 1247,
});

const rules = reactive({
  prefix: [
    { required: true, message: "Please enter a prefix", trigger: "blur" },
    { max: 10, message: "Max 10 characters", trigger: "blur" },
  ],
  startNumber: [
    { required: true, message: "Please enter start number", trigger: "blur" },
  ],
  length: [
    { required: true, message: "Please enter number length", trigger: "blur" },
  ],
});

const previewCode = computed(() => {
  const num = String(form.startNumber).padStart(form.length, "0");
  return `${form.prefix}${num}`;
});

onMounted(async () => {
  // Load settings from API
  // const saved = await api.get('/settings/generation')
  // Object.assign(form, saved)
});

const save = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    try {
      isSaving.value = true;
      // await api.post('/settings/generation', form)
      console.log("Saving settings", { ...form });

      ElMessage.success("Settings saved successfully!");
    } catch (e) {
      console.error(e);
      ElMessage.error("Failed to save settings");
    } finally {
      isSaving.value = false;
    }
  });
};

const resetToDefault = () => {
  ElMessageBox.confirm(
    "This will reset all settings to default values. Continue?",
    "Reset Settings",
    {
      confirmButtonText: "Reset",
      cancelButtonText: "Cancel",
      type: "warning",
    }
  )
    .then(() => {
      form.prefix = "BK-";
      form.startNumber = 1;
      form.length = 4;
      form.autoGenerate = true;
      form.resetType = "never";
      form.dateFormat = "none";
      form.customPattern = "";

      ElMessage.info("Settings reset to default");
    })
    .catch(() => {
      // Cancelled
    });
};

const generateNow = async () => {
  try {
    isGenerating.value = true;
    // const result = await api.post('/generation/run-once')
    console.log("Generate now clicked");

    ElMessage.success({
      message: `New code generated: ${previewCode.value}`,
      duration: 3000,
    });
  } catch (e) {
    console.error(e);
    ElMessage.error("Failed to generate code");
  } finally {
    isGenerating.value = false;
  }
};

const showPatternHelp = () => {
  ElMessageBox.alert(
    "Available tokens:\n\n" +
      "{prefix} - Your code prefix\n" +
      "{date} - Current date (format based on Date Format setting)\n" +
      "{number} - Sequential number\n\n" +
      "Example: {prefix}{date}{number} → BK-20250122-0001",
    "Pattern Help",
    {
      confirmButtonText: "Got it",
    }
  );
};
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 16px;
}

.settings-card {
  margin-bottom: 20px;
}

.stats-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.right-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Match sidebar font sizing */
:deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-input__inner) {
  font-size: 14px;
}

:deep(.el-select .el-input__inner) {
  font-size: 14px;
}

:deep(.el-button) {
  font-size: 14px;
}

:deep(.el-switch__label) {
  font-size: 14px;
}

:deep(.el-divider__text) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-alert__title) {
  font-size: 14px;
}

:deep(.el-alert__description) {
  font-size: 13px;
}

:deep(.el-statistic__head) {
  font-size: 13px;
}

:deep(.el-statistic__content) {
  font-size: 20px;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .right-buttons {
    flex-direction: column;
  }
}
</style>