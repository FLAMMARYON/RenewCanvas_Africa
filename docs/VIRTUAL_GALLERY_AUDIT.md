# RenewCanvas Africa — Virtual Gallery Audit Report
**Generated:** 2026-05-25
**Phase:** 0 (Pre-implementation Audit)

---

## Executive Summary

The RenewCanvas Africa project already has a **sophisticated, fully-functional virtual gallery** built with vanilla THREE.js. The system includes:
- 6-room museum layout with infinite wing expansion
- ML-based artwork curation system
- Interactive navigation (keyboard, mouse, wheel)
- Artwork detail modals
- Room map overlay

**Key Findings:**
- ✅ Gallery route exists and works
- ❌ Uses vanilla THREE.js (not React Three Fiber)
- ❌ No 3D asset files (all procedural geometry)
- ❌ Missing database fields for enhanced curation
- ❌ No day/night lighting system
- ❌ No weather system
- ❌ No WebGL fallback

---

## 1. Directory Structure

```
src/app/
├── virtual-room/
│   └── page.tsx ← Main gallery component (1044 lines, vanilla THREE.js)
├── api/
│   ├── virtual-room/
│   │   ├── route.ts ← Virtual room state management
│   │   ├── artworks/route.ts ← Artwork data endpoint
│   │   └── share/[token]/route.ts ← Sharing functionality
│   └── museum/
│       └── curation/route.ts ← ML curation API

src/lib/
├── ml/
│   └── curator.ts ← Sophisticated ML-based curation logic
├── backend/
│   └── virtual-room.ts ← Database queries for virtual room
└── frontend/
    ├── virtual-room-data.ts ← Mock artwork data (currently used)
    └── local-store.ts ← Progress persistence

public/
├── brand/
│   ├── renewcanvas-icon-full-color.png ← Primary logo
│   └── renewcanvas-icon-full-color-removebg-preview.png ← Transparent logo
└── (NO models/ directory yet)
```

**Status:** [EXISTS — OK] — Well-organized structure

---

## 2. Framework & Package Manager

| Component | Version | Notes |
|-----------|---------|-------|
| Framework | Next.js 16.2.4 | Latest version |
| React | 19.2.5 | Latest version |
| TypeScript | 6.0.3 | Latest version |
| Package Manager | npm | Standard |
| Database | PostgreSQL | Via Prisma 7.8.0 |
| ORM | Prisma 7.8.0 | Client generated |
| CSS Framework | Tailwind CSS 4.2.4 | Latest version |

**Status:** [EXISTS — OK] — Modern, up-to-date stack

---

## 3. Existing Gallery/Museum Route(s)

**Route:** `/virtual-room`
**File:** `src/app/virtual-room/page.tsx`

### Current Implementation:
- **[EXISTS — NEEDS UPGRADE]**
- 1044 lines of vanilla THREE.js code
- NOT using React Three Fiber (@react-three/fiber, @react-three/drei)
- Client-side rendered ("use client" directive)
- Dynamic import: ❌ NOT currently dynamic-imported (should be for Phase 4)

### Features Already Working:
✅ 6-room museum layout (entrance, main, left, right, court, corridor)
✅ Infinite wing system (Sully, Denon, Richelieu, Cour Carree)
✅ ML-based artwork curation and placement
✅ Interactive navigation:
  - Drag to look around (yaw rotation)
  - Scroll/W key to move forward through doors
  - S key to move backward
  - A/D or arrow keys to rotate view
  - Click doors (glowing orange circles) to navigate
  - Click artworks to see details
✅ Room map overlay (circular minimap, bottom-right)
✅ Info controls (bottom-left)
✅ Artwork list panel (accessible, screen-reader friendly)
✅ Artwork detail modal (overlay with image, title, artist, materials, price, impact, curation info)
✅ URL state persistence (?room=main&wing=0)
✅ LocalStorage progress saving
✅ Procedural textures for floors, walls, frames, labels
✅ Real-time artwork image loading from URLs
✅ Keyboard accessibility (Enter on artworks, Escape to close modal)
✅ Lighting: HemisphereLight, DirectionalLight, per-room PointLights, skylights
✅ Shadows enabled (PCFSoftShadowMap)
✅ Fog (FogExp2 for depth)
✅ Room-specific color palettes

