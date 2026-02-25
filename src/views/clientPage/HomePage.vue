<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  Ticket,
  MapPin,
  Clock,
  Phone,
  Star,
  ChevronRight,
} from "lucide-vue-next";

const { t } = useI18n();

const featuredMovies = ref([
  {
    id: 1,
    title: "Avatar: Way of Water",
    poster:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600",
    genre: "Sci-Fi",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Inception",
    poster:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600",
    genre: "Thriller",
    rating: 4.9,
  },
  {
    id: 3,
    title: "Interstellar",
    poster:
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600",
    genre: "Sci-Fi",
    rating: 4.7,
  },
  {
    id: 4,
    title: "Dune: Part Two",
    poster:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600",
    genre: "Adventure",
    rating: 4.6,
  },
]);
</script>

<template>
  <div class="home-page min-h-screen text-white relative overflow-hidden">
    <!-- Background -->
    <div class="home-bg"></div>

    <div class="relative z-10">
      <!-- Navigation -->
      <nav class="home-nav sticky top-0 z-30 px-4 sm:px-6 lg:px-8">
        <div class="max-w-6xl mx-auto flex items-center justify-between py-4">
          <div class="flex items-center gap-3">
            <img
              src="@/assets/rsb-cinema.png"
              alt="RSB Cinema"
              class="w-10 h-12 object-contain"
            />
            <div>
              <span class="text-sm font-bold">RSB Cinema</span>
              <span class="text-[10px] text-neutral-500 block">Erk Phnom</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <router-link
              to="/showtime"
              class="text-xs text-neutral-400 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-white/[0.05]"
            >
              {{ t("client.nav.showtimes") }}
            </router-link>
            <router-link
              to="/"
              class="home-login-btn text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer"
            >
              {{ t("client.nav.signIn") }}
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section
        class="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28"
      >
        <div class="max-w-6xl mx-auto text-center">
          <div
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] mb-8"
          >
            <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span class="text-[11px] text-neutral-400 font-medium">{{
              t("client.home.nowShowingCount", { count: 5 })
            }}</span>
          </div>

          <h1
            class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6"
          >
            {{ t("client.home.heroTitle1") }}<br />
            <span
              class="home-hero-gradient"
              v-html="t('client.home.heroTitle2')"
            ></span>
          </h1>

          <p
            class="text-base sm:text-lg text-neutral-400 max-w-lg mx-auto mb-10 leading-relaxed"
          >
            {{ t("client.home.heroDesc") }}
          </p>

          <div
            class="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <router-link
              to="/showtime"
              class="home-cta-primary group flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold cursor-pointer"
            >
              <Ticket :size="18" />
              {{ t("client.home.bookNow") }}
            </router-link>
            <router-link
              to="/showtime"
              class="flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-medium text-neutral-300 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] cursor-pointer"
            >
              {{ t("client.home.browseMovies") }}
            </router-link>
          </div>
        </div>
      </section>

      <!-- Now Showing -->
      <section class="px-4 sm:px-6 lg:px-8 pb-20">
        <div class="max-w-6xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-xl sm:text-2xl font-bold">
                {{ t("client.home.nowShowing") }}
              </h2>
              <p class="text-sm text-neutral-500 mt-1">
                {{ t("client.home.dontMissOut") }}
              </p>
            </div>
            <router-link
              to="/showtime"
              class="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
            >
              {{ t("client.home.viewAll") }}
              <ChevronRight :size="14" />
            </router-link>
          </div>

          <div
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <div
              v-for="movie in featuredMovies"
              :key="movie.id"
              class="group cursor-pointer"
            >
              <div
                class="relative rounded-2xl overflow-hidden mb-3 aspect-[2/3]"
              >
                <img
                  :src="movie.poster"
                  :alt="movie.title"
                  class="w-full h-full object-cover"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                ></div>

                <!-- Rating badge -->
                <div
                  class="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md text-[11px] font-bold"
                >
                  <Star :size="11" class="text-amber-400 fill-amber-400" />
                  {{ movie.rating }}
                </div>

                <!-- Genre badge -->
                <div
                  class="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-sky-500/20 backdrop-blur-md text-[10px] font-semibold text-sky-300 border border-sky-500/20"
                >
                  {{ movie.genre }}
                </div>
              </div>

              <h3
                class="text-sm font-bold leading-tight group-hover:text-sky-400"
              >
                {{ movie.title }}
              </h3>
            </div>
          </div>
        </div>
      </section>

      <!-- Info Section -->
      <section class="px-4 sm:px-6 lg:px-8 pb-20">
        <div class="max-w-6xl mx-auto">
          <div
            class="home-info-card rounded-2xl border border-white/[0.06] p-8 sm:p-10"
          >
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div class="flex items-start gap-4">
                <div
                  class="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0"
                >
                  <MapPin :size="18" class="text-sky-400" />
                </div>
                <div>
                  <h3 class="text-sm font-bold mb-1">
                    {{ t("client.home.location") }}
                  </h3>
                  <p
                    class="text-xs text-neutral-500 leading-relaxed"
                    v-html="t('client.home.locationInfo')"
                  ></p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div
                  class="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0"
                >
                  <Clock :size="18" class="text-emerald-400" />
                </div>
                <div>
                  <h3 class="text-sm font-bold mb-1">
                    {{ t("client.home.openHours") }}
                  </h3>
                  <p
                    class="text-xs text-neutral-500 leading-relaxed"
                    v-html="t('client.home.openHoursInfo')"
                  ></p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div
                  class="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0"
                >
                  <Phone :size="18" class="text-violet-400" />
                </div>
                <div>
                  <h3 class="text-sm font-bold mb-1">
                    {{ t("client.home.contact") }}
                  </h3>
                  <p
                    class="text-xs text-neutral-500 leading-relaxed"
                    v-html="t('client.home.contactInfo')"
                  ></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="px-4 sm:px-6 lg:px-8 py-8 border-t border-white/[0.04]">
        <div
          class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p class="text-[11px] text-neutral-600">
            {{ t("client.home.rightsReserved", { year: 2026 }) }}
          </p>
          <div class="flex items-center gap-6">
            <a
              href="#"
              class="text-[11px] text-neutral-500 hover:text-neutral-300"
              >{{ t("client.home.terms") }}</a
            >
            <a
              href="#"
              class="text-[11px] text-neutral-500 hover:text-neutral-300"
              >{{ t("client.home.privacy") }}</a
            >
            <a
              href="#"
              class="text-[11px] text-neutral-500 hover:text-neutral-300"
              >{{ t("client.home.support") }}</a
            >
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  background: #0a0a0c;
}

.home-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(
      ellipse 80% 60% at 50% 0%,
      rgba(14, 165, 233, 0.06) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse 60% 50% at 80% 100%,
      rgba(139, 92, 246, 0.04) 0%,
      transparent 50%
    );
  pointer-events: none;
}

.home-nav {
  background: rgba(10, 10, 12, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.home-login-btn {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: white;
  box-shadow: 0 2px 12px -2px rgba(14, 165, 233, 0.3);
}

.home-login-btn:hover {
  box-shadow: 0 4px 20px -2px rgba(14, 165, 233, 0.4);
}

.home-hero-gradient {
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.home-cta-primary {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: white;
  box-shadow:
    0 0 0 1px rgba(14, 165, 233, 0.3),
    0 8px 32px -8px rgba(14, 165, 233, 0.4);
}

.home-cta-primary:hover {
  box-shadow:
    0 0 0 1px rgba(14, 165, 233, 0.5),
    0 12px 40px -8px rgba(14, 165, 233, 0.5);
}

.home-info-card {
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.02),
    rgba(255, 255, 255, 0.01)
  );
}
</style>
