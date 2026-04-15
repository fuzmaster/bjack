import { useEffect, useMemo, useState } from "react";
import { getStoredTheme, setStoredTheme } from "../utils/storage";
import { getTheme, isThemeKey, THEME_KEYS, THEMES } from "../theme/themes";
import { ThemeContext } from "./ThemeContextValue";

function normalizeTheme(theme) {
  return isThemeKey(theme) ? theme : "modern";
}

export function ThemeProvider({ children, initialTheme = "modern" }) {
  const [theme, setThemeState] = useState(() => normalizeTheme(initialTheme || getStoredTheme()));

  useEffect(() => {
    const root = document.documentElement;
    const activeTheme = getTheme(theme);

    root.dataset.theme = theme;
    root.style.setProperty("--theme-hue", String(activeTheme.hue));
    root.style.setProperty("--theme-preset-hue", String(activeTheme.hue));

    setStoredTheme(theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    themeOptions: THEME_KEYS.map((key) => ({ key, label: THEMES[key].label })),
    setTheme: (nextTheme) => setThemeState(normalizeTheme(nextTheme)),
    toggleTheme: () => {
      setThemeState((currentTheme) => {
        const currentIndex = THEME_KEYS.indexOf(currentTheme);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % THEME_KEYS.length : 0;
        return THEME_KEYS[nextIndex];
      });
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}