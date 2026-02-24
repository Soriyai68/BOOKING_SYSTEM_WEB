import { computed } from "vue";

export function usePath() {
  const isSubdomain = window.location.hostname.startsWith("admin.");

  const pathPrefix = computed(() => {
    return isSubdomain ? "" : "/admin";
  });

  const getAdminPath = (path) => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${pathPrefix.value}${cleanPath}`;
  };

  return {
    pathPrefix,
    isSubdomain,
    getAdminPath,
  };
}
