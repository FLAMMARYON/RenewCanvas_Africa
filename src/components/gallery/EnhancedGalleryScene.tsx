"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF, useTexture } from "@react-three/drei";
import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import * as THREE from "three";
import { GalleryLighting } from "./GalleryLighting";
import { WeatherSystem } from "./WeatherSystem";
import { useGalleryData } from "@/lib/frontend/useGalleryData";

const FRAME_W = 2.35;
const FRAME_H = 2.95;
const FRAME_DEPTH = 0.18;
const ARTWORK_IMAGE_W = 1.76;
const ARTWORK_IMAGE_H = 2.26;
const FRAME_CENTER_Y = 1.82;
const BRAND_TEAL = "#0f766e";

function fitTextureToArtworkPlane(texture: THREE.Texture) {
  const image = texture.image as { width?: number; height?: number } | undefined;
  const width = image?.width ?? 0;
  const height = image?.height ?? 0;
  const frameAspect = ARTWORK_IMAGE_W / ARTWORK_IMAGE_H;

  texture.repeat.set(1, 1);
  texture.offset.set(0, 0);
  texture.center.set(0, 0);

  if (width > 0 && height > 0) {
    const imageAspect = width / height;
    if (imageAspect > frameAspect) {
      const repeatX = frameAspect / imageAspect;
      texture.repeat.set(repeatX, 1);
      texture.offset.set((1 - repeatX) / 2, 0);
    } else if (imageAspect < frameAspect) {
      const repeatY = imageAspect / frameAspect;
      texture.repeat.set(1, repeatY);
      texture.offset.set(0, (1 - repeatY) / 2);
    }
  }

  texture.needsUpdate = true;
}

class ArtworkTextureBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; resetKey: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: { resetKey: string }) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

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
  rotation,
  artworkImageUrl,
  artworkTitle,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  artworkImageUrl?: string;
  artworkTitle: string;
}) {
  const { scene } = useGLTF("/models/artwork-frame.glb");
  const frameClone = useMemo(() => scene.clone(true), [scene]);
  const textureUrl = artworkImageUrl || "/brand/renewcanvas-icon-full-color.png";
  const texture = useTexture(textureUrl);

  useEffect(() => {
    console.log("[virtual-gallery] artwork texture URL", {
      title: artworkTitle,
      url: textureUrl,
      hasArtworkImage: Boolean(artworkImageUrl),
      isAbsoluteUrl: /^https?:\/\//.test(textureUrl),
    });
  }, [artworkImageUrl, artworkTitle, textureUrl]);

  // Apply texture to the center backing plane (if found)
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    fitTextureToArtworkPlane(texture);

    frameClone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name === "backing") {
        child.material = new THREE.MeshStandardMaterial({
          color: artworkImageUrl ? "#ffffff" : BRAND_TEAL,
          map: artworkImageUrl ? texture : null,
          side: THREE.DoubleSide,
        });
      }
    });
  }, [artworkImageUrl, artworkTitle, frameClone, texture]);

  return (
    <group position={position} rotation={rotation}>
      <primitive object={frameClone} />
      <mesh position={[0, 0, 0.09]} renderOrder={10}>
        <planeGeometry args={[ARTWORK_IMAGE_W, ARTWORK_IMAGE_H]} />
        <meshStandardMaterial
          color={artworkImageUrl ? "#ffffff" : BRAND_TEAL}
          map={artworkImageUrl ? texture : null}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Label below frame */}
      <Html position={[0, -1.32, 0.12]} center distanceFactor={5}>
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
  const wallSlots = useMemo(() => createWallSlots(), []);

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
        const slot = wallSlots[index % wallSlots.length];
        const imageUrl = artwork.images[0]?.url;
        const fallback = <TealArtworkPlaceholder position={slot.position} rotation={slot.rotation} title={artwork.title} />;

        return (
          <ArtworkTextureBoundary key={artwork.id} resetKey={imageUrl ?? artwork.id} fallback={fallback}>
            <Suspense fallback={fallback}>
              <ArtworkFrame
                position={slot.position}
                rotation={slot.rotation}
                artworkImageUrl={imageUrl}
                artworkTitle={artwork.title}
              />
            </Suspense>
          </ArtworkTextureBoundary>
        );
      })}
    </group>
  );
}

function createWallSlots() {
  const roomW = 14;
  const roomD = 16;
  const inset = FRAME_DEPTH / 2 + 0.14;
  const y = FRAME_CENTER_Y;
  const horizontal = [-4.55, -2.05, 2.05, 4.55];
  const vertical = [-4.55, -2.05, 2.05, 4.55];
  return [
    ...horizontal.map((x) => ({ position: [x, y, -roomD / 2 + inset] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] })),
    ...horizontal.map((x) => ({ position: [x, y, roomD / 2 - inset] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number] })),
    ...vertical.map((z) => ({ position: [-roomW / 2 + inset, y, z] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] })),
    ...vertical.map((z) => ({ position: [roomW / 2 - inset, y, z] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number] })),
  ];
}

function TealArtworkPlaceholder({ position, rotation, title }: { position: [number, number, number]; rotation: [number, number, number]; title: string }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[FRAME_W, FRAME_H, 0.16]} />
        <meshStandardMaterial color="#3d2c1d" />
      </mesh>
      <mesh position={[0, 0, 0.09]} renderOrder={10}>
        <planeGeometry args={[ARTWORK_IMAGE_W, ARTWORK_IMAGE_H]} />
        <meshStandardMaterial color={BRAND_TEAL} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[0, -1.32, 0.12]} center distanceFactor={5}>
        <div style={{ color: "white", fontSize: "0.75rem", pointerEvents: "none" }}>{title}</div>
      </Html>
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
