import { useCallback, useState } from "react";
import { unlockAchievement } from "../utils/achievements";

export function useAchievements() {
  const [queue, setQueue] = useState([]);

  const unlock = useCallback((id) => {
    if (unlockAchievement(id)) {
      setQueue((q) => [...q, id]);
    }
  }, []);

  const dismiss = useCallback(() => {
    setQueue((q) => q.slice(1));
  }, []);

  return { current: queue[0] ?? null, unlock, dismiss };
}
