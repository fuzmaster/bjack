export default function Chip({ value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active || undefined}
      className="chip-button relative h-14 w-14 rounded-full font-bold transition"
      style={{
        background: active
          ? "linear-gradient(135deg, var(--brass-300), var(--brass-400))"
          : "oklch(0.22 0.012 52 / 0.85)",
        color: active ? "var(--ink-900)" : "var(--brass-200)",
        border: active
          ? "1px solid var(--brass-200)"
          : "1px solid oklch(0.82 0.10 78 / 0.22)",
        boxShadow: active
          ? "0 4px 12px oklch(0.66 0.11 64 / 0.36), inset 0 1px 0 oklch(1 0 0 / 0.24)"
          : "0 2px 6px oklch(0 0 0 / 0.20)",
        transform: active ? "translateY(-3px)" : "none",
        transition: "transform 120ms ease, box-shadow 120ms ease, background 120ms ease",
        fontFamily: "var(--font-sans)",
      }}
    >
      <span className="text-sm">${value}</span>
    </button>
  );
}
