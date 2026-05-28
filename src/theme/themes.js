export const THEMES = {
  modern: {
    label: "Modern",
    hue: 220,
    feltH: 220,
    feltC: 0.025,
  },
  classic: {
    label: "Classic",
    hue: 142,
    feltH: 142,
    feltC: 0.055,
  },
  royal: {
    label: "Royal",
    hue: 275,
    feltH: 280,
    feltC: 0.038,
  },
  cherry: {
    label: "Cherry",
    hue: 350,
    feltH: 12,
    feltC: 0.045,
  },
  gold: {
    label: "Gold",
    hue: 45,
    feltH: 48,
    feltC: 0.032,
  },
};

export const THEME_KEYS = Object.keys(THEMES);

export function isThemeKey(theme) {
  return Object.hasOwn(THEMES, theme);
}

export function getTheme(theme) {
  return THEMES[isThemeKey(theme) ? theme : "modern"];
}
