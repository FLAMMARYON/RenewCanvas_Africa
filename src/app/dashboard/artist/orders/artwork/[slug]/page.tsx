"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { readArtwork, type FrontendArtwork } from "@/lib/frontend/artworks-api";

/**
 * Info-only artwork view for an order (item 11): image + description only.
 * Intentionally has NO buy / add-to-cart / CTA buttons.
 */
export default function OrderArtworkInfoPage() {
  const { t } = useTranslation();
  const params = useParams<{ slug: string }>();
  const [artwork, setArtwork] = useState<FrontendArtwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    readArtwork(params.slug)
      .then((a) => active && setArtwork(a))
      .catch(() => active && setError(t("artistDashboard.orderDetail.loadError")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [params.slug, t]);

  const image = artwork?.images?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/dashboard/artist/orders" className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800">
          <ArrowLeft className="h-4 w-4" />
          {t("artistDashboard.orderDetail.backToOrders")}
        </Link>

        {loading ? (
          <div className="mt-8 h-96 animate-pulse rounded-xl bg-gray-200" />
        ) : error || !artwork ? (
          <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error || t("artistDashboard.orderDetail.notFound")}</p>
        ) : (
          <article className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-teal-50">
              {image ? (
                <img src={image.url} alt={image.altText} className="h-full w-full object-contain" />
              ) : (
                <Package className="h-12 w-12 text-teal-300" />
              )}
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900">{artwork.title}</h1>
              <p className="mt-1 text-sm text-gray-500">{t("artistDashboard.orderDetail.byArtist", { name: artwork.artist?.name ?? "RenewCanvas Africa" })}</p>
              <p className="mt-4 whitespace-pre-line text-gray-700">{artwork.description}</p>
              {artwork.materials?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-gray-900">{t("artistDashboard.orderDetail.materials")}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {artwork.materials.map((m) => (
                      <span key={m.material} className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-700">
                        {m.material}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-6 text-sm text-gray-500">{t("artistDashboard.orderDetail.wasteDiverted", { kg: artwork.kgDiverted.toFixed(1) })}</p>
            </div>
          </article>
        )}

        <p className="mt-4 text-center text-xs text-gray-400">{t("artistDashboard.orderDetail.infoOnly")}</p>
      </main>
    </div>
  );
}
