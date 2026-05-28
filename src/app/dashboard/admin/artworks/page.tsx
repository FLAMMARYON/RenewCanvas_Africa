"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { listArtworks, reviewArtwork, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import { CheckCircle, Clock, Eye, Palette, Plus, Recycle, Search, ThumbsDown, ThumbsUp, User, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const statusConfig = {
  submitted: { label: "Pending Review", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  under_review: { label: "Under Review", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  listed: { label: "Listed", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  approved: { label: "Approved", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle },
};

export default function AdminArtworksPage() {
  const [artworks, setArtworks] = useState<FrontendArtwork[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedArtwork, setExpandedArtwork] = useState<string | null>(null);
  const [rejectingArtwork, setRejectingArtwork] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    refreshArtworks();
  }, []);

  const refreshArtworks = () => {
    listArtworks("admin")
      .then((result) => setArtworks(result.artworks))
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Could not load artworks."));
  };

  const filteredArtworks = artworks.filter((artwork) => {
    const search = `${artwork.title} ${artwork.artist?.name ?? ""}`.toLowerCase();
    return search.includes(searchQuery.toLowerCase()) && (statusFilter === "all" || artwork.status === statusFilter);
  });

  const stats = useMemo(
    () => ({
      total: artworks.length,
      renewcanvasOwned: artworks.filter((artwork) => artwork.ownerType === "renewcanvas").length,
      pending: artworks.filter((artwork) => ["submitted", "under_review"].includes(artwork.status)).length,
      listed: artworks.filter((artwork) => artwork.status === "listed").length,
    }),
    [artworks]
  );

  const handleReview = async (id: string, decision: "approve" | "reject") => {
    try {
      const updated = await reviewArtwork(id, decision, rejectionReason);
      setArtworks((current) => current.map((artwork) => (artwork.id === id ? updated : artwork)));
      setRejectingArtwork(null);
      setRejectionReason("");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not review artwork.");
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Artwork Moderation</h1>
            <p className="text-gray-500">Review artist submissions and manage RenewCanvas-owned inventory.</p>
          </div>
          <Link href="/dashboard/admin/artworks/create" className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700">
            <Plus className="h-4 w-4" />
            Create RenewCanvas Artwork
          </Link>
        </div>

        {statusMessage && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{statusMessage}</div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Total Artworks" value={stats.total} />
          <Stat label="RenewCanvas-owned" value={stats.renewcanvasOwned} />
          <Stat label="Pending Review" value={stats.pending} tone="amber" />
          <Stat label="Listed" value={stats.listed} tone="green" />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search artworks or artists..."
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5">
              <option value="all">All Status</option>
              <option value="submitted">Pending Review</option>
              <option value="listed">Listed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredArtworks.map((artwork) => {
            const status = statusConfig[artwork.status as keyof typeof statusConfig] ?? statusConfig.submitted;
            const StatusIcon = status.icon;
            const isExpanded = expandedArtwork === artwork.id;
            return (
              <div key={artwork.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                <button type="button" onClick={() => setExpandedArtwork(isExpanded ? null : artwork.id)} className="w-full p-4 text-left hover:bg-gray-50">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex flex-1 items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-teal-50">
                        {artwork.images[0] ? <img src={artwork.images[0].url} alt={artwork.images[0].altText} className="h-full w-full object-cover" /> : <Palette className="h-8 w-8 text-teal-300" />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-gray-900">{artwork.title}</h2>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{artwork.artist?.name ?? "RenewCanvas Africa"}</span>
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">{artwork.category}</span>
                          <span className={artwork.ownerType === "renewcanvas" ? "text-blue-700" : "text-purple-700"}>
                            {artwork.ownerType === "renewcanvas" ? "RenewCanvas-owned" : "Artist consignment"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{artwork.priceAmount.toLocaleString()} RWF</p>
                      <p className="flex items-center justify-end gap-1 text-sm text-green-600"><Recycle className="h-3 w-3" />{artwork.kgDiverted.toFixed(1)} kg</p>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h3 className="font-medium text-gray-900">Description</h3>
                        <p className="mt-2 text-sm text-gray-600">{artwork.description}</p>
                        <h3 className="mt-4 font-medium text-gray-900">Materials</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {artwork.materials.map((material) => (
                            <span key={material.id} className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                              {material.material} ({material.weightKg.toFixed(1)} kg)
                            </span>
                          ))}
                        </div>
                        {artwork.latestPricingRecommendation && (
                          <div className="mt-4 rounded-lg border border-purple-100 bg-white p-3">
                            <h3 className="font-medium text-gray-900">Pricing Recommendation</h3>
                            <p className="mt-1 text-sm text-gray-600">
                              Suggested {artwork.latestPricingRecommendation.suggested.toLocaleString()} RWF, range{" "}
                              {artwork.latestPricingRecommendation.min.toLocaleString()}-{artwork.latestPricingRecommendation.max.toLocaleString()} RWF.
                            </p>
                            <p className="mt-1 text-xs capitalize text-gray-500">Confidence: {artwork.latestPricingRecommendation.confidence}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {artwork.latestImpactEstimate && (
                          <div className="rounded-lg border border-green-100 bg-white p-3 text-sm text-gray-700">
                            <h3 className="font-medium text-gray-900">Impact Estimate</h3>
                            <p className="mt-1">{artwork.latestImpactEstimate.kgDiverted.toFixed(1)} kg diverted</p>
                            <p>{artwork.latestImpactEstimate.co2eAvoidedKg.toFixed(1)} kg CO2e avoided</p>
                            <p>{artwork.latestImpactEstimate.landfillVolumeAvoidedLitres.toFixed(1)} L landfill volume avoided</p>
                          </div>
                        )}
                        <Link href={`/artwork/${artwork.slug}`} target="_blank" className="inline-flex items-center gap-2 text-sm font-medium text-teal-700">
                          <Eye className="h-4 w-4" />
                          View public/detail route
                        </Link>
                        {["submitted", "under_review"].includes(artwork.status) && (
                          <div className="flex gap-3">
                            <button onClick={() => handleReview(artwork.id, "approve")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-medium text-white hover:bg-green-700">
                              <ThumbsUp className="h-4 w-4" />
                              Approve
                            </button>
                            <button onClick={() => setRejectingArtwork(artwork.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 font-medium text-red-600 hover:bg-red-50">
                              <ThumbsDown className="h-4 w-4" />
                              Reject
                            </button>
                          </div>
                        )}
                        {artwork.rejectionReason && (
                          <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{artwork.rejectionReason}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {rejectingArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h2 className="font-semibold text-gray-900">Reject Artwork</h2>
            <p className="mt-1 text-sm text-gray-500">Give the artist a clear reason for resubmission.</p>
            <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} rows={4} className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setRejectingArtwork(null)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5">Cancel</button>
              <button onClick={() => handleReview(rejectingArtwork, "reject")} className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white">Reject</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Stat({ label, value, tone = "gray" }: { label: string; value: number; tone?: "gray" | "green" | "amber" }) {
  const colors = { gray: "text-gray-900", green: "text-green-600", amber: "text-amber-600" };
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <p className={`text-2xl font-bold ${colors[tone]}`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
