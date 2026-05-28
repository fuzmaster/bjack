import { createDeck, getStreakMultiplier, handValue, MIN_BET, STARTING_BANKROLL, STARTING_BET } from "./blackjack";

function rankValueForSplit(rank) {
  if (rank === "A") return 11;
  if (["10", "J", "Q", "K"].includes(rank)) return 10;
  return Number(rank);
}

function canSplitPair(hand) {
  return hand.length === 2 && rankValueForSplit(hand[0].rank) === rankValueForSplit(hand[1].rank);
}

function advancePlayerTurn(state, nextHandOutcomes) {
  const nextIndex = nextHandOutcomes.findIndex((outcome, idx) => idx > state.activeHandIndex && outcome === null);
  if (nextIndex !== -1) {
    return {
      ...state,
      activeHandIndex: nextIndex,
      handOutcomes: nextHandOutcomes,
      message: `HAND ${nextIndex + 1} • YOUR MOVE`,
    };
  }

  return {
    ...state,
    activeHandIndex: 0,
    handOutcomes: nextHandOutcomes,
    dealerRevealed: true,
    gameState: "dealer-turn",
    message: "DEALER THINKING",
  };
}

export function createInitialGameState(deck, roundId = 0, bankroll = STARTING_BANKROLL) {
  return {
    deck,
    playerHands: [[]],
    activeHandIndex: 0,
    handBets: [STARTING_BET],
    handOutcomes: [null],
    dealerHand: [],
    gameState: "ready",
    message: "PLACE YOUR BET",
    bankroll,
    bet: STARTING_BET,
    selectedChip: STARTING_BET,
    dealerRevealed: false,
    roundId,
    winStreak: 0,
    handsWon: 0,
    handsLost: 0,
    handsPushed: 0,
    highestBankroll: bankroll,
  };
}

