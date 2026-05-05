"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Heart,
  Trash2,
  ShoppingCart,
  Eye,
  Recycle,
  Palette,
  Filter,
  Search,
  Grid,
  List,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { markWishlistItemRemoved, readRemovedWishlistIds } from "@/lib/frontend/local-store";

const initialSavedArtworks = [
  {
    id: "1",
    title: "Ocean Waves",
    artist: "Patrick Habimana",
    artistId: "artist-1",
    price: 42000,
    materials: ["PET bottles", "fabric scraps"],
    kgDiverted: 2.5,
    category: "Wall Art",
    status: "available",
    savedAt: "2026-04-15",
    image: null,
  },
  {
    id: "2",
    title: "Mountain Sunrise",
    artist: "Alice Ingabire",
    artistId: "artist-2",
    price: 35000,
    materials: ["bottle caps", "cardboard"],
    kgDiverted: 1.8,
    category: "Sculpture",
    status: "available",
    savedAt: "2026-04-18",
    image: null,
  },
  {
    id: "3",
    title: "City Lights",
    artist: "Emmanuel Ndayisaba",
    artistId: "artist-3",
    price: 55000,
    materials: ["aluminium cans", "glass"],
    kgDiverted: 3.2,
    category: "Wall Art",
    status: "sold",
    savedAt: "2026-04-20",
    image: null,
  },
  {
    id: "4",
    title: "Garden Dreams",
    artist: "Marie Uwimana",
    artistId: "artist-4",
    price: 28000,
    materials: ["plastic bags", "fabric scraps"],
    kgDiverted: 1.2,
    category: "Home Decor",
    status: "available",
    savedAt: "2026-04-22",
    image: null,
  },
  {
    id: "5",
    title: "Abstract Flow",
    artist: "Jean Baptiste",
    artistId: "artist-5",
    price: 48000,
    materials: ["PET bottles", "bottle caps"],
    kgDiverted: 2.8,
    category: "Wall Art",
    status: "available",
    savedAt: "2026-04-25",
    image: null,
  },
];

export default function WishlistPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [savedArtworks, setSavedArtworks] = useState(() => {
    const removed = readRemovedWishlistIds();
    return initialSavedArtworks.filter((artwork) => !removed.has(artwork.id));
  });

  const filteredArtworks = savedArtworks.filter(
    (artwork) =>
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableArtworks = filteredArtworks.filter(
    (a) => a.status === "available"
  );
  const totalValue = availableArtworks.reduce((sum, a) => sum + a.price, 0);

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const removeFromWishlist = (id: string) => {
    markWishlistItemRemoved(id);
    setSavedArtworks((current) => current.filter((artwork) => artwork.id !== id));
    setSelectedItems((current) => current.filter((itemId) => itemId !== id));
  };

  return (
    <DashboardLayout role="buyer" userName="John Doe">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500">
              {savedArtworks.length} artworks saved
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedItems.length > 0 && (
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm">
                <ShoppingCart className="w-4 h-4" />
                Add {selectedItems.length} to Cart
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {savedArtworks.length}
                </p>
                <p className="text-xs text-gray-500">Total Saved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {availableArtworks.length}
                </p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                <Recycle className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {availableArtworks
                    .reduce((sum, a) => sum + a.kgDiverted, 0)
                    .toFixed(1)}{" "}
                  kg
                </p>
                <p className="text-xs text-gray-500">Potential Impact</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Total Value (RWF)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search saved artworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-teal-50 text-teal-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-teal-50 text-teal-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Artworks Grid/List */}
        {filteredArtworks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No saved artworks found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Start exploring and save artworks you love"}
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Browse Marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtworks.map((artwork) => (
              <div
                key={artwork.id}
                className={`bg-white rounded-xl border overflow-hidden group transition-all ${
                  artwork.status === "sold"
                    ? "border-gray-200 opacity-75"
                    : "border-gray-100 hover:border-teal-200 hover:shadow-lg"
                }`}
              >
                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-teal-50 to-amber-50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Palette className="w-12 h-12 text-teal-300" />
                  </div>
                  {artwork.status === "sold" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="px-3 py-1 bg-gray-900 text-white text-sm font-medium rounded">
                        Sold
                      </span>
                    </div>
                  )}
                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeFromWishlist(artwork.id)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    <Link
                      href={`/artwork/${artwork.id}`}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-teal-50 transition-colors"
                      title="View artwork"
                    >
                      <Eye className="w-4 h-4 text-teal-600" />
                    </Link>
                  </div>
                  {/* Select checkbox */}
                  {artwork.status === "available" && (
                    <div className="absolute top-3 left-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(artwork.id)}
                        onChange={() => toggleSelectItem(artwork.id)}
                        className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate mb-1">
                    {artwork.title}
                  </h3>
                  <Link
                    href={`/artists/${artwork.artistId}`}
                    className="text-sm text-gray-500 hover:text-teal-600"
                  >
                    by {artwork.artist}
                  </Link>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {artwork.materials.slice(0, 2).map((material) => (
                      <span
                        key={material}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <p className="font-semibold text-gray-900">
                      {artwork.price.toLocaleString()} RWF
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <Recycle className="w-3 h-3" />
                      {artwork.kgDiverted} kg
                    </span>
                  </div>
                  {artwork.status === "available" && (
                    <Link
                      href={`/checkout?artwork=${artwork.id}`}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Purchase
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {filteredArtworks.map((artwork) => (
              <div
                key={artwork.id}
                className={`p-4 flex items-center gap-4 ${
                  artwork.status === "sold"
                    ? "opacity-75"
                    : "hover:bg-gray-50"
                } transition-colors`}
              >
                {artwork.status === "available" && (
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(artwork.id)}
                    onChange={() => toggleSelectItem(artwork.id)}
                    className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                )}
                <div className="w-20 h-20 bg-gradient-to-br from-teal-50 to-amber-50 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                  <Palette className="w-8 h-8 text-teal-300" />
                  {artwork.status === "sold" && (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                      <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-medium rounded">
                        Sold
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {artwork.title}
                  </h3>
                  <p className="text-sm text-gray-500">by {artwork.artist}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {artwork.materials.map((material) => (
                      <span
                        key={material}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {artwork.price.toLocaleString()} RWF
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <Recycle className="w-3 h-3" />
                    {artwork.kgDiverted} kg diverted
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/artwork/${artwork.id}`}
                    className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(artwork.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {artwork.status === "available" && (
                    <Link
                      href={`/checkout?artwork=${artwork.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
