<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/uiStore";
import { useI18n } from "vue-i18n";
import { CheckCircle, XCircle, Sun, Moon } from "lucide-vue-next";
import { isDark, toggleDark } from "@/composables/useTheme";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();

const isWebApp = ref(false);
const firstName = ref("");
const isLoading = ref(false);

const uiStore = useUiStore();

const showToast = (text, type = "success") => {
  uiStore.showToast(text, type);
};

// Environment Detection logic from previous project
const detectIsTG = () => {
  const tg = window.Telegram?.WebApp;
  const isTG =
    (tg && (tg.initData || tg.platform !== "unknown")) ||
    window.location.hash.includes("tgWebAppData") ||
    window.location.search.includes("tgWebAppData") ||
    /Telegram/i.test(navigator.userAgent);

  if (isTG) {
    isWebApp.value = true;
    sessionStorage.setItem("isWebApp", "true");
    if (tg?.initDataUnsafe?.user?.first_name) {
      firstName.value = tg.initDataUnsafe.user.first_name;
    }
    if (tg?.expand) tg.expand();
    console.log("[Mini App] Detected via Simple Method");
    return true;
  }
  return false;
};

// Handle Browser Widget Auth
const handleWidgetAuth = async (userData) => {
  console.log("[Widget] Auth data received:", userData);
  try {
    isLoading.value = true;
    const res = await authStore.telegramLogin(userData);
    const customerName = res?.data?.customer?.name;
    if (res?.success) {
      showToast(
        t("client.login.welcomeBackMsg", { name: customerName }),
        "success",
      );
      router.push("/layout");
    }
  } catch (error) {
    console.error("[Widget] Auth error:", error);
    showToast(
      error?.response?.data?.message || t("client.login.telegramLoginFailed"),
      "error",
    );
  } finally {
    isLoading.value = false;
  }
};

// Handle Native Mini App Login (One-tap)
const handleWebAppLogin = async () => {
  try {
    isLoading.value = true;
    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData;

    if (!initData) {
      showToast(t("client.login.telegramDataNotFound"), "error");
      isLoading.value = false;
      return;
    }

    console.log("[Mini App] Requesting contact...");

    const processCapture = async (phone) => {
      try {
        // Send raw phone number; backend handles normalization
        const res = await authStore.telegramWebAppLogin(initData, phone);
        const customerName = res?.data?.customer?.name;
        if (res?.success) {
          showToast(
            t("client.login.welcomeBackMsg", { name: customerName }),
            "success",
          );
          router.push("/layout");
        }
      } catch (err) {
        console.error("[Mini App] Login request failed:", err);
        showToast(t("client.login.serverAuthFailed"), "error");
      } finally {
        isLoading.value = false;
      }
    };

    // Use requestContact (modern SDK way)
    tg.requestContact((callbackData) => {
      console.log("[Mini App] Contact callback data (Full):", JSON.stringify(callbackData, null, 2));
      if (callbackData?.status === "sent") {
        let num = null;
        if (callbackData.response) {
          if (typeof callbackData.response === 'string') {
            try {
              // Extract number from potentially double-encoded JSON or direct string
              const digitsOnly = callbackData.response.replace(/\D/g, "");
              if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
                num = callbackData.response; 
              } else {
                const parsed = JSON.parse(callbackData.response);
                num = parsed.contact?.phone_number || parsed.phone_number || callbackData.response;
              }
            } catch(e) {
              num = callbackData.response;
            }
          } else {
            num = callbackData.response.contact?.phone_number || 
                  callbackData.response.phone_number || 
                  callbackData.contact?.phone_number;
          }
        }
        
        if (!num) {
          num = callbackData.contact?.phone_number || 
                callbackData.phone_number ||
                (typeof callbackData.response === "string" ? callbackData.response : null);
        }
        
        console.log("[Mini App] Final extracted phone:", num);
        processCapture(num);
      } else {
        // Fallback: Try login WITHOUT phone number (Backend supports it for existing users)
        console.warn(
          "[Mini App] Phone sharing skipped, trying ID-only login...",
        );
        processCapture(null);
      }
    });
  } catch (error) {
    console.error("[Mini App] Login flow failed:", error);
    showToast(t("client.login.telegramSdkError"), "error");
    isLoading.value = false;
  }
};

let widgetTimer = null;

onMounted(() => {
  // Check if already logged in
  if (authStore.isAuthenticated) {
    router.push("/layout");
    return;
  }

  const isTG = detectIsTG();

  // Show logout success toast if redirected from Settings
  if (route.query.loggedOut) {
    showToast(t("auth.logoutSuccess") || "Logged out successfully", "success");
    router.replace({ query: {} });
  }

  // Browser Widget Initialization
  if (!isTG) {
    widgetTimer = setTimeout(() => {
      // Expose globally for Telegram Widget
      window.onTelegramAuth = (user) => {
        handleWidgetAuth(user);
      };

      const widgetContainer = document.getElementById("telegram-login-widget");
      if (widgetContainer) {
        const script = document.createElement("script");
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.async = true;
        script.setAttribute(
          "data-telegram-login",
          import.meta.env.VITE_TELEGRAM_BOT_NAME || "RSB_Cinema_bot",
        );
        script.setAttribute("data-size", "large");
        script.setAttribute("data-onauth", "onTelegramAuth(user)");
        script.setAttribute("data-radius", "16");
        widgetContainer.appendChild(script);
      }
    }, 1000);
  }

  // Anti-freeze recovery logic from previous project
  const purgeLocks = () => {
    document.body.style.pointerEvents = "auto";
    document.body.style.overflow = "auto";
    document.body.style.userSelect = "auto";
    document.documentElement.style.pointerEvents = "auto";
    document.documentElement.style.overflow = "auto";
  };
  purgeLocks();
});