export const initialGameState = createInitialGameState(createDeck(0), 0);

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
        bet: Math.max(MIN_BET, state.bet - state.selectedChip),
      };
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

      // Dealer Peek: Check if dealer's face-up card is 10-value or Ace
      const dealerFaceUpRank = dealerHand[0].rank;
      const dealerPeeksPossibility = ["10", "J", "Q", "K", "A"].includes(dealerFaceUpRank);

      if (dealerPeeksPossibility) {
        // Peek at the hole card and check for blackjack
        const dealerBlackjack = dealerHand.length === 2 && dealerTotal === 21;

        if (dealerBlackjack) {
          // Dealer has natural blackjack; round ends immediately
          return {
            ...state,
            deck: nextDeck,
            playerHands: [playerHand],
            activeHandIndex: 0,
            handBets: [state.bet],
            handOutcomes: [playerBlackjack ? "push" : "loss"],
            dealerHand,
            gameState: "round-over",
            message: playerBlackjack ? "PUSH" : "DEALER BLACKJACK",
            dealerRevealed: true,
            bankroll: playerBlackjack ? state.bankroll : Math.max(0, state.bankroll - state.bet),
            // push keeps streak intact; dealer blackjack loss resets it
            winStreak: playerBlackjack ? state.winStreak : 0,
            roundId,
          };
        }
      }

      // No dealer blackjack; proceed with normal play
      return {
        ...state,
        deck: nextDeck,
        playerHands: [playerHand],
        activeHandIndex: 0,
        handBets: [state.bet],
        handOutcomes: [null],
        dealerHand,
        gameState: playerBlackjack ? "dealer-turn" : "player-turn",
        message: playerBlackjack ? "DEALER THINKING" : "YOUR MOVE",
        dealerRevealed: playerBlackjack,
        roundId,
      };
    }

    case "PLAYER_HIT": {
      const { card, nextDeck } = action.payload;
      const nextHands = state.playerHands.map((hand, idx) => (idx === state.activeHandIndex ? [...hand, card] : hand));
      return {
        ...state,
        deck: nextDeck,
        playerHands: nextHands,
      };
    }

    // FIX #4: Immediately deduct the extra wager from bankroll
    case "DOUBLE_DOWN": {
      const { card, nextDeck, newBet, extraWager } = action.payload;
      const nextHands = state.playerHands.map((hand, idx) => (idx === state.activeHandIndex ? [...hand, card] : hand));
      const nextHandBets = state.handBets.map((betAmount, idx) => (idx === state.activeHandIndex ? newBet : betAmount));
      return {
        ...state,
        deck: nextDeck,
        playerHands: nextHands,
        handBets: nextHandBets,
        bankroll: state.bankroll - extraWager,
      };
    }

    case "SPLIT_HAND": {
      if (state.gameState !== "player-turn") return state;
      if (state.playerHands.length !== 1) return state;

      const originalHand = state.playerHands[0];
      if (!canSplitPair(originalHand)) return state;
      const splitBet = state.handBets[0] ?? state.bet;
      if (state.bankroll < splitBet) return state;
      if (state.deck.length < 2) return state;

      const firstDraw = state.deck[0];
      const secondDraw = state.deck[1];
      const nextDeck = state.deck.slice(2);

      return {
        ...state,
        deck: nextDeck,
        bankroll: state.bankroll - splitBet,
        playerHands: [
          [originalHand[0], firstDraw],
          [originalHand[1], secondDraw],
        ],
        activeHandIndex: 0,
        handBets: [splitBet, splitBet],
        handOutcomes: [null, null],
        message: "HAND 1 • YOUR MOVE",
      };
    }

    case "PLAYER_STAND": {
      if (state.gameState !== "player-turn") return state;
      const nextHandOutcomes = state.handOutcomes.map((outcome, idx) => (idx === state.activeHandIndex ? "stand" : outcome));
      return advancePlayerTurn(state, nextHandOutcomes);
    }

    case "PLAYER_BUST": {
      if (state.gameState !== "player-turn") return state;
      const nextHandOutcomes = state.handOutcomes.map((outcome, idx) => (idx === state.activeHandIndex ? "bust" : outcome));
      return advancePlayerTurn(state, nextHandOutcomes);
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
      const { message, delta, outcomes } = action.payload;
      const isWin = delta > 0;
      const isLoss = delta < 0;
      const isPush = delta === 0;
      const multiplier = isWin ? getStreakMultiplier(state.winStreak) : 1;
      const finalDelta = isWin ? Math.round(delta * multiplier) : delta;
      const newStreak = isWin ? state.winStreak + 1 : isLoss ? 0 : state.winStreak;
      const newBankroll = Math.max(0, state.bankroll + finalDelta);
      const handsWon = outcomes?.won ?? (isWin ? 1 : 0);
      const handsLost = outcomes?.lost ?? (isLoss ? 1 : 0);
      const handsPushed = outcomes?.pushed ?? (isPush ? 1 : 0);

      return {
        ...state,
        gameState: "round-over",
        dealerRevealed: true,
        activeHandIndex: 0,
        message,
        bankroll: newBankroll,
        winStreak: newStreak,
        handsWon: state.handsWon + handsWon,
        handsLost: state.handsLost + handsLost,
        handsPushed: state.handsPushed + handsPushed,
        highestBankroll: Math.max(state.highestBankroll, newBankroll),
      };
    }

    case "RESET_GAME": {
      const newGameState = createInitialGameState(action.payload.newDeck ?? state.deck, action.payload.roundId, action.payload.bankroll);
      // Preserve session stats across resets
      return {
        ...newGameState,
        handsWon: state.handsWon,
        handsLost: state.handsLost,
        handsPushed: state.handsPushed,
        highestBankroll: Math.max(newGameState.highestBankroll, state.highestBankroll),
      };
    }

    case "RESCUE_FUNDS": {
      return {
        ...state,
        bankroll: state.bankroll + 500,
      };
    }

    default:
      return state;
  }
}
