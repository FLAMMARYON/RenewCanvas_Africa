"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { deleteArtwork, readArtwork, updateArtwork, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import { readProfile } from "@/lib/frontend/profile-api";
import { listVerificationItems, submitVerificationEvidence, type VerificationItem } from "@/lib/frontend/verification-api";
import { AlertCircle, ArrowLeft, CheckCircle, Plus, Recycle, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { artworkCategories, recyclableMaterials } from "@/lib/ml/schemas";

const categories = [...artworkCategories];
const materialTypes = [...recyclableMaterials];

type EditableMaterial = { material: string; weightKg: number; source: string };

export default function EditArtworkPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [artwork, setArtwork] = useState<FrontendArtwork | null>(null);
  const [materials, setMaterials] = useState<EditableMaterial[]>([]);
  const [verificationRequest, setVerificationRequest] = useState<VerificationItem | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [userName, setUserName] = useState("Artist");

  useEffect(() => {
    readProfile()
      .then((profile) => setUserName(profile.displayName || "Artist"))
      .catch(() => {});
    readArtwork(params.id)
      .then((loaded) => {
        setArtwork(loaded);
        setMaterials(loaded.materials.map((material) => ({
          material: material.material,
          weightKg: material.weightKg,
          source: material.source ?? "",
        })));
      })
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Could not load artwork."));
    listVerificationItems()
      .then((items) => setVerificationRequest(items.find((item) => item.artworkId === params.id) ?? null))
      .catch(() => setVerificationRequest(null));
  }, [params.id]);

  const handleInputChange = (field: keyof FrontendArtwork, value: string | number) => {
    setArtwork((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleMaterialChange = (index: number, field: keyof EditableMaterial, value: string | number) => {
    setMaterials((current) =>
      current.map((material, itemIndex) => (itemIndex === index ? { ...material, [field]: value } : material))
    );
  };

  const handleSave = async () => {
    if (!artwork) return;
    setIsSaving(true);
    setStatusMessage("");
    try {
      const saved = await updateArtwork(artwork.id, {
        title: artwork.title,
        description: artwork.description,
        category: artwork.category,
        dimensions: artwork.dimensions ?? "",
        priceAmount: artwork.priceAmount,
        images: artwork.images.map((image) => ({ url: image.url, altText: image.altText })),
        materials,
      });
      setArtwork(saved);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not save artwork.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!artwork) return;
    await deleteArtwork(artwork.id);
    router.push("/dashboard/artist/artworks");
  };

  const handleEvidenceSubmit = async () => {
    if (!artwork) return;
    setStatusMessage("");
    try {
      await submitVerificationEvidence(artwork.id, {
        type: "material_photo",
        url: evidenceUrl,
        label: evidenceLabel,
        notes: evidenceNotes,
      });
      setVerificationRequest(null);
      setEvidenceUrl("");
      setEvidenceLabel("");
      setEvidenceNotes("");
      setStatusMessage("Verification evidence submitted for admin review.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not submit verification evidence.");
    }
  };

  if (!artwork) {
    return (
      <DashboardLayout role="artist" userName={userName}>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {statusMessage || "Loading artwork..."}
        </div>
      </DashboardLayout>
    );
  }

  const totalWeight = materials.reduce((sum, material) => sum + Number(material.weightKg || 0), 0);

  return (
    <DashboardLayout role="artist" userName={userName}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/artist/artworks" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Artwork</h1>
              <p className="text-gray-500">Changes resubmit artist-owned artwork for admin review.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDelete} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-white hover:bg-teal-700 disabled:opacity-50">
              {saveSuccess ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{statusMessage}</div>
        )}

        {artwork.rejectionReason && (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <span>{artwork.rejectionReason}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border border-gray-100 bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">Basic Information</h2>
              <div className="space-y-4">
                <input value={artwork.title} onChange={(event) => handleInputChange("title", event.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <textarea value={artwork.description} onChange={(event) => handleInputChange("description", event.target.value)} rows={5} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <select value={artwork.category} onChange={(event) => handleInputChange("category", event.target.value)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  <input value={artwork.dimensions ?? ""} onChange={(event) => handleInputChange("dimensions", event.target.value)} placeholder="Dimensions" className="rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-100 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                  <Recycle className="h-5 w-5 text-green-600" />
                  Recycled Materials
                </h2>
                <button onClick={() => setMaterials((current) => [...current, { material: "", weightKg: 0, source: "" }])} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50">
                  <Plus className="h-4 w-4" />
                  Add Material
                </button>
              </div>
              <div className="space-y-3">
                {materials.map((material, index) => (
                  <div key={index} className="grid gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-[1fr_120px_1fr_auto]">
                    <select value={material.material} onChange={(event) => handleMaterialChange(index, "material", event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                      <option value="">Select material...</option>
                      {materialTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <input type="number" value={material.weightKg} onChange={(event) => handleMaterialChange(index, "weightKg", Number(event.target.value))} className="rounded-lg border border-gray-200 px-3 py-2" />
                    <input value={material.source} onChange={(event) => handleMaterialChange(index, "source", event.target.value)} placeholder="Source" className="rounded-lg border border-gray-200 px-3 py-2" />
                    <button onClick={() => setMaterials((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-700">
                Total waste diverted: <strong>{totalWeight.toFixed(1)} kg</strong>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            {verificationRequest && (
              <section className="rounded-xl border border-amber-100 bg-white p-6">
                <h2 className="mb-2 font-semibold text-gray-900">Verification Request</h2>
                <p className="text-sm text-amber-700">{verificationRequest.adminNotes}</p>
                <div className="mt-4 space-y-3">
                  <input value={evidenceLabel} onChange={(event) => setEvidenceLabel(event.target.value)} placeholder="Evidence label" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <input value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} placeholder="/placeholder-artwork/material-detail.jpg" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <textarea value={evidenceNotes} onChange={(event) => setEvidenceNotes(event.target.value)} rows={3} placeholder="Notes for admin review" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  <button onClick={handleEvidenceSubmit} className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700">
                    Submit Evidence
                  </button>
                </div>
              </section>
            )}
            <section className="rounded-xl border border-gray-100 bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">Pricing</h2>
              <input type="number" value={artwork.priceAmount} onChange={(event) => handleInputChange("priceAmount", Number(event.target.value))} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <p className="mt-2 text-sm text-gray-500">RWF listing price</p>
            </section>
            {artwork.latestPricingRecommendation && (
              <section className="rounded-xl border border-purple-100 bg-white p-6">
                <h2 className="mb-4 font-semibold text-gray-900">Price Recommendation</h2>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-gray-50 p-2">
                    <p className="text-xs text-gray-500">Min</p>
                    <p className="font-semibold">{artwork.latestPricingRecommendation.min.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-2 text-purple-700">
                    <p className="text-xs">Suggested</p>
                    <p className="font-semibold">{artwork.latestPricingRecommendation.suggested.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2">
                    <p className="text-xs text-gray-500">Max</p>
                    <p className="font-semibold">{artwork.latestPricingRecommendation.max.toLocaleString()}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600">{artwork.latestPricingRecommendation.explanation}</p>
              </section>
            )}
            {artwork.latestImpactEstimate && (
              <section className="rounded-xl border border-green-100 bg-white p-6">
                <h2 className="mb-4 font-semibold text-gray-900">Impact Estimate</h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>{artwork.latestImpactEstimate.kgDiverted.toFixed(1)} kg</strong> diverted</p>
                  <p><strong>{artwork.latestImpactEstimate.co2eAvoidedKg.toFixed(1)} kg</strong> CO2e avoided</p>
                  <p><strong>{artwork.latestImpactEstimate.landfillVolumeAvoidedLitres.toFixed(1)} L</strong> landfill volume avoided</p>
                  <p className="capitalize text-gray-500">Confidence: {artwork.latestImpactEstimate.confidence}</p>
                </div>
              </section>
            )}
            <section className="rounded-xl border border-gray-100 bg-white p-6">
              <h2 className="mb-4 font-semibold text-gray-900">Status</h2>
              <p className="capitalize text-gray-700">{artwork.status.replace("_", " ")}</p>
              <Link href={`/artwork/${artwork.slug}`} target="_blank" className="mt-4 inline-flex text-sm font-medium text-teal-700">
                View public listing
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
