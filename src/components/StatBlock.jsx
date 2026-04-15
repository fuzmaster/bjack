export default function StatBlock({ label, value, icon }) {
  return (
    <div className="surface-stat w-full p-3 text-[var(--panel-text)]">
      <div className="flex items-center gap-2 xl:gap-3">
        <div className="surface-stat-icon shrink-0 p-2">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-black uppercase tracking-[0.07em] text-[var(--panel-muted)]">{label}</div>
          <div className="numeric-tabular text-[1.7rem] font-black leading-none sm:text-3xl md:text-[2rem] xl:text-[2.1rem]">{value}</div>
        </div>
      </div>
    </div>
  );
}
