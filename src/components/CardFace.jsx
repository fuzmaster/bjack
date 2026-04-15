import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getSuitName, isRedSuit } from "../game/blackjack";
import SuitIcon from "./SuitIcon";

const MotionDiv = motion.div;

function FaceMark({ rank, suit }) {
  const crown = rank === "K";
  const queen = rank === "Q";
  const jack = rank === "J";

  return (
    <div className="relative" style={{ width: "var(--facemark-size)", height: "var(--facemark-size)" }} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="h-full w-full fill-current">
        <path d="M50 8 88 28v44L50 92 12 72V28L50 8Z" opacity="0.22" />
        <path d="M50 16 80 32v36L50 84 20 68V32L50 16Z" opacity="0.38" />
        {crown ? <path d="M23 58h54l-5 13H28l-5-13Zm5-20 12 10 10-16 10 16 12-10 4 20H24l4-20Z" /> : null}
        {queen ? <circle cx="50" cy="50" r="19" opacity="0.95" /> : null}
        {queen ? <path d="M38 55 50 35l12 20-12 13-12-13Z" fill="var(--card-front-bg)" /> : null}
        {jack ? <path d="M28 35h44v10H55v29H45V45H28V35Z" /> : null}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <SuitIcon suit={suit} style={{ width: "var(--facemark-center-pip)", height: "var(--facemark-center-pip)" }} />
      </div>
      <SuitIcon suit={suit} style={{ width: "var(--card-pip-sm)", height: "var(--card-pip-sm)" }} className="absolute left-1.5 top-1.5 opacity-80" />
      <SuitIcon suit={suit} style={{ width: "var(--card-pip-sm)", height: "var(--card-pip-sm)" }} className="absolute bottom-1.5 right-1.5 opacity-80" />
    </div>
  );
}

export default function CardFace({ card, hidden = false, reveal = false, index = 0 }) {
  const reduceMotion = useReducedMotion();
  const suitClass = isRedSuit(card.suit) ? "text-red-600" : "text-zinc-900";
  const suitName = getSuitName(card.suit);
  const ariaLabel = `${card.rank} of ${suitName}`;
  const isFaceCard = card.rank === "J" || card.rank === "Q" || card.rank === "K";

  return (
    <MotionDiv
      layout="position"
      initial={reduceMotion ? false : { opacity: 0, x: 120, y: -42, rotate: -6, scale: 0.95 }}
      animate={reduceMotion ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 } : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.96 }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 250, damping: 24, delay: index * 0.03 }}
      className="relative"
      style={{
        width: "var(--card-w)",
        height: "var(--card-h)",
        transformStyle: "preserve-3d",
      }}
      role="img"
      aria-label={hidden && !reveal ? "Face-down card" : ariaLabel}
    >
      <AnimatePresence mode="wait">
        {hidden && !reveal ? (
          <MotionDiv
            key="back"
            initial={reduceMotion ? false : { rotateY: 0 }}
            animate={reduceMotion ? { rotateY: 0, opacity: 1 } : { rotateY: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { rotateY: 90, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.13 }}
            className="absolute inset-0 border-4 border-black bg-[var(--card-back-bg)]"
          >
            <div className="absolute inset-2 border-2 border-black bg-[var(--card-back-inner-bg)]" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-[var(--card-back-text)]" aria-hidden="true">?</div>
          </MotionDiv>
        ) : (
          <MotionDiv
            key="front"
            initial={reduceMotion ? false : { rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.13 }}
            className="absolute inset-0 border-4 border-black bg-[var(--card-front-bg)] text-[var(--card-front-text)] shadow-[6px_6px_0_#000]"
          >
            <div className={`absolute left-1.5 top-1.5 flex flex-col leading-none ${suitClass}`}>
              <span className="font-black leading-none" style={{ fontSize: "var(--card-rank-size)" }} aria-hidden="true">{card.rank}</span>
              <SuitIcon suit={card.suit} style={{ width: "var(--card-pip-sm)", height: "var(--card-pip-sm)" }} />
            </div>
            <div className={`absolute inset-0 flex items-center justify-center ${suitClass}`} aria-hidden="true">
              {isFaceCard ? <FaceMark rank={card.rank} suit={card.suit} /> : <SuitIcon suit={card.suit} style={{ width: "var(--card-pip-lg)", height: "var(--card-pip-lg)" }} />}
            </div>
            <div className={`absolute bottom-1.5 right-1.5 flex rotate-180 flex-col leading-none ${suitClass}`}>
              <span className="font-black leading-none" style={{ fontSize: "var(--card-rank-size)" }} aria-hidden="true">{card.rank}</span>
              <SuitIcon suit={card.suit} style={{ width: "var(--card-pip-sm)", height: "var(--card-pip-sm)" }} />
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}
