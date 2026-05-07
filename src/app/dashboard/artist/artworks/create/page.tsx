"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Sparkles,
  Info,
  Check,
  Recycle,
  Scale,
  Clock,
  Palette,
  ChevronDown,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createArtwork } from "@/lib/frontend/artworks-api";

const categories = [
  "Wall Art",
  "Sculpture",
  "Home Decor",
  "Jewelry",
  "Functional Art",
  "Mixed Media",
  "Installation",
  "Other",
];

const materialTypes = [
  "PET bottles",
  "Bottle caps",
  "Cardboard",
  "Paper",
  "Fabric scraps",
  "Aluminium cans",
  "Glass",
  "Electronic waste",
  "Burlap/grain sacks",
  "Plastic bags",
  "Metal scraps",
  "Other",
];

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
  const [images, setImages] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [aiPriceSuggestion, setAiPriceSuggestion] = useState<{
    min: number;
    max: number;
    suggested: number;
    explanation: string;
  } | null>(null);
  const [formError, setFormError] = useState("");
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
    notes: "",
  });

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => `/placeholder-artwork/${file.name}`);
      setImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const getAiPriceSuggestion = async () => {
    setIsLoadingPrice(true);
    setFormError("");

    try {
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
          hoursWorked: 8,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title || !formData.category || selectedMaterials.length === 0 || !formData.price) {
      setFormError("Complete the required artwork details before submitting.");
      return;
    }

    try {
      await createArtwork({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        dimensions: formData.dimensions,
        priceAmount: Number(formData.price),
        images: images.map((url, index) => ({ url, altText: `${formData.title} image ${index + 1}` })),
        materials: selectedMaterials.map((material) => ({
          material,
          weightKg: Number(formData.materialWeight) / selectedMaterials.length,
          source: formData.materialSource,
        })),
        complexity: formData.complexity,
        experienceLevel: formData.experienceLevel,
        hoursWorked: 8,
      });
      router.push("/dashboard/artist/artworks");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not submit artwork.");
    }
  };

  return (
    <DashboardLayout role="artist" userName="Marie Uwimana">
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
                        src={image}
                        alt={`Artwork ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
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
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
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
