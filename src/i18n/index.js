import { createI18n } from 'vue-i18n'
import en from '@/locales/en'
import kh from '@/locales/kh'

// Get saved language from localStorage or default to English
const savedLanguage = localStorage.getItem('cinema_language') || 'en'

const messages = {
  en,
  kh
}

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLanguage, // Set locale
  fallbackLocale: 'en', // Set fallback locale
  messages,
  globalInjection: true, // Enable $t in templates
  warnHtmlMessage: false // Disable HTML message warnings
})

// Export locale switching function
export function setLanguage(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('cinema_language', locale)
  
  // Update document direction for RTL languages if needed
  document.documentElement.setAttribute('lang', locale)
  
  return locale
}

// Export available locales
export const availableLocales = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "https://flagcdn.com/us.svg",
  },
  {
    code: "kh",
    name: "Khmer",
    nativeName: "ខ្មែរ",
    flag: "https://flagcdn.com/kh.svg",
  },
];

export default i18n