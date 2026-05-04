export default function UIButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`ui-button inline-flex min-h-[64px] select-none items-center justify-center rounded-none border-4 border-black px-4 py-3 text-lg font-black uppercase tracking-[0.08em] transition active:translate-x-[2px] active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-100 touch-manipulation ${className}`}
    >
      {children}
    </button>
  );
}
