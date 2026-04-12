import { AnimatePresence } from "framer-motion";
import CardFace from "./CardFace";

export default function HandZone({ title, total, hand, hiddenSecond = false, revealHidden = false }) {
  const hasCards = hand.length > 0;

  return (
    <div className="border-4 border-black bg-[rgba(28,29,33,0.9)] p-3 sm:p-4">
      <div className="mb-2 flex items-start justify-between gap-3 sm:mb-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.08em] text-[#d4d4d4]">{title}</div>
          <div className="text-4xl font-black leading-none text-[#f5f5f5]">{total}</div>
        </div>
      </div>
      <div className={`flex flex-wrap gap-3 ${hasCards ? "min-h-[168px] sm:min-h-[220px]" : "min-h-[112px] sm:min-h-[132px]"}`}>
        <AnimatePresence initial={false}>
          {hand.map((card, idx) => (
            <CardFace
              key={card.id}
              card={card}
              hidden={hiddenSecond && idx === 1}
              reveal={revealHidden}
              index={idx}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
