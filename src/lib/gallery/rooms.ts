/**
 * Fixed virtual-gallery rooms + per-room display capacity.
 *
 * The 3D gallery is a CURATED, FIXED-capacity space — a fixed, predefined set of
 * category rooms, each showing only the top-performing artworks of its category
 * up to its capacity. Rooms are NEVER created dynamically based on how many
 * artworks exist.
 *
 * `capacity` = the number of artwork display slots that room can physically
 * show, i.e. the number of wall slots defined for the matching room in
 * `src/app/virtual-room/page.tsx` (the `ROOM_SLOTS` table). These numbers are
 * the single source of truth for "how many pieces a room shows" — to change a
 * room's capacity, change it here AND add/remove the matching wall slots in
 * `ROOM_SLOTS`. A 3D room can only show as many framed pieces as it has wall
 * slots, so a higher cap (e.g. 200) is not meaningful unless that many physical
 * slots are added.
 *
 * Room id → 3D room key mapping (see `roomForArtworkCategory` in page.tsx):
 *   sculpture-room    → court     (12 slots)
 *   painting-room     → main      (8 slots)
 *   wearables-room    → left      (14 slots)
 *   living-space-room → right     (14 slots)
 *   mixed-media-room  → corridor  (12 slots)  ← also the fallback room
 */
export type GalleryRoomConfig = {
  id: string;
  name: string;
  categories: readonly string[];
  /** Max artworks shown in this room. Must equal the room's wall-slot count. */
  capacity: number;
};

export const GALLERY_ROOMS: readonly GalleryRoomConfig[] = [
  { id: "sculpture-room", name: "Sculpture Room", categories: ["Sculpture"], capacity: 12 },
  { id: "painting-room", name: "Painting Room", categories: ["Wall Art", "Painting"], capacity: 8 },
  { id: "wearables-room", name: "Wearables Room", categories: ["Jewelry", "Fashion"], capacity: 14 },
  { id: "living-space-room", name: "Living Space Room", categories: ["Home Decor", "Furniture"], capacity: 14 },
  { id: "mixed-media-room", name: "Mixed Media Room", categories: ["Mixed Media", "Other"], capacity: 12 },
] as const;

/** Category buckets that don't match a named room land here. */
export const FALLBACK_ROOM_ID = "mixed-media-room";

/** Which fixed room a category belongs to (falls back to the mixed-media room). */
export function roomIdForCategory(category: string): string {
  const match = GALLERY_ROOMS.find((room) => room.categories.includes(category));
  return match?.id ?? FALLBACK_ROOM_ID;
}

/** Capacity for a room id (0 if the id is unknown). */
export function roomCapacity(roomId: string): number {
  return GALLERY_ROOMS.find((room) => room.id === roomId)?.capacity ?? 0;
}
