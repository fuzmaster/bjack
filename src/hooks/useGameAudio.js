import { useCallback, useEffect, useRef } from "react";

export function useGameAudio() {
  const audioRef = useRef({});
  const unlockedRef = useRef(false);
  const volumeMapRef = useRef({});

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

    volumeMapRef.current = {
      deal: 0.4,
      flip: 0.4,
      chip: 0.4,
      win: 0.4,
      lose: 0.4,
      button: 0.4,
    };

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

  const unlockAudio = useCallback(() => {
    if (unlockedRef.current) return;

    unlockedRef.current = true;
    Object.entries(audioRef.current).forEach(([name, audio]) => {
      const defaultVolume = volumeMapRef.current[name] ?? 0.4;
      try {
        audio.volume = 0;
        const playback = audio.play();
        if (playback && typeof playback.then === "function") {
          playback
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.volume = defaultVolume;
            })
            .catch(() => {
              audio.volume = defaultVolume;
            });
        } else {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = defaultVolume;
        }
      } catch {
        audio.volume = defaultVolume;
      }
    });
  }, []);

  const play = useCallback((name, volume = 0.4) => {
    const sound = audioRef.current[name];
    if (!sound) return;

    volumeMapRef.current[name] = volume;

    try {
      sound.pause();
      sound.currentTime = 0;
      sound.volume = volume;
      const playback = sound.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch((error) => {
          console.error(`Audio playback failed for ${name}`, error);
        });
      }
    } catch (error) {
      console.error(`Audio setup failed for ${name}`, error);
    }
  }, []);

  return { play, unlockAudio };
}
