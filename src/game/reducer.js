import { STARTING_BANKROLL, STARTING_BET } from "./blackjack";

export const initialGameState = {
  deck: [],
  playerHand: [],
  dealerHand: [],
  gameState: "ready",
  message: "PLACE YOUR BET",
  bankroll: STARTING_BANKROLL,
  bet: STARTING_BET,
  selectedChip: STARTING_BET,
  dealerRevealed: false,
  roundId: 0,
};

export function gameReducer(state, action) {
  switch (action.type) {
    case "SET_SELECTED_CHIP": {
      return {
        ...state,
        selectedChip: action.payload,
      };
    }

    case "INCREASE_BET": {
      if (state.gameState === "player-turn" || state.gameState === "dealer-turn") return state;
      return {
        ...state,
        bet: Math.min(state.bankroll, state.bet + state.selectedChip),
      };
    }

    case "DECREASE_BET": {
      if (state.gameState === "player-turn" || state.gameState === "dealer-turn") return state;
      return {
        ...state,
        bet: Math.max(5, state.bet - state.selectedChip),
      };
    }

    case "DEAL_ROUND": {
      const { deck, playerHand, dealerHand, roundId } = action.payload;
      return {
        ...state,
        deck,
        playerHand,
        dealerHand,
        gameState: "player-turn",
        message: "YOUR MOVE",
        dealerRevealed: false,
        roundId,
      };
    }

    case "PLAYER_HIT": {
      const { card, nextDeck } = action.payload;
      return {
        ...state,
        deck: nextDeck,
        playerHand: [...state.playerHand, card],
      };
    }

    case "DEALER_REVEAL": {
      return {
        ...state,
        dealerRevealed: true,
        gameState: "dealer-turn",
        message: "DEALER THINKING",
      };
    }

    case "DEALER_DRAW": {
      const { card, nextDeck } = action.payload;
      return {
        ...state,
        deck: nextDeck,
        dealerHand: [...state.dealerHand, card],
      };
    }

    case "ROUND_END": {
      const { message, delta } = action.payload;
      return {
        ...state,
        gameState: "round-over",
        dealerRevealed: true,
        message,
        bankroll: Math.max(0, state.bankroll + delta),
      };
    }

    case "RESET_GAME": {
      return {
        ...initialGameState,
        roundId: action.payload.roundId,
      };
    }

    default:
      return state;
  }
}
