import api from "@/utils/api";

export const backupService = {
  // Get all backups with pagination
  async getBackups(params = {}) {
    const response = await api.get("/backups", { params });
    
    if (response.data?.success) {
      return {
        success: true,
        data: response.data.backups || [],
        total: response.data.total || 0
      };
    }
    
    return response.data;
  },

  // Get backup statistics
  async getBackupStats() {
    const response = await api.get("/backups/stats");
    
    if (response.data?.success) {
      return {
        success: true,
        data: response.data.stats
      };
    }
    
    return response.data;
  },

  // Get backup details by name
  async getBackupDetails(backupName) {
    const response = await api.get(`/backups/${backupName}`);
    
    if (response.data?.success) {
      return {
        success: true,
        data: response.data.backup
      };
    }
    
    return response.data;
  },

  // Create manual backup
  async createBackup(description = "Manual backup") {
    // Don't send empty descriptions
    const payload = {};
    if (description && description.trim()) {
      payload.description = description.trim();
    }
    const response = await api.post("/backups", payload);
    return response.data;
  },

  // Restore from backup
  async restoreBackup(backupName, options = {}) {
    const { dropDatabase = false } = options;
    const response = await api.post(`/backups/${backupName}/restore`, {
      dropDatabase
    });
    return response.data;
  },

  // Delete backup
  async deleteBackup(backupName) {
    const response = await api.delete(`/backups/${backupName}`);
    return response.data;
  },

  // Get backup schedule configuration
  async getSchedule() {
    const response = await api.get("/backups/schedule");
    
    if (response.data?.success) {
      return {
        success: true,
        data: response.data.schedule
      };
    }
    
    return response.data;
  },

  // Configure backup schedule
  async configureSchedule(scheduleConfig) {
    const {
      enabled = true,
      cronExpression = "0 2 * * *",
      description = "Scheduled backup",
      retentionDays = 7
    } = scheduleConfig;

    const response = await api.post("/backups/schedule", {
      enabled,
      cronExpression,
      description,
      retentionDays
    });
    
    return response.data;
  },

  // Format bytes to human readable format
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format backup type for display
  formatBackupType(type) {
    switch (type) {
      case 'scheduled':
        return 'Scheduled';
      case 'manual':
        return 'Manual';
      default:
        return 'Manual';
    }
  },

  // Get backup age in human readable format
  getBackupAge(createdAt) {
    const now = new Date();
    const backupDate = new Date(createdAt);
    const diffMs = now - backupDate;
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  },

  // Validate cron expression (basic validation)
  validateCronExpression(cronExpression) {
    if (!cronExpression || typeof cronExpression !== 'string') {
      return false;
    }

    const parts = cronExpression.trim().split(/\s+/);
    return parts.length === 5; // Basic check for 5 parts (minute hour day month weekday)
  },

  // Get predefined cron expressions
  getPredefinedSchedules() {
    return [
      {
        label: 'Every hour',
        value: '0 * * * *',
        description: 'Runs at the beginning of every hour'
      },
      {
        label: 'Every 6 hours',
        value: '0 */6 * * *',
        description: 'Runs every 6 hours starting at midnight'
      },
      {
        label: 'Daily at 2 AM',
        value: '0 2 * * *',
        description: 'Runs every day at 2:00 AM'
      },
      {
        label: 'Daily at midnight',
        value: '0 0 * * *',
        description: 'Runs every day at midnight'
      },
      {
        label: 'Weekly (Sunday at 2 AM)',
        value: '0 2 * * 0',
        description: 'Runs every Sunday at 2:00 AM'
      },
      {
        label: 'Monthly (1st at 2 AM)',
        value: '0 2 1 * *',
        description: 'Runs on the 1st of every month at 2:00 AM'
      }
    ];
  }
};