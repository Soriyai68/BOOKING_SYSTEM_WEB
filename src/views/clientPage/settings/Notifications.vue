<script setup>
import { useI18n } from "vue-i18n";
import { ArrowLeft } from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();
const { t } = useI18n();
</script>

<template>
  <div
    class="notifications-page min-h-screen text-white relative overflow-hidden"
  >
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
          <h1 class="text-sm font-bold">{{ t("settings.notifications") }}</h1>
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-5 py-6">
        <div
          class="rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.02] p-5"
        >
          <p class="text-sm text-neutral-400">
            Notification settings will go here.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page {
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
</style>
