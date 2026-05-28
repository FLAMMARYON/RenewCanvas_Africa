"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Compass, Home, Info, List, Map as MapIcon, Maximize2, RotateCcw, Share2, ShoppingBag, X } from "lucide-react";
import * as THREE from "three";
import { GalleryLoadingScreen } from "@/components/gallery/GalleryLoadingScreen";
import { WebGLFallback } from "@/components/gallery/WebGLFallback";
import { useGalleryData } from "@/lib/frontend/useGalleryData";
import { flattenGalleryRooms, type VirtualRoomArtwork } from "@/lib/frontend/virtual-room-data";
import Navbar from "@/components/Navbar";

type RoomKey = "entrance" | "main" | "left" | "right" | "court" | "corridor";
type SceneState = "exterior" | "interior";

type Artwork = VirtualRoomArtwork & {
  curationRoomTitle?: string;
  curationExplanation?: string;
};

type Station = {
  key: RoomKey;
  label: string;
  x: number;
  z: number;
  heading: number;
};

type DoorTarget = {
  label: string;
  room: RoomKey;
  wingOffset?: number;
  heading: number;
};

type DoorRuntimeTarget = DoorTarget & {
  fromRoom: RoomKey;
  localPosition: [number, number, number];
};

type ArtworkPlacement = {
  artwork: Artwork;
  roomKey: RoomKey;
  slotIndex: number;
  wingIndex: number;
  curationRoomTitle: string;
  curationGrouping: string;
  curationExplanation: string;
};

type WallPlacement = {
  x: number;
  z: number;
  rotY: number;
};

const WING_SPACING = 76;
const ROOM_W = 14;
const ROOM_D = 16;
const WALL_H = 5.2;
const CAMERA_Y = 1.72;
const FRAME_W = 2.35;
const FRAME_H = 2.95;
const FRAME_DEPTH = 0.18;
const ARTWORK_IMAGE_W = 1.76;
const ARTWORK_IMAGE_H = 2.26;
const FRAME_CENTER_Y = 1.82;
const BRAND_TEAL = "#0f766e";
const BRAND_ORANGE = "#f59e0b";
const BRAND_DARK = "#101417";

// Interior rooms live BEHIND the building façade (z = -12).
// Each room is ROOM_D=16 deep, so a station at z=-20 has its south wall at
// z=-12 (aligned with the façade boundary). Outdoor world stays at z > -12;
// indoor rooms live at z < -12. Glass doors at z=-12 are the only boundary.
const roomStations: Station[] = [
  { key: "entrance", label: "Entrance Lobby", x: 0, z: -20, heading: 0 },
  { key: "main", label: "Painting Room", x: 0, z: -38, heading: 0 },
  { key: "left", label: "Wearables Room", x: -17, z: -38, heading: -90 },
  { key: "right", label: "Living Space Room", x: 17, z: -38, heading: 90 },
  { key: "court", label: "Sculpture Room", x: 0, z: -56, heading: 0 },
  { key: "corridor", label: "Mixed Media Room", x: 0, z: -74, heading: 0 },
];

const roomColors: Record<RoomKey, { wall: string; trim: string; rail: string; floor: string }> = {
  entrance: { wall: "#d8ccb9", trim: "#f2eadc", rail: "#0f766e", floor: "#6f6255" },
  main: { wall: "#8f2f2b", trim: "#ead8b8", rail: "#5d2420", floor: "#735f4d" },
  left: { wall: "#b9b0a4", trim: "#f3eee5", rail: "#786a5b", floor: "#665b4f" },
  right: { wall: "#93aa79", trim: "#f1e8d2", rail: "#566d45", floor: "#695d49" },
  court: { wall: "#d6c7b1", trim: "#f8efe0", rail: "#0f766e", floor: "#7b715f" },
  corridor: { wall: "#cfc5b6", trim: "#f5eee2", rail: "#f59e0b", floor: "#665d51" },
};

const doors: Record<RoomKey, DoorTarget[]> = {
  entrance: [{ label: "Painting Room", room: "main", heading: 0 }],
  main: [
    { label: "Wearables Room", room: "left", heading: 90 },
    { label: "Living Space Room", room: "right", heading: -90 },
    { label: "Sculpture Room", room: "court", heading: 0 },
    { label: "Entrance", room: "entrance", heading: 180 },
  ],
  left: [{ label: "Painting Room", room: "main", heading: -90 }],
  right: [{ label: "Painting Room", room: "main", heading: 90 }],
  court: [
    { label: "Painting Room", room: "main", heading: 180 },
    { label: "Mixed Media Room", room: "corridor", heading: 0 },
  ],
  corridor: [{ label: "Sculpture Room", room: "court", heading: 180 }],
};

const doorRuntimeTargets: Record<RoomKey, DoorRuntimeTarget[]> = {
  entrance: [
    { label: "Painting Room", room: "main", heading: 0, fromRoom: "entrance", localPosition: [0, 0.06, -6.8] },
  ],
  main: [
    { label: "Wearables Room", room: "left", heading: 90, fromRoom: "main", localPosition: [-6, 0.06, 0] },
    { label: "Living Space Room", room: "right", heading: -90, fromRoom: "main", localPosition: [6, 0.06, 0] },
    { label: "Sculpture Room", room: "court", heading: 0, fromRoom: "main", localPosition: [0, 0.06, -6.8] },
    { label: "Entrance", room: "entrance", heading: 180, fromRoom: "main", localPosition: [0, 0.06, 6.8] },
  ],
  left: [
    { label: "Painting Room", room: "main", heading: -90, fromRoom: "left", localPosition: [6, 0.06, 0] },
  ],
  right: [
    { label: "Painting Room", room: "main", heading: 90, fromRoom: "right", localPosition: [-6, 0.06, 0] },
  ],
  court: [
    { label: "Painting Room", room: "main", heading: 180, fromRoom: "court", localPosition: [0, 0.06, 6.8] },
    { label: "Mixed Media Room", room: "corridor", heading: 0, fromRoom: "court", localPosition: [0, 0.06, -6.8] },
  ],
  corridor: [
    { label: "Sculpture Room", room: "court", heading: 180, fromRoom: "corridor", localPosition: [0, 0.06, 6.8] },
  ],
};

function wingName(wing: number) {
  return ["Sully", "Denon", "Richelieu", "Cour Carree"][Math.abs(wing) % 4];
}

function stationFor(room: RoomKey, wing: number) {
  const station = roomStations.find((item) => item.key === room) ?? roomStations[0];
  return { ...station, z: station.z - wing * WING_SPACING };
}

function getArtworkPlacements(items: Artwork[]): ArtworkPlacement[] {
  const roomSlots = new Map<RoomKey, number>();
  return items.map((artwork) => {
    const roomKey = roomForArtworkCategory(artwork.category);
    const slotIndex = roomSlots.get(roomKey) ?? 0;
    roomSlots.set(roomKey, slotIndex + 1);
    return {
      artwork,
      roomKey,
      slotIndex,
      wingIndex: Math.floor(slotIndex / 4),
      curationRoomTitle: stationFor(roomKey, 0).label,
      curationGrouping: artwork.category,
      curationExplanation: `${artwork.title} is grouped by category in the ${stationFor(roomKey, 0).label}.`,
    };
  });
}

function roomForArtworkCategory(category: string): RoomKey {
  if (category === "Sculpture") return "court";
  if (category === "Wall Art" || category === "Painting") return "main";
  if (category === "Jewelry" || category === "Fashion") return "left";
  if (category === "Home Decor" || category === "Furniture") return "right";
  return "corridor";
}

function wallPlacementsForRoom(roomKey: RoomKey): WallPlacement[] {
  const cornerClearance = 1;
  const frameClearance = 0.65;
  const halfFrame = FRAME_W / 2;
  const inset = FRAME_DEPTH / 2 + 0.14;
  const northZ = -ROOM_D / 2 + inset;
  const southZ = ROOM_D / 2 - inset;
  const westX = -ROOM_W / 2 + inset;
  const eastX = ROOM_W / 2 - inset;

  const horizontalSlots = [-4.55, -2.05, 2.05, 4.55].filter((x) => {
    const awayFromCorner = Math.abs(x) + halfFrame <= ROOM_W / 2 - cornerClearance;
    const clearsDoor = Math.abs(x) - halfFrame >= 1.75 + frameClearance;
    return awayFromCorner && clearsDoor;
  });
  const verticalSlots = [-4.55, -2.05, 2.05, 4.55].filter((z) => Math.abs(z) + halfFrame <= ROOM_D / 2 - cornerClearance);

  const placements: WallPlacement[] = [];
  horizontalSlots.forEach((x) => placements.push({ x, z: northZ, rotY: 0 }));
  if (roomKey !== "entrance") {
    horizontalSlots.forEach((x) => placements.push({ x, z: southZ, rotY: Math.PI }));
  }
  if (roomKey !== "main" && roomKey !== "left") {
    verticalSlots.forEach((z) => placements.push({ x: westX, z, rotY: Math.PI / 2 }));
  }
  if (roomKey !== "main" && roomKey !== "right") {
    verticalSlots.forEach((z) => placements.push({ x: eastX, z, rotY: -Math.PI / 2 }));
  }

  return placements;
}

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

