import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import api from './utils/api'
import i18n from './i18n'
import PermissionPlugin, { initializePermissionSystem } from './plugins/permissions'
import PermissionDirective from './directives/permission'
import PermissionGuard from './components/common/PermissionGuard.vue'

const app = createApp(App)
const pinia = createPinia()

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Register global components
app.component('PermissionGuard', PermissionGuard)

// Test API connection in development
if (import.meta.env.VITE_APP_ENV === 'development') {
  api.get('/health').then(() => {}).catch(() => {})
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(i18n)
app.use(PermissionPlugin)
app.use(PermissionDirective)

app.mount('#app')

// Initialize the permission system
initializePermissionSystem()
