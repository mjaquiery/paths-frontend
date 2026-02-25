import { ref, watch } from 'vue';

type DarkModePreference = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'darkModePreference';

function getSystemDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyDark(dark: boolean) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('ion-palette-dark', dark);
  }
}

function resolvePreference(pref: DarkModePreference): boolean {
  if (pref === 'dark') return true;
  if (pref === 'light') return false;
  return getSystemDark();
}

const storedRaw =
  typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
const initialPreference: DarkModePreference =
  storedRaw === 'dark' || storedRaw === 'light' || storedRaw === 'system'
    ? storedRaw
    : 'system';

const preference = ref<DarkModePreference>(initialPreference);
const isDark = ref<boolean>(resolvePreference(initialPreference));

applyDark(isDark.value);

// Listen for OS-level changes when preference is 'system'
if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    if (preference.value === 'system') {
      isDark.value = e.matches;
      applyDark(isDark.value);
    }
  });
}

watch(preference, (pref) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, pref);
  }
  isDark.value = resolvePreference(pref);
  applyDark(isDark.value);
});

export function useDarkMode() {
  function setPreference(pref: DarkModePreference) {
    preference.value = pref;
  }

  function toggle() {
    if (isDark.value) {
      setPreference('light');
    } else {
      setPreference('dark');
    }
  }

  return { isDark, preference, setPreference, toggle };
}
