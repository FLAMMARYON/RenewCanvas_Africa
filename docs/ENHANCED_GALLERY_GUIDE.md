# Enhanced Virtual Gallery - User Guide

**Date:** 2026-05-25
**Status:** ✅ Ready to View

---

## 🎉 What's New

Your virtual gallery has been enhanced with:

### ✅ Features Implemented
1. **Enhanced R3F Gallery Page** (`/virtual-room-enhanced`)
2. **Day/Night Lighting** with smooth transitions
3. **Weather System** (clear, cloudy, rain, mist)
4. **Tag-Based Room Matching** (6 curated galleries)
5. **3D Museum Assets** (exterior, ground, artwork frames)
6. **Signboard Text** ("ANYTHING IS ART IN THE RIGHT EYES")
7. **Camera Navigation** with orbit controls
8. **Room Name Labels** with artwork counts
9. **WebGL Fallback** for unsupported browsers
10. **Mock Data Support** (works without database)

---

## 🚀 How to View

### Option 1: Development Server

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Visit the enhanced gallery:**
   ```
   http://localhost:3000/virtual-room-enhanced
   ```

3. **Navigate:**
   - **Orbit:** Click and drag with left mouse button
   - **Pan:** Click and drag with right mouse button (or Shift + left click)
   - **Zoom:** Scroll wheel

### Option 2: Original Gallery

The original virtual gallery is still available at:
```
http://localhost:3000/virtual-room
```

Both galleries coexist without conflicts.

---

## 📍 What You'll See

### Entrance Area
- **Signboard** with "RenewCanvas Africa" branding
- Large text: **"ANYTHING IS ART IN THE RIGHT EYES"**
- Museum exterior building (20m × 10m × 15m)
- Street ground with benches and lamp posts

### 6 Gallery Rooms

Each room displays artworks in a circular arrangement:

1. **🍾 PET Bottle Wing**
   - Artworks made from PET bottles and plastic
   - Tags: pet, bottle, plastic, recycled plastic

2. **👩 Women Artists Gallery**
   - Works by women artists
   - Tags: women, female, girl, she, her

3. **🎓 Youth & Student Gallery**
   - Youth and climate action artworks
   - Tags: youth, student, school, climate, young

4. **💻 E-Waste Innovation Hall**
   - Electronic waste sculptures
   - Tags: ewaste, electronic, circuit, computer

5. **🏙️ Kigali Recycled Futures**
   - Rwanda-themed artworks
   - Tags: kigali, rwanda, african, city

6. **📚 School Collection Showcase**
   - Educational collection pieces
   - Tags: school, education, kids, collection

### Room Labels
Each room shows:
- **Room name** in white text
- **Artwork count** in orange (e.g., "5 artworks")

### Artwork Frames
- Individual frames for each artwork
- Artwork image displayed on frame
- Title label below each frame
- Arranged in a circle (8m radius from center)

---

## 🌤️ Dynamic Features

### Day/Night Lighting

