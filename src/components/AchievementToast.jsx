import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACHIEVEMENTS } from "../utils/achievements";

export default function AchievementToast({ achievementId, onDismiss }) {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);

  useEffect(() => {
    if (!achievementId) return;
    const t = setTimeout(onDismiss, 4200);
    return () => clearTimeout(t);
  }, [achievementId, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.button
          key={achievementId}
          initial={{ opacity: 0, y: -32, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="fixed top-4 left-1/2 z-[300] flex -translate-x-1/2 cursor-pointer items-center gap-3 rounded-2xl border-2 border-yellow-400/70 bg-zinc-900/96 px-4 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-md"
          onClick={onDismiss}
          aria-label={`Achievement unlocked: ${achievement.title}. Tap to dismiss.`}
        >
          <span className="text-4xl leading-none" aria-hidden="true">{achievement.emoji}</span>
          <div className="text-left">
            <div className="text-[0.6rem] font-black uppercase tracking-[0.18em] text-yellow-400">
              Achievement Unlocked
            </div>
            <div className="text-base font-black text-white">{achievement.title}</div>
            <div className="text-xs text-zinc-400">{achievement.description}</div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
