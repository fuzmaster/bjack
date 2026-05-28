import { Minus, Plus } from "lucide-react";
import { formatCurrency } from "../utils/formatters";
import UIButton from "./UIButton";
import Chip from "./Chip";

export default function BetControls({
  bet,
  chipValues,
  selectedChip,
  onSelectChip,
  onIncreaseBet,
  onDecreaseBet,
  disabled = false,
  compact = false,
}) {
  return (
    <div
      className={`control-cluster p-1 transition-opacity duration-200 sm:p-2 ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
      aria-disabled={disabled || undefined}
    >
      <div
        className={`mb-3 font-bold uppercase tracking-[0.10em] ${compact ? "text-xs" : "text-sm"}`}
        style={{ color: "var(--hand-title)", fontFamily: "var(--font-sans)" }}
      >
        Bet Controls
      </div>

      <div
        className={`mb-3 grid items-center gap-2 ${
          compact
            ? "grid-cols-[40px_1fr_40px] sm:grid-cols-[44px_1fr_44px]"
            : "grid-cols-[52px_1fr_52px] sm:grid-cols-[56px_1fr_56px]"
        }`}
      >
        <UIButton
          tone="ghost"
          onClick={onDecreaseBet}
          className={`${compact ? "h-10 w-10" : "h-12 w-12"} p-0`}
          aria-label="Decrease bet"
          disabled={disabled}
        >
          <Minus className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </UIButton>

        <div className={`surface-readout px-3 text-center ${compact ? "py-1.5" : "py-2"}`}>
          <div
            className={`${compact ? "text-xs" : "text-sm"} font-bold uppercase tracking-[0.10em]`}
            style={{ color: "var(--panel-muted)", fontFamily: "var(--font-sans)" }}
          >
            Current Bet
          </div>
          <div
            className="numeric-tabular leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: compact ? "clamp(1.1rem, 4.5vw, 1.7rem)" : "clamp(1.6rem, 7.5vw, 2.8rem)",
              color: "var(--page-text)",
            }}
          >
            {formatCurrency(bet)}
          </div>
        </div>

        <UIButton
          tone="ghost"
          onClick={onIncreaseBet}
          className={`${compact ? "h-10 w-10" : "h-12 w-12"} p-0`}
          aria-label="Increase bet"
          disabled={disabled}
        >
          <Plus className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </UIButton>
      </div>

      <div className="flex flex-wrap justify-center gap-2.5 pt-0.5">
        {chipValues.map((value) => (
          <Chip
            key={value}
            value={value}
            active={selectedChip === value}
            onClick={() => onSelectChip(value)}
          />
        ))}
      </div>

      {/* Bet amount with +/- */}
      <div className="grid grid-cols-[64px_1fr_64px] items-center gap-2">
        <UIButton
          onClick={onDecreaseBet}
          className="h-14 w-full bg-[var(--bet-adjust-bg)] p-0 text-[var(--panel-text)] shadow-[4px_4px_0_#000]"
          aria-label="Decrease bet"
          disabled={disabled}
        >
          <Minus className="h-6 w-6" />
        </UIButton>

        <div className="surface-readout px-3 py-2 text-center">
          <div className="text-xs font-black uppercase tracking-[0.1em] opacity-60">Current Bet</div>
          <div className="display-heavy numeric-tabular font-black leading-none" style={{ fontSize: "clamp(2rem, 9vw, 3.25rem)" }}>
            {formatCurrency(bet)}
          </div>
        </div>

        <UIButton
          onClick={onIncreaseBet}
          className="h-14 w-full bg-[var(--bet-adjust-bg)] p-0 text-[var(--panel-text)] shadow-[4px_4px_0_#000]"
          aria-label="Increase bet"
          disabled={disabled}
        >
          <Plus className="h-6 w-6" />
        </UIButton>
      </div>
    </div>
  );
}
