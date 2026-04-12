import { Coins, Crown, RefreshCcw } from "lucide-react";
import UIButton from "./UIButton";
import StatBlock from "./StatBlock";

export default function TopBar({ bankroll, bet, onReset }) {
  return (
    <div className="mb-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(280px,40%)] xl:items-start xl:gap-4">
      <div className="border-4 border-black bg-[#f0f0f0] p-3 text-black shadow-[8px_8px_0_#000] sm:p-5">
        <div className="mb-2 flex flex-wrap gap-2 sm:mb-3">
          <span className="border-2 border-black bg-white px-2 py-1 text-xs font-black uppercase tracking-[0.08em]">
            One Page Blackjack
          </span>
          <span className="border-2 border-black bg-[#cfcfcf] px-2 py-1 text-xs font-black uppercase tracking-[0.08em]">
            Night Table
          </span>
        </div>
        <h1 className="display-heavy text-4xl font-black uppercase leading-none sm:text-7xl">Velvet 21</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold sm:mt-3 sm:text-lg">
          Chunky controls in front. Atmospheric sci-fi depth in the back.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xl:gap-4">
        <StatBlock label="Bankroll" value={`$${bankroll}`} icon={<Coins className="h-5 w-5" />} />
        <StatBlock label="Bet" value={`$${bet}`} icon={<Crown className="h-5 w-5" />} />
        <UIButton
          className="min-h-[76px] min-w-[170px] bg-[#2a2a2d] text-[#f5f5f5] shadow-[6px_6px_0_#000]"
          onClick={onReset}
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Reset
        </UIButton>
      </div>
    </div>
  );
}
