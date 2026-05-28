import { X } from "lucide-react";

export default function StatsModal({
  isOpen,
  onClose,
  handsWon = 0,
  handsLost = 0,
  handsPushed = 0,
  highestBankroll = 0,
  currentBankroll = 0,
}) {
  if (!isOpen) return null;

  const totalHands = handsWon + handsLost + handsPushed;
  const winRate = totalHands > 0 ? ((handsWon / totalHands) * 100).toFixed(1) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-modal-title"
    >
      <div
        className="relative w-full max-w-sm rounded border-[6px] border-black bg-white p-6 shadow-[8px_8px_0_#000] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close stats modal"
          className="absolute right-4 top-4 p-1 hover:opacity-60 transition-opacity"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Title */}
        <h2
          id="stats-modal-title"
          className="mb-6 text-2xl font-black uppercase tracking-[0.12em] text-black"
        >
          Session Stats
        </h2>

        {/* Stats Grid */}
        <div className="space-y-4">
          {/* Wins */}
          <div className="border-b-4 border-black pb-3">
            <div className="mb-1 text-xs font-black uppercase tracking-[0.08em] text-gray-600">
              Hands Won
            </div>
            <div className="text-3xl font-black text-black">{handsWon}</div>
          </div>

          {/* Losses */}
          <div className="border-b-4 border-black pb-3">
            <div className="mb-1 text-xs font-black uppercase tracking-[0.08em] text-gray-600">
              Hands Lost
            </div>
            <div className="text-3xl font-black text-black">{handsLost}</div>
          </div>

          {/* Pushes */}
          <div className="border-b-4 border-black pb-3">
            <div className="mb-1 text-xs font-black uppercase tracking-[0.08em] text-gray-600">
              Hands Pushed
            </div>
            <div className="text-3xl font-black text-black">{handsPushed}</div>
          </div>

          {/* Total Hands */}
          <div className="border-b-4 border-black pb-3">
            <div className="mb-1 text-xs font-black uppercase tracking-[0.08em] text-gray-600">
              Total Hands
            </div>
            <div className="text-3xl font-black text-black">{totalHands}</div>
          </div>

          {/* Win Rate */}
          <div className="border-b-4 border-black pb-3">
            <div className="mb-1 text-xs font-black uppercase tracking-[0.08em] text-gray-600">
              Win Rate
            </div>
            <div className="text-3xl font-black text-black">{winRate}%</div>
          </div>

          {/* Current Bankroll */}
          <div className="border-b-4 border-black pb-3">
            <div className="mb-1 text-xs font-black uppercase tracking-[0.08em] text-gray-600">
              Current Bankroll
            </div>
            <div className="text-3xl font-black text-black">${currentBankroll}</div>
          </div>

          {/* Highest Bankroll */}
          <div>
            <div className="mb-1 text-xs font-black uppercase tracking-[0.08em] text-gray-600">
              Highest Bankroll
            </div>
            <div className="text-3xl font-black text-black">${highestBankroll}</div>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full rounded border-4 border-black bg-black py-3 text-base font-black uppercase tracking-[0.08em] text-white shadow-[4px_4px_0_#333] transition-all hover:shadow-[2px_2px_0_#333] active:shadow-[0_0_0_#333]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
