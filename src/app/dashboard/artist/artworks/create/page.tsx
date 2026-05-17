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
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createArtwork } from "@/lib/frontend/artworks-api";
import { readProfile } from "@/lib/frontend/profile-api";
import { getListingSuggestions, type ListingAssistantResponse } from "@/lib/frontend/listing-assistant-api";
import { uploadArtworkImage, type UploadResult } from "@/lib/frontend/upload-api";
import { artworkCategories, recyclableMaterials } from "@/lib/ml/schemas";

// Use centralized schemas instead of hardcoded arrays
const categories = [...artworkCategories];
const materialTypes = [...recyclableMaterials];

const materialSources = [
  "Self-collected",
  "RenewCanvas partner",
  "School collection",
  "Community cleanup",
  "Business donation",
  "Other",
];

const experienceLevels = [
  { id: "emerging", label: "Emerging Artist", description: "Less than 2 years" },
  { id: "intermediate", label: "Intermediate", description: "2-5 years experience" },
  { id: "professional", label: "Professional", description: "5+ years experience" },
];

const complexityLevels = [
  { id: "simple", label: "Simple", hours: "1-5 hours" },
  { id: "moderate", label: "Moderate", hours: "5-15 hours" },
  { id: "complex", label: "Complex", hours: "15-30 hours" },
  { id: "very_complex", label: "Very Complex", hours: "30+ hours" },
];

