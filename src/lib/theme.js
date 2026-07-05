// Theme + accent helpers. The pre-paint script in index.html applies the
// stored values before React mounts; these keep React in sync and persist changes.

export const THEME_KEY = 'theme';
export const ACCENT_KEY = 'accent';

export const THEME_OPTIONS = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

// Must mirror the [data-accent="…"] presets in index.css.
export const ACCENTS = [
  { id: 'amber',   label: 'Amber',   color: '#f59e0b' },
  { id: 'indigo',  label: 'Indigo',  color: '#4f46e5' },
  { id: 'violet',  label: 'Violet',  color: '#7c3aed' },
  { id: 'emerald', label: 'Emerald', color: '#059669' },
  { id: 'rose',    label: 'Rose',    color: '#e11d48' },
  { id: 'sky',     label: 'Sky',     color: '#0284c7' },
];

export function getStoredTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'system'; } catch { return 'system'; }
}

export function getStoredAccent() {
  try { return localStorage.getItem(ACCENT_KEY) || 'amber'; } catch { return 'amber'; }
}

export function systemPrefersDark() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(theme) {
  return theme === 'dark' || (theme === 'system' && systemPrefersDark()) ? 'dark' : 'light';
}

export function applyTheme(theme) {
  const dark = resolveTheme(theme) === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  // Sync the meta color-scheme so native UI (scrollbars, form controls) matches
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) meta.setAttribute('content', dark ? 'dark' : 'light');
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}

export function applyAccent(accentId) {
  document.documentElement.setAttribute('data-accent', accentId);
  try { localStorage.setItem(ACCENT_KEY, accentId); } catch {}
}

// Calls cb() whenever the OS light/dark preference changes. Returns an unsubscribe fn.
export function watchSystemTheme(cb) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => cb();
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
