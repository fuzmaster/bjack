import { Wand2 } from "lucide-react";
import UIButton from "./UIButton";

export default function ActionPanel({
  gameState,
  onDeal,
  onNext,
  onHit,
  onStand,
  onDouble,
  canDouble,
  dealDisabled,
}) {
  const isReady = gameState === "ready";
  const isRoundOver = gameState === "round-over";
  const isPlayerTurn = gameState === "player-turn";
  const isDealerTurn = gameState === "dealer-turn";

  return (
    <div
      className="control-cluster p-1 text-zinc-100 sm:p-2"
    >
      {(isReady || isRoundOver) && (
        <>
          <div className="mb-3 text-sm font-black uppercase tracking-[0.07em]">
            {isRoundOver ? "Round Over" : "Table Actions"}
          </div>
          <UIButton
            onClick={isRoundOver ? onNext : onDeal}
            disabled={dealDisabled}
            className="min-h-[56px] w-full bg-[var(--button-deal-bg)] text-base text-[var(--button-text)] shadow-[4px_4px_0_#000]"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isRoundOver ? "Next Hand" : "Deal"}
          </UIButton>
        </>
      )}

      {isPlayerTurn && (
        <>
          <div className="mb-3 text-sm font-black uppercase tracking-[0.07em]">Your Move</div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <UIButton
              onClick={onHit}
              className="min-h-[56px] bg-[var(--button-hit-bg)] text-base text-[var(--button-text)] shadow-[4px_4px_0_#000]"
            >
              Hit
            </UIButton>
            <UIButton
              onClick={onStand}
              className="min-h-[56px] bg-[var(--button-stand-bg)] text-base text-[var(--button-text)] shadow-[4px_4px_0_#000]"
            >
              Stand
            </UIButton>
            {canDouble && (
              <UIButton
                onClick={onDouble}
                className="col-span-2 min-h-[56px] bg-[var(--button-next-bg)] text-base text-[var(--button-text)] shadow-[4px_4px_0_#000]"
              >
                Double Down
              </UIButton>
            )}
          </div>
        </>
      )}

      {isDealerTurn && (
        <div className="flex min-h-[44px] items-center justify-center">
          <span className="text-sm font-black uppercase tracking-[0.1em] opacity-80 text-zinc-100">
            Dealer&apos;s Turn&hellip;
          </span>
        </div>
      )}
    </div>
  );
}
