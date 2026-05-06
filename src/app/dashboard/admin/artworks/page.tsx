"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Palette,
  Recycle,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  User,
  Image as ImageIcon,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const initialArtworks = [
  {
    id: "1",
    title: "Sunset Reflections",
    ownerType: "artist",
    artist: {
      id: "a1",
      name: "Marie Uwimana",
      verified: true,
    },
    category: "Wall Art",
    price: 38000,
    status: "pending",
    materials: ["Glass", "PET Bottles"],
    kgDiverted: 2.0,
    submittedAt: "2026-04-30T10:30:00",
    description:
      "A stunning wall piece capturing the essence of sunset over Lake Kivu, crafted from recycled glass bottles.",
    dimensions: "60cm x 40cm",
    images: 4,
  },
  {
    id: "2",
    title: "Urban Dreams",
    ownerType: "artist",
    artist: {
      id: "a2",
      name: "Jean Baptiste",
      verified: false,
    },
    category: "Sculpture",
    price: 55000,
    status: "pending",
    materials: ["Metal Cans", "Bottle Caps"],
    kgDiverted: 3.5,
    submittedAt: "2026-04-30T08:15:00",
    description:
      "A modern sculpture representing the dreams of urban youth, made entirely from recycled metal.",
    dimensions: "45cm x 30cm x 25cm",
    images: 3,
  },
  {
    id: "3",
    title: "Nature's Embrace",
    ownerType: "artist",
    artist: {
      id: "a3",
      name: "Claudine Mukiza",
      verified: true,
    },
    category: "Mixed Media",
    price: 42000,
    status: "approved",
    materials: ["Fabric Scraps", "Paper"],
    kgDiverted: 1.8,
    submittedAt: "2026-04-28T14:00:00",
    reviewedAt: "2026-04-29T09:00:00",
    description:
      "A beautiful tapestry showing the harmony between humanity and nature.",
    dimensions: "80cm x 100cm",
    images: 5,
  },
  {
    id: "4",
    title: "Cultural Heritage",
    ownerType: "artist",
    artist: {
      id: "a4",
      name: "Patrick Habimana",
      verified: true,
    },
    category: "Sculpture",
    price: 85000,
    status: "rejected",
    materials: ["Electronic Waste", "Metal"],
    kgDiverted: 4.2,
    submittedAt: "2026-04-27T11:30:00",
    reviewedAt: "2026-04-28T16:00:00",
    rejectionReason:
      "Images are too dark and do not clearly show the artwork details. Please resubmit with better lighting.",
    description:
      "A tribute to Rwandan cultural heritage, incorporating traditional motifs.",
    dimensions: "50cm x 40cm x 35cm",
    images: 2,
  },
  {
    id: "5",
    title: "Ocean Symphony",
    ownerType: "artist",
    artist: {
      id: "a1",
      name: "Marie Uwimana",
      verified: true,
    },
    category: "Wall Art",
    price: 48000,
    status: "pending",
    materials: ["PET Bottles", "Fabric Scraps"],
    kgDiverted: 2.5,
    submittedAt: "2026-04-29T16:45:00",
    description:
      "Waves of recycled plastic bottles create a mesmerizing ocean scene.",
    dimensions: "70cm x 50cm",
    images: 4,
  },
  {
    id: "6",
    title: "Garden of Hope",
    ownerType: "artist",
    artist: {
      id: "a5",
      name: "Grace Ingabire",
      verified: false,
    },
    category: "Home Decor",
    price: 28000,
    status: "pending",
    materials: ["Cardboard", "Paper"],
    kgDiverted: 1.2,
    submittedAt: "2026-04-30T07:00:00",
    description:
      "Decorative flowers made from recycled cardboard and paper, bringing nature indoors.",
    dimensions: "30cm x 20cm x 15cm",
    images: 3,
  },
  {
    id: "7",
    title: "RenewCanvas Studio Panel",
    ownerType: "renewcanvas",
    artist: {
      id: "renewcanvas",
      name: "RenewCanvas Africa",
      verified: true,
    },
    category: "Wall Art",
    price: 62000,
    status: "approved",
    materials: ["PET Bottles", "Cardboard"],
    kgDiverted: 3.1,
    submittedAt: "2026-04-26T12:00:00",
    reviewedAt: "2026-04-26T14:00:00",
    description:
      "Platform-owned artwork created from RenewCanvas studio inventory and community collection materials.",
    dimensions: "75cm x 55cm",
    images: 4,
  },
];

