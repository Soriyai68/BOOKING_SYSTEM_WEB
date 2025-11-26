<template>
  <div class="sidebar-container">
    <!-- Logo -->
    <div class="logo">
      <div class="logo-content" :class="{ collapsed: sidebarCollapsed }">
        <img src="@/assets/ek.jpg" alt="Logo" class="logo-image"/>
        <span v-show="!sidebarCollapsed" class="logo-text">Ninja Booking</span>
        <!-- Optional text if sidebar not collapsed -->
      </div>
    </div>

    <!-- Navigation Menu -->
    <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="sidebarCollapsed"
        :unique-opened="true"
        router
    >
      <el-menu-item
          v-if="isSuperAdmin || canViewDashboard"
          index="/admin/dashboard"
      >
        <el-icon>
          <LayoutDashboard/>
        </el-icon>
        <template #title>{{ $t("nav.dashboard") }}</template>
      </el-menu-item>

      <!-- Booking Management -->
      <el-menu-item
          v-if="isSuperAdmin || canViewBookings"
          index="/admin/bookings"
      >
        <el-icon>
          <BookOpen/>
        </el-icon>
        <template #title>{{ $t("bookings.title") }}</template>
      </el-menu-item>

      <el-sub-menu v-if="isSuperAdmin || canViewSeats" index="seats">
        <template #title>
          <el-icon>
            <Armchair/>
          </el-icon>
          <span>{{ $t("seats.title") }}</span>
        </template>
        <el-menu-item index="/admin/seats">
          <el-icon>
            <Armchair/>
          </el-icon>
          <template #title>{{ $t("seats.allSeats") }}</template>
        </el-menu-item>
        <el-menu-item v-if="isSuperAdmin || canViewBookings" index="/admin/seat-booking">
          <el-icon>
            <BookOpen/>
          </el-icon>
          <template #title>{{ $t("seats.seatBooking") }}</template>
        </el-menu-item>
        <!-- <el-menu-item v-if="isSuperAdmin || canCreateSeats" index="/admin/seats/create">
          <el-icon>
            <Plus/>
          </el-icon>
          <template #title>{{ $t("seats.addSeat") }}</template>
        </el-menu-item> -->
      </el-sub-menu>

      <el-sub-menu v-if="isSuperAdmin || canViewHalls" index="halls">
        <template #title>
          <el-icon>
            <Monitor/>
          </el-icon>
          <span>{{ $t("halls.title") }}</span>
        </template>
        <el-menu-item index="/admin/halls">
          <el-icon>
            <Monitor/>
          </el-icon>
          <template #title>{{ $t("halls.allHalls") }}</template>
        </el-menu-item>
        <!-- <el-menu-item v-if="isSuperAdmin || canCreateHalls" @click="openCreateHallDialog">
          <el-icon>
            <Plus/>
          </el-icon>
          <template #title>{{ $t("halls.addHall") }}</template>
        </el-menu-item> -->
      </el-sub-menu>

      <el-sub-menu v-if="isSuperAdmin || canViewTheaters" index="theaters">
        <template #title>
          <el-icon>
            <Projector/>
          </el-icon>
          <span>{{ $t("theaters.title") }}</span>
        </template>
        <el-menu-item index="/admin/theaters">
          <el-icon>
            <Projector/>
          </el-icon>
          <template #title>{{ $t("theaters.allTheaters") }}</template>
        </el-menu-item>
        <!-- <el-menu-item v-if="isSuperAdmin || canCreateTheaters" index="/admin/theaters/create">
          <el-icon>
            <Plus/>
          </el-icon>
          <template #title>{{ $t("theaters.addTheater") }}</template>
        </el-menu-item> -->
      </el-sub-menu>

      <el-sub-menu v-if="isSuperAdmin || canViewMovies" index="movies">
        <template #title>
          <el-icon>
            <Film/>
          </el-icon>
          <span>{{ $t("movies.title") }}</span>
        </template>
        <el-menu-item index="/admin/movies">
          <el-icon>
            <Clapperboard/>
          </el-icon>
          <template #title>{{ $t("movies.allMovies") }}</template>
        </el-menu-item>
        <el-menu-item
            v-if="isSuperAdmin || canCreateMovies"
            index="/admin/movies/create"
        >
          <el-icon>
            <Plus/>
          </el-icon>
          <template #title>{{ $t("movies.addMovie") }}</template>
        </el-menu-item>
      </el-sub-menu>

      <!-- Promotions -->
      <el-sub-menu v-if="isSuperAdmin || canViewPromotions" index="promotions">
        <template #title>
          <el-icon>
            <Tag/>
          </el-icon>
          <span>{{ $t("promotions.title") }}</span>
        </template>
        <el-menu-item index="/admin/promotions">
          <el-icon>
            <Tag/>
          </el-icon>
          <template #title>{{ $t("promotions.allPromotions") || 'All Promotions' }}</template>
        </el-menu-item>
        <el-menu-item
            v-if="isSuperAdmin || canCreatePromotions"
            index="/admin/promotions/create"
        >
          <el-icon>
            <Plus/>
          </el-icon>
          <template #title>{{ $t("promotions.addPromotion") || 'Add Promotion' }}</template>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu v-if="isSuperAdmin || canViewShowtimes" index="showtimes">
        <template #title>
          <el-icon>
            <Ticket/>
          </el-icon>
          <span>{{ $t("showtimes.title") }}</span>
        </template>
        <el-menu-item index="/admin/showtimes">
          <el-icon>
            <Ticket/>
          </el-icon>
          <template #title>{{ $t("showtimes.allShowtimes") }}</template>
        </el-menu-item>
        <el-menu-item
            v-if="isSuperAdmin || canCreateShowtimes"
            index="/admin/showtimes/create"
        >
          <el-icon>
            <Plus/>
          </el-icon>
          <template #title>{{ $t("showtimes.addShowtime") }}</template>
        </el-menu-item>
      </el-sub-menu>

      <!-- <el-sub-menu v-if="isSuperAdmin || canViewHalls" index="bookings">
        <template #title>
          <el-icon>
            <BookOpen />
          </el-icon>
          <span>{{ $t("bookings.title") }}</span>
        </template>
        <el-menu-item index="/admin/bookings">
          <el-icon>
            <BookOpen />
          </el-icon>
          <template #title>{{ $t("bookings.title") }}</template>
        </el-menu-item>
      </el-sub-menu> -->

      <!-- report  -->
      <!-- <el-sub-menu v-if="isSuperAdmin || canViewHalls" index="bookings">
        <template #title>
          <el-icon>
           <ClipboardCheck />
          </el-icon>
          <span>Reports Management</span>
        </template>
        <el-menu-item index="/admin/bookings">
          <el-icon>
            <BookOpen />
          </el-icon>
          <template #title>All Reports</template>
        </el-menu-item>
        <el-menu-item index="/admin/bookings">
          <el-icon>
            <BookOpen />
          </el-icon>
          <template #title>All Bookings</template>
        </el-menu-item>
        <el-menu-item index="/admin/bookings">
          <el-icon>
            <BookOpen />
          </el-icon>
          <template #title>All Payments</template>
        </el-menu-item>
      </el-sub-menu> -->

      <!-- User Management (Dialog-based create) -->
      <el-menu-item v-if="isSuperAdmin || canViewUsers" index="/admin/users">
        <el-icon>
          <Users/>
        </el-icon>
        <template #title>{{ $t("users.title") }}</template>
      </el-menu-item>

      <!-- System Management (SuperAdmin Only) -->
      <el-sub-menu v-if="isSuperAdmin" index="system">
        <template #title>
          <el-icon>
            <Shield/>
          </el-icon>
          <span>{{ $t("system.title") }}</span>
        </template>
        <el-menu-item index="/admin/system/permissions">
          <el-icon>
            <Shield/>
          </el-icon>
          <template #title>{{ $t("system.permissions") }}</template>
        </el-menu-item>
        <el-menu-item index="/admin/system/role-permissions">
          <el-icon>
            <UserCog/>
          </el-icon>
          <template #title>{{ $t("system.rolePermissions") }}</template>
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item
          v-if="isSuperAdmin || canViewSettings"
          index="/admin/settings"
      >
        <el-icon>
          <Settings/>
        </el-icon>
        <template #title>{{ $t("nav.settings") }}</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import {computed} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useAppStore} from "@/stores/app";
