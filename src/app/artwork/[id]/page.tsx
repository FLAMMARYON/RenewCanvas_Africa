"use client";

import { readArtwork, recordArtworkView, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  MapPin,
  Package,
  Recycle,
  Share2,
  Shield,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function ArtworkDetailPage() {
  const params = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState<FrontendArtwork | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    readArtwork(params.id)
      .then((loaded) => {
        setArtwork(loaded);
        recordArtworkView(loaded.id);
      })
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Could not load artwork."));
  }, [params.id]);

  if (statusMessage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="px-4 py-24">
          <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
            {statusMessage}
            <Link href="/marketplace" className="mt-4 block font-medium text-teal-700">Back to marketplace</Link>
          </div>
        </main>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
            Loading artwork...
          </div>
        </main>
      </div>
    );
  }

  const images = artwork.images.length ? artwork.images : [];
  const activeImage = images[selectedImage];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="h-16" />

      <main>
        <div className="bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-4 text-sm sm:px-6 lg:px-8">
            <Link href="/marketplace" className="text-gray-500 hover:text-teal-700">Marketplace</Link>
            <span className="px-2 text-gray-300">/</span>
            <span className="font-medium text-gray-900">{artwork.title}</span>
          </div>
        </div>

        <section className="bg-gray-50 py-8">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm">
                {activeImage ? (
                  <img src={activeImage.url} alt={activeImage.altText} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-teal-50">
                    <Package className="h-16 w-16 text-teal-300" />
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedImage((current) => (current === 0 ? images.length - 1 : current - 1))}
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedImage((current) => (current === images.length - 1 ? 0 : current + 1))}
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-4 flex gap-3">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`h-20 w-20 overflow-hidden rounded-lg ${selectedImage === index ? "ring-2 ring-teal-600" : "opacity-70"}`}
                    >
                      <img src={image.url} alt={image.altText} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">{artwork.category}</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                  {artwork.ownerType === "renewcanvas" ? "RenewCanvas-owned" : "Artist artwork"}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{artwork.title}</h1>
              <p className="mt-2 text-gray-600">By <span className="font-medium text-teal-700">{artwork.artist?.name ?? "RenewCanvas Africa"}</span></p>
              <p className="mt-6 text-3xl font-bold text-gray-900">{artwork.priceAmount.toLocaleString()} RWF</p>

              <div className="mt-8">
                <h2 className="font-semibold text-gray-900">Description</h2>
                <p className="mt-2 text-gray-600">{artwork.description}</p>
              </div>

              <div className="mt-6">
                <h2 className="font-semibold text-gray-900">Materials Used</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {artwork.materials.map((material) => (
                    <span key={material.id} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                      {material.material} ({material.weightKg.toFixed(1)} kg)
                    </span>
                  ))}
                </div>
              </div>

              {artwork.dimensions && (
                <div className="mt-6">
                  <h2 className="font-semibold text-gray-900">Dimensions</h2>
                  <p className="mt-2 text-gray-600">{artwork.dimensions}</p>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/checkout?artworkId=${encodeURIComponent(artwork.id)}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-4 font-medium text-white hover:bg-teal-800">
                  <ShoppingCart className="h-5 w-5" />
                  Buy Now
                </Link>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-6 py-4 text-gray-700">
                  <Heart className="h-5 w-5" />
                  Save
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-6 py-4 text-gray-700">
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl bg-white p-4">
                <TrustBadge icon={Truck} label="Secure Shipping" />
                <TrustBadge icon={Shield} label="Verified Impact" />
                <TrustBadge icon={Leaf} label={`${artwork.viewCount.toLocaleString()} views`} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-100">
                  <Award className="h-10 w-10 text-teal-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{artwork.artist?.name ?? "RenewCanvas Africa"}</h2>
                  <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    Kigali, Rwanda
                  </div>
                  <p className="mt-3 text-gray-600">
                    {artwork.ownerType === "renewcanvas"
                      ? "This is platform-owned inventory. Revenue belongs to RenewCanvas after payment and delivery costs."
                      : "Artist-owned artwork. RenewCanvas mediates payment, delivery, and post-delivery payout release."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function TrustBadge({ icon: Icon, label }: { icon: typeof Truck; label: string }) {
  return (
    <div className="text-center">
      <Icon className="mx-auto mb-1 h-6 w-6 text-teal-700" />
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}
