"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLightingMode } from "@/lib/frontend/useLightingMode";

const CONDITIONS = ["clear", "cloudy", "light-rain", "mist"] as const;
type WeatherCondition = typeof CONDITIONS[number];

/**
 * Get or initialize weather condition from sessionStorage
 */
function getWeatherCondition(): WeatherCondition {
  if (typeof window === "undefined") {
    return "clear";
  }

  const stored = sessionStorage.getItem("rc_weather");
  if (stored && CONDITIONS.includes(stored as WeatherCondition)) {
    return stored as WeatherCondition;
  }

  // Random selection on first visit
  const randomCondition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
  sessionStorage.setItem("rc_weather", randomCondition);
  return randomCondition;
}

type WeatherSystemProps = {
  /** Only apply weather to outdoor scenes */
  outdoor?: boolean;
};

/**
 * R3F-based weather system with fog and rain particles
 * - clear: No fog or particles
 * - cloudy: Gray fog
 * - light-rain: Fog + 200 falling rain particles
 * - mist: Dense fog
 */
export function WeatherSystem({ outdoor = true }: WeatherSystemProps) {
  const condition = useMemo(() => getWeatherCondition(), []);
  const mode = useLightingMode();

  // Rain particles (for light-rain condition)
  const rainRef = useRef<THREE.Points>(null);

  useEffect(() => {
    // Set canvas fog based on condition
    const canvas = document.querySelector("canvas");
    if (canvas && outdoor) {
      // Night overrides sky color
      let skyColor = mode === "night" ? "#0a0a1a" : "#87CEEB";

      switch (condition) {
        case "cloudy":
          skyColor = mode === "night" ? "#0a0a1a" : "#999999";
          break;
        case "light-rain":
          skyColor = mode === "night" ? "#0a0a1a" : "#667788";
          break;
        case "mist":
          skyColor = mode === "night" ? "#0a0a1a" : "#cccccc";
          break;
      }

      canvas.style.backgroundColor = skyColor;
    }
  }, [condition, mode, outdoor]);

  // Animate rain particles
  useFrame(() => {
    if (rainRef.current && condition === "light-rain") {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        // Move particles downward
        positions[i + 1] -= 0.2; // Y position

        // Reset to top when below ground
        if (positions[i + 1] < 0) {
          positions[i + 1] = 20;
        }
      }

      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Generate rain particle positions
  const rainPositions = useMemo(() => {
    if (condition !== "light-rain") return new Float32Array(0);

    const positions = new Float32Array(200 * 3); // 200 particles
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40; // X: -20 to 20
      positions[i * 3 + 1] = Math.random() * 20; // Y: 0 to 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40; // Z: -20 to 20
    }
    return positions;
  }, [condition]);

  if (!outdoor) {
    return null;
  }

  return (
    <group>
      {/* Fog based on condition */}
      {condition === "cloudy" && <fog attach="fog" args={["#aaaaaa", 30, 80]} />}
      {condition === "light-rain" && <fog attach="fog" args={["#889999", 20, 60]} />}
      {condition === "mist" && <fog attach="fog" args={["#dddddd", 10, 40]} />}

      {/* Rain particles */}
      {condition === "light-rain" && (
        <points ref={rainRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={200}
              array={rainPositions}
              itemSize={3}
              args={[rainPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial size={0.05} color="#cccccc" transparent opacity={0.6} />
        </points>
      )}
    </group>
  );
}
