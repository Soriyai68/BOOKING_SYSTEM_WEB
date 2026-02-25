<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/utils/api";
import {
  ArrowLeft,
  User as UserIcon,
  AtSign,
  Shield,
  Bell,
  Globe,
  LogOut,
  ChevronRight,
  Pencil,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import { setLanguage, availableLocales } from "@/i18n";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const { t, locale } = useI18n();
const authStore = useAuthStore();

// Real user data from API
const user = ref({
  first_name: "",
  last_name: "",
  username: "",
  telegram_id: null,
  photo_url: "",
  auth_date: "",
});

const fullName = ref("");
const isLoading = ref(true);

onMounted(async () => {
  try {
    const res = await api.get("/customer/auth/profile");
    if (res.data?.success && res.data?.data?.customer) {
      const customerData = res.data.data.customer;

      const nameParts = (customerData.name || "").split(" ");
      user.value = {
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        username: customerData.username || "",
        telegram_id: customerData.telegramId || null,
        photo_url: customerData.photoUrl || "",
        auth_date: customerData.createdAt || "",
      };
      fullName.value = customerData.name || "Customer";
    }
  } catch (error) {
    console.error("Failed to fetch customer profile:", error);
  } finally {
    isLoading.value = false;
  }
});

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: "Login Page" });
};

const currentLocale = computed({
  get: () => locale.value,
  set: (val) => setLanguage(val),
});

// Menu sections
const menuItems = computed(() => [
  {
    label: t("settings.account"),
    items: [
      {
        id: "personalInfo",
        icon: UserIcon,
        title: t("settings.personalInfo"),
        subtitle: t("settings.personalInfoDesc"),
        action: () => router.push({ name: "Personal Info" }),
      },
      {
        id: "privacySecurity",
        icon: Shield,
        title: t("settings.privacySecurity"),
        subtitle: t("settings.privacySecurityDesc"),
        action: () => router.push({ name: "Privacy Security" }),
      },
    ],
  },
  {
    label: t("settings.preferences"),
    items: [
      {
        id: "notifications",
        icon: Bell,
        title: t("settings.notifications"),
        subtitle: t("settings.notificationsDesc"),
        action: () => router.push({ name: "Notifications Setting" }),
      },
      {
        id: "language",
        icon: Globe,
        title: t("settings.language"),
        subtitle: t("settings.languageDesc"),
        type: "dropdown",
      },
    ],
  },
]);
</script>

