"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Recycle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArtworkCard } from "@/components/ArtworkCard";
import { listArtworks, type FrontendArtwork } from "@/lib/frontend/artworks-api";

const PAGE_SIZE = 24;

export default function AllArtworksPage() {
  const [artworks, setArtworks] = useState<FrontendArtwork[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Same data source the marketplace uses.
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    listArtworks({ scope: "marketplace", page: 1, pageSize: PAGE_SIZE })
      .then((result) => {
        if (!active) return;
        setArtworks(result.artworks);
        setPage(result.pagination.page);
        setPageCount(result.pagination.pageCount);
        setTotal(result.pagination.total);
      })
      .catch(() => {
        if (active) setStatusMessage("We couldn't load artworks. Please try again.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const loadMore = () => {
    if (isLoadingMore || page >= pageCount) return;
    const next = page + 1;
    setIsLoadingMore(true);
    listArtworks({ scope: "marketplace", page: next, pageSize: PAGE_SIZE })
      .then((result) => {
        setArtworks((current) => [...current, ...result.artworks]);
        setPage(result.pagination.page);
        setPageCount(result.pagination.pageCount);
      })
      .catch(() => setStatusMessage("We couldn't load more artworks. Please try again."))
      .finally(() => setIsLoadingMore(false));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-900">All Artworks</h1>
          <p className="mt-2 text-gray-600">
            {isLoading ? "Loading the full collection…" : `Browse every available piece${total ? ` (${total})` : ""}.`}
          </p>
        </div>

        {statusMessage && (
          <p role="status" aria-live="polite" className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {statusMessage}
          </p>
        )}

        {isLoading ? (
          /* Skeleton grid — mirrors the artwork card layout. */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading artworks">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="aspect-[4/3] w-full animate-pulse bg-gray-200" />
                <div className="space-y-3 p-5">
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} compact={false} onStatus={setStatusMessage} />
              ))}
            </div>

            {page < pageCount && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
              <Recycle className="h-8 w-8 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No artworks yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
              We are curating our first collection of unique upcycled artwork. Check back soon.
            </p>
            <div className="mt-6">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-700">
                Get Notified
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
