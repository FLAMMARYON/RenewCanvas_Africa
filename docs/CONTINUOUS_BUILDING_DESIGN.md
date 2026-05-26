# Continuous Building Architecture Design

> Phase 3 Implementation Plan
> Created: 2026-05-25

## Current Problem

The virtual gallery has **two disconnected scenes** that swap in/out:

### Exterior Scene (`buildExterior()`)
- Ground plane at y=0
- Path leading to building
- Museum facade at z=-12 (front of building)
- Entrance archway ("tunnel") at z=-11.25
- Trees, benches, landscaping
- **Disposed when entering building** (line 1230: `disposeExterior()`)

### Interior Scene (`buildMuseum()`)
- Completely separate room system
- Entrance room positioned independently
- No connection to exterior
- Only exists after `enterBuilding()` is called

### The Disconnect
```typescript
// Line 1228-1237
const enterBuilding = () => {
  disposeExterior(exteriorGroupRef.current, scene);  // ← REMOVES EXTERIOR
  sceneStateRef.current = "interior";
  camera.position.set(0, CAMERA_Y, 4);
  // ... builds interior, but exterior is gone
};
```

**Result:** Cannot see through doors, cannot turn around from inside and see outdoors.

---

## Solution: Unified Continuous Building

### Architectural Concept

```
                           UNIFIED SCENE
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│  Exterior (always visible)          Interior (always visible) │
│  ┌─────────────────────┐            ┌────────────────────┐   │
│  │  Ground, Path       │            │  Entrance Room     │   │
│  │  Trees, Benches     │            │  Main Gallery      │   │
│  │                     │            │  Left/Right Wings  │   │
│  │  Museum Facade  ◄───┼────────────┼──► Connected via   │   │
│  │    at z = -12       │   Doors    │      same coords   │   │
│  │                     │            │                    │   │
│  │  Camera starts      │            │  Can walk through  │   │
│  │    at z = 22        │            │                    │   │
│  └─────────────────────┘            └────────────────────┘   │
│                                                                │
│  Both exist simultaneously in same THREE.Scene                │
└──────────────────────────────────────────────────────────────┘
```

### Key Changes

#### 1. Remove Scene Disposal
**Before:**
```typescript
const enterBuilding = () => {
  disposeExterior(exteriorGroupRef.current, scene); // ❌ Removes exterior
  sceneStateRef.current = "interior";
  buildInteriorOnce();
};
```

**After:**
```typescript
const enterBuilding = () => {
  // ✅ Keep exterior in scene, just move camera
  sceneStateRef.current = "interior";
  buildInteriorOnce();
  // No disposal!
};
```

#### 2. Build Both on Page Load
**Before:**
```typescript
// Line 1253-1265
exteriorGroupRef.current = buildExterior(scene);
// Interior built later when entering
```

**After:**
```typescript
exteriorGroupRef.current = buildExterior(scene);
buildInteriorOnce(); // ✅ Build both immediately
// Both exist, camera starts outside
```

#### 3. Align Interior Entrance with Exterior Entrance

**Current exterior entrance:**
- Facade at z = -12
- Tunnel/archway at z = -11.25 to -11.6
- Arch floor at z = -13.5

**Interior entrance room must:**
- Start at z = -14 (just beyond exterior facade)
- Entrance room extends from z = -14 to z = -24 (10m depth)
- First station at z = -19 (center of entrance room)

#### 4. Create Proper Entrance Doors

Add glass doors at z = -12.5 (at facade threshold):
```typescript
// Glass door frames
const doorFrameMaterial = new THREE.MeshStandardMaterial({
  color: "#2A2A2A",
  roughness: 0.3,
  metalness: 0.7
});

// Glass panels (semi-transparent)
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: "#FFFFFF",
  transparent: true,
  opacity: 0.3,
  roughness: 0.1,
  metalness: 0,
  transmission: 0.9, // ← Makes it see-through!
});

// Left door panel
const leftGlass = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 7.5),
  glassMaterial
);
leftGlass.position.set(-1.75, 4, -12.5);

// Right door panel
const rightGlass = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 7.5),
  glassMaterial
);
rightGlass.position.set(1.75, 4, -12.5);
```

#### 5. Entrance Lobby Improvements

