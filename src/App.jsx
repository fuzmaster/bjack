import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronDown, ChevronUp } from "lucide-react";
import TopBar from "./components/TopBar";
import BetControls from "./components/BetControls";
import ActionPanel from "./components/ActionPanel";
import HandZone from "./components/HandZone";
import StatsModal from "./components/StatsModal";
import { useTheme } from "./context/useTheme";
import { CHIP_VALUES, createDeck, DIFFICULTY_PRESETS, getStreakMultiplier, handValue, RESHUFFLE_THRESHOLD, resolveRound } from "./game/blackjack";
import { createInitialGameState, gameReducer, initialGameState } from "./game/reducer";
import { useGameAudio } from "./hooks/useGameAudio";
import { getStoredBankroll, setStoredBankroll, getStoredDifficulty, setStoredDifficulty, getStoredMuted, setStoredMuted, getStoredGameSpeed, setStoredGameSpeed, getStoredSessionStats, setStoredSessionStats } from "./utils/storage";
import { formatCurrency } from "./utils/formatters";

const MotionDiv = motion.div;

function splitRankValue(rank) {
  if (rank === "A") return 11;
  if (["10", "J", "Q", "K"].includes(rank)) return 10;
  return Number(rank);
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
  const [isTopInfoOpen, setIsTopInfoOpen] = useState(true);
  const [isControlWindowOpen, setIsControlWindowOpen] = useState(true);
  const { play, unlockAudio } = useGameAudio(isMuted);
  const { theme, setTheme, themeOptions } = useTheme();
  const [difficulty, setDifficulty] = useState(() => getStoredDifficulty());
  const roundTokenRef = useRef(0);
  const dealerStepTimeoutRef = useRef(null);
  const previousGameStateRef = useRef(state.gameState);
  const previousRoundStateRef = useRef(state.gameState);
  const previousBankrollRef = useRef(state.bankroll);
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

  const isGameActive = state.gameState === "player-turn" || state.gameState === "dealer-turn";

  const endRound = useCallback((resultMessage, delta, outcomes = undefined) => {
    dispatch({
      type: "ROUND_END",
      payload: {
        message: resultMessage,
        delta,
        outcomes,
      },
    });

    if (delta > 0) play("win", 0.4);
    else if (delta < 0) play("lose", 0.42);
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

    dispatch({
      type: "DEAL_ROUND",
      payload: {
        roundId,
        newDeck,
      },
    });

    play("deal", 0.34);
  }, [play, state.bankroll, state.bet, state.deck, state.gameState, unlockAudio]);

  const hit = useCallback(() => {
    if (state.gameState !== "player-turn") return;
    if (state.deck.length === 0) return;

    unlockAudio();
    const card = state.deck[0];
    const nextDeck = state.deck.slice(1);
    const nextPlayerHand = [...activePlayerHand, card];

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
    dispatch({
      type: "SET_SELECTED_CHIP",
      payload: value,
    });
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
      if (dealerStepTimeoutRef.current) {
        clearTimeout(dealerStepTimeoutRef.current);
      }
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
        endRound("ERROR — RESET GAME", 0);
      }
    }, gameSpeed === "fast" ? 70 : 280);

    return () => {
      if (dealerStepTimeoutRef.current) {
        clearTimeout(dealerStepTimeoutRef.current);
      }
    };
  }, [endRound, gameSpeed, play, state.dealerHand, state.deck, state.gameState, state.handBets, state.handOutcomes, state.playerHands, state.roundId]);

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
        <span className="text-[0.65rem] font-black uppercase tracking-[0.12em] opacity-70">Bet H{state.activeHandIndex + 1}</span>
        <span className="numeric-tabular text-base font-black sm:text-lg">{formatCurrency(activeHandBet)}</span>
      </div>
      <div
        className="surface-pill surface-pill-accent"
        style={{
          boxShadow: roundResult === "win" ? "0 0 0 2px var(--glow-win)" : roundResult === "loss" ? "0 0 0 2px var(--glow-loss)" : "none",
          transition: "box-shadow 280ms ease",
        }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] opacity-60" style={{ fontFamily: "var(--font-sans)" }}>Table</span>
        <span className="text-sm font-bold uppercase tracking-[0.08em] sm:text-[0.95rem]" style={{ fontFamily: "var(--font-sans)" }}>{state.message}</span>
      </div>
    </div>
  );

  return (
    <div className="app-shell flex h-[100dvh] w-full flex-col overflow-hidden bg-[var(--page-bg)] text-[var(--page-text)] lg:flex-row">
      <div className="pointer-events-none fixed inset-0" style={{ background: "var(--page-gradient)" }} aria-hidden="true" />
      <div className="neo-noise-overlay pointer-events-none fixed inset-0" aria-hidden="true" />

      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[-14%] top-[7%] h-[42rem] w-[42rem] rounded-full border-[8px]" style={{ borderColor: "var(--ambient-ring-strong)" }} />
        <div className="absolute right-[-12%] top-[26%] h-[34rem] w-[46rem] rounded-[50%] border-[8px]" style={{ borderColor: "var(--ambient-ring-soft)" }} />
        <div className="absolute bottom-[20%] left-0 right-0 h-[16rem]" style={{ background: "var(--ambient-floor-gradient)" }} />
      </div>

      {/* LAYOUT WRAPPER: Column on mobile, row on large screens */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* LEFT COLUMN: Top info + Game table */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* TOP WINDOW: Table Info */}
          <section
            className="shrink-0 bg-[var(--page-bg)] px-2 py-1 sm:px-3 sm:py-1.5"
            style={{ borderBottom: "1px solid oklch(0.82 0.10 78 / 0.10)" }}
            aria-label="Table information"
          >
            <button
              type="button"
              onClick={() => setIsTopInfoOpen((prev) => !prev)}
              className="surface-stat flex w-full items-center justify-between px-2 py-1 text-left"
              aria-expanded={isTopInfoOpen}
              aria-controls="top-info-panel"
            >
              <span
                className="text-[0.62rem] font-bold uppercase tracking-[0.12em]"
                style={{ color: "var(--panel-text)", fontFamily: "var(--font-sans)" }}
              >
                TABLE INFO
              </span>
              {isTopInfoOpen ? <ChevronUp className="h-3.5 w-3.5" style={{ color: "var(--panel-text)" }} /> : <ChevronDown className="h-3.5 w-3.5" style={{ color: "var(--panel-text)" }} />}
            </button>

            {isTopInfoOpen && (
              <div id="top-info-panel" className="mt-1 px-0.5">
                <TopBar
                  bankroll={state.bankroll}
                  bet={state.bet}
                  onReset={resetGame}
                  theme={theme}
                  onThemeChange={setTheme}
                  themeOptions={themeOptions}
                  difficulty={difficulty}
                  onDifficultyChange={setDifficulty}
                  isMuted={isMuted}
                  onToggleMute={toggleMute}
                  gameSpeed={gameSpeed}
                  onToggleGameSpeed={toggleGameSpeed}
                  onOpenStats={openStatsModal}
                  compact
                />
              </div>
            )}
          </section>

          {/* MIDDLE: Game Table */}
          <main
            className={`v21-felt relative flex min-h-0 flex-1 flex-col justify-between overflow-y-auto${roundResult === "loss" && !reduceMotion ? " v21-table-breath" : ""}`}
            aria-label="Blackjack table"
          >
            {/* Table arc lines — dealer curve + betting circle */}
            <svg
              className="v21-arcs"
              viewBox="0 0 600 380"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M 20 95 Q 300 -15 580 95" />
              <path className="v21-arc-thin" d="M 20 107 Q 300 -2 580 107" />
              <ellipse cx="300" cy="292" rx="118" ry="34" />
              <ellipse className="v21-arc-thin" cx="300" cy="292" rx="130" ry="41" />
              <text x="300" y="60" textAnchor="middle">BLACKJACK · PAYS 3 TO 2</text>
              <text x="300" y="75" textAnchor="middle" style={{ fontSize: "6px", letterSpacing: "0.28em" }}>
                DEALER MUST DRAW TO 16 · STAND ON ALL 17S
              </text>
            </svg>
            {/* Dealer zone: pin to top */}
            <div className="shrink-0 px-1.5 py-1.5 sm:px-2 sm:py-2">
              <div className="table-surface-shell mx-auto w-full max-w-2xl">
                <HandZone
                  title="Dealer"
                  total={state.dealerRevealed ? dealerTotal : state.dealerHand.length ? `${dealerShownTotal}+` : "--"}
                  hand={state.dealerHand}
                  hiddenSecond={!state.dealerRevealed}
                  revealHidden={state.dealerRevealed}
                />
              </div>
            </div>

            {/* Center: grows and centers */}
            <div className="my-auto" />

            {/* Player zone: pin to bottom */}
            <div className="shrink-0 px-1.5 py-1.5 sm:px-2 sm:py-2">
              <div className="table-surface-shell mx-auto w-full max-w-2xl">
                <MotionDiv
                  key={state.roundId}
                  initial={reduceMotion ? false : { scale: 0.985, opacity: 0.9 }}
                  animate={reduceMotion ? { scale: 1, opacity: 1 } : { scale: [0.99, 1.015, 1], opacity: [0.9, 1, 1] }}
                  transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
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
        </div>
      </div>

      {/* BOTTOM/RIGHT WINDOW: Controls (sidebar on lg, footer on mobile) */}
      <aside
        className="z-50 flex shrink-0 flex-col bg-[var(--page-bg)] px-2 py-1 sm:px-3 sm:py-1.5 lg:h-full lg:w-96"
        style={{ borderTop: "1px solid oklch(0.82 0.10 78 / 0.10)", }}
        aria-label="Game controls"
      >
        <button
          type="button"
          onClick={() => setIsControlWindowOpen((prev) => !prev)}
          className="surface-stat flex w-full items-center justify-between px-2 py-1 text-left"
          aria-expanded={isControlWindowOpen}
          aria-controls="control-window-panel"
        >
          <span
            className="text-[0.62rem] font-bold uppercase tracking-[0.12em]"
            style={{ color: "var(--panel-text)", fontFamily: "var(--font-sans)" }}
          >
            CURRENT BET + NEXT HAND
          </span>
          {isControlWindowOpen ? <ChevronUp className="h-3.5 w-3.5" style={{ color: "var(--panel-text)" }} /> : <ChevronDown className="h-3.5 w-3.5" style={{ color: "var(--panel-text)" }} />}
        </button>

        {isControlWindowOpen && (
          <div id="control-window-panel" className="control-rail mt-1 flex w-full flex-col gap-1.5 px-0.5 lg:flex-1 lg:overflow-y-auto">
            <BetControls
              bet={state.bet}
              chipValues={CHIP_VALUES}
              selectedChip={state.selectedChip}
              onSelectChip={selectChip}
              onIncreaseBet={increaseBet}
              onDecreaseBet={decreaseBet}
              disabled={isGameActive}
              compact
            />

            <ActionPanel
              gameState={state.gameState}
              onDeal={startNewRound}
              onNext={nextRound}
              onHit={hit}
              onStand={stand}
              onDouble={doubleDown}
              onSplit={splitHand}
              onRescue={rescueFunds}
              canDouble={canDouble}
              canSplit={canSplit}
              dealDisabled={dealDisabled}
              bankroll={state.bankroll}
              bet={state.bet}
              compact
            />
          </div>
        )}
      </aside>

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={closeStatsModal}
        handsWon={state.handsWon}
        handsLost={state.handsLost}
        handsPushed={state.handsPushed}
        highestBankroll={state.highestBankroll}
        currentBankroll={state.bankroll}
      />
    </div>
  );
}
