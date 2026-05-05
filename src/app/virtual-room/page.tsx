"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Compass, Home, Info, List, Map as MapIcon, Maximize2, RotateCcw, X } from "lucide-react";
import * as THREE from "three";
import { curateMuseum, type CurationArtworkInput, type CuratedMuseumRoom } from "@/lib/ml/curator";
import type { ArtworkCategory, RecyclableMaterial } from "@/lib/ml/schemas";
import { readVirtualRoomProgress, saveVirtualRoomProgress } from "@/lib/frontend/local-store";
import { virtualRoomArtworks, type VirtualRoomArtwork } from "@/lib/frontend/virtual-room-data";

type RoomKey = "entrance" | "main" | "left" | "right" | "court" | "corridor";

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

const artworks: Artwork[] = virtualRoomArtworks;

const WING_SPACING = 76;
const ROOM_W = 14;
const ROOM_D = 16;
const WALL_H = 5.2;
const CAMERA_Y = 1.72;
const BRAND_TEAL = "#0f766e";
const BRAND_ORANGE = "#f59e0b";
const BRAND_DARK = "#101417";

const roomStations: Station[] = [
  { key: "entrance", label: "Entrance Lobby", x: 0, z: 8, heading: 0 },
  { key: "main", label: "Main Gallery", x: 0, z: -10, heading: 0 },
  { key: "left", label: "Left Gallery", x: -17, z: -10, heading: -90 },
  { key: "right", label: "Right Gallery", x: 17, z: -10, heading: 90 },
  { key: "court", label: "Sculpture Court", x: 0, z: -28, heading: 0 },
  { key: "corridor", label: "Forward Corridor", x: 0, z: -46, heading: 0 },
];

const roomColors: Record<RoomKey, { wall: string; trim: string; rail: string; floor: string }> = {
  entrance: { wall: "#d8ccb9", trim: "#f2eadc", rail: "#0f766e", floor: "#6f6255" },
  main: { wall: "#8f2f2b", trim: "#ead8b8", rail: "#5d2420", floor: "#735f4d" },
  left: { wall: "#b9b0a4", trim: "#f3eee5", rail: "#786a5b", floor: "#665b4f" },
  right: { wall: "#93aa79", trim: "#f1e8d2", rail: "#566d45", floor: "#695d49" },
  court: { wall: "#d6c7b1", trim: "#f8efe0", rail: "#0f766e", floor: "#7b715f" },
  corridor: { wall: "#cfc5b6", trim: "#f5eee2", rail: "#f59e0b", floor: "#665d51" },
};

const materialAliases: Record<string, RecyclableMaterial> = {
  "pet bottles": "PET bottles",
  "bottle caps": "Bottle caps",
  cardboard: "Cardboard",
  paper: "Paper",
  fabric: "Fabric scraps",
  "fabric scraps": "Fabric scraps",
  "aluminum cans": "Aluminium cans",
  "aluminium cans": "Aluminium cans",
  glass: "Glass",
  "e-waste": "Electronic waste",
  "electronic waste": "Electronic waste",
  burlap: "Burlap/grain sacks",
  "grain sacks": "Burlap/grain sacks",
  "plastic bags": "Plastic bags",
  metal: "Metal scraps",
  "metal scraps": "Metal scraps",
};

const doors: Record<RoomKey, DoorTarget[]> = {
  entrance: [{ label: "Main Gallery", room: "main", heading: 0 }],
  main: [
    { label: "Left Gallery", room: "left", heading: 90 },
    { label: "Right Gallery", room: "right", heading: -90 },
    { label: "Sculpture Court", room: "court", heading: 0 },
    { label: "Entrance", room: "entrance", heading: 180 },
  ],
  left: [{ label: "Main Gallery", room: "main", heading: -90 }],
  right: [{ label: "Main Gallery", room: "main", heading: 90 }],
  court: [
    { label: "Main Gallery", room: "main", heading: 180 },
    { label: "Forward Corridor", room: "corridor", heading: 0 },
  ],
  corridor: [
    { label: "Sculpture Court", room: "court", heading: 180 },
    { label: "Next Wing", room: "entrance", wingOffset: 1, heading: 0 },
  ],
};

