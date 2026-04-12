import { useCallback, useEffect, useRef } from "react";

export function useGameAudio() {
  const audioRef = useRef({});

  useEffect(() => {
    audioRef.current = {
      deal: new Audio("/sfx/card-deal.ogg"),
      flip: new Audio("/sfx/card-flip.ogg"),
      chip: new Audio("/sfx/chip-click.ogg"),
      win: new Audio("/sfx/win.wav"),
      lose: new Audio("/sfx/lose.wav"),
      button: new Audio("/sfx/ui-click.wav"),
    };

    Object.values(audioRef.current).forEach((audio) => {
      audio.preload = "auto";
      audio.volume = 0.4;
    });

    return () => {
      Object.values(audioRef.current).forEach((audio) => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // Ignore browser cleanup errors.
        }
      });
    };
  }, []);

  const play = useCallback((name, volume = 0.4) => {
    const sound = audioRef.current[name];
    if (!sound) return;

    try {
      const clone = sound.cloneNode();
      clone.volume = volume;
      const playback = clone.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch((error) => {
          console.warn(`Audio playback failed for ${name}`, error);
        });
      }
    } catch (error) {
      console.warn(`Audio setup failed for ${name}`, error);
    }
  }, []);

  return { play };
}
