import { createDeck, getStreakMultiplier, handValue, MIN_BET, STARTING_BANKROLL, STARTING_BET } from "./blackjack";

export function createInitialGameState(deck, roundId = 0, bankroll = STARTING_BANKROLL) {
  return {
    deck,
    playerHand: [],
    dealerHand: [],
    gameState: "ready",
    message: "PLACE YOUR BET",
    bankroll,
    bet: STARTING_BET,
    selectedChip: STARTING_BET,
    dealerRevealed: false,
    roundId,
    winStreak: 0,
    doubledDown: false,
  };
}

export const initialGameState = createInitialGameState(createDeck(0), 0);

export function gameReducer(state, action) {
  switch (action.type) {
    case "SET_SELECTED_CHIP": {
      return { ...state, selectedChip: action.payload };
    }

    case "INCREASE_BET": {
      if (state.gameState === "player-turn" || state.gameState === "dealer-turn") return state;
      return { ...state, bet: Math.min(state.bankroll, state.bet + state.selectedChip) };
    }

    case "DECREASE_BET": {
      if (state.gameState === "player-turn" || state.gameState === "dealer-turn") return state;
      return { ...state, bet: Math.max(MIN_BET, state.bet - state.selectedChip) };
    }

    case "DEAL_ROUND": {
      const { roundId, newDeck } = action.payload;
      const activeDeck = newDeck ?? state.deck;
      const playerHand = [activeDeck[0], activeDeck[2]];
      const dealerHand = [activeDeck[1], activeDeck[3]];
      const nextDeck = activeDeck.slice(4);
      const playerTotal = handValue(playerHand);
      const dealerTotal = handValue(dealerHand);
      const playerBlackjack = playerHand.length === 2 && playerTotal === 21;
      const dealerBlackjack = dealerHand.length === 2 && dealerTotal === 21;
      const dealerUpcardIsAce = dealerHand[0].rank === "A";

      // Always offer insurance when dealer shows an Ace
      if (dealerUpcardIsAce) {
        return {
          ...state,
          deck: nextDeck,
          playerHand,
          dealerHand,
          gameState: "insurance",
          message: "INSURANCE?",
          dealerRevealed: false,
          doubledDown: false,
          roundId,
        };
      }

      if (dealerBlackjack) {
        return {
          ...state,
          deck: nextDeck,
          playerHand,
          dealerHand,
          gameState: "round-over",
          message: playerBlackjack ? "PUSH" : "DEALER BLACKJACK",
          dealerRevealed: true,
          bankroll: playerBlackjack ? state.bankroll : Math.max(0, state.bankroll - state.bet),
          winStreak: playerBlackjack ? state.winStreak : 0,
          doubledDown: false,
          roundId,
        };
      }

      return {
        ...state,
        deck: nextDeck,
        playerHand,
        dealerHand,
        gameState: playerBlackjack ? "dealer-turn" : "player-turn",
        message: playerBlackjack ? "DEALER THINKING" : "YOUR MOVE",
        dealerRevealed: playerBlackjack,
        doubledDown: false,
        roundId,
      };
    }

    case "INSURANCE_DECISION": {
      const { take } = action.payload;
      const insuranceBet = take ? Math.floor(state.bet / 2) : 0;
      const bankrollAfterInsurance = state.bankroll - insuranceBet;
      const dealerHasBlackjack = handValue(state.dealerHand) === 21;
      const playerHasBlackjack = state.playerHand.length === 2 && handValue(state.playerHand) === 21;

      if (dealerHasBlackjack) {
        // Insurance pays 2:1 — return stake + double payout = insuranceBet * 3
        const insurancePayout = take ? insuranceBet * 3 : 0;
        if (playerHasBlackjack) {
          // Push on main bet, insurance resolves normally
          return {
            ...state,
            bankroll: Math.max(0, bankrollAfterInsurance + insurancePayout),
            gameState: "round-over",
            dealerRevealed: true,
            message: "PUSH",
            winStreak: state.winStreak,
          };
        }
        return {
          ...state,
          bankroll: Math.max(0, bankrollAfterInsurance + insurancePayout - state.bet),
          gameState: "round-over",
          dealerRevealed: true,
          message: take ? "DEALER BLACKJACK • INSURANCE PAYS" : "DEALER BLACKJACK",
          winStreak: 0,
        };
      }

      // No dealer blackjack — insurance lost (already deducted), continue play
      if (playerHasBlackjack) {
        return {
          ...state,
          bankroll: bankrollAfterInsurance,
          gameState: "dealer-turn",
          message: "DEALER THINKING",
          dealerRevealed: true,
        };
      }

      return {
        ...state,
        bankroll: bankrollAfterInsurance,
        gameState: "player-turn",
        message: "YOUR MOVE",
      };
    }

    case "PLAYER_HIT": {
      const { card, nextDeck } = action.payload;
      return { ...state, deck: nextDeck, playerHand: [...state.playerHand, card] };
    }

    case "DOUBLE_DOWN": {
      const { card, nextDeck, newBet } = action.payload;
      return {
        ...state,
        deck: nextDeck,
        playerHand: [...state.playerHand, card],
        bet: newBet,
        doubledDown: true,
      };
    }

    case "DEALER_REVEAL": {
      return { ...state, dealerRevealed: true, gameState: "dealer-turn", message: "DEALER THINKING" };
    }

    case "DEALER_DRAW": {
      const { card, nextDeck } = action.payload;
      return { ...state, deck: nextDeck, dealerHand: [...state.dealerHand, card] };
    }

    case "ROUND_END": {
      const { message, delta } = action.payload;
      const isWin = delta > 0;
      const isLoss = delta < 0;
      const multiplier = isWin ? getStreakMultiplier(state.winStreak) : 1;
      const finalDelta = isWin ? Math.round(delta * multiplier) : delta;
      const newStreak = isWin ? state.winStreak + 1 : isLoss ? 0 : state.winStreak;
      return {
        ...state,
        gameState: "round-over",
        dealerRevealed: true,
        message,
        bankroll: Math.max(0, state.bankroll + finalDelta),
        winStreak: newStreak,
      };
    }

    case "RESET_GAME": {
      return createInitialGameState(action.payload.newDeck ?? state.deck, action.payload.roundId, action.payload.bankroll);
    }

    default:
      return state;
  }
}
