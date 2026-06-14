import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronDown, ChevronUp, Settings as SettingsIcon, Flame, Volume2, VolumeX, Zap, TrendingUp, RefreshCcw } from "lucide-react";
import TopBar from "./components/TopBar";
import BetControls from "./components/BetControls";
import ActionPanel from "./components/ActionPanel";
import HandZone from "./components/HandZone";
const StatsModal = lazy(() => import("./components/StatsModal"));
import { useTheme } from "./context/useTheme";
import { useAchievements } from "./hooks/useAchievements";
import { CHIP_VALUES, createDeck, DIFFICULTY_PRESETS, getStreakMultiplier, handValue, RESHUFFLE_THRESHOLD, resolveRound } from "./game/blackjack";
import { createInitialGameState, gameReducer, initialGameState } from "./game/reducer";
import { useGameAudio } from "./hooks/useGameAudio";
import { useSwipeGestures } from "./hooks/useSwipeGestures";

const vibrate = (pattern) => { try { navigator?.vibrate?.(pattern); } catch {} };
import { getStoredBankroll, setStoredBankroll, getStoredDifficulty, setStoredDifficulty, getStoredMuted, setStoredMuted, getStoredGameSpeed, setStoredGameSpeed, getStoredSessionStats, setStoredSessionStats } from "./utils/storage";
import { formatCurrency } from "./utils/formatters";

const MotionDiv = motion.div;

function splitRankValue(rank) {
  if (rank === "A") return 11;
  if (["10", "J", "Q", "K"].includes(rank)) return 10;
  return Number(rank);
}

// Greedy denomination decomposition: $130 → [{100,1}, {25,1}, {5,1}]
const CHIP_DENOMS = [100, 50, 25, 5];
function decomposeBet(amount) {
  const stacks = [];
  let remaining = amount;
  for (const d of CHIP_DENOMS) {
    const count = Math.floor(remaining / d);
    if (count > 0) {
      stacks.push({ denom: d, count });
      remaining -= count * d;
    }
  }
  return stacks;
}

// Visible chips per stack — show up to 5 stacked, then a "×N" count tag
const MAX_VISIBLE_CHIPS = 5;

