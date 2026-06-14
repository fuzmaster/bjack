import { memo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getSuitName, isRedSuit } from "../game/blackjack";
import SuitIcon from "./SuitIcon";

const MotionDiv = motion.div;

/**
 * Pip-layout grid for number cards 2–10.
 * Traditional positions: pips are placed on a 3-col × 7-row grid (cells "a1"…"c7"),
 * mirroring how real playing cards arrange suit symbols. Bottom-half pips rotate 180°.
 */
const PIP_LAYOUT = {
  2:  [["b1"], ["b7"]],
  3:  [["b1", "b4"], ["b7"]],
  4:  [["a1", "c1"], ["a7", "c7"]],
  5:  [["a1", "c1", "b4"], ["a7", "c7"]],
  6:  [["a1", "c1", "a4", "c4"], ["a7", "c7"]],
  7:  [["a1", "c1", "a4", "c4", "b2"], ["a7", "c7"]],
  8:  [["a1", "c1", "a4", "c4", "b2"], ["a7", "c7", "b6"]],
  9:  [["a1", "c1", "a3", "c3", "b4"], ["a5", "c5", "a7", "c7"]],
  10: [["a1", "c1", "a3", "c3", "b2"], ["a5", "c5", "a7", "c7", "b6"]],
};

function CardPips({ rank, suit }) {
  const layout = PIP_LAYOUT[rank];
  if (!layout) return null;
  const [top, bottom] = layout;
  // Map cell IDs (e.g. "a1") to grid positions
  // Columns: a=left, b=center, c=right (10%/50%/90%)
  // Rows 1-7 map vertically from top (12%) to bottom (88%)
  const cellToPos = (cell) => {
    const col = cell[0]; // a|b|c
    const row = parseInt(cell.slice(1), 10); // 1-7
    const left = col === "a" ? "22%" : col === "c" ? "78%" : "50%";
    const top = `${12 + ((row - 1) * 76) / 6}%`;
    return { left, top };
  };
  return (
    <div className="v21-card-pips" aria-hidden="true">
      {top.map((cell) => {
        const { left, top: t } = cellToPos(cell);
        return (
          <div key={`top-${cell}`} className="pip" style={{ left, top: t, transform: "translate(-50%, -50%)" }}>
            <SuitIcon suit={suit} style={{ width: "100%", height: "100%" }} />
          </div>
        );
      })}
      {bottom.map((cell) => {
        const { left, top: t } = cellToPos(cell);
        return (
          <div key={`bot-${cell}`} className="pip" style={{ left, top: t, transform: "translate(-50%, -50%) rotate(180deg)" }}>
            <SuitIcon suit={suit} style={{ width: "100%", height: "100%" }} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Ace centerpiece — oversized suit pip with brass ornamental frame.
 */
function AceCenterpiece({ suit, size }) {
  return (
    <div className="v21-card-center" aria-hidden="true">
      <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "0.5px solid oklch(0.66 0.10 64 / 0.50)",
            borderRadius: 6,
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "18%",
            border: "0.5px solid oklch(0.66 0.10 64 / 0.28)",
            borderRadius: 4,
            transform: "rotate(45deg)",
          }}
        />
        <SuitIcon suit={suit} style={{ width: "62%", height: "62%", position: "relative", zIndex: 1 }} />
      </div>
    </div>
  );
}

/**
 * Monogram face card centre — serif italic letter in a rotated-square frame.
 * Mirrors the design canvas's Monogram component from rd-primitives.jsx.
 */
function Monogram({ rank, suit, size }) {
  return (
    <div className="v21-card-center" aria-hidden="true">
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
            inset: Math.round(Number(size) * 0.12) || "12%",
            border: "0.5px solid oklch(0.66 0.10 64 / 0.22)",
            borderRadius: 4,
            transform: "rotate(45deg)",
          }}
        />
        {/* Serif italic rank letter */}
        <span
          className="v21-mono"
          style={{
            fontSize: `calc(${size} * 0.82)`,
            position: "relative",
            zIndex: 1,
            marginTop: `calc(${size} * -0.04)`,
          }}
        >
          {rank}
        </span>
        {/* Suit pip below the letter */}
        <div style={{ position: "absolute", bottom: `calc(${size} * 0.05)`, color: "currentColor" }}>
          <SuitIcon suit={suit} style={{ width: `calc(${size} * 0.24)`, height: `calc(${size} * 0.24)` }} />
        </div>
      </div>
    </div>
  );
}

/**
 * Card guilloché back — deep felt with brass filigree, nested diamonds,
 * cross hairlines, V monogram, and a hairline corner frame.
 */
function CardBack() {
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
        {/* Outer brass frame inset 4px from edge */}
        <rect x="3.5" y="3.5" width="93" height="133" rx="4"
              stroke="oklch(0.82 0.10 78 / 0.32)" fill="none" strokeWidth="0.4" />
        <rect x="5.5" y="5.5" width="89" height="129" rx="3"
              stroke="oklch(0.82 0.10 78 / 0.18)" fill="none" strokeWidth="0.3" />

        {/* Nested guilloché diamonds */}
        <g stroke="oklch(0.82 0.10 78 / 0.42)" fill="none" strokeWidth="0.5">
          <path d="M50 14 L88 70 L50 126 L12 70 Z" />
          <path d="M50 22 L80 70 L50 118 L20 70 Z" />
          <path d="M50 30 L72 70 L50 110 L28 70 Z" />
          <path d="M50 40 L64 70 L50 100 L36 70 Z" />
        </g>

        {/* Cross hairlines */}
        <g stroke="oklch(0.82 0.10 78 / 0.16)" strokeWidth="0.3">
          <line x1="12" y1="70" x2="88" y2="70" />
          <line x1="50" y1="14" x2="50" y2="126" />
        </g>

        {/* Small starburst rays inside the inner diamond */}
        <g stroke="oklch(0.82 0.10 78 / 0.22)" strokeWidth="0.25">
          <line x1="50" y1="55" x2="50" y2="62" />
          <line x1="50" y1="78" x2="50" y2="85" />
          <line x1="42" y1="70" x2="46" y2="70" />
          <line x1="54" y1="70" x2="58" y2="70" />
        </g>

        {/* Centre brass medallion */}
        <circle cx="50" cy="70" r="9" fill="oklch(0.18 calc(var(--felt-c) * 0.5) var(--felt-h) / 0.85)"
                stroke="oklch(0.82 0.10 78 / 0.55)" strokeWidth="0.4" />

        {/* "V" monogram */}
        <text x="50" y="75.5" textAnchor="middle"
              fontFamily="Fraunces, Georgia, serif" fontStyle="italic" fontWeight="500"
              fontSize="11" fill="oklch(0.92 0.06 78 / 0.95)">V</text>

        {/* Tiny corner ornaments */}
        <g fill="oklch(0.82 0.10 78 / 0.40)">
          <circle cx="11" cy="11" r="0.9" />
          <circle cx="89" cy="11" r="0.9" />
          <circle cx="11" cy="129" r="0.9" />
          <circle cx="89" cy="129" r="0.9" />
        </g>
      </svg>
    </div>
  );
}

function CardFace({ card, hidden = false, reveal = false, index = 0 }) {
  const reduceMotion = useReducedMotion();
  const isRed = isRedSuit(card.suit);
  const suitName = getSuitName(card.suit);
  const ariaLabel = `${card.rank} of ${suitName}`;
  const isFaceCard = card.rank === "J" || card.rank === "Q" || card.rank === "K";

  return (
    <MotionDiv
      initial={reduceMotion ? false : { opacity: 0, y: -44, scale: 0.88, rotate: index % 2 === 0 ? -8 : 8 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: 0,
        transition: reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 600, damping: 26, mass: 0.28, delay: index * 0.028 },
      }}
      exit={{
        opacity: 0,
        scale: 0.94,
        transition: { duration: reduceMotion ? 0 : 0.07 },
      }}
      className="relative shrink-0"
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
            exit={reduceMotion ? { opacity: 0 } : { scaleX: 0, opacity: 0, transition: { duration: 0.07, ease: "easeIn" } }}
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
            transition={{ duration: reduceMotion ? 0 : 0.09, ease: "easeOut" }}
            className={`v21-card ${isRed ? "red" : ""}`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            {/* Top-left corner */}
            <div className="v21-card-corner tl" style={{ fontSize: "var(--card-rank-size)" }}>
              <span className="v21-mono" style={{ fontSize: "var(--card-rank-size)" }} aria-hidden="true">
                {card.rank}
              </span>
              <SuitIcon suit={card.suit} style={{ width: "var(--card-pip-sm)", height: "var(--card-pip-sm)" }} />
            </div>

            {/* Centre — face cards get monogram, Ace gets ornamented centerpiece, 2-10 get traditional pip layouts */}
            {isFaceCard ? (
              <Monogram rank={card.rank} suit={card.suit} size="calc(var(--card-w) * 0.58)" />
            ) : card.rank === "A" ? (
              <AceCenterpiece suit={card.suit} size="calc(var(--card-w) * 0.50)" />
            ) : (
              <CardPips rank={Number(card.rank) || card.rank} suit={card.suit} />
            )}

            {/* Bottom-right corner (rotated 180°) */}
            <div className="v21-card-corner br" style={{ fontSize: "var(--card-rank-size)" }}>
              <span className="v21-mono" style={{ fontSize: "var(--card-rank-size)" }} aria-hidden="true">
                {card.rank}
              </span>
              <SuitIcon suit={card.suit} style={{ width: "var(--card-pip-sm)", height: "var(--card-pip-sm)" }} />
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}

export default memo(CardFace, (prev, next) =>
  prev.card === next.card &&
  prev.hidden === next.hidden &&
  prev.reveal === next.reveal &&
  prev.index === next.index
);
