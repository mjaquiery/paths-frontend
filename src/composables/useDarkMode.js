"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDarkMode = useDarkMode;
var vue_1 = require("vue");
var STORAGE_KEY = 'darkModePreference';
function getSystemDark() {
    if (typeof window === 'undefined' || !window.matchMedia)
        return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function applyDark(dark) {
    if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('ion-palette-dark', dark);
    }
}
function resolvePreference(pref) {
    if (pref === 'dark')
        return true;
    if (pref === 'light')
        return false;
    return getSystemDark();
}
var storedRaw = typeof window !== 'undefined' &&
    typeof localStorage !== 'undefined' &&
    typeof localStorage.getItem === 'function'
    ? localStorage.getItem(STORAGE_KEY)
    : null;
var initialPreference = storedRaw === 'dark' || storedRaw === 'light' || storedRaw === 'system'
    ? storedRaw
    : 'system';
var preference = (0, vue_1.ref)(initialPreference);
var isDark = (0, vue_1.ref)(resolvePreference(initialPreference));
applyDark(isDark.value);
// Listen for OS-level changes when preference is 'system'
if (typeof window !== 'undefined' && window.matchMedia) {
    var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', function (e) {
        if (preference.value === 'system') {
            isDark.value = e.matches;
            applyDark(isDark.value);
        }
    });
}
(0, vue_1.watch)(preference, function (pref) {
    if (typeof window !== 'undefined') {
        if (pref === 'system') {
            localStorage.removeItem(STORAGE_KEY);
        }
        else {
            localStorage.setItem(STORAGE_KEY, pref);
        }
    }
    isDark.value = resolvePreference(pref);
    applyDark(isDark.value);
});
function useDarkMode() {
    function setPreference(pref) {
        preference.value = pref;
    }
    // Cycles: light → dark → system → light …
    // Returning to 'system' removes the stored preference so the OS signal takes over.
    function toggle() {
        if (preference.value === 'light') {
            setPreference('dark');
        }
        else if (preference.value === 'dark') {
            setPreference('system');
        }
        else {
            setPreference('light');
        }
    }
    return { isDark: isDark, preference: preference, setPreference: setPreference, toggle: toggle };
}