const statusConfig = {
  pending: {
    label: "Pending Review",
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
};

export default function AdminArtworksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedArtwork, setExpandedArtwork] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [artworks, setArtworks] = useState(initialArtworks);

  const filteredArtworks = artworks.filter((artwork) => {
    const matchesSearch =
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || artwork.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || artwork.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: artworks.length,
    renewcanvasOwned: artworks.filter((a) => a.ownerType === "renewcanvas").length,
    pending: artworks.filter((a) => a.status === "pending").length,
    approved: artworks.filter((a) => a.status === "approved").length,
    rejected: artworks.filter((a) => a.status === "rejected").length,
  };

  const categories = [...new Set(artworks.map((a) => a.category))];

  const toggleExpand = (id: string) => {
    setExpandedArtwork(expandedArtwork === id ? null : id);
  };

  const handleApprove = (artworkId: string) => {
    setArtworks((current) =>
      current.map((artwork) =>
        artwork.id === artworkId
          ? {
              ...artwork,
              status: "approved",
              reviewedAt: new Date().toISOString(),
              rejectionReason: undefined,
            }
          : artwork
      )
    );
  };

  const handleReject = (artworkId: string) => {
    setArtworks((current) =>
      current.map((artwork) =>
        artwork.id === artworkId
          ? {
              ...artwork,
              status: "rejected",
              reviewedAt: new Date().toISOString(),
              rejectionReason: rejectionReason.trim() || "Artwork requires clearer documentation.",
            }
          : artwork
      )
    );
    setShowRejectModal(null);
    setRejectionReason("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artwork Moderation</h1>
          <p className="text-gray-500">
            Review artist submissions and manage RenewCanvas-owned inventory
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Artworks</p>
                <p className="text-xs text-gray-400">
                  {stats.renewcanvasOwned} RenewCanvas-owned
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.pending}
                </p>
                <p className="text-sm text-gray-500">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.approved}
                </p>
                <p className="text-sm text-gray-500">Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </p>
                <p className="text-sm text-gray-500">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search artworks or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Artworks List */}
        <div className="space-y-4">
          {filteredArtworks.map((artwork) => {
            const status =
              statusConfig[artwork.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            const isExpanded = expandedArtwork === artwork.id;

            return (
              <div
                key={artwork.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                {/* Artwork Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(artwork.id)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Palette className="w-8 h-8 text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {artwork.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {artwork.artist.name}
                            {artwork.artist.verified && (
                              <CheckCircle className="w-3 h-3 text-blue-500" />
                            )}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              artwork.ownerType === "renewcanvas"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {artwork.ownerType === "renewcanvas"
                              ? "RenewCanvas-owned"
                              : "Artist consignment"}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {artwork.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {artwork.images} images
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {artwork.price.toLocaleString()} RWF
                        </p>
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <Recycle className="w-3 h-3" />
                          {artwork.kgDiverted} kg
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {formatDate(artwork.submittedAt)}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Artwork Info */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Description
                          </h4>
                          <p className="text-sm text-gray-600">
                            {artwork.description}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Details
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 bg-white rounded-lg border border-gray-100">
                              <p className="text-gray-500">Dimensions</p>
                              <p className="font-medium text-gray-900">
                                {artwork.dimensions}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-gray-100">
                              <p className="text-gray-500">Price</p>
                              <p className="font-medium text-gray-900">
                                {artwork.price.toLocaleString()} RWF
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-gray-100">
                              <p className="text-gray-500">Category</p>
                              <p className="font-medium text-gray-900">
                                {artwork.category}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-gray-100">
                              <p className="text-gray-500">Ownership</p>
                              <p className="font-medium text-gray-900">
                                {artwork.ownerType === "renewcanvas"
                                  ? "100% RenewCanvas"
                                  : "Artist payout applies"}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg border border-gray-100">
                              <p className="text-gray-500">Impact</p>
                              <p className="font-medium text-green-600">
                                {artwork.kgDiverted} kg diverted
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Materials Used
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {artwork.materials.map((material) => (
                              <span
                                key={material}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                              >
                                {material}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Images Preview & Actions */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Images Preview
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {[...Array(Math.min(artwork.images, 6))].map(
                              (_, i) => (
                                <div
                                  key={i}
                                  className="aspect-square bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center"
                                >
                                  <ImageIcon className="w-6 h-6 text-teal-300" />
                                </div>
                              )
                            )}
                          </div>
                          <button className="mt-2 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                            View All Images
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>

                        {artwork.status === "rejected" &&
                          artwork.rejectionReason && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                <div>
                                  <p className="font-medium text-red-700">
                                    Rejection Reason
                                  </p>
                                  <p className="text-sm text-red-600 mt-1">
                                    {artwork.rejectionReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {artwork.status === "pending" && (
                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => handleApprove(artwork.id)}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => setShowRejectModal(artwork.id)}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}

                        {artwork.status === "approved" && (
                          <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <div>
                                <p className="font-medium text-green-700">
                                  Approved
                                </p>
                                <p className="text-sm text-green-600">
                                  This artwork is live on the marketplace
                                </p>
                              </div>
                            </div>
                            <Link
                              href={`/artwork/${artwork.id}`}
                              target="_blank"
                              className="mt-3 inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                              View on Marketplace
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {filteredArtworks.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-1">
                No artworks found
              </h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No artwork submissions at this time"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-gray-900 mb-2">Reject Artwork</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting this artwork. This will help
              the artist improve their submission.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason (e.g., poor image quality, unclear material documentation, pricing concerns)..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                Reject Artwork
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
