"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { buildVerificationQueue, type VerificationArtworkInput } from "@/lib/ml/verification";
import { calculateImpactEstimate } from "@/lib/ml/impact";
import { calculatePricingRecommendation } from "@/lib/ml/pricing";
import { curateMuseum } from "@/lib/ml/curator";
import { defaultP1VerificationCopy } from "@/lib/i18n/p1-verification";
import { AlertTriangle, CheckCircle, FileSearch, Info, Recycle, ShieldCheck } from "lucide-react";

const copy = defaultP1VerificationCopy.page;

const prototypeArtworks: VerificationArtworkInput[] = [
  {
    id: "mvp-1",
    title: "Ocean Memory",
    artistName: "Marie Uwimana",
    category: "Wall Art",
    materials: ["PET bottles"],
    materialWeightKg: 2,
    verificationStatus: "needs_review",
    pricingRecommendation: calculatePricingRecommendation({
      category: "Wall Art",
      materials: ["PET bottles"],
      materialWeight: 2,
      complexity: "moderate",
      experienceLevel: "emerging",
      hoursWorked: 12,
      views: 180,
      wishlistCount: 24,
    }),
    impactEstimate: calculateImpactEstimate([
      { type: "PET bottles", weightKg: 2, verifiedByImage: true, confidenceScore: 0.86 },
    ]),
  },
  {
    id: "mvp-2",
    title: "Signal Cabinet",
    artistName: "Jean Baptiste",
    category: "Sculpture",
    materials: ["Electronic waste", "Metal scraps"],
    materialWeightKg: 4.2,
    verificationStatus: "unverified",
    impactEstimate: calculateImpactEstimate([
      { type: "Electronic waste", weightKg: 2, verifiedByImage: true, confidenceScore: 0.44 },
      { type: "Metal scraps", weightKg: 2.2, verifiedByImage: false },
    ]),
  },
  {
    id: "mvp-3",
    title: "Paper Halo",
    artistName: "Alice Uwase",
    category: "Jewelry",
    materials: ["Paper"],
    materialWeightKg: 0.4,
    verificationStatus: "unverified",
  },
];

const curationPlan = curateMuseum({
  artworks: prototypeArtworks.map((artwork) => ({
    id: artwork.id,
    title: artwork.title,
    artistName: artwork.artistName,
    category: artwork.category,
    materials: artwork.materials,
    kgDiverted: artwork.impactEstimate?.kgDiverted ?? artwork.materialWeightKg,
  })),
});

const queue = buildVerificationQueue(prototypeArtworks, curationPlan, defaultP1VerificationCopy.queue);

export default function AdminVerificationPage() {
  const readyCount = queue.filter((item) => item.recommendedAction === "approve_ready").length;
  const manualCount = queue.filter((item) => item.recommendedAction === "manual_review").length;
  const missingCount = queue.filter((item) => item.recommendedAction === "request_more_info").length;

  return (
    <DashboardLayout role="admin" userName={copy.adminUserName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{copy.title}</h1>
          <p className="text-gray-500">{copy.description}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <CheckCircle className="mb-3 h-6 w-6 text-teal-600" />
            <p className="text-2xl font-bold text-gray-900">{readyCount}</p>
            <p className="text-sm text-gray-500">{copy.metrics.ready}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <FileSearch className="mb-3 h-6 w-6 text-amber-600" />
            <p className="text-2xl font-bold text-gray-900">{manualCount}</p>
            <p className="text-sm text-gray-500">{copy.metrics.manual}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <AlertTriangle className="mb-3 h-6 w-6 text-red-600" />
            <p className="text-2xl font-bold text-gray-900">{missingCount}</p>
            <p className="text-sm text-gray-500">{copy.metrics.missing}</p>
          </div>
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
                    <p className="text-sm text-gray-500">{copy.byArtist(item.artistName)}</p>
                    <p className="mt-2 text-sm text-gray-700">{item.plainLanguageSummary}</p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                    <ShieldCheck className="h-4 w-4" />
                    {copy.actionLabels[item.recommendedAction]}
                  </span>
                </div>

                <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <dt className="text-xs font-medium uppercase text-gray-500">{copy.fieldLabels.pricing}</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {copy.statusLabels[item.pricingStatus]}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <dt className="text-xs font-medium uppercase text-gray-500">{copy.fieldLabels.impact}</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {copy.statusLabels[item.impactStatus]}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <dt className="text-xs font-medium uppercase text-gray-500">{copy.fieldLabels.museum}</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {item.museumRoom ?? copy.statusLabels[item.museumStatus]}
                    </dd>
                  </div>
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
              </article>
            ))}
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
