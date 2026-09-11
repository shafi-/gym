import { useCallback, useState } from 'react';
import {
  getStoredThemePreference,
  resolveTheme,
  setThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from '../lib/theme';

/** React binding for the app theme. The DOM attribute itself is managed by
 * src/lib/theme.ts so this hook only tracks preference state for the UI. */
export function useTheme(): {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
} {
  const [preference, setPreferenceState] = useState<ThemePreference>(getStoredThemePreference);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(preference));

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    setResolved(setThemePreference(next));
  }, []);

  return { preference, resolved, setPreference };
}
