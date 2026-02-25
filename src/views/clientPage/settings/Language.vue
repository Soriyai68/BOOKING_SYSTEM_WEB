<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ArrowLeft, Check } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { setLanguage, availableLocales } from "@/i18n";

const router = useRouter();
const { t, locale } = useI18n();

const changeLanguage = (code) => {
  setLanguage(code);
};

const languages = computed(() => availableLocales);
</script>

<template>
  <div class="language-page min-h-screen text-white relative overflow-hidden">
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
          <h1 class="text-sm font-bold">{{ t("settings.language") }}</h1>
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-5 py-6">
        <div
          class="rounded-2xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04] bg-white/[0.02]"
        >
          <button
            v-for="lang in languages"
            :key="lang.code"
            @click="changeLanguage(lang.code)"
            class="w-full flex items-center gap-3.5 px-4 py-4 hover:bg-white/[0.03] cursor-pointer transition-colors"
          >
            <div
              class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white/[0.05]"
            >
              <img
                :src="lang.flag"
                :alt="lang.name"
                class="w-full h-full object-cover"
                v-if="lang.flag"
              />
            </div>

            <div class="flex-1 text-left min-w-0">
              <p class="text-sm font-medium">{{ lang.nativeName }}</p>
              <p class="text-xs text-neutral-500 mt-0.5">{{ lang.name }}</p>
            </div>

            <div
              v-if="locale === lang.code"
              class="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0"
            >
              <Check :size="14" stroke-width="3" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.language-page {
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
