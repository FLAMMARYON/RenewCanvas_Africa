"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  Info,
  Check,
  Recycle,
  Scale,
  Clock,
  ChevronDown,
  Loader2,
  AlertCircle,
  Lightbulb,
  Tag,
  Ruler,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { createArtwork } from "@/lib/frontend/artworks-api";
import { readProfile } from "@/lib/frontend/profile-api";
import { getListingSuggestions, type ListingAssistantRequest, type ListingAssistantResponse } from "@/lib/frontend/listing-assistant-api";
import { uploadArtworkImage, type UploadResult } from "@/lib/frontend/upload-api";
import { artworkCategories, recyclableMaterials } from "@/lib/ml/schemas";
import {
  composeDimensions,
  dimensionFieldsForCategory,
  parseDimensions,
  type DimensionFieldKey,
  type DimensionValues,
} from "@/lib/frontend/dimension-fields";

// Use centralized schemas instead of hardcoded arrays
const categories = [...artworkCategories];
const materialTypes = [...recyclableMaterials];

// Code values are stored / sent to the API; display labels are translated at
// the usage site via t("artistDashboard.create.materialSource.<key>").
const materialSources: Array<{ value: string; labelKey: string }> = [
  { value: "Self-collected", labelKey: "materialSourceSelfCollected" },
  { value: "RenewCanvas partner", labelKey: "materialSourcePartner" },
  { value: "School collection", labelKey: "materialSourceSchool" },
  { value: "Community cleanup", labelKey: "materialSourceCleanup" },
  { value: "Business donation", labelKey: "materialSourceBusiness" },
  { value: "Other", labelKey: "materialSourceOther" },
];

const experienceLevels: Array<{ id: string; labelKey: string; descriptionKey: string }> = [
  { id: "emerging", labelKey: "experienceEmergingLabel", descriptionKey: "experienceEmergingDescription" },
  { id: "intermediate", labelKey: "experienceIntermediateLabel", descriptionKey: "experienceIntermediateDescription" },
  { id: "professional", labelKey: "experienceProfessionalLabel", descriptionKey: "experienceProfessionalDescription" },
];

const complexityLevels: Array<{ id: string; labelKey: string; hoursKey: string }> = [
  { id: "simple", labelKey: "complexitySimpleLabel", hoursKey: "complexitySimpleHours" },
  { id: "moderate", labelKey: "complexityModerateLabel", hoursKey: "complexityModerateHours" },
  { id: "complex", labelKey: "complexityComplexLabel", hoursKey: "complexityComplexHours" },
  { id: "very_complex", labelKey: "complexityVeryComplexLabel", hoursKey: "complexityVeryComplexHours" },
];

// Per-complexity hour ceilings. Hours above the cap are rejected (e.g. Simple
// caps at 5, so 6+ hours is invalid for a "Simple" piece).
const complexityHourCaps: Record<string, number> = {
  simple: 5,
  moderate: 15,
  complex: 30,
  very_complex: 500,
};

// ---- AI listing-assistant draft cache (item 3) ----------------------------
// The assistant is only ever called on an explicit "Suggest" click (never on
// page load), and the result is cached per-input in localStorage so reopening
// the draft with the same details reuses the answer instead of re-billing the
// API. Keyed on the fields that actually shape the suggestion.
const LISTING_CACHE_PREFIX = "renewcanvas:listing-assistant:";

function listingCacheKey(input: ListingAssistantRequest): string {
  const normalized = {
    title: input.title.trim().toLowerCase(),
    description: input.description.trim().toLowerCase(),
    materials: [...input.materials].map((m) => m.toLowerCase()).sort().join("|"),
    category: (input.category ?? "").toLowerCase(),
    dimensions: (input.dimensions ?? "").toLowerCase(),
    price: input.price,
  };
  return LISTING_CACHE_PREFIX + JSON.stringify(normalized);
}

function readListingCache(key: string): ListingAssistantResponse | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ListingAssistantResponse) : null;
  } catch {
    return null;
  }
}

function writeListingCache(key: string, value: ListingAssistantResponse): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private-mode errors — caching is best-effort */
  }
}

