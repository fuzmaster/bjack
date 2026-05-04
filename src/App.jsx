import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import TopBar from "./components/TopBar";
import BetControls from "./components/BetControls";
import ActionPanel from "./components/ActionPanel";
import HandZone from "./components/HandZone";
import AchievementToast from "./components/AchievementToast";
import { useTheme } from "./context/useTheme";
import { useAchievements } from "./hooks/useAchievements";
import { CHIP_VALUES, createDeck, DIFFICULTY_PRESETS, getStreakMultiplier, handValue, RESHUFFLE_THRESHOLD, resolveRound } from "./game/blackjack";
import { createInitialGameState, gameReducer, initialGameState } from "./game/reducer";
import { useGameAudio } from "./hooks/useGameAudio";
import { getStoredBankroll, setStoredBankroll, getStoredDifficulty, setStoredDifficulty } from "./utils/storage";
import { formatCurrency } from "./utils/formatters";

const MotionDiv = motion.div;

export default function App() {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialGameState,
    (baseState) => createInitialGameState(baseState.deck, baseState.roundId, getStoredBankroll() ?? baseState.bankroll),
  );
  const { play, unlockAudio } = useGameAudio();
  const { theme, setTheme, themeOptions } = useTheme();
  const { current: currentAchievement, unlock, dismiss: dismissAchievement } = useAchievements();
  const [difficulty, setDifficulty] = useState(() => getStoredDifficulty());
  const roundTokenRef = useRef(0);
  const dealerStepTimeoutRef = useRef(null);
  const previousGameStateRef = useRef(state.gameState);
  const previousRoundStateRef = useRef(state.gameState);
  const previousBankrollRef = useRef(state.bankroll);
  const reduceMotion = useReducedMotion();

  // Achievement tracking refs
  const achievementGameStateRef = useRef(state.gameState);
  const achievementWinStreakRef = useRef(state.winStreak);
  const bankrollAtDealRef = useRef(state.bankroll);

  const playerTotal = handValue(state.playerHand);
  const dealerVisibleHand = state.dealerRevealed ? state.dealerHand : state.dealerHand.slice(0, 1);
  const dealerShownTotal = handValue(dealerVisibleHand);
  const dealerTotal = handValue(state.dealerHand);

  const isGameActive = state.gameState === "player-turn" || state.gameState === "dealer-turn" || state.gameState === "insurance";

  const endRound = useCallback((resultMessage, delta) => {
    dispatch({ type: "ROUND_END", payload: { message: resultMessage, delta } });
    if (delta > 0) play("win", 0.4);
    else if (delta < 0) play("lose", 0.42);
    else play("flip", 0.25);
  }, [play]);

  const beginDealerTurn = useCallback(() => {
    if (state.gameState !== "player-turn") return;
    dispatch({ type: "DEALER_REVEAL" });
  }, [state.gameState]);

  const startNewRound = useCallback(() => {
    if (state.bankroll <= 0 || state.bet > state.bankroll) return;
    if (state.gameState === "player-turn" || state.gameState === "dealer-turn") return;

    unlockAudio();
    roundTokenRef.current += 1;
    const roundId = roundTokenRef.current;
    const needsNewDeck = state.deck.length < RESHUFFLE_THRESHOLD || state.deck.length < 4;
    const newDeck = needsNewDeck ? createDeck(roundId) : undefined;

    dispatch({ type: "DEAL_ROUND", payload: { roundId, newDeck } });
    play("deal", 0.34);
  }, [play, state.bankroll, state.bet, state.deck, state.gameState, unlockAudio]);

  const hit = useCallback(() => {
    if (state.gameState !== "player-turn") return;
    if (state.deck.length === 0) return;

    unlockAudio();
    const card = state.deck[0];
    const nextDeck = state.deck.slice(1);
    const nextPlayerHand = [...state.playerHand, card];

    dispatch({ type: "PLAYER_HIT", payload: { card, nextDeck } });
    play("deal", 0.3);

    const nextTotal = handValue(nextPlayerHand);
    if (nextTotal > 21) {
      endRound("BUST • DEALER WINS", -state.bet);
    } else if (nextTotal === 21) {
      beginDealerTurn();
    }
  }, [beginDealerTurn, endRound, play, state.bet, state.deck, state.gameState, state.playerHand, unlockAudio]);

  const stand = useCallback(() => {
    beginDealerTurn();
  }, [beginDealerTurn]);

  const doubleDown = useCallback(() => {
    if (state.gameState !== "player-turn") return;
    if (state.playerHand.length !== 2) return;
    if (state.bankroll < state.bet * 2) return;
    if (state.deck.length === 0) return;

    unlockAudio();
    const card = state.deck[0];
    const nextDeck = state.deck.slice(1);
    const nextPlayerHand = [...state.playerHand, card];
    const newBet = state.bet * 2;

    dispatch({ type: "DOUBLE_DOWN", payload: { card, nextDeck, newBet } });
    play("deal", 0.3);

    const nextTotal = handValue(nextPlayerHand);
    if (nextTotal > 21) {
      endRound("BUST • DEALER WINS", -newBet);
    } else {
      beginDealerTurn();
    }
  }, [beginDealerTurn, endRound, play, state.bankroll, state.bet, state.deck, state.gameState, state.playerHand, unlockAudio]);

  const takeInsurance = useCallback(() => {
    unlockAudio();
    play("chip", 0.2);
    dispatch({ type: "INSURANCE_DECISION", payload: { take: true } });
  }, [play, unlockAudio]);

  const declineInsurance = useCallback(() => {
    play("button", 0.22);
    dispatch({ type: "INSURANCE_DECISION", payload: { take: false } });
  }, [play]);

  const resetGame = useCallback(() => {
    unlockAudio();
    play("button", 0.22);
    roundTokenRef.current += 1;
    dispatch({
      type: "RESET_GAME",
      payload: {
        roundId: roundTokenRef.current,
        newDeck: createDeck(roundTokenRef.current),
        bankroll: DIFFICULTY_PRESETS[difficulty].bankroll,
      },
    });
  }, [difficulty, play, unlockAudio]);

  const nextRound = useCallback(() => {
    unlockAudio();
    play("button", 0.22);
    if (state.bankroll <= 0) {
      resetGame();
      return;
    }
    startNewRound();
  }, [play, resetGame, startNewRound, state.bankroll, unlockAudio]);

  const increaseBet = useCallback(() => {
    unlockAudio();
    play("chip", 0.2);
    dispatch({ type: "INCREASE_BET" });
  }, [play, unlockAudio]);

  const decreaseBet = useCallback(() => {
    unlockAudio();
    play("chip", 0.2);
    dispatch({ type: "DECREASE_BET" });
  }, [play, unlockAudio]);

  const selectChip = useCallback((value) => {
    unlockAudio();
    play("chip", 0.2);
    dispatch({ type: "SET_SELECTED_CHIP", payload: value });
  }, [play, unlockAudio]);

  useEffect(() => {
    setStoredBankroll(state.bankroll);
  }, [state.bankroll]);

  useEffect(() => {
    setStoredDifficulty(difficulty);
  }, [difficulty]);

  useEffect(() => {
    return () => {
      roundTokenRef.current += 1;
      if (dealerStepTimeoutRef.current) clearTimeout(dealerStepTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (previousGameStateRef.current !== "dealer-turn" && state.gameState === "dealer-turn") {
      play("flip", 0.24);
    }
    previousGameStateRef.current = state.gameState;
  }, [play, state.gameState]);

  useEffect(() => {
    const wasRoundOver = previousRoundStateRef.current === "round-over";
    const isRoundOver = state.gameState === "round-over";
    const bankrollDelta = state.bankroll - previousBankrollRef.current;

    if (!reduceMotion && !wasRoundOver && isRoundOver && bankrollDelta > 0) {
      const naturalBlackjackWin = state.message.includes("BLACKJACK");
      confetti({
        particleCount: naturalBlackjackWin ? 120 : 68,
        spread: naturalBlackjackWin ? 86 : 56,
        scalar: naturalBlackjackWin ? 1.08 : 0.92,
        startVelocity: naturalBlackjackWin ? 46 : 32,
        origin: { y: 0.62 },
        zIndex: 1200,
      });
      if (naturalBlackjackWin) {
        confetti({ particleCount: 44, spread: 78, scalar: 0.84, startVelocity: 38, origin: { x: 0.2, y: 0.58 }, zIndex: 1200 });
        confetti({ particleCount: 44, spread: 78, scalar: 0.84, startVelocity: 38, origin: { x: 0.8, y: 0.58 }, zIndex: 1200 });
      }
    }

    previousRoundStateRef.current = state.gameState;
    previousBankrollRef.current = state.bankroll;
  }, [reduceMotion, state.bankroll, state.bet, state.gameState, state.message]);

  // Achievement checks
  useEffect(() => {
    const prevGameState = achievementGameStateRef.current;
    const prevWinStreak = achievementWinStreakRef.current;

    // Capture bankroll at the start of each new round (before any outcome)
    const isNewRoundStart =
      (prevGameState === "ready" || prevGameState === "round-over") &&
      (state.gameState === "player-turn" || state.gameState === "insurance");
    if (isNewRoundStart) {
      bankrollAtDealRef.current = state.bankroll;
    }

    // Check achievements when a round ends
    if (state.gameState === "round-over" && prevGameState !== "round-over") {
      const wonRound = state.winStreak > prevWinStreak;

      if (wonRound) unlock("first_win");
      if (wonRound && state.message.includes("BLACKJACK")) unlock("blackjack");
      if (state.winStreak >= 3 && prevWinStreak < 3) unlock("hot_streak");
      if (state.winStreak >= 5 && prevWinStreak < 5) unlock("inferno");
      if (state.message.includes("DEALER BUSTS")) unlock("dealer_bust");
      if (wonRound && state.doubledDown) unlock("double_win");
      if (state.message.includes("INSURANCE PAYS")) unlock("insurance_pay");
      if (wonRound && bankrollAtDealRef.current < 100) unlock("comeback");
      if (state.bankroll >= 750) unlock("loaded");
    }

    achievementGameStateRef.current = state.gameState;
    achievementWinStreakRef.current = state.winStreak;
  }, [state.gameState, state.winStreak, state.message, state.bankroll, state.doubledDown, unlock]);

  // High roller: placed a $100 bet
  useEffect(() => {
    if (state.bet >= 100) unlock("high_roller");
  }, [state.bet, unlock]);

  useEffect(() => {
    if (state.gameState !== "dealer-turn") return;
    if (state.roundId !== roundTokenRef.current) return;

    const dealerScore = handValue(state.dealerHand);

    if (dealerScore >= 17) {
      try {
        const { message, delta } = resolveRound(playerTotal, dealerScore, state.bet, state.playerHand.length);
        endRound(message, delta);
      } catch (error) {
        console.error("Failed to resolve dealer round", error);
        endRound("ERROR — RESET GAME", 0);
      }
      return;
    }

    if (state.deck.length === 0) {
      try {
        const { message, delta } = resolveRound(playerTotal, dealerScore, state.bet, state.playerHand.length);
        endRound(message, delta);
      } catch (error) {
        console.error("Failed to settle empty-deck round", error);
        endRound("ERROR — RESET GAME", 0);
      }
      return;
    }

    dealerStepTimeoutRef.current = setTimeout(() => {
      try {
        if (state.roundId !== roundTokenRef.current) return;
        const card = state.deck[0];
        const nextDeck = state.deck.slice(1);
        dispatch({ type: "DEALER_DRAW", payload: { card, nextDeck } });
        play("deal", 0.28);
      } catch (error) {
        console.error("Dealer draw step failed", error);
        endRound("ERROR — RESET GAME", 0);
      }
    }, 280);

    return () => {
      if (dealerStepTimeoutRef.current) clearTimeout(dealerStepTimeoutRef.current);
    };
  }, [endRound, play, playerTotal, state.bet, state.dealerHand, state.deck, state.gameState, state.playerHand.length, state.roundId]);

  const dealDisabled = state.bet > state.bankroll || state.bankroll <= 0;

  const canDouble =
    state.gameState === "player-turn" &&
    state.playerHand.length === 2 &&
    state.bankroll >= state.bet * 2;

  const shouldShakeStatus = state.gameState === "round-over" && /BUST|LOSE|DEALER WINS/i.test(state.message);
  const activeMultiplier = getStreakMultiplier(state.winStreak);

  const playerMeta = (
    <div className="flex flex-wrap items-center justify-end gap-2 text-right">
      {state.winStreak >= 1 && (
        <div
          className={`surface-pill${activeMultiplier > 1 ? " surface-pill-accent" : ""}`}
          style={activeMultiplier > 1 ? { boxShadow: "0 0 0 2px var(--status-win-glow)" } : {}}
          title={activeMultiplier > 1 ? `Win streak bonus: ×${activeMultiplier} payout` : `${state.winStreak} consecutive win${state.winStreak > 1 ? "s" : ""}`}
        >
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] opacity-70">Streak</span>
          <span className="text-sm font-black sm:text-[0.95rem]">
            {state.winStreak}{activeMultiplier > 1 ? ` ×${activeMultiplier}` : ""}
          </span>
        </div>
      )}
      <div className="surface-pill">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] opacity-70">Bet</span>
        <span className="numeric-tabular text-base font-black sm:text-lg">{formatCurrency(state.bet)}</span>
      </div>
      <motion.div
        key={`${state.roundId}-${shouldShakeStatus ? "loss" : "neutral"}`}
        initial={false}
        animate={!reduceMotion && shouldShakeStatus ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: "easeOut" }}
      >
        <div
          className="surface-pill surface-pill-accent"
          style={{ boxShadow: state.message.includes("WIN") ? "0 0 0 2px var(--status-win-glow)" : "none" }}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] opacity-70">Table</span>
          <span className="text-sm font-black uppercase tracking-[0.08em] sm:text-[0.95rem]">{state.message}</span>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="app-shell flex flex-col h-[100dvh] w-full overflow-hidden bg-[var(--page-bg)] text-[var(--page-text)]">
      <div className="pointer-events-none fixed inset-0" style={{ background: "var(--page-gradient)" }} aria-hidden="true" />
      <div className="neo-noise-overlay pointer-events-none fixed inset-0" aria-hidden="true" />

      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[-14%] top-[7%] h-[42rem] w-[42rem] rounded-full border-[8px]" style={{ borderColor: "var(--ambient-ring-strong)" }} />
        <div className="absolute right-[-12%] top-[26%] h-[34rem] w-[46rem] rounded-[50%] border-[8px]" style={{ borderColor: "var(--ambient-ring-soft)" }} />
        <div className="absolute bottom-[20%] left-0 right-0 h-[16rem]" style={{ background: "var(--ambient-floor-gradient)" }} />
      </div>

      {/* Achievement toast — fixed overlay, appears above everything */}
      <AchievementToast achievementId={currentAchievement} onDismiss={dismissAchievement} />

      {/* TopBar: sticky at top, never scrolls away */}
      <div className="shrink-0 px-2 pt-2 sm:px-4 sm:pt-3 relative z-10">
        <div className="mx-auto max-w-3xl">
          <TopBar
            bankroll={state.bankroll}
            bet={state.bet}
            onReset={resetGame}
            theme={theme}
            onThemeChange={setTheme}
            themeOptions={themeOptions}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
          />
        </div>
      </div>

      {/* Table: scrollable, takes remaining space */}
      <div className="table-scroll flex-1 overflow-y-auto min-h-0 px-2 py-2 sm:px-4 sm:py-3 relative z-10">
        <div className="relative mx-auto max-w-3xl">
          <main className="bg-[var(--table-bg)] p-2 sm:p-4" aria-label="Blackjack table">
            <div className="table-surface-shell space-y-3 sm:space-y-4">
              <HandZone
                title="Dealer"
                total={state.dealerRevealed ? dealerTotal : state.dealerHand.length ? `${dealerShownTotal}+` : "--"}
                hand={state.dealerHand}
                hiddenSecond={!state.dealerRevealed}
                revealHidden={state.dealerRevealed}
              />

              <div className="table-seam" aria-hidden="true" />

              <MotionDiv
                key={state.roundId}
                initial={reduceMotion ? false : { scale: 0.985, opacity: 0.9 }}
                animate={reduceMotion ? { scale: 1, opacity: 1 } : { scale: [0.99, 1.015, 1], opacity: [0.9, 1, 1] }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
              >
                <HandZone title="Player" total={state.playerHand.length ? playerTotal : "--"} hand={state.playerHand} meta={playerMeta} />
              </MotionDiv>
            </div>
          </main>
        </div>
      </div>

      <section
        className="shrink-0 bg-[var(--page-bg)] px-3 pb-safe pt-2 border-t border-white/10 shadow-[0_-8px_20px_rgba(0,0,0,0.3)] z-50"
        aria-label="Game controls"
      >
        <div className="control-rail mx-auto w-full max-w-3xl space-y-2 md:grid md:grid-cols-[1fr_1fr] md:items-end md:gap-3 md:space-y-0">
          {/* Mobile: hide during active play. Desktop: always show. */}
          <div className={isGameActive ? "hidden md:block" : ""}>
            <BetControls
              bet={state.bet}
              chipValues={CHIP_VALUES}
              selectedChip={state.selectedChip}
              onSelectChip={selectChip}
              onIncreaseBet={increaseBet}
              onDecreaseBet={decreaseBet}
              disabled={isGameActive}
            />
          </div>

          <ActionPanel
            gameState={state.gameState}
            onDeal={startNewRound}
            onNext={nextRound}
            onHit={hit}
            onStand={stand}
            onDouble={doubleDown}
            canDouble={canDouble}
            dealDisabled={dealDisabled}
            onTakeInsurance={takeInsurance}
            onDeclineInsurance={declineInsurance}
            insuranceCost={Math.floor(state.bet / 2)}
          />
        </div>
      </section>
    </div>
  );
}
