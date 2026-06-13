"use client";

import { listArtworks, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import { artworkCategories } from "@/lib/ml/schemas";
import { ArrowRight, Filter, Grid3X3, LayoutList, Recycle, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ArtworkCard } from "@/components/ArtworkCard";
import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";

const categories = ["All", ...artworkCategories];

export default function MarketplacePage() {
  const { t } = useTranslation();
  const [artworks, setArtworks] = useState<FrontendArtwork[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"newest" | "price_low" | "price_high" | "popular">("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0, pageCount: 1 });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsLoading(true);
      setStatusMessage("");
      listArtworks({ scope: "marketplace", search: query, category: category === "All" ? undefined : category, sort, page, pageSize: 12 })
        .then((result) => {
          setArtworks(result.artworks);
          setPagination(result.pagination);
        })
        .catch((error) => setStatusMessage(error instanceof Error ? error.message : t("marketplace.couldNotLoad")))
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
              <Trans
                i18nKey="marketplace.heroTitle"
                components={{ amber: <span className="text-amber-500" />, teal: <span className="text-teal-600" /> }}
              />
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
              {t("marketplace.heroSubtitle")}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-xl">
              <div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-1 items-center px-4">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("marketplace.searchPlaceholder")}
                    className="w-full border-0 bg-transparent py-3 pl-3 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  type="submit"
                  className="m-1.5 rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  {t("marketplace.search")}
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
                  <div className="text-sm font-semibold text-gray-900">{t("marketplace.virtualGallery")}</div>
                  <div className="text-xs text-gray-500">{t("marketplace.virtualGalleryDesc")}</div>
                </div>
                <ArrowRight className="ml-1 h-4 w-4 text-gray-400" />
              </Link>
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
                    {item === "All" ? t("marketplace.all") : item}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
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
                    <option value="newest">{t("marketplace.sortNewest")}</option>
                    <option value="popular">{t("marketplace.sortPopular")}</option>
                    <option value="price_low">{t("marketplace.sortPriceLow")}</option>
                    <option value="price_high">{t("marketplace.sortPriceHigh")}</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  {t("marketplace.filters")}
                </button>
                <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
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
              /* Skeleton grid — mirrors the artwork card layout for a calm load. */
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading artworks">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="aspect-square w-full animate-pulse bg-gray-200" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded-lg bg-gray-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded-lg bg-gray-100" />
                      <div className="flex items-center justify-between pt-2">
                        <div className="h-5 w-20 animate-pulse rounded-lg bg-gray-200" />
                        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : artworks.length > 0 ? (
              <>
                <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                  {artworks.map((artwork) => (
                    <ArtworkCard key={artwork.id} artwork={artwork} compact={viewMode === "list"} onStatus={setStatusMessage} />
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <Link
                    href="/artworks"
                    className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-6 py-3 text-sm font-medium text-teal-700 hover:bg-teal-600 hover:text-white hover:border-teal-600 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]"
                  >
                    {t("marketplace.seeAll")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            ) : (
              /* Empty State - Artwork Coming Soon */
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                  <Recycle className="h-8 w-8 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t("marketplace.comingSoonTitle")}</h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
                  {t("marketplace.comingSoonDesc")}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    {t("marketplace.getNotified")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/register?role=artist"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t("marketplace.joinAsArtist")}
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
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-50"
                >
                  {t("marketplace.previous")}
                </button>
                <span className="text-sm text-gray-600">
                  {t("marketplace.pageOf", { page: pagination.page, pageCount: pagination.pageCount, total: pagination.total })}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.pageCount}
                  onClick={() => setPage((current) => Math.min(pagination.pageCount, current + 1))}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-50"
                >
                  {t("marketplace.next")}
                </button>
              </div>
            )}
          </div>
        </section>

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
                  <h3 className="text-lg font-bold text-gray-900">{t("marketplace.lookingTitle")}</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {t("marketplace.lookingDesc")}
                  </p>
                  <Link
                    href="/contact"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    {t("marketplace.joinWaitlist")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Are You an Artist Card */}
                <div className="relative rounded-xl bg-amber-50 p-8">
                  <span className="absolute right-6 top-6 rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-medium text-white">
                    {t("marketplace.comingSoonBadge")}
                  </span>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-100">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{t("marketplace.areYouArtistTitle")}</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {t("marketplace.areYouArtistDesc")}
                  </p>
                  <Link
                    href="/register?role=artist"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                  >
                    {t("marketplace.applyAsArtist")}
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

