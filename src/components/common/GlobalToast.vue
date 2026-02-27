<script setup>
import { useUiStore } from "@/stores/uiStore";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-vue-next";

const uiStore = useUiStore();
</script>

<template>
  <div
    class="toast-container fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 w-full pointer-events-none"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="pointer-events-auto"
      >
        <div
          :class="[
            'premium-toast flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold shadow-[0_20px_50px_rgba(0,0,0,0.5)] border backdrop-blur-2xl relative overflow-hidden min-w-[300px] max-w-[90vw]',
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : toast.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-sky-500/10 border-sky-500/20 text-sky-400',
          ]"
        >
          <!-- Icon Wrap -->
          <div
            :class="[
              'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
              toast.type === 'success'
                ? 'bg-emerald-500/20'
                : toast.type === 'error'
                  ? 'bg-red-500/20'
                  : toast.type === 'warning'
                    ? 'bg-amber-500/20'
                    : 'bg-sky-500/20',
            ]"
          >
            <CheckCircle v-if="toast.type === 'success'" :size="18" />
            <XCircle v-else-if="toast.type === 'error'" :size="18" />
            <AlertCircle v-else-if="toast.type === 'warning'" :size="18" />
            <Info v-else :size="18" />
          </div>

          <span class="tracking-tight">{{ toast.message }}</span>

          <!-- Progress Bar -->
          <div
            :class="[
              'toast-progress-bar',
              toast.type === 'success'
                ? 'bg-emerald-500/40'
                : toast.type === 'error'
                  ? 'bg-red-500/40'
                  : toast.type === 'warning'
                    ? 'bg-amber-500/40'
                    : 'bg-sky-500/40',
            ]"
            :style="{ animationDuration: toast.duration + 'ms' }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
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
  animation: toast-progress linear forwards;
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
</style>
