/**
 * UIButton — supports both the new brass tone system and legacy className overrides.
 *
 * Usage with tone (new):
 *   <UIButton tone="hit">Hit</UIButton>
 *   <UIButton tone="stand">Stand</UIButton>
 *   <UIButton tone="double">Double Down</UIButton>
 *   <UIButton tone="deal">Deal</UIButton>
 *   <UIButton tone="ghost">Cancel</UIButton>
 *
 * Usage legacy (still works for TopBar / BetControls):
 *   <UIButton className="bg-[var(--reset-button-bg)] text-[var(--reset-button-text)]">Reset</UIButton>
 */
export default function UIButton({ children, className = "", tone = null, ...props }) {
  if (tone) {
    return (
      <button
        {...props}
        className={`v21-btn tone-${tone} ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      {...props}
      className={`ui-button inline-flex min-h-[48px] select-none items-center justify-center px-4 py-2.5 text-sm disabled:cursor-not-allowed touch-manipulation ${className}`}
    >
      {children}
    </button>
  );
}
