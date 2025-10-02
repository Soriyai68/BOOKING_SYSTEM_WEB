import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import api from './utils/api'
import i18n from './i18n'

const app = createApp(App)
const pinia = createPinia()

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Test API connection in development
if (import.meta.env.VITE_APP_ENV === 'development') {
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
  console.log('Environment:', import.meta.env.VITE_APP_ENV)
  
  // Test API connection
  api.get('/health').then(response => {
    console.log('API Connected:', response.data)
  }).catch(error => {
    console.warn('API Connection failed:', error.message)
  })
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.use(i18n)

app.mount('#app')
