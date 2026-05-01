"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Recycle,
  Search,
  Plus,
  Edit3,
  Trash2,
  BarChart3,
  TrendingUp,
  Package,
  Scale,
  Calendar,
  Filter,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

// Mock material types data
const materialTypes = [
  {
    id: "1",
    name: "PET Bottles",
    description: "Polyethylene terephthalate plastic bottles",
    totalKgTracked: 485.5,
    artworksCount: 124,
    avgKgPerArtwork: 3.9,
    color: "#0EA5E9",
  },
  {
    id: "2",
    name: "Fabric Scraps",
    description: "Textile waste from garment industry",
    totalKgTracked: 312.8,
    artworksCount: 89,
    avgKgPerArtwork: 3.5,
    color: "#EC4899",
  },
  {
    id: "3",
    name: "Metal Cans",
    description: "Aluminum and tin cans",
    totalKgTracked: 198.2,
    artworksCount: 56,
    avgKgPerArtwork: 3.5,
    color: "#6B7280",
  },
  {
    id: "4",
    name: "Bottle Caps",
    description: "Plastic and metal bottle caps",
    totalKgTracked: 145.6,
    artworksCount: 78,
    avgKgPerArtwork: 1.9,
    color: "#F59E0B",
  },
  {
    id: "5",
    name: "Cardboard",
    description: "Corrugated cardboard and paper packaging",
    totalKgTracked: 234.1,
    artworksCount: 67,
    avgKgPerArtwork: 3.5,
    color: "#8B5CF6",
  },
  {
    id: "6",
    name: "Glass",
    description: "Recycled glass bottles and jars",
    totalKgTracked: 167.9,
    artworksCount: 42,
    avgKgPerArtwork: 4.0,
    color: "#10B981",
  },
  {
    id: "7",
    name: "Electronic Waste",
    description: "Components from electronic devices",
    totalKgTracked: 89.3,
    artworksCount: 23,
    avgKgPerArtwork: 3.9,
    color: "#EF4444",
  },
  {
    id: "8",
    name: "Plastic Bags",
    description: "Single-use plastic bags and packaging",
    totalKgTracked: 112.4,
    artworksCount: 45,
    avgKgPerArtwork: 2.5,
    color: "#3B82F6",
  },
];

// Mock recent material records
const recentRecords = [
  {
    id: "r1",
    artworkId: "a1",
    artworkTitle: "Ocean Waves",
    artist: "Marie Uwimana",
    materialType: "PET Bottles",
    weight: 2.5,
    verifiedAt: "2026-04-30",
    status: "verified",
  },
  {
    id: "r2",
    artworkId: "a2",
    artworkTitle: "Urban Dreams",
    artist: "Jean Baptiste",
    materialType: "Metal Cans",
    weight: 3.5,
    verifiedAt: "2026-04-29",
    status: "verified",
  },
  {
    id: "r3",
    artworkId: "a3",
    artworkTitle: "Sunset Reflections",
    artist: "Marie Uwimana",
    materialType: "Glass",
    weight: 2.0,
    verifiedAt: null,
    status: "pending",
  },
  {
    id: "r4",
    artworkId: "a4",
    artworkTitle: "Garden Dreams",
    artist: "Claudine Mukiza",
    materialType: "Cardboard",
    weight: 1.8,
    verifiedAt: "2026-04-28",
    status: "verified",
  },
  {
    id: "r5",
    artworkId: "a5",
    artworkTitle: "Cultural Heritage",
    artist: "Patrick Habimana",
    materialType: "Electronic Waste",
    weight: 4.2,
    verifiedAt: null,
    status: "pending",
  },
];

export default function AdminMaterialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"types" | "records">("types");

  const totalKgDiverted = materialTypes.reduce(
    (sum, m) => sum + m.totalKgTracked,
    0
  );
  const totalArtworks = new Set(recentRecords.map((r) => r.artworkId)).size;

  const filteredTypes = materialTypes.filter((type) =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecords = recentRecords.filter(
    (record) =>
      record.artworkTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.materialType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Material & Waste Records
            </h1>
            <p className="text-gray-500">
              Track and manage recycled materials across artworks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Material Type
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Recycle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {totalKgDiverted.toFixed(1)}
                </p>
                <p className="text-sm text-green-600">Total kg Diverted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {materialTypes.length}
                </p>
                <p className="text-sm text-gray-500">Material Types</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {materialTypes.reduce((sum, m) => sum + m.artworksCount, 0)}
                </p>
                <p className="text-sm text-gray-500">Total Records</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3.2</p>
                <p className="text-sm text-gray-500">Avg kg per Artwork</p>
              </div>
            </div>
          </div>
        </div>

        {/* Material Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Material Distribution
          </h2>
          <div className="h-8 bg-gray-100 rounded-full overflow-hidden flex">
            {materialTypes.map((material) => (
              <div
                key={material.id}
                style={{
                  width: `${(material.totalKgTracked / totalKgDiverted) * 100}%`,
                  backgroundColor: material.color,
                }}
                title={`${material.name}: ${material.totalKgTracked} kg (${(
                  (material.totalKgTracked / totalKgDiverted) *
                  100
                ).toFixed(1)}%)`}
                className="h-full transition-all hover:opacity-80"
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {materialTypes.slice(0, 6).map((material) => (
              <div key={material.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: material.color }}
                />
                <span className="text-sm text-gray-600">{material.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("types")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "types"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Material Types
            </button>
            <button
              onClick={() => setActiveTab("records")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "records"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Recent Records
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={
                  activeTab === "types"
                    ? "Search material types..."
                    : "Search records..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Material Types Tab */}
          {activeTab === "types" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">
                      Material Type
                    </th>
                    <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">
                      Total kg
                    </th>
                    <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">
                      Artworks
                    </th>
                    <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">
                      Avg kg/Artwork
                    </th>
                    <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">
                      Share
                    </th>
                    <th className="text-right text-sm font-medium text-gray-500 px-6 py-3 w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTypes.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: material.color }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {material.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {material.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {material.totalKgTracked.toFixed(1)}
                        </span>
                        <span className="text-gray-500 ml-1">kg</span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700">
                        {material.artworksCount}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700">
                        {material.avgKgPerArtwork.toFixed(1)} kg
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-gray-700">
                          {(
                            (material.totalKgTracked / totalKgDiverted) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Records Tab */}
          {activeTab === "records" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">
                      Artwork
                    </th>
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">
                      Artist
                    </th>
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">
                      Material
                    </th>
                    <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">
                      Weight
                    </th>
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">
                      Status
                    </th>
                    <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {record.artworkTitle}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {record.artist}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                          {record.materialType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900">
                          {record.weight}
                        </span>
                        <span className="text-gray-500 ml-1">kg</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            record.status === "verified"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {record.status === "verified"
                            ? "Verified"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {record.verifiedAt || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              {activeTab === "types"
                ? filteredTypes.length
                : filteredRecords.length}{" "}
              results
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium">
                1
              </span>
              <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-gray-900 mb-4">
              Add Material Type
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., PET Bottles"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of this material type..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color (for charts)
                </label>
                <input
                  type="color"
                  defaultValue="#14B8A6"
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                Add Material
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
