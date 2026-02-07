<template>
  <div
    class="min-h-screen bg-neutral-900 flex flex-col items-center pt-8 font-sans text-white"
  >
    <header
      class="w-full max-w-6xl px-4 flex justify-between items-center mb-12"
    >
      <div class="flex flex-col items-center">
        <div
          class="text-2xl font-black tracking-tighter border-y-4 border-red-600 px-2"
        >
          LEGEND <span class="text-red-600">CINEMA</span>
        </div>
      </div>
      <div
        class="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition"
      >
        <img
          src="https://flagcdn.com/w20/gb.png"
          alt="UK Flag"
          class="rounded-sm"
        />
        <span class="text-sm font-medium">EN</span>
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>
    </header>

    <main class="w-full max-w-5xl px-4">
      <nav class="text-sm mb-6 text-gray-400">
        <span class="hover:text-white cursor-pointer">Home</span>
        <span class="mx-2">/</span>
        <span class="text-white font-semibold">Sign Up</span>
      </nav>

      <div
        class="bg-black border border-neutral-800 rounded-xl overflow-hidden flex min-h-[500px] shadow-2xl"
      >
        <div
          class="hidden md:block w-1/2 bg-gradient-to-br from-neutral-900 to-black relative"
        >
          <div
            class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
          ></div>
        </div>

        <div class="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <div class="flex items-center space-x-8 mb-10">
            <button
              class="text-3xl font-bold text-neutral-600 hover:text-neutral-400 transition"
            >
              Log In
            </button>
            <div class="relative">
              <button class="text-3xl font-bold text-white">Sign Up</button>
              <div
                class="absolute -bottom-2 left-0 w-1/2 h-1 bg-red-600 rounded-full"
              ></div>
            </div>
          </div>

          <p class="text-lg font-medium mb-8">
            Enter your phone number to get verification code
          </p>

          <div class="space-y-2 mb-8">
            <label class="text-sm text-gray-400 block">Phone Number</label>
            <div
              class="flex items-center bg-transparent border border-neutral-700 rounded-lg p-3 focus-within:border-red-600 transition group"
            >
              <div
                class="flex items-center space-x-2 pr-3 border-r border-neutral-700"
              >
                <img
                  src="https://flagcdn.com/w20/kh.png"
                  alt="Cambodia"
                  class="rounded-sm"
                />
                <span class="font-medium">+855</span>
              </div>
              <input
                type="tel"
                class="bg-transparent border-none focus:ring-0 w-full text-white placeholder-neutral-600 ml-3"
                placeholder="000 000 000"
              />
            </div>
          </div>

          <button
            class="w-full bg-neutral-600 hover:bg-neutral-500 text-white font-bold py-4 rounded-full transition-all duration-300 shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </main>
  </div>
</template>


<script setup></script>