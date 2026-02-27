import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("ui", () => {
  // Toast state
  const toasts = ref([]);

  const showToast = (message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    toasts.value.push({
      id,
      message,
      type,
      duration,
    });

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  // Dialog state
  const dialog = ref({
    show: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "info", // info, warning, danger
    resolve: null,
    reject: null,
  });

  const confirm = (options = {}) => {
    return new Promise((resolve, reject) => {
      dialog.value = {
        show: true,
        title: options.title || "Confirm",
        message: options.message || "Are you sure?",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        type: options.type || "info",
        resolve,
        reject,
      };
    });
  };

  const handleConfirm = () => {
    if (dialog.value.resolve) dialog.value.resolve(true);
    closeDialog();
  };

  const handleCancel = () => {
    if (dialog.value.resolve) dialog.value.resolve(false);
    closeDialog();
  };

  const closeDialog = () => {
    dialog.value.show = false;
    // Delay resetting to prevent visual jitter during transition
    setTimeout(() => {
      if (!dialog.value.show) {
        dialog.value.resolve = null;
        dialog.value.reject = null;
      }
    }, 300);
  };

  return {
    toasts,
    showToast,
    removeToast,
    dialog,
    confirm,
    handleConfirm,
    handleCancel,
    closeDialog,
  };
});
