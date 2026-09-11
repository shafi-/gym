export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'pulse-theme';

export function getStoredThemePreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') return value;
  } catch {
    // localStorage unavailable (private mode) — fall through to system.
  }
  return 'system';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Applies the resolved theme to <html data-theme> and the PWA status-bar color. */
export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.theme = resolved;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = resolved === 'dark' ? '#0F0F1A' : '#4F46E5';
  return resolved;
}

/** Sets the preference (persisted) and applies it immediately. */
export function setThemePreference(preference: ThemePreference): ResolvedTheme {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Persisting is best-effort; the in-memory preference still applies.
  }
  return applyTheme(preference);
}

/**
 * Applies the stored preference and keeps `data-theme` in sync while the
 * preference is 'system' and the OS theme changes. Returns a cleanup.
 */
export function initTheme(): () => void {
  applyTheme(getStoredThemePreference());
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    if (getStoredThemePreference() === 'system') applyTheme('system');
  };
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}
