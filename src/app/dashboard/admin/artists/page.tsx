"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { decideVerification, listVerificationItems, type VerificationItem } from "@/lib/frontend/verification-api";
import { AlertCircle, Award, CheckCircle, Clock, Eye, FileText, Mail, Palette, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const statusConfig = {
  pending: { label: "Pending Review", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  approved: { label: "Verified", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle },
  more_info_requested: { label: "More Info Requested", color: "text-blue-600", bgColor: "bg-blue-50", icon: AlertCircle },
};

export default function AdminArtistsPage() {
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
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load artist verification queue."))
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
      setError(decisionError instanceof Error ? decisionError.message : "Could not save verification decision.");
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artist Verification</h1>
          <p className="text-gray-500">Review live verification requests from submitted artworks</p>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total Requests" value={loading ? "-" : stats.total} />
          <Stat label="Pending Review" value={loading ? "-" : stats.pending} tone="amber" />
          <Stat label="Verified" value={loading ? "-" : stats.verified} tone="green" />
          <Stat label="Rejected" value={loading ? "-" : stats.rejected} tone="red" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search by artist or artwork..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="more_info_requested">More Info Requested</option>
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
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center font-bold text-purple-700 text-lg">
                        {(item.artist?.name ?? "Artist").split(" ").map((name) => name[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{item.artist?.name ?? "Unknown Artist"}</h3>
                          {item.reviewStatus === "approved" && <Award className="w-4 h-4 text-blue-500" />}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{item.artist?.email ?? "No email"}</span>
                          <span className="flex items-center gap-1"><Palette className="w-3 h-3" />{item.title}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{item.decidedAt ? new Date(item.decidedAt).toLocaleDateString() : "Awaiting review"}</p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Review Summary</h4>
                        <p className="text-sm text-gray-600">{item.plainLanguageSummary}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">Pricing: {item.pricingStatus}</span>
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">Impact: {item.impactStatus}</span>
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">Museum: {item.museumStatus}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Evidence</h4>
                        <div className="space-y-2">
                          {item.evidence.map((evidence) => (
                            <a key={evidence.id} href={evidence.url} target="_blank" className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
                              <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" />{evidence.label}</span>
                              <Eye className="w-4 h-4 text-teal-600" />
                            </a>
                          ))}
                          {item.evidence.length === 0 && <p className="text-sm text-gray-500">No evidence submitted.</p>}
                        </div>
                        {item.reviewStatus === "pending" && (
                          <div className="flex gap-3 pt-4">
                            <button onClick={() => handleDecision(item.artworkId, "approve")} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button onClick={() => setRejectingArtwork(item.artworkId)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                              <XCircle className="w-4 h-4" />
                              Reject
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
              <h3 className="font-medium text-gray-900 mb-1">No verification requests found</h3>
              <p className="text-gray-500">No artist verification requests match the current filters.</p>
            </div>
          )}
        </div>
      </div>

      {rejectingArtwork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-gray-900 mb-2">Reject Verification</h3>
            <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejecting this verification request. This will be shared with the artist.</p>
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter rejection reason..." rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRejectingArtwork(null); setRejectionReason(""); }} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
              <button onClick={() => handleDecision(rejectingArtwork, "reject")} disabled={!rejectionReason.trim()} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50">Reject</button>
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
