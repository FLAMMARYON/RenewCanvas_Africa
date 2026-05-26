# PHASE 0 — GALLERY AUDIT REPORT
**Date:** 2026-05-25
**Task:** Visual Upgrade to Existing Virtual Gallery
**Status:** ⚠️ CRITICAL FINDINGS - Approval Required Before Proceeding

---

## 1. REAL GALLERY LOCATION ✅

**Route:** `/virtual-room`
**URL Pattern:** `/virtual-room?room=entrance&wing=0`
**Page File:** `src/app/virtual-room/page.tsx` (exactly 1044 lines)

### Imported Files:
1. `@/lib/ml/curator` → curateMuseum function
2. `@/lib/ml/schemas` → ArtworkCategory, RecyclableMaterial types
3. `@/lib/frontend/local-store` → readVirtualRoomProgress, saveVirtualRoomProgress
4. `@/lib/frontend/virtual-room-data` → virtualRoomArtworks, VirtualRoomArtwork type
5. `next/link` → Link component
6. `lucide-react` → UI icons (Compass, Home, Info, List, Map, Maximize2, RotateCcw, X)
7. `react` → hooks (useEffect, useMemo, useRef, useState)
8. `three` → THREE.js library (vanilla, NOT React Three Fiber)

**Confirmation:** This is 100% vanilla THREE.js. No R3F anywhere in the real gallery.

---

## 2. SCENE INITIALIZATION (Lines 421-445)

### Canvas & Renderer Setup:
```typescript
// Line 425
const scene = new THREE.Scene();
scene.background = new THREE.Color(BRAND_DARK); // #101417
scene.fog = new THREE.FogExp2(BRAND_DARK, 0.018);

// Line 431
const camera = new THREE.PerspectiveCamera(72, aspect, 0.05, 260);
camera.position.set(0, CAMERA_Y, 8); // CAMERA_Y = 1.72

// Line 435
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true; // VR support
```

### Environment:
- Environment texture created via `createEnvironmentTexture()` (gradient cube texture)
- Scene uses `scene.environment` for IBL (image-based lighting)

---

## 3. ROOM ARCHITECTURE (Lines 496-519)

### Room Building Function: `addRoom(roomKey, wingIndex)`

**Room Constants:**
- `ROOM_W = 14` (width)
- `ROOM_D = 16` (depth)
- `WALL_H = 5.2` (height)
- `WING_SPACING = 76` (distance between wings)

### Room Structure:
1. **Floor:** BoxGeometry (14.4 × 0.18 × 16.4)
   - Material: room-specific color with floor texture
   - Roughness: 0.36
   - Position: y = -0.09

2. **Ceiling:** BoxGeometry (14.2 × 0.22 × 16.2)
   - Color: #2f2923 (dark)
   - Position: y = WALL_H + 0.12 = 5.32

3. **Walls:** Built via `addWallSegments()` and `addSideWall()`
   - Walls with doorways have gaps (3.5-3.8 units wide)
   - Door frames: dark wood #4a3728
   - Wall thickness: 0.24 units

4. **Rails:** Horizontal BoxGeometry strips (decorative trim)
   - Position: y = 3.55 and y = 1.05
   - Uses room-specific rail color

### Room Colors (Current):
```typescript
entrance: { wall: "#d8ccb9", trim: "#f2eadc", rail: "#0f766e", floor: "#6f6255" }
main:     { wall: "#8f2f2b", trim: "#ead8b8", rail: "#5d2420", floor: "#735f4d" }
left:     { wall: "#b9b0a4", trim: "#f3eee5", rail: "#786a5b", floor: "#665b4f" }
right:    { wall: "#93aa79", trim: "#f1e8d2", rail: "#566d45", floor: "#695d49" }
court:    { wall: "#d6c7b1", trim: "#f8efe0", rail: "#0f766e", floor: "#7b715f" }
corridor: { wall: "#cfc5b6", trim: "#f5eee2", rail: "#f59e0b", floor: "#665d51" }
```

### Room System:
- **6 room types:** entrance, main, left, right, court, corridor
- **5 wings:** indexed -1, 0, 1, 2, 3
- **Total rooms:** 30 (6 types × 5 wings)
- Rooms positioned along Z-axis with WING_SPACING offsets

---

## 4. ARTWORK PLACEMENT (Lines 591-644)

