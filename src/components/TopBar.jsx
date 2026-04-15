import { Coins, Crown, RefreshCcw } from "lucide-react";
import { formatCurrency } from "../utils/formatters";
import UIButton from "./UIButton";
import StatBlock from "./StatBlock";
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
    <div className="mb-3 grid gap-2 lg:mb-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,34%)] lg:items-start lg:gap-3">
      {/* Branding panel — compact on mobile, full on desktop */}
      <div className="topbar-shell p-3 text-[var(--panel-text)] sm:p-4">
        <div className="mb-1 hidden flex-wrap gap-2 md:mb-3 md:flex">
          <span className="surface-chip px-2 py-1 text-xs font-black uppercase tracking-[0.08em]">
            One Page Blackjack
          </span>
          <span className="surface-chip surface-chip-alt px-2 py-1 text-xs font-black uppercase tracking-[0.08em]">
            Night Table
          </span>
        </div>

        {/* Title: small on phones, big on desktop */}
        <h1 className="display-heavy font-black uppercase leading-none"
          style={{ fontSize: "clamp(1.6rem, 7vw, 5rem)" }}>Velvet 21</h1>

        <p className="mt-2 hidden max-w-2xl text-sm font-semibold text-[var(--panel-muted)] md:mt-3 md:block md:text-base">
          Chunky controls in front. Atmospheric sci-fi depth in the back.
        </p>

        <div className="mt-2 hidden flex-wrap items-center gap-2 md:mt-4 md:flex md:gap-3">
          <div className="inline-flex items-center gap-1.5" role="group" aria-label="Theme selector">
            {themeOptions.map((option) => {
              const hue = THEMES[option.key]?.hue ?? 208;
              const isActive = theme === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onThemeChange(option.key)}
                  aria-pressed={isActive}
                  aria-label={`${option.label} theme`}
                  title={option.label}
                  className="relative h-9 w-9 rounded-full border-[3px] border-black transition-transform"
                  style={{
                    background: `hsl(${hue} 50% 38%)`,
                    boxShadow: isActive
                      ? `0 0 0 2px hsl(${hue} 60% 70%), 3px 3px 0 #000`
                      : "2px 2px 0 #000",
                    transform: isActive ? "translateY(-2px)" : "none",
                  }}
                >
                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats + controls panel */}
      <div className="grid grid-cols-2 items-stretch gap-2 lg:grid-cols-1 lg:gap-2.5">
        <StatBlock label="Bankroll" value={formatCurrency(bankroll)} icon={<Coins className="h-5 w-5" />} />
        <StatBlock label="Bet" value={formatCurrency(bet)} icon={<Crown className="h-5 w-5" />} />

        {/* Difficulty selector */}
        <div className="surface-stat col-span-2 hidden w-full p-3 md:block lg:col-span-1">
          <div className="mb-1.5 text-sm font-black uppercase tracking-[0.07em] text-[var(--panel-muted)]">Difficulty</div>
          <div className="flex gap-1.5">
            {Object.entries(DIFFICULTY_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => onDifficultyChange?.(key)}
                className={`flex-1 rounded border-2 border-black py-2 text-sm font-black uppercase tracking-[0.06em] transition-all ${
                  difficulty === key
                    ? "bg-[var(--accent)] text-white shadow-[2px_2px_0_#000]"
                    : "bg-transparent text-[var(--panel-text)]/82 hover:text-[var(--panel-text)]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <UIButton
          className="col-span-2 min-h-[52px] w-full bg-[var(--reset-button-bg)] text-[var(--reset-button-text)] shadow-[6px_6px_0_#000] lg:col-span-1 lg:min-h-[60px]"
          onClick={onReset}
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Reset
        </UIButton>
      </div>
    </div>
  );
}
