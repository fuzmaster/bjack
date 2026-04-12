export default function Chip({ value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-14 w-14 rounded-full border-4 border-black font-black text-black transition ${
        active ? "-translate-y-1 shadow-[0_8px_0_#000]" : "shadow-[0_4px_0_#000] hover:-translate-y-0.5"
      }`}
      style={{ background: active ? "#f2f2f2" : "#8f8f8f" }}
    >
      <span className="text-sm">${value}</span>
    </button>
  );
}
