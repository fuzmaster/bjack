import { AnimatePresence, motion } from "framer-motion";
import { isRedSuit } from "../game/blackjack";

const MotionDiv = motion.div;

export default function CardFace({ card, hidden = false, reveal = false, index = 0 }) {
  const suitClass = isRedSuit(card.suit) ? "text-red-600" : "text-zinc-900";

  return (
    <MotionDiv
      layout="position"
      initial={{ opacity: 0, x: 120, y: -42, rotate: -6, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 250, damping: 24, delay: index * 0.03 }}
      className="relative h-40 w-28 sm:h-48 sm:w-36"
      style={{ transformStyle: "preserve-3d" }}
    >
      <AnimatePresence mode="wait">
        {hidden && !reveal ? (
          <MotionDiv
            key="back"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.13 }}
            className="absolute inset-0 border-4 border-black bg-[#7cb7d8]"
          >
            <div className="absolute inset-2 border-2 border-black bg-[#e7f2f7]" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-black">?</div>
          </MotionDiv>
        ) : (
          <MotionDiv
            key="front"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.13 }}
            className="absolute inset-0 border-4 border-black bg-white text-zinc-900 shadow-[6px_6px_0_#000]"
          >
            <div className={`absolute left-2 top-2 flex flex-col leading-none ${suitClass}`}>
              <span className="text-lg font-black">{card.rank}</span>
              <span className="text-sm">{card.suit}</span>
            </div>
            <div className={`absolute inset-0 flex items-center justify-center text-5xl font-black ${suitClass}`}>
              {card.suit}
            </div>
            <div className={`absolute bottom-2 right-2 flex rotate-180 flex-col leading-none ${suitClass}`}>
              <span className="text-lg font-black">{card.rank}</span>
              <span className="text-sm">{card.suit}</span>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}