const doorRuntimeTargets: Record<RoomKey, DoorRuntimeTarget[]> = {
  entrance: [
    { label: "Main Gallery", room: "main", heading: 0, fromRoom: "entrance", localPosition: [0, 0.06, -6.8] },
  ],
  main: [
    { label: "Left Gallery", room: "left", heading: 90, fromRoom: "main", localPosition: [-6, 0.06, 0] },
    { label: "Right Gallery", room: "right", heading: -90, fromRoom: "main", localPosition: [6, 0.06, 0] },
    { label: "Sculpture Court", room: "court", heading: 0, fromRoom: "main", localPosition: [0, 0.06, -6.8] },
    { label: "Entrance", room: "entrance", heading: 180, fromRoom: "main", localPosition: [0, 0.06, 6.8] },
  ],
  left: [
    { label: "Main Gallery", room: "main", heading: -90, fromRoom: "left", localPosition: [6, 0.06, 0] },
  ],
  right: [
    { label: "Main Gallery", room: "main", heading: 90, fromRoom: "right", localPosition: [-6, 0.06, 0] },
  ],
  court: [
    { label: "Main Gallery", room: "main", heading: 180, fromRoom: "court", localPosition: [0, 0.06, 6.8] },
    { label: "Forward Corridor", room: "corridor", heading: 0, fromRoom: "court", localPosition: [0, 0.06, -6.8] },
  ],
  corridor: [
    { label: "Sculpture Court", room: "court", heading: 180, fromRoom: "corridor", localPosition: [0, 0.06, 6.8] },
    { label: "Next Wing", room: "entrance", wingOffset: 1, heading: 0, fromRoom: "corridor", localPosition: [0, 0.06, -6.8] },
  ],
};

function wingName(wing: number) {
  return ["Sully", "Denon", "Richelieu", "Cour Carree"][Math.abs(wing) % 4];
}

function stationFor(room: RoomKey, wing: number) {
  const station = roomStations.find((item) => item.key === room) ?? roomStations[0];
  return { ...station, z: station.z - wing * WING_SPACING };
}

function isRoomKey(value: string | null): value is RoomKey {
  return roomStations.some((station) => station.key === value);
}

function readInitialRouteState(): { room: RoomKey; wing: number } | null {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const routeRoom = params.get("room");
  const routeWing = Number(params.get("wing") ?? "0");

  if (isRoomKey(routeRoom)) {
    return {
      room: routeRoom,
      wing: Number.isFinite(routeWing) && routeWing >= 0 ? Math.floor(routeWing) : 0,
    };
  }

  const saved = readVirtualRoomProgress();
  if (saved && isRoomKey(saved.room)) {
    return { room: saved.room, wing: Math.max(0, Math.floor(saved.wing)) };
  }

  return null;
}

function writeRouteState(room: RoomKey, wing: number) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("room", room);
  url.searchParams.set("wing", String(wing));
  window.history.replaceState(null, "", url);
}

function normalizeCurationMaterials(materials: string[]): RecyclableMaterial[] {
  const normalized = materials
    .map((material) => materialAliases[material.trim().toLowerCase()] ?? "Other")
    .filter((material, index, allMaterials) => allMaterials.indexOf(material) === index);

  return normalized.length > 0 ? normalized : ["Other"];
}

function toCurationArtwork(artwork: Artwork): CurationArtworkInput {
  return {
    id: String(artwork.id),
    title: artwork.title,
    artistName: artwork.artist,
    category: artwork.category,
    materials: normalizeCurationMaterials(artwork.materials),
    imageUrl: artwork.image,
    impactScore: Math.min(100, Math.round(artwork.kgDiverted * 18)),
    kgDiverted: artwork.kgDiverted,
  };
}

function roomForCuratedRoom(room: CuratedMuseumRoom): RoomKey {
  if (room.roomKind === "court") return "court";
  if (room.roomKind === "side_gallery") return room.groupingValue === "Functional Art" ? "right" : "left";
  if (room.roomKind === "cabinet") return "left";
  if (room.grouping === "impact") return "court";
  return "main";
}

const museumCurationPlan = curateMuseum({ artworks: artworks.map(toCurationArtwork) });

