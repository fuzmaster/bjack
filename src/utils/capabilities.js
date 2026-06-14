/**
 * Browser capability detection — used to gate optional features so the
 * core game works on any browser, even ones without WebGL, Web Audio,
 * or service workers.
 *
 * Also respects the URL flag ?lite=1 (or ?lite) which forces every
 * optional feature off — useful for testing on weak devices or for
 * users who want a stripped-down version.
 */

function urlHasLiteFlag() {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("lite")) {
      const v = params.get("lite");
      return v === "" || v === "1" || v === "true";
    }
  } catch { /* ignore */ }
  return false;
}

function hasWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    const gl =
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

function hasWebAudio() {
  if (typeof window === "undefined") return false;
  return !!(window.AudioContext || window.webkitAudioContext);
}

function hasServiceWorker() {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

function hasVibrate() {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function hasDeviceOrientation() {
  return typeof window !== "undefined" && "DeviceOrientationEvent" in window;
}

let _cache = null;
export function getCapabilities() {
  if (_cache) return _cache;
  const lite = urlHasLiteFlag();
  _cache = {
    lite,
    // Optional features — all forced off when lite=true
    webgl: lite ? false : hasWebGL(),
    webAudio: lite ? false : hasWebAudio(),
    serviceWorker: lite ? false : hasServiceWorker(),
    vibrate: lite ? false : hasVibrate(),
    deviceOrientation: lite ? false : hasDeviceOrientation(),
    // Surface for the debug badge
    rawWebgl: hasWebGL(),
    rawWebAudio: hasWebAudio(),
    rawServiceWorker: hasServiceWorker(),
  };
  return _cache;
}

export function liteSummary() {
  const c = getCapabilities();
  return {
    lite: c.lite,
    missing: ["webgl", "webAudio", "serviceWorker"]
      .filter((k) => !c[k.replace("webAudio", "webAudio")])
      .filter((k) => {
        const raw = { webgl: c.rawWebgl, webAudio: c.rawWebAudio, serviceWorker: c.rawServiceWorker };
        return c.lite ? false : !raw[k];
      }),
  };
}
