export default function UIButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-[56px] select-none items-center justify-center rounded-none border-4 border-black px-4 py-3 text-base font-black uppercase tracking-[0.11em] transition active:translate-x-[2px] active:translate-y-[2px] hover:brightness-105 disabled:cursor-not-allowed disabled:border-[#1a1a1a] disabled:bg-[#7f7f7f] disabled:text-[#2f2f2f] disabled:shadow-[2px_2px_0_#000] disabled:opacity-100 touch-manipulation ${className}`}
    >
      {children}
    </button>
  );
}
