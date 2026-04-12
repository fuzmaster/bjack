export default function StatBlock({ label, value, icon }) {
  return (
    <div className="min-w-[170px] border-4 border-black bg-[#e6e6e6] p-3 text-black shadow-[6px_6px_0_#000] lg:min-w-[190px]">
      <div className="flex items-center gap-2 xl:gap-3">
        <div className="shrink-0 border-2 border-black bg-[#bfbfbf] p-2">{icon}</div>
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-[0.08em] text-black/75">{label}</div>
          <div className="text-3xl font-black leading-none md:text-[2rem] xl:text-4xl">{value}</div>
        </div>
      </div>
    </div>
  );
}
