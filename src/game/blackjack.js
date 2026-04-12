export const SUITS = ["♠", "♥", "♦", "♣"];
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const CHIP_VALUES = [5, 25, 50, 100];
export const STARTING_BANKROLL = 500;
export const STARTING_BET = 25;

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
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `r${roundId}-${cardIndex}-${rank}${suit}`,
        rank,
        suit,
      });
      cardIndex += 1;
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

export function resolveRound(playerTotal, dealerTotal, bet) {
  if (playerTotal > 21) return { message: "BUST • DEALER WINS", delta: -bet };
  if (dealerTotal > 21) return { message: "DEALER BUSTS • YOU WIN", delta: bet };
  if (playerTotal > dealerTotal) return { message: "YOU WIN", delta: bet };
  if (dealerTotal > playerTotal) return { message: "DEALER WINS", delta: -bet };
  return { message: "PUSH", delta: 0 };
}

export function isRedSuit(suit) {
  return suit === "♥" || suit === "♦";
}
