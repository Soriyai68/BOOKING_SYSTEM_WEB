import { watch } from 'vue';
import { usePermissions } from '@/composables/usePermissions';

// Vue permission directive
export const permissionDirective = {
  mounted(el, binding) {
    const perms = usePermissions();

    // Run once on mount
    checkPermission(el, binding);

    // Watch permission changes (dynamic updates)
    el.__permissionStopWatch__ = watch(
      [perms.permissions, perms.isSuperAdmin, perms.userRole],
      () => {
        checkPermission(el, binding);
      }
    );
  },

  updated(el, binding) {
    checkPermission(el, binding);
  },

  unmounted(el) {
    if (typeof el.__permissionStopWatch__ === 'function') {
      el.__permissionStopWatch__();
      delete el.__permissionStopWatch__;
    }
  }
};

function checkPermission(el, binding) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isSuperAdmin, userRole } = usePermissions();
  const { value, modifiers } = binding;

  let hasAccess = false;

  // 1. No value = always show
  if (!value) {
    hasAccess = true;
  }
  // 2. SuperAdmin
  else if (modifiers.superadmin) {
    hasAccess = isSuperAdmin.value;
  }
  // 3. Role check
  else if (modifiers.role) {
    hasAccess = userRole.value === value || isSuperAdmin.value;
  }
  // 4. Permission list
  else if (Array.isArray(value)) {
    hasAccess = modifiers.all
      ? hasAllPermissions(value)
      : hasAnyPermission(value);
  }
  // 5. Single permission
  else if (typeof value === 'string') {
    hasAccess = hasPermission(value);
  }
  //Change UI
  if (hasAccess) {
    el.style.display = '';
    el.removeAttribute('disabled');
    el.style.opacity = '';
    el.style.cursor = '';
  } else {
    if (modifiers.disable) {
      el.setAttribute('disabled', 'true');
      el.style.opacity = '0.5';
      el.style.cursor = 'not-allowed';
    } else {
      el.style.display = 'none';
    }
  }
}

// Install into Vue
export default {
  install(app) {
    app.directive('permission', permissionDirective);
  }
};