export default function CreateArtworkPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<Array<{
    file?: File;
    preview: string;
    uploaded?: UploadResult;
    uploading?: boolean;
    error?: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);
  const [aiPriceSuggestion, setAiPriceSuggestion] = useState<{
    min: number;
    max: number;
    suggested: number;
    explanation: string;
  } | null>(null);
  const [aiListingSuggestions, setAiListingSuggestions] = useState<ListingAssistantResponse | null>(null);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [userName, setUserName] = useState(t("artistDashboard.create.defaultUserName"));
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    dimensions: "",
    materialWeight: "",
    materialSource: "",
    complexity: "",
    experienceLevel: "",
    price: "",
    hoursWorked: "",
    notes: "",
  });
  // Structured dimension inputs. Which fields show depends on the selected
  // category (see lib/frontend/dimension-fields). They compose into the single
  // `formData.dimensions` string the rest of the app already uses.
  const [dimensionParts, setDimensionParts] = useState<DimensionValues>({});
  const dimensionFields = dimensionFieldsForCategory(formData.category);

  const handleDimensionPartChange = (key: DimensionFieldKey, value: string) => {
    const nextParts = { ...dimensionParts, [key]: value };
    setDimensionParts(nextParts);
    setFormData((current) => ({ ...current, dimensions: composeDimensions(current.category, nextParts) }));
  };

  const handleCategoryChange = (value: string) => {
    // Reformat the dimensions string for the new category's field set, but only
    // when structured parts exist — don't wipe an AI-applied dimension string.
    const hasParts = Object.values(dimensionParts).some((part) => part && part.trim());
    setFormData((current) => ({
      ...current,
      category: value,
      dimensions: hasParts ? composeDimensions(value, dimensionParts) : current.dimensions,
    }));
  };

  // Toast lives ~4s, then clears itself.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  // Load user profile on mount
  useEffect(() => {
    readProfile()
      .then((profile) => {
        setUserName(profile.displayName || t("artistDashboard.create.defaultUserName"));
      })
      .catch(() => {
        // User not logged in or profile fetch failed
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMaterial = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  // ---- Per-step validation (returns the list of unfilled fields) ----
  const hasUploadedImage = images.some((img) => img.uploaded);

  const hoursCap = formData.complexity ? complexityHourCaps[formData.complexity] : undefined;
  const complexityLabel = formData.complexity
    ? t(`artistDashboard.create.${complexityLevels.find((c) => c.id === formData.complexity)?.labelKey ?? "complexityThisFallback"}`)
    : t("artistDashboard.create.complexityThisFallback");
  const hoursError =
    formData.hoursWorked && hoursCap && Number(formData.hoursWorked) > hoursCap
      ? t("artistDashboard.create.hoursCapError", { complexity: complexityLabel, cap: hoursCap })
      : "";

  const missingStep1 = () => {
    const missing: string[] = [];
    if (!hasUploadedImage) missing.push(t("artistDashboard.create.missingUploadedImage"));
    if (!formData.title.trim()) missing.push(t("artistDashboard.create.missingTitle"));
    if (!formData.description.trim()) missing.push(t("artistDashboard.create.missingDescription"));
    if (!formData.category) missing.push(t("artistDashboard.create.missingCategory"));
    if (!formData.dimensions.trim()) missing.push(t("artistDashboard.create.missingDimensions"));
    return missing;
  };

  const missingStep2 = () => {
    const missing: string[] = [];
    if (selectedMaterials.length === 0) missing.push(t("artistDashboard.create.missingMaterial"));
    if (!formData.materialWeight || Number(formData.materialWeight) <= 0) missing.push(t("artistDashboard.create.missingMaterialWeight"));
    if (!formData.materialSource) missing.push(t("artistDashboard.create.missingMaterialSource"));
    return missing;
  };

  const missingStep3 = () => {
    const missing: string[] = [];
    if (!formData.experienceLevel) missing.push(t("artistDashboard.create.missingExperienceLevel"));
    if (!formData.complexity) missing.push(t("artistDashboard.create.missingComplexity"));
    if (!formData.price || Number(formData.price) <= 0) missing.push(t("artistDashboard.create.missingPrice"));
    return missing;
  };

  // AI listing agent needs image + title + dimensions + description + category together.
  const listingMissing = () => {
    const missing: string[] = [];
    if (!hasUploadedImage) missing.push(t("artistDashboard.create.missingAnImage"));
    if (!formData.title.trim()) missing.push(t("artistDashboard.create.missingTitle"));
    if (!formData.dimensions.trim()) missing.push(t("artistDashboard.create.missingDimensions"));
    if (!formData.description.trim()) missing.push(t("artistDashboard.create.missingDescription"));
    if (!formData.category) missing.push(t("artistDashboard.create.missingCategory"));
    return missing;
  };
  const listingReady = listingMissing().length === 0;

  const goToStep2 = () => {
    const missing = missingStep1();
    if (missing.length > 0) {
      showToast(t("artistDashboard.create.completeToContinue", { fields: missing.join(", ") }));
      return;
    }
    setStep(2);
  };

  const goToStep3 = () => {
    const missing = missingStep2();
    if (missing.length > 0) {
      showToast(t("artistDashboard.create.completeToContinue", { fields: missing.join(", ") }));
      return;
    }
    setStep(3);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).slice(0, 5 - images.length);

    // Add files with preview URLs
    const newImages = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    const startIndex = images.length;
    setImages((prev) => [...prev, ...newImages].slice(0, 5));
    setIsUploading(true);

    // Upload files sequentially
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const imageIndex = startIndex + i;

      try {
        const result = await uploadArtworkImage(file);
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === imageIndex
              ? { ...img, uploaded: result, uploading: false }
              : img
          )
        );
      } catch (error) {
        console.error("Artwork image upload failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : t("artistDashboard.create.uploadFailed");
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === imageIndex
              ? {
                  ...img,
                  uploading: false,
                  error: errorMessage,
                }
              : img
          )
        );
      }
    }

    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    if (imageToRemove.preview.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const getAiPriceSuggestion = async () => {
    const missing = missingStep3();
    // The price itself isn't required to ask for a suggestion, but the factors are.
    const factorsMissing = missing.filter((m) => m !== "price");
    if (factorsMissing.length > 0 || selectedMaterials.length === 0 || !formData.materialWeight) {
      showToast(t("artistDashboard.create.pricingFactorsRequired"));
      return;
    }
    if (hoursError) {
      showToast(hoursError);
      return;
    }

    setIsLoadingPrice(true);
    setFormError("");

    try {
      const hoursWorked = formData.hoursWorked ? Number(formData.hoursWorked) : undefined;

      const response = await fetch("/api/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          materials: selectedMaterials,
          materialWeight: Number(formData.materialWeight),
          dimensions: formData.dimensions || undefined,
          complexity: formData.complexity,
          experienceLevel: formData.experienceLevel,
          hoursWorked,
          previousArtistSales: [],
          views: 0,
          wishlistCount: 0,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        showToast(t("artistDashboard.create.pricingFieldsRequired"));
        return;
      }

      // NOTE: We intentionally do NOT set formData.price here. The price field
      // stays empty until the artist clicks "Use Suggested Price".
      setAiPriceSuggestion(body);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const getAiListingSuggestions = async () => {
    const missing = listingMissing();
    if (missing.length > 0) {
      showToast(t("artistDashboard.create.listingAssistantNeeds", { fields: missing.join(", ") }));
      return;
    }

    const requestInput: ListingAssistantRequest = {
      title: formData.title,
      description: formData.description,
      materials: selectedMaterials.length > 0 ? selectedMaterials : ["Recycled materials"],
      price: Number(formData.price) || 25000,
      category: formData.category || undefined,
      dimensions: formData.dimensions || undefined,
    };

    // Reuse a cached suggestion for identical inputs — no API call, no re-bill.
    const cacheKey = listingCacheKey(requestInput);
    const cached = readListingCache(cacheKey);
    if (cached) {
      setAiListingSuggestions(cached);
      showToast(t("artistDashboard.create.aiSuggestionsCached", { defaultValue: "Loaded saved AI suggestions for this draft." }));
      return;
    }

    setIsLoadingAiSuggestions(true);
    setFormError("");

    try {
      const result = await getListingSuggestions(requestInput);
      setAiListingSuggestions(result);
      writeListingCache(cacheKey, result);
    } catch (error) {
      showToast(error instanceof Error ? error.message : t("artistDashboard.create.aiSuggestionsError"));
    } finally {
      setIsLoadingAiSuggestions(false);
    }
  };

  const applyImprovedDescription = () => {
    if (aiListingSuggestions?.improvedDescription) {
      setFormData((current) => ({
        ...current,
        description: aiListingSuggestions.improvedDescription,
      }));
    }
  };

  const applyTitleSuggestion = () => {
    if (aiListingSuggestions?.titleSuggestion) {
      setFormData((current) => ({
        ...current,
        title: aiListingSuggestions.titleSuggestion!,
      }));
    }
  };

  const applyDimensionSuggestion = (value: string) => {
    // Parse the suggestion back into structured parts so the inputs populate,
    // then recompose for a consistent stored string.
    const nextParts = parseDimensions(formData.category, value);
    setDimensionParts(nextParts);
    setFormData((current) => ({ ...current, dimensions: composeDimensions(current.category, nextParts) }));
    showToast(t("artistDashboard.create.dimensionsUpdated"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Final submit must require every field across all three steps.
    const missing = [...missingStep1(), ...missingStep2(), ...missingStep3()];
    if (missing.length > 0) {
      showToast(t("artistDashboard.create.completeBeforeSubmit", { fields: Array.from(new Set(missing)).join(", ") }));
      return;
    }
    if (hoursError) {
      showToast(hoursError);
      return;
    }

    // Check all images are uploaded
    const pendingUploads = images.filter((img) => img.uploading);
    if (pendingUploads.length > 0) {
      showToast(t("artistDashboard.create.waitForUploads"));
      return;
    }

    const uploadedImages = images
      .filter((img) => img.uploaded)
      .map((img, index) => ({
        url: img.uploaded!.publicUrl,
        altText: t("artistDashboard.create.imageAltText", { title: formData.title, index: index + 1 }),
      }));

    if (uploadedImages.length === 0) {
      showToast(t("artistDashboard.create.uploadAtLeastOne"));
      return;
    }

    try {
      const hoursWorked = formData.hoursWorked ? Number(formData.hoursWorked) : undefined;

      await createArtwork({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        dimensions: formData.dimensions,
        priceAmount: Number(formData.price),
        images: uploadedImages,
        materials: selectedMaterials.map((material) => ({
          material,
          weightKg: Number(formData.materialWeight) / selectedMaterials.length,
          source: formData.materialSource,
        })),
        complexity: formData.complexity,
        experienceLevel: formData.experienceLevel,
        hoursWorked,
      });
      router.push("/dashboard/artist/artworks");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("artistDashboard.create.submitError");
      setFormError(message);
      showToast(message);
    }
  };

  return (
    <DashboardLayout role="artist" userName={userName}>
      {/* Validation / status toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-50 max-w-sm">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3 shadow-lg">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <p className="text-sm text-gray-800">{toast}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
              aria-label={t("artistDashboard.create.dismissNotification")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/artist/artworks"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("artistDashboard.create.backToArtworks")}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("artistDashboard.create.pageTitle")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("artistDashboard.create.pageSubtitle")}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {[
              { num: 1, label: t("artistDashboard.create.stepBasicInfo") },
              { num: 2, label: t("artistDashboard.create.stepMaterials") },
              { num: 3, label: t("artistDashboard.create.stepPricing") },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <button
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-2 ${
                    step >= s.num ? "text-teal-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                      step > s.num
                        ? "bg-teal-600 text-white"
                        : step === s.num
                        ? "bg-teal-100 text-teal-600 border-2 border-teal-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="hidden sm:inline font-medium">
                    {s.label}
                  </span>
                </button>
                {i < 2 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step > s.num ? "bg-teal-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="mb-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Image Upload */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  {t("artistDashboard.create.artworkImagesHeading")}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {t("artistDashboard.create.artworkImagesHint")}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                        title={image.error}
                      >
                        <img
                          src={image.preview}
                          alt={t("artistDashboard.create.artworkImageAlt", { index: index + 1 })}
                          className="w-full h-full object-cover"
                        />
                        {image.uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                        {image.error && (
                          <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-white" />
                          </div>
                        )}
                        {image.uploaded && (
                          <div className="absolute top-2 left-2">
                            <Check className="w-5 h-5 text-green-500 bg-white rounded-full p-0.5" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={t("artistDashboard.create.removeImageAria", { index: index + 1 })}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-teal-600 text-white text-xs rounded">
                            {t("artistDashboard.create.mainImageBadge")}
                          </span>
                        )}
                      </div>
                      {image.error && (
                        <p className="text-xs leading-snug text-red-600">
                          {image.error}
                        </p>
                      )}
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className={`aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 text-gray-400 mb-2 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      )}
                      <span className="text-xs text-gray-500">{isUploading ? t("artistDashboard.create.uploading") : t("artistDashboard.create.addPhoto")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  {t("artistDashboard.create.basicDetailsHeading")}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("artistDashboard.create.titleLabel")}
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder={t("artistDashboard.create.titlePlaceholder")}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("artistDashboard.create.descriptionLabel")}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder={t("artistDashboard.create.descriptionPlaceholder")}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("artistDashboard.create.categoryLabel")}
                      </label>
                      <div className="relative">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none bg-white"
                          required
                        >
                          <option value="">{t("artistDashboard.create.selectCategory")}</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Dimensions — the inputs shown depend on the selected category
                      (2D: W×H, 3D: W×H×D, jewelry: a single size/length). Driven
                      by the extensible config in lib/frontend/dimension-fields. */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("artistDashboard.create.dimensionsLabel")}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {dimensionFields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            {t(`artistDashboard.create.${field.labelKey}`, { defaultValue: field.defaultLabel })}
                          </label>
                          <input
                            type={field.type}
                            inputMode={field.type === "number" ? "decimal" : undefined}
                            min={field.type === "number" ? "0" : undefined}
                            step={field.type === "number" ? "0.1" : undefined}
                            value={dimensionParts[field.key] ?? ""}
                            onChange={(e) => handleDimensionPartChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    {formData.dimensions && (
                      <p className="mt-2 text-xs text-gray-500">
                        {t("artistDashboard.create.dimensionsPreview", { defaultValue: "Saved as: {{value}}", value: formData.dimensions })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Listing Assistant Card — placed BELOW the form (item 6) */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {t("artistDashboard.create.listingAssistantHeading")}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {t("artistDashboard.create.listingAssistantSubtitle")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={getAiListingSuggestions}
                  disabled={isLoadingAiSuggestions || !listingReady}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingAiSuggestions ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("artistDashboard.create.gettingAiSuggestions")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {t("artistDashboard.create.getAiSuggestions")}
                    </>
                  )}
                </button>
                {!listingReady && (
                  <p className="mt-2 text-xs text-blue-700">
                    {t("artistDashboard.create.stillNeeded", { fields: listingMissing().join(", ") })}
                  </p>
                )}

                {/* AI Suggestions Results */}
                {aiListingSuggestions && (
                  <div className="mt-6 space-y-4">
                    {/* Title Suggestion */}
                    {aiListingSuggestions.titleSuggestion && (
                      <div className="p-4 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-600" />
                            {t("artistDashboard.create.suggestedTitle")}
                          </span>
                          <button
                            type="button"
                            onClick={applyTitleSuggestion}
                            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                          >
                            {t("artistDashboard.create.useThis")}
                          </button>
                        </div>
                        <p className="text-gray-900 font-medium">{aiListingSuggestions.titleSuggestion}</p>
                      </div>
                    )}

                    {/* Improved Description */}
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          {t("artistDashboard.create.improvedDescription")}
                        </span>
                        <button
                          type="button"
                          onClick={applyImprovedDescription}
                          className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        >
                          {t("artistDashboard.create.useThis")}
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {aiListingSuggestions.improvedDescription.slice(0, 500)}
                        {aiListingSuggestions.improvedDescription.length > 500 && "..."}
                      </p>
                    </div>

                    {/* Dimension Suggestions — 2D + 3D options (item 7) */}
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                        <Ruler className="w-4 h-4 text-blue-600" />
                        {t("artistDashboard.create.suggestedDimensions")}
                      </span>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="rounded-lg border border-gray-200 p-3">
                          <p className="text-xs font-medium text-gray-500">{t("artistDashboard.create.dimension2dLabel")}</p>
                          <p className="mt-1 font-medium text-gray-900">{aiListingSuggestions.dimensionSuggestions.twoD}</p>
                          <button
                            type="button"
                            onClick={() => applyDimensionSuggestion(aiListingSuggestions.dimensionSuggestions.twoD)}
                            className="mt-2 w-full rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200"
                          >
                            {t("artistDashboard.create.use2d")}
                          </button>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-3">
                          <p className="text-xs font-medium text-gray-500">{t("artistDashboard.create.dimension3dLabel")}</p>
                          <p className="mt-1 font-medium text-gray-900">{aiListingSuggestions.dimensionSuggestions.threeD}</p>
                          <button
                            type="button"
                            onClick={() => applyDimensionSuggestion(aiListingSuggestions.dimensionSuggestions.threeD)}
                            className="mt-2 w-full rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200"
                          >
                            {t("artistDashboard.create.use3d")}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Suggested Tags */}
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        {t("artistDashboard.create.suggestedTags")}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {aiListingSuggestions.suggestedTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Marketing Tips */}
                    {aiListingSuggestions.marketingTips.length > 0 && (
                      <div className="p-4 bg-white rounded-lg border border-blue-200">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-blue-600" />
                          {t("artistDashboard.create.marketingTips")}
                        </span>
                        <ul className="space-y-2">
                          {aiListingSuggestions.marketingTips.map((tip, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      {t("artistDashboard.create.pricingOnPricingStep")}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={goToStep2}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  {t("artistDashboard.create.continueToMaterials")}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Materials */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-2">
                  {t("artistDashboard.create.recycledMaterialsHeading")}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {t("artistDashboard.create.recycledMaterialsHint")}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {materialTypes.map((material) => (
                    <button
                      key={material}
                      type="button"
                      onClick={() => toggleMaterial(material)}
                      className={`p-3 rounded-lg border text-left text-sm transition-all ${
                        selectedMaterials.includes(material)
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            selectedMaterials.includes(material)
                              ? "bg-teal-600 border-teal-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedMaterials.includes(material) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        {material}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  {t("artistDashboard.create.materialDetailsHeading")}
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("artistDashboard.create.estimatedWeightLabel")}
                    </label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="materialWeight"
                        value={formData.materialWeight}
                        onChange={handleChange}
                        placeholder={t("artistDashboard.create.weightPlaceholder")}
                        step="0.1"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("artistDashboard.create.weightHint")}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("artistDashboard.create.materialSourceLabel")}
                    </label>
                    <div className="relative">
                      <select
                        name="materialSource"
                        value={formData.materialSource}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none bg-white"
                        required
                      >
                        <option value="">{t("artistDashboard.create.selectSource")}</option>
                        {materialSources.map((source) => (
                          <option key={source.value} value={source.value}>
                            {t(`artistDashboard.create.${source.labelKey}`)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-green-700">
                    <Recycle className="w-5 h-5" />
                    <span className="font-medium">
                      {t("artistDashboard.create.wasteDiverted", { weight: formData.materialWeight || "0" })}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {t("artistDashboard.create.wasteDivertedHint")}
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {t("artistDashboard.create.back")}
                </button>
                <button
                  type="button"
                  onClick={goToStep3}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  {t("artistDashboard.create.continueToPricing")}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {step === 3 && (
            <div className="space-y-6">
              {/* AI Pricing Assistant */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {t("artistDashboard.create.pricingAssistantHeading")}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {t("artistDashboard.create.pricingAssistantSubtitle")}
                    </p>
                  </div>
                </div>

                {/* Pricing Factors */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("artistDashboard.create.experienceLevelLabel")}
                    </label>
                    <div className="space-y-2">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              experienceLevel: level.id,
                            })
                          }
                          className={`w-full p-3 rounded-lg border text-left transition-all ${
                            formData.experienceLevel === level.id
                              ? "border-purple-500 bg-white"
                              : "border-gray-200 bg-white/50 hover:border-gray-300"
                          }`}
                        >
                          <p className="font-medium text-gray-900 text-sm">
                            {t(`artistDashboard.create.${level.labelKey}`)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t(`artistDashboard.create.${level.descriptionKey}`)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("artistDashboard.create.complexityLabel")}
                    </label>
                    <div className="space-y-2">
                      {complexityLevels.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, complexity: level.id })
                          }
                          className={`w-full p-3 rounded-lg border text-left transition-all ${
                            formData.complexity === level.id
                              ? "border-purple-500 bg-white"
                              : "border-gray-200 bg-white/50 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 text-sm">
                              {t(`artistDashboard.create.${level.labelKey}`)}
                            </p>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {t(`artistDashboard.create.${level.hoursKey}`)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hours Worked */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("artistDashboard.create.hoursWorkedLabel")}
                  </label>
                  <div className="relative max-w-xs">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="hoursWorked"
                      value={formData.hoursWorked}
                      onChange={handleChange}
                      placeholder={t("artistDashboard.create.hoursPlaceholder")}
                      min="0"
                      max="500"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 ${
                        hoursError
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                      }`}
                    />
                  </div>
                  {hoursError ? (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {hoursError}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.complexity
                        ? t("artistDashboard.create.hoursCappedHint", { cap: hoursCap, complexity: complexityLabel })
                        : t("artistDashboard.create.hoursFairLaborHint")}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={getAiPriceSuggestion}
                  disabled={isLoadingPrice}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoadingPrice ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("artistDashboard.create.analyzing")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {t("artistDashboard.create.getAiPriceSuggestion")}
                    </>
                  )}
                </button>

                {/* AI Suggestion Result */}
                {aiPriceSuggestion && (
                  <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-900">
                        {t("artistDashboard.create.priceSuggestionTitle")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex-1 text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">{t("artistDashboard.create.priceMin")}</p>
                        <p className="font-semibold text-gray-700">
                          {aiPriceSuggestion.min.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-1 text-center p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                        <p className="text-xs text-purple-600">{t("artistDashboard.create.priceSuggested")}</p>
                        <p className="font-bold text-purple-700 text-lg">
                          {aiPriceSuggestion.suggested.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-1 text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">{t("artistDashboard.create.priceMax")}</p>
                        <p className="font-semibold text-gray-700">
                          {aiPriceSuggestion.max.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {aiPriceSuggestion.explanation}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((current) => ({
                          ...current,
                          price: aiPriceSuggestion.suggested.toString(),
                        }))
                      }
                      className="mt-3 w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      {t("artistDashboard.create.useSuggestedPrice")}
                    </button>
                  </div>
                )}
              </div>

              {/* Final Price */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  {t("artistDashboard.create.setYourPriceHeading")}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {t("artistDashboard.create.setYourPriceHint")}
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("artistDashboard.create.priceLabel")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      RWF
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder={t("artistDashboard.create.pricePlaceholder")}
                      min="0"
                      step="1000"
                      className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-lg font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">{t("artistDashboard.create.artistEarningsTitle")}</p>
                      <p>
                        {t("artistDashboard.create.artistEarningsBody")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  {t("artistDashboard.create.additionalNotesHeading")}{" "}
                  <span className="text-gray-400 font-normal">{t("artistDashboard.create.optionalSuffix")}</span>
                </h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t("artistDashboard.create.notesPlaceholder")}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {t("artistDashboard.create.back")}
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  {t("artistDashboard.create.submitForReview")}
                </button>
              </div>

              {/* Submission Note */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">{t("artistDashboard.create.reviewProcessTitle")}</p>
                    <p>
                      {t("artistDashboard.create.reviewProcessBody")}
                    </p>
                    <p className="mt-2">
                      {t("artistDashboard.create.submissionTermsPrefix")}{" "}
                      <a href="/terms" className="underline">{t("artistDashboard.create.termsLink")}</a>{" "}
                      {t("artistDashboard.create.andWord")}{" "}
                      <a href="/privacy" className="underline">{t("artistDashboard.create.privacyLink")}</a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
