export const SUITS = {
  spades: { symbol: "♠", name: "Spades", color: "black" },
  hearts: { symbol: "♥", name: "Hearts", color: "red" },
  diamonds: { symbol: "♦", name: "Diamonds", color: "red" },
  clubs: { symbol: "♣", name: "Clubs", color: "black" },
};
export const SUIT_KEYS = Object.keys(SUITS);
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const CHIP_VALUES = [5, 25, 50, 100];
export const STARTING_BANKROLL = 500;
export const STARTING_BET = 25;
export const MIN_BET = 5;
export const NUM_DECKS = 4;
export const RESHUFFLE_THRESHOLD = 52;

export const DIFFICULTY_PRESETS = {
  easy:   { label: "Easy",   bankroll: 1000 },
  medium: { label: "Normal", bankroll: 500  },
  hard:   { label: "Hard",   bankroll: 200  },
};
export const DIFFICULTY_KEYS = Object.keys(DIFFICULTY_PRESETS);
export function isDifficultyKey(key) { return DIFFICULTY_KEYS.includes(key); }

/** Returns the payout multiplier applied to a win given the current win streak. */
export function getStreakMultiplier(streak) {
  if (streak >= 3) return 1.5;
  if (streak >= 2) return 1.25;
  return 1.0;
}

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createDeck(roundId = 0) {
  const deck = [];
  let cardIndex = 0;
  for (let d = 0; d < NUM_DECKS; d += 1) {
    for (const suit of SUIT_KEYS) {
      for (const rank of RANKS) {
        deck.push({
          id: `r${roundId}-d${d}-${cardIndex}-${rank}${suit}`,
          rank,
          suit,
        });
        cardIndex += 1;
      }
    }
  }
  return shuffle(deck);
}

export function cardValue(rank) {
  if (["J", "Q", "K"].includes(rank)) return 10;
  if (rank === "A") return 11;
  return Number(rank);
}

export function handValue(hand) {
  let total = hand.reduce((sum, card) => sum + cardValue(card.rank), 0);
  let aces = hand.filter((card) => card.rank === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

export function resolveRound(playerTotal, dealerTotal, bet, playerCardCount = 0) {
  const playerBlackjack = playerCardCount === 2 && playerTotal === 21;
  const winDelta = playerBlackjack ? bet * 1.5 : bet;

  if (playerTotal > 21) return { message: "BUST • DEALER WINS", delta: -bet };
  if (dealerTotal > 21) return { message: "DEALER BUSTS • YOU WIN", delta: winDelta };
  if (playerTotal > dealerTotal) return { message: playerBlackjack ? "BLACKJACK • YOU WIN" : "YOU WIN", delta: winDelta };
  if (dealerTotal > playerTotal) return { message: "DEALER WINS", delta: -bet };
  return { message: "PUSH", delta: 0 };
}

export function getSuitMeta(suit) {
  return SUITS[suit];
}

export function getSuitSymbol(suit) {
  return SUITS[suit]?.symbol ?? "?";
}

export function getSuitName(suit) {
  return SUITS[suit]?.name ?? suit;
}

export function isRedSuit(suit) {
  return SUITS[suit]?.color === "red";
}
