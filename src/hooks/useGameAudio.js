import { useCallback, useEffect, useRef } from "react";
import { getCapabilities } from "../utils/capabilities";

/**
 * Programmatic sound design via Web Audio API.
 *
 * No asset files — every sound is synthesized on demand. Lets the audio
 * match the velvet-lounge aesthetic (paper snap, brass flourish, soft
 * loss chord) instead of generic 2014-era stock WAVs.
 *
 * Public API matches the previous file-backed hook so callers don't change:
 *   { play(name, volume?), unlockAudio() }
 */

const SOUND_NAMES = ["deal", "flip", "chip", "win", "lose", "button"];

export function useGameAudio(isMuted = false) {
  const ctxRef = useRef(null);
  const mutedRef = useRef(isMuted);

  useEffect(() => { mutedRef.current = isMuted; }, [isMuted]);

  // Cleanup on unmount
  useEffect(() => () => {
    const ctx = ctxRef.current;
    if (ctx && ctx.state !== "closed") {
      try { ctx.close(); } catch { /* ignore */ }
    }
  }, []);

  const ensureCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    if (typeof window === "undefined") return null;
    // Bail entirely in lite mode or when Web Audio is unsupported
    if (!getCapabilities().webAudio) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctxRef.current = new AC();
    } catch {
      return null;
    }
    return ctxRef.current;
  }, []);

  const unlockAudio = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      try { ctx.resume(); } catch { /* ignore */ }
    }
  }, [ensureCtx]);

  const play = useCallback((name, volume = 0.4) => {
    if (mutedRef.current) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      try { ctx.resume(); } catch { /* ignore */ }
    }
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);

    switch (name) {
      case "deal": {
        // Paper snap: short noise burst, highpassed
        const buf = ctx.createBuffer(1, 0.06 * ctx.sampleRate, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          const t = i / data.length;
          data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.9;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 2200;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0, now);
        env.gain.linearRampToValueAtTime(1.0, now + 0.005);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        src.connect(hp).connect(env).connect(master);
        src.start(now);
        src.stop(now + 0.08);
        break;
      }
      case "flip": {
        // Card flip: rising-pitch filtered noise (whip)
        const buf = ctx.createBuffer(1, 0.18 * ctx.sampleRate, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 4;
        bp.frequency.setValueAtTime(800, now);
        bp.frequency.exponentialRampToValueAtTime(2600, now + 0.16);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0, now);
        env.gain.linearRampToValueAtTime(0.6, now + 0.012);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        src.connect(bp).connect(env).connect(master);
        src.start(now);
        src.stop(now + 0.20);
        break;
      }
      case "chip": {
        // Chip clink: two sine partials + noise transient
        const partials = [2400, 3200];
        partials.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.value = freq;
          const env = ctx.createGain();
          env.gain.setValueAtTime(0.0, now);
          env.gain.linearRampToValueAtTime(0.5 / (i + 1), now + 0.002);
          env.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.connect(env).connect(master);
          osc.start(now);
          osc.stop(now + 0.08);
        });
        // Tiny noise tick at the attack
        const buf = ctx.createBuffer(1, 0.01 * ctx.sampleRate, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 3000;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.4, now);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
        src.connect(hp).connect(env).connect(master);
        src.start(now);
        src.stop(now + 0.02);
        break;
      }
      case "win": {
        // Brass arpeggio — G major (G3 / B3 / D4) with sawtooth + lowpass
        const notes = [
          { freq: 196.00, delay: 0.000 }, // G3
          { freq: 246.94, delay: 0.060 }, // B3
          { freq: 293.66, delay: 0.120 }, // D4
        ];
        notes.forEach(({ freq, delay }) => {
          const t0 = now + delay;
          const osc = ctx.createOscillator();
          osc.type = "sawtooth";
          osc.frequency.value = freq;
          const lp = ctx.createBiquadFilter();
          lp.type = "lowpass";
          lp.Q.value = 2;
          lp.frequency.setValueAtTime(900, t0);
          lp.frequency.exponentialRampToValueAtTime(3200, t0 + 0.25);
          lp.frequency.exponentialRampToValueAtTime(800, t0 + 0.55);
          const env = ctx.createGain();
          env.gain.setValueAtTime(0.0, t0);
          env.gain.linearRampToValueAtTime(0.42, t0 + 0.025);
          env.gain.linearRampToValueAtTime(0.28, t0 + 0.20);
          env.gain.exponentialRampToValueAtTime(0.001, t0 + 0.55);
          osc.connect(lp).connect(env).connect(master);
          osc.start(t0);
          osc.stop(t0 + 0.58);
        });
        break;
      }
      case "lose": {
        // Soft descending minor — A3 → E3 over 280ms
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(165, now + 0.28);
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 900;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0, now);
        env.gain.linearRampToValueAtTime(0.32, now + 0.04);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.connect(lp).connect(env).connect(master);
        osc.start(now);
        osc.stop(now + 0.35);
        // Add a sub-octave for weight
        const sub = ctx.createOscillator();
        sub.type = "sine";
        sub.frequency.setValueAtTime(110, now);
        sub.frequency.exponentialRampToValueAtTime(82, now + 0.28);
        const subEnv = ctx.createGain();
        subEnv.gain.setValueAtTime(0.0, now);
        subEnv.gain.linearRampToValueAtTime(0.18, now + 0.04);
        subEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        sub.connect(subEnv).connect(master);
        sub.start(now);
        sub.stop(now + 0.35);
        break;
      }
      case "button": {
        // Tactile tick: short 1200 Hz sine with sharp envelope
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 1200;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0, now);
        env.gain.linearRampToValueAtTime(0.36, now + 0.003);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(env).connect(master);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      default: {
        // Unknown name — silent fallback
        break;
      }
    }
  }, [ensureCtx]);

  return { play, unlockAudio };
}

// Re-export for any tooling/tests that need the catalog
useGameAudio.SOUND_NAMES = SOUND_NAMES;
