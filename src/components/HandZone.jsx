import { AnimatePresence } from "framer-motion";
import CardFace from "./CardFace";

export default function HandZone({ title, total, hand, hiddenSecond = false, revealHidden = false, meta = null }) {
  return (
    <section className="mx-auto w-full max-w-[44rem] px-2 py-3 sm:px-3 sm:py-4" aria-label={`${title} hand`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-[0.08em] text-[var(--hand-title)]">{title}</div>
          <div className="numeric-tabular text-3xl font-black leading-none text-[var(--hand-total)] sm:text-4xl">{total}</div>
        </div>
        {meta ? <div className="flex shrink-0 items-start">{meta}</div> : null}
      </div>
      <div className="flex flex-wrap items-start justify-center gap-2 sm:gap-3" style={{ minHeight: "var(--card-h)" }}>
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
        {hand.length === 0 ? (
          <div className="flex w-full items-center justify-center py-4 text-sm font-semibold text-[var(--hand-empty)]">Waiting for deal</div>
        ) : null}
      </div>
    </section>
  );
}
