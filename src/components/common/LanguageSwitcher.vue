<template>
  <el-dropdown @command="handleLanguageChange" trigger="click" placement="bottom-end">
    <el-button text class="language-button">
      <span class="flag">{{ currentLocaleData.flag }}</span>
      <span class="name">{{ currentLocaleData.nativeName }}</span>
      <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item 
          v-for="locale in availableLocales" 
          :key="locale.code"
          :command="locale.code"
          :class="{ active: currentLocale === locale.code }"
        >
          <span class="flag">{{ locale.flag }}</span>
          <span class="name">{{ locale.nativeName }}</span>
          <el-icon v-if="currentLocale === locale.code" class="check-icon">
            <Check />
          </el-icon>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { availableLocales, setLanguage } from '@/i18n'
import { ArrowDown, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const { locale } = useI18n()

const currentLocale = computed(() => locale.value)

const currentLocaleData = computed(() => {
  return availableLocales.find(l => l.code === currentLocale.value) || availableLocales[0]
})

const handleLanguageChange = (localeCode) => {
  if (localeCode === currentLocale.value) return
  
  try {
    setLanguage(localeCode)
    const selectedLocale = availableLocales.find(l => l.code === localeCode)
    ElMessage.success(`Language changed to ${selectedLocale.nativeName}`)
    
    // Optional: Reload page to ensure all components use new language
    // window.location.reload()
  } catch (error) {
    ElMessage.error('Failed to change language')
    console.error('Language change error:', error)
  }
}
</script>

<style scoped>
.language-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.language-button:hover {
  background-color: var(--el-fill-color-light);
}

.flag {
  font-size: 16px;
  line-height: 1;
}

.name {
  font-size: 14px;
  font-weight: 500;
  min-width: 50px;
  text-align: left;
}

.dropdown-icon {
  font-size: 12px;
  color: var(--el-text-color-regular);
  transition: transform 0.3s;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  min-width: 120px;
}

:deep(.el-dropdown-menu__item.active) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.check-icon {
  margin-left: auto;
  font-size: 14px;
  color: var(--el-color-primary);
}

/* RTL Support */
html[dir="rtl"] .language-button {
  flex-direction: row-reverse;
}

html[dir="rtl"] .name {
  text-align: right;
}
</style>