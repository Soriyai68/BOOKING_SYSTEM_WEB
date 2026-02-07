<template>
  <div>
    <header>
      <!-- Client Header - You can customize this -->
      <nav>
        <router-link to="/">Home</router-link> |
        <router-link to="/register">Register</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <!-- Client Footer -->
    </footer>
  </div>
</template>

<script setup>
// ClientLayout.vue
</script>

<style scoped>
/* Add client layout specific styles here */
</style>
