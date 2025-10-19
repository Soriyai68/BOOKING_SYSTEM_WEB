<template>
  <div v-if="hasAccess">
    <slot />
  </div>
  <div v-else-if="showFallback" class="permission-denied">
    <slot name="fallback">
      <div class="no-permission-message">
        <el-empty 
          :image-size="100"
          description="You don't have permission to view this content"
        />
      </div>
    </slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePermissions } from '@/composables/usePermissions';

const props = defineProps({
  // Single permission or array of permissions
  permissions: {
    type: [String, Array],
    required: true
  },
  // Whether user needs ALL permissions or just ANY
  requireAll: {
    type: Boolean,
    default: false
  },
  // Show fallback content when access is denied
  showFallback: {
    type: Boolean,
    default: false
  },
  // Custom role check (overrides permissions)
  role: {
    type: String,
    default: null
  },
  // Only show for SuperAdmin
  superAdminOnly: {
    type: Boolean,
    default: false
  }
});

const { hasPermission, hasAllPermissions, hasAnyPermission, isSuperAdmin, userRole } = usePermissions();

const hasAccess = computed(() => {
  // SuperAdmin only check
  if (props.superAdminOnly) {
    return isSuperAdmin.value;
  }

  // Role-based check
  if (props.role) {
    return userRole.value === props.role || isSuperAdmin.value;
  }

  // Permission-based check
  if (Array.isArray(props.permissions)) {
    return props.requireAll 
      ? hasAllPermissions(props.permissions)
      : hasAnyPermission(props.permissions);
  }

  return hasPermission(props.permissions);
});
</script>

<style scoped>
.permission-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  background-color: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px dashed var(--el-border-color);
}

.no-permission-message {
  text-align: center;
  color: var(--el-text-color-regular);
}
</style>