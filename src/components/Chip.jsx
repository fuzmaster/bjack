export default function Chip({ value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active || undefined}
      className={`chip-button relative h-14 w-14 rounded-full border-4 border-black font-black text-[var(--chip-text)] transition ${
        active ? "-translate-y-1 shadow-[0_8px_0_#000]" : "shadow-[0_4px_0_#000]"
      }`}
      style={{ background: active ? "var(--chip-active-bg)" : "var(--chip-bg)" }}
    >
      <span className="text-sm">${value}</span>
    </button>
  );
}
