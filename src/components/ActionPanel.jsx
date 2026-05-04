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
  onTakeInsurance,
  onDeclineInsurance,
  insuranceCost,
}) {
  const isReady = gameState === "ready";
  const isRoundOver = gameState === "round-over";
  const isPlayerTurn = gameState === "player-turn";
  const isDealerTurn = gameState === "dealer-turn";
  const isInsurance = gameState === "insurance";

  return (
    <div className="control-cluster px-2 pt-1 pb-2 text-zinc-100 sm:px-3 sm:pt-2">
      {(isReady || isRoundOver) && (
        <>
          <div className="mb-1.5 text-xs font-black uppercase tracking-[0.08em] opacity-60">
            {isRoundOver ? "Round Over" : "Ready to Play"}
          </div>
          <UIButton
            onClick={isRoundOver ? onNext : onDeal}
            disabled={dealDisabled}
            className="w-full bg-[var(--button-deal-bg)] text-xl text-[var(--button-text)] shadow-[4px_4px_0_#000]"
          >
            <Wand2 className="mr-2 h-5 w-5" />
            {isRoundOver ? "Next Hand" : "Deal Cards"}
          </UIButton>
        </>
      )}

      {isInsurance && (
        <>
          <div className="mb-2 text-center">
            <div className="text-xs font-black uppercase tracking-[0.08em] opacity-60">Dealer Shows Ace</div>
            <div className="mt-0.5 text-[0.65rem] opacity-50">Insurance pays 2 to 1 if dealer has blackjack</div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <UIButton
              onClick={onTakeInsurance}
              className="min-h-[72px] flex-col text-base text-white shadow-[4px_4px_0_#000]"
              style={{ background: "#059669" }}
            >
              <span>Take Insurance</span>
              <span className="mt-0.5 text-sm font-bold opacity-80">${insuranceCost}</span>
            </UIButton>
            <UIButton
              onClick={onDeclineInsurance}
              className="min-h-[72px] text-base text-[var(--button-text)] bg-[var(--button-deal-bg)] shadow-[4px_4px_0_#000]"
            >
              No Thanks
            </UIButton>
          </div>
        </>
      )}

      {isPlayerTurn && (
        <>
          <div className="mb-1.5 text-xs font-black uppercase tracking-[0.08em] opacity-60">Your Move</div>
          <div className={`grid gap-2 sm:gap-3 ${canDouble ? "grid-cols-2" : "grid-cols-2"}`}>
            <UIButton
              onClick={onHit}
              className="min-h-[72px] text-xl text-white shadow-[4px_4px_0_#000]"
              style={{ background: "var(--btn-hit)" }}
            >
              Hit
            </UIButton>
            <UIButton
              onClick={onStand}
              className="min-h-[72px] text-xl text-white shadow-[4px_4px_0_#000]"
              style={{ background: "var(--btn-stand)" }}
            >
              Stand
            </UIButton>
            {canDouble && (
              <UIButton
                onClick={onDouble}
                className="col-span-2 min-h-[64px] text-lg text-white shadow-[4px_4px_0_#000]"
                style={{ background: "var(--btn-double)" }}
              >
                Double Down
              </UIButton>
            )}
          </div>
        </>
      )}

      {isDealerTurn && (
        <div className="flex min-h-[72px] items-center justify-center">
          <span className="text-base font-black uppercase tracking-[0.1em] opacity-80 text-zinc-100">
            Dealer&apos;s Turn&hellip;
          </span>
        </div>
      )}
    </div>
  );
}
