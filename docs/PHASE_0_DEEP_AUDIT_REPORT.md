# PHASE 0 — Deep Gallery Audit Report
**Date:** 2026-05-25
**Gallery Route:** `/virtual-room` (URL: `/virtual-room?room=entrance&wing=0`)
**Technology:** Vanilla THREE.js (NOT React Three Fiber)

---

## 1. REAL GALLERY LOCATION

### Primary File
**Path:** `src/app/virtual-room/page.tsx`
- **Line count:** 1,045 lines
- **Technology:** Vanilla THREE.js (imports THREE from "three")
- **Framework:** Next.js 16 + React 19 (client component, but THREE.js scene is vanilla)
- **Status:** ✅ THIS IS THE REAL GALLERY

### Imports and Dependencies
```typescript
// From src/app/virtual-room/page.tsx
import * as THREE from "three";
import { curateMuseum } from "@/lib/ml/curator";
import { readVirtualRoomProgress, saveVirtualRoomProgress } from "@/lib/frontend/local-store";
import { virtualRoomArtworks } from "@/lib/frontend/virtual-room-data";
```

**Data source:** `src/lib/frontend/virtual-room-data.ts` (inline mock data, ~50+ artworks)

---

## 2. SCENE INITIALIZATION

### Canvas & Renderer (lines 422-445)
```typescript
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, aspect, 0.05, 260);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

### Environment (lines 426-429)
- Background: `BRAND_DARK` (#101417)
- Environment texture: Custom canvas-based equirectangular map (lines 312-336)
- Fog: `THREE.FogExp2(BRAND_DARK, 0.018)`

---

## 3. ROOM ARCHITECTURE

### Room Types (lines 60-67)
1. **entrance** - Entrance Lobby
2. **main** - Main Gallery
3. **left** - Left Gallery
4. **right** - Right Gallery
5. **court** - Sculpture Court
6. **corridor** - Forward Corridor

### Room Building (addRoom function, lines 496-567)
**Geometry:**
- Floor: BoxGeometry `[ROOM_W+0.4, 0.18, ROOM_D+0.4]` (14.4 × 16.4 units)
- Ceiling: BoxGeometry `[ROOM_W+0.2, 0.22, ROOM_D+0.2]` at y=5.32
- Walls: BoxGeometry segments with door cutouts (3.5-3.8 unit gaps)
- Door frames: Dark wood (#4a3728)

**Materials (roomColors object, lines 69-76):**
- entrance: wall=#d8ccb9 (warm beige), floor=#6f6255 (dark brown), rail=#0f766e (teal)
- main: wall=#8f2f2b (deep red), floor=#735f4d, rail=#5d2420
- left: wall=#b9b0a4 (gray), floor=#665b4f, rail=#786a5b
- right: wall=#93aa79 (sage green), floor=#695d49, rail=#566d45
- court: wall=#d6c7b1 (sandstone), floor=#7b715f, rail=#0f766e
- corridor: wall=#cfc5b6 (warm gray), floor=#665d51, rail=#f59e0b (orange)

**Decorative elements:**
- Corner columns: 0.16 × WALL_H × 0.16 BoxGeometry in trim color
- Brand band: Teal horizontal strip at y=4.15 with emissive glow
- Signboard: Canvas texture PlaneGeometry (3.7 × 1.38) showing "RenewCanvas Africa" + wing/room name
- Skylights: Semi-transparent box at ceiling (5.4 × 2.6) with emissive cyan glow
- Sculpture plinth in court room: Multi-tier pedestal at center

---

## 4. ARTWORK PLACEMENT

### Frame Geometry (addArtwork function, lines 591-644)
**Current sizes (PROBLEMATIC - TOO SMALL):**
- Frame outer: 2.35 × 2.95 × 0.16 BoxGeometry (dark wood #3d2c1d)
- Frame inner mat: 2.02 × 2.62 × 0.18 BoxGeometry (cream #f2eadc)
- Artwork plane: **1.76 × 2.26** PlaneGeometry 🚨 **TOO SMALL**

**Position:**
- Height: y=2.55 (center)
- Wall offset: z=-5.88 (front/back walls) or x=±3.8 (side walls)
- Spacing: 4 slots per room (positions: [-3.8, 0, 3.8, center])

**Texture loading:**
- Fallback: Canvas gradient with circles (createArtworkCanvas, lines 272-310)
- Actual: THREE.TextureLoader loads artwork.image URL
- Info plaque: Canvas texture below frame showing title/artist

**⚠️ CRITICAL ISSUE:**
Artwork planes are **1.76m × 2.26m** — much smaller than reference images show. Need to increase to **1.8m × 2.4m** minimum (portrait) or **2.4m × 1.8m** (landscape).

---

## 5. LIGHTING SYSTEM

### Current Implementation (NO day/night system)

**Global lights (lines 450-457):**
```typescript
const ambient = new THREE.HemisphereLight("#f7efe2", "#27322f", 1.28);
const sun = new THREE.DirectionalLight("#ffe1ac", 2.3);
sun.position.set(-10, 18, 8);
sun.castShadow = true;
```

**Per-room lights (line 553-555):**
```typescript
const light = new THREE.PointLight("#fff1cf", intensity, 18, 1.8);
light.position.set(0, 4.8, -1); // Skylight position
// intensity: 10 for most rooms, 18 for court
```

**NO night/day transitions currently implemented.**
**NO weather system currently implemented.**
**NO time-based intensity changes.**

---

## 6. ROOM NAVIGATION

### URL State Management (lines 156-189)
- URL params: `?room=entrance&wing=0`
- LocalStorage fallback: `readVirtualRoomProgress()`
- Updates on navigation: `writeRouteState(room, wing)`

### Navigation Methods
1. **Click door hotspots:** Orange glowing circles on floor (lines 569-589)
2. **Scroll wheel:** Accumulate deltaY > 260 → walk forward (lines 717-732)
3. **Arrow keys / WASD:** Walk forward/back, rotate left/right (lines 754-776)
4. **Map widget:** Click room dots to teleport (lines 882-918)

### Door System
- Defined in `doors` object (lines 97-115)
- Runtime positions in `doorRuntimeTargets` (lines 117-141)
- Hotspots: CircleGeometry (radius 0.9) with BRAND_ORANGE (#f59e0b) glow
- Labels: Canvas texture PlaneGeometry above each door

---

## 7. ENTRANCE/EXTERIOR SCENE

**❌ NO EXTERIOR SCENE CURRENTLY IMPLEMENTED**

The current gallery starts **inside** the entrance lobby. There is no:
- Building facade
- Outdoor approach path
- Signboard exterior view
- Street/ground scene
- Bollard lights
- Entrance archway

**Evidence:** First room is "entrance" (interior lobby), no outdoor geometry in buildMuseum() function.

---

## 8. GLB/GLTF ASSETS

### Currently Loaded
**NONE.** The gallery uses zero GLB models currently. All geometry is procedural THREE.js shapes (BoxGeometry, PlaneGeometry, CircleGeometry, CylinderGeometry).

### Previous Session GLBs (check status)

| File | Path | Size | Status |
|------|------|------|--------|
| museum-exterior.glb | public/models/ | 1.2KB | 🚨 **TOO SMALL - BROKEN** |
| street-ground.glb | public/models/ | 5.7KB | ⚠️ **SUSPICIOUS - LIKELY EMPTY** |
| artwork-frame.glb | public/models/ | 1.5KB | 🚨 **TOO SMALL - BROKEN** |
| chandelier_01_4k.glb | public/models/lights/ | 55MB | ✅ **VALID** |
| industrial_pipe_lamp_4k.glb | public/models/lights/ | 86MB | ✅ **VALID** |

**Missing GLBs:**
- lightbulb_01_4k.glb (not exported yet)
- mounted_fluorescent_lights_4k.glb (not exported yet)

---

## 9. POLYHAVEN .BLEND FILES

### Available in `gallery references/` folder:
1. ✅ **Chandelier_01_4k.blend** (duplicate in Downloads subfolder)
2. ✅ **industrial_pipe_lamp_4k.blend** (duplicate in Downloads subfolder)
3. ✅ **lightbulb_01_4k.blend** (in Downloads subfolder)
4. ✅ **mounted_fluorescent_lights_4k.blend** (in Downloads subfolder)
5. namaqualand_boulder_02_4k.blend (plant/rock asset - optional)
6. othonna_cerarioides_4k.blend (plant asset - optional)

### Action Required (PHASE 1):
- ✅ chandelier_01_4k.glb already exported (55MB)
- ✅ industrial_pipe_lamp_4k.glb already exported (86MB)
- ❌ lightbulb_01_4k.glb NEEDS EXPORT
- ❌ mounted_fluorescent_lights_4k.glb NEEDS EXPORT
- ❌ museum-exterior.glb NEEDS RECREATION (current file broken)
- ❌ street-ground.glb NEEDS RECREATION (current file broken)
- ❌ artwork-frame.glb NEEDS RECREATION (current file broken)

---

## 10. DESIGN SYSTEM

### Brand Colors (extracted from page.tsx)
```typescript
const BRAND_TEAL = "#0f766e";     // Primary teal (sustainability)
const BRAND_ORANGE = "#f59e0b";   // Secondary orange (creativity)
const BRAND_DARK = "#101417";     // Background dark
```

### From globals.css:
```css
--color-primary: #0d9488;         /* Teal */
--color-primary-dark: #0f766e;
--color-primary-light: #14b8a6;
--color-secondary: #f59e0b;       /* Amber */
--color-secondary-dark: #d97706;
--color-secondary-light: #fbbf24;
--color-accent: #8b5cf6;          /* Purple */
```

**Font:** System UI stack (system-ui, -apple-system, Segoe UI, Roboto, sans-serif)

---

## 11. PREVIOUS SESSION FILES (NOT CONNECTED TO REAL GALLERY)

### React Three Fiber Components (UNUSED)
❌ **These files use R3F and are NOT imported by the real gallery:**

| File | Path | Technology | Used? |
|------|------|------------|-------|
| GalleryLighting.tsx | src/components/gallery/ | R3F (useFrame) | ❌ NO |
| WeatherSystem.tsx | src/components/gallery/ | R3F (useFrame) | ❌ NO |
| EnhancedGalleryScene.tsx | src/components/gallery/ | R3F (Canvas) | ❌ NO |
| WebGLFallback.tsx | src/components/gallery/ | React only | ❌ NO |
| GalleryLoadingScreen.tsx | src/components/gallery/ | React only | ❌ NO |

### Separate Route (DUPLICATE)
**Path:** `src/app/virtual-room-enhanced/page.tsx`
- Uses R3F Canvas
- Imports all the above R3F components
- **NOT the real gallery** - separate implementation
- **Action:** Should be DELETED or disabled

### Useful Files (CAN KEEP)
✅ **These are plain React hooks, NOT R3F-specific:**

| File | Path | Purpose | Keep? |
|------|------|---------|-------|
| useLightingMode.ts | src/lib/frontend/ | Day/night time check | ✅ YES - can integrate |
| useGalleryData.ts | src/lib/frontend/ | Fetch /api/gallery/layout | ✅ YES - should wire in |

### API Endpoint (KEEP AND WIRE IN)
✅ **Path:** `src/app/api/gallery/layout/route.ts`
- Tag-based room matching logic
- 6 themed rooms (PET Bottle Wing, Women Artists Gallery, etc.)
- Fetches from database or returns mock data
- **Action:** WIRE to real gallery to replace virtualRoomArtworks

---

## 12. RECOGNITION/OVERLAY SYSTEM

### Artwork Click Handler (lines 699-714)
```typescript
const onClick = (event: MouseEvent) => {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(clickablesRef.current, true);
  // ...
  if (data?.type === "artwork") {
    setSelectedArtwork(data.artwork);
  }
};
```

**Overlay (lines 994-1041):**
- Fixed positioned div (z-50) with backdrop blur
- Shows: image, title, artist, price, materials, impact (kg diverted), curation explanation
- Styled with BRAND_TEAL accent color
- Link to `/artwork/{id}` page
- Close on click outside or X button

**✅ Overlay functionality works correctly.**

---

## 13. WHAT'S BROKEN / MISSING

### P0 — CRITICAL
1. ❌ **Artwork frames too small** (1.76×2.26 should be 1.8×2.4 min)
2. ❌ **No exterior/entrance scene** (building facade, path, signboard)
3. ❌ **No day/night lighting** (hours check not implemented)
4. ❌ **No weather system** (no fog, rain, or sky color changes)
5. ❌ **Three GLB files broken** (museum-exterior, street-ground, artwork-frame under 10KB)
6. ❌ **Two light fixtures not exported** (lightbulb, mounted fluorescent)
7. ❌ **Real gallery not wired to API** (uses virtualRoomArtworks instead of /api/gallery/layout)

### P1 — HIGH PRIORITY
8. ⚠️ **No frame-specific SpotLights** (picture lights above artworks)
9. ⚠️ **No PolyHaven light fixtures in scene** (GLBs exist but not loaded)
10. ⚠️ **Room name labels not prominent** (small signboard, should be large wall text)
11. ⚠️ **No camera intro animation** (starts static, should zoom in smoothly)

### P2 — MEDIUM PRIORITY
12. ⚠️ **Floor texture simple** (canvas-based checkerboard, not photorealistic)
13. ⚠️ **Wall materials flat** (no bump/normal maps, limited roughness variation)
14. ⚠️ **No ceiling track lights** (mentioned in spec but not present)
15. ⚠️ **R3F duplicate route exists** (/virtual-room-enhanced should be removed)

---

## 14. ARCHITECTURE MAP

```
User Request: /virtual-room?room=entrance&wing=0
      ↓
