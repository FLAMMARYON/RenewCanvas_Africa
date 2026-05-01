"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  ArrowLeft,
  Save,
  Trash2,
  Image as ImageIcon,
  Plus,
  X,
  Recycle,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Heart,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";

// Mock artwork data - will come from API
const mockArtwork = {
  id: "1",
  title: "Ocean Waves",
  description:
    "A beautiful sculpture representing the power and serenity of ocean waves, created entirely from recycled PET bottles collected from Kigali's streets. Each wave is hand-crafted to capture the dynamic movement of water.",
  category: "sculpture",
  price: 42000,
  dimensions: "45cm x 30cm x 20cm",
  weight: 2.5,
  status: "approved",
  views: 245,
  favourites: 18,
  createdAt: "2026-04-10",
  images: [
    { id: "1", url: "/placeholder1.jpg", isPrimary: true },
    { id: "2", url: "/placeholder2.jpg", isPrimary: false },
    { id: "3", url: "/placeholder3.jpg", isPrimary: false },
  ],
  materials: [
    { type: "PET Bottles", weight: 1.5 },
    { type: "Fabric Scraps", weight: 1.0 },
  ],
  totalKgDiverted: 2.5,
};

const categories = [
  { value: "sculpture", label: "Sculpture" },
  { value: "wall-art", label: "Wall Art" },
  { value: "jewelry", label: "Jewelry" },
  { value: "home-decor", label: "Home Decor" },
  { value: "fashion", label: "Fashion & Accessories" },
  { value: "functional", label: "Functional Art" },
  { value: "mixed-media", label: "Mixed Media" },
];

const materialTypes = [
  "PET Bottles",
  "Fabric Scraps",
  "Metal Cans",
  "Bottle Caps",
  "Cardboard",
  "Glass",
  "Electronic Waste",
  "Plastic Bags",
  "Paper",
  "Rubber/Tires",
  "Wood Scraps",
  "Other",
];

const statusConfig = {
  pending: {
    label: "Pending Review",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: Clock,
  },
  approved: {
    label: "Approved & Live",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: XCircle,
  },
  sold: {
    label: "Sold",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: Package,
  },
};

export default function EditArtworkPage() {
  const params = useParams();
  const [artwork, setArtwork] = useState(mockArtwork);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const status = statusConfig[artwork.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  const handleInputChange = (field: string, value: string | number) => {
    setArtwork((prev) => ({ ...prev, [field]: value }));
  };

  const handleMaterialChange = (index: number, field: string, value: string | number) => {
    setArtwork((prev) => ({
      ...prev,
      materials: prev.materials.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };

  const addMaterial = () => {
    setArtwork((prev) => ({
      ...prev,
      materials: [...prev.materials, { type: "", weight: 0 }],
    }));
  };

  const removeMaterial = (index: number) => {
    setArtwork((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDelete = async () => {
    // Would call API to delete
    setShowDeleteModal(false);
    // Redirect to artworks list
  };

  const totalWeight = artwork.materials.reduce((sum, m) => sum + m.weight, 0);

  return (
    <DashboardLayout role="artist" userName="Marie Uwimana">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/artist/artworks"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Artwork</h1>
              <p className="text-gray-500">Update your artwork listing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div
          className={`p-4 rounded-xl border ${status.bgColor} ${status.borderColor}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-5 h-5 ${status.color}`} />
              <span className={`font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {artwork.views} views
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {artwork.favourites} favourites
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Artwork Title *
                  </label>
                  <input
                    type="text"
                    value={artwork.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={artwork.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {artwork.description.length}/1000 characters
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={artwork.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={artwork.dimensions}
                      onChange={(e) =>
                        handleInputChange("dimensions", e.target.value)
                      }
                      placeholder="e.g., 45cm x 30cm x 20cm"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Artwork Images
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {artwork.images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative aspect-square bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg overflow-hidden group ${
                      image.isPrimary ? "ring-2 ring-teal-500" : ""
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-teal-300" />
                    </div>
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-teal-600 text-white text-xs rounded font-medium">
                        Primary
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!image.isPrimary && (
                        <button className="px-3 py-1.5 bg-white text-gray-700 text-sm rounded hover:bg-gray-100">
                          Set Primary
                        </button>
                      )}
                      <button className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {artwork.images.length < 5 && (
                  <button className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-teal-500 hover:text-teal-500 transition-colors">
                    <Plus className="w-8 h-8 mb-1" />
                    <span className="text-sm">Add</span>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Upload up to 5 high-quality images. First image will be the
                primary display image.
              </p>
            </div>

            {/* Materials */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Recycle className="w-5 h-5 text-green-600" />
                    Recycled Materials
                  </h2>
                  <p className="text-sm text-gray-500">
                    Document the materials used in this artwork
                  </p>
                </div>
                <button
                  onClick={addMaterial}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Material
                </button>
              </div>
              <div className="space-y-3">
                {artwork.materials.map((material, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Material Type
                      </label>
                      <select
                        value={material.type}
                        onChange={(e) =>
                          handleMaterialChange(index, "type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                      >
                        <option value="">Select material...</option>
                        {materialTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={material.weight}
                        onChange={(e) =>
                          handleMaterialChange(
                            index,
                            "weight",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <button
                      onClick={() => removeMaterial(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-700">
                    Total Waste Diverted
                  </span>
                  <span className="text-lg font-bold text-green-700">
                    {totalWeight.toFixed(1)} kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Pricing</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (RWF) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={artwork.price}
                    onChange={(e) =>
                      handleInputChange("price", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    RWF
                  </span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 text-purple-700 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">AI Suggested: 38,000 - 46,000 RWF</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Your earnings (80%)</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(artwork.price * 0.8).toLocaleString()} RWF
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Platform fee (20%)</span>
                  <span className="text-gray-600">
                    {Math.round(artwork.price * 0.2).toLocaleString()} RWF
                  </span>
                </div>
              </div>
            </div>

            {/* Artwork Stats */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Artwork Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>Total Views</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {artwork.views}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Heart className="w-4 h-4" />
                    <span>Favourites</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {artwork.favourites}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Listed</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {artwork.createdAt}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-teal-50 to-amber-50 rounded-xl p-6 border border-teal-100">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/artwork/${artwork.id}`}
                  target="_blank"
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View Public Listing
                </Link>
                <Link
                  href="/dashboard/artist/artworks/create"
                  className="flex items-center gap-2 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create New Artwork
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Artwork?</h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{artwork.title}&quot;? This will
              permanently remove the listing and all associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Artwork
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
