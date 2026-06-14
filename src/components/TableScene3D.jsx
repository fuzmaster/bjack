import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

/**
 * 3D table scene — WebGL felt with proper lighting + camera.
 *
 * Mounts as a fixed-position canvas inside the felt area. All existing
 * DOM elements (cards, chips, HUD, plaque) layer on top via z-index.
 *
 * The cards keep their full artistic DOM rendering (pip layouts,
 * monograms, Ace centerpiece, 3D CSS flip) — this scene adds the
 * "I'm sitting at a real table" sensation around them.
 */

function Felt({ feltHue = 142, feltChroma = 0.055 }) {
  // Build the felt material from the current theme tokens
  const baseColor = useMemo(() => {
    const c = new THREE.Color();
    // Approximate OKLCH felt-base: oklch(0.20 c h) → low-lightness greenish color
    // We use HSL/LCh fallback since three.js doesn't natively read OKLCH
    const h = feltHue / 360;
    const s = Math.min(0.7, feltChroma * 7);
    const l = 0.18;
    c.setHSL(h, s, l);
    return c;
  }, [feltHue, feltChroma]);

  return (
    <mesh receiveShadow position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[28, 18, 24, 16]} />
      <meshStandardMaterial
        color={baseColor}
        roughness={0.92}
        metalness={0.04}
      />
    </mesh>
  );
}

function FeltAccent() {
  // A second, slightly elevated plane with a darker rim for the soft vignette
  return (
    <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[6, 9, 64]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.18} />
    </mesh>
  );
}

function ParallaxCamera({ targetX, targetY }) {
  const cam = useRef();
  const baseY = 5.2;
  const baseZ = 8.5;
  const targetLook = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useFrame(() => {
    if (!cam.current) return;
    // Subtle camera drift toward mouse — feels like leaning over the table
    cam.current.position.x += (targetX.current * 0.9 - cam.current.position.x) * 0.06;
    cam.current.position.y += (baseY + targetY.current * -0.4 - cam.current.position.y) * 0.06;
    cam.current.position.z += (baseZ - cam.current.position.z) * 0.06;
    cam.current.lookAt(targetLook);
  });

  return (
    <PerspectiveCamera
      ref={cam}
      makeDefault
      fov={42}
      position={[0, baseY, baseZ]}
    />
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      {/* Key light: bright above-front, casts soft shadows */}
      <directionalLight
        position={[5, 9, 4]}
        intensity={1.25}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      {/* Fill light: cool, back-left */}
      <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#d6e2ff" />
      {/* Rim warm glow from the top edge — feels like a lounge pendant */}
      <pointLight position={[0, 7, -5]} intensity={0.55} color="#f0c98a" distance={20} decay={2} />
    </>
  );
}

export default function TableScene3D({ feltHue = 142, feltChroma = 0.055 }) {
  // Refs updated via window mouse listener; useFrame consumes them
  const targetX = useRef(0);
  const targetY = useRef(0);

  useEffect(() => {
    const onMove = (e) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      targetX.current = (e.clientX / w - 0.5) * 2; // -1..1
      targetY.current = (e.clientY / h - 0.5) * 2;
    };
    const onOrient = (e) => {
      if (e.beta == null || e.gamma == null) return;
      const beta = Math.max(-30, Math.min(30, e.beta - 45));
      const gamma = Math.max(-30, Math.min(30, e.gamma));
      targetX.current = gamma / 30;
      targetY.current = beta / 30;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onOrient, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("deviceorientation", onOrient);
    };
  }, []);

  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <ParallaxCamera targetX={targetX} targetY={targetY} />
      <Lights />
      <Felt feltHue={feltHue} feltChroma={feltChroma} />
      <FeltAccent />
      {/* Soft top-down gradient via fog — gives depth */}
      <fog attach="fog" args={["#000000", 18, 30]} />
    </Canvas>
  );
}
