# Virtual Gallery Zone Analysis
> Created: 2026-05-25
> Purpose: Diagnose spatial coherence issues before implementing fixes

## Current State Analysis

### CRITICAL SPATIAL ISSUE IDENTIFIED

**The interior museum is positioned IN FRONT of the exterior building facade.**

#### Current Coordinates:

**OUTDOOR ZONE (Exterior):**
- User spawn point: `z = 22` (far from building)
- Intro end position: `z = 6`
- Path extends from: `z = 8` to `z = -8`
- Museum facade (front wall): `z = -12`
- Glass entrance doors: `z = -12.4` to `z = -12.5`
- Entrance tunnel/archway floor: `z = -13.5`
- Trees at: `z = -5`, `z = -1`, `z = 2` (various x positions)
- Benches at: `z = -2`
- Bollards from: `z = 12` to `z = -0.5`
- Extensions (side wings): `z = -16`

**INDOOR ZONE (Interior Rooms):**
- Entrance Lobby: `x=0, z=8` ⚠️ **PROBLEM: This is FORWARD of the facade!**
- Main Gallery: `x=0, z=-10`
- Left Gallery: `x=-17, z=-10`
- Right Gallery: `x=17, z=-10`
- Sculpture Court: `x=0, z=-28`
- Forward Corridor: `x=0, z=-46`

### The Problem

The entrance lobby at `z=8` is **20 meters in front** of the museum facade at `z=-12`.

**What should happen:**
```
User (z=22) → Path → Facade (z=-12) → [ENTRANCE OPENING] → Entrance Lobby (z=?)
```

**What actually happens:**
```
User (z=22) → Path → Entrance Lobby (z=8) 🤦 → ... → Facade (z=-12)
```

The interior is floating in the outdoor space, in front of the building!

## Correct Zone Layout Plan

### Target Coordinate System

**OUTDOOR ZONE:**
- User spawn: `z = 22`
- Approach path: `z = 20` to `z = -11`
- Trees: `x = ±4` to `±7`, `z = 0` to `z = 10` (sides of path, OUTSIDE building footprint)
- Benches: `x = ±4.5`, `z = 2` (sides of path)
- Bollards: `x = ±2.8`, `z = 12` to `z = -9` (path edges)
- Museum facade: `z = -12`
- Entrance opening: `z = -12` (center)

**BUILDING SHELL:**
- Front facade: `z = -12`
- Side walls extend from `z = -12` to `z = -70` (or wherever corridor ends)
- Roof above all rooms
- Glass entrance doors at `z = -12`, opening height `y = 0` to `y = 8`

**INDOOR ZONE (Corrected):**
- Entrance Lobby: `x=0, z=-16` (4m behind facade entrance)
- Main Gallery: `x=0, z=-34` (24m deeper)
- Left Gallery: `x=-17, z=-34`
- Right Gallery: `x=17, z=-34`
- Sculpture Court: `x=0, z=-52`
- Forward Corridor: `x=0, z=-70`

### Room Depth Math
Each room is `ROOM_D = 16` units deep.
- Entrance: center at `z=-16`, spans `z=-8` to `z=-24`
- Main Gallery: center at `z=-34`, spans `z=-26` to `z=-42`
- etc.

Door from Entrance → Main is at entrance's north wall (`z = -24`), aligning with main's south wall.

## Movement System Issues

### Current Movement (Broken)
- **Arrow Keys / WASD**: Discrete teleportation between room centers
- **No smooth walking**
- **No collision detection**
- **No analog movement speed**

Example from line 1403-1410:
```typescript
if (event.key === "ArrowUp" || event.key === "w") {
  if (sceneStateRef.current === "exterior") {
    targetRef.current.z = Math.max(-11, targetRef.current.z - 2.2);
    return;
  }
  const target = chooseDoorFromHeading(roomRef.current, wingRef.current, false);
  if (target) goTo(target, wingRef.current);
}
```