export default function CreateArtworkPage() {
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
  const [userName, setUserName] = useState("Artist");
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

  // Load user profile on mount
  useEffect(() => {
    readProfile()
      .then((profile) => {
        setUserName(profile.displayName || "Artist");
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
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === imageIndex
              ? {
                  ...img,
                  uploading: false,
                  error: error instanceof Error ? error.message : "Upload failed",
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
        setFormError("Complete category, materials, weight, complexity, and experience before requesting a price.");
        return;
      }

      setAiPriceSuggestion(body);
      setFormData((current) => ({
        ...current,
        price: String(body.suggested),
      }));
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const getAiListingSuggestions = async () => {
    if (!formData.title && !formData.description && selectedMaterials.length === 0) {
      setFormError("Enter at least a title, description, or select materials to get AI suggestions.");
      return;
    }

    setIsLoadingAiSuggestions(true);
    setFormError("");

    try {
      const result = await getListingSuggestions({
        title: formData.title || "Untitled Artwork",
        description: formData.description || "",
        materials: selectedMaterials.length > 0 ? selectedMaterials : ["Recycled materials"],
        price: Number(formData.price) || 25000,
        category: formData.category || undefined,
        dimensions: formData.dimensions || undefined,
      });

      setAiListingSuggestions(result);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not get AI suggestions. Please try again.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title || !formData.category || selectedMaterials.length === 0 || !formData.price) {
      setFormError("Complete the required artwork details before submitting.");
      return;
    }

    // Check all images are uploaded
    const pendingUploads = images.filter((img) => img.uploading);
    if (pendingUploads.length > 0) {
      setFormError("Please wait for all images to finish uploading.");
      return;
    }

    const uploadedImages = images
      .filter((img) => img.uploaded)
      .map((img, index) => ({
        url: img.uploaded!.publicUrl,
        altText: `${formData.title} image ${index + 1}`,
      }));

    if (uploadedImages.length === 0) {
      setFormError("Please upload at least one image of your artwork.");
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
      setFormError(error instanceof Error ? error.message : "Could not submit artwork.");
    }
  };

  return (
    <DashboardLayout role="artist" userName={userName}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/artist/artworks"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Artworks
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Artwork
          </h1>
          <p className="text-gray-500 mt-1">
            List your upcycled artwork on the marketplace
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {[
              { num: 1, label: "Basic Info" },
              { num: 2, label: "Materials" },
              { num: 3, label: "Pricing" },
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
              {/* AI Listing Assistant Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      AI Listing Assistant
                    </h2>
                    <p className="text-sm text-gray-500">
                      Get AI-powered suggestions to improve your listing
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={getAiListingSuggestions}
                  disabled={isLoadingAiSuggestions}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoadingAiSuggestions ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Getting AI Suggestions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Get AI Suggestions
                    </>
                  )}
                </button>

                {/* AI Suggestions Results */}
                {aiListingSuggestions && (
                  <div className="mt-6 space-y-4">
                    {/* Title Suggestion */}
                    {aiListingSuggestions.titleSuggestion && (
                      <div className="p-4 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-600" />
                            Suggested Title
                          </span>
                          <button
                            type="button"
                            onClick={applyTitleSuggestion}
                            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                          >
                            Use This
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
                          Improved Description
                        </span>
                        <button
                          type="button"
                          onClick={applyImprovedDescription}
                          className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        >
                          Use This
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {aiListingSuggestions.improvedDescription.slice(0, 500)}
                        {aiListingSuggestions.improvedDescription.length > 500 && "..."}
                      </p>
                    </div>

                    {/* Suggested Tags */}
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        Suggested Tags
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

                    {/* Price Range Suggestion */}
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        AI Price Suggestion
                      </span>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Min</p>
                          <p className="font-semibold text-gray-700">
                            {aiListingSuggestions.priceRange.min.toLocaleString()} RWF
                          </p>
                        </div>
                        <div className="flex-1 text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-600">Suggested Range</p>
                          <p className="font-bold text-blue-700">
                            {aiListingSuggestions.priceRange.min.toLocaleString()} - {aiListingSuggestions.priceRange.max.toLocaleString()} RWF
                          </p>
                        </div>
                        <div className="flex-1 text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Max</p>
                          <p className="font-semibold text-gray-700">
                            {aiListingSuggestions.priceRange.max.toLocaleString()} RWF
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{aiListingSuggestions.priceRange.reasoning}</p>
                    </div>

                    {/* Marketing Tips */}
                    {aiListingSuggestions.marketingTips.length > 0 && (
                      <div className="p-4 bg-white rounded-lg border border-blue-200">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-blue-600" />
                          Marketing Tips
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
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Artwork Images
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Upload up to 5 high-quality photos of your artwork. The first
                  image will be the main display image.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                    >
                      <img
                        src={image.preview}
                        alt={`Artwork ${index + 1}`}
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
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-teal-600 text-white text-xs rounded">
                          Main
                        </span>
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
                      <span className="text-xs text-gray-500">{isUploading ? "Uploading..." : "Add Photo"}</span>
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
                  Basic Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Artwork Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Ocean Waves"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your artwork, inspiration, and the story behind it..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <div className="relative">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none bg-white"
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleChange}
                        placeholder="e.g., 60cm x 80cm"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Continue to Materials
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Materials */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-2">
                  Recycled Materials Used
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Select all materials used in this artwork. This helps track
                  environmental impact.
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
                  Material Details
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Weight (kg) *
                    </label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="materialWeight"
                        value={formData.materialWeight}
                        onChange={handleChange}
                        placeholder="e.g., 2.5"
                        step="0.1"
                        min="0"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Total weight of recycled materials used
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material Source *
                    </label>
                    <div className="relative">
                      <select
                        name="materialSource"
                        value={formData.materialSource}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none bg-white"
                        required
                      >
                        <option value="">Select source</option>
                        {materialSources.map((source) => (
                          <option key={source} value={source}>
                            {source}
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
                      {formData.materialWeight || "0"} kg of waste will be
                      diverted
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    This contributes to measurable environmental impact
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Continue to Pricing
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {step === 3 && (
            <div className="space-y-6">
              {/* AI Pricing Assistant */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      AI Pricing Assistant
                    </h2>
                    <p className="text-sm text-gray-500">
                      Get a suggested price range based on your artwork details
                    </p>
                  </div>
                </div>

                {/* Pricing Factors */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Experience Level
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
                            {level.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {level.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Artwork Complexity
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
                              {level.label}
                            </p>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {level.hours}
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
                    Hours Worked (Optional)
                  </label>
                  <div className="relative max-w-xs">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="hoursWorked"
                      value={formData.hoursWorked}
                      onChange={handleChange}
                      placeholder="e.g., 12"
                      min="0"
                      max="500"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Helps calculate fair labor compensation
                  </p>
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
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Get AI Price Suggestion
                    </>
                  )}
                </button>

                {/* AI Suggestion Result */}
                {aiPriceSuggestion && (
                  <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-900">
                        Price Suggestion
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex-1 text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Min</p>
                        <p className="font-semibold text-gray-700">
                          {aiPriceSuggestion.min.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-1 text-center p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                        <p className="text-xs text-purple-600">Suggested</p>
                        <p className="font-bold text-purple-700 text-lg">
                          {aiPriceSuggestion.suggested.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-1 text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Max</p>
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
                        setFormData({
                          ...formData,
                          price: aiPriceSuggestion.suggested.toString(),
                        })
                      }
                      className="mt-3 w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      Use Suggested Price
                    </button>
                  </div>
                )}
              </div>

              {/* Final Price */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Set Your Price
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  You have final control over the price. The AI suggestion is
                  just a recommendation.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (RWF) *
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
                      placeholder="e.g., 35000"
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
                      <p className="font-medium">Artist Earnings</p>
                      <p>
                        You will receive 75-80% of the sale price. The remaining
                        percentage covers platform fees, payment processing, and
                        operations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Additional Notes{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special care instructions, framing details, or additional information for buyers..."
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
                  Back
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Submit for Review
                </button>
              </div>

              {/* Submission Note */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">Review Process</p>
                    <p>
                      Your artwork will be reviewed by our team before appearing
                      on the marketplace. This typically takes 1-2 business
                      days.
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