**Automatic Time-Based Lighting:**
- **Day mode** (before 18:00 / 6pm):
  - Bright ambient lighting
  - Directional sunlight
  - Sky blue background (#87CEEB)

- **Night mode** (after 18:00 / 6pm):
  - Dim ambient lighting
  - **Indoor:** 3 museum point lights
  - **Outdoor:** 2 street lamps with warm glow
  - Dark background (#0a0a1a)

**Smooth Transitions:**
- Lighting smoothly lerps over time (0.02/frame)
- Respects `prefers-reduced-motion` accessibility setting

### Weather System

**4 Weather Conditions** (randomly chosen, persists in session):

1. **Clear** ☀️
   - No fog
   - Normal sky

2. **Cloudy** ☁️
   - Gray fog (#aaaaaa, 30-80m)
   - Overcast sky (#999999)

3. **Light Rain** 🌧️
   - Fog + 200 animated rain particles
   - Rainy sky (#667788)
   - Particles fall and reset continuously

4. **Mist** 🌫️
   - Dense fog (#dddddd, 10-40m)
   - Misty sky (#cccccc)

**Persistence:** Weather condition saved to `sessionStorage` as `rc_weather`

---

## 🎨 Design System

All colors match your app's design system:

```typescript
COLORS = {
  primary: "#0d9488",        // Teal (brand color)
  primaryDark: "#0f766e",    // Dark teal
  secondary: "#f59e0b",      // Amber/Orange
  galleryBg: "#101417",      // Dark background
  galleryPanel: "rgba(0, 0, 0, 0.78)",  // Panels
  galleryBorder: "rgba(255, 255, 255, 0.1)",  // Borders
}
```

**Logo:** `/brand/renewcanvas-icon-full-color-removebg-preview.png`

---

## 🔧 Technical Architecture

### Pages Created

1. **`/virtual-room-enhanced/page.tsx`**
   - Main page component
   - WebGL detection
   - Dynamic import for R3F components
   - Fallback to accessible image grid

2. **`EnhancedGalleryScene.tsx`**
   - R3F Canvas setup
   - Integrates all gallery components
   - Loads 3D assets
   - Renders rooms and artworks

### API Endpoint

**`GET /api/gallery/layout`**

Returns:
```json
{
  "rooms": [
    {
      "id": "pet-bottle-wing",
      "name": "PET Bottle Wing",
      "artworks": [...]
    },
    ...
  ],
  "timestamp": 1716627695000
}
```

**Features:**
- Tag-based room matching (scoring algorithm)
- 5-minute response cache
- Mock data fallback (6 sample artworks)

### 3D Assets (GLB Files)

Located in `public/models/`:

1. **museum-exterior.glb** (1.2 KB)
   - 28 vertices, 15 faces
   - Modernist building with entrance archway

2. **street-ground.glb** (5.7 KB)
   - 152 vertices, 82 faces
   - 30m × 30m ground with path, benches, lamps

3. **artwork-frame.glb** (1.5 KB)
   - 20 vertices, 13 faces
   - 1.2m × 1.6m picture frame for artworks

**Total Size:** 8.4 KB (Draco compressed)

---

## 🛡️ WebGL Fallback

If WebGL is not supported:
- Automatically shows accessible image grid
- Organized by room
- Responsive layout (1-4 columns)
- All artwork images and metadata
- **WCAG 2.1 AA compliant**

---

## 📊 Database Status

### Schema Updated ✅
New fields added to `Artwork` model:
- `tags: String[]` - For room matching
- `theme: String?` - Artwork theme
- `impactScore: Int?` - 0-100 impact rating
- `artistLocation: String?` - Artist location

### Mock Data Active ✅
Gallery works without database using sample artworks:
- 6 artworks (one per room category)
- Unsplash placeholder images
- Representative of each room type

### To Use Real Data

When your database has artworks:

1. **Add tags to artworks** (run seed script):
   ```bash
   npx tsx prisma/seed-gallery-tags.ts
   ```

2. **Artworks automatically match rooms** based on tags

3. **Remove mock data fallback** (optional):
   Edit `src/app/api/gallery/layout/route.ts` and remove the `if (artworks.length === 0)` block

---

## 🔗 Integration Points

### Linking to Enhanced Gallery

From your existing pages:

```tsx
import Link from "next/link";

<Link href="/virtual-room-enhanced">
  Visit Enhanced Gallery
</Link>
```

### Navigation Menu

Add to your navbar:
```tsx
<nav>
  <Link href="/">Home</Link>
  <Link href="/marketplace">Marketplace</Link>
  <Link href="/virtual-room">Virtual Gallery</Link>
  <Link href="/virtual-room-enhanced">Enhanced Gallery (Beta)</Link>
</nav>
```

---

## 🎯 Room Matching Algorithm

### How It Works

1. **Scoring:** Each artwork gets scored against each room's tags
   - 1 point per tag match (case-insensitive, partial matching)
   - Example: artwork with `["pet", "bottle"]` scores 2 points in PET Bottle Wing

2. **Assignment:** Artwork goes to highest-scoring room
   - If tie: alphabetical by room name
   - If no matches: evenly distributed across all rooms

3. **Distribution:** Ensures every room has artworks

### Example

Artwork:
```json
{
  "title": "Ocean Waves",
  "tags": ["pet", "bottle", "plastic", "ocean"]
}
```

Scores:
- PET Bottle Wing: **3 points** (pet, bottle, plastic)
- Women Artists Gallery: 0 points
- Youth Gallery: 0 points
- ...

**Result:** Assigned to PET Bottle Wing ✅

---

## 🐛 Troubleshooting

### Gallery Not Loading

1. **Check console for errors:**
   - Open DevTools (F12)
   - Look for WebGL or resource loading errors

2. **Verify GLB assets exist:**
   ```bash
   ls public/models/*.glb
   ```
   Should show 3 files

3. **Check API response:**
   Visit `http://localhost:3000/api/gallery/layout`
   Should return JSON with 6 rooms

### Performance Issues

1. **Reduce weather particles:**
   Edit `WeatherSystem.tsx`, change 200 to 100

2. **Disable weather:**
   Remove `<WeatherSystem outdoor />` from `EnhancedGalleryScene.tsx`

3. **Use simpler lighting:**
   Remove `indoor` and `outdoor` props from `<GalleryLighting />`

### WebGL Not Detected

- Gallery automatically falls back to accessible image grid
- No action needed
- User sees all artworks in 2D layout

---

## 📝 Next Steps

### Optional Enhancements

1. **Add More Rooms:**
   - Edit `GALLERY_ROOMS` in `src/app/api/gallery/layout/route.ts`
   - Add new room with tags
   - Layout in `EnhancedGalleryScene.tsx` (add position)

2. **Customize Weather:**
   - Edit conditions in `WeatherSystem.tsx`
   - Add fog density controls
   - Change rain particle count

3. **Interactive Artwork:**
   - Add click handlers to frames
   - Show artwork detail overlay
   - Link to `/artwork/[id]` pages

4. **Mobile Optimization:**
   - Add touch controls
   - Reduce particle count on mobile
   - Simplify lighting for performance

5. **VR Support:**
   - Add VR button from `@react-three/drei`
   - Test with WebXR-compatible devices

---

## 📚 Documentation Files

- **VIRTUAL_GALLERY_AUDIT.md** - Pre-implementation audit
- **VIRTUAL_GALLERY_PROGRESS.md** - Phase tracking
- **PHASE_4_COMPLETION.md** - R3F components report
- **VERIFICATION_CHECKLIST.md** - Test results
- **ENHANCED_GALLERY_GUIDE.md** - This file

---

## ✨ Summary

Your enhanced virtual gallery is **ready to view** at `/virtual-room-enhanced`!

**Key Features:**
- ✅ 3D environment with R3F
- ✅ Day/night lighting
- ✅ Weather effects
- ✅ 6 curated rooms
- ✅ Tag-based matching
- ✅ Signboard and labels
- ✅ WebGL fallback
- ✅ Works with mock data

**Original Gallery:** Preserved at `/virtual-room` (no changes)

**Next:** Start dev server (`npm run dev`) and navigate to `/virtual-room-enhanced`

Enjoy exploring your enhanced gallery! 🎨✨