This teleports between rooms, not smooth movement.

### Required Movement System

**Smooth First-Person Controls:**
- `W`: Move forward in facing direction (continuous, frame-based)
- `S`: Move backward
- `A`: Strafe left
- `D`: Strafe right
- `Mouse drag`: Look around (yaw + pitch) ✅ Already implemented
- `Speed`: ~3-5 units/second
- `Height`: Camera locked at `y = 1.72` (eye level)

**Implementation approach:**
1. Track key states in ref: `{ forward, backward, left, right }`
2. In animation loop, calculate movement vector based on active keys
3. Apply movement in direction camera faces (using `yawRef`)
4. Update `targetRef.current` incrementally, not teleporting
5. Optional: Simple collision (clamp to building bounds)

## Exterior Objects - Current Positions

All exterior objects are correctly added to `exterior` Group (lines 885-1198):

✅ **Ground plane** → `exterior.add(ground)`
✅ **Path** → `exterior.add(path)`
✅ **Museum facade** → `primitiveMuseum.add(facade)` → `exterior.add(primitiveMuseum)`
✅ **Trees** (6 positions) → `exterior.add(trunk)`, `exterior.add(canopy)`
✅ **Benches** (2 positions) → `exterior.add(seat)`, `exterior.add(leg)`
✅ **Bollards** (12 positions) → `exterior.add(post)`, `exterior.add(cap)`
✅ **Stars** (night mode) → `exterior.add(starGeo)`
✅ **Lighting** (day/night) → `exterior.add(hemi)`, `exterior.add(sunLight)`, etc.

**Good news:** No exterior objects are inside interior rooms. They're all in the `exterior` group.

**Bad news:** Because the interior entrance is at `z=8` (in front of facade), the spatial relationship is broken.

## Interior Objects - Current Positions

Interior rooms are built in `buildMuseum()` (line 1210):
- Each room creates walls, floor, ceiling
- Artworks mounted on walls
- Doors between rooms
- Skylights, lights

All added to `world` group → `scene.add(world)`

Separate from `exterior` group.

## The Fix Plan

### Step 1: Update Room Station Coordinates

Change room stations to be BEHIND the facade:

```typescript
const roomStations: Station[] = [
  { key: "entrance", label: "Entrance Lobby", x: 0, z: -16, heading: 0 },  // was z: 8
  { key: "main", label: "Main Gallery", x: 0, z: -34, heading: 0 },        // was z: -10
  { key: "left", label: "Left Gallery", x: -17, z: -34, heading: -90 },    // was z: -10
  { key: "right", label: "Right Gallery", x: 17, z: -34, heading: 90 },    // was z: -10
  { key: "court", label: "Sculpture Court", x: 0, z: -52, heading: 0 },    // was z: -28
  { key: "corridor", label: "Forward Corridor", x: 0, z: -70, heading: 0 }, // was z: -46
];
```

**Delta: z_new = z_old - 24**

This shifts the entire interior museum 24 units backward (more negative z), positioning entrance lobby 4m behind the facade entrance.

### Step 2: Update Intro Camera Positions

```typescript
const introFrom = new THREE.Vector3(0, CAMERA_Y, 22);  // unchanged
const introTo = new THREE.Vector3(0, CAMERA_Y, -8);    // was z: 6, now approach facade closely
```

### Step 3: Update Entrance Trigger

```typescript
const enterBuilding = () => {
  if (sceneStateRef.current === "interior") return;
  sceneStateRef.current = "interior";
  camera.position.set(0, CAMERA_Y, -14);               // just inside entrance
  targetRef.current.set(0, CAMERA_Y, -16);             // entrance lobby center
  yawRef.current = 0;
  pitchRef.current = 0;
  buildInteriorOnce();
  roomRef.current = "entrance";
  wingRef.current = 0;
  setRoom("entrance");
  setWing(0);
};
```

