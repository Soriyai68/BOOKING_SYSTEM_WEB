import { useDark, useToggle } from '@vueuse/core';

// This binds to the <html> tag and uses localStorage 'vueuse-color-scheme' by default
export const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});

export const toggleDark = useToggle(isDark);
