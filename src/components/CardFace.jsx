import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getSuitName, isRedSuit } from "../game/blackjack";
import SuitIcon from "./SuitIcon";

const MotionDiv = motion.div;

/**
 * Monogram face card centre — serif italic letter in a rotated-square frame.
 * Mirrors the design canvas's Monogram component from rd-primitives.jsx.
 */
function Monogram({ rank, suit, size }) {
  return (
    <div
      className="v21-card-center"
      aria-hidden="true"
    >
      <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
        {/* Outer brass-tinted diamond frame */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "0.5px solid oklch(0.66 0.10 64 / 0.40)",
            borderRadius: 4,
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: Math.round(size * 0.12),
            border: "0.5px solid oklch(0.66 0.10 64 / 0.22)",
            borderRadius: 4,
            transform: "rotate(45deg)",
          }}
        />
        {/* Serif italic rank letter */}
        <span
          className="v21-mono"
          style={{
            fontSize: Math.round(size * 0.84),
            position: "relative",
            zIndex: 1,
            marginTop: -Math.round(size * 0.04),
          }}
        >
          {rank}
        </span>
        {/* Suit pip below the letter */}
        <div style={{ position: "absolute", bottom: Math.round(size * 0.05), color: "currentColor" }}>
          <SuitIcon suit={suit} style={{ width: Math.round(size * 0.24), height: Math.round(size * 0.24) }} />
        </div>
      </div>
    </div>
  );
}

/**
 * Card guilloché back — deep felt with diamond lines and the "V" monogram.
 */
function CardBack({ width, height }) {
  return (
    <div
      className="v21-card-back"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <svg
        viewBox="0 0 100 140"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        aria-hidden="true"
      >
        {/* Guilloché diamond lines */}
        <g stroke="oklch(0.82 0.10 78 / 0.45)" fill="none" strokeWidth="0.55">
          <path d="M50 26 L78 70 L50 114 L22 70 Z" />
          <path d="M50 36 L70 70 L50 104 L30 70 Z" />
          <circle cx="50" cy="70" r="7.5" />
        </g>
        {/* "V" monogram */}
        <text
          x="50"
          y="76"
          textAnchor="middle"
          fontFamily="Fraunces, Georgia, serif"
          fontStyle="italic"
          fontWeight="500"
          fontSize="13"
          fill="oklch(0.92 0.06 78 / 0.90)"
        >
          V
        </text>
      </svg>
    </div>
  );
}

export default function CardFace({ card, hidden = false, reveal = false, index = 0 }) {
  const reduceMotion = useReducedMotion();
  const isRed = isRedSuit(card.suit);
  const suitName = getSuitName(card.suit);
  const ariaLabel = `${card.rank} of ${suitName}`;
  const isFaceCard = card.rank === "J" || card.rank === "Q" || card.rank === "K";

  const rankSize = "var(--card-rank-size)";
  const pipSmSize = "var(--card-pip-sm)";
  const pipLgSize = "var(--card-pip-lg)";
  const monoSize = `calc(var(--card-w) * 0.58)`;

  return (
    <MotionDiv
      initial={reduceMotion ? false : { opacity: 0, y: -36, scale: 0.94 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 380, damping: 30, mass: 0.6, delay: index * 0.04 },
      }}
      exit={{
        opacity: 0,
        scale: 0.92,
        transition: { duration: 0.10 },
      }}
      className="relative shrink-0"
      style={{
        width: "var(--card-w)",
        height: "var(--card-h)",
      }}
      exit={{
        opacity: 0, scale: 0.9,
        // Fast exit, no stagger — cards leave simultaneously
        transition: { duration: reduceMotion ? 0 : 0.1 },
      }}
      className="relative"
      style={{ width: "var(--card-w)", height: "var(--card-h)" }}
      role="img"
      aria-label={hidden && !reveal ? "Face-down card" : ariaLabel}
    >
      <AnimatePresence mode="wait" initial={false}>
        {hidden && !reveal ? (
          <MotionDiv
            key="back"
            initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { scaleX: 0, opacity: 0, transition: { duration: 0.10, ease: "easeIn" } }}
            transition={{ duration: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <CardBack />
          </MotionDiv>
        ) : (
          <MotionDiv
            key="front"
            initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
            className={`v21-card ${isRed ? "red" : ""}`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            {/* Top-left corner */}
            <div className="v21-card-corner tl" style={{ fontSize: rankSize }}>
              <span className="v21-mono" style={{ fontSize: rankSize }} aria-hidden="true">
                {card.rank}
              </span>
              <SuitIcon suit={card.suit} style={{ width: pipSmSize, height: pipSmSize }} />
            </div>

            {/* Centre — monogram for face cards, single pip for others */}
            {isFaceCard ? (
              <Monogram rank={card.rank} suit={card.suit} size={`calc(var(--card-w) * 0.58)`} />
            ) : (
              <div className="v21-card-center" aria-hidden="true">
                <SuitIcon suit={card.suit} style={{ width: pipLgSize, height: pipLgSize }} />
              </div>
            )}

            {/* Bottom-right corner (rotated) */}
            <div className="v21-card-corner br" style={{ fontSize: rankSize }}>
              <span className="v21-mono" style={{ fontSize: rankSize }} aria-hidden="true">
                {card.rank}
              </span>
              <SuitIcon suit={card.suit} style={{ width: pipSmSize, height: pipSmSize }} />
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}
