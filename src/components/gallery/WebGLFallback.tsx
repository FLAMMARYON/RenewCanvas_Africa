"use client";

import Image from "next/image";
import Link from "next/link";
import { useGalleryData } from "@/lib/frontend/useGalleryData";

// Design system colors (from globals.css)
const COLORS = {
  primary: "#0d9488",
  primaryDark: "#0f766e",
  secondary: "#f59e0b",
  galleryBg: "#101417",
  galleryPanel: "rgba(0, 0, 0, 0.78)",
  galleryBorder: "rgba(255, 255, 255, 0.1)",
};

/**
 * WebGL fallback: Accessible image grid for browsers without WebGL support
 */
export function WebGLFallback() {
  const result = useGalleryData();

  return (
    <div
      className="min-h-screen bg-[#101417] text-white"
      style={{ backgroundColor: COLORS.galleryBg }}
    >
      {/* Header with logo */}
      <header className="border-b px-4 py-6" style={{ borderColor: COLORS.galleryBorder }}>
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <Image
              src="/brand/renewcanvas-icon-full-color-removebg-preview.png"
              alt="RenewCanvas Africa"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <div>
              <h1 className="text-2xl font-bold">RenewCanvas Africa Virtual Gallery</h1>
              <p className="text-sm text-white/65">Browse our curated collection</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* WebGL not supported notice */}
        <div
          className="mb-8 rounded-xl border p-6 backdrop-blur-md"
          style={{
            backgroundColor: COLORS.galleryPanel,
            borderColor: COLORS.galleryBorder,
          }}
        >
          <h2 className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
            3D Gallery Not Available
          </h2>
          <p className="text-sm text-white/75">
            Your browser does not support WebGL, which is required for the immersive 3D gallery
            experience. Below is an accessible view of all artworks organized by room.
          </p>
        </div>

        {/* Loading state */}
        {result.status === "loading" && (
          <div className="py-12 text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
            <p className="text-white/65">Loading gallery...</p>
          </div>
        )}

        {/* Error state */}
        {result.status === "error" && (
          <div
            className="rounded-xl border p-6"
            style={{
              backgroundColor: COLORS.galleryPanel,
              borderColor: COLORS.galleryBorder,
            }}
          >
            <h2 className="mb-2 text-lg font-semibold text-red-400">Error Loading Gallery</h2>
            <p className="text-sm text-white/75">{result.error}</p>
          </div>
        )}

        {/* Success: Display rooms and artworks */}
        {result.status === "success" && (
          <div className="space-y-12">
            {result.data.rooms.map((room) => (
              <section key={room.id} className="space-y-6">
                {/* Room heading */}
                <div
                  className="rounded-lg border-l-4 p-4"
                  style={{
                    backgroundColor: COLORS.galleryPanel,
                    borderLeftColor: COLORS.primaryDark,
                  }}
                >
                  <h2 className="text-2xl font-bold">{room.name}</h2>
                  <p className="text-sm text-white/65">
                    {room.artworks.length} {room.artworks.length === 1 ? "artwork" : "artworks"}
                  </p>
                </div>

                {/* Artwork grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {room.artworks.map((artwork) => (
                    <Link
                      key={artwork.id}
                      href={`/artwork/${artwork.id}`}
                      className="group overflow-hidden rounded-xl border backdrop-blur-md transition-transform hover:scale-105"
                      style={{
                        backgroundColor: COLORS.galleryPanel,
                        borderColor: COLORS.galleryBorder,
                      }}
                    >
                      {/* Artwork image */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-black">
                        {artwork.images[0] ? (
                          <img
                            src={artwork.images[0].url}
                            alt={artwork.images[0].altText || artwork.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            role="img"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-white/40">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Artwork info */}
                      <div className="p-4">
                        <h3 className="mb-1 font-semibold">{artwork.title}</h3>
                        <p className="mb-2 text-sm text-white/65">by {artwork.artist.name}</p>

                        {/* Materials */}
                        {artwork.materials.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1">
                            {artwork.materials.slice(0, 3).map((material, idx) => (
                              <span
                                key={idx}
                                className="rounded-full px-2 py-0.5 text-xs"
                                style={{
                                  backgroundColor: "rgba(15, 118, 110, 0.2)",
                                  color: COLORS.primary,
                                }}
                              >
                                {material.material}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Impact */}
                        {artwork.kgDiverted > 0 && (
                          <p className="text-xs text-green-300">
                            {artwork.kgDiverted} kg waste diverted
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Empty state */}
                {room.artworks.length === 0 && (
                  <div className="py-12 text-center text-white/40">
                    <p>No artworks in this room yet.</p>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t px-4 py-8" style={{ borderColor: COLORS.galleryBorder }}>
        <div className="mx-auto max-w-7xl text-center text-sm text-white/65">
          <p>RenewCanvas Africa — Transforming Plastic Waste into Sustainable Creative Value</p>
          <Link href="/marketplace" className="mt-2 inline-block text-white/85 hover:underline">
            ← Back to Marketplace
          </Link>
        </div>
      </footer>
    </div>
  );
}
