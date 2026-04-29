<script setup>
import { useUiStore } from "@/stores/uiStore";
import { AlertTriangle, Info, OctagonX, HelpCircle } from "lucide-vue-next";

const uiStore = useUiStore();
</script>

<template>
  <Transition name="fade">
    <div
      v-if="uiStore.dialog.show"
      class="fixed inset-0 z-[10000] flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/80 backdrop-blur-sm"
        @click="uiStore.handleCancel"
      ></div>

      <!-- Dialog Card -->
      <Transition name="scale">
        <div
          v-if="uiStore.dialog.show"
          class="relative w-full max-w-sm bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-white/[0.08] rounded-[2rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
        >
          <div class="p-8">
            <!-- Icon -->
            <div class="flex justify-center mb-6">
              <div
                :class="[
                  'w-16 h-16 rounded-3xl flex items-center justify-center',
                  uiStore.dialog.type === 'danger'
                    ? 'bg-red-500/10 text-red-500'
                    : uiStore.dialog.type === 'warning'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-sky-500/10 text-sky-500',
                ]"
              >
                <OctagonX v-if="uiStore.dialog.type === 'danger'" :size="32" />
                <AlertTriangle
                  v-else-if="uiStore.dialog.type === 'warning'"
                  :size="32"
                />
                <HelpCircle v-else :size="32" />
              </div>
            </div>

            <!-- Content -->
            <div class="text-center space-y-2 mb-8">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                {{ uiStore.dialog.title }}
              </h3>
              <p class="text-slate-500 dark:text-neutral-400 text-sm leading-relaxed">
                {{ uiStore.dialog.message }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-3">
              <button
                @click="uiStore.handleConfirm"
                :class="[
                  'w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer',
                  uiStore.dialog.type === 'danger'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    : 'bg-slate-900 dark:bg-white text-white dark:text-black',
                ]"
              >
                {{ uiStore.dialog.confirmText }}
              </button>
              <button
                @click="uiStore.handleCancel"
                class="w-full py-4 rounded-2xl font-bold text-sm text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.06] transition-all active:scale-[0.98] cursor-pointer"
              >
                {{ uiStore.dialog.cancelText }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active {
  animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-leave-active {
  animation: scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) reverse;
}

@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
