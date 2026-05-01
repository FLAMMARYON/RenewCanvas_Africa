"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Heart,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Palette,
  MoreVertical,
  ArrowUpDown,
  Recycle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock data
const artworks = [
  {
    id: "1",
    title: "Ocean Waves",
    price: 42000,
    status: "approved",
    views: 245,
    favourites: 18,
    createdAt: "2026-04-10",
    materials: ["PET bottles", "fabric scraps"],
    kgDiverted: 2.5,
    category: "Sculpture",
  },
  {
    id: "2",
    title: "Mountain Sunrise",
    price: 35000,
    status: "pending",
    views: 89,
    favourites: 5,
    createdAt: "2026-04-25",
    materials: ["bottle caps", "cardboard"],
    kgDiverted: 1.8,
    category: "Wall Art",
  },
  {
    id: "3",
    title: "City Lights",
    price: 55000,
    status: "approved",
    views: 312,
    favourites: 24,
    createdAt: "2026-04-05",
    materials: ["aluminium cans", "glass"],
    kgDiverted: 3.2,
    category: "Mixed Media",
  },
  {
    id: "4",
    title: "Garden Dreams",
    price: 28000,
    status: "rejected",
    views: 0,
    favourites: 0,
    createdAt: "2026-04-28",
    materials: ["plastic bags"],
    kgDiverted: 1.2,
    category: "Home Decor",
    rejectionReason: "Image quality needs improvement",
  },
  {
    id: "5",
    title: "African Heritage",
    price: 85000,
    status: "sold",
    views: 523,
    favourites: 67,
    createdAt: "2026-03-15",
    materials: ["fabric scraps", "metal cans", "beads"],
    kgDiverted: 4.5,
    category: "Sculpture",
  },
  {
    id: "6",
    title: "Sunset Reflections",
    price: 38000,
    status: "approved",
    views: 156,
    favourites: 12,
    createdAt: "2026-04-20",
    materials: ["glass", "PET bottles"],
    kgDiverted: 2.0,
    category: "Wall Art",
  },
];

const statusConfig = {
  pending: {
    label: "Pending",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: XCircle,
  },
  sold: {
    label: "Sold",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: ShoppingBag,
  },
};

export default function ArtistArtworksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);

  const filteredArtworks = artworks
    .filter((artwork) => {
      const matchesSearch = artwork.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || artwork.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-high":
          return b.price - a.price;
        case "price-low":
          return a.price - b.price;
        case "views":
          return b.views - a.views;
        default:
          return 0;
      }
    });

  const toggleSelectAll = () => {
    if (selectedArtworks.length === filteredArtworks.length) {
      setSelectedArtworks([]);
    } else {
      setSelectedArtworks(filteredArtworks.map((a) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedArtworks.includes(id)) {
      setSelectedArtworks(selectedArtworks.filter((i) => i !== id));
    } else {
      setSelectedArtworks([...selectedArtworks, id]);
    }
  };

  const stats = {
    total: artworks.length,
    approved: artworks.filter((a) => a.status === "approved").length,
    pending: artworks.filter((a) => a.status === "pending").length,
    sold: artworks.filter((a) => a.status === "sold").length,
  };

  return (
    <DashboardLayout role="artist" userName="Marie Uwimana">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Artworks</h1>
            <p className="text-gray-500">Manage your artwork listings</p>
          </div>
          <Link
            href="/dashboard/artist/artworks/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Create New Artwork
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Artworks</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-sm text-gray-500">Approved & Live</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending Review</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-purple-600">{stats.sold}</p>
            <p className="text-sm text-gray-500">Sold</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="sold">Sold</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedArtworks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedArtworks.length} selected
              </span>
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Artworks List */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedArtworks.length === filteredArtworks.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
            </div>
            <div className="col-span-4">Artwork</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Stats</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Artworks */}
          <div className="divide-y divide-gray-100">
            {filteredArtworks.map((artwork) => {
              const status =
                statusConfig[artwork.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;

              return (
                <div
                  key={artwork.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
                    {/* Checkbox */}
                    <div className="hidden lg:flex col-span-1 items-center">
                      <input
                        type="checkbox"
                        checked={selectedArtworks.includes(artwork.id)}
                        onChange={() => toggleSelect(artwork.id)}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </div>

                    {/* Artwork Info */}
                    <div className="col-span-4 flex items-center gap-4 mb-4 lg:mb-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Palette className="w-8 h-8 text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/dashboard/artist/artworks/${artwork.id}`}
                          className="font-medium text-gray-900 hover:text-teal-600 truncate block"
                        >
                          {artwork.title}
                        </Link>
                        <p className="text-sm text-gray-500">{artwork.category}</p>
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                          <Recycle className="w-3 h-3" />
                          {artwork.kgDiverted} kg diverted
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 mb-3 lg:mb-0">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                      {artwork.status === "rejected" && artwork.rejectionReason && (
                        <div className="mt-2 flex items-start gap-1 text-xs text-red-600 lg:hidden">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {artwork.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="col-span-2 mb-3 lg:mb-0">
                      <p className="font-semibold text-gray-900">
                        {artwork.price.toLocaleString()} RWF
                      </p>
                      <p className="text-xs text-gray-500">
                        Listed {artwork.createdAt}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="col-span-2 flex items-center gap-4 mb-3 lg:mb-0">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        {artwork.views}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Heart className="w-4 h-4" />
                        {artwork.favourites}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center gap-2">
                      <Link
                        href={`/dashboard/artist/artworks/${artwork.id}`}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/artwork/${artwork.id}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rejection Reason - Desktop */}
                  {artwork.status === "rejected" && artwork.rejectionReason && (
                    <div className="hidden lg:flex mt-3 ml-20 p-3 bg-red-50 rounded-lg text-sm text-red-600 items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Rejection Reason:</span>{" "}
                        {artwork.rejectionReason}
                        <Link
                          href={`/dashboard/artist/artworks/${artwork.id}`}
                          className="ml-2 text-red-700 underline hover:no-underline"
                        >
                          Edit & Resubmit
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredArtworks.length === 0 && (
            <div className="p-12 text-center">
              <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-1">No artworks found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Start by creating your first artwork"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Link
                  href="/dashboard/artist/artworks/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Artwork
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
