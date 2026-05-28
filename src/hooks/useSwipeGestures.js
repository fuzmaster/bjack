import { useEffect, useRef } from "react";

/**
 * Detects directional swipe gestures on the window.
 *
 * Up   → onHit
 * Left → onStand
 * Right→ onDouble (optional)
 *
 * Only fires when `enabled` is true and the swipe is fast enough
 * (< 500ms) and long enough (≥ 44px).
 */
export function useSwipeGestures({ onHit, onStand, onDouble, enabled = true }) {
  const startRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e) => {
      const t = e.touches[0];
      startRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    };

    const onTouchEnd = (e) => {
      if (!startRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startRef.current.x;
      const dy = t.clientY - startRef.current.y;
      const dt = Date.now() - startRef.current.time;
      startRef.current = null;

      if (dt > 500) return;                         // too slow — drag, not swipe
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 44) return;                        // too short

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDy > absDx && dy < 0) {               // ↑ swipe up → Hit
        onHit?.();
      } else if (absDx > absDy && dx < 0) {        // ← swipe left → Stand
        onStand?.();
      } else if (absDx > absDy && dx > 0) {        // → swipe right → Double
        onDouble?.();
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, onHit, onStand, onDouble]);
}