function degToRad(value: number) {
  return (value * Math.PI) / 180;
}

function normalizeAngle(value: number) {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

function createTextCanvas(title: string, subtitle: string, bg = "#f2eadc") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#b89d70";
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
  ctx.fillStyle = "#241c15";
  ctx.font = "700 38px Arial";
  ctx.fillText(title.slice(0, 24), 34, 78);
  ctx.fillStyle = "#6e5b43";
  ctx.font = "28px Arial";
  ctx.fillText(subtitle.slice(0, 28), 34, 126);
  return canvas;
}

function createArtworkCanvas(artwork: Artwork) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, artwork.fallbackColor);
  gradient.addColorStop(0.55, "#f2eadc");
  gradient.addColorStop(1, BRAND_DARK);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.22;
  for (let index = 0; index < 16; index += 1) {
    ctx.beginPath();
    ctx.arc(
      120 + ((index * 137) % 540),
      140 + ((index * 89) % 760),
      42 + (index % 5) * 18,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = index % 2 === 0 ? BRAND_TEAL : BRAND_ORANGE;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(16, 20, 23, 0.72)";
  ctx.fillRect(48, 760, 672, 190);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 54px Arial";
  ctx.fillText(artwork.title.slice(0, 22), 80, 835);
  ctx.fillStyle = "#f7d083";
  ctx.font = "34px Arial";
  ctx.fillText(artwork.artist.slice(0, 26), 80, 892);
  return canvas;
}

function createEnvironmentTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#7fa7b8");
  sky.addColorStop(0.45, "#c8d8d3");
  sky.addColorStop(0.55, "#8b755c");
  sky.addColorStop(1, "#171b1d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(245, 158, 11, 0.32)";
  ctx.beginPath();
  ctx.arc(760, 118, 56, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createFloorTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#6d6153";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < 512; y += 64) {
    for (let x = 0; x < 512; x += 128) {
      ctx.fillStyle = (x + y) % 256 === 0 ? "#776b5c" : "#5f554a";
      ctx.fillRect(x, y, 126, 62);
      ctx.strokeStyle = "rgba(32, 25, 18, 0.42)";
      ctx.strokeRect(x, y, 126, 62);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addBox(
  group: THREE.Group,
  size: [number, number, number],
  position: [number, number, number],
  color: string,
  options?: { roughness?: number; metalness?: number; map?: THREE.Texture | null; emissive?: string; emissiveIntensity?: number }
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshPhysicalMaterial({
      color,
      map: options?.map ?? null,
      roughness: options?.roughness ?? 0.72,
      metalness: options?.metalness ?? 0,
      clearcoat: 0.08,
      clearcoatRoughness: 0.72,
      emissive: options?.emissive ?? "#000000",
      emissiveIntensity: options?.emissiveIntensity ?? 0,
    })
  );
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

export default function VirtualRoomPage() {
  const galleryData = useGalleryData();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetRef = useRef(new THREE.Vector3(0, CAMERA_Y, 8));
  const yawRef = useRef(0);
  const pitchRef = useRef(0); // Vertical look angle
  const keysRef = useRef({ forward: false, backward: false, left: false, right: false });
  const roomRef = useRef<RoomKey>("entrance");
  const wingRef = useRef(0);
  const lastWheelNavRef = useRef(0);
  const wheelDeltaRef = useRef(0);
  const dragRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const clickablesRef = useRef<THREE.Object3D[]>([]);
  const sceneStateRef = useRef<SceneState>("exterior");
  const exteriorGroupRef = useRef<THREE.Group | null>(null);
  const exteriorHotspotRef = useRef<THREE.Mesh | null>(null);
  const exteriorLabelRef = useRef<THREE.Mesh | null>(null);
  const savedRoomIdRef = useRef<string | null>(null);
  const loadRoomTexturesRef = useRef<(room: RoomKey, wing: number) => void>(() => {});
  const [wing, setWing] = useState(0);
  const [room, setRoom] = useState<RoomKey>("entrance");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [mapOpen, setMapOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);
  const [shareMessage, setShareMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const artworks = useMemo<Artwork[]>(
    () => (galleryData.status === "success" ? flattenGalleryRooms(galleryData.data.rooms) : []),
    [galleryData]
  );
  const currentStation = useMemo(() => stationFor(room, wing), [room, wing]);
  const currentDoors = doors[room];
  const accessiblePlacements = useMemo(() => getArtworkPlacements(artworks), [artworks]);
  const accessibilitySummary = `${artworks.length} listed marketplace artworks grouped into category-based rooms.`;

  useEffect(() => {
    roomRef.current = room;
    wingRef.current = wing;
  }, [room, wing]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    setHasWebGL(Boolean(gl));

    return () => {
      if (gl && gl instanceof WebGLRenderingContext) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }, []);

  useEffect(() => {
    if (hasWebGL !== true || !mountRef.current || galleryData.status !== "success") return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const environmentTexture = createEnvironmentTexture();
    // Start with sky background (outdoor). buildExterior sets the final color
    // (day blue or night dark) based on the hour. Interior switches to dark
    // BRAND_DARK + fog inside enterBuilding(), so the outdoor scene is never
    // polluted by interior settings.
    scene.background = new THREE.Color("#87CEEB");
    scene.environment = environmentTexture;
    scene.fog = null;

    const camera = new THREE.PerspectiveCamera(72, mount.clientWidth / mount.clientHeight, 0.05, 260);
    camera.position.set(0, CAMERA_Y, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    const world = new THREE.Group();
    scene.add(world);

    // Soft interior fill light (works alongside outdoor sun/hemisphere from buildExterior).
    // Kept low so it doesn't blow out the outdoor scene.
    const interiorFill = new THREE.HemisphereLight("#f7efe2", "#27322f", 0.45);
    scene.add(interiorFill);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.crossOrigin = "anonymous";
    const floorTexture = createFloorTexture();
    const artworkTextureTargets: Array<{
      plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshPhysicalMaterial>;
      placement: ArtworkPlacement;
      imageUrl: string;
      loaded: boolean;
    }> = [];

    const loadTexturesForActiveRoom = (activeRoom: RoomKey, activeWing: number) => {
      artworkTextureTargets.forEach((target) => {
        if (target.loaded || !target.imageUrl || target.placement.roomKey !== activeRoom || target.placement.wingIndex !== activeWing) return;
        target.loaded = true;
        console.log("[virtual-room] loading artwork texture", {
          title: target.placement.artwork.title,
          url: target.imageUrl,
          isAbsoluteUrl: /^https?:\/\//.test(target.imageUrl),
        });
        loader.load(
          target.imageUrl,
          (texture) => {
            console.log("[virtual-room] loaded artwork texture", {
              title: target.placement.artwork.title,
              url: target.imageUrl,
              width: texture.image?.width,
              height: texture.image?.height,
            });
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            fitTextureToArtworkPlane(texture);
            target.plane.material.map = texture;
            target.plane.material.color.set("#ffffff");
            target.plane.material.needsUpdate = true;
          },
          undefined,
          (error) => {
            console.error("[virtual-room] artwork texture failed", {
              title: target.placement.artwork.title,
              url: target.imageUrl,
              error,
            });
            target.loaded = false;
            target.plane.material.map = null;
            target.plane.material.color.set(BRAND_TEAL);
            target.plane.material.needsUpdate = true;
          }
        );
      });
    };
    loadRoomTexturesRef.current = loadTexturesForActiveRoom;

    function addWallSegments(group: THREE.Group, z: number, color: string, doorCenter?: number) {
      const gap = doorCenter === undefined ? 0 : 3.5;
      const leftWidth = doorCenter === undefined ? ROOM_W : Math.max(0, doorCenter + ROOM_W / 2 - gap / 2);
      const rightWidth = doorCenter === undefined ? 0 : Math.max(0, ROOM_W / 2 - doorCenter - gap / 2);

      if (doorCenter === undefined) {
        addBox(group, [ROOM_W, WALL_H, 0.24], [0, WALL_H / 2, z], color);
        return;
      }

      if (leftWidth > 0.4) addBox(group, [leftWidth, WALL_H, 0.24], [-ROOM_W / 2 + leftWidth / 2, WALL_H / 2, z], color);
      if (rightWidth > 0.4) addBox(group, [rightWidth, WALL_H, 0.24], [ROOM_W / 2 - rightWidth / 2, WALL_H / 2, z], color);
      addBox(group, [gap + 0.8, 1.25, 0.3], [doorCenter, 4.58, z], "#4a3728");
      addBox(group, [0.28, 4, 0.34], [doorCenter - gap / 2, 2, z], "#4a3728");
      addBox(group, [0.28, 4, 0.34], [doorCenter + gap / 2, 2, z], "#4a3728");
    }

    function addSideWall(group: THREE.Group, x: number, color: string, doorZ?: number) {
      const gap = doorZ === undefined ? 0 : 3.8;
      if (doorZ === undefined) {
        addBox(group, [0.24, WALL_H, ROOM_D], [x, WALL_H / 2, 0], color);
        return;
      }

      const front = Math.max(0, doorZ + ROOM_D / 2 - gap / 2);
      const back = Math.max(0, ROOM_D / 2 - doorZ - gap / 2);
      if (front > 0.4) addBox(group, [0.24, WALL_H, front], [x, WALL_H / 2, -ROOM_D / 2 + front / 2], color);
      if (back > 0.4) addBox(group, [0.24, WALL_H, back], [x, WALL_H / 2, ROOM_D / 2 - back / 2], color);
      addBox(group, [0.32, 1.25, gap + 0.8], [x, 4.58, doorZ], "#4a3728");
      addBox(group, [0.32, 4, 0.28], [x, 2, doorZ - gap / 2], "#4a3728");
      addBox(group, [0.32, 4, 0.28], [x, 2, doorZ + gap / 2], "#4a3728");
    }

    function addRoom(roomKey: RoomKey, wingIndex: number) {
      const station = stationFor(roomKey, wingIndex);
      const palette = roomColors[roomKey];
      const group = new THREE.Group();
      group.position.set(station.x, 0, station.z);
      world.add(group);

      addBox(group, [ROOM_W + 0.4, 0.18, ROOM_D + 0.4], [0, -0.09, 0], palette.floor, { roughness: 0.36, map: floorTexture });
      addBox(group, [ROOM_W + 0.2, 0.22, ROOM_D + 0.2], [0, WALL_H + 0.12, 0], "#E8E4DC", { roughness: 0.65, emissive: "#4A4539", emissiveIntensity: 0.08 });

      const hasNorth = roomKey === "entrance" || roomKey === "main" || roomKey === "court" || roomKey === "corridor";
      const hasSouth = roomKey === "main" || roomKey === "court" || roomKey === "corridor";
      const westDoor = roomKey === "main" ? 0 : roomKey === "left" ? 0 : undefined;
      const eastDoor = roomKey === "main" ? 0 : roomKey === "right" ? 0 : undefined;

      addWallSegments(group, -ROOM_D / 2, palette.wall, hasNorth ? 0 : undefined);
      addWallSegments(group, ROOM_D / 2, palette.wall, hasSouth || roomKey === "entrance" ? 0 : undefined);
      addSideWall(group, -ROOM_W / 2, palette.wall, westDoor);
      addSideWall(group, ROOM_W / 2, palette.wall, eastDoor);

      addBox(group, [ROOM_W + 0.1, 0.16, 0.18], [0, 3.55, -ROOM_D / 2 + 0.05], palette.rail);
      addBox(group, [ROOM_W + 0.1, 0.16, 0.18], [0, 1.05, -ROOM_D / 2 + 0.05], palette.rail);
      addBox(group, [ROOM_W + 0.1, 0.16, 0.18], [0, 3.55, ROOM_D / 2 - 0.05], palette.rail);
      addBox(group, [ROOM_W + 0.1, 0.16, 0.18], [0, 1.05, ROOM_D / 2 - 0.05], palette.rail);

      addBox(group, [0.16, WALL_H + 0.12, 0.16], [-ROOM_W / 2 + 0.28, WALL_H / 2, -ROOM_D / 2 + 0.28], palette.trim, { roughness: 0.48 });
      addBox(group, [0.16, WALL_H + 0.12, 0.16], [ROOM_W / 2 - 0.28, WALL_H / 2, -ROOM_D / 2 + 0.28], palette.trim, { roughness: 0.48 });
      addBox(group, [0.16, WALL_H + 0.12, 0.16], [-ROOM_W / 2 + 0.28, WALL_H / 2, ROOM_D / 2 - 0.28], palette.trim, { roughness: 0.48 });
      addBox(group, [0.16, WALL_H + 0.12, 0.16], [ROOM_W / 2 - 0.28, WALL_H / 2, ROOM_D / 2 - 0.28], palette.trim, { roughness: 0.48 });

      const brandBand = addBox(group, [ROOM_W * 0.42, 0.32, 0.05], [0, 4.15, ROOM_D / 2 - 0.18], BRAND_TEAL, {
        roughness: 0.35,
        emissive: BRAND_TEAL,
        emissiveIntensity: 0.05,
      });
      brandBand.name = `RenewCanvas Africa wall band ${roomKey}`;

      const brandTexture = new THREE.CanvasTexture(
        createTextCanvas("RenewCanvas Africa", `${wingName(wingIndex)} ${station.label}`, "#f4eadb")
      );
      const brandSign = new THREE.Mesh(
        new THREE.PlaneGeometry(3.7, 1.38),
        new THREE.MeshBasicMaterial({ map: brandTexture, transparent: true })
      );
      brandSign.position.set(0, 2.9, ROOM_D / 2 - 0.32);
      brandSign.rotation.y = Math.PI;
      group.add(brandSign);

      const skylight = addBox(group, [5.4, 0.08, 2.6], [0, WALL_H + 0.24, -1], "#eafaff", { roughness: 0.18 });
      skylight.material = new THREE.MeshPhysicalMaterial({
        color: "#eafaff",
        emissive: "#c5f7ff",
        emissiveIntensity: 0.6,
        roughness: 0.18,
        transmission: 0.15,
      });

      const ceilingLight = new THREE.PointLight("#fff1cf", roomKey === "court" ? 9 : 6, 16, 1.8);
      ceilingLight.position.set(0, WALL_H - 0.4, -1);
      ceilingLight.castShadow = false;
      group.add(ceilingLight);

      // Procedural chandelier for entrance (replaces 58 MB GLB)
      if (roomKey === "entrance" && wingIndex === 0) {
        const chandelier = new THREE.Group();
        chandelier.position.set(0, 4.4, -1);

        const brassMaterial = new THREE.MeshStandardMaterial({
          color: "#c79a3a",
          metalness: 0.85,
          roughness: 0.25,
          emissive: "#3a2810",
          emissiveIntensity: 0.18,
        });
        const crystalMaterial = new THREE.MeshPhysicalMaterial({
          color: "#fff7d8",
          metalness: 0,
          roughness: 0.08,
          transmission: 0.6,
          thickness: 0.15,
          emissive: "#ffe7a0",
          emissiveIntensity: 0.35,
        });

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), brassMaterial);
        stem.position.y = 0.6;
        chandelier.add(stem);

        const hub = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), brassMaterial);
        chandelier.add(hub);

        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 8, 24), brassMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.12;
        chandelier.add(ring);

        const bulbCount = 8;
        for (let i = 0; i < bulbCount; i += 1) {
          const angle = (i / bulbCount) * Math.PI * 2;
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), brassMaterial);
          arm.position.set(Math.cos(angle) * 0.28, -0.18, Math.sin(angle) * 0.28);
          arm.rotation.z = Math.cos(angle) * 0.5;
          arm.rotation.x = Math.sin(angle) * 0.5;
          chandelier.add(arm);

          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), crystalMaterial);
          bulb.position.set(Math.cos(angle) * 0.55, -0.32, Math.sin(angle) * 0.55);
          chandelier.add(bulb);
        }

        group.add(chandelier);

        const chandelierLight = new THREE.PointLight("#fff5d0", 2.2, 14, 1.5);
        chandelierLight.position.set(0, 4.0, -1);
        chandelierLight.castShadow = false;
        group.add(chandelierLight);
      }

      if (roomKey === "court") {
        addBox(group, [2.1, 0.55, 2.1], [0, 0.25, 0], "#d2c9b8");
        addBox(group, [0.9, 2.8, 0.9], [0, 1.75, 0], "#f1eadc", { roughness: 0.5 });
      }

      if (roomKey === "main" || roomKey === "left" || roomKey === "right") {
        addBox(group, [4.4, 0.55, 1.05], [0, 0.26, 2.8], "#263a35");
        addBox(group, [0.3, 0.8, 0.3], [-1.7, -0.22, 2.8], "#1d2926");
        addBox(group, [0.3, 0.8, 0.3], [1.7, -0.22, 2.8], "#1d2926");

        // Pipe lamp in main gallery (first wing only)
        if (roomKey === "main" && wingIndex === 0) {
          const pipeLampMaterial = loadPBRMaterial(
            "/textures/industrial_pipe_lamp",
            "#2A2A2A",
            { roughness: 0.4, metalness: 0.7 }
          );
          const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 12), pipeLampMaterial);
          pipe.position.set(0, WALL_H - 0.6, -1);
          group.add(pipe);
          const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.45, 16), pipeLampMaterial);
          lampShade.position.set(0, WALL_H - 1.25, -1);
          group.add(lampShade);
        }

        // Fluorescent housing in side galleries (first wing only)
        if ((roomKey === "left" || roomKey === "right") && wingIndex === 0) {
          const fluorescentMaterial = loadPBRMaterial(
            "/textures/mounted_fluorescent_lights",
            "#E0E0E0",
            { roughness: 0.3, metalness: 0.2 }
          );
          const housing = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 0.35), fluorescentMaterial);
          housing.position.set(0, WALL_H - 0.25, -1);
          group.add(housing);
          const tubeMaterial = new THREE.MeshStandardMaterial({
            color: "#FFF9E0",
            emissive: "#FFF9E0",
            emissiveIntensity: 0.5,
            roughness: 0.1,
          });
          [-0.6, 0.6].forEach((offset) => {
            const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.1, 12), tubeMaterial);
            tube.rotation.z = Math.PI / 2;
            tube.position.set(0, WALL_H - 0.35, -1 + offset * 0.15);
            group.add(tube);
          });
        }
      }

      // Pendant bulbs in corridor (first wing only)
      if (roomKey === "corridor" && wingIndex === 0) {
        const lightbulbMaterial = loadPBRMaterial(
          "/textures/lightbulb_01",
          "#FFFACD",
          { roughness: 0.2, metalness: 0.1 }
        );
        [-2, 0, 2].forEach((xPos) => {
          const cord = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8),
            new THREE.MeshStandardMaterial({ color: "#1A1A1A", roughness: 0.6 })
          );
          cord.position.set(xPos, WALL_H - 0.75, 0);
          group.add(cord);
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), lightbulbMaterial);
          bulb.position.set(xPos, WALL_H - 1.5, 0);
          group.add(bulb);
        });
      }
    }

    function addDoorHotspot(fromRoom: RoomKey, wingIndex: number, target: DoorRuntimeTarget) {
      const from = stationFor(fromRoom, wingIndex);
      const geometry = new THREE.CircleGeometry(0.9, 48);
      const material = new THREE.MeshBasicMaterial({ color: BRAND_ORANGE, transparent: true, opacity: 0.42, side: THREE.DoubleSide });
      const hotspot = new THREE.Mesh(geometry, material);
      hotspot.position.set(from.x + target.localPosition[0], target.localPosition[1], from.z + target.localPosition[2]);
      hotspot.rotation.x = -Math.PI / 2;
      hotspot.userData = { type: "door", target, wing: wingIndex };
      scene.add(hotspot);
      clickablesRef.current.push(hotspot);

      const labelCanvas = createTextCanvas(target.label, "Walk through", "#f7dfad");
      const texture = new THREE.CanvasTexture(labelCanvas);
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 0.82),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide })
      );
      label.position.set(from.x + target.localPosition[0], 2.1, from.z + target.localPosition[2]);
      label.lookAt(camera.position.x, 2.1, camera.position.z);
      scene.add(label);
    }

    function addArtwork(placement: ArtworkPlacement) {
      const { artwork, slotIndex, roomKey, wingIndex, curationRoomTitle, curationGrouping, curationExplanation } = placement;
      const station = stationFor(roomKey, wingIndex);
      const wallSlots = wallPlacementsForRoom(roomKey);
      const wallSlot = wallSlots[slotIndex % wallSlots.length] ?? { x: 0, z: -ROOM_D / 2 + FRAME_DEPTH / 2, rotY: 0 };
      const group = new THREE.Group();
      group.position.set(station.x + wallSlot.x, FRAME_CENTER_Y, station.z + wallSlot.z);
      group.rotation.y = wallSlot.rotY;
      scene.add(group);

      addBox(group, [FRAME_W, FRAME_H, 0.16], [0, 0, 0], "#3d2c1d", { roughness: 0.6 });
      addBox(group, [2.02, 2.62, 0.18], [0, 0, -0.04], "#f2eadc", { roughness: 0.52 });

      const fallbackTexture = new THREE.CanvasTexture(createArtworkCanvas(artwork));
      fallbackTexture.colorSpace = THREE.SRGBColorSpace;
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(ARTWORK_IMAGE_W, ARTWORK_IMAGE_H),
        new THREE.MeshPhysicalMaterial({
          map: fallbackTexture,
          color: "#ffffff",
          roughness: 0.56,
          clearcoat: 0.16,
          clearcoatRoughness: 0.48,
        })
      );
      plane.position.z = 0.07;
      group.add(plane);

      artworkTextureTargets.push({ plane, placement, imageUrl: artwork.image, loaded: false });

      const plaqueTexture = new THREE.CanvasTexture(createTextCanvas(artwork.title, artwork.artist));
      plaqueTexture.colorSpace = THREE.SRGBColorSpace;
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(1.65, 0.46),
        new THREE.MeshBasicMaterial({ map: plaqueTexture, transparent: true, side: THREE.DoubleSide, depthWrite: false })
      );
      plaque.position.set(0, -1.32, 0.09);
      plaque.renderOrder = 10;
      group.add(plaque);

      const categoryTexture = new THREE.CanvasTexture(createTextCanvas(curationRoomTitle, curationGrouping, "#dff6f3"));
      categoryTexture.colorSpace = THREE.SRGBColorSpace;
      const categoryPlaque = new THREE.Mesh(
        new THREE.PlaneGeometry(1.45, 0.34),
        new THREE.MeshBasicMaterial({ map: categoryTexture, transparent: true, side: THREE.DoubleSide, depthWrite: false })
      );
      categoryPlaque.position.set(0, -1.72, 0.09);
      categoryPlaque.renderOrder = 10;
      group.add(categoryPlaque);

      group.userData = { type: "artwork", artwork: { ...artwork, curationExplanation, curationRoomTitle } };
      clickablesRef.current.push(group);
    }

    function disposeObject(object: THREE.Object3D) {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
          child.geometry.dispose();
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            Object.values(material).forEach((value) => {
              if (value instanceof THREE.Texture) value.dispose();
            });
            material.dispose();
          });
        }
      });
    }

    function createExteriorTextTexture(draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void) {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 160;
      const ctx = canvas.getContext("2d");
      if (ctx) draw(ctx, canvas);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    // Cache textures + materials by basePath so repeated wings reuse them
    const pbrTextureCache = new Map<string, THREE.Texture>();
    const sharedTextureLoader = new THREE.TextureLoader();

    function loadPBRMaterial(
      basePath: string,
      baseColor: string,
      materialProps: Partial<THREE.MeshStandardMaterialParameters> = {}
    ) {
      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        ...materialProps,
      });

      const cached = pbrTextureCache.get(basePath);
      if (cached) {
        material.map = cached;
        material.needsUpdate = true;
        return material;
      }

      sharedTextureLoader.load(
        `${basePath}_diff_4k.jpg`,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.anisotropy = 4;
          pbrTextureCache.set(basePath, texture);
          material.map = texture;
          material.needsUpdate = true;
        },
        undefined,
        () => {
          // Silently fall back to baseColor
        }
      );

      // EXR normal/roughness skipped: not supported by default TextureLoader in browsers
      return material;
    }

    function buildExterior(sceneRef: THREE.Scene): THREE.Group {
      const mode = new Date().getHours() < 18 ? "day" : "night";

      // Three explicit named groups, per scene-structure rule:
      //   OutdoorWorld    -> sky, terrain, trees, path, lamps, bollards, benches
      //   MuseumBuildingShell -> facade walls, columns, glass doors, lintel, sign
      //   InteriorGallery -> already lives in `world` (built later)
      const exterior = new THREE.Group();
      exterior.name = "ExteriorRoot";

      const outdoorWorld = new THREE.Group();
      outdoorWorld.name = "OutdoorWorld";
      const buildingShell = new THREE.Group();
      buildingShell.name = "MuseumBuildingShell";
      exterior.add(outdoorWorld);
      exterior.add(buildingShell);

      // Enhanced materials with PBR textures
      const groundMaterial = loadPBRMaterial(
        "/textures/namaqualand_boulder_02",
        "#3D3028",
        { roughness: 0.95 }
      );

      const pathMaterial = new THREE.MeshStandardMaterial({ color: "#5C4A3A", roughness: 0.92 });
      const borderMaterial = new THREE.MeshStandardMaterial({ color: "#8B7355", roughness: 0.88 });
      const sandstoneMaterial = new THREE.MeshStandardMaterial({ color: "#C4A882", roughness: 0.82, metalness: 0 });
      const ledgeMaterial = new THREE.MeshStandardMaterial({ color: "#B09070", roughness: 0.78 });

      // --- OutdoorWorld: terrain and approach ---
      // Ground plane is only on the OUTDOOR side of the facade (z > -12),
      // so interior floors don't compete with it.
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 34), groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(0, -0.01, 5);
      ground.receiveShadow = true;
      outdoorWorld.add(ground);

      // Path runs from camera approach (z=24) up to the facade (z=-12).
      const path = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 36), pathMaterial);
      path.rotation.x = -Math.PI / 2;
      path.position.set(0, 0, 6);
      path.receiveShadow = true;
      outdoorWorld.add(path);

      [-2.37, 2.37].forEach((x) => {
        const border = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 36), borderMaterial);
        border.rotation.x = -Math.PI / 2;
        border.position.set(x, 0.01, 6);
        outdoorWorld.add(border);
      });

      // --- MuseumBuildingShell: split facade with real door opening ---
      // Door opening: x in [-3, 3], y in [0, 5]. Lobby south wall door
      // sits at the same z=-12 with a 3.5-unit gap; the wider 6-unit
      // shell opening keeps the door clearly visible from outside.
      const FACADE_Z = -12;
      const SHELL_TOP = 11;

      // Left wing wall (x: -11 to -3)
      const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(8, SHELL_TOP, 0.8), sandstoneMaterial);
      wallLeft.position.set(-7, SHELL_TOP / 2, FACADE_Z);
      wallLeft.castShadow = true;
      wallLeft.receiveShadow = true;
      buildingShell.add(wallLeft);

      // Right wing wall (x: 3 to 11)
      const wallRight = new THREE.Mesh(new THREE.BoxGeometry(8, SHELL_TOP, 0.8), sandstoneMaterial);
      wallRight.position.set(7, SHELL_TOP / 2, FACADE_Z);
      wallRight.castShadow = true;
      wallRight.receiveShadow = true;
      buildingShell.add(wallRight);

      // Lintel above door opening
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(6.4, SHELL_TOP - 5, 0.9), sandstoneMaterial);
      lintel.position.set(0, 5 + (SHELL_TOP - 5) / 2, FACADE_Z);
      lintel.castShadow = true;
      buildingShell.add(lintel);

      // Cornice / roof ledge across the top
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(23, 0.6, 1.4), ledgeMaterial);
      cornice.position.set(0, SHELL_TOP + 0.3, FACADE_Z + 0.2);
      buildingShell.add(cornice);

      // Side extensions giving the building width/depth
      [-15, 15].forEach((x) => {
        const extension = new THREE.Mesh(new THREE.BoxGeometry(8, 10, 12), sandstoneMaterial);
        extension.position.set(x, 5, FACADE_Z - 4);
        extension.castShadow = true;
        extension.receiveShadow = true;
        buildingShell.add(extension);
      });

      // Vine strip across the top of the facade
      const vineStrip = new THREE.Mesh(
        new THREE.PlaneGeometry(22, 0.8),
        new THREE.MeshStandardMaterial({ color: "#1A3D1A", transparent: true, opacity: 0.75, side: THREE.DoubleSide, roughness: 0.9 })
      );
      vineStrip.position.set(0, SHELL_TOP + 0.65, FACADE_Z + 0.6);
      vineStrip.rotation.x = degToRad(-8);
      buildingShell.add(vineStrip);

      // Decorative entrance columns (just in front of facade)
      [-3.8, 3.8].forEach((x) => {
        const column = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, SHELL_TOP, 10), sandstoneMaterial);
        column.position.set(x, SHELL_TOP / 2, FACADE_Z + 0.7);
        column.castShadow = true;
        buildingShell.add(column);
      });

      // Glass entrance doors for continuous building view-through
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: "#E8F4F8",
        transparent: true,
        opacity: 0.25,
        roughness: 0.05,
        metalness: 0,
        transmission: 0.95,
        thickness: 0.1,
      });

      const doorFrameMaterial = new THREE.MeshStandardMaterial({
        color: "#1A1A1A",
        roughness: 0.3,
        metalness: 0.6,
      });

      // Door frames (vertical posts) — part of the building shell
      [-3, -0.1, 0.1, 3].forEach((x) => {
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 5, 0.2),
          doorFrameMaterial
        );
        frame.position.set(x, 2.5, FACADE_Z + 0.05);
        frame.castShadow = true;
        buildingShell.add(frame);
      });

      // Horizontal top frame at door opening
      const topFrame = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.2, 0.2), doorFrameMaterial);
      topFrame.position.set(0, 5, FACADE_Z + 0.05);
      topFrame.castShadow = true;
      buildingShell.add(topFrame);

      // Glass panels in the door opening — boundary plane
      const leftGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 4.8), glassMaterial);
      leftGlass.position.set(-1.5, 2.5, FACADE_Z + 0.02);
      buildingShell.add(leftGlass);
      const rightGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 4.8), glassMaterial);
      rightGlass.position.set(1.5, 2.5, FACADE_Z + 0.02);
      buildingShell.add(rightGlass);

      // --- OutdoorWorld: benches, bollards, lamps, trees ---
      const benchMaterial = loadPBRMaterial(
        "/textures/namaqualand_boulder_02",
        "#B8A898",
        { roughness: 0.85, metalness: 0 }
      );
      [-4.5, 4.5].forEach((x) => {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.24, 0.75), benchMaterial);
        seat.position.set(x, 0.56, -2);
        seat.castShadow = true;
        seat.receiveShadow = true;
        outdoorWorld.add(seat);
        [-0.7, 0.7].forEach((legOffset) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.56, 0.75), benchMaterial);
          leg.position.set(x + legOffset, 0.28, -2);
          outdoorWorld.add(leg);
        });
      });

      const bollardCapMaterial = new THREE.MeshStandardMaterial({
        color: "#18140A",
        roughness: 0.35,
        metalness: 0.8,
        emissive: "#FF9944",
        emissiveIntensity: mode === "night" ? 0.8 : 0,
      });
      const bollardPostMaterial = new THREE.MeshStandardMaterial({ color: "#18140A", roughness: 0.4, metalness: 0.8 });
      // All bollards have z > -10, well clear of the facade at z=-12
      const bollardPositions = [12, 9.5, 7, 4.5, 2, -0.5].flatMap((z) => [-2.8, 2.8].map((x) => [x, z] as const));
      bollardPositions.forEach(([x, z]) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.95, 12), bollardPostMaterial);
        post.position.set(x, 0.475, z);
        outdoorWorld.add(post);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.09, 12), bollardCapMaterial);
        cap.position.set(x, 0.97, z);
        outdoorWorld.add(cap);
      });

      // Two tall street lamps flanking the approach path (per reference).
      const lampMetal = new THREE.MeshStandardMaterial({ color: "#1f1f1f", roughness: 0.35, metalness: 0.85 });
      const lampGlowMat = new THREE.MeshStandardMaterial({
        color: "#fff2cf",
        emissive: "#ffd58a",
        emissiveIntensity: mode === "night" ? 1.2 : 0.35,
        roughness: 0.2,
      });
      [-5, 5].forEach((sx) => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 6, 10), lampMetal);
        pole.position.set(sx, 3, 5);
        pole.castShadow = true;
        outdoorWorld.add(pole);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.7), lampMetal);
        arm.position.set(sx, 6.2, 4.7);
        outdoorWorld.add(arm);
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 12), lampMetal);
        head.position.set(sx, 6.35, 4.45);
        outdoorWorld.add(head);
        const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 12), lampGlowMat);
        glow.position.set(sx, 6.2, 4.45);
        outdoorWorld.add(glow);
        if (mode === "night") {
          const streetLight = new THREE.PointLight("#fff2cf", 1.6, 12, 2);
          streetLight.position.set(sx, 6.2, 4.45);
          streetLight.castShadow = false;
          outdoorWorld.add(streetLight);
        }
      });

      // Gold sign panel above the entrance (mounted on the shell).
      const signPanel = new THREE.Mesh(
        new THREE.BoxGeometry(5, 0.7, 0.15),
        new THREE.MeshStandardMaterial({ color: "#1A1A1A", roughness: 0.4, metalness: 0.2 })
      );
      signPanel.position.set(0, 7.5, FACADE_Z + 0.5);
      buildingShell.add(signPanel);
      const signText = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.35, 0.18),
        new THREE.MeshStandardMaterial({
          color: "#caa14a",
          metalness: 0.85,
          roughness: 0.3,
          emissive: "#7a5a18",
          emissiveIntensity: mode === "night" ? 0.55 : 0.2,
        })
      );
      signText.position.set(0, 7.5, FACADE_Z + 0.6);
      buildingShell.add(signText);

      // Trees (outdoor). All tree positions stay at z >= -5, safely outside.
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: "#3D2B1A", roughness: 0.85 });
      const canopyMaterial = loadPBRMaterial(
        "/textures/othonna_cerarioides",
        "#1A3D1A",
        { roughness: 0.9, side: THREE.DoubleSide }
      );
      const treePositions = [[-5.5, -5], [5.5, -5], [-7, -1], [7, -1], [-4, 2], [4, 2]];
      treePositions.forEach(([x, z], index) => {
        const trunkRadius = 0.12 + (index % 3) * 0.02;
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, 1.8, 10),
          trunkMaterial
        );
        trunk.position.set(x, 0.9, z);
        trunk.castShadow = true;
        outdoorWorld.add(trunk);
        const canopySize = 1.2 + (index % 4) * 0.15;
        const mainCanopy = new THREE.Mesh(
          new THREE.IcosahedronGeometry(canopySize, 1),
          canopyMaterial
        );
        mainCanopy.position.set(x, 2.8, z);
        mainCanopy.castShadow = true;
        outdoorWorld.add(mainCanopy);
      });

      const hotspotMaterial = new THREE.MeshStandardMaterial({
        color: BRAND_ORANGE,
        emissive: BRAND_ORANGE,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      // Hotspot stays outside the facade (z > -12)
      const hotspot = new THREE.Mesh(new THREE.CircleGeometry(1, 32), hotspotMaterial);
      hotspot.rotation.x = -Math.PI / 2;
      hotspot.position.set(0, 0.02, -10);
      hotspot.userData = { type: "exteriorEnter" };
      outdoorWorld.add(hotspot);
      exteriorHotspotRef.current = hotspot;
      clickablesRef.current.push(hotspot);

      const enterTexture = createExteriorTextTexture((ctx) => {
        ctx.clearRect(0, 0, 1024, 160);
        ctx.fillStyle = BRAND_ORANGE;
        ctx.font = "bold 72px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("ENTER MUSEUM", 512, 80);
      });
      const enterLabel = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 0.4),
        new THREE.MeshBasicMaterial({ map: enterTexture, transparent: true, side: THREE.DoubleSide })
      );
      enterLabel.position.set(0, 1.2, -10);
      outdoorWorld.add(enterLabel);
      exteriorLabelRef.current = enterLabel;

      if (mode === "day") {
        const hemi = new THREE.HemisphereLight("#87CEEB", "#8B6914", 0.7);
        outdoorWorld.add(hemi);
        const sunLight = new THREE.DirectionalLight("#FFF4E0", 1.2);
        sunLight.position.set(6, 14, 8);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.set(1024, 1024);
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 60;
        sunLight.shadow.camera.left = -18;
        sunLight.shadow.camera.right = 18;
        sunLight.shadow.camera.top = 18;
        sunLight.shadow.camera.bottom = -18;
        outdoorWorld.add(sunLight);
        sceneRef.background = new THREE.Color("#87CEEB");
      } else {
        outdoorWorld.add(new THREE.AmbientLight("#0A0A2A", 0.15));
        sceneRef.background = new THREE.Color("#0A0A1A");
        const starPositions = new Float32Array(200 * 3);
        for (let i = 0; i < 200; i += 1) {
          starPositions[i * 3] = (Math.random() - 0.5) * 200;
          starPositions[i * 3 + 1] = 20 + Math.random() * 50;
          starPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        outdoorWorld.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: "#FFFFFF", size: 0.18, sizeAttenuation: true })));
        // Sparse bollard glow lights (every other position) to save GPU
        bollardPositions.filter((_, i) => i % 2 === 0).forEach(([x, z]) => {
          const bollardLight = new THREE.PointLight("#FF9944", 0.75, 7, 2);
          bollardLight.position.set(x, 0.95, z);
          bollardLight.castShadow = false;
          outdoorWorld.add(bollardLight);
        });
        const archSpot = new THREE.SpotLight("#FFD070", 1.6, 18, 0.32, 0.45);
        archSpot.position.set(0, 14, -8);
        archSpot.target.position.set(0, 8, -11.5);
        exterior.add(archSpot);
        exterior.add(archSpot.target);
      }

      sceneRef.add(exterior);
      return exterior;
    }

    function disposeExterior(exteriorGroup: THREE.Group | null, sceneRef: THREE.Scene) {
      if (!exteriorGroup) return;
      sceneRef.remove(exteriorGroup);
      disposeObject(exteriorGroup);
      exteriorGroupRef.current = null;
      exteriorHotspotRef.current = null;
      exteriorLabelRef.current = null;
      clickablesRef.current = [];
    }

    function buildMuseum() {
      clickablesRef.current = [];
      // Two wings instead of five: 60% fewer rooms, lights, draw calls.
      // The "infinite museum" wing loop still works for navigation.
      const wingRange = [0, 1];

      wingRange.forEach((wingIndex) => {
        roomStations.forEach((station) => addRoom(station.key, wingIndex));

        roomStations.forEach((station) => {
          doorRuntimeTargets[station.key].forEach((target) => {
            addDoorHotspot(station.key, wingIndex, target);
          });
        });
      });

      getArtworkPlacements(artworks).forEach((placement) => {
        addArtwork(placement);
      });
      loadTexturesForActiveRoom(roomRef.current, wingRef.current);
    }

    let museumBuilt = false;
    const buildInteriorOnce = () => {
      if (museumBuilt) return;
      // Geometry only. Do NOT touch scene.background or scene.fog —
      // buildExterior owns the sky, and continuous architecture means
      // we never swap render state on enter.
      buildMuseum();
      museumBuilt = true;
    };

    const enterBuilding = () => {
      if (sceneStateRef.current === "interior") return;
      // Continuous architecture: same building, same scene. Just teleport
      // the camera through the entrance to the lobby station.
      sceneStateRef.current = "interior";
      const entranceStation = stationFor("entrance", 0);
      camera.position.set(entranceStation.x, CAMERA_Y, entranceStation.z + 4);
      targetRef.current.set(entranceStation.x, CAMERA_Y, entranceStation.z);
      yawRef.current = 0;
      pitchRef.current = 0;
      roomRef.current = "entrance";
      wingRef.current = 0;
      setRoom("entrance");
      setWing(0);
      loadTexturesForActiveRoom("entrance", 0);
    };

    // Always start outside with the camera intro animation.
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let introT = 0;
    const INTRO_MS = 3200;
    const introFrom = new THREE.Vector3(0, CAMERA_Y, 22);
    const introTo = new THREE.Vector3(0, CAMERA_Y, 6);
    const smoothstep = (t: number) => t * t * (3 - 2 * t);

    sceneStateRef.current = "exterior";
    clickablesRef.current = [];
    // Outdoor scene first (sets sky bg + outdoor lights).
    exteriorGroupRef.current = buildExterior(scene);
    // Indoor geometry built eagerly so users can walk through the entrance
    // without a reload (continuous architecture).
    buildInteriorOnce();

    camera.position.copy(introFrom);
    targetRef.current.copy(introFrom);
    yawRef.current = 0;
    // Reduced motion: skip animation but stay outside
    if (prefersReducedMotion) {
      camera.position.copy(introTo);
      targetRef.current.copy(introTo);
      introT = 1;
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const goTo = (target: DoorTarget, baseWing: number) => {
      const nextWing = baseWing + (target.wingOffset ?? 0);
      const station = stationFor(target.room, nextWing);
      targetRef.current.set(station.x, CAMERA_Y, station.z);
      yawRef.current = degToRad(target.heading);
      roomRef.current = target.room;
      wingRef.current = nextWing;
      setWing(nextWing);
      setRoom(target.room);
      loadTexturesForActiveRoom(target.room, nextWing);
    };

    const chooseDoorFromHeading = (activeRoom: RoomKey, activeWing: number, backward: boolean) => {
      const station = stationFor(activeRoom, activeWing);
      const cameraDirection = -yawRef.current + (backward ? Math.PI : 0);
      const candidates = doorRuntimeTargets[activeRoom];

      return candidates.reduce(
        (best, candidate) => {
          const doorWorldX = station.x + candidate.localPosition[0];
          const doorWorldZ = station.z + candidate.localPosition[2];
          const angleToDoor = Math.atan2(doorWorldX - targetRef.current.x, -(doorWorldZ - targetRef.current.z));
          const angleDistance = Math.abs(normalizeAngle(angleToDoor - cameraDirection));

          return angleDistance < best.angleDistance ? { target: candidate, angleDistance } : best;
        },
        { target: candidates[0], angleDistance: Number.POSITIVE_INFINITY }
      ).target;
    };

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickablesRef.current, true);
      const hit = hits.find((item) => item.object.userData.type || item.object.parent?.userData.type);
      const data = hit?.object.userData.type ? hit.object.userData : hit?.object.parent?.userData;

      if (data?.type === "door") {
        goTo(data.target, data.wing);
      }

      if (data?.type === "exteriorEnter") {
        enterBuilding();
      }

      if (data?.type === "artwork") {
        setSelectedArtwork(data.artwork);
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (sceneStateRef.current === "exterior") {
        return;
      }

      const now = performance.now();
      wheelDeltaRef.current += event.deltaY;

      if (Math.abs(wheelDeltaRef.current) < 260 || now - lastWheelNavRef.current < 850) {
        return;
      }

      lastWheelNavRef.current = now;
      const activeRoom = roomRef.current;
      const activeWing = wingRef.current;
      const target = chooseDoorFromHeading(activeRoom, activeWing, false);
      if (target) goTo(target, activeWing);
      wheelDeltaRef.current = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        yaw: yawRef.current,
        pitch: pitchRef.current
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current) return;
      // Update yaw (horizontal rotation)
      yawRef.current = dragRef.current.yaw - (event.clientX - dragRef.current.x) * 0.0022;

      // Update pitch (vertical rotation) with clamping to prevent gimbal lock
      const newPitch = dragRef.current.pitch + (event.clientY - dragRef.current.y) * 0.0022;
      const MAX_PITCH = Math.PI / 2.2; // ~82 degrees up/down
      pitchRef.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, newPitch));
    };

    const onPointerUp = () => {
      dragRef.current = null;
    };

    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerUp);

    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "s", "a", "d", "q", "e"].includes(event.key)) {
        event.preventDefault();
      }

      // Smooth WASD movement (set key states)
      if (event.key === "w" || event.key === "ArrowUp") keysRef.current.forward = true;
      if (event.key === "s" || event.key === "ArrowDown") keysRef.current.backward = true;
      if (event.key === "a") keysRef.current.left = true;
      if (event.key === "d") keysRef.current.right = true;

      // Arrow keys and Q/E for camera rotation
      if (event.key === "ArrowLeft" || event.key === "q") {
        yawRef.current += degToRad(18);
      }

      if (event.key === "ArrowRight" || event.key === "e") {
        yawRef.current -= degToRad(18);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "w" || event.key === "ArrowUp") keysRef.current.forward = false;
      if (event.key === "s" || event.key === "ArrowDown") keysRef.current.backward = false;
      if (event.key === "a") keysRef.current.left = false;
      if (event.key === "d") keysRef.current.right = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", resize);

    // Removed interior state check - we always start in exterior mode
    // Both scenes are built on load, camera starts outside

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      if (sceneStateRef.current === "exterior" && introT < 1 && !prefersReducedMotion) {
        introT = Math.min(introT + delta / (INTRO_MS / 1000), 1);
        camera.position.lerpVectors(introFrom, introTo, smoothstep(introT));
        targetRef.current.copy(camera.position);
        // Intro: face toward entrance (yaw = 0, pitch = 0)
        yawRef.current = 0;
        pitchRef.current = 0;
      } else {
        // Smooth WASD movement
        const keys = keysRef.current;
        const speed = 5; // units per second
        const moveDistance = speed * delta;

        let dx = 0;
        let dz = 0;

        if (keys.forward) dz -= moveDistance;
        if (keys.backward) dz += moveDistance;
        if (keys.left) dx -= moveDistance;
        if (keys.right) dx += moveDistance;

        if (dx !== 0 || dz !== 0) {
          const yaw = yawRef.current;
          const moveX = dx * Math.cos(yaw) - dz * Math.sin(yaw);
          const moveZ = dx * Math.sin(yaw) + dz * Math.cos(yaw);

          targetRef.current.x += moveX;
          targetRef.current.z += moveZ;

          // Collision bounds (optional - keeps camera within reasonable area)
          targetRef.current.x = Math.max(-25, Math.min(25, targetRef.current.x));
          targetRef.current.z = Math.max(-80, Math.min(22, targetRef.current.z));
        }

        camera.position.lerp(targetRef.current, 0.08);
      }
      // Unified first-person camera rotation (yaw + pitch) for both exterior and interior
      camera.rotation.order = "YXZ"; // Critical for FPS controls
      camera.rotation.y = yawRef.current;
      camera.rotation.x = pitchRef.current;

      if (sceneStateRef.current === "exterior") {
        exteriorLabelRef.current?.lookAt(camera.position.x, CAMERA_Y, camera.position.z);
        const hotspot = exteriorHotspotRef.current;
        if (hotspot?.material instanceof THREE.MeshStandardMaterial) {
          hotspot.material.emissiveIntensity = 0.3 + 0.2 * Math.sin(elapsed * 2);
        }
        // Continuous architecture: removed automatic entrance trigger at z < -10
        // User can walk through naturally without forced scene transition
      }

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshBasicMaterial && object.geometry instanceof THREE.CircleGeometry) {
          object.material.opacity = 0.34 + Math.sin(elapsed * 2.4) * 0.08;
        }
      });

      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", resize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [galleryData, hasWebGL, artworks]);

  const goToRoom = (nextRoom: RoomKey, nextWing = wing) => {
    const station = stationFor(nextRoom, nextWing);
    targetRef.current.set(station.x, CAMERA_Y, station.z);
    yawRef.current = degToRad(station.heading);
    roomRef.current = nextRoom;
    wingRef.current = nextWing;
    setWing(nextWing);
    setRoom(nextRoom);
    loadRoomTexturesRef.current(nextRoom, nextWing);
  };

  const saveRoomState = async (isPublic = false) => {
    const response = await fetch("/api/virtual-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id: savedRoomIdRef.current ?? undefined,
        name: `${currentStation.label} visit`,
        isPublic,
        viewedArtworkIds: selectedArtwork ? [selectedArtwork.id] : [],
        roomState: {
          activeRoom: room,
          wing,
          cameraPosition: cameraRef.current
            ? {
                x: cameraRef.current.position.x,
                y: cameraRef.current.position.y,
                z: cameraRef.current.position.z,
              }
            : null,
        },
      }),
    });
    const payload = (await response.json()) as { ok?: boolean; room?: { id: string; shareToken?: string | null }; message?: string };
    if (!response.ok || !payload.ok || !payload.room) {
      throw new Error(payload.message ?? "Could not save room state.");
    }
    savedRoomIdRef.current = payload.room.id;
    return payload.room;
  };

  const shareRoom = async () => {
    setShareMessage("");
    try {
      const response = await fetch("/api/virtual-room/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: savedRoomIdRef.current ?? undefined,
          name: `${currentStation.label} shared visit`,
          viewedArtworkIds: selectedArtwork ? [selectedArtwork.id] : [],
          roomState: {
            activeRoom: room,
            wing,
            cameraPosition: cameraRef.current
              ? {
                  x: cameraRef.current.position.x,
                  y: cameraRef.current.position.y,
                  z: cameraRef.current.position.z,
                }
              : null,
          },
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; room?: { id: string; shareToken?: string | null }; message?: string };
      if (!response.ok || !payload.ok || !payload.room?.shareToken) {
        throw new Error(payload.message ?? "Could not create share link.");
      }
      const savedRoom = payload.room;
      savedRoomIdRef.current = savedRoom.id;
      const url = `${window.location.origin}/api/virtual-room/share/${savedRoom.shareToken}`;
      await navigator.clipboard.writeText(url);
      setShareMessage("Share link copied.");
    } catch (error) {
      setShareMessage(error instanceof Error ? error.message : "Could not create share link.");
    }
  };

  const saveCurrentRoom = async () => {
    setSaveMessage("");
    try {
      await saveRoomState(false);
      setSaveMessage("Room state saved.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Could not save room state.");
    }
  };

  const reset = () => {
    // Reset returns to the OUTDOOR starting point, not indoors.
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  if (galleryData.status === "loading") {
    return <GalleryLoadingScreen message="Loading marketplace artworks..." />;
  }

  if (galleryData.status === "error") {
    return <WebGLFallback initialError={galleryData.error} />;
  }

  if (hasWebGL === null) {
    return <GalleryLoadingScreen message="Initializing virtual museum..." />;
  }

  if (!hasWebGL) {
    return <WebGLFallback data={galleryData.data} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#101417] text-white">
      <Navbar />
      <div ref={mountRef} className="absolute inset-0" />

      <header className="pointer-events-none fixed left-0 right-0 top-0 z-40 bg-gradient-to-b from-black/80 to-transparent">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/marketplace" className="pointer-events-auto flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium backdrop-blur hover:bg-white/15">
            <Home className="h-4 w-4" />
            Exit Museum
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-semibold">Infinite Museum</h1>
            <p className="hidden text-xs text-white/65 sm:block">
              {wingName(wing)} Wing {wing + 1} / {currentStation.label}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={saveCurrentRoom} className="pointer-events-auto rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold backdrop-blur hover:bg-white/15" title="Save current room state">
              Save
            </button>
            <button type="button" onClick={shareRoom} className="pointer-events-auto rounded-lg bg-white/10 p-2 backdrop-blur hover:bg-white/15" title="Copy share link">
              <Share2 className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setMapOpen((value) => !value)} className="pointer-events-auto rounded-lg bg-white/10 p-2 backdrop-blur hover:bg-white/15" title="Toggle map">
              <MapIcon className="h-5 w-5" />
            </button>
            <button type="button" onClick={reset} className="pointer-events-auto rounded-lg bg-white/10 p-2 backdrop-blur hover:bg-white/15" title="Return to entrance">
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>
        {(shareMessage || saveMessage) && <p className="pointer-events-auto mx-auto max-w-7xl px-4 pb-2 text-right text-xs text-white/75">{shareMessage || saveMessage}</p>}
      </header>

      {mapOpen && (
        <aside className="fixed bottom-5 right-5 z-40 h-44 w-44 rounded-full border border-white/15 bg-black/62 p-3 shadow-2xl backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Compass className="h-4 w-4 text-teal-300" />
              Map
            </div>
            <button type="button" onClick={() => setMapOpen(false)} className="rounded-full p-1 hover:bg-white/10" title="Close map">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative mx-auto h-28 w-28 rounded-full border border-white/20 bg-[#d8ccb8] text-[#2d241c] shadow-inner">
            <div className="absolute left-[42%] top-[13%] h-[74%] w-[16%] rounded-full bg-teal-800/15" />
            <div className="absolute left-[15%] top-[39%] h-[20%] w-[25%] rounded-full border border-[#6b573f]/60 bg-white/45" />
            <div className="absolute right-[15%] top-[39%] h-[20%] w-[25%] rounded-full border border-[#6b573f]/60 bg-white/45" />
            {roomStations.map((station) => {
              const active = station.key === room;
              const left = 50 + (station.x / 36) * 42;
              const top = 52 + ((station.z - 8) / -62) * 72;

              return (
                <button
                  key={station.key}
                  type="button"
                  onClick={() => goToRoom(station.key)}
                  title={station.label}
                  className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow ${
                    active ? "border-white bg-teal-700" : "border-[#6b573f]/60 bg-white/90 hover:bg-amber-100"
                  }`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                />
              );
            })}
          </div>
        </aside>
      )}

      <div className="fixed bottom-20 left-5 z-[60] flex items-end gap-3">
        <button
          type="button"
          onClick={() => {
            setInfoOpen((value) => !value);
            setListOpen(false);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/62 shadow-2xl backdrop-blur-md hover:bg-black/75"
          title="Museum controls"
          aria-label="Museum controls"
        >
          <Info className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setListOpen((value) => !value);
            setInfoOpen(false);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/62 shadow-2xl backdrop-blur-md hover:bg-black/75"
          title={listOpen ? "Hide accessible artwork list" : "Show accessible artwork list"}
          aria-label={listOpen ? "Hide accessible artwork list" : "Show accessible artwork list"}
          aria-pressed={listOpen ? "true" : "false"}
        >
          <List className="h-5 w-5" />
        </button>

        {infoOpen && (
          <section className="absolute bottom-14 left-0 w-[min(88vw,360px)] rounded-xl border border-white/10 bg-black/78 p-4 shadow-2xl backdrop-blur-md">
            <p className="text-sm font-medium">Scroll or press W to walk through the doorway you face. Drag or use A/D to look around. Click glowing circles or artworks.</p>
            <p className="mt-2 text-xs text-white/65">Current room: {currentStation.label}. Routes: {currentDoors.map((door) => door.label).join(", ")}.</p>
          </section>
        )}
      </div>

      {!mapOpen && (
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/62 shadow-2xl backdrop-blur-md hover:bg-black/75"
          title="Open map"
        >
          <MapIcon className="h-5 w-5" />
        </button>
      )}

      {listOpen && (
        <section className="fixed bottom-36 left-5 z-[60] max-h-[46vh] w-[min(92vw,430px)] overflow-auto rounded-xl border border-white/10 bg-black/78 p-4 text-sm shadow-2xl backdrop-blur-md">
          <h2 className="font-semibold">Artwork List</h2>
          <p className="mt-1 text-xs text-white/65">{accessibilitySummary}</p>
          <ul className="mt-3 space-y-3">
            {accessiblePlacements.map((placement) => (
              <li key={`${placement.artwork.id}-${placement.curationRoomTitle}`} className="border-b border-white/10 pb-3 last:border-b-0">
                <p className="font-medium">{placement.artwork.title}</p>
                <p className="text-xs text-white/65">by {placement.artwork.artist} / {placement.curationRoomTitle}</p>
                <p className="mt-1 text-xs text-white/55">{placement.curationExplanation}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="sr-only" aria-label="Accessible museum artwork list">
        <h2>Infinite Museum artwork list</h2>
        <p>{accessibilitySummary}</p>
        <ul>
          {accessiblePlacements.map((placement) => (
            <li key={`${placement.artwork.id}-${placement.curationRoomTitle}`}>
              {placement.artwork.title} by {placement.artwork.artist}. Room: {placement.curationRoomTitle}. {placement.curationExplanation}
            </li>
          ))}
        </ul>
      </section>

      {selectedArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm" onClick={() => setSelectedArtwork(null)}>
          <div className="relative grid max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl bg-[#15191c] shadow-2xl md:grid-cols-2" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSelectedArtwork(null)} className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1.5 hover:bg-black/70" title="Close">
              <X className="h-4 w-4" />
            </button>
            <div className="h-48 bg-black overflow-hidden flex items-center justify-center md:h-auto md:max-h-[85vh]">
              <img src={selectedArtwork.image} alt={selectedArtwork.title} className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col max-h-[85vh] overflow-y-auto p-4 sm:p-5">
              <div className="flex-1">
                <p className="mb-1 text-xs font-medium text-teal-300">On view in Infinite Museum</p>
                <h2 className="text-xl font-bold leading-tight">{selectedArtwork.title}</h2>
                {selectedArtwork.ownerType !== "renewcanvas" && (
                  <p className="mt-1 text-sm text-white/65">by {selectedArtwork.artist}</p>
                )}
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-white/55">Price</span>
                    <span className="font-bold text-amber-300">{selectedArtwork.price.toLocaleString()} RWF</span>
                  </div>
                  <div className="border-b border-white/10 pb-2">
                    <span className="text-white/55">Materials</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {selectedArtwork.materials.map((material) => (
                        <span key={material} className="rounded-full bg-teal-400/15 px-2 py-0.5 text-xs text-teal-200">{material}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-white/55">Impact</span>
                    <span className="font-semibold text-green-300">{selectedArtwork.kgDiverted} kg diverted</span>
                  </div>
                  {selectedArtwork.curationExplanation && (
                    <div className="border-b border-white/10 pb-2">
                      <span className="text-white/55">Curated Room</span>
                      <p className="mt-1 font-semibold text-teal-200">{selectedArtwork.curationRoomTitle}</p>
                      <p className="mt-0.5 text-xs text-white/70">{selectedArtwork.curationExplanation}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Link href={`/artwork/${selectedArtwork.id}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold hover:bg-teal-700">
                  <Maximize2 className="h-4 w-4" />
                  View Details
                </Link>
                <Link href={`/checkout?artworkId=${encodeURIComponent(selectedArtwork.id)}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-black hover:bg-amber-400">
                  <ShoppingBag className="h-4 w-4" />
                  Buy Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
