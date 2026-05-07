import type { FrontendArtwork } from "./artworks-api";

export type WishlistItem = {
  id: string;
  savedAt: string;
  artwork: FrontendArtwork;
};

type WishlistResponse = {
  ok: boolean;
  items: WishlistItem[];
  message?: string;
};

export async function readWishlist() {
  const response = await fetch("/api/wishlist", { credentials: "include" });
  const payload = (await response.json()) as WishlistResponse;
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not load wishlist.");
  return payload.items;
}

export async function addToWishlist(artworkId: string) {
  const response = await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ artworkId }),
  });
  const payload = (await response.json()) as WishlistResponse;
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not save wishlist item.");
  return payload.items;
}

export async function removeFromWishlist(artworkId: string) {
  const response = await fetch(`/api/wishlist/${encodeURIComponent(artworkId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  const payload = (await response.json()) as { ok: boolean; message?: string };
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not remove wishlist item.");
}
