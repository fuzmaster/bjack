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
}) {
  return (
    <div
      className={`control-cluster px-2 pt-2 pb-1 text-[var(--panel-text)] transition-opacity duration-200 sm:px-3 sm:pt-2 ${
        disabled ? "pointer-events-none opacity-40" : ""
      }`}
      aria-disabled={disabled || undefined}
    >
      {/* Chip row */}
      <div className="mb-2 flex justify-center gap-3 sm:gap-4">
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
