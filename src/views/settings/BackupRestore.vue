<template>
  <div class="backup-restore-container">
    <!-- MongoDB Tools Status Alert -->
    <div class="tools-status-section" v-if="!mongoToolsAvailable">
      <el-alert
        title="ត្រូវការឧបករណ៍មូលដ្ឋានទិន្នន័យ MongoDB"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          <p>ប្រព័ន្ធបម្រុងទុកត្រូវការឧបករណ៍មូលដ្ឋានទិន្នន័យ MongoDB ដើម្បីដំឡើងនៅលើប្រព័ន្ធរបស់អ្នក។</p>
          <div class="install-instructions">
            <p><strong>ជម្រើសការដំឡើង៖</strong></p>
            <ul>
              <li>ទាញយកពី៖ <a href="https://www.mongodb.com/try/download/database-tools" target="_blank">MongoDB Database Tools</a></li>
              <li>ប្រើ Chocolatey៖ <code>choco install mongodb-database-tools</code></li>
              <li>ប្រើ Scoop៖ <code>scoop install mongodb-database-tools</code></li>
            </ul>
            <p><strong>បន្ទាប់ពីការដំឡើង៖</strong> ចាប់ផ្តើម terminal/IDE របស់អ្នកឡើងវិញ ហើយដំណើរការ <code>npm run check:mongodump</code> ដើម្បីផ្ទៀងផ្ទាត់។</p>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <h3 class="section-title">{{ t('backup.title') }}</h3>
        <p class="section-description">
          {{ t('backup.backupRestoreDescription') }}
        </p>
      </div>
      <div class="header-actions">
        <el-button
          v-if="canCreateBackups"
          type="primary"
          :loading="isCreatingBackup"
          @click="createBackup"
        >
          <Database :size="16" />
          {{ t('backup.createBackup') }}
        </el-button>
        <el-button
          v-if="canRestoreBackups && backups.length > 0"
          type="warning"
          @click="showRestoreDialog()"
        >
          <RotateCcw :size="16" />
          {{ t('backup.restoreDatabase') }}
        </el-button>
        <el-button @click="refreshBackups" :loading="isLoading">
          <RefreshCw :size="16" />
          {{ t('backup.refresh') }}
        </el-button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-section" v-if="stats">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon icon-blue">
                <Archive :size="20" />
              </div>
              <div class="stat-details">
                <span class="stat-value">{{ stats.totalBackups }}</span>
                <span class="stat-label">{{ t('backup.totalBackups') }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon icon-green">
                <HardDrive :size="20" />
              </div>
              <div class="stat-details">
                <span class="stat-value">{{ stats.totalSizeFormatted }}</span>
                <span class="stat-label">{{ t('backup.totalSize') }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon icon-purple">
                <Clock :size="20" />
              </div>
              <div class="stat-details">
                <span class="stat-value">{{ stats.scheduledBackups }}</span>
                <span class="stat-label">{{ t('backup.scheduled') }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon icon-orange">
                <User :size="20" />
              </div>
              <div class="stat-details">
                <span class="stat-value">{{ stats.manualBackups }}</span>
                <span class="stat-label">{{ t('backup.manual') }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Backups List -->
    <div class="backups-section">
      <el-card class="backups-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">{{ t('backup.availableBackups') }}</span>
            <el-input
              v-model="searchQuery"
              :placeholder="t('backup.searchBackups')"
              style="width: 200px"
              clearable
            >
              <template #prefix>
                <Search :size="16" />
              </template>
            </el-input>
          </div>
        </template>

        <el-table
          :data="filteredBackups"
          v-loading="isLoading"
          :empty-text="t('backup.noBackupsFound')"
          class="backups-table"
        >
          <el-table-column prop="name" :label="t('backup.backupName')" min-width="200">
            <template #default="{ row }">
              <div class="backup-name">
                <el-tag
                  :type="row.type === 'scheduled' ? 'success' : 'primary'"
                  size="small"
                  class="backup-type-tag"
                >
                  {{ backupService.formatBackupType(row.type) }}
                </el-tag>
                <span class="name-text">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="description" :label="t('backup.description')" min-width="150">
            <template #default="{ row }">
              <span class="description-text">{{ row.description || t('backup.noDescription') }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="size" :label="t('backup.size')" width="100">
            <template #default="{ row }">
              <span class="size-text">{{ backupService.formatBytes(row.size) }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" :label="t('backup.created')" width="120">
            <template #default="{ row }">
              <div class="date-info">
                <span class="date-text">{{ formatDate(row.createdAt) }}</span>
                <span class="age-text">{{ backupService.getBackupAge(row.createdAt) }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column :label="t('backup.actions')" width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button
                  size="small"
                  @click="viewBackupDetails(row)"
                >
                  <Eye :size="14" />
                </el-button>
                <el-button
                  v-if="canRestoreBackups"
                  size="small"
                  type="warning"
                  @click="showRestoreDialog(row)"
                >
                  <RotateCcw :size="14" />
                </el-button>
                <el-button
                  v-if="canDeleteBackups"
                  size="small"
                  type="danger"
                  @click="confirmDeleteBackup(row)"
                >
                  <Trash2 :size="14" />
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- Create Backup Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      :title="t('backup.createBackup')"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="createForm" label-width="120px">
        <el-form-item :label="t('backup.description')">
          <el-input
            v-model="createForm.description"
            :placeholder="t('backup.messages.enterBackupDescription')"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">{{ t('backup.cancel') }}</el-button>
        <el-button
          type="primary"
          :loading="isCreatingBackup"
          @click="confirmCreateBackup"
        >
          {{ t('backup.createBackup') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Restore Dialog -->
    <el-dialog
      v-model="showRestoreDialogVisible"
      :title="t('backup.restoreDatabase')"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="restore-warning">
        <el-alert
          :title="t('backup.warning')"
          type="warning"
          :closable="false"
          show-icon
        >
          <p>{{ t('backup.messages.restoreWarningMessage') }}</p>
          <p v-if="restoreForm.selectedBackupName">
            <strong>{{ t('backup.backupName') }}:</strong> {{ restoreForm.selectedBackupName }}
          </p>
        </el-alert>
      </div>

      <el-form :model="restoreForm" label-width="140px" style="margin-top: 20px;">
        <el-form-item :label="t('backup.selectBackup')" required>
          <el-select
            v-model="restoreForm.selectedBackupName"
            :placeholder="t('backup.messages.chooseBackupToRestore')"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="backup in backups"
              :key="backup.name"
              :label="`${backup.name} (${formatDate(backup.createdAt)})`"
              :value="backup.name"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>{{ backup.name }}</span>
                <span style="color: var(--el-text-color-secondary); font-size: 12px;">
                  {{ backupService.formatBytes(backup.size) }}
                </span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="t('backup.dropDatabase')">
          <el-switch
            v-model="restoreForm.dropDatabase"
            :active-text="t('backup.messages.yes')"
            :inactive-text="t('backup.messages.no')"
          />
          <div class="form-help-text">
            {{ t('backup.messages.dropDatabaseHelp') }}
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showRestoreDialogVisible = false">{{ t('backup.cancel') }}</el-button>
        <el-button
          type="danger"
          :loading="isRestoring"
          @click="confirmRestore"
        >
          {{ t('backup.restoreDatabase') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Backup Details Dialog -->
    <el-dialog
      v-model="showDetailsDialog"
      :title="t('backup.backupDetails')"
      width="600px"
    >
      <div v-if="selectedBackup" class="backup-details">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="t('backup.backupName')">
            {{ selectedBackup.name }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('backup.type')">
            <el-tag :type="selectedBackup.type === 'scheduled' ? 'success' : 'primary'">
              {{ backupService.formatBackupType(selectedBackup.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('backup.description')">
            {{ selectedBackup.description || t('backup.noDescription') }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('backup.database')">
            {{ selectedBackup.database }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('backup.size')">
            {{ backupService.formatBytes(selectedBackup.size) }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('backup.created')">
            {{ formatDateTime(selectedBackup.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('backup.age')">
            {{ backupService.getBackupAge(selectedBackup.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('backup.path')">
            <code class="path-text">{{ selectedBackup.path }}</code>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="showDetailsDialog = false">{{ t('backup.close') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { usePermissions } from '@/composables/usePermissions';
import { backupService } from '@/services/backupService';
import {
  Database,
  RefreshCw,
  Archive,
  HardDrive,
  Clock,
  User,
  Search,
  Eye,
  RotateCcw,
  Trash2
} from 'lucide-vue-next';

// Permissions
const { canViewBackups, canCreateBackups, canRestoreBackups, canDeleteBackups } = usePermissions();

// i18n
const { t } = useI18n();

// Reactive data
const backups = ref([]);
const stats = ref(null);
const isLoading = ref(false);
const isCreatingBackup = ref(false);
const isRestoring = ref(false);
const searchQuery = ref('');
const mongoToolsAvailable = ref(true); // Assume available initially

// Dialog states
const showCreateDialog = ref(false);
const showRestoreDialogVisible = ref(false);
const showDetailsDialog = ref(false);
const selectedBackup = ref(null);

// Form data
const createForm = ref({
  description: ''
});

const restoreForm = ref({
  selectedBackupName: '',
  dropDatabase: false
});

// Computed
const filteredBackups = computed(() => {
  if (!searchQuery.value) return backups.value;
  
  const query = searchQuery.value.toLowerCase();
  return backups.value.filter(backup =>
    backup.name.toLowerCase().includes(query) ||
    (backup.description && backup.description.toLowerCase().includes(query))
  );
});

// Methods
const loadBackups = async () => {
  try {
    isLoading.value = true;
    const response = await backupService.getBackups();
    
    if (response.success) {
      backups.value = response.data;
      mongoToolsAvailable.value = true; // If we can load backups, tools might be available
    } else {
      ElMessage.error(t('backup.messages.failedToLoadBackups'));
    }
  } catch (error) {
    console.error('Error loading backups:', error);
    ElMessage.error(t('backup.messages.errorLoadingBackups'));
  } finally {
    isLoading.value = false;
  }
};

const loadStats = async () => {
  try {
    const response = await backupService.getBackupStats();
    
    if (response.success) {
      stats.value = response.data;
    }
  } catch (error) {
    console.error('Error loading backup stats:', error);
  }
};

const refreshBackups = async () => {
  await Promise.all([loadBackups(), loadStats()]);
};

const createBackup = () => {
  createForm.value.description = '';
  showCreateDialog.value = true;
};

const confirmCreateBackup = async () => {
  try {
    isCreatingBackup.value = true;
    const response = await backupService.createBackup(createForm.value.description);
    
    if (response.success) {
      ElMessage.success(t('backup.messages.backupCreatedSuccessfully'));
      showCreateDialog.value = false;
      await refreshBackups();
    } else {
      // Handle MongoDB tools not installed error
      if (response.error && response.error.includes('mongodump command not found')) {
        ElMessageBox.alert(
          `ឧបករណ៍មូលដ្ឋានទិន្នន័យ MongoDB មិនត្រូវបានដំឡើងនៅលើប្រព័ន្ធរបស់អ្នកទេ។ 
          
ដើម្បីដំឡើង៖
1. ទាញយកពី៖ https://www.mongodb.com/try/download/database-tools
2. ឬប្រើ Chocolatey៖ choco install mongodb-database-tools
3. បន្ថែមឧបករណ៍ទៅ PATH របស់ប្រព័ន្ធ
4. ចាប់ផ្តើម terminal/IDE របស់អ្នកឡើងវិញ
5. ដំណើរការ៖ npm run check:mongodump ដើម្បីផ្ទៀងផ្ទាត់

ប្រព័ន្ធបម្រុងទុកត្រូវការពាក្យបញ្ជា mongodump និង mongorestore ដើម្បីដំណើរការ។`,
          'ត្រូវការឧបករណ៍ MongoDB',
          {
            confirmButtonText: 'យល់ព្រម',
            type: 'warning',
            dangerouslyUseHTMLString: false
          }
        );
      } else {
        ElMessage.error(response.message || 'បរាជ័យក្នុងការបង្កើតការបម្រុងទុក');
      }
    }
  } catch (error) {
    console.error('Error creating backup:', error);
    ElMessage.error('កំហុសក្នុងការបង្កើតការបម្រុងទុក');
  } finally {
    isCreatingBackup.value = false;
  }
};

const showRestoreDialog = (backup = null) => {
  if (backup) {
    // Called from table action - pre-select the backup
    selectedBackup.value = backup;
    restoreForm.value.selectedBackupName = backup.name;
  } else {
    // Called from general restore button - let user select
    selectedBackup.value = null;
    restoreForm.value.selectedBackupName = '';
  }
  restoreForm.value.dropDatabase = false;
  showRestoreDialogVisible.value = true;
};

const confirmRestore = async () => {
  // Validate that a backup is selected
  if (!restoreForm.value.selectedBackupName) {
    ElMessage.error('សូមជ្រើសរើសការបម្រុងទុកដើម្បីស្តារ');
    return;
  }

  try {
    await ElMessageBox.confirm(
      'នេះនឹងស្តារមូលដ្ឋានទិន្នន័យពីការបម្រុងទុកដែលបានជ្រើសរើស។ សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។ បន្ត?',
      'បញ្ជាក់ការស្តារ',
      {
        confirmButtonText: 'ស្តារ',
        cancelButtonText: 'បោះបង់',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    );

    isRestoring.value = true;
    
    const response = await backupService.restoreBackup(
      restoreForm.value.selectedBackupName,
      { dropDatabase: restoreForm.value.dropDatabase }
    );
    
    if (response.success) {
      ElMessage.success('បានស្តារមូលដ្ឋានទិន្នន័យដោយជោគជ័យ');
      showRestoreDialogVisible.value = false;
    } else {
      // Handle MongoDB tools not installed error
      if (response.error && response.error.includes('mongorestore command not found')) {
        ElMessageBox.alert(
          `ឧបករណ៍មូលដ្ឋានទិន្នន័យ MongoDB មិនត្រូវបានដំឡើងនៅលើប្រព័ន្ធរបស់អ្នកទេ។ 
          
ដើម្បីដំឡើង៖
1. ទាញយកពី៖ https://www.mongodb.com/try/download/database-tools
2. ឬប្រើ Chocolatey៖ choco install mongodb-database-tools
3. បន្ថែមឧបករណ៍ទៅ PATH របស់ប្រព័ន្ធ
4. ចាប់ផ្តើម terminal/IDE របស់អ្នកឡើងវិញ
5. ដំណើរការ៖ npm run check:mongodump ដើម្បីផ្ទៀងផ្ទាត់

ប្រព័ន្ធបម្រុងទុកត្រូវការពាក្យបញ្ជា mongodump និង mongorestore ដើម្បីដំណើរការ។`,
          'ត្រូវការឧបករណ៍ MongoDB',
          {
            confirmButtonText: 'យល់ព្រម',
            type: 'warning',
            dangerouslyUseHTMLString: false
          }
        );
      } else {
        ElMessage.error(response.message || 'បរាជ័យក្នុងការស្តារការបម្រុងទុក');
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error restoring backup:', error);
      ElMessage.error('កំហុសក្នុងការស្តារការបម្រុងទុក');
    }
  } finally {
    isRestoring.value = false;
  }
};

const confirmDeleteBackup = async (backup) => {
  try {
    await ElMessageBox.confirm(
      `តើអ្នកប្រាកដថាចង់លុបការបម្រុងទុក "${backup.name}" មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។`,
      'បញ្ជាក់ការលុប',
      {
        confirmButtonText: 'លុប',
        cancelButtonText: 'បោះបង់',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    );

    const response = await backupService.deleteBackup(backup.name);
    
    if (response.success) {
      ElMessage.success('បានលុបការបម្រុងទុកដោយជោគជ័យ');
      await refreshBackups();
    } else {
      ElMessage.error(response.message || 'បរាជ័យក្នុងការលុបការបម្រុងទុក');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting backup:', error);
      ElMessage.error('កំហុសក្នុងការលុបការបម្រុងទុក');
    }
  }
};

const viewBackupDetails = (backup) => {
  selectedBackup.value = backup;
  showDetailsDialog.value = true;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString();
};

// Lifecycle
onMounted(() => {
  refreshBackups();
});
</script>

<style scoped>
.backup-restore-container {
  padding: 0;
}

.tools-status-section {
  margin-bottom: 24px;
}

.install-instructions {
  margin-top: 12px;
}

.install-instructions ul {
  margin: 8px 0;
  padding-left: 20px;
}

.install-instructions li {
  margin: 4px 0;
}

.install-instructions code {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.install-instructions a {
  color: var(--el-color-primary);
  text-decoration: none;
}

.install-instructions a:hover {
  text-decoration: underline;
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

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid var(--el-border-color-light);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-blue {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.icon-green {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.icon-purple {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.icon-orange {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.backups-card {
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

.backup-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.backup-type-tag {
  font-size: 11px;
}

.name-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.description-text {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.size-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-text {
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.age-text {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.restore-warning {
  margin-bottom: 16px;
}

.form-help-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.backup-details {
  margin: 16px 0;
}

.path-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--el-text-color-primary);
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-end;
  }
}
</style>