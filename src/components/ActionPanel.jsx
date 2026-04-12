import { Wand2 } from "lucide-react";
import UIButton from "./UIButton";

export default function ActionPanel({
  onDeal,
  onNext,
  onHit,
  onStand,
  dealDisabled,
  nextDisabled,
  hitDisabled,
  standDisabled,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-4 border-black bg-[rgba(10,10,12,0.96)] p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-md xl:static xl:z-auto xl:border-4 xl:bg-[#e6e6e6] xl:p-5 xl:text-black xl:shadow-[8px_8px_0_#000]">
      <div className="mb-5 hidden text-xs font-black uppercase tracking-[0.08em] xl:block">Table Actions</div>
      <div className="grid grid-cols-2 gap-3">
        <UIButton onClick={onDeal} disabled={dealDisabled} className="min-h-[68px] bg-[#f2f2f2] text-lg text-black shadow-[4px_4px_0_#000] xl:min-h-[56px] xl:text-base">
          <Wand2 className="mr-2 h-4 w-4" /> Deal
        </UIButton>

        <UIButton onClick={onNext} disabled={nextDisabled} className="min-h-[68px] bg-[#cfcfcf] text-lg text-black shadow-[4px_4px_0_#000] xl:min-h-[56px] xl:text-base">
          Next
        </UIButton>

        <UIButton onClick={onHit} disabled={hitDisabled} className="min-h-[68px] bg-[#bdbdbd] text-lg text-black shadow-[4px_4px_0_#000] xl:min-h-[56px] xl:text-base">
          Hit
        </UIButton>

        <UIButton onClick={onStand} disabled={standDisabled} className="min-h-[68px] bg-[#9f9f9f] text-lg text-black shadow-[4px_4px_0_#000] xl:min-h-[56px] xl:text-base">
          Stand
        </UIButton>
      </div>
    </div>
  );
}
