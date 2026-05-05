"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import {
  Gavel,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  DollarSign,
  Flame,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  X,
  ChevronDown,
} from "lucide-react";

// Mock artworks available for auction
const availableArtworks = [
  {
    id: "ART-001",
    title: "Ocean Symphony",
    artist: "Marie Uwimana",
    artistId: "artist-1",
    image: "/images/artworks/ocean.jpg",
    listedPrice: 85000,
    category: "Painting",
    materials: ["PET Bottles", "Acrylic"],
    status: "available",
  },
  {
    id: "ART-002",
    title: "Urban Dreams",
    artist: "Jean Baptiste",
    artistId: "artist-2",
    image: "/images/artworks/urban.jpg",
    listedPrice: 120000,
    category: "Sculpture",
    materials: ["Metal Scraps", "Wire"],
    status: "available",
  },
  {
    id: "ART-003",
    title: "Nature's Embrace",
    artist: "Claudine Mukiza",
    artistId: "artist-3",
    image: "/images/artworks/nature.jpg",
    listedPrice: 65000,
    category: "Wall Art",
    materials: ["Bottle Caps", "Canvas"],
    status: "available",
  },
  {
    id: "ART-004",
    title: "Cultural Heritage",
    artist: "Patrick Habimana",
    artistId: "artist-4",
    image: "/images/artworks/heritage.jpg",
    listedPrice: 95000,
    category: "Mixed Media",
    materials: ["Fabric Scraps", "Wood"],
    status: "available",
  },
  {
    id: "ART-005",
    title: "Sunset Reflections",
    artist: "Grace Nyiraneza",
    artistId: "artist-5",
    image: "/images/artworks/sunset.jpg",
    listedPrice: 78000,
    category: "Painting",
    materials: ["Recycled Paper", "Natural Dyes"],
    status: "available",
  },
];

const initialAuctions = [
  {
    id: "AUC-001",
    artworkId: "ART-010",
    title: "Kigali Nights",
    artist: "Emmanuel Mugabo",
    image: "/images/artworks/kigali.jpg",
    minimumPrice: 150000,
    currentBid: 185000,
    startingBid: 150000,
    bidCount: 12,
    watcherCount: 45,
    status: "live",
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    featured: true,
  },
  {
    id: "AUC-002",
    artworkId: "ART-011",
    title: "Lake Kivu Sunrise",
    artist: "Diane Uwase",
    image: "/images/artworks/kivu.jpg",
    minimumPrice: 95000,
    currentBid: 110000,
    startingBid: 95000,
    bidCount: 8,
    watcherCount: 32,
    status: "live",
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    featured: false,
  },
  {
    id: "AUC-003",
    artworkId: "ART-012",
    title: "Rwandan Spirit",
    artist: "Pascal Niyonzima",
    image: "/images/artworks/spirit.jpg",
    minimumPrice: 200000,
    currentBid: null,
    startingBid: 200000,
    bidCount: 0,
    watcherCount: 18,
    status: "scheduled",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    featured: true,
  },
  {
    id: "AUC-004",
    artworkId: "ART-013",
    title: "Market Day",
    artist: "Josiane Mukamana",
    image: "/images/artworks/market.jpg",
    minimumPrice: 75000,
    currentBid: 92000,
    startingBid: 75000,
    bidCount: 15,
    watcherCount: 67,
    status: "ended",
    startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    featured: false,
    winner: "John Doe",
    finalPrice: 92000,
  },
  {
    id: "AUC-005",
    artworkId: "ART-014",
    title: "Virunga Mountains",
    artist: "Claude Habimana",
    image: "/images/artworks/virunga.jpg",
    minimumPrice: 180000,
    currentBid: 245000,
    startingBid: 180000,
    bidCount: 22,
    watcherCount: 89,
    status: "ended",
    startTime: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    featured: true,
    winner: "Sarah Mitchell",
    finalPrice: 245000,
  },
];

const statusConfig = {
  live: {
    label: "Live",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: Flame,
  },
  scheduled: {
    label: "Scheduled",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Calendar,
  },
  ended: {
    label: "Ended",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: XCircle,
  },
};

