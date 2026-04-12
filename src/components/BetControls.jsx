import { Minus, Plus } from "lucide-react";
import UIButton from "./UIButton";
import Chip from "./Chip";

export default function BetControls({
  bet,
  chipValues,
  selectedChip,
  onSelectChip,
  onIncreaseBet,
  onDecreaseBet,
}) {
  return (
    <div className="border-4 border-black bg-[#e6e6e6] p-4 text-black shadow-[8px_8px_0_#000] sm:p-5">
      <div className="mb-4 text-xs font-black uppercase tracking-[0.08em] sm:mb-5">Bet Controls</div>

      <div className="mb-4 grid grid-cols-[72px_1fr_72px] items-center gap-3 sm:mb-5 sm:grid-cols-[64px_1fr_64px]">
        <UIButton
          onClick={onDecreaseBet}
          className="h-16 w-16 bg-white p-0 text-black shadow-[4px_4px_0_#000] sm:h-14 sm:w-14"
          aria-label="Decrease bet"
        >
          <Minus className="h-6 w-6 sm:h-4 sm:w-4" />
        </UIButton>

        <div className="border-4 border-black bg-[#c8c8c8] px-4 py-3 text-center shadow-[4px_4px_0_#000] sm:py-4">
          <div className="text-xs font-black uppercase tracking-[0.08em]">Current Bet</div>
          <div className="display-heavy text-6xl font-black leading-none sm:text-5xl">
            ${bet}
          </div>
        </div>

        <UIButton
          onClick={onIncreaseBet}
          className="h-16 w-16 bg-white p-0 text-black shadow-[4px_4px_0_#000] sm:h-14 sm:w-14"
          aria-label="Increase bet"
        >
          <Plus className="h-6 w-6 sm:h-4 sm:w-4" />
        </UIButton>
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-1">
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
