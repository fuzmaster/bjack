import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { motion } from "framer-motion";
import TopBar from "./components/TopBar";
import BetControls from "./components/BetControls";
import ActionPanel from "./components/ActionPanel";
import HandZone from "./components/HandZone";
import { CHIP_VALUES, createDeck, handValue, resolveRound } from "./game/blackjack";
import { gameReducer, initialGameState } from "./game/reducer";
import { useGameAudio } from "./hooks/useGameAudio";

const MotionDiv = motion.div;

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { play } = useGameAudio();
  const roundTokenRef = useRef(0);
  const dealerStepTimeoutRef = useRef(null);

  const playerTotal = useMemo(() => handValue(state.playerHand), [state.playerHand]);
  const dealerVisibleHand = useMemo(
    () => (state.dealerRevealed ? state.dealerHand : state.dealerHand.slice(0, 1)),
    [state.dealerHand, state.dealerRevealed]
  );
  const dealerShownTotal = useMemo(() => handValue(dealerVisibleHand), [dealerVisibleHand]);
  const dealerTotal = useMemo(() => handValue(state.dealerHand), [state.dealerHand]);

  const endRound = useCallback((resultMessage, delta) => {
    dispatch({
      type: "ROUND_END",
      payload: {
        message: resultMessage,
        delta,
      },
    });

    if (delta > 0) play("win", 0.4);
    else if (delta < 0) play("lose", 0.42);
    else play("flip", 0.25);
  }, [play]);

  const beginDealerTurn = useCallback(() => {
    if (state.gameState !== "player-turn") return;
    dispatch({ type: "DEALER_REVEAL" });
    play("flip", 0.24);
  }, [play, state.gameState]);

  const startNewRound = useCallback(() => {
    if (state.bankroll <= 0 || state.bet > state.bankroll) return;
    if (state.gameState === "player-turn" || state.gameState === "dealer-turn") return;

    roundTokenRef.current += 1;
    const roundId = roundTokenRef.current;

    const deck = createDeck(roundId);
    const playerHand = [deck[0], deck[2]];
    const dealerHand = [deck[1], deck[3]];
    const nextDeck = deck.slice(4);

    dispatch({
      type: "DEAL_ROUND",
      payload: {
        deck: nextDeck,
        playerHand,
        dealerHand,
        roundId,
      },
    });

    play("deal", 0.34);

    if (handValue(playerHand) === 21) {
      dispatch({ type: "DEALER_REVEAL" });
      play("flip", 0.24);
    }
  }, [play, state.bankroll, state.bet, state.gameState]);

  const hit = useCallback(() => {
    if (state.gameState !== "player-turn") return;
    if (state.deck.length === 0) return;

    const card = state.deck[0];
    const nextDeck = state.deck.slice(1);
    const nextPlayerHand = [...state.playerHand, card];

    dispatch({
      type: "PLAYER_HIT",
      payload: {
        card,
        nextDeck,
      },
    });

    play("deal", 0.3);

    const nextTotal = handValue(nextPlayerHand);
    if (nextTotal > 21) {
      endRound("BUST • DEALER WINS", -state.bet);
    } else if (nextTotal === 21) {
      beginDealerTurn();
    }
  }, [beginDealerTurn, endRound, play, state.bet, state.deck, state.gameState, state.playerHand]);

  const stand = useCallback(() => {
    beginDealerTurn();
  }, [beginDealerTurn]);

  const resetGame = useCallback(() => {
    play("button", 0.22);
    roundTokenRef.current += 1;
    dispatch({
      type: "RESET_GAME",
      payload: {
        roundId: roundTokenRef.current,
      },
    });
  }, [play]);

  const nextRound = useCallback(() => {
    play("button", 0.22);
    if (state.bankroll <= 0) {
      resetGame();
      return;
    }
    startNewRound();
  }, [play, resetGame, startNewRound, state.bankroll]);

  const increaseBet = useCallback(() => {
    play("chip", 0.2);
    dispatch({ type: "INCREASE_BET" });
  }, [play]);

  const decreaseBet = useCallback(() => {
    play("chip", 0.2);
    dispatch({ type: "DECREASE_BET" });
  }, [play]);

  const selectChip = useCallback((value) => {
    play("chip", 0.2);
    dispatch({
      type: "SET_SELECTED_CHIP",
      payload: value,
    });
  }, [play]);

  useEffect(() => {
    return () => {
      roundTokenRef.current += 1;
      if (dealerStepTimeoutRef.current) {
        clearTimeout(dealerStepTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (state.gameState !== "dealer-turn") return;
    if (state.roundId !== roundTokenRef.current) return;

    const dealerScore = handValue(state.dealerHand);

    if (dealerScore >= 17) {
      try {
        const { message, delta } = resolveRound(playerTotal, dealerScore, state.bet);
        endRound(message, delta);
      } catch (error) {
        console.error("Failed to resolve dealer round", error);
        endRound("ROUND ERROR • PRESS RESET", 0);
      }
      return;
    }

    if (state.deck.length === 0) {
      try {
        const { message, delta } = resolveRound(playerTotal, dealerScore, state.bet);
        endRound(message, delta);
      } catch (error) {
        console.error("Failed to settle empty-deck round", error);
        endRound("ROUND ERROR • PRESS RESET", 0);
      }
      return;
    }

    dealerStepTimeoutRef.current = setTimeout(() => {
      try {
        if (state.roundId !== roundTokenRef.current) return;

        const card = state.deck[0];
        const nextDeck = state.deck.slice(1);

        dispatch({
          type: "DEALER_DRAW",
          payload: {
            card,
            nextDeck,
          },
        });
        play("deal", 0.28);
      } catch (error) {
        console.error("Dealer draw step failed", error);
        endRound("ROUND ERROR • PRESS RESET", 0);
      }
    }, 280);

    return () => {
      if (dealerStepTimeoutRef.current) {
        clearTimeout(dealerStepTimeoutRef.current);
      }
    };
  }, [endRound, play, playerTotal, state.bet, state.dealerHand, state.deck, state.gameState, state.roundId]);

  const dealDisabled =
    state.gameState === "player-turn" ||
    state.gameState === "dealer-turn" ||
    state.bet > state.bankroll ||
    state.bankroll <= 0;

  const hitDisabled = state.gameState !== "player-turn";
  const standDisabled = state.gameState !== "player-turn";
  const nextRoundDisabled = state.gameState !== "round-over";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f1012] text-[#f5f5f5]">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(27,28,32,.96),rgba(20,21,24,.93)_36%,rgba(13,14,16,.95)_68%,rgba(8,8,10,.98))]" />
      <div className="neo-noise-overlay pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-14%] top-[7%] h-[42rem] w-[42rem] rounded-full border-[8px] border-white/10" />
        <div className="absolute right-[-12%] top-[26%] h-[34rem] w-[46rem] rounded-[50%] border-[8px] border-white/8" />
        <div className="absolute bottom-[20%] left-0 right-0 h-[16rem] bg-[linear-gradient(to_top,rgba(14,14,16,.84),rgba(46,46,49,.26),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-[1460px] px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
        <div className="pb-44 xl:pb-0">
          <TopBar bankroll={state.bankroll} bet={state.bet} onReset={resetGame} />

          <div className="grid gap-4 xl:grid-cols-[minmax(260px,30%)_minmax(0,1fr)] xl:items-start xl:gap-6">
            <section className="order-1 space-y-4 xl:order-2 xl:space-y-6" aria-label="Game controls">
            <BetControls
              bet={state.bet}
              chipValues={CHIP_VALUES}
              selectedChip={state.selectedChip}
              onSelectChip={selectChip}
              onIncreaseBet={increaseBet}
              onDecreaseBet={decreaseBet}
            />

              <ActionPanel
                onDeal={startNewRound}
                onNext={nextRound}
                onHit={hit}
                onStand={stand}
                dealDisabled={dealDisabled}
                nextDisabled={nextRoundDisabled}
                hitDisabled={hitDisabled}
                standDisabled={standDisabled}
              />
            </section>

            <main className="order-2 border-4 border-black bg-[rgba(24,25,29,0.8)] p-3 shadow-[10px_10px_0_#000] sm:p-4 lg:p-5 xl:order-1" aria-label="Blackjack table">
              <HandZone
                title="Dealer"
                total={state.dealerRevealed ? dealerTotal : state.dealerHand.length ? `${dealerShownTotal}+` : "--"}
                hand={state.dealerHand}
                hiddenSecond={!state.dealerRevealed}
                revealHidden={state.dealerRevealed}
              />

              <MotionDiv
                key={state.roundId}
                initial={{ scale: 0.98, opacity: 0.86 }}
                animate={{ scale: [0.99, 1.03, 1], opacity: [0.86, 1, 1] }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="my-3 border-4 border-black bg-[#d7d7d7] px-4 py-4 text-center text-black shadow-[8px_8px_0_#000] sm:my-4"
              >
                <div className="text-xs font-black uppercase tracking-[0.08em]">Current Bet</div>
                <div className="display-heavy mt-1 text-6xl font-black leading-none sm:text-7xl">${state.bet}</div>
                <div
                  className="mt-3 inline-block border-2 border-black bg-[#f5f5f5] px-3 py-2 text-sm font-black uppercase tracking-[0.1em]"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {state.message}
                </div>
              </MotionDiv>

              <HandZone title="Player" total={state.playerHand.length ? playerTotal : "--"} hand={state.playerHand} />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