export default function AdminAuctionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);
  const [auctionDuration, setAuctionDuration] = useState("24");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [featuredAuction, setFeaturedAuction] = useState(false);
  const [auctions, setAuctions] = useState(initialAuctions);

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch =
      auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auction.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || auction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    live: auctions.filter((a) => a.status === "live").length,
    scheduled: auctions.filter((a) => a.status === "scheduled").length,
    ended: auctions.filter((a) => a.status === "ended").length,
    totalRevenue: auctions
      .filter((a) => a.status === "ended" && a.finalPrice)
      .reduce((sum, a) => sum + (a.finalPrice || 0), 0),
  };

  const getTimeRemaining = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const getSelectedArtworkDetails = () => {
    return availableArtworks.find((a) => a.id === selectedArtwork);
  };

  const handleCreateAuction = () => {
    const artwork = getSelectedArtworkDetails();
    if (!artwork) return;

    const start = startDate && startTime
      ? new Date(`${startDate}T${startTime}`).toISOString()
      : new Date().toISOString();
    const end = new Date(
      new Date(start).getTime() + Number(auctionDuration) * 60 * 60 * 1000
    ).toISOString();

    setAuctions((current) => [
      {
        id: `AUC-${String(current.length + 1).padStart(3, "0")}`,
        artworkId: artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        image: artwork.image,
        minimumPrice: artwork.listedPrice,
        currentBid: null,
        startingBid: artwork.listedPrice,
        bidCount: 0,
        watcherCount: 0,
        status: new Date(start).getTime() > Date.now() ? "scheduled" : "live",
        startTime: start,
        endTime: end,
        featured: featuredAuction,
      },
      ...current,
    ]);

    setShowCreateModal(false);
    setSelectedArtwork(null);
    setAuctionDuration("24");
    setStartDate("");
    setStartTime("");
    setFeaturedAuction(false);
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Auction Management
            </h1>
            <p className="text-gray-500">
              Create and manage live auctions for artworks
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Auction
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Live Auctions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.live}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Scheduled</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-sm text-gray-500">Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.ended}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-sm text-gray-500">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalRevenue.toLocaleString()}{" "}
              <span className="text-sm font-normal text-gray-500">RWF</span>
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="live">Live</option>
                <option value="scheduled">Scheduled</option>
                <option value="ended">Ended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Auctions Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Artwork
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Min Price
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Current Bid
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bids
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAuctions.map((auction) => {
                  const status = statusConfig[auction.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  return (
                    <tr
                      key={auction.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-6 h-6 text-teal-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {auction.title}
                              </p>
                              {auction.featured && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                  Featured
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              by {auction.artist}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {auction.minimumPrice.toLocaleString()} RWF
                        </p>
                        <p className="text-xs text-gray-500">Artist's price</p>
                      </td>
                      <td className="px-6 py-4">
                        {auction.currentBid ? (
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-green-600">
                              {auction.currentBid.toLocaleString()} RWF
                            </p>
                            <ArrowUp className="w-4 h-4 text-green-500" />
                          </div>
                        ) : (
                          <p className="text-gray-400">No bids yet</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Gavel className="w-4 h-4" />
                            {auction.bidCount}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Eye className="w-4 h-4" />
                            {auction.watcherCount}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {auction.status === "live" && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-600">
                              {getTimeRemaining(auction.endTime)}
                            </span>
                          </div>
                        )}
                        {auction.status === "scheduled" && (
                          <div className="text-sm text-gray-500">
                            Starts in {getTimeRemaining(auction.startTime)}
                          </div>
                        )}
                        {auction.status === "ended" && auction.winner && (
                          <div className="text-sm">
                            <p className="text-gray-500">Winner:</p>
                            <p className="font-medium text-gray-900">
                              {auction.winner}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          {auction.status !== "ended" && (
                            <>
                              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAuctions.length === 0 && (
            <div className="text-center py-12">
              <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No auctions found</p>
            </div>
          )}
        </div>

        {/* Create Auction Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Create New Auction
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Select Artwork */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Artwork for Auction
                  </label>
                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {availableArtworks.map((artwork) => (
                      <div
                        key={artwork.id}
                        onClick={() => setSelectedArtwork(artwork.id)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${
                          selectedArtwork === artwork.id
                            ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500"
                            : "border-gray-200 hover:border-teal-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-8 h-8 text-teal-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {artwork.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              by {artwork.artist}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {artwork.category}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {artwork.listedPrice.toLocaleString()} RWF
                            </p>
                            <p className="text-xs text-gray-500">
                              Artist's price
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minimum Price Info */}
                {selectedArtwork && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">
                          Minimum Auction Price
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                          The minimum starting price for this auction is{" "}
                          <strong>
                            {getSelectedArtworkDetails()?.listedPrice.toLocaleString()}{" "}
                            RWF
                          </strong>
                          , which is the price set by the artist. The auction
                          cannot start below this amount.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auction Settings */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auction Duration
                    </label>
                    <select
                      value={auctionDuration}
                      onChange={(e) => setAuctionDuration(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                    >
                      <option value="6">6 hours</option>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours</option>
                      <option value="48">48 hours</option>
                      <option value="72">72 hours (3 days)</option>
                      <option value="168">168 hours (7 days)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featuredAuction}
                        onChange={(e) => setFeaturedAuction(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          Featured Auction
                        </p>
                        <p className="text-xs text-gray-500">
                          Highlight on the auctions page
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAuction}
                  disabled={!selectedArtwork || !startDate || !startTime}
                  className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Auction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
