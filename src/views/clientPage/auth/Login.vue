<script setup>
</script>

<template>
  <div
    class="login-page min-h-screen flex flex-col text-white relative overflow-hidden"
  >
    <!-- Background -->
    <div class="login-bg-layer"></div>

    <!-- Header / Nav Bar -->
    <header
      class="relative z-10 py-3 px-5 flex items-center justify-between border-b border-white/[0.05]"
    >
      <div class="flex items-center gap-3">
        <img
          src="@/assets/rsb-cinema.png"
          alt="RSB Cinema Logo"
          class="w-14 h-16 object-contain"
        />
        <div>
          <h1 class="text-[12px] font-bold leading-snug">
            រោងភាពយន្ត អ័រ អេស ប៊ី​ ឯកភ្នំ
          </h1>
          <p class="text-[10px] font-semibold text-neutral-500 mt-0.5 tracking-wide uppercase">
            RSB CINEMA EK PHNOM
          </p>
        </div>
      </div>
      <div></div>
    </header>

    <!-- Content -->
    <div class="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
      <div class="w-full max-w-[360px]">
        <div class="text-center mb-4">
          <h2 class="text-2xl font-bold tracking-tight text-white mb-2">
            Welcome Back
          </h2>
          <p class="text-sm text-neutral-400 leading-relaxed">
            Sign in with your Telegram account to<br />
            book your favorite movie tickets.
          </p>
        </div>

        <!-- Cinema illustration icons -->
        <div class="flex items-center justify-center gap-6 my-8 text-neutral-600">
          <div>
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
            </svg>
          </div>
          <div>
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
          </div>
          <div>
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>
          </div>
        </div>

        <!-- Telegram Login Button -->
        <button
          type="button"
          class="login-telegram-btn w-full flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-sm font-semibold text-white cursor-pointer"
        >
          <div class="login-telegram-icon-wrap">
            <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.13 7.19c-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59l2.76-2.69c.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02l-5.54 3.69c-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.64 6.3-2.73 7.55-3.26 3.58-1.51 4.34-1.77 4.83-1.77.11 0 .35.03.5.15.13.1.17.24.18.33 0 .06 0 .16-.02.2z"
              />
            </svg>
          </div>
          <span class="tracking-wide">Sign in with Telegram</span>
        </button>

        <!-- Additional info -->
        <div class="mt-6 text-center">
          <p class="text-[11px] text-neutral-600 leading-relaxed">
            Fast, secure login powered by Telegram.<br />
            No password needed.
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="relative z-10 px-8 py-5 border-t border-white/[0.05]">
      <p class="text-center text-[11px] text-neutral-500">
        By signing in, you agree to our
        <a href="#" class="text-sky-400/80 hover:text-sky-400">Terms</a>
        and
        <a href="#" class="text-sky-400/80 hover:text-sky-400">Privacy Policy</a>.
      </p>
    </footer>
  </div>
</template>

<style scoped>
.login-page {
  background: #0a0a0c;
}

.login-bg-layer {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(14, 165, 233, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(139, 92, 246, 0.04) 0%, transparent 50%);
  pointer-events: none;
}

.login-telegram-btn {
  background: linear-gradient(135deg, #0088cc, #0ea5e9);
}

.login-telegram-btn:active {
  transform: scale(0.98);
}

.login-telegram-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
}
</style>
