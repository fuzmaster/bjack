export default function StatBlock({ label, value, icon }) {
  return (
    <div className="surface-stat w-full p-3" style={{ color: "var(--panel-text)" }}>
      <div className="flex items-center gap-2 xl:gap-3">
        <div className="surface-stat-icon shrink-0 p-2" style={{ color: "var(--brass-300)" }}>
          {icon}
        </div>
        <div className="min-w-0">
          <div
            className="text-xs font-bold uppercase tracking-[0.10em]"
            style={{ color: "var(--panel-muted)", fontFamily: "var(--font-sans)" }}
          >
            {label}
          </div>
          <div
            className="numeric-tabular leading-none"
            style={{
              fontSize: "clamp(1.4rem, 4.5vw, 2rem)",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 500,
              color: "var(--page-text)",
            }}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}
