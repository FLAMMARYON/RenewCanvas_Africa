"use client";

import { listArtworks, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import { addToWishlist } from "@/lib/frontend/wishlist-api";
import { Grid3X3, Heart, LayoutList, Leaf, Package, Recycle, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MarketplacePage() {
  const [artworks, setArtworks] = useState<FrontendArtwork[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"newest" | "price_low" | "price_high" | "popular">("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0, pageCount: 1 });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusMessage, setStatusMessage] = useState("");
  const [availableCategories, setAvailableCategories] = useState(["All"]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      listArtworks({ scope: "marketplace", search: query, category, sort, page, pageSize: 12 })
        .then((result) => {
          setArtworks(result.artworks);
          setPagination(result.pagination);
        })
        .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Could not load artworks."));
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [query, category, sort, page]);

  useEffect(() => {
    listArtworks({ scope: "marketplace", pageSize: 48 })
      .then((result) => {
        const allCategories = ["All", ...Array.from(new Set(result.artworks.map((artwork) => artwork.category)))];
        setAvailableCategories(allCategories);
      })
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Could not load artworks."));
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700">
              <Recycle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Renew<span className="text-teal-700">Canvas</span> <span className="text-amber-600">Africa</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            <Link href="/marketplace" className="text-teal-700">Marketplace</Link>
            <Link href="/artists" className="hover:text-teal-700">Artists</Link>
            <Link href="/virtual-room" className="hover:text-teal-700">Virtual Gallery</Link>
            <Link href="/login" className="rounded-lg bg-teal-700 px-4 py-2 text-white">Sign In</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Marketplace</h1>
              <p className="mt-3 text-lg text-gray-600">
                Browse approved upcycled artwork with real inventory status and platform ownership labels.
              </p>
            </div>
            <div className="mt-8 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search artwork, artists, or categories..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-4 pl-12 pr-4 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setCategory(item);
                      setPage(1);
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      category === item
                        ? "bg-teal-700 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-teal-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="marketplace-sort" className="sr-only">
                  Sort artworks
                </label>
                <select
                  id="marketplace-sort"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as typeof sort);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most saved</option>
                  <option value="price_low">Price: low to high</option>
                  <option value="price_high">Price: high to low</option>
                </select>
                <div className="flex w-fit overflow-hidden rounded-lg border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="Show artwork grid"
                  className={`p-2 ${viewMode === "grid" ? "bg-teal-700 text-white" : "text-gray-600"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="Show artwork list"
                  className={`p-2 ${viewMode === "list" ? "bg-teal-700 text-white" : "text-gray-600"}`}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
                </div>
              </div>
            </div>

            {statusMessage && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {statusMessage}
              </div>
            )}

            {artworks.length > 0 ? (
              <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                {artworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} compact={viewMode === "list"} onStatus={setStatusMessage} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h2 className="font-semibold text-gray-900">No listed artworks found</h2>
                <p className="mt-1 text-gray-500">Approved artwork will appear here after admin review.</p>
              </div>
            )}

            {pagination.pageCount > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pageCount} ({pagination.total} artworks)
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.pageCount}
                  onClick={() => setPage((current) => Math.min(pagination.pageCount, current + 1))}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function ArtworkCard({
  artwork,
  compact,
  onStatus,
}: {
  artwork: FrontendArtwork;
  compact: boolean;
  onStatus: (message: string) => void;
}) {
  const image = artwork.images[0];
  return (
    <article
      className={`group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        compact ? "sm:flex" : ""
      }`}
    >
      <Link href={`/artwork/${artwork.slug}`} className={`relative block bg-teal-50 ${compact ? "sm:w-56" : "aspect-[4/3]"}`}>
        {image ? (
          <img src={image.url} alt={image.altText} className="h-full w-full object-cover" />
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
        <div className="flex items-center gap-2 text-xs font-medium text-teal-700">
          <Leaf className="h-4 w-4" />
          {artwork.kgDiverted.toFixed(1)} kg diverted
        </div>
        <h2 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-teal-700">{artwork.title}</h2>
        <p className="mt-1 text-sm text-gray-500">by {artwork.artist?.name ?? "RenewCanvas Africa"}</p>
        <p className="mt-3 line-clamp-2 text-sm text-gray-600">{artwork.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-bold text-gray-900">{artwork.priceAmount.toLocaleString()} RWF</span>
          <button
            type="button"
            onClick={async () => {
              try {
                await addToWishlist(artwork.id);
                onStatus("Artwork saved to your wishlist.");
              } catch (error) {
                onStatus(error instanceof Error ? error.message : "Sign in as a buyer to save artwork.");
              }
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-rose-50 hover:text-rose-600"
          >
            <Heart className="h-4 w-4" />
            {artwork.favouriteCount}
          </button>
        </div>
      </div>
    </article>
  );
}
