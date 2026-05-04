import { isThemeKey } from "../theme/themes";
import { isDifficultyKey } from "../game/blackjack";

const THEME_KEY = "blackjack-theme";
const BANKROLL_KEY = "blackjack-bankroll";

function getStorage() {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function getStoredTheme() {
  const storage = getStorage();
  if (!storage) return "modern";

  try {
    const value = storage.getItem(THEME_KEY);
    return isThemeKey(value) ? value : "classic";
  } catch {
    return "classic";
  }
}

export function setStoredTheme(theme) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(THEME_KEY, isThemeKey(theme) ? theme : "modern");
  } catch {
    // Ignore storage write failures.
  }
}

export function getStoredBankroll() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const rawValue = storage.getItem(BANKROLL_KEY);
    if (rawValue == null) return null;

    const bankroll = Number(rawValue);
    if (!Number.isFinite(bankroll) || bankroll < 0) return null;
    return bankroll;
  } catch {
    return null;
  }
}

export function setStoredBankroll(bankroll) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(BANKROLL_KEY, String(Math.max(0, bankroll)));
  } catch {
    // Ignore storage write failures.
  }
}

const DIFFICULTY_KEY = "blackjack-difficulty";

export function getStoredDifficulty() {
  const storage = getStorage();
  if (!storage) return "medium";
  try {
    const value = storage.getItem(DIFFICULTY_KEY);
    return isDifficultyKey(value) ? value : "medium";
  } catch {
    return "medium";
  }
}

export function setStoredDifficulty(difficulty) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(DIFFICULTY_KEY, isDifficultyKey(difficulty) ? difficulty : "medium");
  } catch {
    // Ignore storage write failures.
  }
}
