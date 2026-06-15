"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { decideVerification, listVerificationItems, type VerificationItem } from "@/lib/frontend/verification-api";
import { AlertCircle, Award, CheckCircle, Clock, Eye, FileText, Mail, Palette, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const statusConfig = {
  pending: { labelKey: "statusPendingReview", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  approved: { labelKey: "statusVerified", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  rejected: { labelKey: "statusRejected", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle },
  more_info_requested: { labelKey: "statusMoreInfoRequested", color: "text-blue-600", bgColor: "bg-blue-50", icon: AlertCircle },
};

export default function AdminArtistsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [rejectingArtwork, setRejectingArtwork] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadItems = () => {
    setLoading(true);
    setError("");
    listVerificationItems()
      .then(setItems)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : t("admin.artists.errorLoadQueue")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const search = `${item.title} ${item.artist?.name ?? ""} ${item.artist?.email ?? ""}`.toLowerCase();
    return search.includes(searchQuery.toLowerCase()) && (statusFilter === "all" || item.reviewStatus === statusFilter);
  });

  const stats = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((item) => item.reviewStatus === "pending").length,
      verified: items.filter((item) => item.reviewStatus === "approved").length,
      rejected: items.filter((item) => item.reviewStatus === "rejected").length,
    }),
    [items]
  );

  const handleDecision = async (artworkId: string, decision: "approve" | "reject") => {
    try {
      await decideVerification(artworkId, decision, rejectionReason.trim() || undefined);
      setRejectingArtwork(null);
      setRejectionReason("");
      loadItems();
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : t("admin.artists.errorSaveDecision"));
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("admin.artists.title")}</h1>
          <p className="text-gray-500">{t("admin.artists.subtitle")}</p>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label={t("admin.artists.statTotalRequests")} value={loading ? "-" : stats.total} />
          <Stat label={t("admin.artists.statPendingReview")} value={loading ? "-" : stats.pending} tone="amber" />
          <Stat label={t("admin.artists.statVerified")} value={loading ? "-" : stats.verified} tone="green" />
          <Stat label={t("admin.artists.statRejected")} value={loading ? "-" : stats.rejected} tone="red" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder={t("admin.artists.searchPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
              <option value="all">{t("admin.artists.filterAllStatus")}</option>
              <option value="pending">{t("admin.artists.statusPendingReview")}</option>
              <option value="approved">{t("admin.artists.statusVerified")}</option>
              <option value="rejected">{t("admin.artists.statusRejected")}</option>
              <option value="more_info_requested">{t("admin.artists.statusMoreInfoRequested")}</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredItems.map((item) => {
            const status = statusConfig[item.reviewStatus] ?? statusConfig.pending;
            const StatusIcon = status.icon;
            const isExpanded = expandedItem === item.id;
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button type="button" className="w-full p-4 text-left hover:bg-gray-50 transition-colors" onClick={() => setExpandedItem(isExpanded ? null : item.id)}>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-teal-50 rounded-full flex items-center justify-center font-bold text-teal-700 text-lg">
                        {(item.artist?.name ?? t("admin.artists.avatarFallback")).split(" ").map((name) => name[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{item.artist?.name ?? t("admin.artists.unknownArtist")}</h3>
                          {item.reviewStatus === "approved" && <Award className="w-4 h-4 text-blue-500" />}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {t(`admin.artists.${status.labelKey}`)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{item.artist?.email ?? t("admin.artists.noEmail")}</span>
                          <span className="flex items-center gap-1"><Palette className="w-3 h-3" />{item.title}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{item.decidedAt ? new Date(item.decidedAt).toLocaleDateString() : t("admin.artists.awaitingReview")}</p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t("admin.artists.reviewSummary")}</h4>
                        <p className="text-sm text-gray-600">{item.plainLanguageSummary}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{t("admin.artists.pricingLabel", { status: item.pricingStatus })}</span>
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{t("admin.artists.impactLabel", { status: item.impactStatus })}</span>
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{t("admin.artists.museumLabel", { status: item.museumStatus })}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{t("admin.artists.evidence")}</h4>
                        <div className="space-y-2">
                          {item.evidence.map((evidence) => (
                            <a key={evidence.id} href={evidence.url} target="_blank" className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
                              <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" />{evidence.label}</span>
                              <Eye className="w-4 h-4 text-teal-600" />
                            </a>
                          ))}
                          {item.evidence.length === 0 && <p className="text-sm text-gray-500">{t("admin.artists.noEvidence")}</p>}
                        </div>
                        {item.reviewStatus === "pending" && (
                          <div className="flex gap-3 pt-4">
                            <button onClick={() => handleDecision(item.artworkId, "approve")} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                              <CheckCircle className="w-4 h-4" />
                              {t("admin.artists.approve")}
                            </button>
                            <button onClick={() => setRejectingArtwork(item.artworkId)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                              <XCircle className="w-4 h-4" />
                              {t("admin.artists.reject")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!loading && filteredItems.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-1">{t("admin.artists.emptyTitle")}</h3>
              <p className="text-gray-500">{t("admin.artists.emptyDescription")}</p>
            </div>
          )}
        </div>
      </div>

      {rejectingArtwork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-gray-900 mb-2">{t("admin.artists.rejectModalTitle")}</h3>
            <p className="text-sm text-gray-500 mb-4">{t("admin.artists.rejectModalDescription")}</p>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder={t("admin.artists.rejectionReasonPlaceholder")} rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectingArtwork(null); setRejectionReason(""); }} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">{t("admin.artists.cancel")}</button>
              <button onClick={() => handleDecision(rejectingArtwork, "reject")} disabled={!rejectionReason.trim()} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50">{t("admin.artists.reject")}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Stat({ label, value, tone = "gray" }: { label: string; value: number | string; tone?: "gray" | "green" | "amber" | "red" }) {
  const colors = { gray: "text-gray-900", green: "text-green-600", amber: "text-amber-600", red: "text-red-600" };
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <p className={`text-2xl font-bold ${colors[tone]}`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
