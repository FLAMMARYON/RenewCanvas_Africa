"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import { useRef, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { GalleryLighting } from "./GalleryLighting";
import { WeatherSystem } from "./WeatherSystem";
import { useGalleryData } from "@/lib/frontend/useGalleryData";

/**
 * Camera Intro Animation
 * Smoothly moves camera from entrance to main view
 */
function CameraIntro() {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 3000); // 3 second intro

    return () => clearTimeout(timer);
  }, []);

  return null;
}

/**
 * Signboard with entrance text
 */
function EntranceSignboard() {
  return (
    <Html
      position={[0, 3.5, 8]}
      center
      distanceFactor={10}
      style={{
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          padding: "1.5rem 2rem",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center",
          minWidth: "400px",
        }}
      >
        <h1
          style={{
            color: "#0d9488",
            fontSize: "1.75rem",
            fontWeight: "700",
            margin: "0 0 0.5rem 0",
            letterSpacing: "0.05em",
          }}
        >
          RENEWCANVAS AFRICA
        </h1>
        <p
          style={{
            color: "white",
            fontSize: "1.1rem",
            fontWeight: "500",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          ANYTHING IS ART IN THE RIGHT EYES
        </p>
      </div>
    </Html>
  );
}

/**
 * Room Name Label
 */
function RoomLabel({
  position,
  name,
  artworkCount,
}: {
  position: [number, number, number];
  name: string;
  artworkCount: number;
}) {
  return (
    <Html position={position} center distanceFactor={8}>
      <div
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          textAlign: "center",
          minWidth: "200px",
          pointerEvents: "none",
        }}
      >
        <h3
          style={{
            color: "white",
            fontSize: "1.1rem",
            fontWeight: "600",
            margin: "0 0 0.25rem 0",
          }}
        >
          {name}
        </h3>
        <p
          style={{
            color: "#f59e0b",
            fontSize: "0.875rem",
            margin: 0,
          }}
        >
          {artworkCount} {artworkCount === 1 ? "artwork" : "artworks"}
        </p>
      </div>
    </Html>
  );
}

/**
 * Museum Exterior (GLB asset)
 */
function MuseumExterior() {
  const { scene } = useGLTF("/models/museum-exterior.glb");

  return (
    <primitive
      object={scene.clone()}
      position={[0, 0, -5]}
      scale={1}
    />
  );
}

/**
 * Street Ground (GLB asset)
 */
function StreetGround() {
  const { scene } = useGLTF("/models/street-ground.glb");

  return (
    <primitive
      object={scene.clone()}
      position={[0, 0, 0]}
      scale={1}
    />
  );
}

/**
 * Artwork Frame Instance
 */
function ArtworkFrame({
  position,
  artworkImageUrl,
  artworkTitle,
}: {
  position: [number, number, number];
  artworkImageUrl?: string;
  artworkTitle: string;
}) {
  const { scene } = useGLTF("/models/artwork-frame.glb");
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const frameClone = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    if (!artworkImageUrl) {
      setTexture(null);
      return;
    }

    let active = true;
    let loadedTexture: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();

    loader.load(
      artworkImageUrl,
      (nextTexture) => {
        if (!active) {
          nextTexture.dispose();
          return;
        }

        nextTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture = nextTexture;
        setTexture(nextTexture);
      },
      undefined,
      (error) => {
        console.warn(`Failed to load texture for ${artworkTitle}:`, error);
      }
    );

    return () => {
      active = false;
      loadedTexture?.dispose();
    };
  }, [artworkImageUrl, artworkTitle]);

  // Apply texture to the center backing plane (if found)
  useEffect(() => {
    if (!texture) return;

    frameClone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name === "backing") {
        child.material = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
      }
    });
  }, [frameClone, texture]);

  return (
    <group position={position}>
      <primitive object={frameClone} />
      {/* Label below frame */}
      <Html position={[0, -1, 0]} center distanceFactor={5}>
        <div
          style={{
            background: "rgba(0, 0, 0, 0.6)",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            fontSize: "0.875rem",
            maxWidth: "200px",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          {artworkTitle}
        </div>
      </Html>
    </group>
  );
}

/**
 * Gallery Room Layout
 * Displays artworks in a circular room arrangement
 */
function GalleryRoom({
  roomId,
  roomName,
  artworks,
  centerPosition,
}: {
  roomId: string;
  roomName: string;
  artworks: Array<{ id: string; title: string; images: Array<{ url: string }> }>;
  centerPosition: [number, number, number];
}) {
  const artworkCount = artworks.length;
  const radius = 8; // 8 meters from center

  return (
    <group position={centerPosition}>
      {/* Room label above */}
      <RoomLabel
        position={[0, 4, 0]}
        name={roomName}
        artworkCount={artworkCount}
      />

      {/* Artwork frames in a circle */}
      {artworks.map((artwork, index) => {
        const angle = (index / artworkCount) * Math.PI * 2;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        return (
          <ArtworkFrame
            key={artwork.id}
            position={[x, 2, z]}
            artworkImageUrl={artwork.images[0]?.url}
            artworkTitle={artwork.title}
          />
        );
      })}
    </group>
  );
}

/**
 * All Gallery Rooms
 */
function GalleryRooms() {
  const result = useGalleryData();

  if (result.status === "loading") {
    return (
      <Html center>
        <div style={{ color: "white", fontSize: "1.25rem" }}>
          Loading artworks...
        </div>
      </Html>
    );
  }

  if (result.status === "error") {
    return (
      <Html center>
        <div
          style={{
            color: "#ef4444",
            fontSize: "1.25rem",
            background: "rgba(0, 0, 0, 0.8)",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          Failed to load artworks: {result.error}
        </div>
      </Html>
    );
  }

  // Layout rooms in a grid (2 columns, 3 rows)
  const roomPositions: Record<number, [number, number, number]> = {
    0: [-15, 0, -10], // Top left
    1: [15, 0, -10],  // Top right
    2: [-15, 0, -30], // Middle left
    3: [15, 0, -30],  // Middle right
    4: [-15, 0, -50], // Bottom left
    5: [15, 0, -50],  // Bottom right
  };

  return (
    <>
      {result.data.rooms.map((room, index) => (
        <GalleryRoom
          key={room.id}
          roomId={room.id}
          roomName={room.name}
          artworks={room.artworks}
          centerPosition={roomPositions[index] || [0, 0, -10 - index * 20]}
        />
      ))}
    </>
  );
}

/**
 * Main Enhanced Gallery Scene
 */
export default function EnhancedGalleryScene() {
  return (
    <Canvas
      camera={{
        position: [0, 1.7, 12], // Eye level at entrance
        fov: 72,
      }}
      style={{ background: "#101417" }}
    >
      {/* Camera Intro Animation */}
      <CameraIntro />

      {/* Lighting System (day/night transitions) */}
      <GalleryLighting indoor outdoor />

      {/* Weather System (outdoor effects) */}
      <WeatherSystem outdoor />

      {/* 3D Assets */}
      <MuseumExterior />
      <StreetGround />

      {/* Entrance Signboard */}
      <EntranceSignboard />

      {/* Gallery Rooms with Artworks */}
      <GalleryRooms />

      {/* Ground Plane (fallback if street-ground doesn't load) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#665b4f" />
      </mesh>

      {/* Orbit Controls for navigation */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2 - 0.1} // Prevent going underground
        target={[0, 1.5, 0]}
      />
    </Canvas>
  );
}

// Preload GLB assets
useGLTF.preload("/models/museum-exterior.glb");
useGLTF.preload("/models/street-ground.glb");
useGLTF.preload("/models/artwork-frame.glb");
