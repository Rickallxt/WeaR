import { useCallback, useState } from 'react';

export type ThemeId =
  | 'light'
  | 'dark';

export const themes: {
  id: ThemeId;
  label: string;
  dark: boolean;
  preview: [string, string]; // [bg, accent]
}[] = [
  { id: 'dark', label: 'Obsidian', dark: true, preview: ['#0f0f0f', '#7766ff'] },
  { id: 'light', label: 'Alabaster', dark: false, preview: ['#f5efe7', '#7766ff'] },
];

const STORAGE_KEY = 'wear:theme';

/** Call this once before React renders (in main.tsx) to prevent FOUC. */
export function initTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const theme =
      stored && themes.some((t) => t.id === stored) ? (stored as ThemeId) : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
  } catch {
    return 'dark';
  }
}

/** React hook — reads and writes the active theme. */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const attr = document.documentElement.getAttribute('data-theme') as ThemeId | null;
      return attr && themes.some((t) => t.id === attr) ? attr : 'dark';
    } catch {
      return 'dark';
    }
  });

  const setTheme = useCallback((next: ThemeId) => {
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch { /* ignore — localStorage may not be available */ }
    setThemeState(next);
  }, []);

  return { theme, setTheme, themes };
}
