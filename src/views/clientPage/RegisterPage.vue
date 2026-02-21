<template>
  <div class="register-page min-h-screen text-white relative overflow-hidden">
    <!-- Background -->
    <div class="register-bg"></div>

    <!-- Main Container -->
    <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-4xl">
        <div
          class="register-card-inner rounded-3xl border border-white/[0.08] overflow-hidden relative"
        >
          <!-- Top gradient line -->
          <div
            class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
          ></div>

          <div class="flex flex-col md:flex-row min-h-[580px]">
            <!-- Left: Decorative Panel -->
            <div
              class="hidden md:flex w-1/2 relative items-center justify-center overflow-hidden"
            >
              <div class="register-deco-bg absolute inset-0"></div>
              <div class="register-deco-grid absolute inset-0"></div>

              <div class="relative z-10 text-center px-10">
                <div class="mb-6">
                  <svg
                    class="w-16 h-16 mx-auto text-emerald-400/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    stroke-width="1"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5"
                    />
                  </svg>
                </div>
                <h2 class="text-xl font-bold text-white mb-3">
                  Join RSB Cinema
                </h2>
                <p class="text-sm text-neutral-400 leading-relaxed">
                  Create your account and enjoy seamless<br />
                  movie ticket booking at your fingertips.
                </p>

                <!-- Stats -->
                <div
                  class="flex justify-center gap-8 mt-8 pt-6 border-t border-white/[0.06]"
                >
                  <div class="text-center">
                    <div class="text-lg font-bold text-emerald-400">50+</div>
                    <div class="text-[10px] text-neutral-500 uppercase tracking-wider">Movies</div>
                  </div>
                  <div class="text-center">
                    <div class="text-lg font-bold text-emerald-400">4</div>
                    <div class="text-[10px] text-neutral-500 uppercase tracking-wider">Halls</div>
                  </div>
                  <div class="text-center">
                    <div class="text-lg font-bold text-emerald-400">10K+</div>
                    <div class="text-[10px] text-neutral-500 uppercase tracking-wider">Users</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Form -->
            <div class="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
              <!-- Tab Switcher -->
              <div class="flex items-center gap-6 mb-10">
                <router-link
                  to="/"
                  class="text-2xl font-bold text-neutral-600 hover:text-neutral-400"
                >
                  Log In
                </router-link>
                <div class="relative">
                  <span class="text-2xl font-bold text-white">Sign Up</span>
                  <div
                    class="absolute -bottom-2 left-0 w-1/2 h-[3px] bg-emerald-500 rounded-full"
                  ></div>
                </div>
              </div>

              <p class="text-sm text-neutral-400 mb-8">
                Enter your phone number to get started
              </p>

              <!-- Phone Input -->
              <div class="space-y-2 mb-6">
                <label class="text-[11px] text-neutral-500 block uppercase tracking-wider font-medium">
                  Phone Number
                </label>
                <div class="register-input flex items-center rounded-xl p-3.5">
                  <div class="flex items-center gap-2 pr-3 border-r border-white/[0.08]">
                    <img
                      src="https://flagcdn.com/w20/kh.png"
                      alt="Cambodia"
                      class="rounded-sm w-5"
                    />
                    <span class="text-sm font-semibold text-neutral-300">+855</span>
                  </div>
                  <input
                    type="tel"
                    class="bg-transparent border-none focus:ring-0 outline-none w-full text-white placeholder-neutral-600 ml-3 text-sm"
                    placeholder="000 000 000"
                  />
                </div>
              </div>

              <!-- Full Name -->
              <div class="space-y-2 mb-8">
                <label class="text-[11px] text-neutral-500 block uppercase tracking-wider font-medium">
                  Full Name
                </label>
                <div class="register-input flex items-center rounded-xl p-3.5">
                  <input
                    type="text"
                    class="bg-transparent border-none focus:ring-0 outline-none w-full text-white placeholder-neutral-600 text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <!-- Submit -->
              <button
                class="register-submit-btn w-full font-bold py-4 rounded-2xl text-sm text-white cursor-pointer active:scale-[0.98]"
              >
                Create Account
              </button>

              <!-- Divider -->
              <div class="flex items-center gap-4 my-6">
                <div class="flex-1 h-[1px] bg-white/[0.06]"></div>
                <span class="text-[10px] text-neutral-600 uppercase tracking-wider">or continue with</span>
                <div class="flex-1 h-[1px] bg-white/[0.06]"></div>
              </div>

              <!-- Social Buttons -->
              <div class="flex gap-3">
                <button
                  class="register-social-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium text-neutral-300 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" class="h-4 w-4 fill-sky-400">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.13 7.19c-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59l2.76-2.69c.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02l-5.54 3.69c-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.64 6.3-2.73 7.55-3.26 3.58-1.51 4.34-1.77 4.83-1.77.11 0 .35.03.5.15.13.1.17.24.18.33 0 .06 0 .16-.02.2z"
                    />
                  </svg>
                  Telegram
                </button>
                <button
                  class="register-social-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium text-neutral-300 cursor-pointer"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    />
                  </svg>
                  Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.register-page {
  background: #0a0a0c;
}

.register-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 50% at 70% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse 50% 40% at 10% 100%, rgba(14, 165, 233, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.register-card-inner {
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.95), rgba(15, 15, 20, 0.98));
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
}

.register-deco-bg {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.04), rgba(14, 165, 233, 0.02));
}

.register-deco-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 40px 40px;
}

.register-input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.register-input:focus-within {
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08);
}

.register-submit-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow:
    0 0 0 1px rgba(16, 185, 129, 0.3),
    0 4px 24px -4px rgba(16, 185, 129, 0.3);
}

.register-submit-btn:hover {
  box-shadow:
    0 0 0 1px rgba(16, 185, 129, 0.5),
    0 8px 32px -4px rgba(16, 185, 129, 0.4);
}

.register-social-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.register-social-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}
</style>