### Current Artwork Dimensions: ⚠️ TOO SMALL
```typescript
// Line 603-604
Frame outer:  [2.35, 2.95, 0.16]  // Width × Height × Depth
Mat:          [2.02, 2.62, 0.18]

// Line 609
Artwork plane: 1.76 × 2.26 (PlaneGeometry)
```

**Problem:** These are significantly smaller than the target (1.8 × 2.4) and don't match reference images.

### Artwork Structure:
1. **Frame** (dark wood #3d2c1d, roughness 0.6)
2. **Mat** (cream #f2eadc, roughness 0.52)
3. **Artwork PlaneGeometry** with texture
   - Material: MeshPhysicalMaterial with clearcoat
   - Roughness: 0.56, clearcoat: 0.16
   - Image loaded asynchronously via TextureLoader
4. **Title plaque** (1.65 × 0.62, canvas texture)
5. **Category plaque** (1.45 × 0.48, canvas texture with #dff6f3 bg)

### Artwork Position System:
- Positioned at y = 2.55 (center height)
- 4 slots per room: north wall (slot 3), south wall (slot 0), west (slot 0), east (slot 2)
- Spacing: x positions at -3.8, 0, 3.8
- Z positions at ±5.88 from room center

### Interaction:
- Artworks added to `clickablesRef.current` array
- Raycaster detects clicks
- Opens overlay modal with artwork details

---

## 5. LIGHTING SYSTEM (Lines 450-457)

### Current Lighting: ⚠️ STATIC, NO DAY/NIGHT

**Ambient:**
```typescript
const ambient = new THREE.HemisphereLight("#f7efe2", "#27322f", 1.28);
```

**Sun/Directional:**
```typescript
const sun = new THREE.DirectionalLight("#ffe1ac", 2.3);
sun.position.set(-10, 18, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
```

**Issues:**
- ❌ No day/night system
- ❌ No time-based lighting changes
- ❌ No additional room lighting (spotlights, point lights)
- ❌ No light fixtures or practical lights
- ✅ Shadows enabled and working

---

## 6. ENTRANCE/EXTERIOR SCENE ⚠️ MISSING

**Current State:** The "entrance" is just a regular room like all others.

**What's Missing:**
- ❌ No exterior building facade
- ❌ No signboard text ("ANYTHING IS ART IN THE RIGHT EYES")
- ❌ No path/cobblestones/grounds
- ❌ No benches or outdoor props
- ❌ No plants/foliage
- ❌ No bollard lights or outdoor lighting
- ❌ No sky

The entrance room (key: "entrance") has:
- Wall color: #d8ccb9 (light beige)
- Same structure as other rooms
- Door to main gallery at z = -6.8
- No special exterior treatment

---

## 7. DAY/NIGHT LOGIC ❌ DOES NOT EXIST

**Findings:**
- No hour checking
- No time-based intervals
- No `useLightingMode` or similar hook
- No day/night state management
- Lighting is completely static

**Search Results:**
- Searched for: "night", "day", "hour", "time" in page.tsx
- Only found: fog, door runtime targets, elapsed time for animation
- No day/night functionality present

---

## 8. ROOM SWITCHING (Lines 670-717)

### Navigation System:
```typescript
const goTo = (target: DoorTarget, baseWing: number) => {
  // Handles wingOffset for multi-wing navigation
  // Updates URL params (?room=X&wing=Y)
  // Saves progress to localStorage
  // Animates camera to new position
}
```

**URL State:**
- `?room=entrance&wing=0` format
- Synced with localStorage via `readVirtualRoomProgress()` / `saveVirtualRoomProgress()`
- State refs: `roomRef`, `wingRef`, `targetRef`, `yawRef`

**Door Hotspots:**
- Created via `addDoorHotspot()` function (lines 569-584)
- Raycaster detects clicks on door meshes
- Shows door labels on hover
- Clicks trigger room transition

---

## 9. SIGNBOARD ❌ DOES NOT EXIST

**Search Results:**
- Searched for: "ANYTHING IS ART", "signboard"
- ❌ Not found anywhere in page.tsx
- ❌ No signboard mesh or text rendering

---

## 10. WEATHER SYSTEM ❌ DOES NOT EXIST

**Current State:**
- Static fog: `THREE.FogExp2(BRAND_DARK, 0.018)` (line 429)
- No weather variations
- No sessionStorage seeding
- No rain particles
- No fog density changes

---

## 11. GLB/GLTF ASSETS ❌ NONE CURRENTLY LOADED

**Search Results:**
- Searched for: "GLTFLoader", ".glb", ".gltf"
- ❌ No GLTFLoader import
- ❌ No .glb files loaded
- ❌ No 3D asset loading code

**All geometry is procedural** (BoxGeometry, PlaneGeometry primitives).

---

## 12. POLYHAVEN .BLEND FILES FOUND ✅

**Location:** `C:\Users\Nicholas Eke\Downloads\RenewCanv1.0\RenewCanvas_Africa\gallery references\`

**Files (all .blend.zip, need extraction):**
1. **Chandelier_01_4k.blend.zip** (20 MB)
2. **industrial_pipe_lamp_4k.blend.zip** (44 MB)
3. **lightbulb_01_4k.blend.zip** (20 MB)
4. **mounted_fluorescent_lights_4k.blend.zip** (23 MB)
5. namaqualand_boulder_02_4k.blend.zip (59 MB) - rock/plant
6. othonna_cerarioides_4k.blend.zip (64 MB) - plant

**Status:** ⚠️ All zipped, need extraction before Blender MCP conversion

---

## 13. REFERENCE IMAGES FOUND ✅

**Location:** `C:\Users\Nicholas Eke\Downloads\RenewCanv1.0\RenewCanvas_Africa\gallery references\`

**Key Reference Images:**
1. **renrewcanvgallery1.png** (2.7 MB) - Day exterior
2. **renewcanv gallery 1 night time.png** (2.3 MB) - Night exterior
3. **renewcanv gallery2.png** (2.4 MB) - Women Artists Gallery interior
4. **renewcanv gallery3.png** (2.3 MB) - Atrium with skylight
5. **02f92a4f-65d8-4087-9f75-0ee4d8dafca0.png** (2.3 MB) - Atrium alternate view
6. galleryp1.png, galerp2.png, galerp3.png, galerp4.png

---

## 14. DESIGN SYSTEM ✅ EXTRACTED

**File:** `src/app/globals.css`

### Brand Colors:
```typescript
PRIMARY (Teal):      #0d9488  // Sustainability
PRIMARY_DARK:        #0f766e  // Used in gallery as BRAND_TEAL
PRIMARY_LIGHT:       #14b8a6

SECONDARY (Amber):   #f59e0b  // Creativity/Art - BRAND_ORANGE
SECONDARY_DARK:      #d97706
SECONDARY_LIGHT:     #fbbf24

ACCENT (Purple):     #8b5cf6  // Transformation

EARTH (Stone):       #78716c  // Materials
EARTH_LIGHT:         #a8a29e

// Gallery specific (from page.tsx)
BRAND_DARK:          #101417  // Background
```

### Typography:
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Gallery Constants (from page.tsx):
```typescript
BRAND_TEAL = "#0f766e"   // Primary dark
BRAND_ORANGE = "#f59e0b" // Secondary
BRAND_DARK = "#101417"   // Background
```

---

## 15. PREVIOUS SESSION R3F FILES ⚠️ NOT CONNECTED

**Location:** `src/components/gallery/`

### Files Found:
1. **GalleryLighting.tsx** (3.3 KB)
   - R3F component for day/night lighting
   - ❌ NOT imported by real gallery

2. **WeatherSystem.tsx** (4.0 KB)
   - R3F component for weather effects
   - ❌ NOT imported by real gallery

3. **WebGLFallback.tsx** (7.4 KB)
   - React fallback component
   - ❌ NOT imported by real gallery

4. **GalleryLoadingScreen.tsx** (1.4 KB)
   - React loading screen
   - ❌ NOT imported by real gallery

5. **EnhancedGalleryScene.tsx** (8.9 KB)
   - R3F scene component
   - ❌ NOT imported by real gallery
   - This is the /virtual-room-enhanced route (separate implementation)

### Hooks:
**Location:** `src/lib/frontend/`

1. **useLightingMode.ts** (exists) - ❌ NOT used by real gallery
2. **useGalleryData.ts** (exists) - ❌ NOT used by real gallery

**Conclusion:** All previous R3F work is disconnected. The `/virtual-room-enhanced` route is a separate parallel implementation that must be ignored per task instructions.

---

## 16. PREVIOUS SESSION GLB ASSETS ⚠️ CRITICALLY UNDERSIZED

**Location:** `public/models/`

### Files Found:
1. **museum-exterior.glb** - 1.2 KB ⚠️ LIKELY EMPTY/BROKEN
2. **street-ground.glb** - 5.7 KB ⚠️ LIKELY EMPTY/BROKEN
3. **artwork-frame.glb** - 1.5 KB ⚠️ LIKELY EMPTY/BROKEN

**Status:** All under 10 KB. Task specification says this indicates empty/broken GLB files.

**Action Required:** Recreate these in Phase 1 using Blender MCP or build geometry directly in THREE.js.

---

## 17. HELPER FUNCTIONS DOCUMENTED

### Key Utility Functions (Lines 251-390):

1. **`createTextCanvas(title, subtitle, bg)`** - Generates canvas texture for text labels
2. **`createArtworkCanvas(artwork)`** - Generates fallback canvas for artwork image
3. **`createEnvironmentTexture()`** - Creates gradient cube texture for IBL
4. **`createFloorTexture()`** - Creates procedural floor texture
5. **`addBox(group, size, position, color, options)`** - Primary geometry creation function
   - Creates BoxGeometry with MeshPhysicalMaterial
   - Supports: roughness, metalness, map, emissive, emissiveIntensity
   - Enables shadows (castShadow + receiveShadow)

---

## 18. ANIMATION LOOP (Lines 786-850)

### Current Animation:
```typescript
renderer.setAnimationLoop(() => {
  const elapsed = clock.getElapsedTime();
  const delta = clock.getDelta();

  // Smooth camera movement (lerp to target)
  camera.position.lerp(targetRef.current, 0.04);
  camera.lookAt(targetRef.current.x, targetRef.current.y, targetRef.current.z - 8);

  // Update yaw (rotation)
  camera.rotation.y = yawRef.current;

  renderer.render(scene, camera);
});
```

**Features:**
- Smooth camera transitions (lerp factor 0.04)
- Elapsed time tracking
- Delta time available for animations
- No current animations besides camera movement

---

## 19. UI OVERLAY SYSTEM ✅ WORKING

### Components:
- **Navigation arrows** (bottom of screen)
- **Room map** (top right, toggleable)
- **Artwork overlay modal** (when clicking artwork)
- **Door labels** (hover over doors)
- **Reset button** (return to entrance)
- **Mini map** (shows current wing layout)

**Tech:** React JSX overlay on top of THREE.js canvas

---

## 20. DATA SOURCES

### Artworks:
```typescript
import { virtualRoomArtworks } from "@/lib/frontend/virtual-room-data";
```

### Room Assignment:
```typescript
import { curateMuseum } from "@/lib/ml/curator";
```

**API Endpoint Available:**
- `/api/gallery/layout` (from previous session)
- ❌ NOT currently used by real gallery
- Returns 6 rooms with tag-matched artworks
- Has mock data fallback

---

## 🚨 CRITICAL ISSUES SUMMARY

### Must Fix (Phase 1-6):
1. ❌ **GLB Assets:** All 3 previous GLBs are broken (<10KB) - must recreate
2. ❌ **PolyHaven Assets:** 4 .blend.zip files need extraction + conversion
3. ❌ **Artwork Size:** Current frames (1.76×2.26) too small vs target (1.8×2.4)
4. ❌ **No Exterior Scene:** Entrance has no building, path, signboard, outdoor elements
5. ❌ **No Signboard Text:** "ANYTHING IS ART IN THE RIGHT EYES" doesn't exist
6. ❌ **No Day/Night:** Lighting is static, no time-based changes
7. ❌ **No Weather:** Static fog only, no weather variations
8. ❌ **No Light Fixtures:** No practical lights, spotlights, or fixture models
9. ❌ **Room Lighting:** Needs per-artwork spotlights, ceiling fixtures
10. ❌ **Lobby/Atrium:** Entrance room needs skylight, signage panels, central plinth

### To Clean Up (Phase 6):
1. ⚠️ **Disconnect R3F Files:** Delete or disable EnhancedGalleryScene.tsx, GalleryLighting.tsx, etc. if not imported
2. ✅ **Keep API Endpoint:** /api/gallery/layout should be wired to real gallery

---

## ✅ PHASE 0 AUDIT COMPLETE

**Total Lines Audited:** 1044 (page.tsx)
**Additional Files Checked:** 15+
**Reference Images Found:** 9
**PolyHaven Assets Found:** 6 (.blend.zip)
**Design System:** Documented
**Critical Issues:** 10

**Recommendation:** STOP HERE. Wait for approval before proceeding to Phase 1.

**Next Phase:** Phase 1 - Extract .blend.zip files and convert to GLB using Blender MCP.
