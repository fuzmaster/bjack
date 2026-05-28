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

    // Unlock with a single silent play on one element — iOS only needs one
    // user-gesture-gated play to open the audio context for all elements
    const first = Object.values(audioRef.current)[0];
    if (!first) return;
    try {
      first.volume = 0;
      const playback = first.play();
      if (playback && typeof playback.then === "function") {
        playback
          .then(() => { first.pause(); first.currentTime = 0; first.volume = volumeMapRef.current.deal ?? 0.4; })
          .catch(() => { first.volume = volumeMapRef.current.deal ?? 0.4; });
      } else {
        first.pause();
        first.currentTime = 0;
        first.volume = volumeMapRef.current.deal ?? 0.4;
      }
    } catch {
      // ignore
    }
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
