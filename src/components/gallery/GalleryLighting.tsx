"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLightingMode } from "@/lib/frontend/useLightingMode";

type GalleryLightingProps = {
  /** Whether this is an indoor scene (museum interior) */
  indoor?: boolean;
  /** Whether this is an outdoor scene (street) */
  outdoor?: boolean;
};

/**
 * R3F-based lighting system with day/night transitions
 * - Day: brighter ambient + directional light
 * - Night: dim ambient + point lights (indoor) + street lamps (outdoor)
 */
export function GalleryLighting({ indoor = false, outdoor = false }: GalleryLightingProps) {
  const mode = useLightingMode();
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);

  // Target intensities based on mode
  const targetAmbientIntensity = mode === "day" ? 0.6 : 0.08;
  const targetDirectionalIntensity = mode === "day" ? 1.0 : 0.0;

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Smooth transitions using lerp
  useFrame(() => {
    if (ambientRef.current) {
      if (prefersReducedMotion) {
        // Snap immediately if reduced motion preferred
        ambientRef.current.intensity = targetAmbientIntensity;
      } else {
        // Smooth lerp transition at 0.02 per frame
        ambientRef.current.intensity = THREE.MathUtils.lerp(
          ambientRef.current.intensity,
          targetAmbientIntensity,
          0.02
        );
      }
    }

    if (directionalRef.current) {
      if (prefersReducedMotion) {
        directionalRef.current.intensity = targetDirectionalIntensity;
      } else {
        directionalRef.current.intensity = THREE.MathUtils.lerp(
          directionalRef.current.intensity,
          targetDirectionalIntensity,
          0.02
        );
      }
    }
  });

  // Set canvas background color based on mode
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const bgColor = mode === "day" ? "#87CEEB" : "#0a0a1a";
      canvas.style.backgroundColor = bgColor;
    }
  }, [mode]);

  return (
    <group>
      {/* Ambient light (transitions between day/night) */}
      <ambientLight ref={ambientRef} intensity={targetAmbientIntensity} />

      {/* Directional sun light (day only) */}
      <directionalLight
        ref={directionalRef}
        position={[10, 10, 5]}
        intensity={targetDirectionalIntensity}
        color="#fff8f0"
        castShadow
      />

      {/* Museum interior lights (night only) */}
      {indoor && mode === "night" && (
        <>
          <pointLight position={[0, 3, 0]} intensity={1.2} color="#fff5e0" />
          <pointLight position={[3, 2, 3]} intensity={0.6} color="#ffe8b0" />
          <pointLight position={[-3, 2, 3]} intensity={0.6} color="#ffe8b0" />
        </>
      )}

      {/* Outdoor street lamps (night only) */}
      {outdoor && mode === "night" && (
        <>
          <pointLight position={[0, 4, -8]} intensity={0.8} color="#ff9944" decay={2} />
          <pointLight position={[4, 4, 0]} intensity={0.5} color="#ff9944" decay={2} />
        </>
      )}
    </group>
  );
}
