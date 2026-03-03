import { onMounted, watch } from "vue";
import { useDocumentVisibility } from "@vueuse/core";

/**
 * useAutoRefresh - An action-based refresh composable (Dependency & Focus aware)
 *
 * @param {Function} refreshFn - The function to call for refreshing data
 * @param {Object} options - Options: { immediate: true, deps: null, refreshOnFocus: true }
 */
export function useAutoRefresh(refreshFn, options = {}) {
  const { immediate = true, deps = null, refreshOnFocus = true } = options;
  const visibility = useDocumentVisibility();

  // Watch for tab visibility changes (Focus-based refresh)
  if (refreshOnFocus) {
    watch(visibility, (newVisibility) => {
      if (newVisibility === "visible") {
        refreshFn();
      }
    });
  }

  // Watch for external dependencies (like filters or IDs) - React useEffect style
  if (deps) {
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
