<template>
  <div class="backup-schedule-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <h3 class="section-title">{{ t('backup.scheduleConfiguration') }}</h3>
        <p class="section-description">
          {{ t('backup.backupScheduleDescription') }}
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="loadSchedule" :loading="isLoading">
          <RefreshCw :size="16" />
          {{ t('backup.refresh') }}
        </el-button>
      </div>
    </div>

    <!-- Current Schedule Status -->
    <div class="status-section">
      <el-card class="status-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">{{ t('backup.currentScheduleStatus') }}</span>
            <el-tag
              :type="currentSchedule?.enabled ? 'success' : 'info'"
              size="large"
            >
              {{ currentSchedule?.enabled ? t('backup.enabled') : t('backup.disabled') }}
            </el-tag>
          </div>
        </template>

        <div v-if="currentSchedule" class="schedule-info">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="6">
              <div class="info-item">
                <span class="info-label">{{ t('backup.schedule') }}</span>
                <span class="info-value">{{ currentSchedule.cronExpression }}</span>
                <span class="info-desc">{{ getCronDescription(currentSchedule.cronExpression) }}</span>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <div class="info-item">
                <span class="info-label">{{ t('backup.description') }}</span>
                <span class="info-value">{{ currentSchedule.description }}</span>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <div class="info-item">
                <span class="info-label">{{ t('backup.retention') }}</span>
                <span class="info-value">{{ currentSchedule.retentionDays }} {{ t('backup.days') }}</span>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <div class="info-item">
                <span class="info-label">{{ t('backup.lastUpdated') }}</span>
                <span class="info-value">{{ formatDateTime(currentSchedule.updatedAt) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- Schedule Configuration Form -->
    <div class="config-section">
      <el-card class="config-card">
        <template #header>
          <span class="card-title">{{ t('backup.scheduleConfiguration') }}</span>
        </template>

        <el-form
          :model="scheduleForm"
          :rules="scheduleRules"
          ref="scheduleFormRef"
          label-width="140px"
          class="schedule-form"
        >
          <el-form-item :label="t('backup.enableSchedule')" prop="enabled">
            <el-switch
              v-model="scheduleForm.enabled"
              :active-text="t('backup.enabled')"
              :inactive-text="t('backup.disabled')"
              size="large"
            />
            <div class="form-help-text">
              {{ t('backup.enableScheduleHelp') }}
            </div>
          </el-form-item>

          <el-form-item :label="t('backup.scheduleType')" prop="scheduleType">
            <el-radio-group v-model="scheduleType" @change="onScheduleTypeChange">
              <el-radio value="predefined">{{ t('backup.predefinedSchedule') }}</el-radio>
              <el-radio value="custom">{{ t('backup.customCronExpression') }}</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            v-if="scheduleType === 'predefined'"
            :label="t('backup.predefinedSchedule')"
            prop="predefinedSchedule"
          >
            <el-select
              v-model="predefinedSchedule"
              :placeholder="t('backup.selectPredefinedSchedule')"
              style="width: 100%"
              @change="onPredefinedScheduleChange"
            >
              <el-option
                v-for="schedule in predefinedSchedules"
                :key="schedule.value"
                :label="schedule.label"
                :value="schedule.value"
              >
                <div class="schedule-option">
                  <span class="schedule-label">{{ schedule.label }}</span>
                  <span class="schedule-desc">{{ schedule.description }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item
            v-if="scheduleType === 'custom'"
            :label="t('backup.cronExpression')"
            prop="cronExpression"
          >
            <el-input
              v-model="scheduleForm.cronExpression"
              :placeholder="t('backup.cronExpressionPlaceholder')"
              @blur="validateCronExpression"
            />
            <div class="form-help-text">
              <div>{{ t('backup.cronFormat') }}</div>
              <div v-if="cronValidation.isValid" class="cron-description">
                {{ cronValidation.description }}
              </div>
              <div v-else-if="cronValidation.error" class="cron-error">
                {{ cronValidation.error }}
              </div>
            </div>
          </el-form-item>

          <el-form-item :label="t('backup.description')" prop="description">
            <el-input
              v-model="scheduleForm.description"
              :placeholder="t('backup.descriptionPlaceholder')"
              maxlength="255"
              show-word-limit
            />
          </el-form-item>

          <el-form-item :label="t('backup.retentionDays')" prop="retentionDays">
            <el-input-number
              v-model="scheduleForm.retentionDays"
              :min="1"
              :max="365"
              controls-position="right"
              style="width: 200px"
            />
            <div class="form-help-text">
              {{ t('backup.retentionDaysHelp') }}
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="isSaving"
              @click="saveSchedule"
            >
              {{ t('backup.saveConfiguration') }}
            </el-button>
            <el-button @click="resetForm">
              {{ t('backup.reset') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- Cron Expression Helper -->
    <div class="helper-section">
      <el-card class="helper-card">
        <template #header>
          <span class="card-title">{{ t('backup.cronExpressionHelper') }}</span>
        </template>

        <div class="cron-helper">
          <div class="cron-format">
            <h4>{{ t('backup.cronFormat') }}</h4>
            <div class="format-example">
              <code>* * * * *</code>
            </div>
            <div class="format-labels">
              <span>{{ t('backup.minute') }}</span>
              <span>{{ t('backup.hour') }}</span>
              <span>{{ t('backup.day') }}</span>
              <span>{{ t('backup.month') }}</span>
              <span>{{ t('backup.weekday') }}</span>
            </div>
          </div>

          <div class="cron-examples">
            <h4>{{ t('backup.commonExamples') }}</h4>
            <div class="examples-grid">
              <div class="example-item" v-for="example in cronExamples" :key="example.expression">
                <code class="example-code">{{ example.expression }}</code>
                <span class="example-desc">{{ example.description }}</span>
              </div>
            </div>
          </div>

          <div class="cron-wildcards">
            <h4>{{ t('backup.specialCharacters') }}</h4>
            <div class="wildcards-grid">
              <div class="wildcard-item">
                <code>*</code>
                <span>{{ t('backup.anyValue') }}</span>
              </div>
              <div class="wildcard-item">
                <code>,</code>
                <span>{{ t('backup.listSeparator') }}</span>
              </div>
              <div class="wildcard-item">
                <code>-</code>
                <span>{{ t('backup.rangeValues') }}</span>
              </div>
              <div class="wildcard-item">
                <code>/</code>
                <span>{{ t('backup.stepValues') }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { backupService } from '@/services/backupService';
import { RefreshCw } from 'lucide-vue-next';

// i18n
const { t } = useI18n();

// Reactive data
const currentSchedule = ref(null);
const isLoading = ref(false);
const isSaving = ref(false);
const scheduleType = ref('predefined');
const predefinedSchedule = ref('');
const scheduleFormRef = ref();

// Form data
const scheduleForm = reactive({
  enabled: false,
  cronExpression: '0 2 * * *',
  description: t('backup.scheduledBackup'),
  retentionDays: 7
});

// Validation
const cronValidation = ref({
  isValid: false,
  description: '',
  error: ''
});

const scheduleRules = {
  cronExpression: [
    { required: true, message: t('backup.cronExpressionRequired'), trigger: 'blur' },
    { validator: validateCronRule, trigger: 'blur' }
  ],
  description: [
    { required: true, message: t('backup.descriptionRequired'), trigger: 'blur' },
    { min: 1, max: 255, message: t('backup.descriptionLength'), trigger: 'blur' }
  ],
  retentionDays: [
    { required: true, message: t('backup.retentionDaysRequired'), trigger: 'blur' },
    { type: 'number', min: 1, max: 365, message: t('backup.retentionDaysRange'), trigger: 'blur' }
  ]
};

// Computed
const predefinedSchedules = computed(() => backupService.getPredefinedSchedules());

const cronExamples = [
  { expression: '0 * * * *', description: t('backup.everyHour') },
  { expression: '0 2 * * *', description: t('backup.dailyAt2AM') },
  { expression: '0 */6 * * *', description: t('backup.every6Hours') },
  { expression: '0 0 * * 0', description: t('backup.weeklySunday') },
  { expression: '0 0 1 * *', description: t('backup.monthlyOn1st') },
  { expression: '30 1 * * 1-5', description: t('backup.weekdaysAt130AM') }
];

// Methods
const loadSchedule = async () => {
  try {
    isLoading.value = true;
    const response = await backupService.getSchedule();
    
    if (response.success) {
      currentSchedule.value = response.data;
      
      // Update form with current schedule
      Object.assign(scheduleForm, response.data);
      
      // Check if it's a predefined schedule
      const predefined = predefinedSchedules.value.find(
        s => s.value === response.data.cronExpression
      );
      
      if (predefined) {
        scheduleType.value = 'predefined';
        predefinedSchedule.value = predefined.value;
      } else {
        scheduleType.value = 'custom';
      }
      
      validateCronExpression();
    } else {
      ElMessage.error(t('backup.messages.failedToLoadSchedule'));
    }
  } catch (error) {
    console.error('Error loading schedule:', error);
    ElMessage.error(t('backup.messages.errorLoadingSchedule'));
  } finally {
    isLoading.value = false;
  }
};

const saveSchedule = async () => {
  try {
    const valid = await scheduleFormRef.value.validate();
    if (!valid) return;

    isSaving.value = true;
    const response = await backupService.configureSchedule(scheduleForm);
    
    if (response.success) {
      ElMessage.success(t('backup.messages.scheduleConfigurationSaved'));
      await loadSchedule();
    } else {
      ElMessage.error(response.message || t('backup.messages.failedToSaveSchedule'));
    }
  } catch (error) {
    console.error('Error saving schedule:', error);
    ElMessage.error(t('backup.messages.errorSavingSchedule'));
  } finally {
    isSaving.value = false;
  }
};

const resetForm = () => {
  if (currentSchedule.value) {
    Object.assign(scheduleForm, currentSchedule.value);
  } else {
    Object.assign(scheduleForm, {
      enabled: false,
      cronExpression: '0 2 * * *',
      description: t('backup.scheduledBackup'),
      retentionDays: 7
    });
  }
  
  scheduleType.value = 'predefined';
  predefinedSchedule.value = '0 2 * * *';
  validateCronExpression();
};

const onScheduleTypeChange = (type) => {
  if (type === 'predefined' && predefinedSchedule.value) {
    scheduleForm.cronExpression = predefinedSchedule.value;
  }
  validateCronExpression();
};

const onPredefinedScheduleChange = (value) => {
  scheduleForm.cronExpression = value;
  validateCronExpression();
};

const validateCronExpression = () => {
  const expression = scheduleForm.cronExpression;
  
  if (!expression) {
    cronValidation.value = {
      isValid: false,
      description: '',
      error: t('backup.cronExpressionRequired')
    };
    return;
  }

  if (!backupService.validateCronExpression(expression)) {
    cronValidation.value = {
      isValid: false,
      description: '',
      error: t('backup.invalidCronFormat')
    };
    return;
  }

  cronValidation.value = {
    isValid: true,
    description: getCronDescription(expression),
    error: ''
  };
};

function validateCronRule(rule, value, callback) {
  if (!value) {
    callback(new Error(t('backup.cronExpressionRequired')));
    return;
  }

  if (!backupService.validateCronExpression(value)) {
    callback(new Error(t('backup.invalidCronFormat')));
    return;
  }

  callback();
}

const getCronDescription = (expression) => {
  const predefined = predefinedSchedules.value.find(s => s.value === expression);
  if (predefined) {
    return predefined.description;
  }

  // Basic cron description logic
  const parts = expression.split(' ');
  if (parts.length !== 5) return t('backup.customSchedule');

  const [minute, hour, day, month, weekday] = parts;

  if (minute === '0' && hour !== '*' && day === '*' && month === '*' && weekday === '*') {
    return t('backup.dailyAtHour', { hour: `${hour}:00` });
  }

  if (minute === '0' && hour === '0' && day === '*' && month === '*' && weekday !== '*') {
    const days = [
      t('backup.sunday'), t('backup.monday'), t('backup.tuesday'), 
      t('backup.wednesday'), t('backup.thursday'), t('backup.friday'), t('backup.saturday')
    ];
    return t('backup.weeklyAtMidnight', { day: days[parseInt(weekday)] || t('backup.weekdays') });
  }

  return t('backup.customSchedule');
};

const formatDateTime = (dateString) => {
  if (!dateString) return t('backup.never');
  return new Date(dateString).toLocaleString();
};

// Lifecycle
onMounted(() => {
  loadSchedule();
});
</script>

<style scoped>
.backup-schedule-container {
  padding: 0;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;
}

.header-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.section-description {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.status-section,
.config-section,
.helper-section {
  margin-bottom: 24px;
}

.status-card,
.config-card,
.helper-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.schedule-info {
  padding: 16px 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.info-desc {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.schedule-form {
  max-width: 600px;
}

.form-help-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.cron-description {
  color: var(--el-color-success);
  font-weight: 500;
}

.cron-error {
  color: var(--el-color-error);
  font-weight: 500;
}

.schedule-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.schedule-label {
  font-weight: 500;
}

.schedule-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.cron-helper {
  display: grid;
  gap: 24px;
}

.cron-format h4,
.cron-examples h4,
.cron-wildcards h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.format-example {
  margin-bottom: 8px;
}

.format-example code {
  font-size: 16px;
  font-weight: 600;
  background: var(--el-fill-color-light);
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--el-color-primary);
}

.format-labels {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.examples-grid {
  display: grid;
  gap: 8px;
}

.example-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.example-code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  background: var(--el-fill-color-light);
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--el-color-primary);
  min-width: 100px;
}

.example-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.wildcards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.wildcard-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wildcard-item code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--el-color-primary);
  min-width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .format-labels {
    flex-wrap: wrap;
    gap: 10px;
  }

  .wildcards-grid {
    grid-template-columns: 1fr;
  }
}
</style>