export const ACHIEVEMENTS = [
  { id: "first_win",     emoji: "🏆", title: "First Win",      description: "Win your very first hand" },
  { id: "blackjack",     emoji: "⚡", title: "Blackjack!",     description: "Hit a natural blackjack" },
  { id: "hot_streak",    emoji: "🔥", title: "On Fire",        description: "Win 3 hands in a row" },
  { id: "inferno",       emoji: "💥", title: "Unstoppable",    description: "Win 5 hands in a row" },
  { id: "dealer_bust",   emoji: "😤", title: "Bust 'Em",       description: "Watch the dealer bust" },
  { id: "double_win",    emoji: "🎯", title: "All In",         description: "Win after doubling down" },
  { id: "insurance_pay", emoji: "🛡️", title: "Safety Net",    description: "Cash in an insurance bet" },
  { id: "high_roller",   emoji: "💎", title: "High Roller",    description: "Place a $100 bet" },
  { id: "comeback",      emoji: "😤", title: "Comeback Kid",   description: "Win a hand with under $100 in the bank" },
  { id: "loaded",        emoji: "💰", title: "Loaded",         description: "Build your bankroll to $750" },
];

const STORAGE_KEY = "blackjack-achievements";

function getStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function getUnlocked() {
  try {
    const raw = getStorage()?.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function unlockAchievement(id) {
  try {
    const storage = getStorage();
    if (!storage) return false;
    const set = getUnlocked();
    if (set.has(id)) return false;
    set.add(id);
    storage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    return true;
  } catch {
    return false;
  }
}