function getArtworkPlacements(items: Artwork[]): ArtworkPlacement[] {
  const artworkById = new Map(items.map((artwork) => [String(artwork.id), artwork]));
  const roomById = new Map(museumCurationPlan.rooms.map((room) => [room.id, room]));

  return museumCurationPlan.placements.flatMap((placement) => {
    const artwork = artworkById.get(placement.artworkId);
    const curatedRoom = roomById.get(placement.roomId);
    if (!artwork || !curatedRoom) return [];

    return {
      artwork,
      roomKey: roomForCuratedRoom(curatedRoom),
      slotIndex: placement.slotIndex,
      wingIndex: placement.wingIndex,
      curationRoomTitle: curatedRoom.title,
      curationGrouping: `${curatedRoom.grouping}: ${curatedRoom.groupingValue}`,
      curationExplanation: placement.arrangementExplanation,
    };
  });
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
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetRef = useRef(new THREE.Vector3(0, CAMERA_Y, 8));
  const yawRef = useRef(0);
  const roomRef = useRef<RoomKey>("entrance");
  const wingRef = useRef(0);
  const lastWheelNavRef = useRef(0);
  const wheelDeltaRef = useRef(0);
  const dragRef = useRef<{ x: number; yaw: number } | null>(null);
  const clickablesRef = useRef<THREE.Object3D[]>([]);
  const routeStateHydratedRef = useRef(false);
  const [wing, setWing] = useState(0);
  const [room, setRoom] = useState<RoomKey>("entrance");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [mapOpen, setMapOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const currentStation = useMemo(() => stationFor(room, wing), [room, wing]);
  const currentDoors = doors[room];
  const accessiblePlacements = useMemo(() => getArtworkPlacements(artworks), []);

  useEffect(() => {
    roomRef.current = room;
    wingRef.current = wing;
  }, [room, wing]);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const environmentTexture = createEnvironmentTexture();
    scene.background = new THREE.Color(BRAND_DARK);
    scene.environment = environmentTexture;
    scene.fog = new THREE.FogExp2(BRAND_DARK, 0.018);

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

    const ambient = new THREE.HemisphereLight("#f7efe2", "#27322f", 1.28);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight("#ffe1ac", 2.3);
    sun.position.set(-10, 18, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const floorTexture = createFloorTexture();

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
      addBox(group, [ROOM_W + 0.2, 0.22, ROOM_D + 0.2], [0, WALL_H + 0.12, 0], "#2f2923", { roughness: 0.6 });

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
        emissiveIntensity: 0.45,
        roughness: 0.18,
        transmission: 0.12,
      });

      const light = new THREE.PointLight("#fff1cf", roomKey === "court" ? 18 : 10, 18, 1.8);
      light.position.set(0, 4.8, -1);
      group.add(light);

      if (roomKey === "court") {
        addBox(group, [2.1, 0.55, 2.1], [0, 0.25, 0], "#d2c9b8");
        addBox(group, [0.9, 2.8, 0.9], [0, 1.75, 0], "#f1eadc", { roughness: 0.5 });
      }

      if (roomKey === "main" || roomKey === "left" || roomKey === "right") {
        addBox(group, [4.4, 0.55, 1.05], [0, 0.26, 2.8], "#263a35");
        addBox(group, [0.3, 0.8, 0.3], [-1.7, -0.22, 2.8], "#1d2926");
        addBox(group, [0.3, 0.8, 0.3], [1.7, -0.22, 2.8], "#1d2926");
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
      const side = slotIndex % 4;
      const x = side === 0 ? -3.8 : side === 1 ? 0 : side === 2 ? 3.8 : 0;
      const z = side === 3 ? 5.88 : -5.88;
      const rotY = side === 3 ? Math.PI : 0;
      const group = new THREE.Group();
      group.position.set(station.x + x, 2.55, station.z + z);
      group.rotation.y = rotY;
      scene.add(group);

      addBox(group, [2.35, 2.95, 0.16], [0, 0, 0], "#3d2c1d", { roughness: 0.6 });
      addBox(group, [2.02, 2.62, 0.18], [0, 0, -0.04], "#f2eadc", { roughness: 0.52 });

      const fallbackTexture = new THREE.CanvasTexture(createArtworkCanvas(artwork));
      fallbackTexture.colorSpace = THREE.SRGBColorSpace;
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.76, 2.26),
        new THREE.MeshPhysicalMaterial({
          map: fallbackTexture,
          roughness: 0.56,
          clearcoat: 0.16,
          clearcoatRoughness: 0.48,
        })
      );
      plane.position.z = -0.14;
      group.add(plane);

      loader.load(artwork.image, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        plane.material.map = texture;
        plane.material.needsUpdate = true;
      });

      const plaqueTexture = new THREE.CanvasTexture(createTextCanvas(artwork.title, artwork.artist));
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(1.65, 0.62),
        new THREE.MeshBasicMaterial({ map: plaqueTexture, transparent: true })
      );
      plaque.position.set(0, -1.86, -0.16);
      group.add(plaque);

      const categoryTexture = new THREE.CanvasTexture(createTextCanvas(curationRoomTitle, curationGrouping, "#dff6f3"));
      const categoryPlaque = new THREE.Mesh(
        new THREE.PlaneGeometry(1.45, 0.48),
        new THREE.MeshBasicMaterial({ map: categoryTexture, transparent: true })
      );
      categoryPlaque.position.set(0, -2.34, -0.16);
      group.add(categoryPlaque);

      group.userData = { type: "artwork", artwork: { ...artwork, curationExplanation, curationRoomTitle } };
      clickablesRef.current.push(group);
    }

    function buildMuseum() {
      clickablesRef.current = [];
      const wingRange = [-1, 0, 1, 2, 3];

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
    }

    buildMuseum();

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

      if (data?.type === "artwork") {
        setSelectedArtwork(data.artwork);
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
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
      dragRef.current = { x: event.clientX, yaw: yawRef.current };
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragRef.current) return;
      yawRef.current = dragRef.current.yaw - (event.clientX - dragRef.current.x) * 0.0022;
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

      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "q") {
        yawRef.current += degToRad(18);
      }

      if (event.key === "ArrowRight" || event.key === "d" || event.key === "e") {
        yawRef.current -= degToRad(18);
      }

      if (event.key === "ArrowUp" || event.key === "w") {
        const target = chooseDoorFromHeading(roomRef.current, wingRef.current, false);
        if (target) goTo(target, wingRef.current);
      }

      if (event.key === "ArrowDown" || event.key === "s") {
        const target = chooseDoorFromHeading(roomRef.current, wingRef.current, true);
        if (target) goTo(target, wingRef.current);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", resize);

    const startStation = stationFor("entrance", 0);
    targetRef.current.set(startStation.x, CAMERA_Y, startStation.z);
    yawRef.current = 0;

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const elapsed = clock.getElapsedTime();
      camera.position.lerp(targetRef.current, 0.08);
      camera.rotation.set(0, yawRef.current, 0);

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
      window.removeEventListener("resize", resize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  const goToRoom = (nextRoom: RoomKey, nextWing = wing) => {
    const station = stationFor(nextRoom, nextWing);
    targetRef.current.set(station.x, CAMERA_Y, station.z);
    yawRef.current = degToRad(station.heading);
    roomRef.current = nextRoom;
    wingRef.current = nextWing;
    setWing(nextWing);
    setRoom(nextRoom);
  };

  useEffect(() => {
    const initialState = readInitialRouteState();
    if (initialState) {
      goToRoom(initialState.room, initialState.wing);
    }
    routeStateHydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!routeStateHydratedRef.current) {
      return;
    }

    writeRouteState(room, wing);
    saveVirtualRoomProgress({
      room,
      wing,
      selectedArtworkId: selectedArtwork?.id,
    });
  }, [room, selectedArtwork?.id, wing]);

  const reset = () => {
    goToRoom("entrance", 0);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#101417] text-white">
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
            <button type="button" onClick={() => setMapOpen((value) => !value)} className="pointer-events-auto rounded-lg bg-white/10 p-2 backdrop-blur hover:bg-white/15" title="Toggle map">
              <MapIcon className="h-5 w-5" />
            </button>
            <button type="button" onClick={reset} className="pointer-events-auto rounded-lg bg-white/10 p-2 backdrop-blur hover:bg-white/15" title="Return to entrance">
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>
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
          aria-pressed={listOpen}
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
          <p className="mt-1 text-xs text-white/65">{museumCurationPlan.accessibilitySummary}</p>
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
        <p>{museumCurationPlan.accessibilitySummary}</p>
        <ul>
          {accessiblePlacements.map((placement) => (
            <li key={`${placement.artwork.id}-${placement.curationRoomTitle}`}>
              {placement.artwork.title} by {placement.artwork.artist}. Room: {placement.curationRoomTitle}. {placement.curationExplanation}
            </li>
          ))}
        </ul>
      </section>

      {selectedArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSelectedArtwork(null)}>
          <div className="relative grid max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl bg-[#15191c] shadow-2xl md:grid-cols-[0.95fr_1.05fr]" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSelectedArtwork(null)} className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 hover:bg-black/70" title="Close">
              <X className="h-5 w-5" />
            </button>
            <div className="min-h-72 bg-black">
              <img src={selectedArtwork.image} alt={selectedArtwork.title} className="h-full max-h-[92vh] w-full object-cover" />
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <div className="flex-1">
                <p className="mb-2 text-sm font-medium text-teal-300">On view in Infinite Museum</p>
                <h2 className="text-3xl font-bold">{selectedArtwork.title}</h2>
                <p className="mt-2 text-lg text-white/65">by {selectedArtwork.artist}</p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-white/55">Price</span>
                    <span className="text-2xl font-bold text-amber-300">{selectedArtwork.price.toLocaleString()} RWF</span>
                  </div>
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-white/55">Materials</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedArtwork.materials.map((material) => (
                        <span key={material} className="rounded-full bg-teal-400/15 px-3 py-1 text-sm text-teal-200">{material}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-white/55">Impact</span>
                    <span className="font-semibold text-green-300">{selectedArtwork.kgDiverted} kg waste diverted</span>
                  </div>
                  {selectedArtwork.curationExplanation && (
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-white/55">Curated Room</span>
                      <p className="mt-2 font-semibold text-teal-200">{selectedArtwork.curationRoomTitle}</p>
                      <p className="mt-1 text-sm text-white/70">{selectedArtwork.curationExplanation}</p>
                    </div>
                  )}
                </div>
              </div>
              <Link href={`/artwork/${selectedArtwork.id}`} className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 font-semibold hover:bg-teal-700">
                <Maximize2 className="h-5 w-5" />
                Open Artwork Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