function FeltChipStack({ amount }) {
  const stacks = decomposeBet(amount);
  if (stacks.length === 0 || amount <= 0) return null;
  return (
    <div className="v21-felt-chips" aria-label={`Wager $${amount} on the table`}>
      <AnimatePresence>
        {stacks.map(({ denom, count }) => {
          const visible = Math.min(count, MAX_VISIBLE_CHIPS);
          return (
            <motion.div
              key={denom}
              className="v21-chip-pile"
              initial={{ opacity: 0, y: 6, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 520, damping: 28, mass: 0.3 }}
            >
              {count > MAX_VISIBLE_CHIPS && <span className="count-tag">×{count}</span>}
              {Array.from({ length: visible }, (_, i) => (
                <div key={i} className={`v21-felt-chip denom-${denom}`}>
                  {i === visible - 1 ? denom : ""}
                </div>
              ))}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialGameState,
    (baseState) => {
      const stats = getStoredSessionStats();
      const initialState = createInitialGameState(baseState.deck, baseState.roundId, getStoredBankroll() ?? baseState.bankroll);
      return {
        ...initialState,
        handsWon: stats.handsWon,
        handsLost: stats.handsLost,
        handsPushed: stats.handsPushed,
        highestBankroll: Math.max(initialState.highestBankroll, stats.highestBankroll),
      };
    },
  );
  const [isMuted, setIsMuted] = useState(() => getStoredMuted());
  const [gameSpeed, setGameSpeed] = useState(() => getStoredGameSpeed());
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dealerRevealHeld, setDealerRevealHeld] = useState(false);
  const { play, unlockAudio } = useGameAudio(isMuted);
  const { theme, setTheme, themeOptions } = useTheme();
  const { current: currentAchievement, unlock, dismiss: dismissAchievement } = useAchievements();
  const [difficulty, setDifficulty] = useState(() => getStoredDifficulty());
  const roundTokenRef = useRef(0);
  const dealerStepTimeoutRef = useRef(null);
  const previousGameStateRef = useRef(state.gameState);
  const previousRoundStateRef = useRef(state.gameState);
  const previousBankrollRef = useRef(state.bankroll);
  const achievementGameStateRef = useRef(state.gameState);
  const achievementWinStreakRef = useRef(state.winStreak ?? 0);
  const bankrollAtDealRef = useRef(state.bankroll);
  const reduceMotion = useReducedMotion();

  const playerTotals = state.playerHands.map((hand) => handValue(hand));
  const activePlayerHand = useMemo(
    () => state.playerHands[state.activeHandIndex] ?? [],
    [state.activeHandIndex, state.playerHands],
  );
  const activePlayerTotal = playerTotals[state.activeHandIndex] ?? 0;
  const activeHandBet = state.handBets[state.activeHandIndex] ?? state.bet;
  const dealerVisibleHand = state.dealerRevealed ? state.dealerHand : state.dealerHand.slice(0, 1);
  const dealerShownTotal = handValue(dealerVisibleHand);
  const dealerTotal = handValue(state.dealerHand);

  const isGameActive = state.gameState === "player-turn" || state.gameState === "dealer-turn" || state.gameState === "insurance";

  const endRound = useCallback((resultMessage, delta, outcomes = undefined) => {
    dispatch({
      type: "ROUND_END",
      payload: {
        message: resultMessage,
        delta,
        outcomes,
      },
    });

    if (delta > 0) { play("win", 0.4); vibrate([40, 60, 40]); }
    else if (delta < 0) { play("lose", 0.42); vibrate(80); }
    else play("flip", 0.25);
  }, [play]);

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
    vibrate(28);
  }, [play, state.bankroll, state.bet, state.deck, state.gameState, unlockAudio]);

  const hit = useCallback(() => {
    if (state.gameState !== "player-turn") return;
    if (state.deck.length === 0) return;

    unlockAudio();
    const card = state.deck[0];
    const nextDeck = state.deck.slice(1);
    const nextPlayerHand = [...activePlayerHand, card];

    dispatch({ type: "PLAYER_HIT", payload: { card, nextDeck } });
    play("deal", 0.3);

    const nextTotal = handValue(nextPlayerHand);
    if (nextTotal > 21) {
      dispatch({ type: "PLAYER_BUST" });
    } else if (nextTotal === 21) {
      dispatch({ type: "PLAYER_STAND" });
    }
  }, [activePlayerHand, play, state.deck, state.gameState, unlockAudio]);

  const stand = useCallback(() => {
    if (state.gameState !== "player-turn") return;
    dispatch({ type: "PLAYER_STAND" });
  }, [state.gameState]);

  const doubleDown = useCallback(() => {
    if (state.gameState !== "player-turn") return;
    if (activePlayerHand.length !== 2) return;
    if (state.bankroll < activeHandBet) return;
    if (state.deck.length === 0) return;

    unlockAudio();
    const card = state.deck[0];
    const nextDeck = state.deck.slice(1);
    const nextPlayerHand = [...activePlayerHand, card];
    const newBet = activeHandBet * 2;

    dispatch({
      type: "DOUBLE_DOWN",
      payload: { card, nextDeck, newBet, extraWager: activeHandBet },
    });

    play("deal", 0.3);

    const nextTotal = handValue(nextPlayerHand);
    if (nextTotal > 21) {
      dispatch({ type: "PLAYER_BUST" });
    } else {
      dispatch({ type: "PLAYER_STAND" });
    }
  }, [activeHandBet, activePlayerHand, play, state.bankroll, state.deck, state.gameState, unlockAudio]);

  const splitHand = useCallback(() => {
    if (state.gameState !== "player-turn") return;
    unlockAudio();
    play("chip", 0.2);
    dispatch({ type: "SPLIT_HAND" });
  }, [play, state.gameState, unlockAudio]);

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

  const rescueFunds = useCallback(() => {
    unlockAudio();
    play("button", 0.22);
    dispatch({ type: "RESCUE_FUNDS" });
  }, [play, unlockAudio]);

  const toggleMute = useCallback(() => {
    unlockAudio();
    setIsMuted((prev) => !prev);
  }, [unlockAudio]);

  const toggleGameSpeed = useCallback(() => {
    unlockAudio();
    setGameSpeed((prev) => (prev === "normal" ? "fast" : "normal"));
  }, [unlockAudio]);

  const openStatsModal = useCallback(() => {
    unlockAudio();
    setIsStatsModalOpen(true);
  }, [unlockAudio]);

  const closeStatsModal = useCallback(() => {
    setIsStatsModalOpen(false);
  }, []);

  useEffect(() => {
    setStoredBankroll(state.bankroll);
  }, [state.bankroll]);

  useEffect(() => {
    setStoredSessionStats({
      handsWon: state.handsWon,
      handsLost: state.handsLost,
      handsPushed: state.handsPushed,
      highestBankroll: state.highestBankroll,
    });
  }, [state.handsWon, state.handsLost, state.handsPushed, state.highestBankroll]);

  useEffect(() => {
    setStoredDifficulty(difficulty);
  }, [difficulty]);

  useEffect(() => {
    setStoredMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    setStoredGameSpeed(gameSpeed);
  }, [gameSpeed]);

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

    // Confetti only on natural blackjack — regular wins use edge glow instead
    if (!reduceMotion && !wasRoundOver && isRoundOver && bankrollDelta > 0) {
      const naturalBlackjackWin = state.message.includes("BLACKJACK");
      if (naturalBlackjackWin) {
        confetti({
          particleCount: 110,
          spread: 84,
          scalar: 1.05,
          startVelocity: 44,
          origin: { y: 0.60 },
          colors: ["#d4a96a", "#e8c987", "#f5e4b0", "#c4892a", "#ffffff"],
          zIndex: 1200,
        });
        confetti({
          particleCount: 40,
          spread: 72,
          scalar: 0.82,
          startVelocity: 36,
          origin: { x: 0.18, y: 0.56 },
          colors: ["#d4a96a", "#e8c987", "#f5e4b0"],
          zIndex: 1200,
        });
        confetti({
          particleCount: 40,
          spread: 72,
          scalar: 0.82,
          startVelocity: 36,
          origin: { x: 0.82, y: 0.56 },
          colors: ["#d4a96a", "#e8c987", "#f5e4b0"],
          zIndex: 1200,
        });
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

    const allHandsBusted = state.handOutcomes.length > 0 && state.handOutcomes.every((outcome) => outcome === "bust");
    if (allHandsBusted) {
      const totalLoss = state.handBets.reduce((sum, handBet) => sum + handBet, 0);
      endRound("ALL HANDS BUST • DEALER WINS", -totalLoss, {
        won: 0,
        lost: state.handBets.length,
        pushed: 0,
      });
      return;
    }

    const dealerScore = handValue(state.dealerHand);

    const settleHands = () => {
      const totals = state.playerHands.map((hand) => handValue(hand));
      const results = totals.map((total, idx) => {
        if (state.handOutcomes[idx] === "bust") {
          return { message: "BUST • DEALER WINS", delta: -state.handBets[idx] };
        }
        return resolveRound(total, dealerScore, state.handBets[idx], state.playerHands[idx].length);
      });

      const outcomeCounts = results.reduce((acc, result) => {
        if (result.delta > 0) acc.won += 1;
        else if (result.delta < 0) acc.lost += 1;
        else acc.pushed += 1;
        return acc;
      }, { won: 0, lost: 0, pushed: 0 });

      const combinedDelta = results.reduce((sum, result) => sum + result.delta, 0);
      const summaryMessage = results.length === 1
        ? results[0].message
        : `W ${outcomeCounts.won} • L ${outcomeCounts.lost} • P ${outcomeCounts.pushed}`;

      endRound(summaryMessage, combinedDelta, outcomeCounts);
    };

    if (dealerScore >= 17) {
      try {
        settleHands();
      } catch (error) {
        console.error("Failed to resolve dealer round", error);
        endRound("ERROR — RESET GAME", 0);
      }
      return;
    }

    if (state.deck.length === 0) {
      try {
        settleHands();
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
    }, gameSpeed === "fast" ? 45 : 140);

    return () => {
      if (dealerStepTimeoutRef.current) clearTimeout(dealerStepTimeoutRef.current);
    };
  }, [endRound, gameSpeed, play, state.dealerHand, state.deck, state.gameState, state.handBets, state.handOutcomes, state.playerHands, state.roundId]);

  // Dealer reveal hold — 650ms shimmer pause before hole card flips
  useEffect(() => {
    if (state.gameState !== "dealer-turn") { setDealerRevealHeld(false); return; }
    setDealerRevealHeld(true);
    const t = setTimeout(() => setDealerRevealHeld(false), 280);
    return () => clearTimeout(t);
  }, [state.gameState]);

  const dealDisabled = state.bet > state.bankroll || state.bankroll <= 0;

  const canDouble =
    state.gameState === "player-turn" &&
    activePlayerHand.length === 2 &&
    state.bankroll >= activeHandBet;

  const canSplit =
    state.gameState === "player-turn" &&
    state.playerHands.length === 1 &&
    activePlayerHand.length === 2 &&
    splitRankValue(activePlayerHand[0].rank) === splitRankValue(activePlayerHand[1].rank) &&
    state.bankroll >= activeHandBet;

  // Keyboard shortcuts: H=Hit S=Stand D=Double Space=Deal/Next
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.metaKey || e.ctrlKey) return;
      const gs = state.gameState;
      switch (e.key.toLowerCase()) {
        case "h": if (gs === "player-turn") { e.preventDefault(); hit(); } break;
        case "s": if (gs === "player-turn") { e.preventDefault(); stand(); } break;
        case "d": if (gs === "player-turn" && canDouble) { e.preventDefault(); doubleDown(); } break;
        case " ":
          e.preventDefault();
          if (gs === "ready" && !dealDisabled) startNewRound();
          else if (gs === "round-over") nextRound();
          break;
        default: break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.gameState, hit, stand, doubleDown, startNewRound, nextRound, canDouble, dealDisabled]);

  // Touch swipe gestures: ↑ Hit  ← Stand  → Double
  useSwipeGestures({
    enabled: state.gameState === "player-turn",
    onHit: hit,
    onStand: stand,
    onDouble: canDouble ? doubleDown : undefined,
  });

  // Derive round result for HandZone edge glow
  const isRoundOver = state.gameState === "round-over";
  const roundResult = isRoundOver
    ? /BUST|LOSE|DEALER WINS/i.test(state.message)
      ? "loss"
      : /WIN|BLACKJACK/i.test(state.message)
      ? "win"
      : null
    : null;

  const activeMultiplier = getStreakMultiplier(state.winStreak);

  const isSplit = state.playerHands.length > 1;
  const playerMeta = (
    <div className="flex flex-wrap items-center justify-end gap-2 text-right">
      {state.winStreak >= 1 && (
        <div
          className={`surface-pill${activeMultiplier > 1 ? " surface-pill-accent" : ""}${state.winStreak >= 3 ? " surface-pill-streak-hot" : ""}`}
          title={activeMultiplier > 1 ? `Win streak bonus: ×${activeMultiplier} payout` : `${state.winStreak} consecutive win${state.winStreak > 1 ? "s" : ""}`}
        >
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] opacity-70">Streak</span>
          <span className="text-sm font-black sm:text-[0.95rem]">
            {state.winStreak}{activeMultiplier > 1 ? ` ×${activeMultiplier}` : ""}
          </span>
        </div>
      )}
      {/* Bet pill only during split (when "H1 / H2" labels matter) — else redundant with dock */}
      {isSplit && (
        <div className="surface-pill">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] opacity-70">Bet H{state.activeHandIndex + 1}</span>
          <span className="numeric-tabular text-base font-black sm:text-lg">{formatCurrency(activeHandBet)}</span>
        </div>
      )}
      {/* Status pill — suppressed during round-over since plaque carries the verdict */}
      {!isRoundOver && (
        <div
          className="surface-pill surface-pill-accent"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] opacity-60" style={{ fontFamily: "var(--font-sans)" }}>Table</span>
          <span className="text-sm font-bold uppercase tracking-[0.08em] sm:text-[0.95rem]" style={{ fontFamily: "var(--font-sans)" }}>{state.message}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-shell relative flex h-full w-full flex-col overflow-hidden bg-[var(--page-bg)] text-[var(--page-text)]">
      {/* Fixed overlay layers */}
      <div className="pointer-events-none fixed inset-0" style={{ background: "var(--page-gradient)" }} aria-hidden="true" />
      <div className="neo-noise-overlay pointer-events-none fixed inset-0" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-64" style={{ background: "var(--ambient-glow-top)" }} aria-hidden="true" />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-48" style={{ background: "var(--ambient-floor-gradient)" }} aria-hidden="true" />

      {/* ALWAYS-VISIBLE HUD — brand · bankroll · streak · settings cog */}
      <header
        className="relative z-10 shrink-0"
        style={{ borderBottom: "1px solid oklch(0.82 0.10 78 / 0.10)" }}
        aria-label="Game HUD"
      >
        <div className="flex w-full items-center gap-2 px-3 py-1.5 sm:px-4">
          <span
            className="shrink-0 text-base leading-none"
            style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, color: "var(--page-text)" }}
          >
            Velvet <span style={{ color: "var(--brass-200)" }}>21</span>
          </span>

          <div className="flex-1" />

          {state.winStreak >= 1 && (
            <div
              className={`flex flex-col items-end leading-none ${state.winStreak >= 3 ? "v21-streak-hot" : ""}`}
              title={`${state.winStreak} consecutive win${state.winStreak > 1 ? "s" : ""}`}
            >
              <span
                className="flex items-center gap-1 text-[0.55rem] font-bold uppercase tracking-[0.12em]"
                style={{ color: "var(--panel-muted)", fontFamily: "var(--font-sans)" }}
              >
                {state.winStreak >= 3 && <Flame className="h-2.5 w-2.5" />} Streak
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "var(--brass-100)", fontFamily: "var(--font-display)", fontStyle: "italic" }}
              >
                {state.winStreak}
              </span>
            </div>
          )}

          <div className="flex flex-col items-end leading-none">
            <span
              className="text-[0.55rem] font-bold uppercase tracking-[0.12em]"
              style={{ color: "var(--panel-muted)", fontFamily: "var(--font-sans)" }}
            >
              Bankroll
            </span>
            <span
              className="text-xl font-bold numeric-tabular"
              style={{ color: "var(--brass-100)", fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "0.01em" }}
            >
              ${state.bankroll.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
            style={{
              background: isSettingsOpen ? "var(--brass-400)" : "oklch(0.22 0.012 52 / 0.60)",
              color: isSettingsOpen ? "var(--ink-900)" : "var(--panel-text)",
              border: "1px solid oklch(0.82 0.10 78 / 0.18)",
            }}
            aria-expanded={isSettingsOpen}
            aria-controls="settings-panel"
            aria-label="Settings"
            title="Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>

        {isSettingsOpen && (
          <div id="settings-panel" className="flex flex-wrap items-center gap-3 px-3 pb-2 sm:px-4">
            {/* Theme swatches */}
            <div className="flex items-center gap-1.5" role="group" aria-label="Theme">
              {themeOptions.map((option) => {
                const isActive = theme === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setTheme(option.key)}
                    aria-pressed={isActive}
                    aria-label={`${option.label} theme`}
                    title={option.label}
                    className="h-5 w-5 rounded-full transition-transform"
                    style={{
                      background: `oklch(0.30 0.06 ${option.key === "modern" ? 220 : option.key === "classic" ? 142 : option.key === "royal" ? 280 : option.key === "cherry" ? 12 : 48})`,
                      boxShadow: isActive
                        ? `0 0 0 1.5px oklch(0.82 0.10 78), 0 0 0 3px oklch(0.18 0.012 50)`
                        : `0 0 0 1px oklch(0.82 0.10 78 / 0.25)`,
                      transform: isActive ? "scale(1.12)" : "none",
                    }}
                  />
                );
              })}
            </div>

            <div className="flex-1" />

            {/* Icon controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                title={isMuted ? "Unmute" : "Mute"}
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ background: "oklch(0.22 0.012 52 / 0.60)", color: "var(--panel-text)", border: "1px solid oklch(0.82 0.10 78 / 0.18)" }}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={toggleGameSpeed}
                aria-label={gameSpeed === "fast" ? "Speed: Fast" : "Speed: Normal"}
                title={gameSpeed === "fast" ? "Speed: Fast" : "Speed: Normal"}
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{
                  background: gameSpeed === "fast" ? "var(--brass-400)" : "oklch(0.22 0.012 52 / 0.60)",
                  color: gameSpeed === "fast" ? "var(--ink-900)" : "var(--panel-text)",
                  border: "1px solid oklch(0.82 0.10 78 / 0.18)",
                }}
              >
                <Zap className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={openStatsModal}
                aria-label="View stats"
                title="View stats"
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ background: "oklch(0.22 0.012 52 / 0.60)", color: "var(--panel-text)", border: "1px solid oklch(0.82 0.10 78 / 0.18)" }}
              >
                <TrendingUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={resetGame}
                aria-label="Reset game"
                title="Reset game"
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ background: "oklch(0.22 0.012 52 / 0.60)", color: "var(--panel-text)", border: "1px solid oklch(0.82 0.10 78 / 0.18)" }}
              >
                <RefreshCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* GAME TABLE — fills all remaining vertical space */}
      <main
        className={`v21-felt relative z-0 flex min-h-0 flex-1 flex-col justify-between overflow-hidden${roundResult === "loss" && !reduceMotion ? " v21-table-breath" : ""}`}
        aria-label="Blackjack table"
      >
        {/* Table arc lines */}
        <svg className="v21-arcs" viewBox="0 0 600 380" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 20 95 Q 300 -15 580 95" />
          <path className="v21-arc-thin" d="M 20 107 Q 300 -2 580 107" />
          <ellipse cx="300" cy="292" rx="118" ry="34" />
          <ellipse className="v21-arc-thin" cx="300" cy="292" rx="130" ry="41" />
        </svg>

        {/* Dealer zone */}
        <div className="shrink-0 px-1.5 py-1.5 sm:px-2 sm:py-2">
          <div className="table-surface-shell mx-auto w-full max-w-2xl">
            <HandZone
              title="Dealer"
              total={(state.dealerRevealed && !dealerRevealHeld) ? dealerTotal : state.dealerHand.length ? `${dealerShownTotal}+` : "--"}
              hand={state.dealerHand}
              hiddenSecond={!state.dealerRevealed || dealerRevealHeld}
              revealHidden={state.dealerRevealed && !dealerRevealHeld}
              thinking={dealerRevealHeld}
            />
          </div>
        </div>

        {/* Felt cue — "21" dashed ring during ready state when no cards on table */}
        {state.gameState === "ready" && state.playerHands[0].length === 0 && (
          <div className="v21-felt-cue" aria-hidden="true">
            <div className="ring"><span className="mono">21</span></div>
            <div className="cue-text">Set your bet, then deal</div>
          </div>
        )}

        {/* Physical chip stack on the betting circle */}
        <FeltChipStack
          amount={(() => {
            if (state.gameState === "ready") return state.bet;
            if (state.gameState === "round-over" && state.lastDelta < 0) return 0;
            return state.handBets?.[state.activeHandIndex] ?? state.bet;
          })()}
        />

        {/* Result plaque — inline verdict + delta at round end */}
        {state.gameState === "round-over" && (
          <div
            className={`v21-result-plaque ${state.lastDelta > 0 ? "win" : ""}`}
            role="status"
            aria-live="polite"
          >
            <span className="verdict">{state.message}</span>
            <span className={`delta ${state.lastDelta > 0 ? "up" : state.lastDelta < 0 ? "down" : "push"}`}>
              {state.lastDelta > 0
                ? `+$${Math.abs(state.lastDelta).toLocaleString()}`
                : state.lastDelta < 0
                  ? `−$${Math.abs(state.lastDelta).toLocaleString()}`
                  : "PUSH · NO CHANGE"}
            </span>
          </div>
        )}

        <div className="my-auto" />

        {/* Player zone */}
        <div className="shrink-0 px-1.5 py-1.5 sm:px-2 sm:py-2">
          <div className="table-surface-shell mx-auto w-full max-w-2xl">
            <MotionDiv
              key={state.roundId}
              initial={reduceMotion ? false : { scale: 0.97, opacity: 0.85 }}
              animate={reduceMotion ? { scale: 1, opacity: 1 } : { scale: [0.98, 1.01, 1], opacity: [0.85, 1, 1] }}
              transition={{ duration: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
            >
              <HandZone
                title="Player"
                total={activePlayerHand.length ? activePlayerTotal : "--"}
                hands={state.playerHands}
                handTotals={playerTotals.map((value, idx) => (state.playerHands[idx].length ? value : "--"))}
                activeHandIndex={state.activeHandIndex}
                result={roundResult}
                meta={playerMeta}
              />
            </MotionDiv>
          </div>
        </div>
      </main>

      {/* BOTTOM CONTROLS — bet ⇄ wager-locked swap on left, action cluster on right */}
      <div
        className="relative z-10 flex shrink-0 min-h-[178px]"
        style={{ borderTop: "1px solid oklch(0.82 0.10 78 / 0.10)" }}
        aria-label="Game controls"
      >
        <div className="min-w-0 flex-1">
          {state.gameState === "player-turn" || state.gameState === "dealer-turn" || state.gameState === "insurance" ? (
            <div className="p-2 sm:p-3">
              <div className="v21-wager-locked">
                <span className="k">Wager Locked</span>
                <span className="v">${(state.handBets?.[state.activeHandIndex] ?? state.bet).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <BetControls
              bet={state.bet}
              chipValues={CHIP_VALUES}
              selectedChip={state.selectedChip}
              onSelectChip={selectChip}
              onIncreaseBet={increaseBet}
              onDecreaseBet={decreaseBet}
              disabled={false}
              compact
            />
          )}
        </div>
        <div className="w-px shrink-0" style={{ background: "oklch(0.82 0.10 78 / 0.10)" }} />
        <div className="min-w-0 flex-1">
          <ActionPanel
            gameState={state.gameState}
            onDeal={startNewRound}
            onNext={nextRound}
            onHit={hit}
            onStand={stand}
            onDouble={doubleDown}
            onSplit={splitHand}
            onRescue={rescueFunds}
            onTakeInsurance={takeInsurance}
            onDeclineInsurance={declineInsurance}
            insuranceCost={Math.floor((state.handBets?.[0] ?? state.bet) / 2)}
            canDouble={canDouble}
            canSplit={canSplit}
            dealDisabled={dealDisabled}
            bankroll={state.bankroll}
            bet={state.bet}
            compact
          />
        </div>
      </div>

      <Suspense>
        <StatsModal
          isOpen={isStatsModalOpen}
          onClose={closeStatsModal}
          handsWon={state.handsWon}
          handsLost={state.handsLost}
          handsPushed={state.handsPushed}
          highestBankroll={state.highestBankroll}
          currentBankroll={state.bankroll}
        />
      </Suspense>
    </div>
  );
}
