import { Coins, Crown, RefreshCcw, Volume2, VolumeX, Zap, TrendingUp } from "lucide-react";
import { formatCurrency } from "../utils/formatters";
import UIButton from "./UIButton";
import StatBlock from "./StatBlock";
import { THEMES } from "../theme/themes";
import { DIFFICULTY_PRESETS } from "../game/blackjack";

const labelStyle = {
  fontFamily: "var(--font-sans)",
  color: "var(--panel-muted)",
};

const sectionLabel = "mb-1.5 text-xs font-bold uppercase tracking-[0.10em]";

export default function TopBar({
  bankroll,
  bet,
  onReset,
  theme,
  onThemeChange,
  themeOptions = [],
  difficulty = "medium",
  onDifficultyChange,
  isMuted = false,
  onToggleMute,
  gameSpeed = "normal",
  onToggleGameSpeed,
  onOpenStats,
  compact = false,
}) {
  /* ─── COMPACT: single slim row ─────────────────────────────────────── */
  if (compact) {
    return (
      <div className="flex w-full items-center gap-2 py-0.5">
        {/* Title */}
        <span
          className="shrink-0 text-base leading-none"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, color: "var(--page-text)" }}
        >
          Velvet 21
        </span>

        {/* Theme swatches */}
        <div className="flex items-center gap-1.5" role="group" aria-label="Theme">
          {themeOptions.map((option) => {
            const feltH = THEMES[option.key]?.feltH ?? THEMES[option.key]?.hue ?? 142;
            const feltC = THEMES[option.key]?.feltC ?? 0.04;
            const isActive = theme === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onThemeChange(option.key)}
                aria-pressed={isActive}
                aria-label={option.label}
                title={option.label}
                className="relative h-5 w-5 rounded-full transition-transform"
                style={{
                  background: `oklch(0.30 ${feltC * 1.4} ${feltH})`,
                  boxShadow: isActive
                    ? `0 0 0 1.5px oklch(0.82 0.10 78), 0 0 0 3px oklch(0.30 ${feltC * 1.4} ${feltH})`
                    : `0 0 0 1px oklch(0.82 0.10 78 / 0.22)`,
                  transform: isActive ? "scale(1.15)" : "none",
                  transition: "transform 140ms ease, box-shadow 140ms ease",
                }}
              >
                {isActive && (
                  <span
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ fontSize: "8px", color: "oklch(0.92 0.06 78)", fontWeight: 700 }}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bankroll + Bet inline */}
        <div className="flex items-center gap-2 text-right">
          <div className="leading-none">
            <div className="text-[0.58rem] font-bold uppercase tracking-[0.10em]" style={{ color: "var(--panel-muted)", fontFamily: "var(--font-sans)" }}>Bankroll</div>
            <div className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--page-text)" }}>{formatCurrency(bankroll)}</div>
          </div>
          <div className="leading-none">
            <div className="text-[0.58rem] font-bold uppercase tracking-[0.10em]" style={{ color: "var(--panel-muted)", fontFamily: "var(--font-sans)" }}>Bet</div>
            <div className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--page-text)" }}>{formatCurrency(bet)}</div>
          </div>
        </div>

        {/* Icon buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            style={{ background: "oklch(0.22 0.012 52 / 0.60)", color: "var(--panel-text)", border: "1px solid oklch(0.82 0.10 78 / 0.12)" }}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onToggleGameSpeed}
            aria-label={gameSpeed === "fast" ? "Speed: Fast" : "Speed: Normal"}
            title={gameSpeed === "fast" ? "Speed: Fast" : "Speed: Normal"}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            style={{
              background: gameSpeed === "fast" ? "var(--brass-400)" : "oklch(0.22 0.012 52 / 0.60)",
              color: gameSpeed === "fast" ? "var(--ink-900)" : "var(--panel-text)",
              border: "1px solid oklch(0.82 0.10 78 / 0.12)",
            }}
          >
            <Zap className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onOpenStats}
            aria-label="View stats"
            title="View stats"
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            style={{ background: "oklch(0.22 0.012 52 / 0.60)", color: "var(--panel-text)", border: "1px solid oklch(0.82 0.10 78 / 0.12)" }}
          >
            <TrendingUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset game"
            title="Reset game"
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            style={{ background: "oklch(0.22 0.012 52 / 0.60)", color: "var(--panel-text)", border: "1px solid oklch(0.82 0.10 78 / 0.12)" }}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  /* ─── FULL: original expanded layout (used when not compact) ───────── */
  return (
    <header className="w-full mb-4 shrink-0">
      {/* Mobile compact row: bankroll + bet + reset */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <h1
          className="md:hidden text-xl sm:text-2xl"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, color: "var(--page-text)" }}
        >
          Velvet 21
        </h1>

        <div className="ml-auto grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-stretch gap-1.5 sm:gap-2">
          <StatBlock label="Bankroll" value={formatCurrency(bankroll)} icon={<Coins className="h-4 w-4 sm:h-5 sm:w-5" />} />
          <StatBlock label="Bet" value={formatCurrency(bet)} icon={<Crown className="h-4 w-4 sm:h-5 sm:w-5" />} />
          <UIButton
            tone="ghost"
            onClick={onReset}
            className="min-h-[44px] w-auto px-3 text-sm sm:min-h-[48px] sm:px-4"
          >
            <RefreshCcw className="mr-1.5 h-4 w-4" /> Reset
          </UIButton>
        </div>
      </div>

      {/* Desktop panel */}
      <div className="hidden md:block mt-4">
        <div className="topbar-shell p-3 lg:p-4" style={{ color: "var(--panel-text)" }}>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="surface-chip px-2 py-1 text-xs font-bold uppercase tracking-[0.10em]" style={{ fontFamily: "var(--font-sans)" }}>
              Private Table
            </span>
            <span className="surface-chip surface-chip-alt px-2 py-1 text-xs font-bold uppercase tracking-[0.10em]" style={{ fontFamily: "var(--font-sans)" }}>
              Velvet Lounge
            </span>
          </div>

          <h1
            className="leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "clamp(2.1rem, 4.8vw, 5rem)",
              color: "var(--page-text)",
            }}
          >
            Velvet 21
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-medium lg:text-base" style={{ color: "var(--panel-muted)", fontFamily: "var(--font-sans)" }}>
            Premium blackjack. Hushed felt. Three brass tones.
          </p>

          {/* Theme swatches */}
          <div className="mt-4 flex flex-wrap items-center gap-3" role="group" aria-label="Theme selector">
            {themeOptions.map((option) => {
              const feltH = THEMES[option.key]?.feltH ?? THEMES[option.key]?.hue ?? 142;
              const feltC = THEMES[option.key]?.feltC ?? 0.04;
              const isActive = theme === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onThemeChange(option.key)}
                  aria-pressed={isActive}
                  aria-label={`${option.label} theme`}
                  title={option.label}
                  className="relative h-8 w-8 rounded-full transition-transform"
                  style={{
                    background: `oklch(0.30 ${feltC * 1.4} ${feltH})`,
                    boxShadow: isActive
                      ? `0 0 0 2px oklch(0.82 0.10 78), 0 0 0 4px oklch(0.30 ${feltC * 1.4} ${feltH})`
                      : `0 0 0 1px oklch(0.82 0.10 78 / 0.22)`,
                    transform: isActive ? "translateY(-2px) scale(1.08)" : "none",
                    transition: "transform 160ms ease, box-shadow 160ms ease",
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                      style={{ color: "oklch(0.92 0.06 78)" }}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {/* Difficulty */}
            <div className="surface-stat w-full p-3">
              <div className={sectionLabel} style={labelStyle}>Difficulty</div>
              <div className="flex gap-1.5">
                {Object.entries(DIFFICULTY_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onDifficultyChange?.(key)}
                    className="flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-[0.08em] transition-all"
                    style={{
                      fontFamily: "var(--font-sans)",
                      background: difficulty === key ? "var(--brass-400)" : "oklch(0.22 0.012 52 / 0.70)",
                      color: difficulty === key ? "var(--ink-900)" : "var(--panel-text)",
                      border: difficulty === key ? "1px solid var(--brass-300)" : "1px solid oklch(0.82 0.10 78 / 0.14)",
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="surface-stat w-full p-3">
              <div className={sectionLabel} style={labelStyle}>Settings</div>
              <div className="flex gap-1.5">
                {[
                  {
                    label: isMuted ? "Unmute" : "Mute",
                    icon: isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />,
                    onClick: onToggleMute,
                    active: isMuted,
                  },
                  {
                    label: gameSpeed === "fast" ? "Speed: Fast" : "Speed: Normal",
                    icon: <Zap className="h-4 w-4" />,
                    onClick: onToggleGameSpeed,
                    active: gameSpeed === "fast",
                  },
                  {
                    label: "View stats",
                    icon: <TrendingUp className="h-4 w-4" />,
                    onClick: onOpenStats,
                    active: false,
                  },
                ].map(({ label, icon, onClick, active }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={onClick}
                    aria-label={label}
                    title={label}
                    className="flex flex-1 items-center justify-center rounded-md py-2 transition-all"
                    style={{
                      background: active ? "var(--brass-400)" : "oklch(0.22 0.012 52 / 0.70)",
                      color: active ? "var(--ink-900)" : "var(--panel-text)",
                      border: active ? "1px solid var(--brass-300)" : "1px solid oklch(0.82 0.10 78 / 0.14)",
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
