import { isThemeKey } from "../theme/themes";
import { isDifficultyKey } from "../game/blackjack";

const THEME_KEY = "blackjack-theme";
const BANKROLL_KEY = "blackjack-bankroll";
const DIFFICULTY_KEY = "blackjack-difficulty";
const MUTED_KEY = "blackjack-muted";
const GAME_SPEED_KEY = "blackjack-game-speed";

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

export function getStoredMuted() {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const value = storage.getItem(MUTED_KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export function setStoredMuted(isMuted) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(MUTED_KEY, String(Boolean(isMuted)));
  } catch {
    // Ignore storage write failures.
  }
}

export function getStoredGameSpeed() {
  const storage = getStorage();
  if (!storage) return "normal";
  try {
    const value = storage.getItem(GAME_SPEED_KEY);
    return value === "fast" ? "fast" : "normal";
  } catch {
    return "normal";
  }
}

export function setStoredGameSpeed(speed) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(GAME_SPEED_KEY, speed === "fast" ? "fast" : "normal");
  } catch {
    // Ignore storage write failures.
  }
}

const SESSION_STATS_KEY = "blackjack-session-stats";

export function getStoredSessionStats() {
  const storage = getStorage();
  if (!storage) {
    return {
      handsWon: 0,
      handsLost: 0,
      handsPushed: 0,
      highestBankroll: 500,
    };
  }
  try {
    const raw = storage.getItem(SESSION_STATS_KEY);
    if (!raw) {
      return {
        handsWon: 0,
        handsLost: 0,
        handsPushed: 0,
        highestBankroll: 500,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      handsWon: Number.isFinite(parsed.handsWon) ? parsed.handsWon : 0,
      handsLost: Number.isFinite(parsed.handsLost) ? parsed.handsLost : 0,
      handsPushed: Number.isFinite(parsed.handsPushed) ? parsed.handsPushed : 0,
      highestBankroll: Number.isFinite(parsed.highestBankroll) ? parsed.highestBankroll : 500,
    };
  } catch {
    return {
      handsWon: 0,
      handsLost: 0,
      handsPushed: 0,
      highestBankroll: 500,
    };
  }
}

export function setStoredSessionStats(stats) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(SESSION_STATS_KEY, JSON.stringify({
      handsWon: Math.max(0, stats.handsWon ?? 0),
      handsLost: Math.max(0, stats.handsLost ?? 0),
      handsPushed: Math.max(0, stats.handsPushed ?? 0),
      highestBankroll: Math.max(0, stats.highestBankroll ?? 500),
    }));
  } catch {
    // Ignore storage write failures.
  }
}
