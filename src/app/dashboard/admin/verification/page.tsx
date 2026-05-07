"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { defaultP1VerificationCopy } from "@/lib/i18n/p1-verification";
import { decideVerification, listVerificationItems, type VerificationItem } from "@/lib/frontend/verification-api";
import { AlertTriangle, CheckCircle, FileSearch, Info, Recycle, ShieldCheck, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const copy = defaultP1VerificationCopy.page;

export default function AdminVerificationPage() {
  const [queue, setQueue] = useState<VerificationItem[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [actionArtworkId, setActionArtworkId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    refreshQueue();
  }, []);

  const refreshQueue = () => {
    listVerificationItems()
      .then(setQueue)
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Could not load verification queue."));
  };

  const counts = useMemo(
    () => ({
      ready: queue.filter((item) => item.recommendedAction === "approve_ready").length,
      manual: queue.filter((item) => item.recommendedAction === "manual_review").length,
      missing: queue.filter((item) => item.recommendedAction === "request_more_info").length,
    }),
    [queue]
  );

  const handleDecision = async (artworkId: string, decision: "approve" | "reject" | "request_more_info", decisionNote = "") => {
    try {
      await decideVerification(artworkId, decision, decisionNote);
      setActionArtworkId(null);
      setNote("");
      refreshQueue();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not save verification decision.");
    }
  };

  return (
    <DashboardLayout role="admin" userName={copy.adminUserName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{copy.title}</h1>
          <p className="text-gray-500">{copy.description}</p>
        </div>

        {statusMessage && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{statusMessage}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Metric icon={CheckCircle} value={counts.ready} label={copy.metrics.ready} tone="teal" />
          <Metric icon={FileSearch} value={counts.manual} label={copy.metrics.manual} tone="amber" />
          <Metric icon={AlertTriangle} value={counts.missing} label={copy.metrics.missing} tone="red" />
        </div>

        <section className="rounded-lg border border-gray-100 bg-white">
          <div className="border-b border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900">{copy.queueTitle}</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {queue.map((item) => (
              <article key={item.artworkId} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{copy.byArtist(item.artist?.name ?? "Unknown artist")}</p>
                    <p className="mt-2 text-sm text-gray-700">{item.plainLanguageSummary}</p>
                    {item.adminNotes && <p className="mt-2 text-sm text-amber-700">{item.adminNotes}</p>}
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                    <ShieldCheck className="h-4 w-4" />
                    {copy.actionLabels[item.recommendedAction as keyof typeof copy.actionLabels] ?? item.reviewStatus}
                  </span>
                </div>

                <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Status label={copy.fieldLabels.pricing} value={copy.statusLabels[item.pricingStatus]} />
                  <Status label={copy.fieldLabels.impact} value={copy.statusLabels[item.impactStatus]} />
                  <Status label={copy.fieldLabels.museum} value={item.museumRoom ?? copy.statusLabels[item.museumStatus]} />
                </dl>

                {item.reviewFlags.length > 0 && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="mb-2 flex items-center gap-2 font-medium text-amber-900">
                      <Info className="h-4 w-4" />
                      {copy.reviewFlags}
                    </div>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">
                      {item.reviewFlags.map((flag) => (
                        <li key={flag}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.evidence.length > 0 && (
                  <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <h4 className="text-sm font-medium text-gray-900">Evidence</h4>
                    <div className="mt-2 space-y-2">
                      {item.evidence.map((evidence) => (
                        <a key={evidence.id} href={evidence.url} target="_blank" className="block text-sm text-teal-700">
                          {evidence.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 lg:flex-row">
                  <button onClick={() => handleDecision(item.artworkId, "approve")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">
                    <ThumbsUp className="h-4 w-4" />
                    Approve
                  </button>
                  <button onClick={() => setActionArtworkId(item.artworkId)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50">
                    <FileSearch className="h-4 w-4" />
                    Request More Info
                  </button>
                  <button onClick={() => setActionArtworkId(item.artworkId)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                    <ThumbsDown className="h-4 w-4" />
                    Reject
                  </button>
                </div>

                {actionArtworkId === item.artworkId && (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                    <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Decision note for the artist" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => handleDecision(item.artworkId, "request_more_info", note)} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white">Send Request</button>
                      <button onClick={() => handleDecision(item.artworkId, "reject", note)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">Reject</button>
                      <button onClick={() => setActionArtworkId(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm">Cancel</button>
                    </div>
                  </div>
                )}
              </article>
            ))}
            {queue.length === 0 && <p className="p-5 text-sm text-gray-500">No artwork is waiting for verification.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-teal-100 bg-teal-50 p-5">
          <div className="flex items-start gap-3">
            <Recycle className="mt-0.5 h-5 w-5 text-teal-700" />
            <p className="text-sm text-teal-900">{copy.decisionSupportNotice}</p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function Metric({ icon: Icon, value, label, tone }: { icon: typeof CheckCircle; value: number; label: string; tone: "teal" | "amber" | "red" }) {
  const colors = { teal: "text-teal-600", amber: "text-amber-600", red: "text-red-600" };
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5">
      <Icon className={`mb-3 h-6 w-6 ${colors[tone]}`} />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <dt className="text-xs font-medium uppercase text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  );
}
