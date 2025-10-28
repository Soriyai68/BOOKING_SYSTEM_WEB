import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/utils/api";

export const useAuthStore = defineStore("auth", () => {
  // Initialize user from localStorage if available
  const getUserFromStorage = () => {
    try {
      const stored = localStorage.getItem("cinema_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const user = ref(getUserFromStorage());
  const token = ref(
    localStorage.getItem(
      import.meta.env.VITE_AUTH_TOKEN_KEY || "cinema_auth_token"
    ) || null
  );
  const refreshToken = ref(
    localStorage.getItem(
      import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || "cinema_refresh_token"
    ) || null
  );
  const isLoading = ref(false);
  const isInitialized = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || "user");
  const isAdmin = computed(
    () => ["admin", "superadmin", "cashier"].includes(userRole.value)
  );
  const isSuperAdmin = computed(() => userRole.value === "superadmin");
  const isRegularAdmin = computed(() => userRole.value === "admin");
  const isCashier = computed(() => userRole.value === "cashier");
  const userPermissions = computed(() => user.value?.permissions || []);

  const setToken = (newToken) => {
    token.value = newToken;
    const tokenKey = import.meta.env.VITE_AUTH_TOKEN_KEY || "cinema_auth_token";
    if (newToken) {
      localStorage.setItem(tokenKey, newToken);
    } else {
      localStorage.removeItem(tokenKey);
    }
  };

  const setRefreshToken = (newRefreshToken) => {
    refreshToken.value = newRefreshToken;
    const refreshTokenKey =
      import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || "cinema_refresh_token";
    if (newRefreshToken) {
      localStorage.setItem(refreshTokenKey, newRefreshToken);
    } else {
      localStorage.removeItem(refreshTokenKey);
    }
  };

  const setUser = (userData) => {
    user.value = userData;
    // Persist user data to localStorage
    if (userData) {
      localStorage.setItem("cinema_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("cinema_user");
    }
  };

  const login = async (credentials) => {
    isLoading.value = true;
    console.log("Login attempt with credentials:", {
      phone: credentials.phone,
      password: credentials.password ? "[HIDDEN]" : "MISSING",
      remember: credentials.remember,
    });

    try {
      // First try with real API
      // console.log("Attempting API login...");
      const response = await api.post("/auth/admin-login", {
        phone: credentials.phone,
        password: credentials.password,
        remember: credentials.remember,
      });

      // console.log("API login successful:", response.data);

      // Handle backend response format
      const responseData = response.data;

      // Backend returns: { success: true, data: { accessToken, user, ... } }
      if (responseData.success && responseData.data) {
        const data = responseData.data;
        const accessToken = data.accessToken;
        const refToken = data.refreshToken;
        const userData = data.user;

        setToken(accessToken);
        if (refToken) {
          setRefreshToken(refToken);
        }
        setUser(userData);

        console.log("Auth state updated via API:", {
          token: !!accessToken,
          user: userData,
          isAuthenticated: !!accessToken,
          isAdmin: userData?.role === "admin",
        });

        return responseData;
      } else {
        // Fallback for different response formats
        const accessToken = responseData.access_token || responseData.token;
        const refToken = responseData.refresh_token;
        const userData = responseData.user || responseData.data;

        setToken(accessToken);
        if (refToken) {
          setRefreshToken(refToken);
        }

        console.log("Auth state updated via API (fallback):", {
          token: !!accessToken,
          user: userData,
          isAuthenticated: !!accessToken,
          isAdmin: userData?.role === "admin",
        });

        return responseData;
      }
    } catch (error) {
      console.log("API login failed:", error.message);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      // Try to call logout endpoint if we have a token
      if (token.value && import.meta.env.VITE_API_BASE_URL) {
        await api.post("/auth/logout");
        console.log("Logout API call successful");
      }
    } catch (error) {
      console.warn("Logout API call failed:", error.message);
      // Continue with local logout even if API fails
    }

    // Always clear local data regardless of API call result
    console.log("Clearing local auth data...");
    setToken(null);
    setRefreshToken(null);
    setUser(null);

    // Reset initialization state
    isInitialized.value = false;

    console.log("Logout completed successfully");
  };

  const fetchUserProfile = async () => {
    if (!token.value) return;
    try {
      const response = await api.get("/auth/profile");

      // Handle backend response format: { success: true, data: { user: {...} } }
      let userData;
      if (response.data?.success && response.data?.data?.user) {
        userData = response.data.data.user;
      } else if (response.data?.data) {
        userData = response.data.data;
      } else {
        userData = response.data.user || response.data;
      }

      if (userData) {
        setUser(userData);
        return userData;
      } else {
        throw new Error("No user data in response");
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // Throw error so initializeAuth can handle it
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/auth/profile", profileData);
      const userData = response.data.user || response.data;
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await api.put("/auth/change-password", {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.confirmPassword,
      });
    } catch (error) {
      throw error;
    }
  };

  const initializeAuth = async () => {
    console.log("Initializing auth state...");
    try {
      // Check if we have both token and user data
      if (token.value && user.value) {
        // We have everything, just verify the token is still valid
        console.log("Found stored token and user, verifying...");
        try {
          await fetchUserProfile();
          console.log("Auth state verified and restored");
        } catch (error) {
          console.warn("Token expired, clearing auth state");
          setToken(null);
          setRefreshToken(null);
          setUser(null);
        }
      } else if (token.value && !user.value) {
        // We have token but no user data, fetch it
        console.log("Found token, fetching user profile...");
        try {
          await fetchUserProfile();
          // console.log("User profile restored from token");
        } catch (error) {
          console.warn("Token invalid, clearing auth state");
          setToken(null);
          setRefreshToken(null);
          setUser(null);
        }
      } else {
        console.log("No stored authentication found");
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      isInitialized.value = true;
    }
  };

  return {
    user,
    token,
    refreshToken,
    isLoading,
    isInitialized,
    isAuthenticated,
    userRole,
    isAdmin,
    isSuperAdmin,
    isRegularAdmin,
    isCashier,
    userPermissions,
    login,
    logout,
    fetchUserProfile,
    updateProfile,
    changePassword,
    initializeAuth,
    setToken,
    setRefreshToken,
    setUser,
  };
});
