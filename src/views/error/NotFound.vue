<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>Page Not Found</h1>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <el-button type="primary" @click="$router.push('/admin/dashboard')">
        Go to Dashboard
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.not-found-content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #e6a23c;
  margin-bottom: 16px;
}

h1 {
  font-size: 32px;
  margin-bottom: 16px;
  color: #303133;
}

p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 24px;
}
</style>