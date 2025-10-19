import { usePermissions } from '@/composables/usePermissions';

// Permission directive for Vue
export const permissionDirective = {
  mounted(el, binding) {
    checkPermission(el, binding);
  },
  
  updated(el, binding) {
    checkPermission(el, binding);
  }
};

function checkPermission(el, binding) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isSuperAdmin, userRole } = usePermissions();
  
  const { value, modifiers } = binding;
  let hasAccess = false;

  // If no value provided, show element
  if (!value) {
    hasAccess = true;
  }
  // SuperAdmin only check
  else if (modifiers.superadmin) {
    hasAccess = isSuperAdmin.value;
  }
  // Role-based check
  else if (modifiers.role) {
    hasAccess = userRole.value === value || isSuperAdmin.value;
  }
  // Permission-based check
  else if (Array.isArray(value)) {
    hasAccess = modifiers.all 
      ? hasAllPermissions(value)
      : hasAnyPermission(value);
  } else if (typeof value === 'string') {
    hasAccess = hasPermission(value);
  }

  // Hide/show element based on permission
  if (hasAccess) {
    el.style.display = '';
    el.removeAttribute('disabled');
  } else {
    if (modifiers.disable) {
      // Disable instead of hiding
      el.setAttribute('disabled', 'true');
      el.style.opacity = '0.5';
      el.style.cursor = 'not-allowed';
    } else {
      // Hide element
      el.style.display = 'none';
    }
  }
}

// Install function for Vue plugin
export default {
  install(app) {
    app.directive('permission', permissionDirective);
  }
};