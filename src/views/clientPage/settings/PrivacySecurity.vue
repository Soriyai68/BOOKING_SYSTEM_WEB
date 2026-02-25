<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  ArrowLeft,
  Shield,
  Smartphone,
  Globe,
  LogOut,
  Trash2,
  AlertTriangle,
  Loader2,
  ChevronRight,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import api from "@/utils/api";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();

const isLoading = ref(true);
const sessions = ref([]);
const showDeleteModal = ref(false);
const isDeleting = ref(false);
const message = ref({ text: "", type: "" });

const fetchSessions = async () => {
  try {
    isLoading.value = true;
    const res = await api.get("/customer/auth/sessions");
    if (res.data?.success) {
      const currentId = localStorage.getItem("cinema_session_id");
      sessions.value = (res.data.data.sessions || [])
        .map((session) => ({
          ...session,
          isCurrent: session.sessionId === currentId,
        }))
        .sort((a, b) => b.isCurrent - a.isCurrent);
    }
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleLogoutSession = async (sessionId) => {
  try {
    const res = await api.delete(`/customer/auth/sessions/${sessionId}`);
    if (res.data?.success) {
      sessions.value = sessions.value.filter((s) => s.sessionId !== sessionId);
      message.value = { text: "Session logged out", type: "success" };
      setTimeout(() => (message.value = { text: "", type: "" }), 3000);
    }
  } catch (error) {
    console.error("Failed to logout session:", error);
  }
};

const handleLogoutOthers = async () => {
  try {
    const others = sessions.value.filter((s) => !s.isCurrent);
    for (const session of others) {
      await api.delete(`/customer/auth/sessions/${session.sessionId}`);
    }
    await fetchSessions();
    message.value = { text: "Other devices logged out", type: "success" };
    setTimeout(() => (message.value = { text: "", type: "" }), 3000);
  } catch (error) {
    console.error("Failed to logout other devices:", error);
  }
};

const handleDeleteAccount = async () => {
  try {
    isDeleting.value = true;
    const res = await api.delete("/customer/auth/account");
    if (res.data?.success) {
      // Clear local state and redirect to login
      await authStore.logout();
      router.push({ name: "Login Page" });
    }
  } catch (error) {
    console.error("Failed to delete account:", error);
    message.value = { text: t("settings.updateError"), type: "error" };
    isDeleting.value = false;
    showDeleteModal.value = false;
  }
};

onMounted(fetchSessions);
</script>

<template>
  <div
    class="privacy-security-page min-h-screen text-white relative overflow-hidden"
  >
    <!-- Background -->
    <div class="settings-bg"></div>

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header -->
      <header
        class="py-3 px-5 flex items-center gap-3 border-b border-white/[0.05]"
      >
        <button
          @click="router.back()"
          class="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer"
        >
          <ArrowLeft :size="18" class="text-neutral-400" />
        </button>
        <h1 class="text-sm font-bold">{{ t("settings.privacySecurity") }}</h1>
      </header>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-5 py-6">
        <div
          v-if="message.text"
          :class="[
            'mb-4 p-3 rounded-xl text-xs font-medium border animate-in fade-in slide-in-from-top-2',
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20',
          ]"
        >
          {{ message.text }}
        </div>

        <!-- Active Sessions Section -->
        <section class="space-y-4">
          <div class="flex items-center justify-between px-1">
            <div>
              <h2 class="text-sm font-bold">
                {{ t("settings.activeSessions") }}
              </h2>
              <p class="text-[11px] text-neutral-500">
                {{ t("settings.sessionsDesc") }}
              </p>
            </div>
          </div>

          <div v-if="isLoading" class="py-10 flex justify-center">
            <Loader2 class="w-6 h-6 text-sky-500 animate-spin" />
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="session in sessions"
              :key="session.sessionId"
              class="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center gap-4"
            >
              <div
                class="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center text-neutral-400"
              >
                <Smartphone
                  v-if="session.device?.type === 'mobile'"
                  :size="20"
                />
                <Globe v-else :size="20" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium text-white truncate">
                    <template
                      v-if="session.device?.vendor || session.device?.model"
                    >
                      {{ session.device.vendor }} {{ session.device.model }}
                    </template>
                    <template v-else>
                      {{ session.device?.browser || "Unknown" }} on
                      {{ session.device?.os || "Device" }}
                    </template>
                  </p>
                  <span
                    v-if="session.isCurrent"
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-400 uppercase tracking-wider"
                  >
                    {{ t("settings.thisDevice") }}
                  </span>
                </div>
                <p class="text-[11px] text-neutral-500">
                  {{ session.ip }} •
                  {{ new Date(session.loginTime).toLocaleDateString() }}
                </p>
              </div>
              <button
                v-if="!session.isCurrent"
                @click="handleLogoutSession(session.sessionId)"
                class="p-2 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                title="Logout device"
              >
                <LogOut :size="16" />
              </button>
            </div>

            <button
              v-if="sessions.length > 1"
              @click="handleLogoutOthers"
              class="w-full py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-[11px] font-bold text-neutral-400 hover:bg-white/[0.05] transition-colors"
            >
              {{ t("settings.logoutOtherDevices") }}
            </button>
          </div>
        </section>

        <!-- Danger Zone -->
        <section class="mt-10 space-y-4">
          <h2
            class="text-sm font-bold text-red-500/80 uppercase tracking-widest px-1"
          >
            {{ t("settings.deleteAccountWarning") }}
          </h2>

          <div
            class="rounded-2xl border border-red-500/10 bg-red-500/[0.02] p-4"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 flex-shrink-0"
              >
                <AlertTriangle :size="16" />
              </div>
              <div class="flex-1">
                <p class="text-xs font-semibold text-neutral-200">
                  {{ t("settings.deleteAccount") }}
                </p>
                <p class="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                  {{ t("settings.deleteAccountDesc") }}
                </p>
              </div>
            </div>
            <button
              @click="showDeleteModal = true"
              class="w-full mt-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all active:scale-[0.98]"
            >
              {{ t("settings.deleteAccount") }}
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-black/80 backdrop-blur-sm"
        @click="showDeleteModal = false"
      ></div>

      <div
        class="relative w-full max-w-sm bg-[#0f0f12] border border-white/[0.08] rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-5"
      >
        <div
          class="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4"
        >
          <Trash2 :size="24" />
        </div>

        <h3 class="text-lg font-bold text-white mb-2">
          {{ t("settings.deleteAccountConfirmTitle") }}
        </h3>
        <p class="text-sm text-neutral-400 mb-6 leading-relaxed">
          {{ t("settings.deleteAccountConfirmDesc") }}
        </p>

        <div class="flex flex-col gap-3">
          <button
            @click="handleDeleteAccount"
            :disabled="isDeleting"
            class="w-full py-4 rounded-xl bg-red-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Loader2 v-if="isDeleting" :size="18" class="animate-spin" />
            {{ t("settings.confirmDeleteAccount") }}
          </button>

          <button
            @click="showDeleteModal = false"
            class="w-full py-4 rounded-xl bg-white/[0.05] text-neutral-300 font-bold hover:bg-white/[0.08] transition-all"
          >
            {{ t("settings.cancel") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.privacy-security-page {
  background: #0a0a0c;
}

.settings-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      ellipse 80% 50% at 50% 0%,
      rgba(239, 68, 68, 0.03) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse 50% 40% at 80% 100%,
      rgba(139, 92, 246, 0.02) 0%,
      transparent 50%
    );
  pointer-events: none;
}
</style>
