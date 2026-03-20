import { onMounted, watch, computed } from "vue";
import { useDocumentVisibility } from "@vueuse/core";
import { useAppStore } from "@/stores/app";

/**
 * useAutoRefresh - An action-based refresh composable (Dependency & Focus aware)
 *
 * @param {Function} refreshFn - The function to call for refreshing data
 * @param {Object} options - Options: { immediate: true, deps: null, refreshOnFocus: true, refreshOnSocket: true }
 */
export function useAutoRefresh(refreshFn, options = {}) {
  const { 
    immediate = true, 
    deps = [], 
    refreshOnFocus = true,
    refreshOnSocket = true 
  } = options;
  
  const visibility = useDocumentVisibility();
  const appStore = useAppStore();

  // Watch for global data version changes (Socket-based refresh)
  if (refreshOnSocket) {
    watch(() => appStore.dataVersion, () => {
      console.log("useAutoRefresh: Data version changed, refreshing...");
      refreshFn();
    });
  }

  // Watch for tab visibility changes (Focus-based refresh)
  if (refreshOnFocus) {
    watch(visibility, (newVisibility) => {
      if (newVisibility === "visible") {
        refreshFn();
      }
    });
  }

  // Watch for external dependencies (like filters or IDs)
  if (deps && (Array.isArray(deps) ? deps.length > 0 : !!deps)) {
    watch(
      deps,
      () => {
        refreshFn();
      },
      { deep: true },
    );
  }

  onMounted(() => {
    if (immediate) {
      refreshFn();
    }
  });

  return {
    visibility,
    refreshNow: refreshFn,
  };
}
