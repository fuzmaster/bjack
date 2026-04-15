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
      className={`control-cluster p-1 text-[var(--panel-text)] transition-opacity duration-200 sm:p-2 ${
        disabled ? "pointer-events-none opacity-55" : ""
      }`}
      aria-disabled={disabled || undefined}
    >
      <div className="mb-3 text-sm font-black uppercase tracking-[0.07em] sm:mb-4">Bet Controls</div>

      <div className="mb-3 grid grid-cols-[56px_1fr_56px] items-center gap-2 sm:mb-4 sm:grid-cols-[60px_1fr_60px] sm:gap-2.5">
        <UIButton
          onClick={onDecreaseBet}
          className="h-12 w-12 bg-[var(--bet-adjust-bg)] p-0 text-[var(--panel-text)] shadow-[4px_4px_0_#000] sm:h-14 sm:w-14"
          aria-label="Decrease bet"
          disabled={disabled}
        >
          <Minus className="h-5 w-5" />
        </UIButton>

        <div className="surface-readout px-3 py-2 text-center sm:py-2.5">
          <div className="text-sm font-black uppercase tracking-[0.07em]">Current Bet</div>
          <div className="display-heavy numeric-tabular font-black leading-none" style={{ fontSize: "clamp(1.75rem, 8vw, 3rem)" }}>
            {formatCurrency(bet)}
          </div>
        </div>

        <UIButton
          onClick={onIncreaseBet}
          className="h-12 w-12 bg-[var(--bet-adjust-bg)] p-0 text-[var(--panel-text)] shadow-[4px_4px_0_#000] sm:h-14 sm:w-14"
          aria-label="Increase bet"
          disabled={disabled}
        >
          <Plus className="h-5 w-5" />
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
    </div>
  );
}
