import { AnimatePresence, motion } from "framer-motion";
import CardFace from "./CardFace";

function HandGroup({
  cards,
  total,
  hiddenSecond,
  revealHidden,
  isActive,
  label,
  isSplitView,
}) {
  const cardCount = Math.max(1, cards.length);
  const rowStyle = {
    "--cards-in-hand": String(cardCount),
    "--card-gap": isSplitView ? "0.35rem" : "0.45rem",
    "--card-w": isSplitView
      ? "clamp(38px, calc((100% - (var(--cards-in-hand) - 1) * var(--card-gap)) / var(--cards-in-hand)), 90px)"
      : "clamp(52px, calc((100% - (var(--cards-in-hand) - 1) * var(--card-gap)) / var(--cards-in-hand)), 92px)",
  };

  return (
    <div
      className={`w-full min-w-0 rounded-lg p-2 sm:p-3 ${
        isActive
          ? "border border-[oklch(0.66_0.11_64_/_0.28)] bg-black/8"
          : "border border-transparent"
      }`}
      aria-current={isActive ? "true" : undefined}
    >
      {label ? (
        <div className="mb-2 flex items-center justify-between">
          <span
            className="text-[0.62rem] font-bold uppercase tracking-[0.12em]"
            style={{ color: "var(--hand-title)", fontFamily: "var(--font-sans)" }}
          >
            {label}
          </span>
          <span
            className="numeric-tabular text-lg font-bold"
            style={{ color: "var(--hand-total)", fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            {total}
          </span>
        </div>
      ) : null}
      <div
        className="flex min-w-0 flex-nowrap items-start justify-center overflow-hidden"
        style={{ minHeight: "var(--card-h)", gap: "var(--card-gap)", ...rowStyle }}
      >
        <AnimatePresence initial={false}>
          {cards.map((card, idx) => (
            <CardFace
              key={card.id}
              card={card}
              hidden={hiddenSecond && idx === 1}
              reveal={revealHidden}
              index={idx}
            />
          ))}
        </AnimatePresence>
        {cards.length === 0 ? (
          <div
            className="flex w-full items-center justify-center py-4 text-sm font-medium"
            style={{ color: "var(--hand-empty)", fontFamily: "var(--font-sans)" }}
          >
            Waiting for deal
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function HandZone({
  title,
  total,
  hand,
  hands = null,
  handTotals = null,
  activeHandIndex = 0,
  hiddenSecond = false,
  revealHidden = false,
  meta = null,
  result = null,   // "win" | "loss" | null
}) {
  const resolvedHands = hands ?? [hand ?? []];
  const resolvedTotals = handTotals ?? [total];
  const isSplitView = resolvedHands.length > 1;

  // Shake on loss, settle on win/null
  const shakeVariants = {
    loss: { x: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0], transition: { duration: 0.55, ease: "easeOut" } },
    win:  { x: 0, transition: { duration: 0.2 } },
    idle: { x: 0 },
  };

  return (
    <motion.section
      className="v21-hand-zone mx-auto w-full max-w-[44rem] px-2 py-2 sm:px-3 sm:py-3"
      aria-label={`${title} hand`}
      data-result={result ?? undefined}
      animate={result === "loss" ? "loss" : result === "win" ? "win" : "idle"}
      variants={shakeVariants}
    >
      <div className="mb-1.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className="text-[0.62rem] font-bold uppercase tracking-[0.12em]"
            style={{ color: "var(--hand-title)", fontFamily: "var(--font-sans)" }}
          >
            {title}
          </div>
          {/* Score pops when value changes */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={total}
              className="numeric-tabular leading-none"
              initial={{ scale: 1.35, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22, mass: 0.4 }}
              style={{
                fontSize: "clamp(1.8rem, 7vw, 2.8rem)",
                color: "var(--hand-total)",
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 500,
                display: "inline-block",
              }}
            >
              {total}
            </motion.div>
          </AnimatePresence>
        </div>
        {meta ? <div className="flex shrink-0 items-start">{meta}</div> : null}
      </div>
      <div className={isSplitView ? "grid grid-cols-1 gap-2 md:grid-cols-2" : ""}>
        {resolvedHands.map((cards, idx) => (
          <HandGroup
            key={`${title}-hand-${idx}`}
            cards={cards}
            total={resolvedTotals[idx] ?? "--"}
            hiddenSecond={hiddenSecond}
            revealHidden={revealHidden}
            isActive={!isSplitView || idx === activeHandIndex}
            label={isSplitView ? `Hand ${idx + 1}` : null}
            isSplitView={isSplitView}
          />
        ))}
      </div>
    </motion.section>
  );
}