onUnmounted(() => {
  if (widgetTimer) clearTimeout(widgetTimer);
  delete window.onTelegramAuth;
});
</script>

<template>
  <div
    class="login-page min-h-screen flex flex-col bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300"
  >
    <!-- Background -->
    <div class="login-bg-layer"></div>

    <!-- Header / Nav Bar -->
    <header class="relative z-10 py-5 px-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img
          src="@/assets/rsb-cinema.png"
          alt="RSB Cinema Logo"
          class="w-16 h-18 object-contain"
        />
        <div>
          <h1 class="text-sm font-bold leading-snug text-slate-900 dark:text-white">
            {{ t("client.nav.cinemaNameKH") }}
          </h1>
          <p
            class="text-[10px] font-semibold text-slate-400 dark:text-neutral-500 mt-0.5 tracking-wider uppercase"
          >
            {{ t("client.nav.cinemaNameEN") }}
          </p>
        </div>
      </div>

    </header>

    <!-- Content -->
    <div
      class="relative z-10 flex-1 flex flex-col items-center justify-center px-6 -mt-10"
    >
      <div class="w-full max-w-[380px] space-y-8">
        <div class="text-center space-y-3">
          <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {{
              isWebApp
                ? firstName
                  ? t("client.login.welcomeUser", { name: firstName })
                  : t("client.login.welcomeBack")
                : t("client.login.welcomeBack")
            }}
          </h2>
          <p
            class="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed max-w-[280px] mx-auto"
          >
            {{
              isWebApp
                ? t("client.login.telegramInfo")
                : t("client.login.signInInfo")
            }}
          </p>
        </div>

        <!-- Cinema Icons -->
        <div
          class="flex items-center justify-center gap-8 text-slate-300 dark:text-neutral-700 my-10"
        >
          <svg
            class="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
          <svg
            class="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"
            />
          </svg>
          <svg
            class="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
            />
          </svg>
        </div>

        <!-- Action Section -->
        <div class="flex flex-col items-center gap-6">
          <div v-if="isWebApp" class="w-full">
            <button
              @click="handleWebAppLogin"
              :disabled="isLoading"
              class="login-telegram-btn w-full flex items-center justify-center gap-4 rounded-2xl px-6 py-4 text-[15px] font-bold text-white transition-all active:scale-95 disabled:opacity-70"
            >
              <div class="login-telegram-icon-wrap">
                <svg viewBox="0 0 24 24" class="h-6 w-6 fill-white">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.13 7.19c-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59l2.76-2.69c.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02l-5.54 3.69c-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.64 6.3-2.73 7.55-3.26 3.58-1.51 4.34-1.77 4.83-1.77.11 0 .35.03.5.15.13.1.17.24.18.33 0 .06 0 .16-.02.2z"
                  />
                </svg>
              </div>
              <span>{{
                firstName
                  ? t("client.login.loginAsUser", { name: firstName })
                  : t("client.login.loginWithTelegram")
              }}</span>
            </button>
          </div>

          <div
            v-else
            id="telegram-login-widget"
            class="min-h-[50px] flex items-center justify-center"
          >
            <!-- Widget injects here -->
          </div>

          <div v-if="isLoading" class="mt-4">
            <div class="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Additional Info -->
        <div class="text-center pt-4">
          <p
            class="text-[11px] text-slate-400 dark:text-neutral-600 font-medium"
            v-html="t('client.login.fastSecure')"
          ></p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="relative z-10 px-8 py-8">
      <p
        class="text-center text-[11px] text-slate-400 dark:text-neutral-500 font-medium leading-relaxed"
      >
        <span v-html="t('client.login.termsAgreement')"></span>
        <a href="#" class="text-sky-500/80 hover:text-sky-400">{{
          t("client.login.termsOfService")
        }}</a>
        &
        <a href="#" class="text-sky-500/80 hover:text-sky-600 dark:hover:text-sky-400">{{
          t("client.login.privacyPolicy")
        }}</a>
      </p>
    </footer>
  </div>
</template>

<style scoped>

.login-bg-layer {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      circle at 50% -20%,
      rgba(14, 165, 233, 0.15) 0%,
      transparent 60%
    ),
    radial-gradient(
      circle at 80% 100%,
      rgba(139, 92, 246, 0.08) 0%,
      transparent 50%
    );
  pointer-events: none;
}

.login-telegram-btn {
  background: linear-gradient(135deg, #0088cc, #049bd4);
  box-shadow: 0 10px 25px -5px rgba(0, 136, 204, 0.3);
}

.login-telegram-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
}

/* Premium Custom Toast */
.premium-toast {
  box-shadow:
    0 10px 40px -10px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.toast-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  animation: toast-progress 3s linear forwards;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.toast-enter-active {
  animation: toast-in 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

.toast-leave-active {
  animation: toast-out 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.9);
  }
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  background: #0ea5e9;
  border-radius: 50%;
  animation: dot-pulse 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dot-pulse {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
