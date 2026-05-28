import { Wand2, TrendingUp } from "lucide-react";
import UIButton from "./UIButton";

export default function ActionPanel({
  gameState,
  onDeal,
  onNext,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onRescue,
  onTakeInsurance,
  onDeclineInsurance,
  insuranceCost = 0,
  canDouble,
  canSplit,
  dealDisabled,
  bankroll,
  bet,
  compact = false,
}) {
  const isReady = gameState === "ready";
  const isRoundOver = gameState === "round-over";
  const isPlayerTurn = gameState === "player-turn";
  const isDealerTurn = gameState === "dealer-turn";
  const isInsurance = gameState === "insurance";
  const isBankrupt = isRoundOver && bankroll === 0 && bet === 0;

  const labelClass = `mb-3 font-bold uppercase tracking-[0.10em] text-[var(--hand-title)] ${compact ? "text-xs" : "text-sm"}`;
  const btnHeight = compact ? "min-h-[44px]" : "min-h-[52px]";

  return (
    <div className="control-cluster p-1 sm:p-2">
      {(isReady || isRoundOver) && (
        <>
          <div className={labelClass}>
            {isBankrupt ? "Bankrupt" : isRoundOver ? "Round Over" : "Table Actions"}
          </div>
          {isBankrupt ? (
            <UIButton
              tone="deal"
              onClick={onRescue}
              className={`${btnHeight} w-full`}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Get $500 Chips
            </UIButton>
          ) : (
            <UIButton
              tone="deal"
              onClick={isRoundOver ? onNext : onDeal}
              disabled={dealDisabled}
              className={`${btnHeight} w-full`}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {isRoundOver ? "Next Hand" : "Deal"}
            </UIButton>
          )}
        </>
      )}

      {isInsurance && (
        <>
          <div className="mb-2 text-center">
            <div
              className="text-xs font-bold uppercase tracking-[0.10em]"
              style={{ color: "var(--hand-title)", fontFamily: "var(--font-sans)" }}
            >
              Dealer Shows Ace
            </div>
            <div
              className="mt-0.5 text-[0.65rem]"
              style={{ color: "var(--panel-muted)", fontFamily: "var(--font-sans)" }}
            >
              Insurance pays 2 to 1 if dealer has blackjack
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <UIButton
              tone="hit"
              onClick={onTakeInsurance}
              className={`${btnHeight} flex-col`}
            >
              <span>Take Insurance</span>
              <span className="mt-0.5 text-xs opacity-75">${insuranceCost}</span>
            </UIButton>
            <UIButton
              tone="ghost"
              onClick={onDeclineInsurance}
              className={`${btnHeight}`}
            >
              No Thanks
            </UIButton>
          </div>
        </>
      )}

      {isPlayerTurn && (
        <>
          <div className={labelClass}>Your Move</div>
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            <UIButton
              tone="hit"
              onClick={onHit}
              className={`${btnHeight}`}
              title="Hit (H / swipe up)"
            >
              Hit
            </UIButton>
            <UIButton
              tone="stand"
              onClick={onStand}
              className={`${btnHeight}`}
              title="Stand (S / swipe left)"
            >
              Stand
            </UIButton>
            {canDouble && (
              <UIButton
                tone="double"
                onClick={onDouble}
                className={`col-span-2 ${btnHeight}`}
                title="Double Down (D / swipe right)"
              >
                Double Down
              </UIButton>
            )}
            {canSplit && (
              <UIButton
                tone="double"
                onClick={onSplit}
                className={`col-span-2 ${btnHeight}`}
              >
                Split Pair
              </UIButton>
            )}
          </div>
        </>
      )}

      {isDealerTurn && (
        <div className="flex min-h-[44px] items-center justify-center">
          <span
            className="text-sm font-semibold uppercase tracking-[0.12em] opacity-60"
            style={{ color: "var(--hand-title)", fontFamily: "var(--font-sans)" }}
          >
            Dealer&apos;s Turn&hellip;
          </span>
        </div>
      )}
    </div>
  );
}
