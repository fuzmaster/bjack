import { RefreshCcw } from "lucide-react";
import { formatCurrency } from "../utils/formatters";
import { THEMES } from "../theme/themes";
import { DIFFICULTY_PRESETS } from "../game/blackjack";

export default function TopBar({
  bankroll,
  bet,
  onReset,
  theme,
  onThemeChange,
  themeOptions = [],
  difficulty = "medium",
  onDifficultyChange,
}) {
  return (
    <div
      className="flex items-center justify-between gap-2 px-3 py-2.5 border-b-2 border-white/10 sm:px-4 sm:py-3"
      style={{ background: "var(--page-bg)" }}
    >
      {/* Bankroll */}
      <div className="min-w-0 shrink-0">
        <div className="text-[0.55rem] font-black uppercase tracking-widest opacity-50 text-[var(--page-text)]">
          Bankroll
        </div>
        <div className="numeric-tabular text-[1.45rem] font-black leading-none text-[var(--page-text)] sm:text-[1.6rem]">
          {formatCurrency(bankroll)}
        </div>
      </div>

      {/* Center group: title + dots + difficulty */}
      <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
        {/* Title + theme dots */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="text-[0.55rem] font-black uppercase tracking-[0.18em] opacity-60 text-[var(--page-text)]">
            Velvet 21
          </span>
          <div className="flex gap-1.5">
            {themeOptions.map((option) => {
              const hue = THEMES[option.key]?.hue ?? 138;
              const isActive = theme === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onThemeChange(option.key)}
                  aria-pressed={isActive}
                  aria-label={`${option.label} theme`}
                  title={option.label}
                  className="h-5 w-5 rounded-full border-2 border-white/30 transition-transform touch-manipulation"
                  style={{
                    background: `hsl(${hue} 55% 42%)`,
                    boxShadow: isActive ? `0 0 0 2px hsl(${hue} 70% 72%)` : "none",
                    transform: isActive ? "scale(1.2)" : "none",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Difficulty tabs — desktop only */}
        <div className="hidden md:flex items-center gap-1 rounded-lg border border-white/15 bg-white/8 p-1">
          {Object.entries(DIFFICULTY_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => onDifficultyChange?.(key)}
              className={`rounded px-3 py-1 text-xs font-black uppercase tracking-[0.06em] transition-all touch-manipulation ${
                difficulty === key
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bet + Reset */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="text-right">
          <div className="text-[0.55rem] font-black uppercase tracking-widest opacity-50 text-[var(--page-text)]">
            Bet
          </div>
          <div className="numeric-tabular text-[1.45rem] font-black leading-none text-[var(--page-text)] sm:text-[1.6rem]">
            {formatCurrency(bet)}
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-white/20 bg-white/10 text-[var(--page-text)] transition-colors active:bg-white/20 hover:bg-white/15 touch-manipulation sm:h-10 sm:w-10"
          aria-label="Reset game"
          title="Reset game"
        >
          <RefreshCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
