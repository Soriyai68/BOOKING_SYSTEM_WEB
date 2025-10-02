<template>
  <div class="app-loading">
    <div class="loading-container">
      <!-- Logo -->
      <div class="logo">
        <div class="logo-icon">🥷</div>
        <h2>Ninja Booking</h2>
      </div>

      <!-- Loading content -->
      <div class="loading-content">
        <!-- Spinner -->
        <div class="spinner"></div>
        <p class="loading-text">Loading...</p>
        <p class="loading-subtext">Initializing system...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// No imports needed - using CSS variables
</script>

<style scoped>
.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-container {
  text-align: center;
  background: var(--bg-color-primary);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 40px var(--shadow-color);
  max-width: 400px;
  width: 90%;
  transition: background-color 0.3s;
}

.logo {
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--primary-color);
}

.logo h2 {
  margin: 0;
  color: var(--text-color-primary);
  font-weight: 600;
  transition: color 0.3s;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-text {
  margin: 0;
  color: var(--text-color-primary);
  font-weight: 500;
  font-size: 16px;
  transition: color 0.3s;
}

.loading-subtext {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 14px;
  transition: color 0.3s;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