**Current entrance room** (in `addRoom()` function):
- Dark walls (#1A1A1A)
- Basic geometry
- No connection to exterior

**Improved entrance lobby:**
- Lighter walls (#2A2621) for transition
- Skylights/windows to match reference images
- Visible from outside through glass doors
- Floor material matches exterior path material
- Ceiling height matches facade proportions

---

## Implementation Steps

### Step 1: Remove disposeExterior Call
File: `src/app/virtual-room/page.tsx` line 1230

```typescript
// REMOVE THIS LINE:
disposeExterior(exteriorGroupRef.current, scene);
```

### Step 2: Build Interior on Page Load
File: `src/app/virtual-room/page.tsx` line 1259

```typescript
// Add after exterior is built:
exteriorGroupRef.current = buildExterior(scene);
buildInteriorOnce(); // ← ADD THIS
```

### Step 3: Remove Scene State Switching Logic
**Current:**
- Camera movement triggers `enterBuilding()`
- `enterBuilding()` swaps scenes
- `sceneStateRef.current` switches between "exterior"/"interior"

**New:**
- Both always exist
- Camera movement is just movement
- `sceneStateRef.current` only affects fog/lighting (optional)
- Remove entrance trigger at z < 4

### Step 4: Add Glass Entrance Doors
In `buildExterior()` function, after line 1015 (after columns):

```typescript
// Glass entrance doors (see-through)
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: "#E8F4F8",
  transparent: true,
  opacity: 0.25,
  roughness: 0.05,
  metalness: 0,
  transmission: 0.95,
  thickness: 0.1,
});

const doorFrame = new THREE.MeshStandardMaterial({
  color: "#1A1A1A",
  roughness: 0.3,
  metalness: 0.6,
});

// Door frames (4 pieces - 2 per door)
[[-3.5, -0.5], [3.5, 0.5]].forEach(([x, frameX]) => {
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 8, 0.2),
    doorFrame
  );
  frame.position.set(x + frameX, 4.5, -12.4);
  frame.castShadow = true;
  exterior.add(frame);
});

// Glass panels (2 doors)
[[-1.75, 1.75]].forEach(([leftX, rightX]) => {
  const leftGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 7.5),
    glassMaterial
  );
  leftGlass.position.set(leftX, 4.5, -12.5);
  exterior.add(leftGlass);

  const rightGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 7.5),
    glassMaterial
  );
  rightGlass.position.set(rightX, 4.5, -12.5);
  exterior.add(rightGlass);
});
```

### Step 5: Improve Entrance Room Visibility
In `addRoom()` function, entrance room case:

```typescript
if (roomKey === "entrance") {
  // Lighter wall material for entrance (transition from exterior)
  wallMaterial = new THREE.MeshStandardMaterial({
    color: "#2A2621", // Warmer sandstone tone
    roughness: 0.75
  });

  // Floor matches exterior path
  floorMaterial = new THREE.MeshStandardMaterial({
    color: "#5C4A3A",
    roughness: 0.85
  });
}
```

### Step 6: Remove Entrance Trigger Logic
Find and remove the automatic entrance trigger (z < 4 detection):

```typescript
// REMOVE or comment out sections like:
if (camera.position.z < 4 && sceneStateRef.current === "exterior") {
  enterBuilding();
}
```

---

## Expected Results

### Visual Continuity
✅ User starts outside at z=22
✅ Walks down path toward facade at z=-12
✅ Sees glass doors with interior visible beyond
✅ Crosses threshold at z=-12 (no scene swap)
✅ Enters lobby smoothly
✅ Can turn around and see outdoors through doors

### Technical Benefits
- Simpler code (no scene swapping)
- No disposal/rebuild overhead
- Natural spatial continuity
- Easier to debug (everything always exists)
- Matches reference images (continuous architecture)

### Performance Considerations
- Both scenes exist simultaneously
- Estimate: ~2x polygon count (still manageable)
- Use LOD (Level of Detail) for distant objects if needed
- Most interior rooms far from camera when outside (culled by Three.js)

---

## Acceptance Criteria

- [ ] Exterior and interior both exist in same scene from page load
- [ ] No `disposeExterior()` call when crossing threshold
- [ ] Glass entrance doors visible from outside
- [ ] Interior lobby visible through doors from exterior
- [ ] User can walk through entrance smoothly
- [ ] From inside lobby, can see outdoors through entrance
- [ ] No visual popping or scene swapping
- [ ] Reference image architectural continuity achieved

---

## Files to Modify

1. `src/app/virtual-room/page.tsx`
   - Line 1230: Remove `disposeExterior()` call
   - Line 1259: Add `buildInteriorOnce()` after exterior
   - Line 884+: Add glass doors to `buildExterior()`
   - Line ~450: Improve entrance room materials in `addRoom()`
   - Remove entrance trigger logic

---

## Next Steps After This Phase

- Phase 4: First-person controls with pitch (vertical look)
- Phase 5: Proper PBR materials throughout
- Phase 6: Comprehensive day/night lighting
- Phase 7: Remove exterior logos
- Phase 8: Improve artwork cards

---

*Design complete. Ready for implementation.*
