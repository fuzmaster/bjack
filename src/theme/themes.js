export const THEMES = {
  modern: {
    label: "Modern",
    hue: 208,
  },
  classic: {
    label: "Classic",
    hue: 138,
  },
  royal: {
    label: "Royal",
    hue: 275,
  },
  cherry: {
    label: "Cherry",
    hue: 350,
  },
  gold: {
    label: "Gold",
    hue: 45,
  },
};

export const THEME_KEYS = Object.keys(THEMES);

export function isThemeKey(theme) {
  return Object.hasOwn(THEMES, theme);
}

export function getTheme(theme) {
  return THEMES[isThemeKey(theme) ? theme : "modern"];
}
