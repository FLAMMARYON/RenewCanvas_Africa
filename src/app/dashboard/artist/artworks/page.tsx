"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { listArtworks, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import { readProfile } from "@/lib/frontend/profile-api";
import { AlertCircle, CheckCircle, Clock, Edit3, Eye, Palette, Plus, Recycle, Search, ShoppingBag, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const statusConfig = {
  submitted: { labelKey: "statusSubmitted", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  under_review: { labelKey: "statusUnderReview", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  approved: { labelKey: "statusApproved", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  listed: { labelKey: "statusListed", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  rejected: { labelKey: "statusRejected", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle },
  sold: { labelKey: "statusSold", color: "text-purple-600", bgColor: "bg-purple-50", icon: ShoppingBag },
  reserved: { labelKey: "statusReserved", color: "text-purple-600", bgColor: "bg-purple-50", icon: ShoppingBag },
  draft: { labelKey: "statusDraft", color: "text-gray-600", bgColor: "bg-gray-50", icon: Clock },
  archived: { labelKey: "statusArchived", color: "text-gray-600", bgColor: "bg-gray-50", icon: Clock },
};

export default function ArtistArtworksPage() {
  const { t } = useTranslation();
  const [artworks, setArtworks] = useState<FrontendArtwork[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusMessage, setStatusMessage] = useState("");
  const [userName, setUserName] = useState(t("artistDashboard.artworksList.defaultUserName"));

  useEffect(() => {
    listArtworks("artist")
      .then((result) => setArtworks(result.artworks))
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : t("artistDashboard.artworksList.loadError")));
    readProfile()
      .then((profile) => setUserName(profile.displayName || t("artistDashboard.artworksList.defaultUserName")))
      .catch(() => {});
  }, [t]);

  const filteredArtworks = artworks.filter((artwork) => {
    const matchesSearch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || artwork.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = useMemo(
    () => ({
      total: artworks.length,
      live: artworks.filter((artwork) => artwork.status === "listed").length,
      pending: artworks.filter((artwork) => ["submitted", "under_review"].includes(artwork.status)).length,
      sold: artworks.filter((artwork) => artwork.status === "sold").length,
    }),
    [artworks]
  );

  return (
    <DashboardLayout role="artist" userName={userName}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("artistDashboard.artworksList.title")}</h1>
            <p className="text-gray-500">{t("artistDashboard.artworksList.subtitle")}</p>
          </div>
          <Link href="/dashboard/artist/artworks/create" className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 font-medium text-white hover:bg-teal-700">
            <Plus className="h-5 w-5" />
            {t("artistDashboard.artworksList.createNew")}
          </Link>
        </div>

        {statusMessage && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{statusMessage}</div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label={t("artistDashboard.artworksList.statTotal")} value={stats.total} />
          <Stat label={t("artistDashboard.artworksList.statLive")} value={stats.live} tone="green" />
          <Stat label={t("artistDashboard.artworksList.statPendingReview")} value={stats.pending} tone="amber" />
          <Stat label={t("artistDashboard.artworksList.statSold")} value={stats.sold} tone="purple" />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("artistDashboard.artworksList.searchPlaceholder")}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">{t("artistDashboard.artworksList.filterAll")}</option>
              <option value="listed">{t("artistDashboard.artworksList.filterLive")}</option>
              <option value="submitted">{t("artistDashboard.artworksList.filterPendingReview")}</option>
              <option value="rejected">{t("artistDashboard.artworksList.filterRejected")}</option>
              <option value="sold">{t("artistDashboard.artworksList.filterSold")}</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="hidden grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 p-4 text-sm font-medium text-gray-500 lg:grid">
            <div className="col-span-5">{t("artistDashboard.artworksList.columnArtwork")}</div>
            <div className="col-span-2">{t("artistDashboard.artworksList.columnStatus")}</div>
            <div className="col-span-2">{t("artistDashboard.artworksList.columnPrice")}</div>
            <div className="col-span-2">{t("artistDashboard.artworksList.columnImpact")}</div>
            <div className="col-span-1">{t("artistDashboard.artworksList.columnActions")}</div>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredArtworks.map((artwork) => (
              <ArtworkRow key={artwork.id} artwork={artwork} />
            ))}
          </div>
          {filteredArtworks.length === 0 && (
            <div className="p-12 text-center">
              <Palette className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h2 className="font-medium text-gray-900">{t("artistDashboard.artworksList.emptyTitle")}</h2>
              <p className="mt-1 text-gray-500">{t("artistDashboard.artworksList.emptyDescription")}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ArtworkRow({ artwork }: { artwork: FrontendArtwork }) {
  const { t } = useTranslation();
  const status = statusConfig[artwork.status as keyof typeof statusConfig] ?? statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="grid gap-4 lg:grid-cols-12 lg:items-center">
        <div className="col-span-5 flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-teal-50">
            {artwork.images[0] ? (
              <img src={artwork.images[0].url} alt={artwork.images[0].altText} className="h-full w-full object-cover" />
            ) : (
              <Palette className="h-8 w-8 text-teal-300" />
            )}
          </div>
          <div className="min-w-0">
            <Link href={`/dashboard/artist/artworks/${artwork.id}`} className="block truncate font-medium text-gray-900 hover:text-teal-600">
              {artwork.title}
            </Link>
            <p className="text-sm text-gray-500">{artwork.category}</p>
            {artwork.rejectionReason && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                {artwork.rejectionReason}
              </p>
            )}
          </div>
        </div>
        <div className="col-span-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${status.bgColor} ${status.color}`}>
            <StatusIcon className="h-3 w-3" />
            {t(`artistDashboard.artworksList.${status.labelKey}`)}
          </span>
        </div>
        <div className="col-span-2 font-semibold text-gray-900">{artwork.priceAmount.toLocaleString()} RWF</div>
        <div className="col-span-2 flex items-center gap-1 text-sm text-green-600">
          <Recycle className="h-4 w-4" />
          {artwork.kgDiverted.toFixed(1)} kg
        </div>
        <div className="col-span-1 flex items-center gap-2">
          <Link href={`/dashboard/artist/artworks/${artwork.id}`} className="rounded-lg p-2 text-gray-400 hover:bg-teal-50 hover:text-teal-600" title={t("artistDashboard.artworksList.actionEdit")}>
            <Edit3 className="h-4 w-4" />
          </Link>
          <Link href={`/artwork/${artwork.slug}`} target="_blank" className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600" title={t("artistDashboard.artworksList.actionView")}>
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "gray" }: { label: string; value: number; tone?: "gray" | "green" | "amber" | "purple" }) {
  const colors = {
    gray: "text-gray-900",
    green: "text-green-600",
    amber: "text-amber-600",
    purple: "text-purple-600",
  };
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <p className={`text-2xl font-bold ${colors[tone]}`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