### What's Missing for Phase 4:
❌ Not dynamic-imported (needed for SSR/client-only boundary)
❌ No day/night lighting cycle
❌ No weather system
❌ No WebGL fallback
❌ No 3D asset files (museum-exterior.glb, street-ground.glb, artwork-frame.glb)
❌ No signboard text ("ANYTHING IS ART IN THE RIGHT EYES")
❌ No camera intro animation
❌ No reduce-motion detection

**Import Method:** Direct component import (should be `next/dynamic`)

---

## 4. Existing R3F Components

**Status:** [MISSING]

- ❌ No @react-three/fiber installed
- ❌ No @react-three/drei installed
- ❌ No R3F components (Canvas, useFrame, useThree, etc.)

**Current Approach:** Vanilla THREE.js with manual:
- Scene/renderer setup
- Animation loop (renderer.setAnimationLoop)
- Camera controls (manual lerp + yaw rotation)
- Raycasting for interactions
- Manual cleanup in useEffect return

**Decision Needed:** Keep vanilla THREE.js or migrate to R3F?
- **Recommendation:** Keep vanilla THREE.js (don't rewrite what works)
- Only add R3F if explicitly required by task spec

---

## 5. GLB/GLTF Assets in /public

**Status:** [MISSING]

**Current State:**
- ❌ No `/public/models/` directory
- ❌ No GLB files exist anywhere
- ❌ No GLTF files exist anywhere

**All Geometry is Procedural:**
- Rooms: BoxGeometry for walls, floors, ceilings
- Artwork frames: BoxGeometry (outer frame + inner mat + plane for artwork)
- Doors: BoxGeometry for architrave and jambs
- Floor: Procedural canvas texture with tile pattern
- Environment: Procedural equirectangular sky texture

**Required for Phase 3:**
- `museum-exterior.glb` — only if task requires exterior scene
- `street-ground.glb` — only if task requires outdoor entrance
- `artwork-frame.glb` — only if task wants instanced 3D frames (current frames work fine)

**Status:** All 3 assets need to be created via Blender MCP (if required)

---

## 6. Existing Artwork API

**Endpoint:** `GET /api/virtual-room/artworks`
**File:** `src/app/api/virtual-room/artworks/route.ts`

### Current Implementation:
**Status:** [EXISTS — NEEDS UPGRADE]

**Returns:**
```typescript
{
  ok: true,
  artworks: Artwork[] // From database
}
```

**Artwork Schema (Prisma):**
```typescript
model Artwork {
  id: string
  artistId: string
  slug: string
  title: string
  description: string
  category: string // ✅ EXISTS
  priceCents: int
  currency: string
  dimensions: string?
  kgDiverted: Decimal // ✅ EXISTS (for impactScore calculation)
  // ❌ MISSING: tags: string[]
  // ❌ MISSING: theme: string
  // ❌ MISSING: impactScore: int
  // ❌ MISSING: artistLocation: string

  artist: User (relation)
  images: ArtworkImage[]
  materials: ArtworkMaterial[]
  // ... other relations
}
```

### What's Missing:
1. ❌ `tags: string[]` — For room matching (e.g., ["pet", "bottle"], ["women", "female"])
2. ❌ `theme: string` — For thematic grouping
3. ❌ `impactScore: number` — 0-100 score (currently calculated from kgDiverted * 18)
4. ❌ `artistLocation: string` — For location-based curation (e.g., "Kigali", "Rwanda")

### Current Workaround:
- Frontend uses mock data from `src/lib/frontend/virtual-room-data.ts`
- Mock data includes materials, kgDiverted for curation
- Real API query exists but fields are incomplete

### Phase 1 Requirements:
- Add migration to add missing fields to Artwork model
- Update API to return new fields
- Seed development data with appropriate values

---

## 7. Existing Gallery Layout Logic

**File:** `src/lib/ml/curator.ts`
**API:** `POST /api/museum/curation`

### Current Implementation:
**Status:** [EXISTS — NEEDS UPGRADE]

**Sophisticated ML-based Curation:**
✅ Groups artworks by:
  - Category (Wall Art, Sculpture, Home Decor, Jewelry, Functional Art, Mixed Media, Installation)
  - Material (PET bottles, Bottle caps, Cardboard, Fabric, etc.)
  - Impact score (calculated from kgDiverted)

✅ Room assignment based on:
  - Category → Room Kind mapping
  - Material themes
  - Impact thresholds
  - Wing balancing

✅ Returns:
```typescript
{
  rooms: CuratedMuseumRoom[]  // Room metadata
  placements: CuratedArtworkPlacement[]  // Per-artwork placement with explanation
  accessibilitySummary: string  // Screen-reader friendly summary
}
```

### Current Rooms (from curator.ts):
1. Main Gallery — Wall Art, Mixed Media
2. Side Galleries (left/right) — Home Decor, Functional Art
3. Sculpture Court — Sculptures, Installations
4. Cabinets — Jewelry, small items
5. Material-specific wings (PET Bottle Wing, Bottle Cap Gallery, etc.)

### Required Rooms (from spec):
1. **PET Bottle Wing** — tags: ["pet", "bottle", "plastic", "recycled plastic"]
2. **Women Artists Gallery** — tags: ["women", "female", "girl", "she/her"]
3. **Youth Climate Innovators** — tags: ["youth", "student", "school", "climate", "young"]
4. **E-Waste Sculptures** — tags: ["ewaste", "electronic", "circuit", "computer"]
5. **Kigali Recycled Futures** — tags: ["kigali", "rwanda", "african", "city"]
6. **School Collection Showcase** — tags: ["school", "education", "kids", "collection"]

### Gap Analysis:
- Current system groups by category/material but NOT by the specific 6 required room names
- Needs tag-based matching logic
- Needs to score artworks per room based on tag matches
- Needs tie-breaking and unmatched fallback logic

### Phase 2 Requirements:
- Add `GET /api/gallery/layout` endpoint (or enhance existing curator)
- Implement tag-based room matching for the 6 specific rooms
- Scoring: 1pt per tag match (case-insensitive)
- Ties: alphabetical room name
- Unmatched: even distribution
- Cache: 5 minutes (in-memory or Redis)

---

## 8. Existing Lighting System

**Location:** `src/app/virtual-room/page.tsx` (lines 450-555)

### Current Implementation:
**Status:** [EXISTS — NEEDS UPGRADE]

**Lights Currently Implemented:**
✅ `HemisphereLight` — sky "#f7efe2", ground "#27322f", intensity 1.28
✅ `DirectionalLight` — "#ffe1ac", intensity 2.3, position [-10, 18, 8], shadows enabled
✅ Per-room `PointLight` — "#fff1cf", intensity 10-18, per room
✅ Skylight emissive meshes — "#c5f7ff" emissive, 0.45 intensity

**What's Missing:**
❌ Day/night cycle (live based on actual time)
❌ Time-based light changes
❌ Night mode darker ambient
❌ Night mode street lamps outdoors
❌ Intensity transitions (lerp between day/night)

### Required for Phase 4:
- Create `useLightingMode.ts` hook:
  - Check hour < 18 → "day"
  - Check hour >= 18 → "night"
  - Update every 60 seconds
- Day mode:
  - ambientLight intensity 0.6
  - directionalLight intensity 1, color "#fff8f0"
  - Canvas background #87CEEB (sky blue)
- Night mode:
  - ambientLight intensity 0.08
  - Canvas background #0a0a1a (dark)
  - Museum interior pointLights: [0,3,0], [3,2,3], [-3,2,3]
  - Street lamps (outdoor only): [0,4,-8], [4,4,0] with color "#ff9944"
- Smooth transitions: useFrame lerp at 0.02/frame
- Respect prefers-reduced-motion (snap instead of lerp)

---

## 9. Existing Weather System

**Status:** [MISSING]

- ❌ No weather system exists
- ❌ No fog variations
- ❌ No rain particles
- ❌ No weather state management

### Required for Phase 4:
- Seed from sessionStorage key `rc_weather`
- Conditions: ["clear", "cloudy", "light-rain", "mist"]
- Random on first visit, persist in sessionStorage
- Outdoor scene only (not inside museum)
- Implementations:
  - **clear:** No fog, sky as-is
  - **cloudy:** `<fog args={['#aaaaaa', 30, 80]}/>`, sky #999999
  - **light-rain:** fog + 200 Points particles (animated downward in useFrame)
  - **mist:** `<fog args={['#dddddd', 10, 40]}/>`, sky #cccccc
- Night overrides sky to #0a0a1a regardless of weather

---

## 10. Existing WebGL Fallback

**Status:** [MISSING]

- ❌ No WebGL detection
- ❌ No fallback UI for non-WebGL browsers
- ❌ Gallery fails silently if WebGL unavailable

### Required for Phase 4:
- Detect WebGL on mount:
```typescript
const canvas = document.createElement('canvas')
const hasWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
```
- If false → render `<WebGLFallback />`
- Fallback should show:
  - Responsive image grid grouped by room
  - Same data from `useGalleryData`
  - App logo in header
  - App Card component per artwork
  - role="img" and alt text on images
  - Fully keyboard and screen-reader accessible

---

## 11. Packages Installed

```bash
renewcanvas-africa@0.1.0
└── three@0.179.1
```

**Status:** [EXISTS — NEEDS UPGRADE]

✅ `three@0.179.1` — Installed and working
❌ `@react-three/fiber` — NOT installed (not needed, using vanilla THREE.js)
❌ `@react-three/drei` — NOT installed (not needed)

**Recommendation:**
- Keep vanilla THREE.js (don't break existing implementation)
- Only install R3F if explicitly required by task spec
- Current implementation is performant and functional

---

## 12. Blender MCP Connection

**Test Result:** ✅ Connected and responding

```json
{
  "name": "Scene",
  "object_count": 3,
  "objects": [
    {"name": "Cube", "type": "MESH"},
    {"name": "Light", "type": "LIGHT"},
    {"name": "Camera", "type": "CAMERA"}
  ],
  "materials_count": 2
}
```

**Integrations Available:**
✅ PolyHaven — Textures, HDRIs, models (enabled)
✅ Hunyuan3D — AI model generation (enabled)
❌ Hyper3D Rodin — (requires API key)
❌ Sketchfab — (requires API key)

**Status:** [EXISTS — OK] — Ready for Phase 3 asset creation

---

## 13. Design System Audit

### CSS Framework
**Tailwind CSS 4.2.4** — `@import "tailwindcss"` in `globals.css`

### Color Palette (from `src/app/globals.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#0d9488` | Teal — Sustainability theme |
| `--color-primary-dark` | `#0f766e` | Used in virtual-room for brand elements |
| `--color-primary-light` | `#14b8a6` | — |
| `--color-secondary` | `#f59e0b` | Amber/Orange — Creativity theme |
| `--color-secondary-dark` | `#d97706` | — |
| `--color-secondary-light` | `#fbbf24` | — |
| `--color-accent` | `#8b5cf6` | Purple — Transformation |
| `--color-earth` | `#78716c` | Stone — Materials |
| `--color-earth-light` | `#a8a29e` | — |
| `--background` | `#ffffff` | Light mode background |
| `--foreground` | `#171717` | Text color |
| `--muted` | `#f5f5f5` | Subtle backgrounds |
| `--muted-foreground` | `#737373` | Secondary text |

**Gallery-Specific Colors (hardcoded in virtual-room/page.tsx):**
```typescript
const BRAND_TEAL = "#0f766e"      // Matches --color-primary-dark
const BRAND_ORANGE = "#f59e0b"    // Matches --color-secondary
const BRAND_DARK = "#101417"      // Gallery background
```

### Font Family
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Component Library
**Status:** [MISSING] — No design system library installed

- ❌ No shadcn/ui
- ❌ No Radix UI
- ❌ No Chakra UI
- ❌ No MUI

**Custom Components:**
- `Navbar.tsx` — Main navigation
- `Footer.tsx` — Footer
- `DashboardLayout.tsx` — Dashboard wrapper
- `AnimatedLogo.tsx` — Logo animation
- `GoogleTranslate.tsx` — Translation widget

**UI Pattern in Gallery:**
- Modal: Custom inline `<div>` overlay with `bg-black/80 backdrop-blur-sm`
- Buttons: `rounded-lg bg-white/10 backdrop-blur hover:bg-white/15`
- Map: `rounded-full border border-white/15 bg-black/62 backdrop-blur-md`
- Panels: `rounded-xl border border-white/10 bg-black/78 backdrop-blur-md`

### Logo Assets

| File | Path | Usage |
|------|------|-------|
| Primary Logo | `/public/brand/renewcanvas-icon-full-color.png` | Opaque background |
| Transparent Logo | `/public/brand/renewcanvas-icon-full-color-removebg-preview.png` | Recommended for overlays |
| App Icon | `/public/icon.png` | Large (1215571 bytes) |
| Favicon | `/public/favicon.png` | Small |

**Recommendation for Phase 4:**
- Use transparent logo for GalleryLoadingScreen
- Use transparent logo for WebGL fallback header

### Existing Reusable Components
From `src/components/`:
- ✅ `Navbar` — Navigation bar (reusable)
- ✅ `Footer` — Footer (reusable)
- ✅ `DashboardLayout` — Dashboard wrapper (not needed for gallery)
- ✅ `AnimatedLogo` — Logo animation (could use for loading screen)
- ❌ No Card component (create inline with design tokens)
- ❌ No Button component (use Tailwind classes matching existing patterns)
- ❌ No Modal/Dialog component (virtual-room has custom inline modal — extract if needed)

### Design Consistency Requirements for Phase 4

**BEFORE writing any UI code, extract these constants:**

```typescript
const COLORS = {
  primary: '#0d9488',        // Teal
  primaryDark: '#0f766e',
  primaryLight: '#14b8a6',
  secondary: '#f59e0b',      // Amber
  secondaryDark: '#d97706',
  accent: '#8b5cf6',         // Purple
  background: '#ffffff',
  foreground: '#171717',
  muted: '#f5f5f5',
  mutedForeground: '#737373',
  // Gallery-specific (dark mode)
  galleryBg: '#101417',
  galleryOverlay: 'rgba(0, 0, 0, 0.8)',
  galleryPanel: 'rgba(0, 0, 0, 0.78)',
  galleryBorder: 'rgba(255, 255, 255, 0.1)',
}

const FONTS = {
  body: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}

const LOGO_PATH = '/public/brand/renewcanvas-icon-full-color-removebg-preview.png'
```

**UI Element Rules:**
- Loading screen: Use `AnimatedLogo` component + `COLORS.galleryBg`
- Overlays: Use `COLORS.galleryOverlay` with `backdrop-blur-sm`
- Panels/Cards: Use `COLORS.galleryPanel` with `rounded-xl border border-white/10 backdrop-blur-md`
- Buttons: Use `rounded-lg bg-white/10 backdrop-blur hover:bg-white/15`
- Room labels (HTML, not 3D Text): Use `text-white font-semibold` on `bg-black/50 rounded px-2 py-1`
- Never use arbitrary colors not in design tokens (except 3D scene sky colors)

---

## Summary: What Needs to Be Built

### Phase 1: Artwork Data API
**Status:** [EXISTS — NEEDS UPGRADE]

**Required:**
1. Add Prisma migration:
   - `tags: string[]` (nullable)
   - `theme: string` (nullable)
   - `impactScore: int` (nullable, 0-100)
   - `artistLocation: string` (nullable)
2. Update `/api/virtual-room/artworks` to return new fields
3. Seed development data in `prisma/seed.ts`

### Phase 2: Gallery Layout API
**Status:** [EXISTS — NEEDS UPGRADE]

**Required:**
1. Create `GET /api/gallery/layout` (or enhance `/api/museum/curation`)
2. Implement tag-based room matching for 6 specific rooms
3. Scoring: 1pt per tag match, case-insensitive
4. Tie-breaking: alphabetical
5. Unmatched: even distribution
6. Cache: 5 minutes

### Phase 3: Blender MCP Assets
**Status:** [MISSING]

**Required:** (only if spec requires)
1. `museum-exterior.glb` — Exterior building shell
2. `street-ground.glb` — Outdoor ground plane with path
3. `artwork-frame.glb` — Instanced picture frame

**Note:** Current procedural geometry works fine. Only create if spec explicitly requires.

### Phase 4: Virtual Gallery Upgrades
**Status:** [EXISTS — NEEDS UPGRADE]

**Required:**
1. ✅ Dynamic-import `/virtual-room` route (Suspense boundary)
2. ❌ Create `useLightingMode.ts` hook (day/night based on time)
3. ❌ Create `GalleryLighting.tsx` component (time-based lighting)
4. ❌ Create `WeatherSystem.tsx` component (sessionStorage-based weather)
5. ❌ Create `WebGLFallback.tsx` component (accessible image grid)
6. ❌ Add signboard text (THREE.Text mesh)
7. ❌ Add camera intro animation (lerp on mount, respect prefers-reduced-motion)
8. ❌ Add GalleryLoadingScreen (use AnimatedLogo + design tokens)
9. ❌ Update artwork overlay (ensure design consistency)
10. ❌ Update room labels (HTML overlay, not 3D Text, use design tokens)

### Phase 5: Automated Tests
**Status:** [MISSING]

**Required:**
1. Test `useLightingMode` (mock hour 10 → "day", hour 20 → "night")
2. Test `useGalleryData` (mock fetch → assert rooms array)
3. Test room tag-matching (if Phase 2 implemented)
4. Test WebGLFallback (jsdom render → assert logo + room headings)
5. Test ArtworkFrame overlay (click → opens, Escape → closes)

---

## Recommendations

### Keep What Works
✅ **Do NOT rewrite the existing virtual-room implementation**
- It's sophisticated, functional, and performant
- Vanilla THREE.js is fine (no need for R3F migration)
- Room system, curation, navigation all work well

### Upgrade Strategically
🔧 **Phase 1 & 2:** Add missing database fields and enhance room matching
🎨 **Phase 3:** Only create 3D assets if spec explicitly requires them
⚡ **Phase 4:** Add missing features (lighting, weather, fallback) WITHOUT breaking existing code
🧪 **Phase 5:** Add tests for new code only

### Design Consistency
🎨 **All new UI must use design tokens from globals.css**
- Never hardcode colors outside of extracted constants
- Reuse existing UI patterns (backdrop-blur, rounded corners, white/10 transparency)
- Use AnimatedLogo component for loading state
- Use transparent logo for overlays

---

## Approval Required

**This audit is complete. Please review the findings above before proceeding to Phase 1.**

**Questions for Clarification:**
1. Should we keep vanilla THREE.js or migrate to React Three Fiber?
   - **Recommendation:** Keep vanilla THREE.js (don't break what works)
2. Should we create the 3 Blender assets (exterior, ground, frame)?
   - **Recommendation:** Skip unless explicitly required (procedural geometry is sufficient)
3. Should the existing 6 room system be replaced or enhanced?
   - **Recommendation:** Enhance with tag-based matching (keep existing curation logic)

**Ready to proceed?** Type "approve" to begin Phase 1, or provide feedback for adjustments.