import {usePermissions} from "@/composables/usePermissions";
import {
  Armchair,
  BookOpen,
  Clapperboard,
  Film,
  LayoutDashboard,
  Monitor,
  Plus,
  Projector,
  Settings,
  Shield,
  Tag,
  Ticket,
  UserCog,
  Users
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const {
  canViewUsers,
  canViewDashboard,
  canViewSettings,
  canViewTheaters,
  canCreateTheaters,
  canViewHalls,
  canCreateHalls,
  canViewSeats,
  canViewMovies,
  canCreateMovies,
  canViewPromotions,
  canCreatePromotions,
  canViewShowtimes,
  canCreateShowtimes,
  canViewBookings,
  isSuperAdmin,
} = usePermissions();

// Remove debug after fixing

const activeMenu = computed(() => route.path);
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed);
const theme = computed(() => appStore.theme);
</script>

<style scoped>
.sidebar-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
  transition: background-color 0.3s;
}

.logo-content {
  display: flex;
  align-items: center;
  color: var(--el-text-color-primary);
  font-weight: bold;
  font-size: 18px;
  transition: all 0.3s;
}

.logo-content.collapsed {
  justify-content: center;
}

.logo-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  margin-right: 8px;
}

.logo-content.collapsed .logo-icon {
  margin-right: 0;
}

.logo-text {
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 240px;
}

/* Custom menu item styles */
:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
}

:deep(.el-sub-menu .el-menu-item) {
  height: 40px;
  line-height: 40px;
  padding-left: 50px !important;
}

.logo-image {
  height: 36px; /* keeps it compact */
  width: auto;
  margin-right: 10px;
  border-radius: 8px; /* smooth rounded corners */
  object-fit: cover; /* prevents stretching */
  transition: all 0.3s ease;
}

/* Center logo when collapsed */
.logo-content.collapsed .logo-image {
  margin: 0 auto;
}

/* Add a hover effect */
.logo-image:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}
</style>
