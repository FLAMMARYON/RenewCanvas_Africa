"use client";

import { listArtworks, listRecommendations, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import { addToWishlist } from "@/lib/frontend/wishlist-api";
import { artworkCategories } from "@/lib/ml/schemas";
import { ArrowRight, Filter, Gavel, Grid3X3, Heart, LayoutList, Leaf, Package, Recycle, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

const categories = ["All", ...artworkCategories];

export default function MarketplacePage() {
  const [artworks, setArtworks] = useState<FrontendArtwork[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"newest" | "price_low" | "price_high" | "popular">("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0, pageCount: 1 });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<FrontendArtwork[]>([]);
  const [recommendationsSource, setRecommendationsSource] = useState<"personalized" | "recent">("recent");

  // Set to true when there are active auctions
  const hasActiveAuctions = true;

  // Fetch recommendations on mount
  useEffect(() => {
    listRecommendations()
      .then((result) => {
        setRecommendations(result.artworks);
        setRecommendationsSource(result.source);
      })
      .catch(() => {
        // Silently fail - recommendations are optional
      });
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsLoading(true);
      setStatusMessage("");
      listArtworks({ scope: "marketplace", search: query, category: category === "All" ? undefined : category, sort, page, pageSize: 12 })
        .then((result) => {
          setArtworks(result.artworks);
          setPagination(result.pagination);
        })
        .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Could not load artworks."))
        .finally(() => setIsLoading(false));
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [query, category, sort, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="h-16" />

      <main>
        {/* Hero Section */}
        <section className="bg-white pb-6 pt-12">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Discover <span className="text-amber-500">Unique</span> Upcycled <span className="text-teal-600">Artwork</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
              Browse our collection of stunning artwork created from recycled materials and discover unique
              pieces by independent and professional artists. Each piece comes with verified environmental
              impact.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-xl">
              <div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-1 items-center px-4">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search artwork, artists, or categories..."
                    className="w-full border-0 bg-transparent py-3 pl-3 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  type="submit"
                  className="m-1.5 rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Feature Cards */}
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/virtual-room"
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100">
                  <Sparkles className="h-4 w-4 text-teal-600" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">Virtual Gallery</div>
                  <div className="text-xs text-gray-500">Walk through our 3D museum</div>
                </div>
                <ArrowRight className="ml-1 h-4 w-4 text-gray-400" />
              </Link>

              {hasActiveAuctions && (
                <Link
                  href="/auctions"
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                    <Gavel className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      Live Auctions
                      <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-medium text-white">3 LIVE</span>
                    </div>
                    <div className="text-xs text-gray-500">Bid on exclusive pieces</div>
                  </div>
                  <ArrowRight className="ml-1 h-4 w-4 text-amber-500" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="border-y border-gray-100 bg-white py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setCategory(item);
                      setPage(1);
                    }}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      category === item
                        ? "bg-teal-600 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5">
                  <Filter className="h-4 w-4 text-gray-400" />
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
                    className="border-0 bg-transparent pr-6 text-sm text-gray-600 focus:outline-none focus:ring-0"
                  >
                    <option value="newest">Sort by</option>
                    <option value="newest">Newest</option>
                    <option value="popular">Most saved</option>
                    <option value="price_low">Price: low to high</option>
                    <option value="price_high">Price: high to low</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
                <div className="flex overflow-hidden rounded-md border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label="Show artwork grid"
                    className={`p-1.5 transition ${viewMode === "grid" ? "bg-teal-600 text-white" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-label="Show artwork list"
                    className={`p-1.5 transition ${viewMode === "list" ? "bg-teal-600 text-white" : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"}`}
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Artworks Section */}
        <section className="bg-gray-50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {statusMessage && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {statusMessage}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
              </div>
            ) : artworks.length > 0 ? (
              <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                {artworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} compact={viewMode === "list"} onStatus={setStatusMessage} />
                ))}
              </div>
            ) : (
              /* Empty State - Artwork Coming Soon */
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                  <Recycle className="h-8 w-8 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Artwork Coming Soon</h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
                  We are currently onboarding talented artists and curating our first collection of unique upcycled artwork. Be the first to know when we launch!
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    Get Notified
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/register?role=artist"
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Join as Artist
                  </Link>
                </div>
              </div>
            )}

            {pagination.pageCount > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-50"
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
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>

        {/* You Might Also Like Section */}
        {recommendations.length > 0 && (
          <section className="bg-white py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {recommendationsSource === "personalized" ? "You Might Also Like" : "Recently Added"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {recommendationsSource === "personalized"
                      ? "Based on your wishlist and past orders"
                      : "Fresh artworks just added to our collection"}
                  </p>
                </div>
                <Link
                  href="/marketplace"
                  className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  View All
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} compact={false} onStatus={setStatusMessage} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Promotional Cards */}
        {artworks.length === 0 && (
          <section className="bg-gray-50 pb-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Looking for Unique Art Card */}
                <div className="rounded-xl bg-teal-50 p-8">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-teal-100">
                    <Recycle className="h-5 w-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Looking for Unique Art?</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Sign up to be notified when our marketplace launches. Get early access to exclusive upcycled artwork with verified impact stories.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-5 inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    Join Waitlist
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Are You an Artist Card */}
                <div className="relative rounded-xl bg-amber-50 p-8">
                  <span className="absolute right-6 top-6 rounded-md bg-teal-600 px-2.5 py-1 text-xs font-medium text-white">
                    Coming Soon
                  </span>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Are You an Artist?</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Join our platform and showcase your upcycled creations to buyers who value sustainability. We provide materials and support.
                  </p>
                  <Link
                    href="/register?role=artist"
                    className="mt-5 inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                  >
                    Apply as Artist
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />
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
            onClick={async () => {
              try {
                await addToWishlist(artwork.id);
                onStatus("Artwork saved to your wishlist.");
              } catch (error) {
                onStatus(error instanceof Error ? error.message : "Sign in as a buyer to save artwork.");
              }
            }}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-rose-50 hover:text-rose-600"
          >
            <Heart className="h-4 w-4" />
            {artwork.favouriteCount}
          </button>
        </div>
      </div>
    </article>
  );
}