### Step 4: Implement Smooth Movement

Replace discrete teleportation with continuous movement:

```typescript
const keysRef = useRef({ forward: false, backward: false, left: false, right: false });

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === "w" || event.key === "ArrowUp") keysRef.current.forward = true;
  if (event.key === "s" || event.key === "ArrowDown") keysRef.current.backward = true;
  if (event.key === "a") keysRef.current.left = true;
  if (event.key === "d") keysRef.current.right = true;
  // Arrow Left/Right still rotate camera
  if (event.key === "ArrowLeft" || event.key === "q") yawRef.current += degToRad(18);
  if (event.key === "ArrowRight" || event.key === "e") yawRef.current -= degToRad(18);
};

const onKeyUp = (event: KeyboardEvent) => {
  if (event.key === "w" || event.key === "ArrowUp") keysRef.current.forward = false;
  if (event.key === "s" || event.key === "ArrowDown") keysRef.current.backward = false;
  if (event.key === "a") keysRef.current.left = false;
  if (event.key === "d") keysRef.current.right = false;
};

// In animation loop:
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

  // Optional collision bounds
  targetRef.current.x = Math.max(-20, Math.min(20, targetRef.current.x));
  targetRef.current.z = Math.max(-80, Math.min(22, targetRef.current.z));
}

camera.position.lerp(targetRef.current, 0.08); // smooth follow
```

### Step 5: Fix Entrance Hotspot Position

Update exterior entrance hotspot to be at facade:

```typescript
hotspot.position.set(0, 0.02, -11);  // was z: -10.5, now right at facade entrance
```

### Step 6: Test Spatial Coherence

After fixes:
1. User spawns at `z=22`, sees museum in distance
2. Walks forward (W key) smoothly toward facade
3. Reaches facade at `z=-12`
4. Clicks "ENTER MUSEUM" hotspot or walks through glass doors
5. Transitions to `z=-14` (just inside entrance)
6. Can turn around (drag mouse) and see outdoor scene through glass
7. Walk deeper into entrance lobby toward main gallery
8. Indoor walls, outdoor trees all in correct zones

## Artwork Info Card Issue

Current modal (lines 1665-1711):
```typescript
<div className="relative grid max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl bg-[#15191c] shadow-2xl md:grid-cols-[0.95fr_1.05fr]">
```

**Problem:** `max-h-[92vh]` may overflow on small screens, no internal scrolling.

**Fix:**
```typescript
<div className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-[#15191c] shadow-2xl md:grid-cols-[0.95fr_1.05fr]">
  <div className="min-h-72 max-h-[50vh] bg-black overflow-hidden">
    <img ... className="h-full w-full object-contain" />
  </div>
  <div className="flex flex-col p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
    ...
  </div>
</div>
```

Add `overflow-y-auto` to content area, constrain image height.

## Summary

### Critical Fixes Required:
1. ✅ **Shift interior coordinates 24 units backward** (z_new = z_old - 24)
2. ✅ **Implement smooth WASD movement** (continuous, not teleporting)
3. ✅ **Fix entrance trigger position** (at facade, not in front)
4. ✅ **Fix artwork info card overflow** (internal scrolling)
5. ✅ **Test spatial coherence** (turn around from inside, see outside)

### What's Already Correct:
- Exterior objects are in exterior group (not inside rooms)
- Glass doors with transmission (see-through)
- First-person pitch controls (mouse look up/down)
- Continuous building architecture (both scenes exist)

### What User Will Experience After Fix:
- Spawn outside museum at z=22
- Walk smoothly toward entrance (WASD)
- Museum facade at z=-12 looks correct
- Enter through glass doors
- Now inside entrance lobby at z=-16 (behind facade)
- Turn around → see outdoor scene through glass entrance
- Walk deeper into museum → main gallery, side galleries
- Outdoor objects (trees, benches) remain outside where they belong
- Smooth first-person controls throughout