<template>
  <div class="settings-page min-h-screen text-white relative overflow-hidden">
    <!-- Background -->
    <div class="settings-bg"></div>

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header -->
      <header
        class="py-3 px-5 flex items-center justify-between border-b border-white/[0.05]"
      >
        <div class="flex items-center gap-3">
          <button
            @click="router.back()"
            class="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer"
          >
            <ArrowLeft :size="18" class="text-neutral-400" />
          </button>
          <h1 class="text-sm font-bold">{{ t("settings.title") }}</h1>
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Profile Preview Card -->
        <div class="px-5 py-6">
          <div
            class="settings-profile-card rounded-2xl border border-white/[0.06] p-6"
          >
            <div class="flex items-center gap-4">
              <!-- Avatar -->
              <div class="relative">
                <div
                  v-if="user.photo_url"
                  class="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/[0.1]"
                >
                  <img
                    :src="user.photo_url"
                    :alt="fullName"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div
                  v-else
                  class="settings-avatar w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-white/[0.1]"
                >
                  <span class="text-xl font-bold text-white">
                    {{ user.first_name.charAt(0)
                    }}{{ user.last_name.charAt(0) }}
                  </span>
                </div>
                <!-- Edit badge -->
                <button
                  @click="router.push({ name: 'Personal Info' })"
                  class="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-sky-500 flex items-center justify-center border-2 border-[#0a0a0c] cursor-pointer"
                >
                  <Pencil :size="10" class="text-white" />
                </button>
              </div>

              <!-- User Info -->
              <div class="flex-1 min-w-0">
                <h2 class="text-base font-bold truncate">{{ fullName }}</h2>
                <div class="flex items-center gap-1.5 mt-1">
                  <AtSign :size="12" class="text-sky-400 flex-shrink-0" />
                  <span class="text-sm text-sky-400 font-medium truncate">
                    {{ user.username }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 mt-1.5">
                  <!-- Telegram icon -->
                  <svg
                    viewBox="0 0 24 24"
                    class="h-3 w-3 fill-neutral-500 flex-shrink-0"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.13 7.19c-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59l2.76-2.69c.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02l-5.54 3.69c-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.64 6.3-2.73 7.55-3.26 3.58-1.51 4.34-1.77 4.83-1.77.11 0 .35.03.5.15.13.1.17.24.18.33 0 .06 0 .16-.02.2z"
                    />
                  </svg>
                  <span class="text-[11px] text-neutral-500">{{
                    t("settings.telegramConnected")
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Telegram Info Strip -->
            <div class="mt-5 pt-4 border-t border-white/[0.04]">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div
                    class="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center"
                  >
                    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 fill-sky-400">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.13 7.19c-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59l2.76-2.69c.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02l-5.54 3.69c-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.64 6.3-2.73 7.55-3.26 3.58-1.51 4.34-1.77 4.83-1.77.11 0 .35.03.5.15.13.1.17.24.18.33 0 .06 0 .16-.02.2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p class="text-[11px] font-semibold text-neutral-300">
                      {{ t("users.username") }}
                    </p>
                    <p class="text-[11px] text-sky-400 font-medium">
                      @{{ user.username }}
                    </p>
                  </div>
                </div>
                <div
                  class="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                >
                  <span class="text-[10px] font-semibold text-emerald-400">{{
                    t("validation.verified")
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Menu Sections -->
        <div class="px-5 space-y-6 pb-6">
          <div v-for="section in menuItems" :key="section.label">
            <h3
              class="text-[10px] uppercase tracking-widest font-semibold text-neutral-600 mb-3 px-1"
            >
              {{ section.label }}
            </h3>
            <div
              class="rounded-2xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]"
            >
              <button
                v-for="item in section.items"
                :key="item.id"
                @click="item.action ? item.action() : null"
                class="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-white/[0.03] cursor-pointer"
              >
                <div
                  class="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0"
                >
                  <component
                    :is="item.icon"
                    :size="16"
                    class="text-neutral-400"
                  />
                </div>
                <div class="flex-1 text-left min-w-0">
                  <p class="text-sm font-semibold">{{ item.title }}</p>
                  <p class="text-[11px] text-neutral-500 mt-0.5">
                    {{ item.subtitle }}
                  </p>
                </div>

                <div
                  v-if="item.type === 'dropdown' && item.id === 'language'"
                  class="flex items-center gap-2"
                  @click.stop
                >
                  <select
                    v-model="currentLocale"
                    class="bg-white/[0.05] text-xs font-medium text-neutral-300 outline-none border border-white/[0.05] px-2 py-1 rounded-md cursor-pointer hover:bg-white/[0.08]"
                  >
                    <option
                      v-for="lang in availableLocales"
                      :key="lang.code"
                      :value="lang.code"
                      class="bg-[#0a0a0c] text-white"
                    >
                      {{ lang.nativeName }}
                    </option>
                  </select>
                </div>
                <div v-else-if="item.rightText" class="flex items-center gap-2">
                  <span
                    class="text-xs font-medium text-neutral-300 bg-white/[0.05] px-2 py-1 rounded-md"
                    >{{ item.rightText }}</span
                  >
                </div>

                <ChevronRight
                  v-if="!item.rightText && item.type !== 'dropdown'"
                  :size="16"
                  class="text-neutral-600 flex-shrink-0"
                />
              </button>
            </div>
          </div>

          <!-- Sign Out -->
          <div>
            <button
              @click="handleLogout"
              class="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-500/10 hover:bg-red-500/[0.04] cursor-pointer"
            >
              <LogOut :size="16" class="text-red-400" />
              <span class="text-sm font-semibold text-red-400">{{
                t("client.logout")
              }}</span>
            </button>
          </div>

          <!-- App footer -->
          <div class="text-center pb-4">
            <p class="text-[10px] text-neutral-700">RSB Cinema v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  background: #0a0a0c;
}

.settings-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      ellipse 80% 50% at 50% 0%,
      rgba(14, 165, 233, 0.04) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse 50% 40% at 80% 100%,
      rgba(139, 92, 246, 0.03) 0%,
      transparent 50%
    );
  pointer-events: none;
}

.settings-profile-card {
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.01)
  );
}

.settings-avatar {
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
}
</style>