Next.js Route: src/app/virtual-room/page.tsx (1045 lines)
      ↓
Data Source: src/lib/frontend/virtual-room-data.ts (inline mock, 50+ artworks)
      ↓
ML Curator: src/lib/ml/curator.ts (curateMuseum function - tag-based room assignment)
      ↓
THREE.js Scene: Vanilla THREE (renderer, camera, raycaster, lights, geometry)
      ↓
Room Building: addRoom() → BoxGeometry walls/floor/ceiling + door cutouts
      ↓
Artwork Placement: addArtwork() → frame + plane + plaques, positioned by slotIndex
      ↓
Navigation: URL state ↔ roomRef/wingRef ↔ camera targetRef (lerp animation)
      ↓
Clickables: door hotspots (goTo) + artwork groups (setSelectedArtwork)
      ↓
Overlay: React state → fixed div modal with artwork details
```

**Missing API connection:**
```
❌ /api/gallery/layout (EXISTS but NOT USED by real gallery)
      ↓ (should fetch here)
virtualRoomArtworks (currently used instead)
```

---

## 15. PRIORITIZED FIX LIST

### PHASE 1 — Blender MCP: Export GLBs
1. Export lightbulb_01_4k.glb from .blend (Draco, 1024px textures)
2. Export mounted_fluorescent_lights_4k.glb from .blend (Draco, 1024px textures)
3. Recreate museum-exterior.glb (20×10×15m modernist building, sandstone)
4. Recreate street-ground.glb (cobblestone path, benches, bollards)
5. Recreate artwork-frame.glb (1.8×2.4m dark wood frame)
6. Verify all GLBs >50KB (except small props)

### PHASE 2 — Exterior Scene (NEW)
7. Build exterior scene at entrance (before current lobby)
8. Load museum-exterior.glb facade or build with BoxGeometry
9. Add signboard: "ANYTHING IS ART IN THE RIGHT EYES" (canvas texture)
10. Add RenewCanvas logo banners (load from public/brand/)
11. Add path + bollard lights + benches (or load street-ground.glb)
12. Add plant sprites/billboards at entrance sides
13. Add day/night exterior lighting (HemisphereLight + DirectionalLight / PointLights)
14. Add camera intro animation (lerp from [0,1.7,20] to [0,1.7,5] over 3s)

### PHASE 3 — Lobby/Atrium Upgrade
15. Increase skylight emissive for lobby
16. Add room entrance signage panels (tall PlaneGeometry with canvas texture)
17. Load chandelier_01_4k.glb at ceiling center
18. Add corresponding PointLight at chandelier position

### PHASE 4 — Gallery Rooms Upgrade
19. Fix artwork frame size: 1.8×2.4 (portrait) or 2.4×1.8 (landscape)
20. Load appropriate light fixtures per room:
    - Women Artists, Kigali Futures → chandelier_01_4k.glb
    - PET Wing, E-Waste → mounted_fluorescent_lights_4k.glb
    - Youth, School → industrial_pipe_lamp_4k.glb
21. Add SpotLight above each frame (color=#FFF5E0, intensity=0.8, angle=0.25)
22. Add large room name label on back wall (PlaneGeometry 4×0.6, canvas texture)
23. Add day/night logic to room lights (day: intensity 1.2, night: 1.5)
24. Add ceiling track lights at night (small PointLights along track)

### PHASE 5 — Day/Night + Weather
25. Integrate useLightingMode hook (check hours every 60s)
26. Add day/night light intensity transitions (lerp over 2000ms)
27. Add sky/background color transitions (lerp)
28. Add weather system: sessionStorage 'rc_weather', apply fog/particles to exterior only
29. Respect prefers-reduced-motion (snap immediately if true)

### PHASE 6 — API Wiring + Cleanup
30. Wire /api/gallery/layout to replace virtualRoomArtworks
31. Fetch gallery data on mount, populate rooms dynamically
32. Delete or disable /virtual-room-enhanced route
33. Delete unused R3F components (GalleryLighting, WeatherSystem, EnhancedGalleryScene, WebGLFallback, GalleryLoadingScreen)
34. Add tests for day/night, weather, frame sizing, API wiring
35. Run lint → typecheck → build

---

## 16. REFERENCE IMAGES ANALYSIS

### Available References (gallery references/ folder)
1. **renrewcanvgallery1.png** (entrance exterior day)
2. **renewcanv gallery 1 night time.png** (entrance exterior night)
3. **renewcanv gallery2.png** (Women Artists Gallery interior)
4. **renewcanv gallery3.png** (atrium with skylight and room panels)
5. **02f92a4f...png** (same as gallery3)
6. **galerp[1-4].png** (additional interior views)

### Key Visual Elements from References:
- Warm stone facade (#C4A882 or similar beige)
- Large dark archway entrance (recessed ~2 units)
- Vertical banner elements with logos flanking entrance
- Cobblestone/brick path with borders
- Bollard lights along path
- Large skylight in atrium (circular cutout in dark ceiling)
- Tall room signage panels (dark background, light text)
- Central sculpture plinth with rim lighting
- Large artwork frames (much bigger than current 1.76×2.26)
- Warm accent lighting above frames
- Clean polished floors
- Minimal decorative elements (not cluttered)

---

## 17. ACCEPTANCE CRITERIA CHECKLIST

- [ ] Exterior scene renders with facade, path, signboard, bollards
- [ ] Camera intro animation (3s smooth zoom)
- [ ] Day/night transitions work (check hours, lerp lights/sky)
- [ ] Weather system applies to exterior (fog, rain, sky color)
- [ ] Lobby has large skylight, chandelier GLB, room entrance panels
- [ ] Gallery rooms have correct wall colors, polished floors
- [ ] Artwork frames are 1.8×2.4 minimum (large, eye-level)
- [ ] Each frame has SpotLight above it
- [ ] Room name labels are large and prominent (4×0.6 on wall)
- [ ] Light fixtures GLBs load correctly (chandelier, pipe lamp, fluorescent, lightbulb)
- [ ] Real gallery fetches from /api/gallery/layout (not virtualRoomArtworks)
- [ ] Overlay shows artwork details correctly
- [ ] Navigation works (doors, scroll, keyboard, map)
- [ ] No console errors, no broken imports
- [ ] R3F duplicate route removed or disabled
- [ ] All tests pass (lint, typecheck, build)

---

## STOP HERE — AWAITING APPROVAL

**Next step:** Review this audit and approve to proceed with PHASE 1 (Blender MCP GLB exports).

**Estimated work:**
- Phase 1: 30-60 min (Blender exports + verification)
- Phase 2: 2-3 hours (exterior scene)
- Phase 3: 1-2 hours (lobby upgrade)
- Phase 4: 3-4 hours (rooms upgrade + frame resize + fixtures)
- Phase 5: 1-2 hours (day/night + weather)
- Phase 6: 1-2 hours (API wiring + cleanup + tests)

**Total: ~10-14 hours of focused work.**
