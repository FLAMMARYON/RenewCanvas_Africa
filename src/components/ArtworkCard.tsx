"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Leaf, Package } from "lucide-react";
import { addToWishlist } from "@/lib/frontend/wishlist-api";
import type { FrontendArtwork } from "@/lib/frontend/artworks-api";

/**
 * Shared artwork card used by the Marketplace and the All Artworks page.
 * Extracted verbatim from the marketplace so both surfaces render an identical
 * card (no style drift).
 */
export function ArtworkCard({
  artwork,
  compact,
  onStatus,
}: {
  artwork: FrontendArtwork;
  compact: boolean;
  onStatus: (message: string) => void;
}) {
  const image = artwork.images[0];
  // Optimistic wishlist state: heart fills and the count increments on click,
  // before the API responds; we revert if the save fails.
  const [saved, setSaved] = useState(false);
  const [favourites, setFavourites] = useState(artwork.favouriteCount);

  const handleSave = async () => {
    if (saved) return;
    setSaved(true);
    setFavourites((current) => current + 1);
    try {
      await addToWishlist(artwork.id);
      onStatus("Artwork saved to your wishlist.");
    } catch (error) {
      setSaved(false);
      setFavourites((current) => current - 1);
      onStatus(error instanceof Error ? error.message : "Sign in as a buyer to save artwork.");
    }
  };

  return (
    <article
      className={`group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        compact ? "sm:flex" : ""
      }`}
    >
      <Link
        href={`/artwork/${artwork.slug}`}
        className={`relative block bg-teal-50 ${
          compact
            ? // List view: fixed box, contain (no crop/stretch), uniform across items
              "flex h-44 items-center justify-center sm:w-56 sm:shrink-0"
            : "aspect-[4/3]"
        }`}
      >
        {image ? (
          <img
            src={image.url}
            alt={image.altText}
            className={compact ? "max-h-full max-w-full object-contain" : "h-full w-full object-cover"}
          />
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center">
            <Package className="h-10 w-10 text-teal-300" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700">
          {artwork.ownerType === "renewcanvas" ? "RenewCanvas-owned" : "Artist artwork"}
        </span>
      </Link>
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-teal-600">
          <Leaf className="h-4 w-4" />
          {artwork.kgDiverted.toFixed(1)} kg diverted
        </div>
        <h2 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-teal-600">{artwork.title}</h2>
        <p className="mt-1 text-sm text-gray-500">by {artwork.artist?.name ?? "RenewCanvas Africa"}</p>
        <p className="mt-3 line-clamp-2 text-sm text-gray-600">{artwork.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-gray-900">{artwork.priceAmount.toLocaleString()} RWF</span>
          <button
            type="button"
            onClick={handleSave}
            aria-label="Save to wishlist"
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm hover:bg-rose-50 hover:text-rose-600 ${
              saved ? "text-rose-600" : "text-gray-500"
            }`}
          >
            <Heart className={`h-4 w-4 ${saved ? "fill-rose-600 text-rose-600" : ""}`} />
            {favourites}
          </button>
        </div>
      </div>
    </article>
  );
}
